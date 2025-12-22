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

// Status tabs with counts
const STATUS_TABS = [
  { id: "all", label: "All", count: 4 },
  { id: "active", label: "Active", count: 2 },
  { id: "pending", label: "Pending", count: 1 },
  { id: "sold", label: "Sold", count: 1 },
  { id: "rented", label: "Rented", count: 0 },
];

type ListingStatus = "active" | "pending" | "sold" | "rented";

interface Listing {
  id: string;
  title: string;
  location: string;
  price: number;
  image: string;
  views: number;
  inquiries: number;
  saves: number;
  status: ListingStatus;
  listedDate: string;
  daysActive: number;
}

// Mock listings
const LISTINGS: Listing[] = [
  {
    id: "1",
    title: "4 Bedroom House in East Legon",
    location: "East Legon, Accra",
    price: 850000,
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop",
    views: 234,
    inquiries: 12,
    saves: 45,
    status: "active",
    listedDate: "Dec 15, 2024",
    daysActive: 7,
  },
  {
    id: "2",
    title: "3 Bedroom Apartment in Airport",
    location: "Airport Residential, Accra",
    price: 650000,
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop",
    views: 189,
    inquiries: 8,
    saves: 32,
    status: "active",
    listedDate: "Dec 10, 2024",
    daysActive: 12,
  },
  {
    id: "3",
    title: "2 Plots of Land in Tema",
    location: "Tema Community 25",
    price: 120000,
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop",
    views: 156,
    inquiries: 5,
    saves: 18,
    status: "pending",
    listedDate: "Dec 20, 2024",
    daysActive: 2,
  },
  {
    id: "4",
    title: "Executive Mansion in Trasacco",
    location: "Trasacco Valley, Accra",
    price: 2500000,
    image:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop",
    views: 89,
    inquiries: 3,
    saves: 12,
    status: "sold",
    listedDate: "Nov 28, 2024",
    daysActive: 24,
  },
];

