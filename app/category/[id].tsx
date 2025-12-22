import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Platform,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors, Typography, Spacing } from "@/constants/design";
import {
  FloatingHeaderStyles,
  HEADER_ICON_SIZE,
} from "@/components/FloatingHeader.styles";
import { PropertyGridCard } from "@/components/PropertyCard";
import { MAP_PROPERTIES, type MapProperty } from "@/constants/mockData";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.md) / 2;

// Category info
const CATEGORY_INFO: Record<
  string,
  { label: string; icon: string; description: string }
> = {
  house: {
    label: "Houses",
    icon: "home",
    description: "Standalone residential properties",
  },
  apartment: {
    label: "Apartments",
    icon: "business",
    description: "Multi-unit residential buildings",
  },
  land: {
    label: "Land",
    icon: "map",
    description: "Plots and parcels for development",
  },
  commercial: {
    label: "Commercial",
    icon: "storefront",
    description: "Business and retail properties",
  },
};

// Transaction type filters
const TRANSACTION_FILTERS = [
  { id: "all", label: "All" },
  { id: "buy", label: "For Sale" },
  { id: "rent", label: "For Rent" },
];

// Sort options
const SORT_OPTIONS = [
  { id: "newest", label: "Newest First" },
  { id: "price_low", label: "Price: Low to High" },
  { id: "price_high", label: "Price: High to Low" },
];

