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

// Mock data for the dashboard
const STATS = [
  {
    id: "views",
    label: "Views",
    value: "1,234",
    icon: "eye-outline" as const,
    color: "#3B82F6",
  },
  {
    id: "inquiries",
    label: "Inquiries",
    value: "48",
    icon: "chatbubble-outline" as const,
    color: "#10B981",
  },
  {
    id: "active",
    label: "Active",
    value: "5",
    icon: "checkmark-circle-outline" as const,
    color: "#8B5CF6",
  },
  {
    id: "pending",
    label: "Pending",
    value: "2",
    icon: "time-outline" as const,
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
    time: "Yesterday",
    unread: false,
  },
];

const RECENT_LISTINGS = [
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
  {
    id: "3",
    title: "2 Plots of Land",
    location: "Tema Community 25",
    price: 120000,
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop",
    views: 156,
    inquiries: 5,
    status: "pending" as const,
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

  return (
    <>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* Decorative Background */}
        <View style={styles.decorativeBackground}>
          <LinearGradient
            colors={[`${Colors.primaryGreen}08`, "transparent"]}
            style={styles.gradientBg}
          />
          <View style={styles.circle1} />
          <View style={styles.circle2} />
        </View>

        {/* Header */}
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

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: 90 + insets.top,
              paddingBottom: 120 + insets.bottom,
            },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {STATS.map((stat) => (
              <TouchableOpacity
                key={stat.id}
                style={styles.statCard}
                activeOpacity={0.8}
                onPress={() => {
                  // TODO: Navigate to detailed analytics
                }}
              >
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: `${stat.color}15` },
                  ]}
                >
                  <Ionicons name={stat.icon} size={22} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Subscription Card */}
          <TouchableOpacity
            style={styles.subscriptionCard}
            activeOpacity={0.9}
            onPress={() => router.push("/subscription-plans")}
          >
            <LinearGradient
              colors={[Colors.primaryGreen, "#2E7D32"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.subscriptionGradient}
            >
              <View style={styles.subscriptionHeader}>
                <View>
                  <Text style={styles.subscriptionPlan}>
                    {SUBSCRIPTION.plan}
                  </Text>
                  <Text style={styles.subscriptionExpiry}>
                    Expires: {SUBSCRIPTION.expiresDate}
                  </Text>
                </View>
                <View style={styles.subscriptionBadge}>
                  <Ionicons name="diamond" size={16} color="#FFD700" />
                </View>
              </View>

              <View style={styles.subscriptionProgress}>
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
                <Text style={styles.progressText}>
                  {SUBSCRIPTION.listingsUsed}/{SUBSCRIPTION.listingsTotal}{" "}
                  listings used
                </Text>
              </View>

              <View style={styles.subscriptionFooter}>
                <View style={styles.daysRemaining}>
                  <Ionicons name="time-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.daysRemainingText}>
                    {SUBSCRIPTION.daysRemaining} days remaining
                  </Text>
                </View>
                <TouchableOpacity style={styles.renewButton}>
                  <Text style={styles.renewButtonText}>Upgrade</Text>
                  <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Recent Inquiries Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Inquiries</Text>
              <TouchableOpacity activeOpacity={0.7}>
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
                    <Text style={styles.inquiryBuyerName}>
                      {inquiry.buyer.name}
                    </Text>
                    <Text style={styles.inquiryProperty} numberOfLines={1}>
                      {inquiry.property}
                    </Text>
                    <Text style={styles.inquiryTime}>{inquiry.time}</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* My Listings Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Listings</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push("/(owner-tabs)/my-listings")}
              >
                <Text style={styles.seeAll}>See All →</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.listingsContainer}>
              {RECENT_LISTINGS.map((listing) => (
                <TouchableOpacity
                  key={listing.id}
                  style={styles.listingCard}
                  activeOpacity={0.8}
                  onPress={() => router.push(`/property/${listing.id}`)}
                >
                  <Image
                    source={{ uri: listing.image }}
                    style={styles.listingImage}
                    resizeMode="cover"
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
                  <View style={styles.listingContent}>
                    <Text style={styles.listingTitle} numberOfLines={1}>
                      {listing.title}
                    </Text>
                    <View style={styles.listingLocationRow}>
                      <Ionicons
                        name="location-outline"
                        size={12}
                        color={Colors.textSecondary}
                      />
                      <Text style={styles.listingLocation} numberOfLines={1}>
                        {listing.location}
                      </Text>
                    </View>
                    <Text style={styles.listingPrice}>
                      {formatPrice(listing.price)}
                    </Text>
                    <View style={styles.listingStats}>
                      <View style={styles.listingStat}>
                        <Ionicons
                          name="eye-outline"
                          size={14}
                          color={Colors.textSecondary}
                        />
                        <Text style={styles.listingStatText}>
                          {listing.views}
                        </Text>
                      </View>
                      <View style={styles.listingStat}>
                        <Ionicons
                          name="chatbubble-outline"
                          size={14}
                          color={Colors.textSecondary}
                        />
                        <Text style={styles.listingStatText}>
                          {listing.inquiries}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
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
            <Text style={styles.floatingAddButtonText}>Add Listing</Text>
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
  decorativeBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  gradientBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 300,
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
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 100,
    paddingBottom: Spacing["2xl"],
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    ...Typography.headlineMedium,
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  subGreeting: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
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
  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    width: "47%",
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.lg,
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
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  statValue: {
    ...Typography.headlineLarge,
    fontSize: 28,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  // Subscription Card
  subscriptionCard: {
    marginBottom: Spacing.xl,
    borderRadius: 24,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  subscriptionGradient: {
    padding: Spacing.xl,
  },
  subscriptionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  subscriptionPlan: {
    ...Typography.titleLarge,
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  subscriptionExpiry: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  subscriptionBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  subscriptionProgress: {
    marginBottom: Spacing.lg,
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    marginBottom: Spacing.sm,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
  },
  progressText: {
    ...Typography.caption,
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
  },
  subscriptionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  daysRemaining: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  daysRemainingText: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
  },
  renewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  renewButtonText: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Section
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.titleLarge,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  seeAll: {
    ...Typography.labelLarge,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
  // Inquiries
  inquiriesContainer: {
    gap: Spacing.md,
  },
  inquiryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
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
  inquiryBuyerName: {
    ...Typography.titleMedium,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  inquiryProperty: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  inquiryTime: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  // Listings
  listingsContainer: {
    gap: Spacing.md,
  },
  listingCard: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
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
  listingImage: {
    width: 120,
    height: 120,
  },
  listingStatusBadge: {
    position: "absolute",
    top: Spacing.sm,
    left: Spacing.sm,
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
  listingContent: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: "space-between",
  },
  listingTitle: {
    ...Typography.titleMedium,
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  listingLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  listingLocation: {
    ...Typography.bodyMedium,
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  listingPrice: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primaryGreen,
    marginBottom: 8,
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
    color: Colors.textSecondary,
  },
  // Floating Add Button
  floatingAddButton: {
    position: "absolute",
    right: Spacing.xl,
    borderRadius: 28,
    overflow: "hidden",
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
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  floatingAddButtonText: {
    ...Typography.labelLarge,
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
