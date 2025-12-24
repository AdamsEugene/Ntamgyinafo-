import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  Platform,
  ActivityIndicator,
  ScrollView,
  Animated,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Typography, Spacing } from "@/constants/design";
import * as FileSystem from "expo-file-system/legacy";

export interface Hotspot {
  id: string;
  x: number; // Normalized position (0-1)
  y: number; // Normalized position (0-1)
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  targetSceneId?: string;
  type: "navigation" | "info";
  infoText?: string;
  // For Pannellum hotspots
  pitch?: number;
  yaw?: number;
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

// HTML template for 360° viewer using Pannellum
const getPanoramaHTML = (
  imageDataUrl: string, // Now accepts base64 data URL or regular URL
  autoRotate: boolean,
  hotspots: Hotspot[]
) => {
  // Convert hotspots to Pannellum format
  const pannellumHotspots = hotspots
    .filter((h) => h.pitch !== undefined && h.yaw !== undefined)
    .map((h) => ({
      pitch: h.pitch,
      yaw: h.yaw,
      type: "info",
      text: h.label || "",
      id: h.id,
    }));

  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <script src="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #000;
    }
    #panorama {
      width: 100%;
      height: 100%;
    }
    .pnlm-hotspot-base {
      border-radius: 50%;
    }
    .pnlm-hotspot.pnlm-info {
      background: rgba(34, 197, 94, 0.9);
      border: 2px solid white;
    }
  </style>
</head>
<body>
  <div id="panorama"></div>
  <script>
    var viewer = pannellum.viewer('panorama', {
      "type": "equirectangular",
      "panorama": "${imageDataUrl}",
      "autoLoad": true,
      "autoRotate": ${autoRotate ? 2 : 0},
      "autoRotateInactivityDelay": 3000,
      "autoRotateStopDelay": 5000,
      "compass": false,
      "showControls": false,
      "showFullscreenCtrl": false,
      "keyboardZoom": false,
      "mouseZoom": true,
      "hfov": 100,
      "minHfov": 50,
      "maxHfov": 120,
      "hotSpots": ${JSON.stringify(pannellumHotspots)}
    });
    
    window.pannellumViewer = viewer;
    
    viewer.on('load', function() {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'loaded' }));
      }
    });
    
    viewer.on('error', function(err) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: err }));
      }
    });
  </script>