export default function MyListingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return "checkmark-circle";
      case "pending":
        return "time";
      case "sold":
        return "pricetag";
      case "rented":
        return "key";
      default:
        return "help-circle";
    }
  };

  const filteredListings =
    activeTab === "all"
      ? LISTINGS
      : LISTINGS.filter((l) => l.status === activeTab);

  const renderListingCard = (listing: Listing) => (
    <TouchableOpacity
      key={listing.id}
      style={styles.listingCard}
      activeOpacity={0.8}
      onPress={() => router.push(`/owner-listing/${listing.id}` as any)}
    >
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: listing.image }}
          style={styles.listingImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.4)"]}
          style={styles.imageOverlay}
        />

        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(listing.status) },
          ]}
        >
          <Ionicons
            name={getStatusIcon(listing.status) as any}
            size={12}
            color="#FFFFFF"
          />
          <Text style={styles.statusText}>
            {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
          </Text>
        </View>

        {/* Days Active Badge */}
        <View style={styles.daysActiveBadge}>
          <Ionicons name="calendar-outline" size={12} color="#FFFFFF" />
          <Text style={styles.daysActiveText}>{listing.daysActive}d</Text>
        </View>

        {/* Quick Stats on Image */}
        <View style={styles.imageStats}>
          <View style={styles.imageStat}>
            <Ionicons name="eye" size={14} color="#FFFFFF" />
            <Text style={styles.imageStatText}>{listing.views}</Text>
          </View>
          <View style={styles.imageStat}>
            <Ionicons name="heart" size={14} color="#FFFFFF" />
            <Text style={styles.imageStatText}>{listing.saves}</Text>
          </View>
          <View style={styles.imageStat}>
            <Ionicons name="chatbubble" size={14} color="#FFFFFF" />
            <Text style={styles.imageStatText}>{listing.inquiries}</Text>
          </View>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.listingContent}>
        <View style={styles.listingMain}>
          <Text style={styles.listingTitle} numberOfLines={1}>
            {listing.title}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color={Colors.primaryGreen} />
            <Text style={styles.locationText} numberOfLines={1}>
              {listing.location}
            </Text>
          </View>
        </View>

        <View style={styles.priceActionsRow}>
          <Text style={styles.listingPrice}>{formatPrice(listing.price)}</Text>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.7}
              onPress={(e) => {
                e.stopPropagation();
                // Edit listing
              }}
            >
              <Ionicons
                name="create-outline"
                size={18}
                color={Colors.primaryGreen}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.7}
              onPress={(e) => {
                e.stopPropagation();
                // View stats
              }}
            >
              <Ionicons name="stats-chart" size={18} color="#3B82F6" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.moreButton]}
              activeOpacity={0.7}
              onPress={(e) => {
                e.stopPropagation();
                // More options
              }}
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={18}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

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
            <TouchableOpacity
              onPress={() => router.back()}
              style={FloatingHeaderStyles.backButton}
              activeOpacity={0.7}
            >
              <View style={FloatingHeaderStyles.backButtonCircle}>
                <Ionicons
                  name="arrow-back"
                  size={HEADER_ICON_SIZE}
                  color={Colors.textPrimary}
                />
              </View>
            </TouchableOpacity>
            <Text style={styles.headerTitleText}>My Listings</Text>
          </View>

          {/* Action Buttons */}
          <View style={FloatingHeaderStyles.headerActions}>
            <TouchableOpacity
              style={FloatingHeaderStyles.actionButton}
              onPress={() =>
                setViewMode((prev) => (prev === "list" ? "grid" : "list"))
              }
              activeOpacity={0.7}
            >
              <View style={FloatingHeaderStyles.actionButtonBackground}>
                <Ionicons
                  name={viewMode === "list" ? "grid-outline" : "list-outline"}
                  size={HEADER_ICON_SIZE}
                  color={Colors.textPrimary}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={FloatingHeaderStyles.actionButton}
              activeOpacity={0.7}
            >
              <View style={FloatingHeaderStyles.actionButtonBackground}>
                <Ionicons
                  name="options-outline"
                  size={HEADER_ICON_SIZE}
                  color={Colors.textPrimary}
                />
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
          {/* Summary Stats */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <View
                style={[styles.summaryIcon, { backgroundColor: "#10B98115" }]}
              >
                <Ionicons name="home" size={20} color="#10B981" />
              </View>
              <Text style={styles.summaryValue}>{LISTINGS.length}</Text>
              <Text style={styles.summaryLabel}>Total</Text>
            </View>
            <View style={styles.summaryCard}>
              <View
                style={[
                  styles.summaryIcon,
                  { backgroundColor: `${Colors.primaryGreen}15` },
                ]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={Colors.primaryGreen}
                />
              </View>
              <Text style={styles.summaryValue}>
                {LISTINGS.filter((l) => l.status === "active").length}
              </Text>
              <Text style={styles.summaryLabel}>Active</Text>
            </View>
            <View style={styles.summaryCard}>
              <View
                style={[styles.summaryIcon, { backgroundColor: "#F59E0B15" }]}
              >
                <Ionicons name="time" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.summaryValue}>
                {LISTINGS.filter((l) => l.status === "pending").length}
              </Text>
              <Text style={styles.summaryLabel}>Pending</Text>
            </View>
            <View style={styles.summaryCard}>
              <View
                style={[styles.summaryIcon, { backgroundColor: "#3B82F615" }]}
              >
                <Ionicons name="pricetag" size={20} color="#3B82F6" />
              </View>
              <Text style={styles.summaryValue}>
                {
                  LISTINGS.filter(
                    (l) => l.status === "sold" || l.status === "rented"
                  ).length
                }
              </Text>
              <Text style={styles.summaryLabel}>Closed</Text>
            </View>
          </View>

          {/* Status Tabs */}
          <View style={styles.tabsContainer}>
            <FlatList
              data={STATUS_TABS}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsContent}
              keyExtractor={(item) => item.id}
              renderItem={({ item: tab }) => (
                <TouchableOpacity
                  style={[styles.tab, activeTab === tab.id && styles.tabActive]}
                  onPress={() => setActiveTab(tab.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === tab.id && styles.tabTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                  {tab.count > 0 && (
                    <View
                      style={[
                        styles.tabBadge,
                        activeTab === tab.id && styles.tabBadgeActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.tabBadgeText,
                          activeTab === tab.id && styles.tabBadgeTextActive,
                        ]}
                      >
                        {tab.count}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>

          {/* Results Count */}
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {filteredListings.length} listing
              {filteredListings.length !== 1 ? "s" : ""}
            </Text>
          </View>

          {/* Listings or Empty State */}
          {filteredListings.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons
                  name="home-outline"
                  size={48}
                  color={Colors.textSecondary}
                />
              </View>
              <Text style={styles.emptyTitle}>No Listings Yet</Text>
              <Text style={styles.emptySubtitle}>
                Create your first listing to start receiving inquiries
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push("/(owner-tabs)/add-listing")}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[Colors.primaryGreen, "#2E7D32"]}
                  style={styles.emptyButtonGradient}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.emptyButtonText}>Add Listing</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.listingsContainer}>
              {filteredListings.map(renderListingCard)}
            </View>
          )}
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
    paddingHorizontal: Spacing.xl,
  },
  // Summary Stats
  summaryContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  summaryValue: {
    ...Typography.headlineMedium,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  summaryLabel: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  // Tabs
  tabsContainer: {
    marginBottom: Spacing.lg,
    marginHorizontal: -Spacing.xl,
  },
  tabsContent: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  tabActive: {
    backgroundColor: Colors.primaryGreen,
    borderColor: Colors.primaryGreen,
  },
  tabText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  tabBadge: {
    backgroundColor: Colors.divider,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  tabBadgeActive: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  tabBadgeText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  tabBadgeTextActive: {
    color: "#FFFFFF",
  },
  // Results Header
  resultsHeader: {
    marginBottom: Spacing.lg,
  },
  resultsCount: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["2xl"] * 2,
    paddingHorizontal: Spacing.xl,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  emptyTitle: {
    ...Typography.headlineMedium,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
    maxWidth: 280,
  },
  emptyButton: {
    borderRadius: 24,
    overflow: "hidden",
  },
  emptyButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  emptyButtonText: {
    ...Typography.labelLarge,
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Listings
  listingsContainer: {
    gap: Spacing.lg,
  },
  listingCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.divider,
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
  imageContainer: {
    position: "relative",
  },
  listingImage: {
    width: "100%",
    height: 180,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  statusBadge: {
    position: "absolute",
    top: Spacing.md,
    left: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  daysActiveBadge: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  daysActiveText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  imageStats: {
    position: "absolute",
    bottom: Spacing.md,
    left: Spacing.md,
    flexDirection: "row",
    gap: Spacing.md,
  },
  imageStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  imageStatText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  listingContent: {
    padding: Spacing.lg,
  },
  listingMain: {
    marginBottom: Spacing.md,
  },
  listingTitle: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  priceActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listingPrice: {
    ...Typography.headlineMedium,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primaryGreen,
  },
  actionsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  moreButton: {
    backgroundColor: Colors.surface,
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
