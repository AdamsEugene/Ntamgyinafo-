import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography, Spacing } from "@/constants/design";

export interface TabItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon?: keyof typeof Ionicons.glyphMap;
}

interface BottomNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (tabId: string) => void;
  variant?: "default" | "dark";
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  tabs,
  activeTab,
  onTabPress,
  variant = "default",
}) => {
  const insets = useSafeAreaInsets();
  const isDark = variant === "dark";

  return (
    <View style={styles.floatingContainer}>
      {/* Blur Background */}
      <BlurView
        intensity={isDark ? 25 : 35}
        tint={isDark ? "dark" : "light"}
        style={styles.blurContainer}
      >
        {/* Glass overlay */}
        <View
          style={[
            styles.glassOverlay,
            isDark ? styles.glassOverlayDark : styles.glassOverlayLight,
          ]}
        />

        {/* Top border line */}
        <View
          style={[
            styles.topBorder,
            isDark ? styles.topBorderDark : styles.topBorderLight,
          ]}
        />

        {/* Tabs Container */}
        <View style={styles.container}>
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;
            const iconName =
              isActive && tab.activeIcon ? tab.activeIcon : tab.icon;

            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.tab}
                onPress={() => onTabPress(tab.id)}
                activeOpacity={0.6}
              >
                {/* Active Pill Indicator */}
                {isActive && (
                  <View
                    style={[
                      styles.activePill,
                      isDark ? styles.activePillDark : styles.activePillLight,
                    ]}
                  />
                )}

                {/* Icon Container */}
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={iconName}
                    size={24}
                    color={
                      isActive
                        ? Colors.primaryGreen
                        : isDark
                        ? "rgba(255, 255, 255, 0.5)"
                        : Colors.textSecondary
                    }
                  />
                  {/* Active dot indicator */}
                  {isActive && <View style={styles.activeDot} />}
                </View>

                {/* Label */}
                <Text
                  style={[
                    styles.label,
                    isDark && styles.labelDark,
                    isActive && styles.activeLabel,
                  ]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bottom safe area spacer */}
        <View style={{ height: Math.max(insets.bottom, Spacing.sm) }} />
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  blurContainer: {
    overflow: "hidden",
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  glassOverlayLight: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  glassOverlayDark: {
    backgroundColor: "rgba(30, 30, 30, 0.6)",
  },
  topBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  topBorderLight: {
    backgroundColor: "rgba(0, 0, 0, 0.08)",
  },
  topBorderDark: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    minHeight: 64,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xs,
    position: "relative",
  },
  activePill: {
    position: "absolute",
    top: 0,
    left: 2,
    right: 2,
    bottom: 0,
    borderRadius: 20,
  },
  activePillLight: {
    backgroundColor: "rgba(34, 197, 94, 0.12)",
  },
  activePillDark: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 2,
  },
  activeDot: {
    position: "absolute",
    bottom: -6,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primaryGreen,
  },
  label: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "500",
    color: Colors.textSecondary,
    marginTop: 2,
    letterSpacing: -0.2,
  },
  labelDark: {
    color: "rgba(255, 255, 255, 0.5)",
  },
  activeLabel: {
    color: Colors.primaryGreen,
    fontWeight: "600",
  },
});
