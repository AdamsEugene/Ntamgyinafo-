import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Platform,
  FlatList,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Typography, Spacing } from "@/constants/design";
import {
  FloatingHeaderStyles,
  HEADER_ICON_SIZE,
} from "@/components/FloatingHeader.styles";

// Quick actions
const QUICK_ACTIONS = [
  {
    id: "add",
    label: "Add Listing",
    icon: "add-circle" as const,
    color: Colors.primaryGreen,
    route: "/(owner-tabs)/add-listing",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: "analytics" as const,
    color: "#3B82F6",
    route: null,
  },
  {
    id: "messages",
    label: "Messages",
    icon: "chatbubbles" as const,
    color: "#8B5CF6",
    route: "/(owner-tabs)/messages",
  },
  {
    id: "promote",
    label: "Promote",
    icon: "megaphone" as const,
    color: "#F59E0B",
    route: null,
  },
];

// Mock data for the dashboard
const STATS = [
  {
    id: "views",
    label: "Total Views",
    value: "1,234",
    change: "+12%",
    trending: "up" as const,
    icon: "eye" as const,
    color: "#3B82F6",
  },
  {
    id: "inquiries",
    label: "Inquiries",
    value: "48",
    change: "+8%",
    trending: "up" as const,
    icon: "chatbubble" as const,
    color: "#10B981",
  },
  {
    id: "active",
    label: "Active Listings",
    value: "5",
    change: "0%",
    trending: "neutral" as const,
    icon: "checkmark-circle" as const,
    color: "#8B5CF6",
  },
  {
    id: "pending",
    label: "Pending Review",
    value: "2",
    change: "-1",
    trending: "down" as const,
    icon: "time" as const,
    color: "#F59E0B",
  },
];

const SUBSCRIPTION = {
  plan: "Standard Plan",
  listingsUsed: 3,
  listingsTotal: 5,
  expiresDate: "Feb 28, 2025",
  daysRemaining: 68,
};

