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
import { Colors, Typography, Spacing } from "@/constants/design";
import {
  FloatingHeaderStyles,
  HEADER_ICON_SIZE,
} from "@/components/FloatingHeader.styles";

// Status tabs
const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "pending", label: "Pending" },
  { id: "sold", label: "Sold" },
  { id: "rented", label: "Rented" },
];

// Mock listings
const LISTINGS = [
  {
    id: "1",
    title: "4 Bedroom House in East Legon",
    location: "East Legon, Accra",
    price: 850000,
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop",
    views: 234,
    inquiries: 12,
    status: "active" as const,
    listedDate: "Dec 15, 2024",
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
    status: "active" as const,
    listedDate: "Dec 10, 2024",
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
    status: "pending" as const,
    listedDate: "Dec 20, 2024",
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
    status: "sold" as const,
    listedDate: "Nov 28, 2024",
  },
];

export default function MyListingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

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

  const filteredListings =
    activeTab === "all"
      ? LISTINGS
      : LISTINGS.filter((l) => l.status === activeTab);

  return (
    <>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* Header */}
        <View
          style={[
            FloatingHeaderStyles.floatingHeader,
            { paddingTop: insets.top + Spacing.md },
          ]}
        >
          <Text style={styles.headerTitle}>My Listings</Text>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={FloatingHeaderStyles.actionButton}
              activeOpacity={0.7}
            >
              <View style={FloatingHeaderStyles.actionButtonBackground}>
                <Ionicons
                  name="filter-outline"
                  size={HEADER_ICON_SIZE}
                  color={Colors.textPrimary}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Tabs */}
        <View style={[styles.tabsContainer, { marginTop: 80 + insets.top }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContent}
          >
            {STATUS_TABS.map((tab) => (
              <TouchableOpacity
                key={tab.id}
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
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom: 100 + insets.bottom,
            },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredListings.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons
                  name="home-outline"
                  size={64}
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
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.emptyButtonText}>Add Listing</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.listingsContainer}>
              {filteredListings.map((listing) => (
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
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(listing.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {listing.status.charAt(0).toUpperCase() +
                        listing.status.slice(1)}
                    </Text>
                  </View>

                  <View style={styles.listingContent}>
                    <View style={styles.listingMain}>
                      <Text style={styles.listingTitle} numberOfLines={1}>
                        {listing.title}
                      </Text>
                      <View style={styles.locationRow}>
                        <Ionicons
                          name="location-outline"
                          size={14}
                          color={Colors.textSecondary}
                        />
                        <Text style={styles.locationText} numberOfLines={1}>
                          {listing.location}
                        </Text>
                      </View>
                      <Text style={styles.listingPrice}>
                        {formatPrice(listing.price)}
                      </Text>
                    </View>

                    <View style={styles.listingFooter}>
                      <View style={styles.statsRow}>
                        <View style={styles.stat}>
                          <Ionicons
                            name="eye-outline"
                            size={16}
                            color={Colors.textSecondary}
                          />
                          <Text style={styles.statText}>{listing.views}</Text>
                        </View>
                        <View style={styles.stat}>
                          <Ionicons
                            name="chatbubble-outline"
                            size={16}
                            color={Colors.textSecondary}
                          />
                          <Text style={styles.statText}>
                            {listing.inquiries}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.actionsRow}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name="create-outline"
                            size={18}
                            color={Colors.textPrimary}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name="stats-chart-outline"
                            size={18}
                            color={Colors.textPrimary}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name="ellipsis-vertical"
                            size={18}
                            color={Colors.textPrimary}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
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
  headerTitle: {
    ...Typography.headlineMedium,
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  tabsContainer: {
    backgroundColor: Colors.background,
    zIndex: 10,
  },
  tabsContent: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  tab: {
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["2xl"] * 2,
    paddingHorizontal: Spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.headlineMedium,
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.bodyMedium,
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primaryGreen,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 24,
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
    width: "100%",
    height: 180,
  },
  statusBadge: {
    position: "absolute",
    top: Spacing.md,
    left: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  listingContent: {
    padding: Spacing.lg,
  },
  listingMain: {
    marginBottom: Spacing.md,
  },
  listingTitle: {
    ...Typography.titleLarge,
    fontSize: 17,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  listingPrice: {
    ...Typography.headlineMedium,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primaryGreen,
  },
  listingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: Spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.lg,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  actionsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
});
