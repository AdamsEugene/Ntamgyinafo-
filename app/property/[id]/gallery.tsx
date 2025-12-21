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
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  GestureHandlerRootView,
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
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
  const flatListRef = useRef<FlatList>(null);

  const handleImageScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentImageIndex(index);
  };

  const goToPreviousImage = () => {
    if (currentImageIndex > 0) {
      const newIndex = currentImageIndex - 1;
      flatListRef.current?.scrollToIndex({
        index: newIndex,
        animated: true,
      });
      setCurrentImageIndex(newIndex);
    }
  };

  const goToNextImage = () => {
    if (currentImageIndex < MOCK_IMAGES.length - 1) {
      const newIndex = currentImageIndex + 1;
      flatListRef.current?.scrollToIndex({
        index: newIndex,
        animated: true,
      });
      setCurrentImageIndex(newIndex);
    }
  };

  const ZoomableImage = ({ item, index }: { item: string; index: number }) => {
    const scale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const rotation = useSharedValue(0);
    const savedScale = useSharedValue(1);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);

    const resetTransform = () => {
      scale.value = withSpring(1);
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      rotation.value = withSpring(0);
      savedScale.value = 1;
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
    };

    const handleRotate = () => {
      rotation.value = withSpring(rotation.value + 90);
    };

    const pinchGesture = Gesture.Pinch()
      .onStart(() => {
        savedScale.value = scale.value;
      })
      .onUpdate((event) => {
        // Allow zoom from 0.1x (very small) to 5x (very large)
        scale.value = Math.max(
          0.1,
          Math.min(savedScale.value * event.scale, 5)
        );
      })
      .onEnd(() => {
        // Snap to bounds if too extreme
        if (scale.value < 0.1) {
          scale.value = withSpring(0.1);
        } else if (scale.value > 5) {
          scale.value = withSpring(5);
        }
        // Reset translation when zoomed out to original or smaller
        if (scale.value <= 1) {
          translateX.value = withSpring(0);
          translateY.value = withSpring(0);
        }
        savedScale.value = scale.value;
      });

    const panGesture = Gesture.Pan()
      .onStart(() => {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      })
      .onUpdate((event) => {
        // Allow panning when zoomed in (scale > 1) or zoomed out (scale < 1)
        if (scale.value !== 1) {
          const maxTranslate = (Math.abs(scale.value - 1) * SCREEN_WIDTH) / 2;
          translateX.value = Math.max(
            -maxTranslate,
            Math.min(maxTranslate, savedTranslateX.value + event.translationX)
          );
          translateY.value = Math.max(
            -maxTranslate,
            Math.min(maxTranslate, savedTranslateY.value + event.translationY)
          );
        }
      })
      .onEnd(() => {
        // Reset translation when at original size
        if (scale.value === 1) {
          translateX.value = withSpring(0);
          translateY.value = withSpring(0);
        }
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      })
      .simultaneousWithExternalGesture(pinchGesture);

    const doubleTapGesture = Gesture.Tap()
      .numberOfTaps(2)
      .onEnd(() => {
        // Cycle through: zoomed in -> original -> zoomed out -> original
        if (scale.value > 1.1) {
          // If zoomed in, go to original
          scale.value = withSpring(1);
          translateX.value = withSpring(0);
          translateY.value = withSpring(0);
          savedScale.value = 1;
          savedTranslateX.value = 0;
          savedTranslateY.value = 0;
        } else if (scale.value < 0.9) {
          // If zoomed out, go to original
          scale.value = withSpring(1);
          translateX.value = withSpring(0);
          translateY.value = withSpring(0);
          savedScale.value = 1;
          savedTranslateX.value = 0;
          savedTranslateY.value = 0;
        } else {
          // If at original, zoom in to 2x
          scale.value = withSpring(2);
          savedScale.value = 2;
        }
      });

    const composedGesture = Gesture.Simultaneous(
      doubleTapGesture,
      Gesture.Simultaneous(pinchGesture, panGesture)
    );

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value },
          { scale: scale.value },
          { rotate: `${rotation.value}deg` },
        ],
      };
    });

    return (
      <View style={styles.imageContainer}>
        <GestureDetector gesture={composedGesture}>
          <Animated.View style={styles.imageWrapper}>
            <Animated.View style={styles.gestureContainer}>
              <Animated.Image
                source={{ uri: item }}
                style={[styles.fullImage, animatedStyle]}
                resizeMode="contain"
              />
            </Animated.View>
          </Animated.View>
        </GestureDetector>

        {/* Image Controls */}
        <View style={styles.imageControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={resetTransform}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleRotate}
            activeOpacity={0.7}
          >
            <Ionicons name="sync-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderPhotos = () => (
    <GestureHandlerRootView style={styles.tabContent}>
      <FlatList
        ref={flatListRef}
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
        renderItem={({ item, index }) => (
          <ZoomableImage item={item} index={index} />
        )}
        scrollEnabled={true}
      />
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          {currentImageIndex + 1}/{MOCK_IMAGES.length}
        </Text>
      </View>
      {/* Navigation Buttons */}
      {currentImageIndex > 0 && (
        <TouchableOpacity
          style={styles.navButtonLeft}
          onPress={goToPreviousImage}
          activeOpacity={0.7}
        >
          <View style={styles.navButtonContent}>
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      )}
      {currentImageIndex < MOCK_IMAGES.length - 1 && (
        <TouchableOpacity
          style={styles.navButtonRight}
          onPress={goToNextImage}
          activeOpacity={0.7}
        >
          <View style={styles.navButtonContent}>
            <Ionicons name="chevron-forward" size={28} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      )}
    </GestureHandlerRootView>
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gestureContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: "100%",
    resizeMode: "contain",
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
  navButtonLeft: {
    position: "absolute",
    left: Spacing.lg,
    top: "50%",
    marginTop: -30,
    zIndex: 50,
  },
  navButtonRight: {
    position: "absolute",
    right: Spacing.lg,
    top: "50%",
    marginTop: -30,
    zIndex: 50,
  },
  navButtonContent: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});
