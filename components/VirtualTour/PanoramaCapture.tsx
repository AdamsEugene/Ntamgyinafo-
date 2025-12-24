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
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Typography, Spacing } from "@/constants/design";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Number of photos needed to complete a 360° panorama
const TOTAL_SEGMENTS = 8;
const SEGMENT_ANGLE = 360 / TOTAL_SEGMENTS; // 45 degrees per segment

// Tolerance for "on target" detection (degrees)
const TARGET_TOLERANCE = 10;

// Level tolerance (how level the phone needs to be)
const LEVEL_TOLERANCE = 0.15;

interface CapturedPhoto {
  uri: string;
  angle: number;
  heading: number;
}

export interface PanoramaCaptureProps {
  onComplete: (photoUri: string) => void;
  onCancel: () => void;
}

// Helper to normalize angle to 0-360 range
const normalizeAngle = (angle: number): number => {
  while (angle < 0) angle += 360;
  while (angle >= 360) angle -= 360;
  return angle;
};

// Helper to calculate angle difference (handles wraparound)
const angleDifference = (a: number, b: number): number => {
  let diff = Math.abs(normalizeAngle(a) - normalizeAngle(b));
  if (diff > 180) diff = 360 - diff;
  return diff;
};

// Cardinal direction labels
const getCardinalDirection = (heading: number): string => {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(heading / 45) % 8;
  return directions[index];
};