</body>
</html>
`;
};

export function PanoramaViewer({
  scenes,
  initialSceneId,
  onClose,
  showControls = true,
  showThumbnails = true,
  autoRotate = false,
}: PanoramaViewerProps) {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const roomScrollRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [currentSceneId, setCurrentSceneId] = useState(
    initialSceneId || scenes[0]?.id
  );
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showRoomSelector, setShowRoomSelector] = useState(true);
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotate);
  const [showInfo, setShowInfo] = useState<Hotspot | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isConvertingImage, setIsConvertingImage] = useState(false);

  const currentSceneIndex = scenes.findIndex((s) => s.id === currentSceneId);
  const currentScene = scenes[currentSceneIndex] || scenes[0];

  // Convert local file URIs to base64 for WebView
  useEffect(() => {
    const convertImageToBase64 = async () => {
      if (!currentScene?.imageUrl) {
        setHasError(true);
        return;
      }

      const imageUrl = currentScene.imageUrl;

      // Check if it's a local file URI
      if (imageUrl.startsWith("file://") || imageUrl.startsWith("/")) {
        setIsConvertingImage(true);
        setIsLoading(true);

        try {
          // Read file as base64
          const filePath = imageUrl.startsWith("file://")
            ? imageUrl
            : `file://${imageUrl}`;

          const base64 = await FileSystem.readAsStringAsync(filePath, {
            encoding: "base64",
          });

          // Determine mime type
          const extension = imageUrl.split(".").pop()?.toLowerCase();
          const mimeType = extension === "png" ? "image/png" : "image/jpeg";

          setImageDataUrl(`data:${mimeType};base64,${base64}`);
          setHasError(false);
        } catch (error) {
          console.error("Failed to convert image to base64:", error);
          setHasError(true);
        } finally {
          setIsConvertingImage(false);
        }
      } else {
        // Remote URL - use directly
        setImageDataUrl(imageUrl);
        setHasError(false);
      }
    };

    convertImageToBase64();
  }, [currentScene?.imageUrl]);

  // Pulse animation for the 360° indicator
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // Handle scene change
  const goToScene = useCallback(
    (sceneId: string) => {
      if (sceneId === currentSceneId) return;
      setIsLoading(true);
      setHasError(false);
      setCurrentSceneId(sceneId);

      // Scroll to center the selected thumbnail
      const index = scenes.findIndex((s) => s.id === sceneId);
      roomScrollRef.current?.scrollTo({
        x: index * 90 - 100,
        animated: true,
      });
    },
    [currentSceneId, scenes]
  );

  const goToPreviousScene = useCallback(() => {
    if (currentSceneIndex > 0) {
      goToScene(scenes[currentSceneIndex - 1].id);
    }
  }, [currentSceneIndex, goToScene, scenes]);

  const goToNextScene = useCallback(() => {
    if (currentSceneIndex < scenes.length - 1) {
      goToScene(scenes[currentSceneIndex + 1].id);
    }
  }, [currentSceneIndex, goToScene, scenes]);

  // Toggle auto-rotate
  const toggleAutoRotate = useCallback(() => {
    const newValue = !isAutoRotating;
    setIsAutoRotating(newValue);

    if (webViewRef.current) {
      const script = `
        (function() {
          if (window.pannellumViewer) {
            try {
              if (${newValue}) {
                window.pannellumViewer.startAutoRotate(2, 3000);
              } else {
                window.pannellumViewer.stopAutoRotate();
              }
            } catch(e) {}
          }
        })();
        true;
      `;
      webViewRef.current.injectJavaScript(script);
    }
  }, [isAutoRotating]);

  // Handle WebView messages
  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "loaded") {
        setIsLoading(false);
        setHasError(false);
      } else if (data.type === "error") {
        setIsLoading(false);
        setHasError(true);
      }
    } catch (error) {
      console.error("Error parsing WebView message:", error);
    }
  }, []);

  const handleWebViewError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  }, []);

  if (!currentScene) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No scenes available</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButtonCenter}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Gradient */}
      <LinearGradient
        colors={["rgba(0,0,0,0.8)", "transparent"]}
        style={[styles.topGradient, { paddingTop: insets.top }]}
        pointerEvents="box-none"
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity
          onPress={onClose}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.badge360}>
            <Animated.View
              style={[
                styles.badge360Pulse,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />
            <Text style={styles.badge360Text}>360°</Text>
          </View>
          <Text style={styles.headerTitle}>Virtual Tour</Text>
          <Text style={styles.headerSubtitle}>
            {scenes.length} room{scenes.length !== 1 ? "s" : ""} available
          </Text>
        </View>

        {showControls && (
          <TouchableOpacity
            onPress={toggleAutoRotate}
            style={[
              styles.headerButton,
              isAutoRotating && styles.headerButtonActive,
            ]}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isAutoRotating ? "sync" : "sync-outline"}
              size={18}
              color={isAutoRotating ? "#FFFFFF" : "rgba(255,255,255,0.8)"}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* 360° Viewer */}
      <View style={styles.viewerContainer}>
        {hasError ? (
          <View style={styles.errorContainer}>
            <View style={styles.errorIconContainer}>
              <Ionicons name="alert-circle-outline" size={56} color="#FF3B30" />
            </View>
            <Text style={styles.errorTitle}>Failed to Load</Text>
            <Text style={styles.errorTextDescription}>
              Unable to load the panorama view
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Ionicons
                name="refresh"
                size={18}
                color="#FFFFFF"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : imageDataUrl ? (
          <>
            <WebView
              ref={webViewRef}
              source={{
                html: getPanoramaHTML(
                  imageDataUrl,
                  isAutoRotating,
                  currentScene.hotspots
                ),
              }}
              style={styles.webView}
              onMessage={handleWebViewMessage}
              onError={handleWebViewError}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              scalesPageToFit={true}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              originWhitelist={["*"]}
            />

            {isLoading && (
              <View style={styles.loadingOverlay}>
                <View style={styles.loadingContent}>
                  <View style={styles.loadingSpinner}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                  </View>
                  <Text style={styles.loadingText}>
                    Loading {currentScene.name}...
                  </Text>
                  <View style={styles.loadingBadge}>
                    <Ionicons name="cube" size={14} color="#FFFFFF" />
                    <Text style={styles.loadingBadgeText}>360° View</Text>
                  </View>
                </View>
              </View>
            )}
          </>
        ) : (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContent}>
              <View style={styles.loadingSpinner}>
                <ActivityIndicator size="large" color="#FFFFFF" />
              </View>
              <Text style={styles.loadingText}>
                {isConvertingImage ? "Preparing panorama..." : "Loading..."}
              </Text>
            </View>
          </View>
        )}

        {/* Navigation Arrows */}
        {currentSceneIndex > 0 && (
          <TouchableOpacity
            style={styles.navArrowLeft}
            onPress={goToPreviousScene}
            activeOpacity={0.7}
          >
            <View style={styles.navArrowContent}>
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        )}
        {currentSceneIndex < scenes.length - 1 && (
          <TouchableOpacity
            style={styles.navArrowRight}
            onPress={goToNextScene}
            activeOpacity={0.7}
          >
            <View style={styles.navArrowContent}>
              <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        )}

        {/* Room Info Overlay */}
        <View style={styles.roomInfoOverlay}>
          <View style={styles.roomInfoCard}>
            <View style={styles.roomInfoIcon}>
              <Ionicons name="cube" size={20} color={Colors.primaryGreen} />
            </View>
            <View style={styles.roomInfoText}>
              <Text style={styles.roomInfoName}>{currentScene.name}</Text>
              <Text style={styles.roomInfoDescription}>
                {currentScene.hotspots.length} hotspots
              </Text>
            </View>
            <View style={styles.roomCounter}>
              <Text style={styles.roomCounterText}>
                {currentSceneIndex + 1}/{scenes.length}
              </Text>
            </View>
          </View>
        </View>

        {/* Touch Hint */}
        {!isLoading && !isAutoRotating && (
          <View style={styles.touchHint}>
            <View style={styles.touchHintContent}>
              <Ionicons
                name="hand-left-outline"
                size={16}
                color="rgba(255,255,255,0.8)"
              />
              <Text style={styles.touchHintText}>Drag to explore</Text>
            </View>
          </View>
        )}
      </View>

      {/* Bottom Gradient */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.9)"]}
        style={styles.bottomGradient}
        pointerEvents="box-none"
      />

      {/* Room Selector */}
      {showThumbnails && scenes.length > 1 && (
        <View
          style={[styles.roomSelectorContainer, { bottom: insets.bottom + 20 }]}
        >
          <TouchableOpacity
            style={styles.roomSelectorToggle}
            onPress={() => setShowRoomSelector(!showRoomSelector)}
            activeOpacity={0.7}
          >
            <Text style={styles.roomSelectorTitle}>Select Room</Text>
            <Ionicons
              name={showRoomSelector ? "chevron-down" : "chevron-up"}
              size={18}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          {showRoomSelector && (
            <ScrollView
              ref={roomScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.roomSelectorList}
            >
              {scenes.map((scene, index) => (
                <TouchableOpacity
                  key={scene.id}
                  style={[
                    styles.roomThumbnailCard,
                    index === currentSceneIndex &&
                      styles.roomThumbnailCardActive,
                  ]}
                  onPress={() => goToScene(scene.id)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: scene.thumbnail || scene.imageUrl }}
                    style={styles.roomThumbnailImage}
                  />
                  <View style={styles.roomThumbnailOverlay} />
                  <View style={styles.roomThumbnailContent}>
                    <View
                      style={[
                        styles.roomThumbnailIcon,
                        index === currentSceneIndex &&
                          styles.roomThumbnailIconActive,
                      ]}
                    >
                      <Ionicons
                        name="cube"
                        size={14}
                        color={
                          index === currentSceneIndex
                            ? "#FFFFFF"
                            : "rgba(255,255,255,0.8)"
                        }
                      />
                    </View>
                    <Text
                      style={[
                        styles.roomThumbnailName,
                        index === currentSceneIndex &&
                          styles.roomThumbnailNameActive,
                      ]}
                      numberOfLines={1}
                    >
                      {scene.name}
                    </Text>
                  </View>
                  {index === currentSceneIndex && (
                    <View style={styles.roomThumbnailActiveBorder} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
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
              <Text style={styles.infoCloseButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    zIndex: 50,
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 250,
    zIndex: 50,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    zIndex: 100,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  headerButtonActive: {
    backgroundColor: Colors.primaryGreen,
    borderColor: Colors.primaryGreen,
  },
  headerCenter: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: Spacing.md,
  },
  badge360: {
    position: "relative",
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryGreen,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  badge360Pulse: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryGreen,
    opacity: 0.3,
  },
  badge360Text: {
    ...Typography.labelMedium,
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  headerTitle: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  headerSubtitle: {
    ...Typography.caption,
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 2,
  },
  viewerContainer: {
    flex: 1,
    position: "relative",
  },
  webView: {
    flex: 1,
    backgroundColor: "#000000",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingSpinner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  loadingText: {
    ...Typography.bodyMedium,
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  loadingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: Spacing.md,
    backgroundColor: Colors.primaryGreen,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
  },
  loadingBadgeText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  errorIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 59, 48, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  errorTitle: {
    ...Typography.titleLarge,
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: Spacing.sm,
  },
  errorText: {
    ...Typography.bodyMedium,
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
  },
  errorTextDescription: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
  closeButtonCenter: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primaryGreen,
    borderRadius: 12,
  },
  closeButtonText: {
    ...Typography.labelMedium,
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  retryButton: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.primaryGreen,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  retryButtonText: {
    ...Typography.labelLarge,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  navArrowLeft: {
    position: "absolute",
    left: Spacing.md,
    top: "50%",
    marginTop: -25,
    zIndex: 30,
  },
  navArrowRight: {
    position: "absolute",
    right: Spacing.md,
    top: "50%",
    marginTop: -25,
    zIndex: 30,
  },
  navArrowContent: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  roomInfoOverlay: {
    position: "absolute",
    top: 120,
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 30,
  },
  roomInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  roomInfoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  roomInfoText: {
    flex: 1,
  },
  roomInfoName: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  roomInfoDescription: {
    ...Typography.caption,
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 2,
  },
  roomCounter: {
    backgroundColor: Colors.primaryGreen,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 10,
  },
  roomCounterText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  touchHint: {
    position: "absolute",
    bottom: 180,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 30,
  },
  touchHintContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
  },
  touchHintText: {
    ...Typography.caption,
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  roomSelectorContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: Spacing.lg,
  },
  roomSelectorToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  roomSelectorTitle: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
  },
  roomSelectorList: {
    paddingHorizontal: Spacing.xs,
    gap: Spacing.sm,
  },
  roomThumbnailCard: {
    width: 80,
    height: 100,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  roomThumbnailCardActive: {
    transform: [{ scale: 1.05 }],
  },
  roomThumbnailImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  roomThumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  roomThumbnailContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 6,
    alignItems: "center",
  },
  roomThumbnailIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  roomThumbnailIconActive: {
    backgroundColor: Colors.primaryGreen,
  },
  roomThumbnailName: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  roomThumbnailNameActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  roomThumbnailActiveBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: Colors.primaryGreen,
    borderRadius: 12,
  },
  infoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
    zIndex: 200,
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
  infoCloseButtonText: {
    ...Typography.labelMedium,
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default PanoramaViewer;
