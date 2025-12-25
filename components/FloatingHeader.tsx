import React, { ReactNode } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ViewStyle,
} from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Typography, Spacing } from "@/constants/design";
import { useTheme } from "@/contexts/ThemeContext";

export const HEADER_ICON_SIZE = 22;

interface FloatingHeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  variant?: "default" | "transparent";
  style?: ViewStyle;
}

export const FloatingHeader: React.FC<FloatingHeaderProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  leftContent,
  rightContent,
  variant = "default",
  style,
}) => {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();
  const isTransparent = variant === "transparent";

  return (
    <View style={[styles.headerContainer, style]}>
      <BlurView
        intensity={isTransparent ? 8 : 12}
        tint={isDark ? "dark" : "light"}
        style={styles.blurContainer}
      >
        {/* Frosted glass overlay - subtle tint over blurred content */}
        <View
          style={[
            styles.glassOverlay,
            {
              backgroundColor: isTransparent
                ? "transparent"
                : isDark
                ? "rgba(18, 18, 18, 0.75)"
                : "rgba(255, 255, 255, 0.75)",
            },
          ]}
        />

        {/* Safe area spacer */}
        <View style={{ height: insets.top }} />

        {/* Header Content */}
        <View style={styles.headerContent}>
          {/* Left Section */}
          <View style={styles.leftSection}>
            {showBackButton && (
              <TouchableOpacity
                onPress={onBackPress}
                style={styles.backButton}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.iconButtonBackground,
                    {
                      backgroundColor: isDark
                        ? "rgba(255, 255, 255, 0.12)"
                        : "rgba(255, 255, 255, 0.9)",
                    },
                  ]}
                >
                  <Ionicons
                    name="arrow-back"
                    size={HEADER_ICON_SIZE}
                    color={colors.text}
                  />
                </View>
              </TouchableOpacity>
            )}
            {leftContent}
            {title && (
              <Text
                style={[styles.headerTitle, { color: colors.text }]}
                numberOfLines={1}
              >
                {title}
              </Text>
            )}
          </View>

          {/* Right Section */}
          {rightContent && (
            <View style={styles.rightSection}>{rightContent}</View>
          )}
        </View>
      </BlurView>
    </View>
  );
};

// Action button component for header
interface HeaderActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  badge?: number;
}

export const HeaderActionButton: React.FC<HeaderActionButtonProps> = ({
  icon,
  onPress,
  badge,
}) => {
  const { isDark, colors } = useTheme();

  return (
    <TouchableOpacity
      style={styles.actionButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconButtonBackground,
          {
            backgroundColor: isDark
              ? "rgba(255, 255, 255, 0.12)"
              : "rgba(255, 255, 255, 0.9)",
          },
        ]}
      >
        <Ionicons name={icon} size={HEADER_ICON_SIZE} color={colors.text} />
        {badge !== undefined && badge > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={styles.badgeText}>{badge > 99 ? "99+" : badge}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  blurContainer: {
    overflow: "hidden",
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 56,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  backButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconButtonBackground: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerTitle: {
    ...Typography.titleLarge,
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
  },
  actionButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  badgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

export default FloatingHeader;