const RECENT_INQUIRIES = [
  {
    id: "1",
    buyer: {
      name: "Kwame Asante",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
    property: "4 Bedroom House in East Legon",
    message: "Is the property still available?",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: "2",
    buyer: {
      name: "Ama Mensah",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    property: "3 Bedroom Apartment in Airport",
    message: "Can I schedule a viewing?",
    time: "5 hours ago",
    unread: true,
  },
  {
    id: "3",
    buyer: {
      name: "Kofi Owusu",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    },
    property: "2 Plots of Land in Tema",
    message: "What are the payment terms?",
    time: "Yesterday",
    unread: false,
  },
];

const TOP_LISTINGS = [
  {
    id: "1",
    title: "4 Bedroom House",
    location: "East Legon, Accra",
    price: 850000,
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop",
    views: 234,
    inquiries: 12,
    status: "active" as const,
  },
  {
    id: "2",
    title: "3 Bedroom Apartment",
    location: "Airport Residential",
    price: 650000,
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop",
    views: 189,
    inquiries: 8,
    status: "active" as const,
  },
];

export default function OwnerDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const formatPrice = (price: number): string => {
    if (price >= 1000000) {
      return `GHS ${(price / 1000000).toFixed(1)}M`;
    }
    if (price >= 1000) {
      return `GHS ${(price / 1000).toFixed(0)}K`;
    }
    return `GHS ${price.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return Colors.primaryGreen;
      case "pending":
        return "#F59E0B";
      case "sold":
        return "#3B82F6";
      case "rented":
        return "#8B5CF6";
      default:
        return Colors.textSecondary;
    }
  };

  const getTrendIcon = (trending: string) => {
    switch (trending) {
      case "up":
        return "trending-up";
      case "down":
        return "trending-down";
      default:
        return "remove";
    }
  };

  const getTrendColor = (trending: string) => {
    switch (trending) {
      case "up":
        return "#10B981";
      case "down":
        return "#EF4444";
      default:
        return Colors.textSecondary;
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
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>Hi, Kofi 👋</Text>
            <Text style={styles.subGreeting}>Manage your properties</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              onPress={() => router.push("/(owner-tabs)/messages")}
              style={FloatingHeaderStyles.actionButton}
              activeOpacity={0.7}
            >
              <View style={FloatingHeaderStyles.actionButtonBackground}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={HEADER_ICON_SIZE}
                  color={Colors.textPrimary}
                />
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>3</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                // TODO: Navigate to notifications
              }}
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
                  <Text style={styles.notificationBadgeText}>5</Text>
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
              onRefresh={onRefresh}
              tintColor={Colors.primaryGreen}
            />
          }
        >
          {/* Owner Stats Banner */}
          <View style={styles.statsBanner}>
            <View style={styles.quickStatsRow}>
              <View style={styles.quickStat}>
                <View style={styles.quickStatIcon}>
                  <Ionicons
                    name="wallet-outline"
                    size={18}
                    color={Colors.primaryGreen}
                  />
                </View>
                <Text style={styles.quickStatValue}>GHS 2.5M</Text>
                <Text style={styles.quickStatLabel}>Total Value</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStat}>
                <View style={styles.quickStatIcon}>
                  <Ionicons
                    name="home-outline"
                    size={18}
                    color={Colors.primaryGreen}
                  />
                </View>
                <Text style={styles.quickStatValue}>5</Text>
                <Text style={styles.quickStatLabel}>Properties</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStat}>
                <View style={styles.quickStatIcon}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={18}
                    color={Colors.primaryGreen}
                  />
                </View>
                <Text style={styles.quickStatValue}>48</Text>
                <Text style={styles.quickStatLabel}>Inquiries</Text>
              </View>
            </View>
          </View>
          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                activeOpacity={0.8}
                onPress={() => {
                  if (action.route) {
                    router.push(action.route as never);
                  }
                }}
              >
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: `${action.color}15` },
                  ]}
                >
                  <Ionicons name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Stats Grid */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Performance Overview</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.seeAll}>This Month</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statsGrid}>
              {STATS.map((stat) => (
                <View key={stat.id} style={styles.statCard}>
                  <View style={styles.statHeader}>
                    <View
                      style={[
                        styles.statIconContainer,
                        { backgroundColor: `${stat.color}15` },
                      ]}
                    >
                      <Ionicons name={stat.icon} size={18} color={stat.color} />
                    </View>
                    <View
                      style={[
                        styles.trendBadge,
                        {
                          backgroundColor: `${getTrendColor(stat.trending)}15`,
                        },
                      ]}
                    >
                      <Ionicons
                        name={getTrendIcon(stat.trending) as any}
                        size={12}
                        color={getTrendColor(stat.trending)}
                      />
                      <Text
                        style={[
                          styles.trendText,
                          { color: getTrendColor(stat.trending) },
                        ]}
                      >
                        {stat.change}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Subscription Card */}
          <TouchableOpacity
            style={styles.subscriptionCard}
            activeOpacity={0.9}
            onPress={() => router.push("/subscription-plans")}
          >
            <View style={styles.subscriptionContent}>
              <View style={styles.subscriptionHeader}>
                <View>
                  <View style={styles.planBadge}>
                    <Ionicons
                      name="diamond"
                      size={12}
                      color={Colors.primaryGreen}
                    />
                    <Text style={styles.planBadgeText}>
                      {SUBSCRIPTION.plan}
                    </Text>
                  </View>
                  <Text style={styles.subscriptionTitle}>
                    Your Subscription
                  </Text>
                </View>
                <View style={styles.daysCircle}>
                  <Text style={styles.daysNumber}>
                    {SUBSCRIPTION.daysRemaining}
                  </Text>
                  <Text style={styles.daysLabel}>days left</Text>
                </View>
              </View>

              <View style={styles.subscriptionProgress}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Listings Used</Text>
                  <Text style={styles.progressValue}>
                    {SUBSCRIPTION.listingsUsed}/{SUBSCRIPTION.listingsTotal}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${
                          (SUBSCRIPTION.listingsUsed /
                            SUBSCRIPTION.listingsTotal) *
                          100
                        }%`,
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.subscriptionFooter}>
                <Text style={styles.expiryText}>
                  Expires: {SUBSCRIPTION.expiresDate}
                </Text>
                <TouchableOpacity style={styles.upgradeButton}>
                  <Text style={styles.upgradeButtonText}>Upgrade</Text>
                  <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>

          {/* Recent Inquiries Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Inquiries</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push("/(owner-tabs)/messages")}
              >
                <Text style={styles.seeAll}>See All →</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inquiriesContainer}>
              {RECENT_INQUIRIES.map((inquiry) => (
                <TouchableOpacity
                  key={inquiry.id}
                  style={styles.inquiryCard}
                  activeOpacity={0.8}
                  onPress={() => {
                    // TODO: Navigate to chat
                  }}
                >
                  <View style={styles.inquiryLeft}>
                    <Image
                      source={{ uri: inquiry.buyer.avatar }}
                      style={styles.inquiryAvatar}
                    />
                    {inquiry.unread && <View style={styles.unreadDot} />}
                  </View>
                  <View style={styles.inquiryContent}>
                    <View style={styles.inquiryHeader}>
                      <Text style={styles.inquiryBuyerName}>
                        {inquiry.buyer.name}
                      </Text>
                      <Text style={styles.inquiryTime}>{inquiry.time}</Text>
                    </View>
                    <Text style={styles.inquiryProperty} numberOfLines={1}>
                      {inquiry.property}
                    </Text>
                    <Text style={styles.inquiryMessage} numberOfLines={1}>
                      {inquiry.message}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Top Performing Listings */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Listings</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push("/(owner-tabs)/my-listings")}
              >
                <Text style={styles.seeAll}>See All →</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={TOP_LISTINGS}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listingsContainer}
              keyExtractor={(item) => item.id}
              renderItem={({ item: listing }) => (
                <TouchableOpacity
                  style={styles.listingCard}
                  activeOpacity={0.8}
                  onPress={() =>
                    router.push(`/owner-listing/${listing.id}` as any)
                  }
                >
                  <Image
                    source={{ uri: listing.image }}
                    style={styles.listingImage}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.7)"]}
                    style={styles.listingOverlay}
                  />
                  <View
                    style={[
                      styles.listingStatusBadge,
                      { backgroundColor: getStatusColor(listing.status) },
                    ]}
                  >
                    <Text style={styles.listingStatusText}>
                      {listing.status.charAt(0).toUpperCase() +
                        listing.status.slice(1)}
                    </Text>
                  </View>
                  <View style={styles.listingInfo}>
                    <Text style={styles.listingTitle} numberOfLines={1}>
                      {listing.title}
                    </Text>
                    <Text style={styles.listingLocation} numberOfLines={1}>
                      {listing.location}
                    </Text>
                    <Text style={styles.listingPrice}>
                      {formatPrice(listing.price)}
                    </Text>
                    <View style={styles.listingStats}>
                      <View style={styles.listingStat}>
                        <Ionicons name="eye" size={14} color="#FFFFFF" />
                        <Text style={styles.listingStatText}>
                          {listing.views}
                        </Text>
                      </View>
                      <View style={styles.listingStat}>
                        <Ionicons name="chatbubble" size={14} color="#FFFFFF" />
                        <Text style={styles.listingStatText}>
                          {listing.inquiries}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </ScrollView>

        {/* Floating Add Button */}
        <TouchableOpacity
          style={[styles.floatingAddButton, { bottom: 100 + insets.bottom }]}
          activeOpacity={0.9}
          onPress={() => router.push("/(owner-tabs)/add-listing")}
        >
          <LinearGradient
            colors={[Colors.primaryGreen, "#2E7D32"]}
            style={styles.floatingAddButtonGradient}
          >
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  // Header
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    ...Typography.headlineMedium,
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  subGreeting: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
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
  // Stats Banner
  statsBanner: {
    marginBottom: Spacing.xl,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.divider,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  quickStatsRow: {
    flexDirection: "row",
  },
  quickStat: {
    flex: 1,
    alignItems: "center",
  },
  quickStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${Colors.primaryGreen}10`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  quickStatValue: {
    ...Typography.headlineMedium,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  quickStatLabel: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: Colors.divider,
    marginVertical: 8,
  },
  // Content
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
  },
  // Quick Actions
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.xl,
  },
  quickActionCard: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    width: "23%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  quickActionLabel: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  // Section
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.titleLarge,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  seeAll: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  statCard: {
    width: "47.5%",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  trendText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "600",
  },
  statValue: {
    ...Typography.headlineMedium,
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  // Subscription Card
  subscriptionCard: {
    marginBottom: Spacing.xl,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  subscriptionContent: {
    padding: Spacing.lg,
  },
  subscriptionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  planBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${Colors.primaryGreen}15`,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: Spacing.sm,
  },
  planBadgeText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "600",
    color: Colors.primaryGreen,
    letterSpacing: 0.3,
  },
  subscriptionTitle: {
    ...Typography.titleMedium,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  daysCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: `${Colors.primaryGreen}10`,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: `${Colors.primaryGreen}30`,
  },
  daysNumber: {
    ...Typography.titleLarge,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primaryGreen,
  },
  daysLabel: {
    ...Typography.caption,
    fontSize: 9,
    color: Colors.textSecondary,
    marginTop: -2,
  },
  subscriptionProgress: {
    marginBottom: Spacing.lg,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  progressLabel: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  progressValue: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.divider,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primaryGreen,
    borderRadius: 3,
  },
  subscriptionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  expiryText: {
    ...Typography.bodyMedium,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.primaryGreen,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  upgradeButtonText: {
    ...Typography.labelMedium,
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Inquiries
  inquiriesContainer: {
    gap: Spacing.sm,
  },
  inquiryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  inquiryLeft: {
    position: "relative",
    marginRight: Spacing.md,
  },
  inquiryAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  unreadDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primaryGreen,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  inquiryContent: {
    flex: 1,
  },
  inquiryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  inquiryBuyerName: {
    ...Typography.titleMedium,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  inquiryTime: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  inquiryProperty: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.primaryGreen,
    marginBottom: 2,
  },
  inquiryMessage: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  // Listings
  listingsContainer: {
    gap: Spacing.md,
    paddingRight: Spacing.xl,
  },
  listingCard: {
    width: 220,
    height: 260,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: Colors.surface,
  },
  listingImage: {
    width: "100%",
    height: "100%",
  },
  listingOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
  },
  listingStatusBadge: {
    position: "absolute",
    top: Spacing.md,
    left: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  listingStatusText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  listingInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
  },
  listingTitle: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  listingLocation: {
    ...Typography.caption,
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: Spacing.xs,
  },
  listingPrice: {
    ...Typography.titleMedium,
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: Spacing.sm,
  },
  listingStats: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  listingStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  listingStatText: {
    ...Typography.caption,
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
  },
  // Floating Add Button
  floatingAddButton: {
    position: "absolute",
    right: Spacing.xl,
    borderRadius: 28,
    overflow: "hidden",
    zIndex: 100,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  floatingAddButtonGradient: {
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
});
