import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
  TouchableOpacity,
  Text,
  Image,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Typography, Spacing } from "@/constants/design";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Field of view settings
const DEFAULT_FOV = 75;
const MIN_FOV = 30; // Max zoom in
const MAX_FOV = 100; // Max zoom out

// Rotation speed multiplier
const ROTATION_SENSITIVITY = 0.15;

export interface Hotspot {
  id: string;
  x: number; // Normalized position (0-1)
  y: number; // Normalized position (0-1)
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  targetSceneId?: string;
  type: "navigation" | "info";
  infoText?: string;
}

export interface Scene {
  id: string;
  name: string;
  imageUrl: string;
  thumbnail?: string;
  hotspots: Hotspot[];
  initialRotation?: { x: number; y: number };
}

export interface PanoramaViewerProps {
  scenes: Scene[];
  initialSceneId?: string;
  onClose?: () => void;
  showControls?: boolean;
  showThumbnails?: boolean;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
}

export function PanoramaViewer({
  scenes,
  initialSceneId,
  onClose,
  showControls = true,
  showThumbnails = true,
  autoRotate = false,
  autoRotateSpeed = 0.1,
}: PanoramaViewerProps) {
  const insets = useSafeAreaInsets();
  const [currentSceneId, setCurrentSceneId] = useState(
    initialSceneId || scenes[0]?.id
  );
  const [isLoading, setIsLoading] = useState(true);
  const [showInfo, setShowInfo] = useState<Hotspot | null>(null);
  const [showSceneList, setShowSceneList] = useState(false);

  // Rotation state using Animated values for smooth performance
  const rotationX = useRef(new Animated.Value(0)).current;
  const rotationY = useRef(new Animated.Value(0)).current;
  const fov = useRef(new Animated.Value(DEFAULT_FOV)).current;

  // Track current values for pan calculations
  const currentRotationX = useRef(0);
  const currentRotationY = useRef(0);
  const currentFov = useRef(DEFAULT_FOV);

  // Touch tracking
  const lastTouchDistance = useRef(0);
  const isZooming = useRef(false);

  const currentScene = scenes.find((s) => s.id === currentSceneId) || scenes[0];

  // Auto-rotate effect
  useEffect(() => {
    if (!autoRotate || isLoading) return;

    const autoRotateInterval = setInterval(() => {
      const newRotation = currentRotationY.current + autoRotateSpeed;
      currentRotationY.current = newRotation;
      rotationY.setValue(newRotation);
    }, 16); // ~60fps

    return () => clearInterval(autoRotateInterval);
  }, [autoRotate, autoRotateSpeed, isLoading, rotationY]);

  // Calculate distance between two touch points
  const getDistance = (touches: { pageX: number; pageY: number }[]): number => {
    if (touches.length < 2) return 0;
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Pan responder for touch handling
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length === 2) {
          isZooming.current = true;
          lastTouchDistance.current = getDistance(touches as any);
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;

        if (touches.length === 2 && isZooming.current) {
          // Pinch zoom
          const distance = getDistance(touches as any);
          if (lastTouchDistance.current > 0) {
            const scale = distance / lastTouchDistance.current;
            const newFov = Math.max(
              MIN_FOV,
              Math.min(MAX_FOV, currentFov.current / scale)
            );
            currentFov.current = newFov;
            fov.setValue(newFov);
          }
          lastTouchDistance.current = distance;
        } else if (touches.length === 1 && !isZooming.current) {
          // Pan rotation
          const dx = gestureState.dx * ROTATION_SENSITIVITY;
          const dy = gestureState.dy * ROTATION_SENSITIVITY;

          // Horizontal rotation (Y axis) - unlimited
          const newRotationY = currentRotationY.current - dx;
          rotationY.setValue(newRotationY);

          // Vertical rotation (X axis) - limited to prevent flip
          const newRotationX = Math.max(
            -80,
            Math.min(80, currentRotationX.current + dy)
          );
          rotationX.setValue(newRotationX);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Update current values
        currentRotationY.current -= gestureState.dx * ROTATION_SENSITIVITY;
        currentRotationX.current = Math.max(
          -80,
          Math.min(
            80,
            currentRotationX.current + gestureState.dy * ROTATION_SENSITIVITY
          )
        );

        isZooming.current = false;
        lastTouchDistance.current = 0;
      },
    })
  ).current;

  // Handle scene navigation via hotspot
  const handleHotspotPress = useCallback(
    (hotspot: Hotspot) => {
      if (hotspot.type === "navigation" && hotspot.targetSceneId) {
        setIsLoading(true);
        // Reset rotation for new scene
        const targetScene = scenes.find((s) => s.id === hotspot.targetSceneId);
        if (targetScene?.initialRotation) {
          currentRotationX.current = targetScene.initialRotation.x;
          currentRotationY.current = targetScene.initialRotation.y;
          rotationX.setValue(targetScene.initialRotation.x);
          rotationY.setValue(targetScene.initialRotation.y);
        } else {
          currentRotationX.current = 0;
          currentRotationY.current = 0;
          rotationX.setValue(0);
          rotationY.setValue(0);
        }
        setCurrentSceneId(hotspot.targetSceneId);
      } else if (hotspot.type === "info") {
        setShowInfo(hotspot);
      }
    },
    [scenes, rotationX, rotationY]
  );

  // Handle scene selection from thumbnail list
  const handleSceneSelect = useCallback(
    (sceneId: string) => {
      if (sceneId === currentSceneId) return;
      setIsLoading(true);
      setShowSceneList(false);

      const targetScene = scenes.find((s) => s.id === sceneId);
      if (targetScene?.initialRotation) {
        currentRotationX.current = targetScene.initialRotation.x;
        currentRotationY.current = targetScene.initialRotation.y;
        rotationX.setValue(targetScene.initialRotation.x);
        rotationY.setValue(targetScene.initialRotation.y);
      } else {
        currentRotationX.current = 0;
        currentRotationY.current = 0;
        rotationX.setValue(0);
        rotationY.setValue(0);
      }
      setCurrentSceneId(sceneId);
    },
    [currentSceneId, scenes, rotationX, rotationY]
  );

  // Zoom controls
  const handleZoom = useCallback(
    (zoomIn: boolean) => {
      const step = 10;
      const newFov = zoomIn
        ? Math.max(MIN_FOV, currentFov.current - step)
        : Math.min(MAX_FOV, currentFov.current + step);

      currentFov.current = newFov;
      Animated.spring(fov, {
        toValue: newFov,
        useNativeDriver: false,
        tension: 100,
        friction: 12,
      }).start();
    },
    [fov]
  );

  // Reset view
  const handleResetView = useCallback(() => {
    Animated.parallel([
      Animated.spring(rotationX, {
        toValue: 0,
        useNativeDriver: false,
        tension: 80,
        friction: 12,
      }),
      Animated.spring(rotationY, {
        toValue: 0,
        useNativeDriver: false,
        tension: 80,
        friction: 12,
      }),
      Animated.spring(fov, {
        toValue: DEFAULT_FOV,
        useNativeDriver: false,
        tension: 80,
        friction: 12,
      }),
    ]).start(() => {
      currentRotationX.current = 0;
      currentRotationY.current = 0;
      currentFov.current = DEFAULT_FOV;
    });
  }, [rotationX, rotationY, fov]);

  return (
    <View style={styles.container}>
      {/* Panorama Image Container */}
      <Animated.View
        style={[styles.panoramaContainer]}
        {...panResponder.panHandlers}
      >
        {/* Using CSS 3D transforms to create panorama effect */}
        <Animated.View
          style={[
            styles.panoramaWrapper,
            {
              transform: [
                { perspective: 1000 },
                {
                  rotateX: rotationX.interpolate({
                    inputRange: [-80, 80],
                    outputRange: ["-80deg", "80deg"],
                  }),
                },
                {
                  rotateY: rotationY.interpolate({
                    inputRange: [-360, 360],
                    outputRange: ["-360deg", "360deg"],
                  }),
                },
                {
                  scale: fov.interpolate({
                    inputRange: [MIN_FOV, MAX_FOV],
                    outputRange: [1.5, 0.8],
                  }),
                },
              ],
            },
          ]}
        >
          <Image
            source={{ uri: currentScene?.imageUrl }}
            style={styles.panoramaImage}
            resizeMode="cover"
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
          />
        </Animated.View>

        {/* Loading Overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingIndicator}>
              <Ionicons
                name="reload"
                size={32}
                color={Colors.primaryGreen}
                style={styles.loadingIcon}
              />
              <Text style={styles.loadingText}>Loading panorama...</Text>
            </View>
          </View>
        )}

        {/* Hotspots */}
        {!isLoading &&
          currentScene?.hotspots.map((hotspot) => (
            <TouchableOpacity
              key={hotspot.id}
              style={[
                styles.hotspot,
                {
                  left: `${hotspot.x * 100}%`,
                  top: `${hotspot.y * 100}%`,
                },
                hotspot.type === "navigation"
                  ? styles.navigationHotspot
                  : styles.infoHotspot,
              ]}
              onPress={() => handleHotspotPress(hotspot)}
              activeOpacity={0.8}
            >
              <View style={styles.hotspotInner}>
                <Ionicons
                  name={
                    hotspot.icon ||
                    (hotspot.type === "navigation"
                      ? "arrow-forward-circle"
                      : "information-circle")
                  }
                  size={24}
                  color="#FFFFFF"
                />
              </View>
              {hotspot.label && (
                <View style={styles.hotspotLabel}>
                  <Text style={styles.hotspotLabelText}>{hotspot.label}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
      </Animated.View>

      {/* Header Controls */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.sceneTitle}>{currentScene?.name}</Text>
          <Text style={styles.sceneCount}>
            {scenes.findIndex((s) => s.id === currentSceneId) + 1} of{" "}
            {scenes.length}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setShowSceneList(!showSceneList)}
          activeOpacity={0.8}
        >
          <Ionicons name="layers" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Zoom Controls */}
      {showControls && (
        <View style={[styles.zoomControls, { bottom: insets.bottom + 100 }]}>
          <TouchableOpacity
            style={styles.zoomButton}
            onPress={() => handleZoom(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.zoomButton}
            onPress={handleResetView}
            activeOpacity={0.8}
          >
            <Ionicons name="locate" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.zoomButton}
            onPress={() => handleZoom(false)}
            activeOpacity={0.8}
          >
            <Ionicons name="remove" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Compass Indicator */}
      <Animated.View
        style={[
          styles.compass,
          {
            top: insets.top + 70,
            transform: [
              {
                rotate: rotationY.interpolate({
                  inputRange: [-360, 360],
                  outputRange: ["360deg", "-360deg"],
                }),
              },
            ],
          },
        ]}
      >
        <Ionicons name="navigate" size={24} color={Colors.primaryGreen} />
      </Animated.View>

      {/* Scene Thumbnails */}
      {showThumbnails && showSceneList && (
        <View style={[styles.sceneList, { bottom: insets.bottom + 20 }]}>
          <ScrollableSceneList
            scenes={scenes}
            currentSceneId={currentSceneId}
            onSelect={handleSceneSelect}
          />
        </View>
      )}

      {/* Info Popup */}
      {showInfo && (
        <TouchableOpacity
          style={styles.infoOverlay}
          activeOpacity={1}
          onPress={() => setShowInfo(null)}
        >
          <View style={styles.infoPopup}>
            <View style={styles.infoHeader}>
              <Ionicons
                name="information-circle"
                size={24}
                color={Colors.primaryGreen}
              />
              <Text style={styles.infoTitle}>{showInfo.label || "Info"}</Text>
            </View>
            <Text style={styles.infoText}>
              {showInfo.infoText || "No additional information available."}
            </Text>
            <TouchableOpacity
              style={styles.infoCloseButton}
              onPress={() => setShowInfo(null)}
            >
              <Text style={styles.infoCloseText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      {/* Usage Hint - shows briefly */}
      <View style={styles.usageHint}>
        <Text style={styles.usageHintText}>
          Drag to look around • Pinch to zoom
        </Text>
      </View>
    </View>
  );
}

// Scrollable scene list component
function ScrollableSceneList({
  scenes,
  currentSceneId,
  onSelect,
}: {
  scenes: Scene[];
  currentSceneId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <View style={styles.sceneListContainer}>
      {scenes.map((scene) => (
        <TouchableOpacity
          key={scene.id}
          style={[
            styles.sceneThumbnail,
            currentSceneId === scene.id && styles.sceneThumbnailActive,
          ]}
          onPress={() => onSelect(scene.id)}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: scene.thumbnail || scene.imageUrl }}
            style={styles.sceneThumbnailImage}
          />
          <View style={styles.sceneThumbnailOverlay}>
            <Text style={styles.sceneThumbnailText} numberOfLines={1}>
              {scene.name}
            </Text>
          </View>
          {currentSceneId === scene.id && (
            <View style={styles.sceneThumbnailCheck}>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  panoramaContainer: {
    flex: 1,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  panoramaWrapper: {
    width: SCREEN_WIDTH * 2,
    height: SCREEN_HEIGHT * 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  panoramaImage: {
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingIndicator: {
    alignItems: "center",
    gap: Spacing.md,
  },
  loadingIcon: {
    transform: [{ rotate: "0deg" }],
  },
  loadingText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: "#FFFFFF",
  },
  // Header
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    alignItems: "center",
    flex: 1,
  },
  sceneTitle: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  sceneCount: {
    ...Typography.caption,
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
  },
  // Hotspots
  hotspot: {
    position: "absolute",
    transform: [{ translateX: -20 }, { translateY: -20 }],
    alignItems: "center",
  },
  hotspotInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  navigationHotspot: {},
  infoHotspot: {},
  hotspotLabel: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 6,
  },
  hotspotLabelText: {
    ...Typography.caption,
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  // Zoom Controls
  zoomControls: {
    position: "absolute",
    right: Spacing.lg,
    gap: Spacing.sm,
  },
  zoomButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  // Compass
  compass: {
    position: "absolute",
    right: Spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  // Scene List
  sceneList: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  sceneListContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  sceneThumbnail: {
    width: 80,
    height: 60,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  sceneThumbnailActive: {
    borderColor: Colors.primaryGreen,
  },
  sceneThumbnailImage: {
    width: "100%",
    height: "100%",
  },
  sceneThumbnailOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  sceneThumbnailText: {
    ...Typography.caption,
    fontSize: 9,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  sceneThumbnailCheck: {
    position: "absolute",
    top: 4,
    right: 4,
  },
  // Info Popup
  infoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  infoPopup: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.xl,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 15,
      },
    }),
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  infoTitle: {
    ...Typography.titleMedium,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  infoText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  infoCloseButton: {
    backgroundColor: Colors.primaryGreen,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: "center",
  },
  infoCloseText: {
    ...Typography.labelMedium,
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Usage Hint
  usageHint: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  usageHintText: {
    ...Typography.caption,
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
});

export default PanoramaViewer;
