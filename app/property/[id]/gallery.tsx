import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Platform,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  PinchGestureHandler,
  PanGestureHandler,
  TapGestureHandler,
  State,
} from "react-native-gesture-handler";
import { Colors, Typography, Spacing } from "@/constants/design";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Mock data - replace with actual API call
const MOCK_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
];

const MOCK_VIDEOS = [
  {
    id: "1",
    thumbnail:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
    title: "Property Tour",
  },
  {
    id: "2",
    thumbnail:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
    title: "Living Room",
  },
  {
    id: "3",
    thumbnail:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
    title: "Kitchen",
  },
];

type TabType = "photos" | "videos" | "360";

export default function PropertyGalleryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const initialTab = (params.tab as TabType) || "photos";
  const initialIndex = params.index ? parseInt(params.index as string, 10) : 0;

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [currentImageIndex, setCurrentImageIndex] = useState(initialIndex);
  const [imageScales, setImageScales] = useState<{
    [key: number]: Animated.ValueXY;
  }>({});
  const [imageRotations, setImageRotations] = useState<{
    [key: number]: Animated.Value;
  }>({});
  const [imageTranslations, setImageTranslations] = useState<{
    [key: number]: Animated.ValueXY;
  }>({});
  const doubleTapRefs = useRef<{ [key: number]: any }>({});
  const pinchRefs = useRef<{ [key: number]: any }>({});
  const panRefs = useRef<{ [key: number]: any }>({});

  const handleImageScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentImageIndex(index);
    // Reset zoom/rotation when changing images
    resetImageTransform(index);
  };

  const getImageScale = (index: number) => {
    if (!imageScales[index]) {
      imageScales[index] = new Animated.ValueXY({ x: 1, y: 1 });
      setImageScales({ ...imageScales });
    }
    return imageScales[index];
  };

  const getImageRotation = (index: number) => {
    if (!imageRotations[index]) {
      imageRotations[index] = new Animated.Value(0);
      setImageRotations({ ...imageRotations });
    }
    return imageRotations[index];
  };

  const resetImageTransform = (index: number) => {
    if (imageScales[index]) {
      Animated.parallel([
        Animated.spring(imageScales[index], {
          toValue: { x: 1, y: 1 },
          useNativeDriver: true,
        }),
        Animated.spring(imageRotations[index] || new Animated.Value(0), {
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleDoubleTap = (index: number) => {
    const scale = getImageScale(index);
    const currentScale = (scale.x as any)._value || 1;

    Animated.spring(scale, {
      toValue: currentScale > 1 ? { x: 1, y: 1 } : { x: 2, y: 2 },
      useNativeDriver: true,
    }).start();
  };

  const handlePinch = (index: number, event: any) => {
    const scale = getImageScale(index);
    const newScale = event.nativeEvent.scale;

    scale.setValue({
      x: Math.max(1, Math.min(newScale, 4)),
      y: Math.max(1, Math.min(newScale, 4)),
    });
  };

  const handlePan = (index: number, event: any) => {
    const scale = getImageScale(index);
    const currentScale = (scale.x as any)._value || 1;

    // Pan is handled automatically by the gesture handler
    // Scale is maintained during pan
    if (currentScale > 1) {
      scale.setValue({
        x: currentScale,
        y: currentScale,
      });
    }
  };

  const handleRotate = (index: number) => {
    const rotation = getImageRotation(index);
    const currentRotation = (rotation as any)._value || 0;

    Animated.spring(rotation, {
      toValue: currentRotation + 90,
      useNativeDriver: true,
    }).start();
  };

  const renderZoomableImage = (item: string, index: number) => {
    const scale = getImageScale(index);
    const rotation = getImageRotation(index);

    const rotateInterpolate = rotation.interpolate({
      inputRange: [0, 360],
      outputRange: ["0deg", "360deg"],
    });

    // Initialize refs if they don't exist
    if (!doubleTapRefs.current[index]) {
      doubleTapRefs.current[index] = React.createRef();
    }
    if (!pinchRefs.current[index]) {
      pinchRefs.current[index] = React.createRef();
    }
    if (!panRefs.current[index]) {
      panRefs.current[index] = React.createRef();
    }

    return (
      <View style={styles.imageContainer} key={`photo-${index}`}>
        <TapGestureHandler
          ref={doubleTapRefs.current[index]}
          numberOfTaps={2}
          onActivated={() => handleDoubleTap(index)}
        >
          <Animated.View style={styles.imageWrapper}>
            <PinchGestureHandler
              ref={pinchRefs.current[index]}
              onGestureEvent={(event) => handlePinch(index, event)}
              onHandlerStateChange={(event) => {
                if (event.nativeEvent.oldState === State.ACTIVE) {
                  const currentScale = (scale.x as any)._value || 1;
                  if (currentScale < 1) {
                    Animated.spring(scale, {
                      toValue: { x: 1, y: 1 },
                      useNativeDriver: true,
                    }).start();
                  } else if (currentScale > 4) {
                    Animated.spring(scale, {
                      toValue: { x: 4, y: 4 },
                      useNativeDriver: true,
                    }).start();
                  }
                }
              }}
              simultaneousHandlers={[panRefs.current[index]]}
            >
              <Animated.View style={styles.gestureContainer}>
                <PanGestureHandler
                  ref={panRefs.current[index]}
                  onGestureEvent={(event) => handlePan(index, event)}
                  minPointers={1}
                  maxPointers={1}
                  simultaneousHandlers={[pinchRefs.current[index]]}
                >
                  <Animated.View style={styles.gestureContainer}>
                    <Animated.Image
                      source={{ uri: item }}
                      style={[
                        styles.fullImage,
                        {
                          transform: [
                            { scaleX: scale.x },
                            { scaleY: scale.y },
                            { rotate: rotateInterpolate },
                          ],
                        },
                      ]}
                      resizeMode="cover"
                    />
                  </Animated.View>
                </PanGestureHandler>
              </Animated.View>
            </PinchGestureHandler>
          </Animated.View>
        </TapGestureHandler>

        {/* Image Controls */}
        <View style={styles.imageControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => resetImageTransform(index)}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleRotate(index)}
            activeOpacity={0.7}
          >
            <Ionicons name="sync-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderPhotos = () => (
    <View style={styles.tabContent}>
      <FlatList
        data={MOCK_IMAGES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleImageScroll}
        scrollEventThrottle={16}
        initialScrollIndex={currentImageIndex}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        keyExtractor={(item, index) => `photo-${index}`}
        renderItem={({ item, index }) => renderZoomableImage(item, index)}
        scrollEnabled={true}
      />
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          {currentImageIndex + 1}/{MOCK_IMAGES.length}
        </Text>
      </View>
    </View>
  );

  const renderVideos = () => (
    <ScrollView
      style={styles.tabContent}
      contentContainerStyle={styles.videoContainer}
    >
      {MOCK_VIDEOS.map((video, index) => (
        <TouchableOpacity
          key={video.id}
          style={styles.videoCard}
          activeOpacity={0.8}
          onPress={() => {
            // TODO: Open video player
            console.log("Play video:", video.id);
          }}
        >
          <Image
            source={{ uri: video.thumbnail }}
            style={styles.videoThumbnail}
          />
          <View style={styles.videoOverlay}>
            <View style={styles.playButton}>
              <Ionicons name="play" size={40} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.videoTitle}>{video.title}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const render360 = () => (
    <View style={styles.tabContent}>
      <View style={styles.placeholder360}>
        <Ionicons name="cube-outline" size={80} color={Colors.textSecondary} />
        <Text style={styles.placeholderText}>360° View</Text>
        <Text style={styles.placeholderSubtext}>
          Interactive 360° panorama viewer
        </Text>
        <TouchableOpacity
          style={styles.view360Button}
          onPress={() => {
            router.push(`/property/${params.id}/360`);
          }}
        >
          <Text style={styles.view360ButtonText}>Open 360° Viewer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <StatusBar style="light" />
      <View style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.backButton,
            {
              top: insets.top + Spacing.md,
            },
          ]}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Content */}
        {activeTab === "photos" && renderPhotos()}
        {activeTab === "videos" && renderVideos()}
        {activeTab === "360" && render360()}

        {/* Tabs */}
        <View
          style={[styles.tabs, { paddingBottom: insets.bottom + Spacing.md }]}
        >
          <TouchableOpacity
            style={[styles.tab, activeTab === "photos" && styles.tabActive]}
            onPress={() => setActiveTab("photos")}
            activeOpacity={0.7}
          >
            <Ionicons
              name="camera"
              size={20}
              color={
                activeTab === "photos"
                  ? Colors.primaryGreen
                  : Colors.textSecondary
              }
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "photos" && styles.tabTextActive,
              ]}
            >
              Photos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "videos" && styles.tabActive]}
            onPress={() => setActiveTab("videos")}
            activeOpacity={0.7}
          >
            <Ionicons
              name="videocam"
              size={20}
              color={
                activeTab === "videos"
                  ? Colors.primaryGreen
                  : Colors.textSecondary
              }
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "videos" && styles.tabTextActive,
              ]}
            >
              Videos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "360" && styles.tabActive]}
            onPress={() => setActiveTab("360")}
            activeOpacity={0.7}
          >
            <Ionicons
              name="cube"
              size={20}
              color={
                activeTab === "360" ? Colors.primaryGreen : Colors.textSecondary
              }
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "360" && styles.tabTextActive,
              ]}
            >
              360°
            </Text>
          </TouchableOpacity>
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
  backButton: {
    position: "absolute",
    left: Spacing.lg,
    zIndex: 100,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  tabContent: {
    flex: 1,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  gestureContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    resizeMode: "cover",
  },
  imageControls: {
    position: "absolute",
    top: 100,
    right: Spacing.lg,
    flexDirection: "column",
    gap: Spacing.sm,
    zIndex: 10,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  instructionsContainer: {
    position: "absolute",
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  instructionsText: {
    ...Typography.caption,
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  counterContainer: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  counterText: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  videoContainer: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  videoCard: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: Colors.surface,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  videoThumbnail: {
    width: "100%",
    height: 220,
    resizeMode: "cover",
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryGreen,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  videoTitle: {
    ...Typography.titleMedium,
    fontSize: 17,
    fontWeight: "700",
    color: Colors.textPrimary,
    padding: Spacing.lg,
    letterSpacing: -0.2,
  },
  placeholder360: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  placeholderText: {
    ...Typography.headlineMedium,
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
  },
  placeholderSubtext: {
    ...Typography.bodyMedium,
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  view360Button: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.primaryGreen,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 20,
  },
  view360ButtonText: {
    ...Typography.labelLarge,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  tabs: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
  },
  tabText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primaryGreen,
    fontWeight: "700",
  },
});