export default function CategoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const categoryId = params.id as string;

  const categoryInfo = CATEGORY_INFO[categoryId] || {
    label: "Properties",
    icon: "home",
    description: "Browse properties",
  };

  // State
  const [refreshing, setRefreshing] = useState(false);
  const [transactionFilter, setTransactionFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [savedProperties, setSavedProperties] = useState<Set<string>>(
    new Set(["2", "5"])
  );

  // Filter properties by category
  const filteredProperties = useMemo(() => {
    let properties = MAP_PROPERTIES.filter(
      (p) => p.propertyType === categoryId
    );

    // Apply transaction filter
    if (transactionFilter !== "all") {
      properties = properties.filter(
        (p) => p.transactionType === transactionFilter
      );
    }

    // Apply sorting
    switch (sortOption) {
      case "price_low":
        properties = [...properties].sort((a, b) => a.price - b.price);
        break;
      case "price_high":
        properties = [...properties].sort((a, b) => b.price - a.price);
        break;
      case "newest":
      default:
        // Keep original order (assumed newest first)
        break;
    }

    return properties;
  }, [categoryId, transactionFilter, sortOption]);

  // Format price
  const formatPrice = useCallback((price: number) => {
    if (price >= 1000000) {
      return `GHS ${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `GHS ${(price / 1000).toFixed(0)}K`;
    }
    return `GHS ${price.toLocaleString()}`;
  }, []);

  // Toggle save
  const handleToggleSave = useCallback((propertyId: string) => {
    setSavedProperties((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(propertyId)) {
        newSet.delete(propertyId);
      } else {
        newSet.add(propertyId);
      }
      return newSet;
    });
  }, []);

  // Refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // Render property card
  const renderProperty = useCallback(
    ({ item, index }: { item: MapProperty; index: number }) => (
      <View style={[styles.gridItem, index % 2 === 1 && styles.gridItemRight]}>
        <PropertyGridCard
          property={item}
          savedProperties={savedProperties}
          onToggleSave={handleToggleSave}
          formatPrice={formatPrice}
        />
      </View>
    ),
    [savedProperties, handleToggleSave, formatPrice]
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons
          name={categoryInfo.icon as any}
          size={64}
          color={Colors.primaryGreen}
        />
      </View>
      <Text style={styles.emptyTitle}>No {categoryInfo.label} Found</Text>
      <Text style={styles.emptySubtitle}>
        We couldn&apos;t find any properties in this category.{"\n"}
        Try adjusting your filters or check back later.
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => router.push("/(tabs)/search")}
        activeOpacity={0.8}
      >
        <Ionicons name="search" size={20} color="#FFFFFF" />
        <Text style={styles.browseButtonText}>Browse All Properties</Text>
      </TouchableOpacity>
    </View>
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

        {/* Header */}
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
            <View>
              <Text style={styles.headerTitle}>{categoryInfo.label}</Text>
              <Text style={styles.headerSubtitle}>
                {filteredProperties.length} properties
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={FloatingHeaderStyles.actionButtonBackground}
            onPress={() => router.push("/(tabs)/search")}
            activeOpacity={0.7}
          >
            <Ionicons
              name="search"
              size={HEADER_ICON_SIZE}
              color={Colors.textPrimary}
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <FlatList
          data={filteredProperties}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={renderProperty}
          contentContainerStyle={[
            styles.listContent,
            { paddingTop: insets.top + 100 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListHeaderComponent={
            <View style={styles.filtersSection}>
              {/* Category Header Card */}
              <View style={styles.categoryHeaderCard}>
                <View style={styles.categoryIconLarge}>
                  <Ionicons
                    name={categoryInfo.icon as any}
                    size={32}
                    color={Colors.primaryGreen}
                  />
                </View>
                <View style={styles.categoryHeaderInfo}>
                  <Text style={styles.categoryHeaderTitle}>
                    {categoryInfo.label}
                  </Text>
                  <Text style={styles.categoryHeaderDescription}>
                    {categoryInfo.description}
                  </Text>
                </View>
              </View>

              {/* Transaction Type Filter */}
              <View style={styles.filterRow}>
                {TRANSACTION_FILTERS.map((filter) => (
                  <TouchableOpacity
                    key={filter.id}
                    style={[
                      styles.filterChip,
                      transactionFilter === filter.id &&
                        styles.filterChipActive,
                    ]}
                    onPress={() => setTransactionFilter(filter.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        transactionFilter === filter.id &&
                          styles.filterChipTextActive,
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Sort Options */}
              <View style={styles.sortRow}>
                <Text style={styles.sortLabel}>Sort by:</Text>
                <View style={styles.sortOptions}>
                  {SORT_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.sortChip,
                        sortOption === option.id && styles.sortChipActive,
                      ]}
                      onPress={() => setSortOption(option.id)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.sortChipText,
                          sortOption === option.id && styles.sortChipTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Results Count */}
              <Text style={styles.resultsCount}>
                {filteredProperties.length}{" "}
                {filteredProperties.length === 1 ? "property" : "properties"}{" "}
                found
              </Text>
            </View>
          }
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={<View style={{ height: 40 }} />}
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
    overflow: "hidden",
  },
  circle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.primaryGreen,
    opacity: 0.05,
    top: -100,
    right: -100,
  },
  circle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.primaryGreen,
    opacity: 0.05,
    bottom: 200,
    left: -50,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  headerTitle: {
    ...Typography.headlineMedium,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  filtersSection: {
    marginBottom: Spacing.lg,
  },
  categoryHeaderCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
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
  categoryIconLarge: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  categoryHeaderInfo: {
    flex: 1,
  },
  categoryHeaderTitle: {
    ...Typography.titleLarge,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  categoryHeaderDescription: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  filterRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  filterChip: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: "center",
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
  sortRow: {
    marginBottom: Spacing.lg,
  },
  sortLabel: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  sortOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  sortChip: {
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  sortChipActive: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderColor: Colors.primaryGreen,
  },
  sortChipText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  sortChipTextActive: {
    color: Colors.primaryGreen,
    fontWeight: "600",
  },
  resultsCount: {
    ...Typography.bodyMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  gridItem: {
    width: CARD_WIDTH,
    marginBottom: Spacing.md,
  },
  gridItemRight: {
    marginLeft: Spacing.md,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: Spacing.xl * 2,
    paddingHorizontal: Spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
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
    textAlign: "center",
  },
  emptySubtitle: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  browseButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primaryGreen,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  browseButtonText: {
    ...Typography.labelLarge,
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
