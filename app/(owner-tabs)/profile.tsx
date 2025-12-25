import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
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

// Mock user data
const USER = {
  name: "Kofi Mensah",
  phone: "+233 24 123 4567",
  email: "kofi.mensah@email.com",
  avatar:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
  verified: true,
  memberSince: "Jan 2023",
  stats: {
    listings: 5,
    views: 1234,
    inquiries: 48,
  },
};

const MENU_ITEMS = [
  {
    id: "my-listings",
    icon: "home-outline" as const,
    label: "My Listings",
    route: "/(owner-tabs)/my-listings",
  },
  {
    id: "inquiries",
    icon: "chatbubble-ellipses-outline" as const,
    label: "Inquiries",
    route: "/(owner-tabs)/inquiries",
  },
  {
    id: "subscription",
    icon: "diamond-outline" as const,
    label: "Subscription",
    route: "/(owner-tabs)/subscription",
    badge: "Standard",
  },
  {
    id: "analytics",
    icon: "stats-chart-outline" as const,
    label: "Analytics",
    route: "/owner-analytics",
  },
  {
    id: "payment-methods",
    icon: "card-outline" as const,
    label: "Payment Methods",
    route: "/payment-methods",
  },
  {
    id: "notifications",
    icon: "notifications-outline" as const,
    label: "Notifications",
    route: "/notifications",
  },
  {
    id: "help",
    icon: "help-circle-outline" as const,
    label: "Help & Support",
    route: "/help-support",
  },
  {
    id: "about",
    icon: "information-circle-outline" as const,
    label: "About",
    route: "/about",
  },
  {
    id: "terms",
    icon: "document-text-outline" as const,
    label: "Terms & Privacy",
    route: "/terms-privacy",
  },
];

export default function OwnerProfileScreen() {
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
          router.replace("/(auth)/welcome");
        },
      },
    ]);
  };

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
                source={{ uri: USER.avatar }}
                style={[styles.avatar, { borderColor: colors.primary }]}
              />
              {USER.verified && (
                <View
                  style={[
                    styles.verifiedBadge,
                    {
                      backgroundColor: colors.primary,
                      borderColor: colors.background,
                    },
                  ]}
                >
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
              )}
            </View>

            <Text style={[styles.userName, { color: colors.text }]}>
              {USER.name}
            </Text>
            <View
              style={[
                styles.roleBadge,
                { backgroundColor: `${colors.primary}15` },
              ]}
            >
              <Ionicons name="home" size={12} color={colors.primary} />
              <Text style={[styles.roleBadgeText, { color: colors.primary }]}>
                Property Owner
              </Text>
            </View>
            <Text style={[styles.memberSince, { color: colors.textSecondary }]}>
              Member since {USER.memberSince}
            </Text>

            <TouchableOpacity
              style={[styles.editButton, { borderColor: colors.primary }]}
              activeOpacity={0.7}
              onPress={() => router.push("/edit-profile" as any)}
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

          {/* Stats */}
          <View
            style={[
              styles.statsContainer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.divider,
              },
            ]}
          >
            <View style={styles.statItem}>
              <View
                style={[
                  styles.statIconBg,
                  { backgroundColor: `${colors.primary}15` },
                ]}
              >
                <Ionicons name="home" size={18} color={colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {USER.stats.listings}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Listings
              </Text>
            </View>
            <View
              style={[styles.statDivider, { backgroundColor: colors.divider }]}
            />
            <View style={styles.statItem}>
              <View
                style={[styles.statIconBg, { backgroundColor: "#3B82F615" }]}
              >
                <Ionicons name="eye" size={18} color="#3B82F6" />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {USER.stats.views.toLocaleString()}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Views
              </Text>
            </View>
            <View
              style={[styles.statDivider, { backgroundColor: colors.divider }]}
            />
            <View style={styles.statItem}>
              <View
                style={[styles.statIconBg, { backgroundColor: "#F59E0B15" }]}
              >
                <Ionicons name="chatbubble" size={18} color="#F59E0B" />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {USER.stats.inquiries}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Inquiries
              </Text>
            </View>
          </View>

          {/* Menu Items */}
          <View
            style={[
              styles.menuContainer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.divider,
              },
            ]}
          >
            {MENU_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  {
                    borderBottomColor: colors.divider,
                  },
                  index === MENU_ITEMS.length - 1 && styles.menuItemLast,
                ]}
                activeOpacity={0.7}
                onPress={() => {
                  if (item.route) {
                    router.push(item.route as any);
                  }
                }}
              >
                <View style={styles.menuItemLeft}>
                  <View
                    style={[
                      styles.menuIconContainer,
                      { backgroundColor: colors.background },
                    ]}
                  >
                    <Ionicons name={item.icon} size={22} color={colors.text} />
                  </View>
                  <Text style={[styles.menuItemLabel, { color: colors.text }]}>
                    {item.label}
                  </Text>
                </View>

                <View style={styles.menuItemRight}>
                  {item.badge && (
                    <View
                      style={[
                        styles.menuBadge,
                        { backgroundColor: `${colors.primary}15` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.menuBadgeText,
                          { color: colors.primary },
                        ]}
                      >
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

          {/* Logout Button */}
          <TouchableOpacity
            style={[
              styles.logoutButton,
              {
                backgroundColor: colors.surface,
                borderColor: "#FF3B30",
              },
            ]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>

          {/* App Version */}
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            Version 1.0.0
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
  // Decorative Background
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
  // Header
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
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
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
  // Stats
  statsContainer: {
    flexDirection: "row",
    borderRadius: 20,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
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
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  statValue: {
    ...Typography.headlineMedium,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 2,
  },
  statLabel: {
    ...Typography.caption,
    fontSize: 11,
  },
  statDivider: {
    width: 1,
    height: 60,
    alignSelf: "center",
  },
  // Menu
  menuContainer: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    marginBottom: Spacing.xl,
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
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
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
  menuBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  menuBadgeText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "600",
  },
  // Logout
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
    color: "#FF3B30",
  },
  versionText: {
    ...Typography.caption,
    fontSize: 12,
    textAlign: "center",
  },
});
