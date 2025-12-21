import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  tabs,
  activeTab,
  onTabPress,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.floatingContainer,
        {
          paddingBottom: Math.max(insets.bottom, Spacing.xs),
          marginBottom: Spacing.lg,
          marginHorizontal: Spacing.lg,
        },
      ]}
    >
      <View style={styles.container}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const iconName =
            isActive && tab.activeIcon ? tab.activeIcon : tab.icon;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tab}
              onPress={() => onTabPress(tab.id)}
              activeOpacity={0.7}
            >
              {isActive && <View style={styles.activeOverlay} />}
              <View style={styles.tabContent}>
                <Ionicons
                  name={iconName}
                  size={22}
                  color={isActive ? Colors.primaryGreen : Colors.textSecondary}
                />
                <Text style={[styles.label, isActive && styles.activeLabel]}>
                  {tab.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    minHeight: 56,
    height: 56,
    zIndex: 1000,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    minHeight: 56,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
  },
  activeOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#F1F8F4",
    borderRadius: 16,
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    zIndex: 1,
  },
  label: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  activeLabel: {
    color: Colors.primaryGreen,
    fontWeight: "600",
  },
});