export function PanoramaCapture({
  onComplete,
  onCancel,
}: PanoramaCaptureProps) {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const targetPulseAnim = useRef(new Animated.Value(1)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  const levelIndicatorAnim = useRef(new Animated.Value(0)).current;

  const [permission, requestPermission] = useCameraPermissions();
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const [lastCapturedUri, setLastCapturedUri] = useState<string | null>(null);

  // Compass/Sensor state
  const [currentHeading, setCurrentHeading] = useState(0);
  const [startHeading, setStartHeading] = useState<number | null>(null);
  const [isOnTarget, setIsOnTarget] = useState(false);
  const [isLevel, setIsLevel] = useState(false);
  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);
  const wasOnTargetRef = useRef(false);

  // Calculate target heading for current segment
  const targetHeading =
    startHeading !== null
      ? normalizeAngle(startHeading + currentSegment * SEGMENT_ANGLE)
      : null;

  // Setup magnetometer (compass)
  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    const startCompass = async () => {
      // Set update interval (in ms)
      Magnetometer.setUpdateInterval(100);

      subscription = Magnetometer.addListener((data) => {
        // Calculate heading from magnetometer data
        // atan2 gives angle in radians, convert to degrees
        let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
        angle = normalizeAngle(90 - angle); // Adjust to compass heading

        setCurrentHeading(angle);

        // Set start heading on first reading
        if (startHeading === null && currentSegment === 0) {
          setStartHeading(angle);
        }
      });
    };

    startCompass();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [startHeading, currentSegment]);

  // Setup accelerometer (level detection)
  useEffect(() => {
    Accelerometer.setUpdateInterval(100);

    const subscription = Accelerometer.addListener((data) => {
      // data.x and data.y indicate tilt
      // When phone is perfectly level: x ≈ 0, y ≈ 0, z ≈ ±1
      setTiltX(data.x);
      setTiltY(data.y);

      // Check if phone is level (within tolerance)
      const isPhoneLevel =
        Math.abs(data.x) < LEVEL_TOLERANCE &&
        Math.abs(data.y) < LEVEL_TOLERANCE;
      setIsLevel(isPhoneLevel);

      // Animate level indicator
      Animated.spring(levelIndicatorAnim, {
        toValue: isPhoneLevel ? 1 : 0,
        useNativeDriver: false,
        tension: 100,
        friction: 10,
      }).start();
    });

    return () => subscription.remove();
  }, [levelIndicatorAnim]);

  // Check if on target
  useEffect(() => {
    if (targetHeading === null) return;

    const diff = angleDifference(currentHeading, targetHeading);
    const onTarget = diff <= TARGET_TOLERANCE;
    setIsOnTarget(onTarget);

    // Haptic feedback when entering target zone
    if (onTarget && !wasOnTargetRef.current) {
      Vibration.vibrate(50);
    }
    wasOnTargetRef.current = onTarget;
  }, [currentHeading, targetHeading]);

  // Pulse animation for capture button
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

  // Target pulse animation (when on target)
  useEffect(() => {
    if (isOnTarget) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(targetPulseAnim, {
            toValue: 1.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(targetPulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      targetPulseAnim.setValue(1);
    }
  }, [isOnTarget, targetPulseAnim]);

  // Flash animation when photo is captured
  const triggerFlash = useCallback(() => {
    flashAnim.setValue(1);
    Animated.timing(flashAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [flashAnim]);

  // Take photo with camera
  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      triggerFlash();
      Vibration.vibrate(100);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      });

      if (photo?.uri) {
        const newPhoto: CapturedPhoto = {
          uri: photo.uri,
          angle: currentSegment * SEGMENT_ANGLE,
          heading: currentHeading,
        };

        setCapturedPhotos((prev) => [...prev, newPhoto]);
        setLastCapturedUri(photo.uri);

        if (currentSegment < TOTAL_SEGMENTS - 1) {
          setCurrentSegment((prev) => prev + 1);
        } else {
          // All photos captured
          onComplete(photo.uri);
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
        Alert.alert(
          "Permission Required",
          "Photo library permission is needed."
        );
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
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  }, [onComplete]);

  // Reset capture
  const handleReset = useCallback(() => {
    setCapturedPhotos([]);
    setCurrentSegment(0);
    setLastCapturedUri(null);
    setStartHeading(null);
  }, []);

  // Skip remaining segments
  const handleDone = useCallback(() => {
    if (capturedPhotos.length > 0) {
      onComplete(capturedPhotos[capturedPhotos.length - 1].uri);
    }
  }, [capturedPhotos, onComplete]);

  // Permission not determined yet
  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primaryGreen} />
        <Text style={styles.loadingText}>Initializing camera...</Text>
      </View>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionIcon}>
          <Ionicons
            name="camera-outline"
            size={64}
            color={Colors.textSecondary}
          />
        </View>
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          To capture 360° photos, we need access to your camera and sensors for
          guided capture with compass and level indicators.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Ionicons name="camera" size={20} color="#FFFFFF" />
          <Text style={styles.permissionButtonText}>Enable Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.galleryButton}
          onPress={handlePickFromGallery}
        >
          <Ionicons name="images" size={20} color={Colors.primaryGreen} />
          <Text style={styles.galleryButtonText}>Choose from Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Live Camera View */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        mode="picture"
      >
        {/* Flash Effect */}
        <Animated.View
          style={[styles.flashOverlay, { opacity: flashAnim }]}
          pointerEvents="none"
        />

        {/* On-Target Glow Effect */}
        {isOnTarget && (
          <Animated.View
            style={[
              styles.onTargetGlow,
              { transform: [{ scale: targetPulseAnim }] },
            ]}
            pointerEvents="none"
          />
        )}

        {/* Top Gradient */}
        <LinearGradient
          colors={["rgba(0,0,0,0.7)", "transparent"]}
          style={[styles.topGradient, { paddingTop: insets.top }]}
          pointerEvents="none"
        />

        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onCancel}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            {/* Compass Reading */}
            <View style={styles.compassBadge}>
              <Ionicons name="compass" size={14} color="#FFFFFF" />
              <Text style={styles.compassText}>
                {Math.round(currentHeading)}°{" "}
                {getCardinalDirection(currentHeading)}
              </Text>
            </View>
            <Text style={styles.headerTitle}>Capture 360°</Text>
            <Text style={styles.headerSubtitle}>
              Photo {currentSegment + 1} of {TOTAL_SEGMENTS}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowTips(!showTips)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showTips ? "help-circle" : "help-circle-outline"}
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {/* Progress Ring with Compass */}
        <View style={styles.progressRingContainer}>
          <View style={styles.progressRing}>
            {Array.from({ length: TOTAL_SEGMENTS }).map((_, index) => {
              const segmentAngle = index * SEGMENT_ANGLE;
              const isCaptured = index < capturedPhotos.length;
              const isCurrent = index === currentSegment;
              const isTarget = isCurrent && !isCaptured;

              // Calculate if this segment is the one user is pointing at
              const segmentHeading =
                startHeading !== null
                  ? normalizeAngle(startHeading + segmentAngle)
                  : segmentAngle;
              const isPointingAt =
                angleDifference(currentHeading, segmentHeading) <=
                TARGET_TOLERANCE;

              return (
                <View
                  key={index}
                  style={[
                    styles.progressSegment,
                    {
                      transform: [
                        { rotate: `${segmentAngle}deg` },
                        { translateY: -85 },
                      ],
                    },
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.progressDot,
                      isCaptured && styles.progressDotCaptured,
                      isTarget && styles.progressDotTarget,
                      isTarget && isOnTarget && styles.progressDotOnTarget,
                      isPointingAt &&
                        !isCaptured &&
                        !isTarget &&
                        styles.progressDotPointing,
                    ]}
                  >
                    {isCaptured ? (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    ) : (
                      <Text
                        style={[
                          styles.progressDotNumber,
                          isTarget && styles.progressDotNumberTarget,
                        ]}
                      >
                        {index + 1}
                      </Text>
                    )}

                    {/* Pulsing ring for target */}
                    {isTarget && isOnTarget && (
                      <Animated.View
                        style={[
                          styles.progressDotPulse,
                          { transform: [{ scale: targetPulseAnim }] },
                        ]}
                      />
                    )}
                  </Animated.View>

                  {/* Target indicator label */}
                  {isTarget && (
                    <View style={styles.targetLabel}>
                      <Text style={styles.targetLabelText}>
                        {isOnTarget ? "✓ Ready!" : "Next"}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}

            {/* Center with compass needle */}
            <View style={styles.centerCircle}>
              <Animated.View
                style={[
                  styles.compassNeedle,
                  {
                    transform: [{ rotate: `${-currentHeading}deg` }],
                  },
                ]}
              >
                <View style={styles.needleNorth} />
                <View style={styles.needleSouth} />
              </Animated.View>
              <Text style={styles.centerAngleText}>
                {Math.round(currentSegment * SEGMENT_ANGLE)}°
              </Text>
            </View>
          </View>
        </View>

        {/* Level Indicator */}
        <View style={styles.levelIndicatorContainer}>
          <View style={styles.levelIndicator}>
            <Animated.View
              style={[
                styles.levelBubble,
                {
                  transform: [
                    { translateX: tiltX * 40 },
                    { translateY: tiltY * 40 },
                  ],
                  backgroundColor: isLevel ? Colors.primaryGreen : "#FF9500",
                },
              ]}
            />
            <View
              style={[styles.levelCenter, isLevel && styles.levelCenterActive]}
            />
          </View>
          <Text style={[styles.levelText, isLevel && styles.levelTextActive]}>
            {isLevel ? "Level ✓" : "Level your phone"}
          </Text>
        </View>

        {/* Status Banner */}
        <View
          style={[
            styles.statusBanner,
            isOnTarget && isLevel && styles.statusBannerReady,
          ]}
        >
          <Ionicons
            name={isOnTarget && isLevel ? "checkmark-circle" : "navigate"}
            size={18}
            color="#FFFFFF"
          />
          <Text style={styles.statusText}>
            {!isLevel
              ? "Hold phone level"
              : isOnTarget
              ? "Perfect! Tap to capture"
              : `Rotate ${Math.round(
                  angleDifference(currentHeading, targetHeading || 0)
                )}° to target`}
          </Text>
        </View>

        {/* Camera Viewfinder Guidelines */}
        <View style={styles.viewfinderContainer} pointerEvents="none">
          {/* Corner brackets with color based on alignment */}
          <View
            style={[
              styles.cornerBracket,
              styles.cornerTopLeft,
              isOnTarget && isLevel && styles.cornerBracketActive,
            ]}
          />
          <View
            style={[
              styles.cornerBracket,
              styles.cornerTopRight,
              isOnTarget && isLevel && styles.cornerBracketActive,
            ]}
          />
          <View
            style={[
              styles.cornerBracket,
              styles.cornerBottomLeft,
              isOnTarget && isLevel && styles.cornerBracketActive,
            ]}
          />
          <View
            style={[
              styles.cornerBracket,
              styles.cornerBottomRight,
              isOnTarget && isLevel && styles.cornerBracketActive,
            ]}
          />
        </View>

        {/* Tips Panel */}
        {showTips && capturedPhotos.length === 0 && (
          <View style={styles.tipsPanel}>
            <View style={styles.tipHeader}>
              <Ionicons name="bulb" size={16} color="#FFD700" />
              <Text style={styles.tipHeaderText}>Smart Capture Guide</Text>
            </View>
            <View style={styles.tipRow}>
              <View
                style={[
                  styles.tipIcon,
                  { backgroundColor: Colors.primaryGreen },
                ]}
              >
                <Ionicons name="compass" size={12} color="#FFFFFF" />
              </View>
              <Text style={styles.tipText}>
                Green border = correct direction
              </Text>
            </View>
            <View style={styles.tipRow}>
              <View style={[styles.tipIcon, { backgroundColor: "#FF9500" }]}>
                <Ionicons name="phone-portrait" size={12} color="#FFFFFF" />
              </View>
              <Text style={styles.tipText}>Level bubble must be centered</Text>
            </View>
            <View style={styles.tipRow}>
              <View style={[styles.tipIcon, { backgroundColor: "#007AFF" }]}>
                <Ionicons name="sync" size={12} color="#FFFFFF" />
              </View>
              <Text style={styles.tipText}>
                Rotate body (not just phone) 45°
              </Text>
            </View>
          </View>
        )}

        {/* Last Captured Thumbnail */}
        {lastCapturedUri && (
          <View style={styles.lastCapturedContainer}>
            <Image
              source={{ uri: lastCapturedUri }}
              style={styles.lastCapturedImage}
            />
            <View style={styles.lastCapturedBadge}>
              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
            </View>
          </View>
        )}

        {/* Bottom Gradient */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.85)"]}
          style={styles.bottomGradient}
          pointerEvents="none"
        />

        {/* Bottom Controls */}
        <View
          style={[
            styles.bottomControls,
            { paddingBottom: insets.bottom + Spacing.lg },
          ]}
        >
          {/* Gallery Button */}
          <TouchableOpacity
            style={styles.sideButton}
            onPress={handlePickFromGallery}
            activeOpacity={0.7}
          >
            <View style={styles.sideButtonInner}>
              <Ionicons name="images" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.sideButtonText}>Gallery</Text>
          </TouchableOpacity>

          {/* Main Capture Button */}
          <TouchableOpacity
            style={[
              styles.captureButtonOuter,
              isOnTarget && isLevel && styles.captureButtonReady,
            ]}
            onPress={handleCapture}
            activeOpacity={0.8}
            disabled={isCapturing}
          >
            {isOnTarget && isLevel && (
              <Animated.View
                style={[
                  styles.captureButtonPulse,
                  { transform: [{ scale: targetPulseAnim }] },
                ]}
              />
            )}
            <View
              style={[
                styles.captureButtonInner,
                isOnTarget && isLevel && styles.captureButtonInnerReady,
              ]}
            >
              {isCapturing ? (
                <ActivityIndicator size="small" color={Colors.primaryGreen} />
              ) : (
                <View
                  style={[
                    styles.captureButtonCore,
                    isOnTarget && isLevel && styles.captureButtonCoreReady,
                  ]}
                />
              )}
            </View>
          </TouchableOpacity>

          {/* Done/Reset Button */}
          <TouchableOpacity
            style={styles.sideButton}
            onPress={capturedPhotos.length > 0 ? handleDone : handleReset}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.sideButtonInner,
                capturedPhotos.length > 0 && styles.sideButtonInnerActive,
              ]}
            >
              <Ionicons
                name={capturedPhotos.length > 0 ? "checkmark-done" : "refresh"}
                size={22}
                color="#FFFFFF"
              />
            </View>
            <Text style={styles.sideButtonText}>
              {capturedPhotos.length > 0 ? "Done" : "Reset"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Captured Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${(capturedPhotos.length / TOTAL_SEGMENTS) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressBarText}>
            {capturedPhotos.length}/{TOTAL_SEGMENTS} captured
          </Text>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.md,
  },
  loadingText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl * 2,
  },
  permissionIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  permissionTitle: {
    ...Typography.titleLarge,
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  permissionText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  permissionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primaryGreen,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 14,
    marginBottom: Spacing.md,
    width: "100%",
    justifyContent: "center",
  },
  permissionButtonText: {
    ...Typography.labelMedium,
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  galleryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: `${Colors.primaryGreen}15`,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 14,
    marginBottom: Spacing.md,
    width: "100%",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.primaryGreen,
  },
  galleryButtonText: {
    ...Typography.labelMedium,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
  cancelButton: {
    paddingVertical: Spacing.md,
  },
  cancelButtonText: {
    ...Typography.labelMedium,
    fontSize: 15,
    color: Colors.textSecondary,
  },
  camera: {
    flex: 1,
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
    zIndex: 100,
  },
  onTargetGlow: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 4,
    borderColor: Colors.primaryGreen,
    zIndex: 99,
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    zIndex: 10,
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 220,
    zIndex: 10,
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
    zIndex: 20,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  headerCenter: {
    alignItems: "center",
  },
  compassBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  compassText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerTitle: {
    ...Typography.titleMedium,
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    ...Typography.caption,
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 2,
  },
  progressRingContainer: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.2,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 15,
  },
  progressRing: {
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  progressSegment: {
    position: "absolute",
    alignItems: "center",
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  progressDotCaptured: {
    backgroundColor: Colors.primaryGreen,
    borderColor: Colors.primaryGreen,
  },
  progressDotTarget: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "#FF9500",
    borderWidth: 3,
  },
  progressDotOnTarget: {
    borderColor: Colors.primaryGreen,
    backgroundColor: `${Colors.primaryGreen}30`,
  },
  progressDotPointing: {
    borderColor: "rgba(255, 255, 255, 0.6)",
  },
  progressDotNumber: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.7)",
  },
  progressDotNumberTarget: {
    color: "#FF9500",
  },
  progressDotPulse: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.primaryGreen,
  },
  targetLabel: {
    marginTop: 4,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  targetLabelText: {
    ...Typography.caption,
    fontSize: 9,
    fontWeight: "700",
    color: Colors.primaryGreen,
  },
  centerCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  compassNeedle: {
    position: "absolute",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  needleNorth: {
    position: "absolute",
    top: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 15,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#FF3B30",
  },
  needleSouth: {
    position: "absolute",
    bottom: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 15,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#FFFFFF",
  },
  centerAngleText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 20,
  },
  levelIndicatorContainer: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.48,
    right: Spacing.lg,
    alignItems: "center",
    zIndex: 20,
  },
  levelIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  levelBubble: {
    width: 16,
    height: 16,
    borderRadius: 8,
    position: "absolute",
  },
  levelCenter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  levelCenterActive: {
    borderColor: Colors.primaryGreen,
  },
  levelText: {
    ...Typography.caption,
    fontSize: 10,
    color: "#FF9500",
    fontWeight: "600",
    marginTop: 4,
  },
  levelTextActive: {
    color: Colors.primaryGreen,
  },
  statusBanner: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.45,
    left: Spacing.lg,
    right: Spacing.lg + 80,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    zIndex: 15,
  },
  statusBannerReady: {
    backgroundColor: Colors.primaryGreen,
  },
  statusText: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "500",
    flex: 1,
  },
  viewfinderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  cornerBracket: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  cornerBracketActive: {
    borderColor: Colors.primaryGreen,
  },
  cornerTopLeft: {
    top: "25%",
    left: "8%",
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTopRight: {
    top: "25%",
    right: "8%",
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerBottomLeft: {
    bottom: "32%",
    left: "8%",
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBottomRight: {
    bottom: "32%",
    right: "8%",
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  tipsPanel: {
    position: "absolute",
    bottom: "38%",
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 16,
    padding: Spacing.md,
    zIndex: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  tipHeaderText: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "700",
    color: "#FFD700",
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: 6,
  },
  tipIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  tipText: {
    ...Typography.caption,
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.85)",
    flex: 1,
  },
  lastCapturedContainer: {
    position: "absolute",
    top: "50%",
    left: Spacing.lg,
    width: 60,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.primaryGreen,
    zIndex: 20,
  },
  lastCapturedImage: {
    width: "100%",
    height: "100%",
  },
  lastCapturedBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primaryGreen,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: Spacing.xl,
    zIndex: 20,
  },
  sideButton: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  sideButtonInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  sideButtonInnerActive: {
    backgroundColor: Colors.primaryGreen,
    borderColor: Colors.primaryGreen,
  },
  sideButtonText: {
    ...Typography.caption,
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  captureButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  captureButtonReady: {
    borderColor: Colors.primaryGreen,
  },
  captureButtonPulse: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.primaryGreen,
    opacity: 0.3,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonInnerReady: {
    backgroundColor: `${Colors.primaryGreen}20`,
  },
  captureButtonCore: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#FF3B30",
  },
  captureButtonCoreReady: {
    backgroundColor: Colors.primaryGreen,
  },
  progressBarContainer: {
    position: "absolute",
    bottom: 130,
    left: Spacing.xl,
    right: Spacing.xl,
    zIndex: 20,
    alignItems: "center",
  },
  progressBarBackground: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.primaryGreen,
    borderRadius: 2,
  },
  progressBarText: {
    ...Typography.caption,
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 6,
    fontWeight: "500",
  },
});

export default PanoramaCapture;
