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

  const handleImageScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentImageIndex(index);
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
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={styles.fullImage} />
        )}
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
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.counterHeader}>
            <Text style={styles.counterHeaderText}>
              {activeTab === "photos"
                ? `${currentImageIndex + 1}/${MOCK_IMAGES.length}`
                : activeTab === "videos"
                ? `${MOCK_VIDEOS.length} Videos`
                : "360° View"}
            </Text>
          </View>
          <View style={styles.placeholder} />
        </View>

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
  counterHeader: {
    flex: 1,
    alignItems: "center",
  },
  counterHeaderText: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  placeholder: {
    width: 44,
  },
  tabContent: {
    flex: 1,
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    resizeMode: "cover",
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
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: Colors.surface,
  },
  videoThumbnail: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(34, 197, 94, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  videoTitle: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    padding: Spacing.md,
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
