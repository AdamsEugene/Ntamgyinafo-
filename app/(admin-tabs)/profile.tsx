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
          route: "/(admin-tabs)/settings",
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
          route: "/(admin-tabs)/security",
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
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: ADMIN_PROFILE.avatar }}
                style={[styles.avatar, { borderColor: colors.primary }]}
              />
              <View
                style={[
                  styles.adminBadge,
                  {
                    backgroundColor: colors.primary,
                    borderColor: colors.background,
                  },
                ]}
              >
                <Ionicons name="shield-checkmark" size={14} color="#FFFFFF" />
              </View>
            </View>

            <Text style={[styles.userName, { color: colors.text }]}>
              {ADMIN_PROFILE.name}
            </Text>
            <View
              style={[
                styles.roleBadge,
                { backgroundColor: `${colors.primary}15` },
              ]}
            >
              <Ionicons name="shield" size={12} color={colors.primary} />
              <Text style={[styles.roleBadgeText, { color: colors.primary }]}>
                {ADMIN_PROFILE.role}
              </Text>
            </View>
            <Text style={[styles.memberSince, { color: colors.textSecondary }]}>
              {ADMIN_PROFILE.email}
            </Text>

            <TouchableOpacity
              style={[styles.editButton, { borderColor: colors.primary }]}
              activeOpacity={0.7}
              onPress={() => router.push("/edit-profile")}
            >
              <Ionicons
                name="create-outline"
                size={18}
                color={colors.primary}
              />
              <Text style={[styles.editButtonText, { color: colors.primary }]}>
                Edit Profile
              </Text>
            </TouchableOpacity>
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
                      {
                        borderBottomColor: colors.divider,
                      },
                      index === section.items.length - 1 && styles.menuItemLast,
                    ]}
                    onPress={() => {
                      if (item.route) {
                        router.push(item.route as any);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuItemLeft}>
                      <View
                        style={[
                          styles.menuItemIcon,
                          { backgroundColor: colors.inputBackground },
                        ]}
                      >
                        <Ionicons
                          name={item.icon}
                          size={22}
                          color={colors.text}
                        />
                      </View>
                      <Text
                        style={[styles.menuItemLabel, { color: colors.text }]}
                      >
                        {item.label}
                      </Text>
                    </View>
                    <View style={styles.menuItemRight}>
                      {"badge" in item && item.badge && (
                        <View
                          style={[
                            styles.menuItemBadge,
                            { backgroundColor: colors.primary },
                          ]}
                        >
                          <Text style={styles.menuItemBadgeText}>
                            {item.badge}
                          </Text>
                        </View>
                      )}
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={colors.textSecondary}
                      />
                    </View>
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
                backgroundColor: colors.surface,
                borderColor: colors.error,
              },
            ]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={22} color={colors.error} />
            <Text style={[styles.logoutButtonText, { color: colors.error }]}>
              Logout
            </Text>
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
    paddingHorizontal: Spacing.xl,
  },
  // Profile Header
  profileHeader: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
  },
  adminBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
  },
  userName: {
    ...Typography.headlineMedium,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: Spacing.xs,
  },
  roleBadgeText: {
    ...Typography.labelMedium,
    fontSize: 12,
    fontWeight: "600",
  },
  memberSince: {
    ...Typography.bodyMedium,
    fontSize: 13,
    marginBottom: Spacing.md,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
  },
  editButtonText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
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
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  menuItemLabel: {
    ...Typography.bodyMedium,
    fontSize: 15,
    fontWeight: "500",
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  menuItemBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: "center",
  },
  menuItemBadgeText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  // Logout Button
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  logoutButtonText: {
    ...Typography.labelLarge,
    fontSize: 15,
    fontWeight: "600",
  },
  // Version
  versionText: {
    ...Typography.caption,
    fontSize: 11,
    textAlign: "center",
    marginTop: Spacing.lg,
  },
});
