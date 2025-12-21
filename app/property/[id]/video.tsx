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
import { useRouter, useLocalSearchParams } from "expo-router";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
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

// Sample video URLs - replace with actual video URLs from your API
const VIDEO_URLS: { [key: string]: string } = {
  "1": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "2": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "3": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
};

const VIDEO_TITLES: { [key: string]: string } = {
  "1": "Full Property Tour",
  "2": "Living Room Walkthrough",
  "3": "Kitchen & Dining Area",
};

export default function VideoPlayerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  const videoId = (params.id as string) || "1";
  const propertyId = params.id as string;
  const videoUri = VIDEO_URLS[videoId] || VIDEO_URLS["1"];
  const videoTitle = VIDEO_TITLES[videoId] || "Property Video";

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

  const togglePlayPause = async () => {
    if (videoRef.current && isReady) {
      try {
        if (isPlaying) {
          await videoRef.current.pauseAsync();
        } else {
          await videoRef.current.playAsync();
        }
        setIsPlaying(!isPlaying);
      } catch (error) {
        console.error("Error toggling play/pause:", error);
      }
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

  return (
    <>
      <StatusBar style="light" />
      <View style={styles.container}>
        {/* Video Player */}
        <TouchableOpacity
          style={styles.videoContainer}
          activeOpacity={1}
          onPress={() => setShowControls(!showControls)}
        >
          <Video
            ref={videoRef}
            style={styles.video}
            source={{ uri: videoUri }}
            resizeMode={ResizeMode.CONTAIN}
            isLooping={false}
            shouldPlay={false}
            useNativeControls={false}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            onLoadStart={handleLoadStart}
            onLoad={handleLoad}
            onError={handleError}
          />

          {/* Loading Overlay */}
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={Colors.primaryGreen} />
              <Text style={styles.loadingText}>Loading video...</Text>
            </View>
          )}

          {/* Error Overlay */}
          {hasError && (
            <View style={styles.loadingOverlay}>
              <Ionicons name="alert-circle" size={48} color="#FF3B30" />
              <Text style={styles.errorText}>Failed to load video</Text>
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
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Controls Overlay */}
          {showControls && (
            <View style={styles.controlsOverlay}>
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
                </View>
                <View style={styles.placeholder} />
              </View>

              {/* Center Play/Pause Button */}
              {!isLoading && isReady && (
                <View style={styles.centerControls}>
                  <TouchableOpacity
                    onPress={togglePlayPause}
                    style={styles.playPauseButton}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={isPlaying ? "pause" : "play"}
                      size={48}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                </View>
              )}

              {/* Bottom Controls */}
              <View
                style={[
                  styles.bottomControls,
                  { paddingBottom: insets.bottom + Spacing.md },
                ]}
              >
                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${progress * 100}%` },
                      ]}
                    />
                  </View>
                </View>

                {/* Time Info */}
                <View style={styles.timeContainer}>
                  <Text style={styles.timeText}>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </Text>
                </View>

                {/* Control Buttons */}
                {!isLoading && isReady && (
                  <View style={styles.controlButtons}>
                    <TouchableOpacity
                      onPress={togglePlayPause}
                      style={styles.controlButton}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={isPlaying ? "pause" : "play"}
                        size={24}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.controlButton}
                      activeOpacity={0.7}
                      onPress={() => {
                        // TODO: Implement fullscreen
                      }}
                    >
                      <Ionicons name="expand" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Bottom Navigation */}
        <BottomNavigation
          tabs={GALLERY_TABS}
          activeTab="videos"
          onTabPress={handleTabPress}
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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backButton: {
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
  titleContainer: {
    flex: 1,
    marginHorizontal: Spacing.md,
  },
  videoTitle: {
    ...Typography.titleLarge,
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  placeholder: {
    width: 44,
  },
  centerControls: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
  bottomControls: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  progressContainer: {
    marginBottom: Spacing.md,
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primaryGreen,
    borderRadius: 2,
  },
  timeContainer: {
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  timeText: {
    ...Typography.caption,
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  controlButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  errorText: {
    ...Typography.bodyMedium,
    fontSize: 16,
    color: "#FFFFFF",
    marginTop: Spacing.md,
    fontWeight: "600",
    textAlign: "center",
  },
  retryButton: {
    marginTop: Spacing.lg,
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
});
