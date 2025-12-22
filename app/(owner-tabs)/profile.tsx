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
import { Colors, Typography, Spacing } from "@/constants/design";

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
    id: "subscription",
    icon: "diamond-outline" as const,
    label: "Subscription",
    route: "/subscription-plans",
    badge: "Standard",
  },
  {
    id: "analytics",
    icon: "stats-chart-outline" as const,
    label: "Analytics",
    route: null,
  },
  {
    id: "payment-methods",
    icon: "card-outline" as const,
    label: "Payment Methods",
    route: null,
  },
  {
    id: "notifications",
    icon: "notifications-outline" as const,
    label: "Notifications",
    route: null,
  },
  {
    id: "help",
    icon: "help-circle-outline" as const,
    label: "Help & Support",
    route: null,
  },
  {
    id: "about",
    icon: "information-circle-outline" as const,
    label: "About",
    route: null,
  },
  {
    id: "terms",
    icon: "document-text-outline" as const,
    label: "Terms & Privacy",
    route: null,
  },
];

export default function OwnerProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          // TODO: Clear auth state and navigate to login
          router.replace("/(auth)/welcome");
        },
      },
    ]);
  };

  return (
    <>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: insets.top + Spacing.xl,
              paddingBottom: 100 + insets.bottom,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: USER.avatar }} style={styles.avatar} />
              {USER.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
              )}
            </View>

            <Text style={styles.userName}>{USER.name}</Text>
            <View style={styles.roleBadge}>
              <Ionicons name="home" size={12} color={Colors.primaryGreen} />
              <Text style={styles.roleBadgeText}>Property Owner</Text>
            </View>
            <Text style={styles.memberSince}>
              Member since {USER.memberSince}
            </Text>

            <TouchableOpacity style={styles.editButton} activeOpacity={0.7}>
              <Ionicons
                name="create-outline"
                size={18}
                color={Colors.primaryGreen}
              />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{USER.stats.listings}</Text>
              <Text style={styles.statLabel}>Listings</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{USER.stats.views}</Text>
              <Text style={styles.statLabel}>Views</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{USER.stats.inquiries}</Text>
              <Text style={styles.statLabel}>Inquiries</Text>
            </View>
          </View>

          {/* Menu Items */}
          <View style={styles.menuContainer}>
            {MENU_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
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
                  <View style={styles.menuIconContainer}>
                    <Ionicons
                      name={item.icon}
                      size={22}
                      color={Colors.textPrimary}
                    />
                  </View>
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                </View>

                <View style={styles.menuItemRight}>
                  {item.badge && (
                    <View style={styles.menuBadge}>
                      <Text style={styles.menuBadgeText}>{item.badge}</Text>
                    </View>
                  )}
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={Colors.textSecondary}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>

          {/* App Version */}
          <Text style={styles.versionText}>Version 1.0.0</Text>
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
    borderColor: Colors.primaryGreen,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryGreen,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.background,
  },
  userName: {
    ...Typography.headlineMedium,
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: `${Colors.primaryGreen}15`,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: Spacing.xs,
  },
  roleBadgeText: {
    ...Typography.labelMedium,
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
  memberSince: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
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
    borderColor: Colors.primaryGreen,
  },
  editButtonText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
  // Stats
  statsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.divider,
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
  statValue: {
    ...Typography.headlineMedium,
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: "80%",
    backgroundColor: Colors.divider,
    alignSelf: "center",
  },
  // Menu
  menuContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.divider,
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
    borderBottomColor: Colors.divider,
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
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemLabel: {
    ...Typography.bodyMedium,
    fontSize: 15,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  menuBadge: {
    backgroundColor: `${Colors.primaryGreen}15`,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  menuBadgeText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
  // Logout
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FF3B30",
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
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
