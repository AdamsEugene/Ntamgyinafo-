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
import { Colors, Typography, Spacing } from "@/constants/design";
import {
  FloatingHeaderStyles,
  HEADER_ICON_SIZE,
} from "@/components/FloatingHeader.styles";

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
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* Decorative Background Elements */}
        <View style={styles.decorativeBackground}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
        </View>

        {/* Floating Sticky Header */}
        <View
          style={[
            FloatingHeaderStyles.floatingHeader,
            { paddingTop: insets.top + Spacing.md },
          ]}
        >
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitleText}>Profile</Text>
          </View>

          {/* Settings Button */}
          <TouchableOpacity
            onPress={() => router.push("/settings")}
            style={FloatingHeaderStyles.actionButton}
            activeOpacity={0.7}
          >
            <View style={FloatingHeaderStyles.actionButtonBackground}>
              <Ionicons
                name="settings-outline"
                size={HEADER_ICON_SIZE}
                color={Colors.textPrimary}
              />
            </View>
          </TouchableOpacity>
        </View>

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
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: ADMIN_PROFILE.avatar }}
                style={styles.avatar}
              />
              <View style={styles.adminBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{ADMIN_PROFILE.name}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{ADMIN_PROFILE.role}</Text>
              </View>
              <Text style={styles.profileEmail}>{ADMIN_PROFILE.email}</Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push("/edit-profile")}
              activeOpacity={0.7}
            >
              <Ionicons name="pencil" size={16} color={Colors.primaryGreen} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Last Login */}
          <View style={styles.lastLoginCard}>
            <Ionicons
              name="time-outline"
              size={16}
              color={Colors.textSecondary}
            />
            <Text style={styles.lastLoginText}>
              Last login: {ADMIN_PROFILE.lastLogin}
            </Text>
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>12,458</Text>
              <Text style={styles.quickStatLabel}>Total Users</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>3,892</Text>
              <Text style={styles.quickStatLabel}>Properties</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>48</Text>
              <Text style={styles.quickStatLabel}>Pending</Text>
            </View>
          </View>

          {/* Menu Sections */}
          {MENU_SECTIONS.map((section) => (
            <View key={section.title} style={styles.menuSection}>
              <Text style={styles.menuSectionTitle}>{section.title}</Text>
              <View style={styles.menuCard}>
                {section.items.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.menuItem,
                      index < section.items.length - 1 && styles.menuItemBorder,
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
                        { backgroundColor: `${Colors.primaryGreen}15` },
                      ]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={20}
                        color={Colors.primaryGreen}
                      />
                    </View>
                    <Text style={styles.menuItemLabel}>{item.label}</Text>
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
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>

          {/* Version */}
          <Text style={styles.versionText}>Admin Panel v1.0.0</Text>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    backgroundColor: Colors.primaryLight,
    opacity: 0.08,
  },
  circle2: {
    position: "absolute",
    bottom: -150,
    left: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: Colors.primaryGreen,
    opacity: 0.05,
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
    color: Colors.textPrimary,
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
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.divider,
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
    borderColor: Colors.primaryGreen,
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
    borderColor: Colors.surface,
  },
  profileInfo: {
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  profileName: {
    ...Typography.headlineMedium,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
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
    color: Colors.textSecondary,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primaryGreen,
  },
  editButtonText: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
  // Last Login
  lastLoginCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  lastLoginText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  // Quick Stats
  quickStats: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  quickStatItem: {
    flex: 1,
    alignItems: "center",
  },
  quickStatValue: {
    ...Typography.headlineMedium,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  quickStatLabel: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  quickStatDivider: {
    width: 1,
    height: "100%",
    backgroundColor: Colors.divider,
  },
  // Menu Sections
  menuSection: {
    marginBottom: Spacing.lg,
  },
  menuSectionTitle: {
    ...Typography.labelMedium,
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    gap: Spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
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
    color: Colors.textPrimary,
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
    backgroundColor: "#FEE2E2",
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
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: Spacing.lg,
  },
});
