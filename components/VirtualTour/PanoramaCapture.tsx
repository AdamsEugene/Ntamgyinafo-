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
  Image,
  Vibration,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Magnetometer, Accelerometer } from "expo-sensors";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Typography, Spacing } from "@/constants/design";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Teleport-style: 16 photos for full 360°
const TOTAL_SEGMENTS = 16;
const SEGMENT_ANGLE = 360 / TOTAL_SEGMENTS; // 22.5 degrees per segment

// Tolerance for "on target" detection (degrees)
const TARGET_TOLERANCE = 8;

// Level tolerance
const LEVEL_TOLERANCE = 0.12;

// Viewfinder dimensions
const VIEWFINDER_SIZE = SCREEN_WIDTH * 0.85;
const VIEWFINDER_HEIGHT = VIEWFINDER_SIZE * 1.2;

interface CapturedPhoto {
  uri: string;
  angle: number;
  heading: number;
  segmentIndex: number;
}

export interface PanoramaCaptureProps {
  onComplete: (photoUri: string) => void;
  onCancel: () => void;
}

// Helper to normalize angle to 0-360 range
const normalizeAngle = (angle: number): number => {
  let normalized = angle % 360;
  if (normalized < 0) normalized += 360;
  return normalized;
};

// Helper to calculate signed angle difference
const signedAngleDifference = (current: number, target: number): number => {
  let diff = normalizeAngle(target) - normalizeAngle(current);
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff;
};

