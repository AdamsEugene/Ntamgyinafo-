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
import { Colors, Typography, Spacing } from "@/constants/design";
import {
  FloatingHeaderStyles,
  HEADER_ICON_SIZE,
} from "@/components/FloatingHeader.styles";

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
    color: Colors.primaryGreen,
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
    color: Colors.primaryGreen,
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
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const getAlertStyle = (type: AlertItem["type"]) => {
    switch (type) {
      case "warning":
        return {
          bg: "#FEF3C7",
          border: "#F59E0B",
          icon: "warning" as const,
          color: "#F59E0B",
        };
      case "error":
        return {
          bg: "#FEE2E2",
          border: "#EF4444",
          icon: "alert-circle" as const,
          color: "#EF4444",
        };
      case "info":
        return {
          bg: "#DBEAFE",
          border: "#3B82F6",
          icon: "information-circle" as const,
          color: "#3B82F6",
        };
    }
  };

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
            <Text style={styles.headerTitleText}>Admin Dashboard</Text>
          </View>

          {/* Action Buttons */}
          <View style={FloatingHeaderStyles.headerActions}>
            <TouchableOpacity
              onPress={() => router.push("/notifications")}
              style={FloatingHeaderStyles.actionButton}
              activeOpacity={0.7}
            >
              <View style={FloatingHeaderStyles.actionButtonBackground}>
                <Ionicons
                  name="notifications-outline"
                  size={HEADER_ICON_SIZE}
                  color={Colors.textPrimary}
                />
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>12</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primaryGreen}
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
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                </View>
                <TouchableOpacity>
                  <Ionicons name="close" size={20} color={alertStyle.color} />
                </TouchableOpacity>
              </View>
            );
          })}

          {/* Key Metrics */}
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.metricsGrid}>
            {METRICS.map((metric) => (
              <TouchableOpacity
                key={metric.id}
                style={styles.metricCard}
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
                <Text style={styles.metricValue}>{metric.value}</Text>
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <View style={styles.metricChange}>
                  {metric.changeType === "up" && (
                    <Ionicons
                      name="arrow-up"
                      size={12}
                      color={Colors.primaryGreen}
                    />
                  )}
                  {metric.changeType === "down" && (
                    <Ionicons name="arrow-down" size={12} color="#EF4444" />
                  )}
                  <Text
                    style={[
                      styles.metricChangeText,
                      metric.changeType === "up" && {
                        color: Colors.primaryGreen,
                      },
                      metric.changeType === "down" && { color: "#EF4444" },
                    ]}
                  >
                    {metric.change}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickAction}
              activeOpacity={0.7}
              onPress={() => router.push("/(admin-tabs)/properties")}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: `${Colors.primaryGreen}15` },
                ]}
              >
                <Ionicons name="home" size={24} color={Colors.primaryGreen} />
              </View>
              <Text style={styles.quickActionText}>Review Properties</Text>
              <View style={styles.quickActionBadge}>
                <Text style={styles.quickActionBadgeText}>32</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
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
              <Text style={styles.quickActionText}>Review Users</Text>
              <View style={styles.quickActionBadge}>
                <Text style={styles.quickActionBadgeText}>16</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
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
              <Text style={styles.quickActionText}>View Reports</Text>
            </TouchableOpacity>
          </View>

          {/* Pending Approvals */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pending Approvals</Text>
            <TouchableOpacity
              onPress={() => router.push("/(admin-tabs)/properties")}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.pendingList}>
            {PENDING_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.pendingItem}
                activeOpacity={0.7}
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
                          : { backgroundColor: `${Colors.primaryGreen}15` },
                      ]}
                    >
                      <Ionicons
                        name={item.type === "user" ? "person" : "home"}
                        size={10}
                        color={
                          item.type === "user" ? "#3B82F6" : Colors.primaryGreen
                        }
                      />
                      <Text
                        style={[
                          styles.pendingTypeText,
                          {
                            color:
                              item.type === "user"
                                ? "#3B82F6"
                                : Colors.primaryGreen,
                          },
                        ]}
                      >
                        {item.type === "user" ? "User" : "Property"}
                      </Text>
                    </View>
                    <Text style={styles.pendingTime}>{item.time}</Text>
                  </View>
                  <Text style={styles.pendingTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.pendingSubtitle} numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Recent Activity */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
          </View>
          <View style={styles.activityList}>
            {RECENT_ACTIVITY.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
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
                  <Text style={styles.activityMessage}>{activity.message}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
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
    borderColor: Colors.surface,
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
  },
  // Alert Card
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.md,
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
    color: Colors.textSecondary,
    marginTop: 2,
  },
  // Section
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  seeAllText: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
  // Metrics Grid
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  metricCard: {
    width: "47%",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
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
    color: Colors.textPrimary,
  },
  metricLabel: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
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
    color: Colors.textSecondary,
  },
  // Quick Actions
  quickActions: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  quickAction: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  quickActionText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textPrimary,
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
  // Pending List
  pendingList: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  pendingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    gap: Spacing.md,
  },
  pendingImage: {
    width: 56,
    height: 56,
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
    color: Colors.textSecondary,
  },
  pendingTitle: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  pendingSubtitle: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  // Activity List
  activityList: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
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
    color: Colors.textPrimary,
  },
  activityTime: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
