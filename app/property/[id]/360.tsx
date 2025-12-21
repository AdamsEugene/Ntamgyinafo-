import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Typography, Spacing } from "@/constants/design";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function Property360ViewerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [autoRotate, setAutoRotate] = useState(false);
  const [currentRoom, setCurrentRoom] = useState("Living Room");

  const rooms = [
    "Living Room",
    "Kitchen",
    "Bedroom 1",
    "Bedroom 2",
    "Bathroom",
  ];

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
          <View style={styles.placeholder} />
          <TouchableOpacity
            onPress={() => setAutoRotate(!autoRotate)}
            style={styles.autoButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name={autoRotate ? "pause-circle" : "play-circle"}
              size={24}
              color={autoRotate ? Colors.primaryGreen : "#FFFFFF"}
            />
            <Text style={styles.autoButtonText}>
              {autoRotate ? "Auto" : "Manual"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 360° Viewer Placeholder */}
        <View style={styles.viewerContainer}>
          <View style={styles.viewerPlaceholder}>
            <Ionicons name="cube" size={120} color={Colors.textSecondary} />
            <Text style={styles.viewerText}>360° Panorama Viewer</Text>
            <Text style={styles.viewerSubtext}>
              Drag to look around{autoRotate ? " • Auto-rotating" : ""}
            </Text>
            <View style={styles.viewerControls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => {
                  const currentIndex = rooms.indexOf(currentRoom);
                  if (currentIndex > 0) {
                    setCurrentRoom(rooms[currentIndex - 1]);
                  }
                }}
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
              >
                <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Navigation Hint */}
        <View
          style={[
            styles.navigationHint,
            { paddingBottom: insets.bottom + Spacing.md },
          ]}
        >
          <Text style={styles.hintText}>← Swipe for more →</Text>
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
    justifyContent: "center",
    alignItems: "center",
  },
  viewerPlaceholder: {
    alignItems: "center",
    padding: Spacing.xl,
  },
  viewerText: {
    ...Typography.headlineLarge,
    fontSize: 28,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginTop: Spacing.xl,
  },
  viewerSubtext: {
    ...Typography.bodyMedium,
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    textAlign: "center",
  },
  viewerControls: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing["2xl"],
    gap: Spacing.lg,
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
