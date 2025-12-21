import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  RefreshControl,
  Modal,
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

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  image: string;
  bedrooms?: number;
  bathrooms?: number;
  isSaved?: boolean;
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
const ALL_PROPERTIES: Property[] = [
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
    useState<Property[]>(ALL_PROPERTIES);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("relevance");
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

  const renderPropertyList = (property: Property) => (
    <TouchableOpacity
      style={styles.listCard}
      onPress={() => {
        router.push(`/property/${property.id}`);
      }}
      activeOpacity={0.8}
    >
      <Image source={{ uri: property.image }} style={styles.listImage} />
      <View style={styles.listContent}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle} numberOfLines={1}>
            {property.title}
          </Text>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              toggleSave(property.id);
            }}
            style={styles.saveButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name={
                savedProperties.has(property.id) ? "heart" : "heart-outline"
              }
              size={20}
              color={
                savedProperties.has(property.id)
                  ? "#FF3B30"
                  : Colors.textSecondary
              }
            />
          </TouchableOpacity>
        </View>
        <View style={styles.locationRow}>
          <Ionicons
            name="location-outline"
            size={14}
            color={Colors.textSecondary}
          />
          <Text style={styles.listLocation} numberOfLines={1}>
            {property.location}
          </Text>
        </View>
        <Text style={styles.listPrice}>{formatPrice(property.price)}</Text>
        {property.bedrooms && property.bathrooms && (
          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Ionicons
                name="bed-outline"
                size={14}
                color={Colors.primaryGreen}
              />
              <Text style={styles.statText}>{property.bedrooms}</Text>
            </View>
            <View style={styles.statChip}>
              <Ionicons
                name="water-outline"
                size={14}
                color={Colors.primaryGreen}
              />
              <Text style={styles.statText}>{property.bathrooms}</Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderPropertyGrid = (property: Property) => (
    <TouchableOpacity
      style={styles.gridCard}
      onPress={() => {
        router.push(`/property/${property.id}`);
      }}
      activeOpacity={0.8}
    >
      <View style={styles.gridImageContainer}>
        <Image
          source={{ uri: property.image }}
          style={styles.gridImage}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.gridSaveButton}
          onPress={(e) => {
            e.stopPropagation();
            toggleSave(property.id);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.gridSaveButtonBackground}>
            <Ionicons
              name={
                savedProperties.has(property.id) ? "heart" : "heart-outline"
              }
              size={20}
              color={
                savedProperties.has(property.id)
                  ? "#FF3B30"
                  : Colors.textPrimary
              }
            />
          </View>
        </TouchableOpacity>
        {property.bedrooms && property.bathrooms && (
          <View style={styles.gridBadge}>
            <Ionicons name="bed-outline" size={12} color={Colors.textPrimary} />
            <Text style={styles.gridBadgeText}>{property.bedrooms}</Text>
            <Ionicons
              name="water-outline"
              size={12}
              color={Colors.textPrimary}
            />
            <Text style={styles.gridBadgeText}>{property.bathrooms}</Text>
          </View>
        )}
      </View>
      <View style={styles.gridContent}>
        <Text style={styles.gridTitle} numberOfLines={1}>
          {property.title}
        </Text>
        <View style={styles.locationRow}>
          <Ionicons
            name="location-outline"
            size={12}
            color={Colors.textSecondary}
          />
          <Text style={styles.gridLocation} numberOfLines={1}>
            {property.location}
          </Text>
        </View>
        <Text style={styles.gridPrice}>{formatPrice(property.price)}</Text>
      </View>
    </TouchableOpacity>
  );

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

  return (
    <>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top + Spacing.md,
              paddingBottom: Spacing.md,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search Results</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerActionButton}
              onPress={() => setShowFilterSheet(true)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="options-outline"
                size={22}
                color={Colors.textPrimary}
              />
              {hasActiveFilters && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>
                    {getActiveFiltersCount()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerActionButton}
              onPress={() =>
                setViewMode((prev) => (prev === "list" ? "grid" : "list"))
              }
              activeOpacity={0.7}
            >
              <Ionicons
                name={viewMode === "list" ? "grid-outline" : "list-outline"}
                size={22}
                color={Colors.textPrimary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerActionButton}
              onPress={() => {
                // TODO: Show menu options
                console.log("Menu pressed");
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="ellipsis-vertical"
                size={22}
                color={Colors.textPrimary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 100 },
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

          {/* Action Bar */}
          <View style={styles.actionBar}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowFilterSheet(true)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="options-outline"
                size={18}
                color={Colors.primaryGreen}
              />
              <Text style={styles.actionButtonText}>Filter</Text>
              {hasActiveFilters && (
                <View style={styles.actionBadge}>
                  <Text style={styles.actionBadgeText}>
                    {getActiveFiltersCount()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowSortModal(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>Sort</Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={Colors.textPrimary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                router.push("/(tabs)/map");
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="map-outline"
                size={18}
                color={Colors.primaryGreen}
              />
              <Text style={styles.actionButtonText}>Map</Text>
            </TouchableOpacity>
          </View>

          {/* Property List/Grid */}
          {viewMode === "list" ? (
            <View style={styles.listContainer}>
              {filteredProperties.map((property) => (
                <View key={property.id}>{renderPropertyList(property)}</View>
              ))}
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {filteredProperties.map((property) => (
                <View key={property.id} style={styles.gridItem}>
                  {renderPropertyGrid(property)}
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

        {/* Sort Modal */}
        <Modal
          visible={showSortModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowSortModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowSortModal(false)}
          >
            <View style={styles.sortModal}>
              <View style={styles.sortModalHeader}>
                <Text style={styles.sortModalTitle}>Sort By</Text>
                <TouchableOpacity
                  onPress={() => setShowSortModal(false)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>
              <View style={styles.sortOptions}>
                {SORT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.sortOption,
                      sortOption === option.value && styles.sortOptionActive,
                    ]}
                    onPress={() => {
                      setSortOption(option.value);
                      setShowSortModal(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.sortOptionText,
                        sortOption === option.value &&
                          styles.sortOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {sortOption === option.value && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={Colors.primaryGreen}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>

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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    ...Typography.titleLarge,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    flex: 1,
    textAlign: "center",
    marginHorizontal: Spacing.md,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  headerActionButton: {
    padding: Spacing.xs,
    position: "relative",
  },
  filterBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: Colors.primaryGreen,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  filterBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
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
  actionButton: {
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
  actionButtonText: {
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
  listCard: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  listImage: {
    width: 120,
    height: 120,
    backgroundColor: Colors.divider,
  },
  listContent: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: "space-between",
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  listTitle: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.xs,
  },
  saveButton: {
    padding: Spacing.xs / 2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs / 2,
    marginBottom: Spacing.xs,
  },
  listLocation: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  listPrice: {
    ...Typography.titleLarge,
    fontSize: 18,
    fontWeight: "800",
    color: Colors.primaryGreen,
    marginBottom: Spacing.xs,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs / 2,
  },
  statText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textPrimary,
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
  gridCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  gridImageContainer: {
    width: "100%",
    height: 180,
    position: "relative",
    backgroundColor: Colors.divider,
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  gridSaveButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
  },
  gridSaveButtonBackground: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  gridBadge: {
    position: "absolute",
    bottom: Spacing.sm,
    left: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs / 2,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: 12,
  },
  gridBadgeText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  gridContent: {
    padding: Spacing.md,
  },
  gridTitle: {
    ...Typography.titleMedium,
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs / 2,
  },
  gridLocation: {
    ...Typography.bodyMedium,
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  gridPrice: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: "800",
    color: Colors.primaryGreen,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  sortModal: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Spacing.xl,
    maxHeight: "70%",
  },
  sortModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  sortModalTitle: {
    ...Typography.titleLarge,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  sortOptions: {
    paddingTop: Spacing.md,
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  sortOptionActive: {
    backgroundColor: Colors.primaryLight,
  },
  sortOptionText: {
    ...Typography.bodyLarge,
    fontSize: 16,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  sortOptionTextActive: {
    fontWeight: "700",
    color: Colors.primaryGreen,
  },
});
