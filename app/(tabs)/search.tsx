import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
  PropertyListCard,
  PropertyGridCard,
  type Property,
} from "@/components/PropertyCard";
import { FloatingSearchBar } from "@/components/FloatingSearchBar";
import { ALL_PROPERTIES } from "@/constants/mockData";

interface Filter {
  propertyTypes?: string[];
  transactionType?: "buy" | "rent" | null;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number | null;
  amenities?: string[];
}

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [savedProperties, setSavedProperties] = useState<Set<string>>(
    new Set(["2", "5"])
  );
  const [filters, setFilters] = useState<Filter>({});
  const [filteredProperties, setFilteredProperties] =
    useState<Property[]>(ALL_PROPERTIES);
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  // Real-time search and filter
  useEffect(() => {
    let results = ALL_PROPERTIES;

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (property) =>
          property.title.toLowerCase().includes(query) ||
          property.location.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filters.propertyTypes && filters.propertyTypes.length > 0) {
      // Filter by property type logic would go here
      // For now, we'll keep all properties
    }
    if (filters.amenities && filters.amenities.length > 0) {
      // Filter by amenities logic would go here
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
    if (filters.bedrooms !== undefined) {
      results = results.filter(
        (property) => property.bedrooms === filters.bedrooms
      );
    }

    setFilteredProperties(results);
  }, [searchQuery, filters]);

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

  const clearAllFilters = () => {
    setFilters({});
  };

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

  const activeFiltersCount = getActiveFiltersCount();
  const hasActiveFilters = activeFiltersCount > 0;

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
            <Text style={styles.headerTitleText}>Search</Text>
          </View>

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
                      {activeFiltersCount}
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
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: 80 + insets.top,
              paddingBottom: 120 + insets.bottom, // Extra space for search input and bottom nav
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={Keyboard.dismiss}
        >
          {/* Active Filters Bar */}
          {hasActiveFilters && (
            <View style={styles.filtersBar}>
              <View style={styles.filtersChips}>
                {filters.propertyTypes && filters.propertyTypes.length > 0 && (
                  <View style={styles.filterChip}>
                    <Text style={styles.filterChipText}>
                      {filters.propertyTypes.join(", ")}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setFilters({ ...filters, propertyTypes: undefined })
                      }
                    >
                      <Ionicons
                        name="close-circle"
                        size={16}
                        color={Colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                )}
                {filters.transactionType && (
                  <View style={styles.filterChip}>
                    <Text style={styles.filterChipText}>
                      {filters.transactionType === "buy" ? "Buy" : "Rent"}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setFilters({ ...filters, transactionType: null })
                      }
                    >
                      <Ionicons
                        name="close-circle"
                        size={16}
                        color={Colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                )}
                {filters.bedrooms !== null &&
                  filters.bedrooms !== undefined && (
                    <View style={styles.filterChip}>
                      <Text style={styles.filterChipText}>
                        {filters.bedrooms === 5 ? "5+" : filters.bedrooms} Beds
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          setFilters({ ...filters, bedrooms: null })
                        }
                      >
                        <Ionicons
                          name="close-circle"
                          size={16}
                          color={Colors.textSecondary}
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                {filters.amenities && filters.amenities.length > 0 && (
                  <View style={styles.filterChip}>
                    <Text style={styles.filterChipText}>
                      {filters.amenities.length} Amenities
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setFilters({ ...filters, amenities: undefined })
                      }
                    >
                      <Ionicons
                        name="close-circle"
                        size={16}
                        color={Colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                )}
                {filters.minPrice !== undefined && (
                  <View style={styles.filterChip}>
                    <Text style={styles.filterChipText}>
                      Min: {formatPrice(filters.minPrice)}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setFilters({ ...filters, minPrice: undefined })
                      }
                    >
                      <Ionicons
                        name="close-circle"
                        size={16}
                        color={Colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                )}
                {filters.maxPrice !== undefined && (
                  <View style={styles.filterChip}>
                    <Text style={styles.filterChipText}>
                      Max: {formatPrice(filters.maxPrice)}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setFilters({ ...filters, maxPrice: undefined })
                      }
                    >
                      <Ionicons
                        name="close-circle"
                        size={16}
                        color={Colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                )}
                {filters.bedrooms !== undefined && (
                  <View style={styles.filterChip}>
                    <Text style={styles.filterChipText}>
                      {filters.bedrooms} Beds
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setFilters({ ...filters, bedrooms: undefined })
                      }
                    >
                      <Ionicons
                        name="close-circle"
                        size={16}
                        color={Colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <TouchableOpacity
                onPress={clearAllFilters}
                style={styles.clearAllButton}
                activeOpacity={0.7}
              >
                <Text style={styles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
            </View>
          )}

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

          {filteredProperties.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons
                name="search-outline"
                size={64}
                color={Colors.textSecondary}
              />
              <Text style={styles.emptyStateTitle}>No properties found</Text>
              <Text style={styles.emptyStateText}>
                Try adjusting your search or filters
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Floating Search Input */}
        <FloatingSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search properties..."
          autoFocus
          collapsedWidth={200}
        />

        {/* Filter Bottom Sheet */}
        <FilterBottomSheet
          visible={showFilterSheet}
          onClose={() => setShowFilterSheet(false)}
          onApply={(newFilters: FilterOptions) => {
            setFilters(newFilters as Filter);
            setShowFilterSheet(false);
            // Navigate to Search Results Screen
            router.push({
              pathname: "/search-results",
              params: {
                filters: JSON.stringify(newFilters),
                location: "Accra", // You can get this from location selector
              },
            });
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
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  filtersBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  filtersChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    flex: 1,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  filterChipText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textPrimary,
  },
  clearAllButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  clearAllText: {
    ...Typography.labelMedium,
    fontSize: 14,
    color: Colors.primaryGreen,
    fontWeight: "600",
  },
  resultsHeader: {
    marginBottom: Spacing.lg,
  },
  resultsCount: {
    ...Typography.titleLarge,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
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
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["3xl"],
    paddingHorizontal: Spacing.xl,
  },
  emptyStateTitle: {
    ...Typography.headlineMedium,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyStateText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
