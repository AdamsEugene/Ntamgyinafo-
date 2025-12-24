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
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Typography, Spacing } from "@/constants/design";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Number of photos needed to complete a 360° panorama
const TOTAL_SEGMENTS = 8;
const SEGMENT_ANGLE = 360 / TOTAL_SEGMENTS;

interface CapturedPhoto {
  uri: string;
  angle: number;
}

export interface PanoramaCaptureProps {
  onComplete: (photoUri: string) => void;
  onCancel: () => void;
}

export function PanoramaCapture({
  onComplete,
  onCancel,
}: PanoramaCaptureProps) {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const guideRotation = useRef(new Animated.Value(0)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;

  const [permission, requestPermission] = useCameraPermissions();
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const [lastCapturedUri, setLastCapturedUri] = useState<string | null>(null);

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

  // Animate guide rotation when segment changes
  useEffect(() => {
    Animated.spring(guideRotation, {
      toValue: currentSegment * SEGMENT_ANGLE,
      useNativeDriver: true,
      tension: 50,
      friction: 10,
    }).start();
  }, [currentSegment, guideRotation]);

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

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      });

      if (photo?.uri) {
        const newPhoto: CapturedPhoto = {
          uri: photo.uri,
          angle: currentSegment * SEGMENT_ANGLE,
        };

        setCapturedPhotos((prev) => [...prev, newPhoto]);
        setLastCapturedUri(photo.uri);

        if (currentSegment < TOTAL_SEGMENTS - 1) {
          setCurrentSegment((prev) => prev + 1);
        } else {
          // All photos captured - use the last photo as the panorama
          // In production, you'd stitch these together
          onComplete(photo.uri);
        }
      }
    } catch {
      Alert.alert("Error", "Failed to capture photo. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  }, [currentSegment, isCapturing, onComplete, triggerFlash]);

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
  }, []);

  // Skip remaining segments and use what we have
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
          To capture 360° photos like Teleport, we need access to your camera.
          This allows you to take panoramic shots directly in the app.
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
            <View style={styles.liveIndicator}>
              <View style={styles.liveIndicatorDot} />
              <Text style={styles.liveIndicatorText}>LIVE</Text>
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

        {/* Progress Ring - Like Teleport's circular guide */}
        <View style={styles.progressRingContainer}>
          <View style={styles.progressRing}>
            {Array.from({ length: TOTAL_SEGMENTS }).map((_, index) => {
              const rotation = index * SEGMENT_ANGLE;
              const isCaptured = index < capturedPhotos.length;
              const isCurrent = index === currentSegment;

              return (
                <View
                  key={index}
                  style={[
                    styles.progressSegment,
                    {
                      transform: [
                        { rotate: `${rotation}deg` },
                        { translateY: -80 },
                      ],
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.progressDot,
                      isCaptured && styles.progressDotCaptured,
                      isCurrent && styles.progressDotCurrent,
                    ]}
                    activeOpacity={0.8}
                  >
                    {isCaptured ? (
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    ) : (
                      <Text style={styles.progressDotNumber}>{index + 1}</Text>
                    )}
                    {isCurrent && !isCaptured && (
                      <Animated.View
                        style={[
                          styles.progressDotPulse,
                          { transform: [{ scale: pulseAnim }] },
                        ]}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}

            {/* Center Circle with current angle */}
            <View style={styles.centerCircle}>
              <Ionicons name="navigate" size={20} color={Colors.primaryGreen} />
              <Text style={styles.centerAngleText}>
                {Math.round(currentSegment * SEGMENT_ANGLE)}°
              </Text>
            </View>
          </View>

          {/* Rotation Arrow Guide */}
          <Animated.View
            style={[
              styles.directionArrow,
              {
                transform: [
                  {
                    rotate: guideRotation.interpolate({
                      inputRange: [0, 360],
                      outputRange: ["0deg", "360deg"],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.arrowContainer}>
              <Ionicons name="arrow-up" size={24} color={Colors.primaryGreen} />
              <Text style={styles.arrowLabel}>Face here</Text>
            </View>
          </Animated.View>
        </View>

        {/* Camera Viewfinder Guidelines */}
        <View style={styles.viewfinderContainer} pointerEvents="none">
          {/* Horizontal level line */}
          <View style={styles.levelLine}>
            <View style={styles.levelLineLeft} />
            <View style={styles.levelCircle}>
              <View style={styles.levelCircleInner} />
            </View>
            <View style={styles.levelLineRight} />
          </View>

          {/* Corner brackets */}
          <View style={[styles.cornerBracket, styles.cornerTopLeft]} />
          <View style={[styles.cornerBracket, styles.cornerTopRight]} />
          <View style={[styles.cornerBracket, styles.cornerBottomLeft]} />
          <View style={[styles.cornerBracket, styles.cornerBottomRight]} />
        </View>

        {/* Tips Panel */}
        {showTips && (
          <View style={styles.tipsPanel}>
            <View style={styles.tipHeader}>
              <Ionicons name="bulb" size={16} color="#FFD700" />
              <Text style={styles.tipHeaderText}>Capture Tips</Text>
            </View>
            <View style={styles.tipRow}>
              <View style={styles.tipNumber}>
                <Text style={styles.tipNumberText}>1</Text>
              </View>
              <Text style={styles.tipText}>
                Rotate your body {SEGMENT_ANGLE}° after each shot
              </Text>
            </View>
            <View style={styles.tipRow}>
              <View style={styles.tipNumber}>
                <Text style={styles.tipNumberText}>2</Text>
              </View>
              <Text style={styles.tipText}>Keep phone level and steady</Text>
            </View>
            <View style={styles.tipRow}>
              <View style={styles.tipNumber}>
                <Text style={styles.tipNumberText}>3</Text>
              </View>
              <Text style={styles.tipText}>
                Overlap each photo slightly for best results
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
            style={styles.captureButtonOuter}
            onPress={handleCapture}
            activeOpacity={0.8}
            disabled={isCapturing}
          >
            <Animated.View
              style={[
                styles.captureButtonPulse,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />
            <View style={styles.captureButtonInner}>
              {isCapturing ? (
                <ActivityIndicator size="small" color={Colors.primaryGreen} />
              ) : (
                <View style={styles.captureButtonCore} />
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
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FF3B30",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 4,
  },
  liveIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },
  liveIndicatorText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 1,
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
    top: SCREEN_HEIGHT * 0.22,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 15,
  },
  progressRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
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
    width: 28,
    height: 28,
    borderRadius: 14,
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
  progressDotCurrent: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: Colors.primaryGreen,
    borderWidth: 2,
  },
  progressDotNumber: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.7)",
  },
  progressDotPulse: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryGreen,
    opacity: 0.4,
  },
  centerCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.primaryGreen,
  },
  centerAngleText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 2,
  },
  directionArrow: {
    position: "absolute",
    top: -40,
    alignItems: "center",
  },
  arrowContainer: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primaryGreen,
  },
  arrowLabel: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.primaryGreen,
    fontWeight: "600",
    marginTop: 2,
  },
  viewfinderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  levelLine: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
  },
  levelLineLeft: {
    width: 80,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  levelLineRight: {
    width: 80,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  levelCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },
  levelCircleInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primaryGreen,
  },
  cornerBracket: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  cornerTopLeft: {
    top: "25%",
    left: "10%",
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  cornerTopRight: {
    top: "25%",
    right: "10%",
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  cornerBottomLeft: {
    bottom: "35%",
    left: "10%",
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  cornerBottomRight: {
    bottom: "35%",
    right: "10%",
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  tipsPanel: {
    position: "absolute",
    bottom: "38%",
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
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
  tipNumber: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primaryGreen,
    justifyContent: "center",
    alignItems: "center",
  },
  tipNumberText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
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
  captureButtonPulse: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
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
  captureButtonCore: {
    width: 54,
    height: 54,
    borderRadius: 27,
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
