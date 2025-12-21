import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, Typography } from "@/constants/design";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface MapSlideProps {
  title: string;
  description: string;
}

export const MapSlide: React.FC<MapSlideProps> = ({ title, description }) => {
  return (
    <View style={styles.container}>
      {/* Map-like background */}
      <View style={styles.mapBackground}>
        {/* Grid lines to simulate map */}
        {Array.from({ length: 8 }).map((_, i) => (
          <View
            key={`h-${i}`}
            style={[
              styles.gridLine,
              styles.horizontalLine,
              { top: (SCREEN_HEIGHT / 8) * i },
            ]}
          />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <View
            key={`v-${i}`}
            style={[
              styles.gridLine,
              styles.verticalLine,
              { left: (SCREEN_WIDTH / 6) * i },
            ]}
          />
        ))}

        {/* Map markers */}
        <View style={[styles.marker, styles.marker1]}>
          <View style={styles.markerPin} />
        </View>
        <View style={[styles.marker, styles.marker2]}>
          <View style={styles.markerPin} />
        </View>
        <View style={[styles.marker, styles.marker3]}>
          <View style={styles.markerPin} />
        </View>
      </View>

      {/* Content Overlay */}
      <View style={styles.contentOverlay}>
        <View style={styles.iconContainer}>
          <Ionicons name="location" size={56} color={Colors.primaryGreen} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  mapBackground: {
    flex: 1,
    backgroundColor: "#E8F5E9", // Light green map background
    position: "relative",
  },
  gridLine: {
    position: "absolute",
    backgroundColor: "rgba(76, 175, 80, 0.2)",
  },
  horizontalLine: {
    width: "100%",
    height: 1,
  },
  verticalLine: {
    height: "100%",
    width: 1,
  },
  marker: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  markerPin: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primaryGreen,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  marker1: {
    top: SCREEN_HEIGHT * 0.35,
    left: SCREEN_WIDTH * 0.4,
  },
  marker2: {
    top: SCREEN_HEIGHT * 0.55,
    left: SCREEN_WIDTH * 0.6,
  },
  marker3: {
    top: SCREEN_HEIGHT * 0.45,
    left: SCREEN_WIDTH * 0.25,
  },
  contentOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    zIndex: 10,
    pointerEvents: "none",
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    ...Typography.headlineLarge,
    color: Colors.textPrimary,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.lg,
    textAlign: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  description: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    textAlign: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
});
