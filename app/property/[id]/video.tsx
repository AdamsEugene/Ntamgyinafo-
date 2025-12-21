import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Dimensions,
  Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { Colors, Typography, Spacing } from "@/constants/design";
import { BottomNavigation, type TabItem } from "@/components/BottomNavigation";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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

// Sample video data - replace with actual video data from your API
interface VideoData {
  url: string;
  title: string;
  duration: string;
  quality: string;
  category: string;
}

const VIDEO_DATA: { [key: string]: VideoData } = {
  "1": {
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    title: "Full Property Tour",
    duration: "5:32",
    quality: "HD",
    category: "Virtual Tour",
  },
  "2": {
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    title: "Living Room Walkthrough",
    duration: "2:15",
    quality: "HD",
    category: "Room Tour",
  },
  "3": {
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    title: "Kitchen & Dining Area",
    duration: "3:48",
    quality: "4K",
    category: "Room Tour",
  },
};

const SKIP_SECONDS = 10;

export default function VideoPlayerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const videoRef = useRef<Video>(null);
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const controlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const videoId = (params.id as string) || "1";
  const propertyId = params.id as string;
  const videoData = VIDEO_DATA[videoId] || VIDEO_DATA["1"];
  const videoUri = videoData.url;
  const videoTitle = videoData.title;

  const handleTabPress = (tabId: string) => {
    if (tabId === "photos") {
      router.replace(`/property/${propertyId}/gallery?tab=photos`);
    } else if (tabId === "videos") {
      // Already on videos
    } else if (tabId === "360") {
      router.replace(`/property/${propertyId}/360`);
    }
  };

  useEffect(() => {
    // Reset states when video changes
    setIsLoading(true);
    setIsReady(false);
    setIsPlaying(false);
    setHasError(false);
  }, [videoId]);

  const hideControlsWithDelay = useCallback(() => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        Animated.timing(controlsOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowControls(false));
      }
    }, 3000);
  }, [isPlaying, controlsOpacity]);

  const showControlsWithAnimation = useCallback(() => {
    setShowControls(true);
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    hideControlsWithDelay();
  }, [controlsOpacity, hideControlsWithDelay]);

  const togglePlayPause = async () => {
    if (videoRef.current && isReady) {
      try {
        if (isPlaying) {
          await videoRef.current.pauseAsync();
        } else {
          await videoRef.current.playAsync();
        }
        setIsPlaying(!isPlaying);
        showControlsWithAnimation();
      } catch (error) {
        console.error("Error toggling play/pause:", error);
      }
    }
  };

  const skipForward = async () => {
    if (videoRef.current && isReady && status?.isLoaded) {
      const newPosition = Math.min(
        status.positionMillis + SKIP_SECONDS * 1000,
        status.durationMillis || 0
      );
      await videoRef.current.setPositionAsync(newPosition);
      showControlsWithAnimation();
    }
  };

  const skipBackward = async () => {
    if (videoRef.current && isReady && status?.isLoaded) {
      const newPosition = Math.max(
        status.positionMillis - SKIP_SECONDS * 1000,
        0
      );
      await videoRef.current.setPositionAsync(newPosition);
      showControlsWithAnimation();
    }
  };

  const seekToPosition = async (position: number) => {
    if (videoRef.current && isReady && status?.isLoaded) {
      const seekPosition = position * (status.durationMillis || 0);
      await videoRef.current.setPositionAsync(seekPosition);
    }
  };

  const toggleMute = async () => {
    if (videoRef.current) {
      await videoRef.current.setIsMutedAsync(!isMuted);
      setIsMuted(!isMuted);
      showControlsWithAnimation();
    }
  };

  const handlePlaybackStatusUpdate = (playbackStatus: AVPlaybackStatus) => {
    setStatus(playbackStatus);

    if (playbackStatus.isLoaded) {
      // Video is loaded and ready
      if (!isReady) {
        setIsReady(true);
        setIsLoading(false);
      }

      // Update playing state
      setIsPlaying(playbackStatus.isPlaying);

      // Check if video is buffering
      if (playbackStatus.isBuffering) {
        setIsLoading(true);
      } else {
        setIsLoading(false);
      }
    } else {
      // Video is not loaded yet or has an error
      if (!playbackStatus.isLoaded) {
        setIsLoading(true);
      }
    }
  };

  const handleLoadStart = () => {
    setIsLoading(true);
    setIsReady(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setIsReady(true);
    // Auto-play when ready
    if (videoRef.current) {
      videoRef.current.playAsync().catch((error) => {
        console.error("Error auto-playing:", error);
      });
    }
  };

  const handleError = (error: string) => {
    console.error("Video error:", error);
    setHasError(true);
    setIsLoading(false);
    setIsReady(false);
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const currentTime = status?.isLoaded ? status.positionMillis : 0;
  const duration = status?.isLoaded ? status.durationMillis || 0 : 0;
  const progress = duration > 0 ? currentTime / duration : 0;

  const handleProgressPress = (event: any) => {
    const { locationX } = event.nativeEvent;
    const progressBarWidth = SCREEN_WIDTH - Spacing.lg * 2;
    const position = Math.max(0, Math.min(1, locationX / progressBarWidth));
    seekToPosition(position);
  };

  return (
    <>
      <StatusBar style="light" />
      <View style={styles.container}>
        {/* Video Player */}
        <TouchableOpacity
          style={styles.videoContainer}
          activeOpacity={1}
          onPress={showControlsWithAnimation}
        >
          <Video
            ref={videoRef}
            style={styles.video}
            source={{ uri: videoUri }}
            resizeMode={ResizeMode.CONTAIN}
            isLooping={false}
            shouldPlay={false}
            isMuted={isMuted}
            useNativeControls={false}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            onLoadStart={handleLoadStart}
            onLoad={handleLoad}
            onError={handleError}
          />

          {/* Loading Overlay */}
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <View style={styles.loadingContent}>
                <View style={styles.loadingSpinner}>
                  <ActivityIndicator size="large" color="#FFFFFF" />
                </View>
                <Text style={styles.loadingText}>Loading video...</Text>
                <View style={styles.loadingBadge}>
                  <Text style={styles.loadingBadgeText}>
                    {videoData.quality}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Error Overlay */}
          {hasError && (
            <View style={styles.loadingOverlay}>
              <View style={styles.errorContent}>
                <View style={styles.errorIconContainer}>
                  <Ionicons name="alert-circle" size={56} color="#FF3B30" />
                </View>
                <Text style={styles.errorTitle}>Playback Error</Text>
                <Text style={styles.errorText}>
                  Unable to load this video. Please check your connection.
                </Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => {
                    setHasError(false);
                    setIsLoading(true);
                    setIsReady(false);
                    if (videoRef.current) {
                      videoRef.current.unloadAsync().then(() => {
                        videoRef.current?.loadAsync({ uri: videoUri });
                      });
                    }
                  }}
                >
                  <Ionicons
                    name="refresh"
                    size={20}
                    color="#FFFFFF"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Controls Overlay */}
          {showControls && (
            <Animated.View
              style={[styles.controlsOverlay, { opacity: controlsOpacity }]}
            >
              {/* Top Gradient */}
              <LinearGradient
                colors={["rgba(0,0,0,0.8)", "transparent"]}
                style={styles.topGradient}
              />

              {/* Top Bar */}
              <View
                style={[styles.topBar, { paddingTop: insets.top + Spacing.md }]}
              >
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={styles.backButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                  <Text style={styles.videoTitle} numberOfLines={1}>
                    {videoTitle}
                  </Text>
                  <View style={styles.videoBadges}>
                    <View style={styles.qualityBadge}>
                      <Text style={styles.qualityBadgeText}>
                        {videoData.quality}
                      </Text>
                    </View>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>
                        {videoData.category}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={toggleMute}
                  style={styles.muteButton}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isMuted ? "volume-mute" : "volume-high"}
                    size={22}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>

              {/* Center Controls */}
              {!isLoading && isReady && (
                <View style={styles.centerControls}>
                  {/* Skip Backward */}
                  <TouchableOpacity
                    onPress={skipBackward}
                    style={styles.skipButton}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="play-back"
                      size={28}
                      color="rgba(255,255,255,0.9)"
                    />
                    <Text style={styles.skipText}>{SKIP_SECONDS}</Text>
                  </TouchableOpacity>

                  {/* Play/Pause */}
                  <TouchableOpacity
                    onPress={togglePlayPause}
                    style={styles.playPauseButton}
                    activeOpacity={0.8}
                  >
                    <View style={styles.playPauseInner}>
                      <Ionicons
                        name={isPlaying ? "pause" : "play"}
                        size={40}
                        color="#FFFFFF"
                        style={isPlaying ? {} : { marginLeft: 4 }}
                      />
                    </View>
                  </TouchableOpacity>

                  {/* Skip Forward */}
                  <TouchableOpacity
                    onPress={skipForward}
                    style={styles.skipButton}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="play-forward"
                      size={28}
                      color="rgba(255,255,255,0.9)"
                    />
                    <Text style={styles.skipText}>{SKIP_SECONDS}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Bottom Gradient */}
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.9)"]}
                style={styles.bottomGradient}
              />

              {/* Bottom Controls */}
              <View
                style={[
                  styles.bottomControls,
                  { paddingBottom: insets.bottom + 80 },
                ]}
              >
                {/* Progress Bar */}
                <TouchableOpacity
                  style={styles.progressContainer}
                  onPress={handleProgressPress}
                  activeOpacity={1}
                >
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${progress * 100}%` },
                      ]}
                    />
                    <View
                      style={[
                        styles.progressThumb,
                        { left: `${progress * 100}%` },
                      ]}
                    />
                  </View>
                </TouchableOpacity>

                {/* Time and Controls Row */}
                <View style={styles.bottomRow}>
                  <View style={styles.timeContainer}>
                    <Text style={styles.currentTimeText}>
                      {formatTime(currentTime)}
                    </Text>
                    <Text style={styles.timeSeparator}>/</Text>
                    <Text style={styles.durationText}>
                      {formatTime(duration)}
                    </Text>
                  </View>

                  <View style={styles.rightControls}>
                    <TouchableOpacity
                      style={styles.miniControlButton}
                      activeOpacity={0.7}
                      onPress={() => {
                        // TODO: Implement settings
                      }}
                    >
                      <Ionicons
                        name="settings-outline"
                        size={20}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.miniControlButton}
                      activeOpacity={0.7}
                      onPress={() => {
                        // TODO: Implement fullscreen
                      }}
                    >
                      <Ionicons name="expand" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Animated.View>
          )}
        </TouchableOpacity>

        {/* Bottom Navigation */}
        <BottomNavigation
          tabs={GALLERY_TABS}
          activeTab="videos"
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
    width: "100%",
  },
  videoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  muteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: Spacing.md,
    alignItems: "center",
  },
  videoTitle: {
    ...Typography.titleLarge,
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  videoBadges: {
    flexDirection: "row",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  qualityBadge: {
    backgroundColor: Colors.primaryGreen,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
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
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  categoryBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  centerControls: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing["2xl"],
  },
  skipButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  skipText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: -2,
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryGreen,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  playPauseInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryGreen,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  bottomControls: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    zIndex: 10,
  },
  progressContainer: {
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  progressBar: {
    width: "100%",
    height: 5,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 3,
    position: "relative",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primaryGreen,
    borderRadius: 3,
  },
  progressThumb: {
    position: "absolute",
    top: -5,
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: Colors.primaryGreen,
    marginLeft: -7,
    borderWidth: 2,
    borderColor: "#FFFFFF",
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
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  currentTimeText: {
    ...Typography.caption,
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  timeSeparator: {
    ...Typography.caption,
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "500",
  },
  durationText: {
    ...Typography.caption,
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  rightControls: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  miniControlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
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
    marginTop: Spacing.md,
    backgroundColor: Colors.primaryGreen,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  loadingBadgeText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  errorContent: {
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
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
    lineHeight: 20,
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
});
