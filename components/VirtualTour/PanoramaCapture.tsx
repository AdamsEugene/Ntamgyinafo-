import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  ActivityIndicator,
  Vibration,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Magnetometer, Accelerometer } from "expo-sensors";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Spacing } from "@/constants/design";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ============================================================================
// TELEPORT-STYLE 360° CAPTURE CONFIGURATION
// ============================================================================
// Total: 51 photos across 7 pitch levels for full spherical coverage
// Reference: https://www.hdreye.app/teleport360

interface CaptureRow {
  pitch: number; // Degrees from horizon (-90 to +90)
  segments: number; // Number of photos in this row
  angleStep: number; // Degrees between photos
}

const CAPTURE_GRID: CaptureRow[] = [
  { pitch: 90, segments: 1, angleStep: 360 }, // Zenith (looking up)
  { pitch: 60, segments: 8, angleStep: 45 }, // High row
  { pitch: 30, segments: 12, angleStep: 30 }, // Upper row
  { pitch: 0, segments: 16, angleStep: 22.5 }, // Horizon row
  { pitch: -30, segments: 12, angleStep: 30 }, // Lower row
  { pitch: -60, segments: 8, angleStep: 45 }, // Low row
  { pitch: -90, segments: 1, angleStep: 360 }, // Nadir (looking down)
];

// Calculate total segments
const TOTAL_PHOTOS = CAPTURE_GRID.reduce((sum, row) => sum + row.segments, 0); // 58 photos

// Tolerance for "on target" detection
const YAW_TOLERANCE = 10; // degrees for horizontal alignment
const PITCH_TOLERANCE = 12; // degrees for vertical alignment

// ============================================================================
// INTERFACES
// ============================================================================

interface CapturedPhoto {
  uri: string;
  yaw: number;
  pitch: number;
  rowIndex: number;
  segmentIndex: number;
}

interface CaptureTarget {
  rowIndex: number;
  segmentIndex: number;
  targetYaw: number;
  targetPitch: number;
}

export interface PanoramaCaptureProps {
  onComplete: (photos: CapturedPhoto[]) => void;
  onCancel: () => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Normalize angle to 0-360 range
const normalizeAngle = (angle: number): number => {
  let normalized = angle % 360;
  if (normalized < 0) normalized += 360;
  return normalized;
};

// Signed angle difference (for direction hints)
const signedAngleDifference = (current: number, target: number): number => {
  let diff = normalizeAngle(target) - normalizeAngle(current);
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff;
};

// Absolute angle difference
const angleDifference = (a: number, b: number): number => {
  return Math.abs(signedAngleDifference(a, b));
};

// Generate all capture targets
const generateCaptureTargets = (startYaw: number): CaptureTarget[] => {
  const targets: CaptureTarget[] = [];

  CAPTURE_GRID.forEach((row, rowIndex) => {
    for (let i = 0; i < row.segments; i++) {
      targets.push({
        rowIndex,
        segmentIndex: i,
        targetYaw: normalizeAngle(startYaw + i * row.angleStep),
        targetPitch: row.pitch,
      });
    }
  });

  return targets;
};

// Get pitch from accelerometer (phone held upright, camera facing forward)
const getPitchFromAccelerometer = (x: number, y: number, z: number): number => {
  // When phone is upright (portrait mode):
  // - y ≈ -1 when looking straight ahead (pitch = 0°)
  // - y ≈ 0, z ≈ +1 when looking up/tilting back (pitch = +90°)
  // - y ≈ 0, z ≈ -1 when looking down/tilting forward (pitch = -90°)
  // Using atan2(z, -y) to get correct orientation
  const pitch = Math.atan2(z, -y) * (180 / Math.PI);
  return pitch;
};

// ============================================================================
// COMPONENT
// ============================================================================

export function PanoramaCapture({
  onComplete,
  onCancel,
}: PanoramaCaptureProps) {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);

