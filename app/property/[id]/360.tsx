import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  ScrollView,
  Image,
  Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Typography, Spacing } from "@/constants/design";
import { BottomNavigation, type TabItem } from "@/components/BottomNavigation";

const GALLERY_TABS: TabItem[] = [
  {
    id: "photos",
    label: "Photos",
    icon: "camera-outline",
    activeIcon: "camera",
  },
  {
    id: "videos",
    label: "Videos",
    icon: "videocam-outline",
    activeIcon: "videocam",
  },
  {
    id: "360",
    label: "360°",
    icon: "cube-outline",
    activeIcon: "cube",
  },
];

// Enhanced 360° panorama data
interface RoomData {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  thumbnail: string;
  panorama: string;
  description: string;
}

const ROOM_DATA: RoomData[] = [
  {
    id: "living",
    name: "Living Room",
    icon: "tv-outline",
    thumbnail:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop",
    panorama:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=2048&h=1024&fit=crop",
    description: "Spacious living area with natural light",
  },
  {
    id: "kitchen",
    name: "Kitchen",
    icon: "restaurant-outline",
    thumbnail:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop",
    panorama:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=2048&h=1024&fit=crop",
    description: "Modern kitchen with premium appliances",
  },
  {
    id: "bedroom1",
    name: "Master Bedroom",
    icon: "bed-outline",
    thumbnail:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop",
    panorama:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=2048&h=1024&fit=crop",
    description: "Luxurious master suite with ensuite",
  },
  {
    id: "bedroom2",
    name: "Bedroom 2",
    icon: "bed-outline",
    thumbnail:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop",
    panorama:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=2048&h=1024&fit=crop",
    description: "Comfortable guest bedroom",
  },
  {
    id: "bathroom",
    name: "Bathroom",
    icon: "water-outline",
    thumbnail:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop",
    panorama:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=2048&h=1024&fit=crop",
    description: "Modern bathroom with rain shower",
  },
];

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
  const params = useLocalSearchParams();
  const propertyId = params.id as string;
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const roomScrollRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [autoRotate, setAutoRotate] = useState(false);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showRoomSelector, setShowRoomSelector] = useState(true);

  const currentRoom = ROOM_DATA[currentRoomIndex];

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

  const handleTabPress = (tabId: string) => {
    if (tabId === "photos") {
      router.replace(`/property/${propertyId}/gallery?tab=photos`);
    } else if (tabId === "videos") {
      router.replace(`/property/${propertyId}/gallery?tab=videos`);
    } else if (tabId === "360") {
      // Already on 360
    }
  };

  const goToRoom = (index: number) => {
    setCurrentRoomIndex(index);
    // Scroll to center the selected room thumbnail
    roomScrollRef.current?.scrollTo({
      x: index * 90 - 100,
      animated: true,
    });
  };

  const goToPreviousRoom = () => {
    if (currentRoomIndex > 0) {
      goToRoom(currentRoomIndex - 1);
    }
  };

  const goToNextRoom = () => {
    if (currentRoomIndex < ROOM_DATA.length - 1) {
      goToRoom(currentRoomIndex + 1);
    }
  };

  useEffect(() => {
    // Reload panorama when room changes
    setIsLoading(true);
    setHasError(false);
  }, [currentRoomIndex]);

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
        {/* Top Gradient */}
        <LinearGradient
          colors={["rgba(0,0,0,0.8)", "transparent"]}
          style={[styles.topGradient, { paddingTop: insets.top }]}
          pointerEvents="box-none"
        />

        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top + Spacing.sm,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Title Section */}
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
              {ROOM_DATA.length} rooms available
            </Text>
          </View>

          {/* Auto-rotate Toggle */}
          <TouchableOpacity
            onPress={() => setAutoRotate(!autoRotate)}
            style={[styles.autoButton, autoRotate && styles.autoButtonActive]}
            activeOpacity={0.7}
          >
            <Ionicons
              name={autoRotate ? "sync" : "sync-outline"}
              size={18}
              color={autoRotate ? "#FFFFFF" : "rgba(255,255,255,0.8)"}
            />
          </TouchableOpacity>
        </View>

        {/* 360° Viewer */}
        <View style={styles.viewerContainer}>
          {hasError ? (
            <View style={styles.errorContainer}>
              <View style={styles.errorIconContainer}>
                <Ionicons
                  name="alert-circle-outline"
                  size={56}
                  color="#FF3B30"
                />
              </View>
              <Text style={styles.errorTitle}>Failed to Load</Text>
              <Text style={styles.errorText}>
                Unable to load the panorama view
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
                <Ionicons
                  name="refresh"
                  size={18}
                  color="#FFFFFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <WebView
                ref={webViewRef}
                source={{
                  html: getPanoramaHTML(currentRoom.panorama, autoRotate),
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
              />
              {isLoading && (
                <View style={styles.loadingOverlay}>
                  <View style={styles.loadingContent}>
                    <View style={styles.loadingSpinner}>
                      <ActivityIndicator size="large" color="#FFFFFF" />
                    </View>
                    <Text style={styles.loadingText}>
                      Loading {currentRoom.name}...
                    </Text>
                    <View style={styles.loadingBadge}>
                      <Ionicons name="cube" size={14} color="#FFFFFF" />
                      <Text style={styles.loadingBadgeText}>360° View</Text>
                    </View>
                  </View>
                </View>
              )}
            </>
          )}

          {/* Navigation Arrows */}
          {currentRoomIndex > 0 && (
            <TouchableOpacity
              style={styles.navArrowLeft}
              onPress={goToPreviousRoom}
              activeOpacity={0.7}
            >
              <View style={styles.navArrowContent}>
                <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          )}
          {currentRoomIndex < ROOM_DATA.length - 1 && (
            <TouchableOpacity
              style={styles.navArrowRight}
              onPress={goToNextRoom}
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
                <Ionicons
                  name={currentRoom.icon}
                  size={20}
                  color={Colors.primaryGreen}
                />
              </View>
              <View style={styles.roomInfoText}>
                <Text style={styles.roomInfoName}>{currentRoom.name}</Text>
                <Text style={styles.roomInfoDescription}>
                  {currentRoom.description}
                </Text>
              </View>
              <View style={styles.roomCounter}>
                <Text style={styles.roomCounterText}>
                  {currentRoomIndex + 1}/{ROOM_DATA.length}
                </Text>
              </View>
            </View>
          </View>

          {/* Touch Hint */}
          {!isLoading && !autoRotate && (
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
        <View style={styles.roomSelectorContainer}>
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
              {ROOM_DATA.map((room, index) => (
                <TouchableOpacity
                  key={room.id}
                  style={[
                    styles.roomThumbnailCard,
                    index === currentRoomIndex &&
                      styles.roomThumbnailCardActive,
                  ]}
                  onPress={() => goToRoom(index)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: room.thumbnail }}
                    style={styles.roomThumbnailImage}
                  />
                  <View style={styles.roomThumbnailOverlay} />
                  <View style={styles.roomThumbnailContent}>
                    <View
                      style={[
                        styles.roomThumbnailIcon,
                        index === currentRoomIndex &&
                          styles.roomThumbnailIconActive,
                      ]}
                    >
                      <Ionicons
                        name={room.icon}
                        size={14}
                        color={
                          index === currentRoomIndex
                            ? "#FFFFFF"
                            : "rgba(255,255,255,0.8)"
                        }
                      />
                    </View>
                    <Text
                      style={[
                        styles.roomThumbnailName,
                        index === currentRoomIndex &&
                          styles.roomThumbnailNameActive,
                      ]}
                      numberOfLines={1}
                    >
                      {room.name}
                    </Text>
                  </View>
                  {index === currentRoomIndex && (
                    <View style={styles.roomThumbnailActiveBorder} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Bottom Navigation */}
        <BottomNavigation
          tabs={GALLERY_TABS}
          activeTab="360"
          onTabPress={handleTabPress}
          variant="dark"
        />
      </View>
    </>
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
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
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
  autoButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  autoButtonActive: {
    backgroundColor: Colors.primaryGreen,
    borderColor: Colors.primaryGreen,
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
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
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
    bottom: 90,
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
});