// Helper to calculate absolute angle difference
const angleDifference = (a: number, b: number): number => {
  return Math.abs(signedAngleDifference(a, b));
};

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
  const [currentSegment, setCurrentSegment] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);

  // Compass/Sensor state
  const [currentHeading, setCurrentHeading] = useState(0);
  const [startHeading, setStartHeading] = useState<number | null>(null);
  const [isOnTarget, setIsOnTarget] = useState(false);
  const [isLevel, setIsLevel] = useState(false);

  // Auto-capture
  const [countdown, setCountdown] = useState<number | null>(null);

  // Animations
  const flashAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // First photo only needs level
  const isFirstPhoto = currentSegment === 0 && capturedPhotos.length === 0;
  const isReadyForCapture = isFirstPhoto
    ? isLevel && !isCapturing
    : isOnTarget && isLevel && !isCapturing;

  // Calculate target heading for current segment
  const targetHeading =
    startHeading !== null
      ? normalizeAngle(startHeading + currentSegment * SEGMENT_ANGLE)
      : null;

  // Setup magnetometer (compass)
  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    const startCompass = async () => {
      Magnetometer.setUpdateInterval(50);

      subscription = Magnetometer.addListener((data) => {
        let angle = Math.atan2(data.x, data.y) * (180 / Math.PI);
        angle = normalizeAngle(-angle);
        setCurrentHeading(angle);

        // Set start heading on first reading
        if (
          startHeading === null &&
          currentSegment === 0 &&
          capturedPhotos.length === 0
        ) {
          setStartHeading(angle);
        }
      });
    };

    startCompass();
    return () => subscription?.remove();
  }, [startHeading, currentSegment, capturedPhotos.length]);

  // Setup accelerometer (level detection for upright phone)
  useEffect(() => {
    Accelerometer.setUpdateInterval(50);

    const subscription = Accelerometer.addListener((data) => {
      // For upright phone: x = left/right tilt, z = forward/back tilt
      const isPhoneLevel =
        Math.abs(data.x) < LEVEL_TOLERANCE &&
        Math.abs(data.z) < LEVEL_TOLERANCE;
      setIsLevel(isPhoneLevel);
    });

    return () => subscription.remove();
  }, []);

  // Check if on target
  useEffect(() => {
    if (targetHeading === null) return;

    const diff = angleDifference(currentHeading, targetHeading);
    const onTarget = diff <= TARGET_TOLERANCE;

    if (onTarget && !isOnTarget) {
      Vibration.vibrate(30);
    }
    setIsOnTarget(onTarget);
  }, [currentHeading, targetHeading, isOnTarget]);

  // Auto-capture countdown
  useEffect(() => {
    if (isReadyForCapture && countdown === null && !isCapturing) {
      setCountdown(3);
      Vibration.vibrate(30);
    }
  }, [isReadyForCapture, countdown, isCapturing]);

  // Handle countdown
  useEffect(() => {
    if (countdown === null || countdown < 0) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        Vibration.vibrate(30);
        setCountdown(countdown - 1);
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
      toValue: capturedPhotos.length / TOTAL_SEGMENTS,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [capturedPhotos.length, progressAnim]);

  // Pulse animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
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
    if (!cameraRef.current || isCapturing) return;

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
          angle: currentSegment * SEGMENT_ANGLE,
          heading: currentHeading,
          segmentIndex: currentSegment,
        };

        setCapturedPhotos((prev) => [...prev, newPhoto]);

        if (currentSegment < TOTAL_SEGMENTS - 1) {
          setCurrentSegment((prev) => prev + 1);
        } else {
          // All photos captured - complete!
          setTimeout(() => onComplete(photo.uri), 500);
        }
      }
    } catch {
      Alert.alert("Error", "Failed to capture photo. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  }, [currentSegment, currentHeading, isCapturing, onComplete, triggerFlash]);

  // Pick from gallery
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
        onComplete(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Error", "Failed to pick image.");
    }
  }, [onComplete]);

  // Reset capture
  const handleReset = useCallback(() => {
    setCapturedPhotos([]);
    setCurrentSegment(0);
    setStartHeading(null);
    setCountdown(null);
  }, []);

  // Calculate rotation offset for showing captured images
  const getImageRotationOffset = useCallback(() => {
    if (startHeading === null) return 0;
    const diff = signedAngleDifference(currentHeading, startHeading);
    return diff;
  }, [currentHeading, startHeading]);

  // Get visible captured photos based on current heading
  const getVisiblePhotos = useCallback(() => {
    if (capturedPhotos.length === 0 || startHeading === null) return [];

    const rotationOffset = getImageRotationOffset();

    return capturedPhotos.map((photo, index) => {
      // Calculate where this photo should appear based on current rotation
      const photoAngle = index * SEGMENT_ANGLE;
      const displayAngle = photoAngle + rotationOffset;

      // Only show if within view (-90 to +90 degrees from center)
      const isVisible = Math.abs(displayAngle) < 120;

      return {
        ...photo,
        displayAngle,
        isVisible,
        opacity: isVisible ? Math.max(0, 1 - Math.abs(displayAngle) / 120) : 0,
      };
    });
  }, [capturedPhotos, startHeading, getImageRotationOffset]);

  // Calculate direction indicator
  const getDirectionIndicator = useCallback(() => {
    if (targetHeading === null || isFirstPhoto) return null;

    const diff = signedAngleDifference(currentHeading, targetHeading);
    return {
      direction: diff > 0 ? "right" : "left",
      degrees: Math.abs(Math.round(diff)),
    };
  }, [currentHeading, targetHeading, isFirstPhoto]);

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

  const visiblePhotos = getVisiblePhotos();
  const directionIndicator = getDirectionIndicator();

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

      {/* Captured photos overlay - appears as you rotate */}
      {visiblePhotos.map(
        (photo, index) =>
          photo.isVisible && (
            <Animated.View
              key={photo.uri}
              style={[
                styles.capturedPhotoOverlay,
                {
                  opacity: photo.opacity * 0.9,
                  transform: [
                    {
                      translateX:
                        (photo.displayAngle / 90) * (SCREEN_WIDTH * 0.7),
                    },
                  ],
                },
              ]}
              pointerEvents="none"
            >
              <Image
                source={{ uri: photo.uri }}
                style={styles.capturedPhotoImage}
              />
            </Animated.View>
          )
      )}

      {/* Flash effect */}
      <Animated.View
        style={[styles.flashOverlay, { opacity: flashAnim }]}
        pointerEvents="none"
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity style={styles.headerButton} onPress={handleReset}>
          <Ionicons name="refresh" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Capture 360°</Text>
          <Text style={styles.headerSubtitle}>
            Photo {capturedPhotos.length + 1} of {TOTAL_SEGMENTS}
          </Text>
        </View>

        <TouchableOpacity style={styles.headerButtonClose} onPress={onCancel}>
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Viewfinder */}
      <View style={styles.viewfinderContainer}>
        <View style={styles.viewfinder}>
          {/* Corner brackets */}
          <View style={[styles.bracket, styles.bracketTopLeft]} />
          <View style={[styles.bracket, styles.bracketTopRight]} />
          <View style={[styles.bracket, styles.bracketBottomLeft]} />
          <View style={[styles.bracket, styles.bracketBottomRight]} />

          {/* Direction dots at cardinal positions */}
          {[0, 90, 180, 270].map((angle) => {
            const relativeAngle =
              startHeading !== null
                ? signedAngleDifference(
                    currentHeading,
                    normalizeAngle(startHeading + angle)
                  )
                : angle;
            const isInView = Math.abs(relativeAngle) < 60;

            if (!isInView) return null;

            const posX = (relativeAngle / 60) * (VIEWFINDER_SIZE / 2);
            const isTop = Math.abs(relativeAngle) < 30;

            return (
              <View
                key={angle}
                style={[
                  styles.directionDot,
                  {
                    left: VIEWFINDER_SIZE / 2 + posX - 20,
                    top: isTop ? -30 : 10,
                  },
                ]}
              >
                <View style={styles.directionDotInner} />
              </View>
            );
          })}

          {/* Center progress indicator */}
          <View style={styles.centerIndicator}>
            {/* Progress pie */}
            <View style={styles.progressPie}>
              <Animated.View
                style={[
                  styles.progressPieFill,
                  {
                    transform: [
                      {
                        rotate: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0deg", "360deg"],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </View>

            {/* Countdown or direction arrow */}
            {countdown !== null && countdown > 0 ? (
              <Animated.Text
                style={[
                  styles.countdownText,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                {countdown}
              </Animated.Text>
            ) : directionIndicator &&
              directionIndicator.degrees > TARGET_TOLERANCE ? (
              <View style={styles.directionArrow}>
                <Ionicons
                  name={
                    directionIndicator.direction === "right"
                      ? "chevron-forward"
                      : "chevron-back"
                  }
                  size={32}
                  color="#FFFFFF"
                />
              </View>
            ) : (
              <View style={styles.readyIndicator}>
                {isLevel ? (
                  <Ionicons
                    name="checkmark"
                    size={28}
                    color={Colors.primaryGreen}
                  />
                ) : (
                  <Ionicons
                    name="phone-portrait-outline"
                    size={24}
                    color="#FFFFFF"
                  />
                )}
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionText}>
          {isFirstPhoto
            ? "Hold phone level to start capturing"
            : isOnTarget && isLevel
            ? countdown !== null
              ? "Hold steady..."
              : "Perfect! Capturing..."
            : !isLevel
            ? "Hold phone level"
            : directionIndicator?.direction === "right"
            ? `Turn right ${directionIndicator.degrees}°`
            : `Turn left ${directionIndicator?.degrees || 0}°`}
        </Text>
      </View>

      {/* Progress bar */}
      <View
        style={[
          styles.progressContainer,
          { paddingBottom: insets.bottom + Spacing.md },
        ]}
      >
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {capturedPhotos.length} of {TOTAL_SEGMENTS}
        </Text>
      </View>

      {/* Bottom controls */}
      <View style={[styles.bottomControls, { bottom: insets.bottom + 80 }]}>
        {/* Gallery button */}
        <TouchableOpacity
          style={styles.sideButton}
          onPress={handlePickFromGallery}
        >
          <Ionicons name="images-outline" size={24} color="#FFFFFF" />
          <Text style={styles.sideButtonText}>Gallery</Text>
        </TouchableOpacity>

        {/* Manual capture button */}
        <TouchableOpacity
          style={[
            styles.captureButton,
            isReadyForCapture && styles.captureButtonReady,
          ]}
          onPress={handleCapture}
          disabled={isCapturing || !isCameraReady}
        >
          <View style={styles.captureButtonInner}>
            {isCapturing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : null}
          </View>
        </TouchableOpacity>

        {/* Done button (if at least 4 photos) */}
        <TouchableOpacity
          style={[
            styles.sideButton,
            capturedPhotos.length < 4 && styles.sideButtonDisabled,
          ]}
          onPress={() =>
            capturedPhotos.length >= 4 &&
            onComplete(capturedPhotos[capturedPhotos.length - 1].uri)
          }
          disabled={capturedPhotos.length < 4}
        >
          <Ionicons
            name="checkmark-done"
            size={24}
            color={
              capturedPhotos.length >= 4
                ? Colors.primaryGreen
                : "rgba(255,255,255,0.3)"
            }
          />
          <Text
            style={[
              styles.sideButtonText,
              capturedPhotos.length < 4 && styles.sideButtonTextDisabled,
            ]}
          >
            Done
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  capturedPhotoOverlay: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.15,
    left: (SCREEN_WIDTH - VIEWFINDER_SIZE) / 2,
    width: VIEWFINDER_SIZE,
    height: VIEWFINDER_HEIGHT,
  },
  capturedPhotoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 8,
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    zIndex: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerButtonClose: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 59, 48, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    alignItems: "center",
  },
  headerTitle: {
    ...Typography.titleMedium,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  headerSubtitle: {
    ...Typography.caption,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 2,
  },
  viewfinderContainer: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.15,
    left: (SCREEN_WIDTH - VIEWFINDER_SIZE) / 2,
    width: VIEWFINDER_SIZE,
    height: VIEWFINDER_HEIGHT,
    zIndex: 5,
  },
  viewfinder: {
    flex: 1,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 12,
  },
  bracket: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "#FFFFFF",
    borderWidth: 3,
  },
  bracketTopLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 12,
  },
  bracketTopRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 12,
  },
  bracketBottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
  },
  bracketBottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 12,
  },
  directionDot: {
    position: "absolute",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  directionDotInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primaryGreen,
  },
  centerIndicator: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 80,
    height: 80,
    marginLeft: -40,
    marginTop: -40,
    justifyContent: "center",
    alignItems: "center",
  },
  progressPie: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.3)",
    overflow: "hidden",
  },
  progressPieFill: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "50%",
    height: "100%",
    backgroundColor: Colors.primaryGreen,
    transformOrigin: "right center",
  },
  countdownText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  directionArrow: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  readyIndicator: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  instructionsContainer: {
    position: "absolute",
    bottom: SCREEN_HEIGHT * 0.25,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  instructionText: {
    ...Typography.bodyMedium,
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
  },
  progressContainer: {
    position: "absolute",
    bottom: 0,
    left: Spacing.lg,
    right: Spacing.lg,
    alignItems: "center",
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.primaryGreen,
  },
  progressText: {
    ...Typography.caption,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: Spacing.xs,
  },
  bottomControls: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  sideButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
  },
  sideButtonDisabled: {
    opacity: 0.5,
  },
  sideButtonText: {
    ...Typography.caption,
    color: "#FFFFFF",
    marginTop: 4,
    fontSize: 11,
  },
  sideButtonTextDisabled: {
    color: "rgba(255, 255, 255, 0.3)",
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  captureButtonReady: {
    backgroundColor: Colors.primaryGreen,
    borderColor: Colors.primaryGreen,
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  permissionTitle: {
    ...Typography.titleMedium,
    color: "#FFFFFF",
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  permissionText: {
    ...Typography.bodyMedium,
    color: "rgba(255, 255, 255, 0.7)",
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
    ...Typography.bodyMedium,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

export default PanoramaCapture;
