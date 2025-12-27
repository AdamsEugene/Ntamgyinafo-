import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
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

interface MetricCard {
  id: string;
  label: string;
  value: string;
  change: string;
  changeType: "up" | "down" | "neutral";
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

interface PendingItem {
  id: string;
  type: "user" | "property";
  title: string;
  subtitle: string;
  avatar?: string;
  image?: string;
  time: string;
}

interface ActivityItem {
  id: string;
  type: "approval" | "rejection" | "payment" | "signup" | "listing";
  message: string;
  time: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

interface AlertItem {
  id: string;
  type: "warning" | "error" | "info";
  title: string;
  message: string;
}

const METRICS: MetricCard[] = [
  {
    id: "users",
    label: "Total Users",
    value: "12,458",
    change: "+234 this week",
    changeType: "up",
    icon: "people",
    color: "#3B82F6",
  },
  {
    id: "listings",
    label: "Active Listings",
    value: "3,892",
    change: "+56 today",
    changeType: "up",
    icon: "home",
    color: "#4CAF50",
  },
  {
    id: "pending",
    label: "Pending Approvals",
    value: "48",
    change: "12 urgent",
    changeType: "neutral",
    icon: "time",
    color: "#F59E0B",
  },
  {
    id: "revenue",
    label: "Revenue (Month)",
    value: "₵45,280",
    change: "+18% vs last month",
    changeType: "up",
    icon: "cash",
    color: "#8B5CF6",
  },
];

const PENDING_ITEMS: PendingItem[] = [
  {
    id: "p1",
    type: "property",
    title: "4 Bedroom House in East Legon",
    subtitle: "By Kofi Mensah • 2 hours ago",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&h=200&fit=crop",
    time: "2h",
  },
  {
    id: "p2",
    type: "property",
    title: "3 Bedroom Apartment in Cantonments",
    subtitle: "By Ama Serwaa • 4 hours ago",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&h=200&fit=crop",
    time: "4h",
  },
  {
    id: "u1",
    type: "user",
    title: "Kwame Asante",
    subtitle: "Owner verification request",
    avatar: "https://i.pravatar.cc/150?img=3",
    time: "1h",
  },
  {
    id: "u2",
    type: "user",
    title: "Akua Boateng",
    subtitle: "Owner verification request",
    avatar: "https://i.pravatar.cc/150?img=5",
    time: "3h",
  },
];

const RECENT_ACTIVITY: ActivityItem[] = [
  {
    id: "a1",
    type: "approval",
    message: 'Property "2 Bed Apt in Osu" was approved',
    time: "10 min ago",
    icon: "checkmark-circle",
    color: "#4CAF50",
  },
  {
    id: "a2",
    type: "payment",
    message: "New payment of ₵80 from John Doe",
    time: "25 min ago",
    icon: "card",
    color: "#8B5CF6",
  },
  {
    id: "a3",
    type: "signup",
    message: "New user registered: Esi Mensah",
    time: "1 hour ago",
    icon: "person-add",
    color: "#3B82F6",
  },
  {
    id: "a4",
    type: "rejection",
    message: 'Property "Land in Tema" was rejected',
    time: "2 hours ago",
    icon: "close-circle",
    color: "#EF4444",
  },
  {
    id: "a5",
    type: "listing",
    message: "New property listed by Kofi A.",
    time: "3 hours ago",
    icon: "home",
    color: "#F59E0B",
  },
];

const SYSTEM_ALERTS: AlertItem[] = [
  {
    id: "s1",
    type: "warning",
    title: "High Pending Queue",
    message: "48 items pending review for more than 24 hours",
  },
  {
    id: "s2",
    type: "info",
    title: "System Update",
    message: "Scheduled maintenance on Dec 25, 2024 at 2:00 AM",
  },
];

export default function AdminDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const getAlertStyle = (type: AlertItem["type"]) => {
    const isDarkMode = isDark;
    switch (type) {
      case "warning":
        return {
          bg: isDarkMode ? "#78350F" : "#FEF3C7",
          border: "#F59E0B",
          icon: "warning" as const,
          color: "#F59E0B",
        };
      case "error":
        return {
          bg: isDarkMode ? "#7F1D1D" : "#FEE2E2",
          border: "#EF4444",
          icon: "alert-circle" as const,
          color: "#EF4444",
        };
      case "info":
        return {
          bg: isDarkMode ? "#1E3A8A" : "#DBEAFE",
          border: "#3B82F6",
          icon: "information-circle" as const,
          color: "#3B82F6",
        };
    }
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
          title="Admin Dashboard"
          rightContent={
            <HeaderActionButton
              icon="notifications-outline"
              onPress={() => router.push("/notifications")}
              badge={12}
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              progressViewOffset={80 + insets.top}
            />
          }
        >
          {/* System Alerts */}
          {SYSTEM_ALERTS.map((alert) => {
            const alertStyle = getAlertStyle(alert.type);
            return (
              <View
                key={alert.id}
                style={[
                  styles.alertCard,
                  {
                    backgroundColor: alertStyle.bg,
                    borderColor: alertStyle.border,
                  },
                ]}
              >
                <Ionicons
                  name={alertStyle.icon}
                  size={24}
                  color={alertStyle.color}
                />
                <View style={styles.alertContent}>
                  <Text
                    style={[styles.alertTitle, { color: alertStyle.color }]}
                  >
                    {alert.title}
                  </Text>
                  <Text
                    style={[
                      styles.alertMessage,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {alert.message}
                  </Text>
                </View>
                <TouchableOpacity>
                  <Ionicons name="close" size={20} color={alertStyle.color} />
                </TouchableOpacity>
              </View>
            );
          })}

          {/* Key Metrics */}
          <Text style={[styles.sectionTitleFirst, { color: colors.text }]}>
            Overview
          </Text>
          <View style={styles.metricsGrid}>
            {METRICS.map((metric) => (
              <TouchableOpacity
                key={metric.id}
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.divider,
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => {
                  if (metric.id === "users") router.push("/(admin-tabs)/users");
                  if (metric.id === "listings")
                    router.push("/(admin-tabs)/properties");
                  if (metric.id === "pending")
                    router.push("/(admin-tabs)/properties");
                  if (metric.id === "revenue")
                    router.push("/(admin-tabs)/reports");
                }}
              >
                <View
                  style={[
                    styles.metricIconBg,
                    { backgroundColor: `${metric.color}15` },
                  ]}
                >
                  <Ionicons name={metric.icon} size={22} color={metric.color} />
                </View>
                <Text style={[styles.metricValue, { color: colors.text }]}>
                  {metric.value}
                </Text>
                <Text
                  style={[styles.metricLabel, { color: colors.textSecondary }]}
                >
                  {metric.label}
                </Text>
                <View style={styles.metricChange}>
                  {metric.changeType === "up" && (
                    <Ionicons
                      name="arrow-up"
                      size={12}
                      color={colors.primary}
                    />
                  )}
                  {metric.changeType === "down" && (
                    <Ionicons name="arrow-down" size={12} color="#EF4444" />
                  )}
                  <Text
                    style={[
                      styles.metricChangeText,
                      metric.changeType === "up" && {
                        color: colors.primary,
                      },
                      metric.changeType === "down" && { color: "#EF4444" },
                      metric.changeType === "neutral" && {
                        color: colors.textSecondary,
                      },
                    ]}
                  >
                    {metric.change}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Actions */}
          <Text
            style={[
              styles.sectionTitle,
              { marginTop: Spacing.xl, color: colors.text },
            ]}
          >
            Quick Actions
          </Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[
                styles.quickAction,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => router.push("/(admin-tabs)/properties")}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: `${colors.primary}15` },
                ]}
              >
                <Ionicons name="home" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.quickActionText, { color: colors.text }]}>
                Review Properties
              </Text>
              <View style={styles.quickActionBadge}>
                <Text style={styles.quickActionBadgeText}>32</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickAction,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => router.push("/(admin-tabs)/users")}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: "#3B82F615" },
                ]}
              >
                <Ionicons name="people" size={24} color="#3B82F6" />
              </View>
              <Text style={[styles.quickActionText, { color: colors.text }]}>
                Review Users
              </Text>
              <View style={styles.quickActionBadge}>
                <Text style={styles.quickActionBadgeText}>16</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickAction,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => router.push("/(admin-tabs)/reports")}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: "#8B5CF615" },
                ]}
              >
                <Ionicons name="document-text" size={24} color="#8B5CF6" />
              </View>
              <Text style={[styles.quickActionText, { color: colors.text }]}>
                View Reports
              </Text>
            </TouchableOpacity>
          </View>

          {/* Additional Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[
                styles.quickAction,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => router.push("/(admin-tabs)/subscriptions")}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: `${colors.primary}15` },
                ]}
              >
                <Ionicons name="card" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.quickActionText, { color: colors.text }]}>
                Subscriptions
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickAction,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => router.push("/(admin-tabs)/analytics")}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: "#10B98115" },
                ]}
              >
                <Ionicons name="stats-chart" size={24} color="#10B981" />
              </View>
              <Text style={[styles.quickActionText, { color: colors.text }]}>
                Analytics
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickAction,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => router.push("/(admin-tabs)/reports-support")}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: "#F59E0B15" },
                ]}
              >
                <Ionicons name="flag" size={24} color="#F59E0B" />
              </View>
              <Text style={[styles.quickActionText, { color: colors.text }]}>
                Reports & Support
              </Text>
              <View style={styles.quickActionBadge}>
                <Text style={styles.quickActionBadgeText}>8</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Settings Action */}
          <TouchableOpacity
            style={[
              styles.settingsAction,
              {
                backgroundColor: colors.surface,
                borderColor: colors.divider,
              },
            ]}
            activeOpacity={0.7}
            onPress={() => router.push("/(admin-tabs)/settings")}
          >
            <View style={styles.settingsActionLeft}>
              <View
                style={[
                  styles.settingsActionIcon,
                  { backgroundColor: `${colors.primary}15` },
                ]}
              >
                <Ionicons name="settings" size={24} color={colors.primary} />
              </View>
              <View style={styles.settingsActionContent}>
                <Text style={[styles.settingsActionTitle, { color: colors.text }]}>
                  System Settings
                </Text>
                <Text
                  style={[
                    styles.settingsActionSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  Manage app settings, payment methods, and notifications
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Pending Approvals */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Pending Approvals
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(admin-tabs)/properties")}
            >
              <Text style={[styles.seeAllText, { color: colors.primary }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>
          <View
            style={[
              styles.pendingList,
              {
                backgroundColor: colors.surface,
                borderColor: colors.divider,
              },
            ]}
          >
            {PENDING_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.pendingItem,
                  { borderBottomColor: colors.divider },
                ]}
                activeOpacity={0.7}
                onPress={() => {
                  if (item.type === "property") {
                    router.push(`/admin-review/${item.id}`);
                  } else {
                    // For users, go to user profile screen
                    router.push(`/admin-user/${item.id}`);
                  }
                }}
              >
                <Image
                  source={{
                    uri: item.type === "user" ? item.avatar : item.image,
                  }}
                  style={[
                    styles.pendingImage,
                    item.type === "user" && styles.pendingAvatar,
                  ]}
                />
                <View style={styles.pendingContent}>
                  <View style={styles.pendingHeader}>
                    <View
                      style={[
                        styles.pendingTypeBadge,
                        item.type === "user"
                          ? { backgroundColor: "#3B82F615" }
                          : { backgroundColor: `${colors.primary}15` },
                      ]}
                    >
                      <Ionicons
                        name={item.type === "user" ? "person" : "home"}
                        size={10}
                        color={
                          item.type === "user" ? "#3B82F6" : colors.primary
                        }
                      />
                      <Text
                        style={[
                          styles.pendingTypeText,
                          {
                            color:
                              item.type === "user" ? "#3B82F6" : colors.primary,
                          },
                        ]}
                      >
                        {item.type === "user" ? "User" : "Property"}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.pendingTime,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {item.time}
                    </Text>
                  </View>
                  <Text
                    style={[styles.pendingTitle, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.pendingSubtitle,
                      { color: colors.textSecondary },
                    ]}
                    numberOfLines={1}
                  >
                    {item.subtitle}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Recent Activity */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recent Activity
            </Text>
          </View>
          <View
            style={[
              styles.activityList,
              {
                backgroundColor: colors.surface,
                borderColor: colors.divider,
              },
            ]}
          >
            {RECENT_ACTIVITY.map((activity) => (
              <View
                key={activity.id}
                style={[
                  styles.activityItem,
                  { borderBottomColor: colors.divider },
                ]}
              >
                <View
                  style={[
                    styles.activityIcon,
                    { backgroundColor: `${activity.color}15` },
                  ]}
                >
                  <Ionicons
                    name={activity.icon}
                    size={18}
                    color={activity.color}
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text
                    style={[styles.activityMessage, { color: colors.text }]}
                  >
                    {activity.message}
                  </Text>
                  <Text
                    style={[
                      styles.activityTime,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {activity.time}
                  </Text>
                </View>
              </View>
            ))}
          </View>
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
  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#EF4444",
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
  },
  notificationBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  // Alert Card
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: 14,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    gap: Spacing.md,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
  },
  alertMessage: {
    ...Typography.bodyMedium,
    fontSize: 12,
    marginTop: 2,
  },
  // Section
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
    marginTop: Spacing.xl,
  },
  sectionTitleFirst: {
    ...Typography.labelMedium,
    fontSize: 15,
    fontWeight: "700",
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.labelMedium,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: Spacing.md,
  },
  seeAllText: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
  },
  // Metrics Grid
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  metricCard: {
    width: "48.5%",
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  metricIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  metricValue: {
    ...Typography.headlineMedium,
    fontSize: 24,
    fontWeight: "800",
  },
  metricLabel: {
    ...Typography.caption,
    fontSize: 11,
    marginTop: 2,
  },
  metricChange: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: Spacing.xs,
  },
  metricChangeText: {
    ...Typography.caption,
    fontSize: 10,
  },
  // Quick Actions
  quickActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  quickAction: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    alignItems: "center",
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
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  quickActionText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  quickActionBadge: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: "#EF4444",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  quickActionBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  // Settings Action
  settingsAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    padding: Spacing.md,
    marginTop: Spacing.lg,
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
  settingsActionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: Spacing.md,
  },
  settingsActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsActionContent: {
    flex: 1,
  },
  settingsActionTitle: {
    ...Typography.bodyMedium,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  settingsActionSubtitle: {
    ...Typography.caption,
    fontSize: 12,
  },
  // Pending List
  pendingList: {
    borderRadius: 16,
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
  pendingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  pendingImage: {
    width: 52,
    height: 52,
    borderRadius: 12,
  },
  pendingAvatar: {
    borderRadius: 28,
  },
  pendingContent: {
    flex: 1,
  },
  pendingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  pendingTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pendingTypeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "600",
  },
  pendingTime: {
    ...Typography.caption,
    fontSize: 10,
  },
  pendingTitle: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  pendingSubtitle: {
    ...Typography.caption,
    fontSize: 11,
  },
  // Activity List
  activityList: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    marginBottom: Spacing.md,
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
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    ...Typography.bodyMedium,
    fontSize: 13,
  },
  activityTime: {
    ...Typography.caption,
    fontSize: 11,
    marginTop: 2,
  },
});
