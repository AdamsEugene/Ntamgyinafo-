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
import { Typography, Spacing } from "@/constants/design";
import { useTheme } from "@/contexts/ThemeContext";

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
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  tabs,
  activeTab,
  onTabPress,
}) => {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();

  // Calculate the height needed for blur background
  const navHeight = 64;
  const bottomPadding = Math.max(insets.bottom, Spacing.md);
  const totalBlurHeight = navHeight + bottomPadding + Spacing.xs;

  return (
    <View style={styles.wrapper}>
      {/* Blur Background Layer */}
      <View style={[styles.blurBackground, { height: totalBlurHeight }]}>
        <BlurView
          intensity={isDark ? 8 : 12}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        >
          <View
            style={[
              styles.glassOverlay,
              {
                backgroundColor: isDark
                  ? "rgba(18, 18, 18, 0.75)"
                  : "rgba(255, 255, 255, 0.75)",
              },
            ]}
          />
        </BlurView>
      </View>

      {/* Floating Pill Nav */}
      <View style={[styles.floatingNav, { marginBottom: bottomPadding }]}>
        <View
          style={[
            styles.navBackground,
            {
              backgroundColor: isDark
                ? "rgba(40, 40, 40, 0.95)"
                : "rgba(255, 255, 255, 0.95)",
            },
          ]}
        />

        {/* Tabs Container */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => {
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
                      {
                        backgroundColor: isDark
                          ? `${colors.primary}30`
                          : `${colors.primary}15`,
                      },
                    ]}
                  />
                )}

                {/* Icon Container */}
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={iconName}
                    size={24}
                    color={isActive ? colors.primary : colors.textSecondary}
                  />
                  {/* Active dot indicator */}
                  {isActive && (
                    <View
                      style={[
                        styles.activeDot,
                        { backgroundColor: colors.primary },
                      ]}
                    />
                  )}
                </View>

                {/* Label */}
                <Text
                  style={[
                    styles.label,
                    { color: isActive ? colors.primary : colors.textSecondary },
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  blurBackground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  floatingNav: {
    marginHorizontal: Spacing.lg,
    borderRadius: 28,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  navBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
  },
  tabsContainer: {
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
  },
  label: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
    letterSpacing: -0.2,
  },
  activeLabel: {
    fontWeight: "600",
  },
});
