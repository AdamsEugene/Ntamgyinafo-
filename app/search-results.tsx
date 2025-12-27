import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors, Typography, Spacing } from "@/constants/design";
import { useTheme } from "@/contexts/ThemeContext";
import {
  FilterBottomSheet,
  type FilterOptions,
} from "@/components/FilterBottomSheet";
import {
  FloatingHeader,
  HeaderActionButton,
} from "@/components/FloatingHeader";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import {
  PropertyListCard,
  PropertyGridCard,
  type Property,
} from "@/components/PropertyCard";
import { BottomNavigation, type TabItem } from "@/components/BottomNavigation";
import { ALL_PROPERTIES as MOCK_PROPERTIES } from "@/constants/mockData";

interface PropertyWithTypes extends Property {
  propertyType?: "house" | "apartment" | "land" | "commercial";
  transactionType?: "buy" | "rent";
}

interface Filter {
  propertyTypes?: string[];
  transactionType?: "buy" | "rent" | null;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number | null;
  amenities?: string[];
}

type SortOption =
  | "relevance"
  | "price-low"
  | "price-high"
  | "newest"
  | "oldest"
  | "bedrooms";

// Helper function to determine property type from title
function getPropertyTypeFromTitle(
  title: string
): "house" | "apartment" | "land" | "commercial" {
  const lowerTitle = title.toLowerCase();
  if (
    lowerTitle.includes("apartment") ||
    lowerTitle.includes("flat") ||
    lowerTitle.includes("studio")
  ) {
    return "apartment";
  }
  if (lowerTitle.includes("commercial") || lowerTitle.includes("space")) {
    return "commercial";
  }
  if (lowerTitle.includes("land")) {
    return "land";
  }
  return "house";
}

// Convert ALL_PROPERTIES to PropertyWithTypes format
const ALL_PROPERTIES: PropertyWithTypes[] = MOCK_PROPERTIES.map(
  (prop: Property) => ({
    ...prop,
    propertyType: getPropertyTypeFromTitle(prop.title),
    transactionType: prop.price > 10000 ? "buy" : "rent",
  })
);

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "bedrooms", label: "Most Bedrooms" },
];

// Custom bottom navigation tabs for Search Results - only relevant tabs
const SEARCH_NAV_TABS: TabItem[] = [
  {
    id: "index",
    label: "Home",
    icon: "home-outline",
    activeIcon: "home",
  },
  {
    id: "search",
    label: "Search",
    icon: "search-outline",
    activeIcon: "search",
  },
  {
    id: "map",
    label: "Map",
    icon: "map-outline",
    activeIcon: "map",
  },
  {
    id: "saved",
    label: "Saved",
    icon: "heart-outline",
    activeIcon: "heart",
  },
];

