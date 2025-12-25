import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  RefreshControl,
  Dimensions,
} from "react-native";
import Animated from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Typography, Spacing } from "@/constants/design";
import { useTheme } from "@/contexts/ThemeContext";
import {
  FloatingHeader,
  HeaderActionButton,
} from "@/components/FloatingHeader";
import { MAP_PROPERTIES, MapProperty } from "@/constants/mockData";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.md) / 2;

// Time filter options
const TIME_FILTERS = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "all", label: "All Time" },
];

const SORT_OPTIONS = [
  { id: "newest", label: "Newest First" },
  { id: "price-low", label: "Price: Low to High" },
  { id: "price-high", label: "Price: High to Low" },
];

// Mock new listings with dates
const NEW_LISTINGS_DATA: (MapProperty & { listedAt: string })[] =
  MAP_PROPERTIES.map((property, index) => ({
    ...property,
    listedAt:
      index < 3
        ? "Today"
        : index < 6
        ? "2 days ago"
        : index < 9
        ? "5 days ago"
        : "2 weeks ago",
  }));

export default function NewListingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [savedProperties, setSavedProperties] = useState<Set<string>>(
    new Set(["2", "5"])
  );
  const [timeFilter, setTimeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const toggleSave = (propertyId: string) => {
    setSavedProperties((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(propertyId)) {
        newSet.delete(propertyId);
      } else {
        newSet.add(propertyId);
      }
      return newSet;
    });
  };

  const formatPrice = (price: number): string => {
    if (price >= 1000000) {
      return `GHS ${(price / 1000000).toFixed(1)}M`;
    }
    if (price >= 1000) {
      return `GHS ${(price / 1000).toFixed(0)}K`;
    }
    return `GHS ${price.toLocaleString()}`;
  };

  const filteredProperties = NEW_LISTINGS_DATA.filter((property) => {
    if (timeFilter === "all") return true;
    if (timeFilter === "today") return property.listedAt === "Today";
    if (timeFilter === "week")
      return (
        property.listedAt === "Today" || property.listedAt === "2 days ago"
      );
    if (timeFilter === "month") return !property.listedAt.includes("weeks");
    return true;
  });

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    return 0; // newest first is default order
  });

  const renderPropertyCard = ({
    item,
  }: {
    item: MapProperty & { listedAt: string };
  }) => {
    const isSaved = savedProperties.has(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.propertyCard,
          { backgroundColor: colors.surface, borderColor: colors.divider },
        ]}
        onPress={() => router.push(`/property/${item.id}`)}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          <Animated.Image
            source={{ uri: item.image }}
            style={styles.propertyImage}
            resizeMode="cover"
            {...{
              sharedTransitionTag: `property-image-${item.id}`,
            }}
          />
          <View style={styles.imageOverlay} />

          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => toggleSave(item.id)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isSaved ? "heart" : "heart-outline"}
              size={18}
              color={isSaved ? "#EF4444" : "#FFFFFF"}
            />
          </TouchableOpacity>

          {/* New Badge */}
          <View style={[styles.newBadge, { backgroundColor: colors.primary }]}>
            <Ionicons name="sparkles" size={10} color="#FFFFFF" />
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>

          {/* Listed Time Badge */}
          <View style={[styles.timeBadge, { backgroundColor: colors.surface }]}>
            <Ionicons name="time-outline" size={10} color={colors.text} />
            <Text style={[styles.timeBadgeText, { color: colors.text }]}>
              {item.listedAt}
            </Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text
            style={[styles.propertyTitle, { color: colors.text }]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={12}
              color={colors.textSecondary}
            />
            <Text
              style={[styles.locationText, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {item.location}
            </Text>
          </View>

          {item.bedrooms && item.bathrooms && (
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Ionicons
                  name="bed-outline"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text
                  style={[styles.detailText, { color: colors.textSecondary }]}
                >
                  {item.bedrooms}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons
                  name="water-outline"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text
                  style={[styles.detailText, { color: colors.textSecondary }]}
                >
                  {item.bathrooms}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.priceRow}>
            <Text style={[styles.priceText, { color: colors.primary }]}>
              {formatPrice(item.price)}
            </Text>
            <View
              style={[
                styles.typeBadge,
                {
                  backgroundColor:
                    item.transactionType === "rent"
                      ? `${Colors.accentOrange}20`
                      : `${colors.primary}20`,
                },
              ]}
            >
              <Text
                style={[
                  styles.typeBadgeText,
                  {
                    color:
                      item.transactionType === "rent"
                        ? Colors.accentOrange
                        : colors.primary,
                  },
                ]}
              >
                {item.transactionType === "rent" ? "Rent" : "Sale"}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <>
      {/* Stats Banner */}
      <View
        style={[
          styles.statsBanner,
          { backgroundColor: colors.surface, borderColor: colors.divider },
        ]}
      >
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {NEW_LISTINGS_DATA.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Total New
          </Text>
        </View>
        <View
          style={[styles.statDivider, { backgroundColor: colors.divider }]}
        />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {NEW_LISTINGS_DATA.filter((p) => p.listedAt === "Today").length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Today
          </Text>
        </View>
        <View
          style={[styles.statDivider, { backgroundColor: colors.divider }]}
        />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {
              NEW_LISTINGS_DATA.filter((p) => p.transactionType === "rent")
                .length
            }
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            For Rent
          </Text>
        </View>
        <View
          style={[styles.statDivider, { backgroundColor: colors.divider }]}
        />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {
              NEW_LISTINGS_DATA.filter((p) => p.transactionType === "buy")
                .length
            }
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            For Sale
          </Text>
        </View>
      </View>

      {/* Time Filter */}
      <View style={styles.filterSection}>
        <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>
          Listed
        </Text>
        <FlatList
          data={TIME_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
                timeFilter === item.id && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => setTimeFilter(item.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: colors.textSecondary },
                  timeFilter === item.id && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Sort Options */}
      <View style={styles.filterSection}>
        <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>
          Sort By
        </Text>
        <FlatList
          data={SORT_OPTIONS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
                sortBy === item.id && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => setSortBy(item.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: colors.textSecondary },
                  sortBy === item.id && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={[styles.resultsCount, { color: colors.text }]}>
          {sortedProperties.length} New Listings
        </Text>
      </View>
    </>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View
        style={[
          styles.emptyIconContainer,
          { backgroundColor: colors.surface, borderColor: colors.divider },
        ]}
      >
        <Ionicons
          name="sparkles-outline"
          size={48}
          color={colors.textSecondary}
        />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No New Listings
      </Text>
      <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
        Check back later for fresh properties
      </Text>
    </View>
  );

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.decorativeBackground}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
        </View>

        {/* Floating Header with Blur */}
        <FloatingHeader
          title="New Listings"
          showBackButton
          onBackPress={() => router.back()}
          rightContent={
            <HeaderActionButton
              icon="notifications-outline"
              onPress={() => router.push("/notifications")}
            />
          }
        />

        <FlatList
          data={sortedProperties}
          renderItem={renderPropertyCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingTop: 80 + insets.top,
              paddingBottom: 100 + insets.bottom,
            },
          ]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              progressViewOffset={80 + insets.top}
            />
          }
        />
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
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  columnWrapper: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  // Stats Banner
  statsBanner: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    ...Typography.titleMedium,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primaryGreen,
  },
  statLabel: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.divider,
    alignSelf: "center",
  },
  filterSection: {
    marginBottom: Spacing.md,
  },
  filterLabel: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  filterList: {
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  filterChipActive: {
    backgroundColor: Colors.primaryGreen,
    borderColor: Colors.primaryGreen,
  },
  filterChipText: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  resultsHeader: {
    marginBottom: Spacing.md,
  },
  resultsCount: {
    ...Typography.bodyMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  propertyCard: {
    width: CARD_WIDTH,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
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
        elevation: 3,
      },
    }),
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 1,
  },
  propertyImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  saveButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  newBadge: {
    position: "absolute",
    top: Spacing.sm,
    left: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.primaryGreen,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  newBadgeText: {
    ...Typography.caption,
    fontSize: 9,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  timeBadge: {
    position: "absolute",
    bottom: Spacing.sm,
    right: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  cardContent: {
    padding: Spacing.md,
  },
  propertyTitle: {
    ...Typography.bodyMedium,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
    minHeight: 36,
    lineHeight: 18,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: Spacing.xs,
  },
  locationText: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
    flex: 1,
  },
  detailsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  detailText: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceText: {
    ...Typography.titleMedium,
    fontSize: 15,
    fontWeight: "700",
    color: Colors.primaryGreen,
  },
  typeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xl * 2,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  emptyTitle: {
    ...Typography.titleMedium,
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  emptyMessage: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
