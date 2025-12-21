import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
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
import {
  FilterBottomSheet,
  type FilterOptions,
} from "@/components/FilterBottomSheet";
import {
  FloatingHeaderStyles,
  HEADER_ICON_SIZE,
} from "@/components/FloatingHeader.styles";
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

// Mock data - replace with actual API data
const ALL_PROPERTIES: PropertyWithTypes[] = [
  {
    id: "1",
    title: "4 Bedroom House in East Legon",
    location: "East Legon, Accra",
    price: 850000,
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=500&fit=crop",
    bedrooms: 4,
    bathrooms: 3,
    isSaved: false,
    propertyType: "house",
    transactionType: "buy",
  },
  {
    id: "2",
    title: "Modern 3 Bedroom Apartment",
    location: "Airport Residential, Accra",
    price: 650000,
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=500&fit=crop",
    bedrooms: 3,
    bathrooms: 2,
    isSaved: true,
    propertyType: "apartment",
    transactionType: "buy",
  },
  {
    id: "3",
    title: "Luxury Villa with Pool",
    location: "Labone, Accra",
    price: 1200000,
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=500&fit=crop",
    bedrooms: 5,
    bathrooms: 4,
    isSaved: false,
    propertyType: "house",
    transactionType: "buy",
  },
  {
    id: "4",
    title: "2 Bedroom House for Rent",
    location: "Cantonments, Accra",
    price: 3500,
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=300&h=300&fit=crop",
    bedrooms: 2,
    bathrooms: 1,
    isSaved: false,
    propertyType: "house",
    transactionType: "rent",
  },
  {
    id: "5",
    title: "Spacious 3 Bedroom Apartment",
    location: "Osu, Accra",
    price: 4500,
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=300&h=300&fit=crop",
    bedrooms: 3,
    bathrooms: 2,
    isSaved: true,
    propertyType: "apartment",
    transactionType: "rent",
  },
  {
    id: "6",
    title: "Commercial Space for Rent",
    location: "Adabraka, Accra",
    price: 8000,
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=300&fit=crop",
    bedrooms: undefined,
    bathrooms: undefined,
    isSaved: false,
    propertyType: "commercial",
    transactionType: "rent",
  },
  {
    id: "7",
    title: "Land for Sale",
    location: "Kasoa, Accra",
    price: 250000,
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=300&h=300&fit=crop",
    bedrooms: undefined,
    bathrooms: undefined,
    isSaved: false,
    propertyType: "land",
    transactionType: "buy",
  },
  {
    id: "8",
    title: "5 Bedroom Mansion",
    location: "Spintex, Accra",
    price: 1500000,
    image:
      "https://images.unsplash.com/photo-1600585154084-4c5f0ea33f38?w=300&h=300&fit=crop",
    bedrooms: 5,
    bathrooms: 4,
    isSaved: false,
    propertyType: "house",
    transactionType: "buy",
  },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "bedrooms", label: "Most Bedrooms" },
];

export default function SearchResultsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
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
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* Floating Sticky Header */}
        <View
          style={[
            FloatingHeaderStyles.floatingHeader,
            { paddingTop: insets.top + Spacing.md },
          ]}
        >
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

          <Text
            style={[FloatingHeaderStyles.headerTitle, styles.headerTitleText]}
          >
            Search Results
          </Text>

          {/* Filter and View Mode Toggle Buttons */}
          <View style={FloatingHeaderStyles.headerActions}>
            <TouchableOpacity
              style={FloatingHeaderStyles.actionButton}
              onPress={() => setShowFilterSheet(true)}
              activeOpacity={0.7}
            >
              <View style={FloatingHeaderStyles.actionButtonBackground}>
                <Ionicons
                  name="options-outline"
                  size={HEADER_ICON_SIZE}
                  color={Colors.textPrimary}
                />
                {hasActiveFilters && (
                  <View style={FloatingHeaderStyles.filterBadge}>
                    <Text style={FloatingHeaderStyles.filterBadgeText}>
                      {getActiveFiltersCount()}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

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
              onPress={() => setShowMenuSheet(true)}
              activeOpacity={0.7}
            >
              <View style={FloatingHeaderStyles.actionButtonBackground}>
                <Ionicons
                  name="ellipsis-vertical"
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
              paddingBottom: insets.bottom + 100,
            },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Breadcrumb */}
          <View style={styles.breadcrumbContainer}>
            <Text style={styles.breadcrumb}>{buildBreadcrumb()}</Text>
          </View>

          {/* Results Count */}
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
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
                <Text style={styles.loadMoreText}>Loading...</Text>
              ) : (
                <Text style={styles.loadMoreText}>Load More</Text>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Menu Bottom Sheet */}
        <BottomSheetModal
          ref={menuSheetRef}
          index={0}
          snapPoints={useMemo(() => ["30%"], [])}
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
          backgroundStyle={styles.bottomSheetBackground}
          handleIndicatorStyle={styles.handleIndicator}
        >
          <BottomSheetView style={styles.menuSheetContent}>
            <Text style={styles.menuSheetTitle}>Options</Text>
            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => {
                setShowMenuSheet(false);
                setTimeout(() => setShowSortSheet(true), 300);
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="swap-vertical-outline"
                size={24}
                color={Colors.textPrimary}
              />
              <View style={styles.menuOptionContent}>
                <Text style={styles.menuOptionTitle}>Sort</Text>
                <Text style={styles.menuOptionSubtitle}>
                  {SORT_OPTIONS.find((opt) => opt.value === sortOption)?.label}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => {
                setShowMenuSheet(false);
                router.push("/(tabs)/map");
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="map-outline"
                size={24}
                color={Colors.textPrimary}
              />
              <View style={styles.menuOptionContent}>
                <Text style={styles.menuOptionTitle}>Map View</Text>
                <Text style={styles.menuOptionSubtitle}>
                  View properties on map
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          </BottomSheetView>
        </BottomSheetModal>

        {/* Sort Bottom Sheet */}
        <BottomSheetModal
          ref={sortSheetRef}
          index={0}
          snapPoints={useMemo(() => ["50%"], [])}
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
          backgroundStyle={styles.bottomSheetBackground}
          handleIndicatorStyle={styles.handleIndicator}
        >
          <BottomSheetView style={styles.sortSheetContent}>
            <View style={styles.sortSheetHeader}>
              <Text style={styles.sortSheetTitle}>Sort By</Text>
              <TouchableOpacity
                onPress={() => setShowSortSheet(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
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
                      isSelected && styles.sortOptionSelected,
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
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