export default function SearchResultsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { colors, isDark } = useTheme();
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [savedProperties, setSavedProperties] = useState<Set<string>>(
    new Set(["2", "5"])
  );
  const [filters, setFilters] = useState<Filter>((params.filters as any) || {});
  const [filteredProperties, setFilteredProperties] =
    useState<PropertyWithTypes[]>(ALL_PROPERTIES);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showMenuSheet, setShowMenuSheet] = useState(false);
  const [showSortSheet, setShowSortSheet] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("relevance");
  const menuSheetRef = useRef<BottomSheetModal>(null);
  const sortSheetRef = useRef<BottomSheetModal>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Build breadcrumb from filters
  const buildBreadcrumb = () => {
    const parts: string[] = [];
    if (params.location) {
      parts.push(params.location as string);
    } else {
      parts.push("Accra"); // Default location
    }
    if (filters.propertyTypes && filters.propertyTypes.length > 0) {
      parts.push(filters.propertyTypes[0]);
    }
    if (filters.transactionType) {
      parts.push(filters.transactionType === "buy" ? "Buy" : "Rent");
    }
    return parts.join(" • ");
  };

  // Apply filters and sort
  useEffect(() => {
    let results = [...ALL_PROPERTIES];

    // Apply filters
    if (filters.propertyTypes && filters.propertyTypes.length > 0) {
      results = results.filter((property) =>
        filters.propertyTypes!.some(
          (type) =>
            property.propertyType === type.toLowerCase() ||
            (type === "House" && property.propertyType === "house") ||
            (type === "Apartment" && property.propertyType === "apartment") ||
            (type === "Land" && property.propertyType === "land") ||
            (type === "Commercial" && property.propertyType === "commercial")
        )
      );
    }
    if (filters.transactionType) {
      results = results.filter(
        (property) => property.transactionType === filters.transactionType
      );
    }
    if (filters.minPrice !== undefined) {
      results = results.filter(
        (property) => property.price >= filters.minPrice!
      );
    }
    if (filters.maxPrice !== undefined) {
      results = results.filter(
        (property) => property.price <= filters.maxPrice!
      );
    }
    if (filters.bedrooms !== null && filters.bedrooms !== undefined) {
      results = results.filter(
        (property) => property.bedrooms === filters.bedrooms
      );
    }

    // Apply sorting
    switch (sortOption) {
      case "price-low":
        results.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        results.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        // Assuming newer properties have higher IDs
        results.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        break;
      case "oldest":
        results.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        break;
      case "bedrooms":
        results.sort((a, b) => (b.bedrooms || 0) - (a.bedrooms || 0));
        break;
      default:
        // Relevance - keep original order
        break;
    }

    setFilteredProperties(results);
  }, [filters, sortOption]);

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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    // Simulate API call
    setTimeout(() => {
      setPage((prev) => prev + 1);
      setLoadingMore(false);
      // In real app, check if there are more results
      if (page >= 3) {
        setHasMore(false);
      }
    }, 1000);
  }, [loadingMore, hasMore, page]);

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.propertyTypes && filters.propertyTypes.length > 0) count++;
    if (filters.transactionType) count++;
    if (filters.minPrice !== undefined) count++;
    if (filters.maxPrice !== undefined) count++;
    if (filters.bedrooms !== null && filters.bedrooms !== undefined) count++;
    if (filters.amenities && filters.amenities.length > 0) count++;
    return count;
  };

  const hasActiveFilters = getActiveFiltersCount() > 0;

  // Control menu sheet visibility
  useEffect(() => {
    if (showMenuSheet) {
      menuSheetRef.current?.present();
    } else {
      menuSheetRef.current?.dismiss();
    }
  }, [showMenuSheet]);

  // Control sort sheet visibility
  useEffect(() => {
    if (showSortSheet) {
      sortSheetRef.current?.present();
    } else {
      sortSheetRef.current?.dismiss();
    }
  }, [showSortSheet]);

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Decorative Background Elements */}
        <View style={styles.decorativeBackground}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
        </View>
        {/* Floating Header with Blur */}
        <FloatingHeader
          title="Search Results"
          showBackButton
          onBackPress={() => router.back()}
          rightContent={
            <>
              <HeaderActionButton
                icon="options-outline"
                onPress={() => setShowFilterSheet(true)}
                badge={hasActiveFilters ? getActiveFiltersCount() : undefined}
              />
              <HeaderActionButton
                icon={viewMode === "list" ? "grid-outline" : "list-outline"}
                onPress={() =>
                  setViewMode((prev) => (prev === "list" ? "grid" : "list"))
                }
              />
              <HeaderActionButton
                icon="ellipsis-vertical"
                onPress={() => setShowMenuSheet(true)}
              />
            </>
          }
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: 80 + insets.top,
              paddingBottom: insets.bottom + 120, // Extra padding for bottom nav
            },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {/* Breadcrumb */}
          <View style={styles.breadcrumbContainer}>
            <Text style={[styles.breadcrumb, { color: colors.textSecondary }]}>
              {buildBreadcrumb()}
            </Text>
          </View>

          {/* Results Count */}
          <View style={styles.resultsHeader}>
            <Text style={[styles.resultsCount, { color: colors.text }]}>
              {filteredProperties.length} properties found
            </Text>
          </View>

          {/* Property List/Grid */}
          {viewMode === "list" ? (
            <View style={styles.listContainer}>
              {filteredProperties.map((property) => (
                <PropertyListCard
                  key={property.id}
                  property={property}
                  savedProperties={savedProperties}
                  onToggleSave={toggleSave}
                  formatPrice={formatPrice}
                />
              ))}
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {filteredProperties.map((property) => (
                <View key={property.id} style={styles.gridItem}>
                  <PropertyGridCard
                    property={property}
                    savedProperties={savedProperties}
                    onToggleSave={toggleSave}
                    formatPrice={formatPrice}
                  />
                </View>
              ))}
            </View>
          )}

          {/* Load More Indicator */}
          {hasMore && (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={loadMore}
              disabled={loadingMore}
              activeOpacity={0.7}
            >
              {loadingMore ? (
                <Text style={[styles.loadMoreText, { color: colors.primary }]}>
                  Loading...
                </Text>
              ) : (
                <Text style={[styles.loadMoreText, { color: colors.primary }]}>
                  Load More
                </Text>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Menu Bottom Sheet */}
        <BottomSheetModal
          ref={menuSheetRef}
          index={0}
          snapPoints={["30%"]}
          enablePanDownToClose
          onDismiss={() => setShowMenuSheet(false)}
          backdropComponent={useCallback(
            (props: any) => (
              <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.5}
              />
            ),
            []
          )}
          backgroundStyle={[
            styles.bottomSheetBackground,
            { backgroundColor: colors.surface },
          ]}
          handleIndicatorStyle={[
            styles.handleIndicator,
            { backgroundColor: colors.textSecondary },
          ]}
        >
          <BottomSheetView style={styles.menuSheetContent}>
            <Text style={[styles.menuSheetTitle, { color: colors.text }]}>
              Options
            </Text>
            <TouchableOpacity
              style={[
                styles.menuOption,
                { backgroundColor: colors.inputBackground },
              ]}
              onPress={() => {
                setShowMenuSheet(false);
                setTimeout(() => setShowSortSheet(true), 300);
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="swap-vertical-outline"
                size={24}
                color={colors.text}
              />
              <View style={styles.menuOptionContent}>
                <Text style={[styles.menuOptionTitle, { color: colors.text }]}>
                  Sort
                </Text>
                <Text
                  style={[
                    styles.menuOptionSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  {SORT_OPTIONS.find((opt) => opt.value === sortOption)?.label}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.menuOption,
                { backgroundColor: colors.inputBackground },
              ]}
              onPress={() => {
                setShowMenuSheet(false);
                router.push("/(tabs)/map");
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="map-outline" size={24} color={colors.text} />
              <View style={styles.menuOptionContent}>
                <Text style={[styles.menuOptionTitle, { color: colors.text }]}>
                  Map View
                </Text>
                <Text
                  style={[
                    styles.menuOptionSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  View properties on map
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </BottomSheetView>
        </BottomSheetModal>

        {/* Sort Bottom Sheet */}
        <BottomSheetModal
          ref={sortSheetRef}
          index={0}
          snapPoints={["50%"]}
          enablePanDownToClose
          onDismiss={() => setShowSortSheet(false)}
          backdropComponent={useCallback(
            (props: any) => (
              <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.5}
              />
            ),
            []
          )}
          backgroundStyle={[
            styles.bottomSheetBackground,
            { backgroundColor: colors.surface },
          ]}
          handleIndicatorStyle={[
            styles.handleIndicator,
            { backgroundColor: colors.textSecondary },
          ]}
        >
          <BottomSheetView style={styles.sortSheetContent}>
            <View
              style={[
                styles.sortSheetHeader,
                { borderBottomColor: colors.divider },
              ]}
            >
              <Text style={[styles.sortSheetTitle, { color: colors.text }]}>
                Sort By
              </Text>
              <TouchableOpacity
                onPress={() => setShowSortSheet(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.sortOptions}>
              {SORT_OPTIONS.map((option) => {
                const isSelected = sortOption === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.sortOption,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.divider,
                      },
                      isSelected && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
                    onPress={() => {
                      setSortOption(option.value);
                      setShowSortSheet(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.sortOptionText,
                        { color: colors.text },
                        isSelected && styles.sortOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="#FFFFFF"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </BottomSheetView>
        </BottomSheetModal>

        {/* Filter Bottom Sheet */}
        <FilterBottomSheet
          visible={showFilterSheet}
          onClose={() => setShowFilterSheet(false)}
          onApply={(newFilters: FilterOptions) => {
            setFilters(newFilters as Filter);
          }}
          initialFilters={filters as FilterOptions}
          resultsCount={filteredProperties.length}
        />

        {/* Bottom Navigation - Search Context Only */}
        <BottomNavigation
          tabs={SEARCH_NAV_TABS}
          activeTab="search"
          onTabPress={(tabId) => {
            if (tabId === "index") {
              router.replace("/(tabs)");
            } else if (tabId === "search") {
              router.replace("/(tabs)/search");
            } else if (tabId === "map") {
              router.replace("/(tabs)/map");
            } else if (tabId === "saved") {
              router.push("/saved-properties");
            }
          }}
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
  headerTitleText: {
    ...Typography.titleLarge,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  breadcrumbContainer: {
    marginBottom: Spacing.md,
  },
  breadcrumb: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  resultsHeader: {
    marginBottom: Spacing.lg,
  },
  resultsCount: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  actionBarButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.divider,
    position: "relative",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  actionBarButtonText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  actionBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: Colors.primaryGreen,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  actionBadgeText: {
    ...Typography.caption,
    fontSize: 9,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  listContainer: {
    gap: Spacing.md,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginHorizontal: -Spacing.xs,
  },
  gridItem: {
    width: "48%",
  },
  loadMoreButton: {
    paddingVertical: Spacing.lg,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  loadMoreText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
  bottomSheetBackground: {
    backgroundColor: Colors.surface,
  },
  handleIndicator: {
    backgroundColor: Colors.divider,
  },
  menuSheetContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  menuSheetTitle: {
    ...Typography.titleLarge,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    backgroundColor: Colors.background,
    marginBottom: Spacing.sm,
  },
  menuOptionContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  menuOptionTitle: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs / 2,
  },
  menuOptionSubtitle: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  sortSheetContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  sortSheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    marginBottom: Spacing.lg,
  },
  sortSheetTitle: {
    ...Typography.headlineMedium,
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  sortOptions: {
    gap: Spacing.md,
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.divider,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  sortOptionSelected: {
    backgroundColor: Colors.primaryGreen,
    borderColor: Colors.primaryGreen,
  },
  sortOptionText: {
    ...Typography.labelMedium,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  sortOptionTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