  // Camera permissions
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraReady, setIsCameraReady] = useState(false);

  // Capture state
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Sensor state
  const [currentYaw, setCurrentYaw] = useState(0);
  const [currentPitch, setCurrentPitch] = useState(0);
  const [startYaw, setStartYaw] = useState<number | null>(null);
  const [isRollLevel, setIsRollLevel] = useState(false);

  // Capture targets
  const [captureTargets, setCaptureTargets] = useState<CaptureTarget[]>([]);

  // Auto-capture countdown
  const [countdown, setCountdown] = useState<number | null>(null);

  // Animations
  const flashAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const targetOpacity = useRef(new Animated.Value(0)).current;

  // Current target
  const currentTarget = captureTargets[currentTargetIndex];

  // Check if on target
  const isOnYaw = currentTarget
    ? angleDifference(currentYaw, currentTarget.targetYaw) <= YAW_TOLERANCE
    : false;
  const isOnPitch = currentTarget
    ? Math.abs(currentPitch - currentTarget.targetPitch) <= PITCH_TOLERANCE
    : false;
  const isOnTarget = isOnYaw && isOnPitch;
  const isReadyForCapture =
    isOnTarget && isRollLevel && !isCapturing && hasStarted;

  // Progress percentage
  const progress = (capturedPhotos.length / TOTAL_PHOTOS) * 100;

  // Current row info
  const currentRowInfo = currentTarget
    ? CAPTURE_GRID[currentTarget.rowIndex]
    : null;

  // ============================================================================
  // SENSOR SETUP
  // ============================================================================

  // Setup magnetometer (compass for yaw)
  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    const startCompass = async () => {
      Magnetometer.setUpdateInterval(50);

      subscription = Magnetometer.addListener((data) => {
        let angle = Math.atan2(data.x, data.y) * (180 / Math.PI);
        angle = normalizeAngle(-angle);
        setCurrentYaw(angle);
      });
    };

    startCompass();
    return () => subscription?.remove();
  }, []);

  // Setup accelerometer (for pitch and roll)
  useEffect(() => {
    Accelerometer.setUpdateInterval(50);

    const subscription = Accelerometer.addListener((data) => {
      // Calculate pitch
      const pitch = getPitchFromAccelerometer(data.x, data.y, data.z);
      setCurrentPitch(pitch);

      // Check roll (phone tilt left/right) - x should be near 0
      const isLevel = Math.abs(data.x) < 0.15;
      setIsRollLevel(isLevel);
    });

    return () => subscription.remove();
  }, []);

  // ============================================================================
  // CAPTURE LOGIC
  // ============================================================================

  // Start capture session
  const handleStart = useCallback(() => {
    setStartYaw(currentYaw);
    setCaptureTargets(generateCaptureTargets(currentYaw));
    setHasStarted(true);
    Vibration.vibrate(100);

    Animated.timing(targetOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentYaw, targetOpacity]);

  // On target detection with vibration
  useEffect(() => {
    if (isOnTarget && hasStarted && !isCapturing) {
      Vibration.vibrate(30);
    }
  }, [isOnTarget, hasStarted, isCapturing]);

  // Auto-capture countdown
  useEffect(() => {
    if (isReadyForCapture && countdown === null) {
      setCountdown(3);
      Vibration.vibrate(30);
    } else if (!isReadyForCapture && countdown !== null && countdown > 0) {
      // Cancel countdown if moved off target
      setCountdown(null);
    }
  }, [isReadyForCapture, countdown]);

  // Handle countdown
  useEffect(() => {
    if (countdown === null || countdown < 0) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        Vibration.vibrate(30);
        setCountdown((c) => (c !== null ? c - 1 : null));
      }, 600);
      return () => clearTimeout(timer);
    }

    if (countdown === 0) {
      setCountdown(null);
      setTimeout(() => handleCapture(), 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  // Update progress animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: capturedPhotos.length / TOTAL_PHOTOS,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [capturedPhotos.length, progressAnim]);

  // Pulse animation for target indicator
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // Flash animation
  const triggerFlash = useCallback(() => {
    flashAnim.setValue(1);
    Animated.timing(flashAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [flashAnim]);

  // Take photo
  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || isCapturing || !currentTarget) return;

    try {
      setIsCapturing(true);
      triggerFlash();
      Vibration.vibrate(100);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        skipProcessing: false,
      });

      if (photo?.uri) {
        const newPhoto: CapturedPhoto = {
          uri: photo.uri,
          yaw: currentYaw,
          pitch: currentPitch,
          rowIndex: currentTarget.rowIndex,
          segmentIndex: currentTarget.segmentIndex,
        };

        const updatedPhotos = [...capturedPhotos, newPhoto];
        setCapturedPhotos(updatedPhotos);

        if (currentTargetIndex < captureTargets.length - 1) {
          setCurrentTargetIndex((prev) => prev + 1);
        } else {
          // All photos captured!
          setTimeout(() => onComplete(updatedPhotos), 500);
        }
      }
    } catch {
      Alert.alert("Error", "Failed to capture photo. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  }, [
    currentTarget,
    currentTargetIndex,
    captureTargets.length,
    currentYaw,
    currentPitch,
    capturedPhotos,
    isCapturing,
    onComplete,
    triggerFlash,
  ]);

  // Pick existing panorama from gallery
  const handlePickFromGallery = useCallback(async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Photo library permission needed.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        // Treat as single equirectangular image
        onComplete([
          {
            uri: result.assets[0].uri,
            yaw: 0,
            pitch: 0,
            rowIndex: 0,
            segmentIndex: 0,
          },
        ]);
      }
    } catch {
      Alert.alert("Error", "Failed to pick image.");
    }
  }, [onComplete]);

  // Reset capture
  const handleReset = useCallback(() => {
    setCapturedPhotos([]);
    setCurrentTargetIndex(0);
    setCaptureTargets([]);
    setStartYaw(null);
    setHasStarted(false);
    setCountdown(null);

    Animated.timing(targetOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [targetOpacity]);

  // ============================================================================
  // UI CALCULATIONS
  // ============================================================================

  // Calculate target indicator position on screen
  const getTargetScreenPosition = useCallback(() => {
    if (!currentTarget) return { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 };

    // Yaw difference (horizontal)
    const yawDiff = signedAngleDifference(currentYaw, currentTarget.targetYaw);
    // Convert to screen position (±90° = edge of screen)
    const xOffset = (yawDiff / 60) * (SCREEN_WIDTH / 2);

    // Pitch difference (vertical)
    const pitchDiff = currentTarget.targetPitch - currentPitch;
    // Convert to screen position (±60° = edge of screen)
    const yOffset = (-pitchDiff / 45) * (SCREEN_HEIGHT / 3);

    return {
      x: SCREEN_WIDTH / 2 + xOffset,
      y: SCREEN_HEIGHT / 2 + yOffset,
    };
  }, [currentTarget, currentYaw, currentPitch]);

  // Direction hints
  const getDirectionHints = useCallback(() => {
    if (!currentTarget) return { horizontal: null, vertical: null };

    const yawDiff = signedAngleDifference(currentYaw, currentTarget.targetYaw);
    const pitchDiff = currentTarget.targetPitch - currentPitch;

    return {
      horizontal:
        Math.abs(yawDiff) > YAW_TOLERANCE
          ? {
              direction: yawDiff > 0 ? "right" : "left",
              degrees: Math.abs(Math.round(yawDiff)),
            }
          : null,
      vertical:
        Math.abs(pitchDiff) > PITCH_TOLERANCE
          ? {
              direction: pitchDiff > 0 ? "up" : "down",
              degrees: Math.abs(Math.round(pitchDiff)),
            }
          : null,
    };
  }, [currentTarget, currentYaw, currentPitch]);

  // Row name for display
  const getRowName = (pitch: number): string => {
    if (pitch === 90) return "Zenith (Up)";
    if (pitch === -90) return "Nadir (Down)";
    if (pitch > 0) return `Upper ${pitch}°`;
    if (pitch < 0) return `Lower ${Math.abs(pitch)}°`;
    return "Horizon";
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  // Request camera permission
  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primaryGreen} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons
            name="camera-outline"
            size={64}
            color={Colors.textSecondary}
          />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            We need camera access to capture 360° photos
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Access</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const targetPos = getTargetScreenPosition();
  const hints = getDirectionHints();

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        onCameraReady={() => setIsCameraReady(true)}
      />

      {/* Dark overlay */}
      <View style={styles.overlay} pointerEvents="none" />

      {/* Flash effect */}
      <Animated.View
        style={[styles.flashOverlay, { opacity: flashAnim }]}
        pointerEvents="none"
      />

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {capturedPhotos.length} / {TOTAL_PHOTOS}
          </Text>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>
        </View>

        {capturedPhotos.length > 0 && (
          <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
            <Ionicons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Pre-start screen */}
      {!hasStarted && (
        <View style={styles.startOverlay}>
          <View style={styles.startContent}>
            <View style={styles.iconCircle}>
              <Ionicons
                name="globe-outline"
                size={48}
                color={Colors.primaryGreen}
              />
            </View>
            <Text style={styles.startTitle}>360° Capture</Text>
            <Text style={styles.startSubtitle}>
              Capture a full spherical panorama
            </Text>

            <View style={styles.instructionsList}>
              <View style={styles.instructionItem}>
                <Ionicons
                  name="phone-portrait-outline"
                  size={20}
                  color="#fff"
                />
                <Text style={styles.instructionText}>Hold phone upright</Text>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="sync-outline" size={20} color="#fff" />
                <Text style={styles.instructionText}>
                  Follow the target dot
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="camera-outline" size={20} color="#fff" />
                <Text style={styles.instructionText}>Photos auto-capture</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStart}
              disabled={!isCameraReady}
            >
              <Text style={styles.startButtonText}>Start Capture</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.galleryButton}
              onPress={handlePickFromGallery}
            >
              <Ionicons name="images-outline" size={20} color="#fff" />
              <Text style={styles.galleryButtonText}>
                Upload existing 360° photo
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Capture UI */}
      {hasStarted && currentTarget && (
        <>
          {/* Target indicator - floating dot */}
          <Animated.View
            style={[
              styles.targetIndicator,
              {
                left: targetPos.x - 30,
                top: targetPos.y - 30,
                opacity: targetOpacity,
                transform: [{ scale: isOnTarget ? pulseAnim : 1 }],
              },
            ]}
          >
            <View
              style={[
                styles.targetDot,
                isOnTarget && styles.targetDotActive,
                isReadyForCapture && styles.targetDotReady,
              ]}
            >
              {countdown !== null && countdown > 0 && (
                <Text style={styles.countdownText}>{countdown}</Text>
              )}
            </View>
          </Animated.View>

          {/* Crosshair at center */}
          <View style={styles.crosshairContainer}>
            <View
              style={[
                styles.crosshair,
                isReadyForCapture && styles.crosshairReady,
              ]}
            >
              <View style={styles.crosshairHorizontal} />
              <View style={styles.crosshairVertical} />
            </View>
          </View>

          {/* Direction arrows */}
          {hints.horizontal && (
            <View
              style={[
                styles.arrowContainer,
                hints.horizontal.direction === "left"
                  ? styles.arrowLeft
                  : styles.arrowRight,
              ]}
            >
              <Ionicons
                name={
                  hints.horizontal.direction === "left"
                    ? "chevron-back"
                    : "chevron-forward"
                }
                size={48}
                color={Colors.primaryGreen}
              />
              <Text style={styles.arrowText}>{hints.horizontal.degrees}°</Text>
            </View>
          )}

          {hints.vertical && (
            <View
              style={[
                styles.arrowContainer,
                hints.vertical.direction === "up"
                  ? styles.arrowUp
                  : styles.arrowDown,
              ]}
            >
              <Ionicons
                name={
                  hints.vertical.direction === "up"
                    ? "chevron-up"
                    : "chevron-down"
                }
                size={48}
                color={Colors.primaryGreen}
              />
              <Text style={styles.arrowText}>{hints.vertical.degrees}°</Text>
            </View>
          )}

          {/* Current row info */}
          <View style={[styles.rowInfo, { bottom: insets.bottom + 120 }]}>
            <Text style={styles.rowLabel}>
              {getRowName(currentTarget.targetPitch)}
            </Text>
            <Text style={styles.rowProgress}>
              Photo {currentTarget.segmentIndex + 1} of{" "}
              {currentRowInfo?.segments}
            </Text>
          </View>

          {/* Roll level indicator */}
          <View style={styles.levelIndicatorContainer}>
            <View
              style={[
                styles.levelIndicator,
                isRollLevel
                  ? styles.levelIndicatorLevel
                  : styles.levelIndicatorTilted,
              ]}
            >
              <View style={styles.levelBubble} />
            </View>
            <Text style={styles.levelText}>
              {isRollLevel ? "Level ✓" : "Keep phone straight"}
            </Text>
          </View>

          {/* Status message */}
          {isOnTarget && !isRollLevel && (
            <View style={styles.statusBanner}>
              <Text style={styles.statusText}>Straighten your phone</Text>
            </View>
          )}
        </>
      )}

      {/* Bottom bar with progress dots */}
      {hasStarted && (
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: insets.bottom + Spacing.md },
          ]}
        >
          <View style={styles.rowDotsContainer}>
            {CAPTURE_GRID.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.rowDots}>
                <Text style={styles.rowDotLabel}>
                  {row.pitch === 90
                    ? "↑"
                    : row.pitch === -90
                    ? "↓"
                    : `${row.pitch}°`}
                </Text>
                <View style={styles.dotsRow}>
                  {Array.from({ length: row.segments }).map((_, segIndex) => {
                    const targetIndex =
                      CAPTURE_GRID.slice(0, rowIndex).reduce(
                        (sum, r) => sum + r.segments,
                        0
                      ) + segIndex;
                    const isCompleted = targetIndex < capturedPhotos.length;
                    const isCurrent = targetIndex === currentTargetIndex;

                    return (
                      <View
                        key={segIndex}
                        style={[
                          styles.dot,
                          isCompleted && styles.dotCompleted,
                          isCurrent && styles.dotCurrent,
                        ]}
                      />
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#fff",
  },

  // Top bar
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    zIndex: 100,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: Spacing.md,
    alignItems: "center",
  },
  progressText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primaryGreen,
    borderRadius: 2,
  },
  resetButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Permission screen
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#fff",
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  permissionText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  permissionButton: {
    backgroundColor: Colors.primaryGreen,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // Start overlay
  startOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
  },
  startContent: {
    alignItems: "center",
    padding: Spacing.xl,
    maxWidth: 320,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(46, 204, 113, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  startTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: Spacing.xs,
  },
  startSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  instructionsList: {
    alignSelf: "stretch",
    marginBottom: Spacing.xl,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  instructionText: {
    fontSize: 16,
    color: "#fff",
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primaryGreen,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.md,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  galleryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  galleryButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },

  // Target indicator
  targetIndicator: {
    position: "absolute",
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 30,
  },
  targetDot: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  targetDotActive: {
    borderColor: Colors.primaryGreen,
    backgroundColor: "rgba(46, 204, 113, 0.2)",
  },
  targetDotReady: {
    borderColor: Colors.primaryGreen,
    backgroundColor: Colors.primaryGreen,
  },
  countdownText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },

  // Crosshair
  crosshairContainer: {
    position: "absolute",
    top: SCREEN_HEIGHT / 2 - 20,
    left: SCREEN_WIDTH / 2 - 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  crosshair: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  crosshairReady: {
    opacity: 0.5,
  },
  crosshairHorizontal: {
    position: "absolute",
    width: 30,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  crosshairVertical: {
    position: "absolute",
    width: 2,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.6)",
  },

  // Direction arrows
  arrowContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },
  arrowLeft: {
    left: Spacing.lg,
    top: SCREEN_HEIGHT / 2 - 40,
  },
  arrowRight: {
    right: Spacing.lg,
    top: SCREEN_HEIGHT / 2 - 40,
  },
  arrowUp: {
    top: SCREEN_HEIGHT * 0.2,
    left: SCREEN_WIDTH / 2 - 30,
  },
  arrowDown: {
    bottom: SCREEN_HEIGHT * 0.3,
    left: SCREEN_WIDTH / 2 - 30,
  },
  arrowText: {
    color: Colors.primaryGreen,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },

  // Row info
  rowInfo: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  rowLabel: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 2,
  },
  rowProgress: {
    color: Colors.textSecondary,
    fontSize: 14,
  },

  // Level indicator
  levelIndicatorContainer: {
    position: "absolute",
    right: Spacing.md,
    top: SCREEN_HEIGHT / 2 - 60,
    alignItems: "center",
  },
  levelIndicator: {
    width: 60,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  levelIndicatorLevel: {
    borderColor: Colors.primaryGreen,
    backgroundColor: "rgba(46, 204, 113, 0.2)",
  },
  levelIndicatorTilted: {
    borderColor: "rgba(255,255,255,0.5)",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  levelBubble: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  levelText: {
    color: "#fff",
    fontSize: 10,
    textAlign: "center",
    maxWidth: 60,
  },

  // Status banner
  statusBanner: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.15,
    left: Spacing.xl,
    right: Spacing.xl,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    alignItems: "center",
  },
  statusText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },

  // Bottom bar with dots
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  rowDotsContainer: {
    flexDirection: "column",
    gap: 6,
  },
  rowDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  rowDotLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
    width: 28,
    textAlign: "right",
  },
  dotsRow: {
    flexDirection: "row",
    gap: 3,
    flexWrap: "wrap",
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  dotCompleted: {
    backgroundColor: Colors.primaryGreen,
  },
  dotCurrent: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: Colors.primaryGreen,
  },
});

export default PanoramaCapture;
