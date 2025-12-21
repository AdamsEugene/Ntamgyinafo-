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
import { BottomNavigation, type TabItem } from "@/components/BottomNavigation";

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
    title: "Full Property Tour",
    duration: "5:32",
    views: "1.2K",
    quality: "HD",
    category: "Virtual Tour",
    description: "Complete walkthrough of the entire property",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  },
  {
    id: "2",
    thumbnail:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
    title: "Living Room Walkthrough",
    duration: "2:15",
    views: "856",
    quality: "HD",
    category: "Room Tour",
    description: "Detailed view of the spacious living room",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  },
  {
    id: "3",
    thumbnail:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
    title: "Kitchen & Dining Area",
    duration: "3:48",
    views: "642",
    quality: "4K",
    category: "Room Tour",
    description: "Modern kitchen with premium appliances",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  },
];

type TabType = "photos" | "videos" | "360";

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

const THUMBNAIL_SIZE = 60;
const THUMBNAIL_SPACING = 8;

export default function PropertyGalleryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const initialTab = (params.tab as TabType) || "photos";
  const initialIndex = params.index ? parseInt(params.index as string, 10) : 0;

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [currentImageIndex, setCurrentImageIndex] = useState(initialIndex);
  const flatListRef = useRef<FlatList>(null);
  const thumbnailListRef = useRef<FlatList>(null);

  const handleImageScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    if (index !== currentImageIndex) {
      setCurrentImageIndex(index);
      // Scroll thumbnail to center the active one
      thumbnailListRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    }
  };

  const jumpToImage = (index: number) => {
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
    setCurrentImageIndex(index);
    thumbnailListRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5,
    });
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

  const renderThumbnail = ({
    item,
    index,
  }: {
    item: string;
    index: number;
  }) => {
    const isActive = index === currentImageIndex;
    return (
      <TouchableOpacity
        onPress={() => jumpToImage(index)}
        activeOpacity={0.8}
        style={[
          styles.thumbnailWrapper,
          isActive && styles.thumbnailWrapperActive,
        ]}
      >
        <Image
          source={{ uri: item }}
          style={[styles.thumbnail, isActive && styles.thumbnailActive]}
        />
        {isActive && <View style={styles.thumbnailActiveOverlay} />}
      </TouchableOpacity>
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

      {/* Counter Badge */}
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          {currentImageIndex + 1}/{MOCK_IMAGES.length}
        </Text>
      </View>

      {/* Thumbnail Strip */}
      <View style={styles.thumbnailContainer}>
        <FlatList
          ref={thumbnailListRef}
          data={MOCK_IMAGES}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailList}
          keyExtractor={(item, index) => `thumb-${index}`}
          renderItem={renderThumbnail}
          initialScrollIndex={currentImageIndex > 2 ? currentImageIndex - 2 : 0}
          getItemLayout={(_, index) => ({
            length: THUMBNAIL_SIZE + THUMBNAIL_SPACING,
            offset: (THUMBNAIL_SIZE + THUMBNAIL_SPACING) * index,
            index,
          })}
        />
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
      style={[styles.tabContent, { backgroundColor: "#0A0A0A" }]}
      contentContainerStyle={styles.videoContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View
        style={[styles.videoHeader, { paddingTop: insets.top + Spacing.xl }]}
      >
        <View style={styles.videoHeaderContent}>
          <View style={styles.videoHeaderIcon}>
            <Ionicons name="videocam" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.videoHeaderText}>
            <Text style={styles.videoHeaderTitle}>Property Videos</Text>
            <Text style={styles.videoHeaderSubtitle}>
              {MOCK_VIDEOS.length} videos • HD Quality
            </Text>
          </View>
        </View>
        <View style={styles.videoHeaderDivider} />
      </View>

      {/* Video Cards */}
      {MOCK_VIDEOS.map((video, index) => (
        <TouchableOpacity
          key={video.id}
          style={styles.videoCard}
          activeOpacity={0.95}
          onPress={() => {
            router.push(`/property/${params.id}/video?id=${video.id}`);
          }}
        >
          {/* Video Number */}
          <View style={styles.videoNumberBadge}>
            <Text style={styles.videoNumberText}>{index + 1}</Text>
          </View>

          <View style={styles.videoThumbnailContainer}>
            <Image
              source={{ uri: video.thumbnail }}
              style={styles.videoThumbnail}
            />
            {/* Gradient Overlay */}
            <View style={styles.videoGradientOverlay} />

            {/* Top Badges */}
            <View style={styles.videoBadgesRow}>
              <View style={styles.qualityBadge}>
                <Text style={styles.qualityBadgeText}>{video.quality}</Text>
              </View>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{video.category}</Text>
              </View>
            </View>

            {/* Duration Badge */}
            <View style={styles.durationBadge}>
              <Ionicons name="time-outline" size={12} color="#FFFFFF" />
              <Text style={styles.durationText}>{video.duration}</Text>
            </View>

            {/* Play Button */}
            <View style={styles.videoPlayButtonContainer}>
              <View style={styles.playButton}>
                <View style={styles.playButtonRing} />
                <View style={styles.playButtonInner}>
                  <Ionicons
                    name="play"
                    size={28}
                    color="#FFFFFF"
                    style={{ marginLeft: 3 }}
                  />
                </View>
              </View>
              <Text style={styles.playButtonLabel}>Play Video</Text>
            </View>
          </View>

          {/* Video Info */}
          <View style={styles.videoInfo}>
            <View style={styles.videoInfoTop}>
              <Text style={styles.videoTitle}>{video.title}</Text>
              <Text style={styles.videoDescription}>{video.description}</Text>
              <View style={styles.videoStats}>
                <View style={styles.videoStatItem}>
                  <Ionicons
                    name="eye-outline"
                    size={14}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.videoStatText}>{video.views} views</Text>
                </View>
                <View style={styles.videoStatDivider} />
                <View style={styles.videoStatItem}>
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.videoStatText}>{video.duration}</Text>
                </View>
              </View>
            </View>
            <View style={styles.videoActionRow}>
              <TouchableOpacity
                style={styles.videoActionButton}
                activeOpacity={0.7}
                onPress={() => {
                  console.log("Share video:", video.id);
                }}
              >
                <View style={styles.videoActionIconBg}>
                  <Ionicons
                    name="share-social-outline"
                    size={16}
                    color={Colors.primaryGreen}
                  />
                </View>
                <Text style={styles.videoActionText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.videoActionButton}
                activeOpacity={0.7}
                onPress={() => {
                  console.log("Save video:", video.id);
                }}
              >
                <View style={styles.videoActionIconBg}>
                  <Ionicons
                    name="bookmark-outline"
                    size={16}
                    color={Colors.primaryGreen}
                  />
                </View>
                <Text style={styles.videoActionText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.videoActionButton, styles.videoWatchButton]}
                activeOpacity={0.7}
                onPress={() => {
                  router.push(`/property/${params.id}/video?id=${video.id}`);
                }}
              >
                <Ionicons name="play" size={16} color="#FFFFFF" />
                <Text style={styles.videoWatchText}>Watch</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {/* Bottom Spacing */}
      <View style={{ height: 100 }} />
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

        {/* Bottom Navigation */}
        <BottomNavigation
          tabs={GALLERY_TABS}
          activeTab={activeTab}
          onTabPress={(tabId) => setActiveTab(tabId as TabType)}
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
    bottom: 180,
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
  thumbnailContainer: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    height: THUMBNAIL_SIZE + 16,
    justifyContent: "center",
  },
  thumbnailList: {
    paddingHorizontal: Spacing.lg,
    gap: THUMBNAIL_SPACING,
  },
  thumbnailWrapper: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
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
  thumbnailWrapperActive: {
    borderColor: Colors.primaryGreen,
    borderWidth: 3,
    transform: [{ scale: 1.1 }],
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  thumbnailActive: {
    opacity: 1,
  },
  thumbnailActiveOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    borderRadius: 8,
  },
  videoContainer: {
    paddingBottom: Spacing["2xl"],
    backgroundColor: "#0A0A0A",
    width: "100%",
    paddingHorizontal: Spacing.lg,
  },
  videoHeader: {
    paddingBottom: Spacing.lg,
    backgroundColor: "#0A0A0A",
    zIndex: 1,
    width: "100%",
  },
  videoHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  videoHeaderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryGreen,
    justifyContent: "center",
    alignItems: "center",
  },
  videoHeaderText: {
    flex: 1,
  },
  videoHeaderTitle: {
    ...Typography.headlineMedium,
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  videoHeaderSubtitle: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "500",
  },
  videoHeaderDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginTop: Spacing.lg,
  },
  videoCard: {
    marginBottom: Spacing.xl,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#1A1A1A",
    width: "100%",
    position: "relative",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  videoNumberBadge: {
    position: "absolute",
    top: -8,
    left: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryGreen,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    borderWidth: 3,
    borderColor: "#0A0A0A",
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  videoNumberText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  videoThumbnailContainer: {
    width: "100%",
    height: 220,
    position: "relative",
    backgroundColor: "#000000",
  },
  videoThumbnail: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  videoGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  videoBadgesRow: {
    position: "absolute",
    top: Spacing.md,
    left: Spacing.md,
    flexDirection: "row",
    gap: Spacing.xs,
  },
  qualityBadge: {
    backgroundColor: Colors.primaryGreen,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  qualityBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  categoryBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  categoryBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  durationBadge: {
    position: "absolute",
    bottom: Spacing.md,
    right: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: 8,
  },
  durationText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  videoPlayButtonContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  playButtonRing: {
    position: "absolute",
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  playButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryGreen,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  playButtonLabel: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: Spacing.sm,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  videoInfo: {
    padding: Spacing.lg,
    backgroundColor: "#1A1A1A",
  },
  videoInfoTop: {
    marginBottom: Spacing.md,
  },
  videoTitle: {
    ...Typography.titleLarge,
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  videoDescription: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  videoStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  videoStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  videoStatText: {
    ...Typography.caption,
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
    fontWeight: "500",
  },
  videoStatDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: Spacing.sm,
  },
  videoActionRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  videoActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: Spacing.sm,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  videoActionIconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  videoActionText: {
    ...Typography.labelMedium,
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
  },
  videoWatchButton: {
    backgroundColor: Colors.primaryGreen,
    borderColor: Colors.primaryGreen,
  },
  videoWatchText: {
    ...Typography.labelMedium,
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
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
