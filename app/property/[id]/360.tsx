import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { WebView } from "react-native-webview";
import { Colors, Typography, Spacing } from "@/constants/design";

// Sample 360° panorama images - replace with actual URLs from your API
const PANORAMA_IMAGES: { [key: string]: string } = {
  "Living Room":
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=2048&h=1024&fit=crop",
  Kitchen:
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=2048&h=1024&fit=crop",
  "Bedroom 1":
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=2048&h=1024&fit=crop",
  "Bedroom 2":
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=2048&h=1024&fit=crop",
  Bathroom:
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=2048&h=1024&fit=crop",
};

// HTML template for 360° viewer using Pannellum
const getPanoramaHTML = (imageUrl: string, autoRotate: boolean) => `
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
  </style>
</head>
<body>
  <div id="panorama"></div>
  <script>
    var viewer = pannellum.viewer('panorama', {
      "type": "equirectangular",
      "panorama": "${imageUrl}",
      "autoLoad": true,
      "autoRotate": ${autoRotate ? 2 : 0},
      "autoRotateInactivityDelay": 3000,
      "autoRotateStopDelay": 5000,
      "compass": false,
      "showControls": false,
      "showFullscreenCtrl": false,
      "keyboardZoom": false,
      "mouseZoom": false,
      "hfov": 100,
      "minHfov": 50,
      "maxHfov": 120
    });
    
    // Make viewer accessible globally for auto-rotate control
    window.pannellumViewer = viewer;
    
    // Handle touch events for mobile
    var touchStartX = 0;
    var touchStartY = 0;
    var isDragging = false;
    
    document.addEventListener('touchstart', function(e) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      isDragging = false;
    });
    
    document.addEventListener('touchmove', function(e) {
      if (!isDragging) {
        var deltaX = Math.abs(e.touches[0].clientX - touchStartX);
        var deltaY = Math.abs(e.touches[0].clientY - touchStartY);
        if (deltaX > 5 || deltaY > 5) {
          isDragging = true;
        }
      }
    });
    
    // Notify React Native when panorama is loaded
    viewer.on('load', function() {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'loaded' }));
      }
    });
  </script>
</body>
</html>
`;

export default function Property360ViewerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const [currentRoom, setCurrentRoom] = useState("Living Room");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const rooms = [
    "Living Room",
    "Kitchen",
    "Bedroom 1",
    "Bedroom 2",
    "Bathroom",
  ];

  const currentImageUrl =
    PANORAMA_IMAGES[currentRoom] || PANORAMA_IMAGES["Living Room"];

  useEffect(() => {
    // Reload panorama when room changes
    setIsLoading(true);
    setHasError(false);
  }, [currentRoom]);

  useEffect(() => {
    // Update auto-rotate when toggled without reloading
    if (webViewRef.current && !isLoading) {
      // Use a small delay to ensure viewer is ready
      const timeoutId = setTimeout(() => {
        const script = `
          (function() {
            if (window.pannellumViewer) {
              try {
                if (${autoRotate}) {
                  window.pannellumViewer.startAutoRotate(2, 3000);
                } else {
                  window.pannellumViewer.stopAutoRotate();
                }
              } catch(e) {
                console.error('Error toggling auto-rotate:', e);
              }
            }
          })();
          true; // Required for iOS
        `;
        webViewRef.current?.injectJavaScript(script);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [autoRotate, isLoading]);

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "loaded") {
        setIsLoading(false);
        setHasError(false);
      }
    } catch (error) {
      console.error("Error parsing WebView message:", error);
    }
  };

  const handleWebViewError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <>
      <StatusBar style="light" />
      <View style={styles.container}>
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top + Spacing.sm,
              paddingBottom: Spacing.md,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.placeholder} />
          <TouchableOpacity
            onPress={() => setAutoRotate(!autoRotate)}
            style={styles.autoButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name={autoRotate ? "sync" : "sync-outline"}
              size={20}
              color={autoRotate ? Colors.primaryGreen : "#FFFFFF"}
            />
            <Text style={styles.autoButtonText}>
              {autoRotate ? "Auto" : "Manual"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 360° Viewer */}
        <View style={styles.viewerContainer}>
          {hasError ? (
            <View style={styles.errorContainer}>
              <Ionicons
                name="alert-circle-outline"
                size={80}
                color={Colors.textSecondary}
              />
              <Text style={styles.errorText}>Failed to load panorama</Text>
              <Text style={styles.errorSubtext}>
                Please check your internet connection
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  setHasError(false);
                  setIsLoading(true);
                  if (webViewRef.current) {
                    webViewRef.current.reload();
                  }
                }}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <WebView
                ref={webViewRef}
                source={{ html: getPanoramaHTML(currentImageUrl, autoRotate) }}
                style={styles.webView}
                onMessage={handleWebViewMessage}
                onError={handleWebViewError}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                scalesPageToFit={true}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
              />
              {isLoading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color={Colors.primaryGreen} />
                  <Text style={styles.loadingText}>Loading panorama...</Text>
                </View>
              )}
            </>
          )}

          {/* Room Navigation Controls */}
          <View style={styles.viewerControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => {
                const currentIndex = rooms.indexOf(currentRoom);
                if (currentIndex > 0) {
                  setCurrentRoom(rooms[currentIndex - 1]);
                }
              }}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.roomIndicator}>
              <Text style={styles.roomText}>{currentRoom}</Text>
            </View>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => {
                const currentIndex = rooms.indexOf(currentRoom);
                if (currentIndex < rooms.length - 1) {
                  setCurrentRoom(rooms[currentIndex + 1]);
                }
              }}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Navigation Hint */}
        <View
          style={[
            styles.navigationHint,
            { paddingBottom: insets.bottom + Spacing.md },
          ]}
        >
          <Text style={styles.hintText}>
            {autoRotate
              ? "🔄 Auto-rotating"
              : "👆 Drag to look around • ← → Change room"}
          </Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
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
    zIndex: 100,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    flex: 1,
  },
  autoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  autoButtonText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
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
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  loadingText: {
    ...Typography.bodyMedium,
    fontSize: 16,
    color: "#FFFFFF",
    marginTop: Spacing.md,
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  errorText: {
    ...Typography.headlineMedium,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    textAlign: "center",
  },
  errorSubtext: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  retryButton: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.primaryGreen,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  retryButtonText: {
    ...Typography.labelLarge,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  viewerControls: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.lg,
    zIndex: 20,
    paddingHorizontal: Spacing.xl,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  roomIndicator: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primaryGreen,
  },
  roomText: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primaryGreen,
  },
  navigationHint: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingTop: Spacing.md,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  hintText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
