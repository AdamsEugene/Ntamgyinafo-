import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Typography, Spacing } from "@/constants/design";
import { useTheme } from "@/contexts/ThemeContext";
import {
  FloatingHeader,
  HeaderActionButton,
} from "@/components/FloatingHeader";

const ADMIN_PROFILE = {
  name: "Admin User",
  role: "Super Admin",
  email: "admin@ntamgyinafoo.com",
  avatar: "https://i.pravatar.cc/150?img=68",
  lastLogin: "Today, 9:30 AM",
};

export default function AdminProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const MENU_SECTIONS = [
    {
      title: "Admin Tools",
      items: [
        {
          id: "user-management",
          label: "User Management",
          icon: "people" as const,
          route: "/(admin-tabs)/users",
        },
        {
          id: "property-queue",
          label: "Property Queue",
          icon: "home" as const,
          route: "/(admin-tabs)/properties",
          badge: "32",
        },
        {
          id: "reports",
          label: "Reports & Analytics",
          icon: "bar-chart" as const,
          route: "/(admin-tabs)/reports",
        },
        {
          id: "system-logs",
          label: "System Logs",
          icon: "terminal" as const,
          route: "/(admin-tabs)/system-logs",
        },
      ],
    },
    {
      title: "Settings",
      items: [
        {
          id: "settings",
          label: "Settings",
          icon: "settings" as const,
          route: "/settings",
        },
        {
          id: "notifications",
          label: "Notifications",
          icon: "notifications" as const,
          route: "/notifications",
          badge: "5",
        },
        {
          id: "security",
          label: "Security",
          icon: "shield-checkmark" as const,
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          id: "help",
          label: "Help & Support",
          icon: "help-circle" as const,
          route: "/help-support",
        },
        {
          id: "about",
          label: "About",
          icon: "information-circle" as const,
          route: "/about",
        },
      ],
    },
  ];

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Decorative Background Elements */}
        <View style={styles.decorativeBackground}>
          <View
            style={[
              styles.circle1,
              { backgroundColor: colors.primary, opacity: 0.08 },
            ]}
          />
          <View
            style={[
              styles.circle2,
              { backgroundColor: colors.primary, opacity: 0.05 },
            ]}
          />
        </View>

        {/* Floating Sticky Header */}
        {/* Floating Header with Blur */}
        <FloatingHeader
          title="Profile"
          rightContent={
            <HeaderActionButton
              icon="settings-outline"
              onPress={() => router.push("/settings")}
            />
          }
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: 80 + insets.top,
              paddingBottom: 100 + insets.bottom,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Card */}
          <View
            style={[
              styles.profileCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.divider,
              },
            ]}
          >
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: ADMIN_PROFILE.avatar }}
                style={[styles.avatar, { borderColor: colors.primary }]}
              />
              <View
                style={[styles.adminBadge, { borderColor: colors.surface }]}
              >
                <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>
                {ADMIN_PROFILE.name}
              </Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{ADMIN_PROFILE.role}</Text>
              </View>
              <Text
                style={[styles.profileEmail, { color: colors.textSecondary }]}
              >
                {ADMIN_PROFILE.email}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.editButton, { borderColor: colors.primary }]}
              onPress={() => router.push("/edit-profile")}
              activeOpacity={0.7}
            >
              <Ionicons name="pencil" size={16} color={colors.primary} />
              <Text style={[styles.editButtonText, { color: colors.primary }]}>
                Edit
              </Text>
            </TouchableOpacity>
          </View>

          {/* Last Login */}
          <View
            style={[
              styles.lastLoginCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.divider,
              },
            ]}
          >
            <Ionicons
              name="time-outline"
              size={16}
              color={colors.textSecondary}
            />
            <Text
              style={[styles.lastLoginText, { color: colors.textSecondary }]}
            >
              Last login: {ADMIN_PROFILE.lastLogin}
            </Text>
          </View>

          {/* Quick Stats */}
          <View
            style={[
              styles.quickStats,
              {
                backgroundColor: colors.surface,
                borderColor: colors.divider,
              },
            ]}
          >
            <View style={styles.quickStatItem}>
              <Text style={[styles.quickStatValue, { color: colors.text }]}>
                12,458
              </Text>
              <Text
                style={[styles.quickStatLabel, { color: colors.textSecondary }]}
              >
                Total Users
              </Text>
            </View>
            <View
              style={[
                styles.quickStatDivider,
                { backgroundColor: colors.divider },
              ]}
            />
            <View style={styles.quickStatItem}>
              <Text style={[styles.quickStatValue, { color: colors.text }]}>
                3,892
              </Text>
              <Text
                style={[styles.quickStatLabel, { color: colors.textSecondary }]}
              >
                Properties
              </Text>
            </View>
            <View
              style={[
                styles.quickStatDivider,
                { backgroundColor: colors.divider },
              ]}
            />
            <View style={styles.quickStatItem}>
              <Text style={[styles.quickStatValue, { color: colors.text }]}>
                48
              </Text>
              <Text
                style={[styles.quickStatLabel, { color: colors.textSecondary }]}
              >
                Pending
              </Text>
            </View>
          </View>

          {/* Menu Sections */}
          {MENU_SECTIONS.map((section) => (
            <View key={section.title} style={styles.menuSection}>
              <Text
                style={[
                  styles.menuSectionTitle,
                  { color: colors.textSecondary },
                ]}
              >
                {section.title}
              </Text>
              <View
                style={[
                  styles.menuCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.divider,
                  },
                ]}
              >
                {section.items.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.menuItem,
                      index < section.items.length - 1 && {
                        borderBottomColor: colors.divider,
                      },
                    ]}
                    onPress={() => {
                      if (item.route) {
                        router.push(item.route as any);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.menuItemIcon,
                        { backgroundColor: `${colors.primary}15` },
                      ]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={20}
                        color={colors.primary}
                      />
                    </View>
                    <Text
                      style={[styles.menuItemLabel, { color: colors.text }]}
                    >
                      {item.label}
                    </Text>
                    {"badge" in item && item.badge && (
                      <View style={styles.menuItemBadge}>
                        <Text style={styles.menuItemBadgeText}>
                          {item.badge}
                        </Text>
                      </View>
                    )}
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* Logout Button */}
          <TouchableOpacity
            style={[
              styles.logoutButton,
              {
                backgroundColor: isDark ? "#7F1D1D" : "#FEE2E2",
              },
            ]}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>

          {/* Version */}
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            Admin Panel v1.0.0
          </Text>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  decorativeBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  circle1: {
    position: "absolute",
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  circle2: {
    position: "absolute",
    bottom: -150,
    left: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  headerTitleText: {
    ...Typography.titleLarge,
    fontSize: 20,
    fontWeight: "700",
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  // Profile Card
  profileCard: {
    borderRadius: 20,
    padding: Spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    marginBottom: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  avatarContainer: {
    position: "relative",
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
  },
  adminBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#8B5CF6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  profileInfo: {
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  profileName: {
    ...Typography.headlineMedium,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  roleBadge: {
    backgroundColor: "#8B5CF615",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: Spacing.xs,
  },
  roleBadgeText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "600",
    color: "#8B5CF6",
  },
  profileEmail: {
    ...Typography.bodyMedium,
    fontSize: 13,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
  },
  editButtonText: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
  },
  // Last Login
  lastLoginCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
  },
  lastLoginText: {
    ...Typography.caption,
    fontSize: 12,
  },
  // Quick Stats
  quickStats: {
    flexDirection: "row",
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
  },
  quickStatItem: {
    flex: 1,
    alignItems: "center",
  },
  quickStatValue: {
    ...Typography.headlineMedium,
    fontSize: 20,
    fontWeight: "700",
  },
  quickStatLabel: {
    ...Typography.caption,
    fontSize: 10,
    marginTop: 2,
  },
  quickStatDivider: {
    width: 1,
    height: "100%",
  },
  // Menu Sections
  menuSection: {
    marginBottom: Spacing.lg,
  },
  menuSectionTitle: {
    ...Typography.labelMedium,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  menuCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    gap: Spacing.md,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuItemLabel: {
    ...Typography.bodyMedium,
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  menuItemBadge: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: Spacing.xs,
  },
  menuItemBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  // Logout Button
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    borderRadius: 16,
    paddingVertical: Spacing.lg,
    marginTop: Spacing.md,
  },
  logoutButtonText: {
    ...Typography.labelLarge,
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
  },
  // Version
  versionText: {
    ...Typography.caption,
    fontSize: 11,
    textAlign: "center",
    marginTop: Spacing.lg,
  },
});
