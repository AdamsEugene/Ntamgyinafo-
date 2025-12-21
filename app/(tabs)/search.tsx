import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput as RNTextInput,
  Platform,
  Keyboard,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography, Spacing } from "@/constants/design";

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  image: string;
  bedrooms?: number;
  bathrooms?: number;
  isSaved?: boolean;
}

interface Filter {
  type?: string[];
  transaction?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  amenities?: string[];
}

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
  },
  {
    id: "6",
    title: "Cozy 1 Bedroom Studio",
    location: "Adabraka, Accra",
    price: 2000,
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=300&h=300&fit=crop",
    bedrooms: 1,
    bathrooms: 1,
    isSaved: false,
  },
  {
    id: "7",
    title: "Modern 2 Bedroom Apartment",
    location: "Teshie, Accra",
    price: 2800,
    image:
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=300&h=300&fit=crop",
    bedrooms: 2,
    bathrooms: 2,
    isSaved: false,
  },
  {
    id: "8",
    title: "Luxury 4 Bedroom Duplex",
    location: "Spintex, Accra",
    price: 1200000,
    image:
      "https://images.unsplash.com/photo-1600585154084-4c5f0ea33f38?w=300&h=300&fit=crop",
    bedrooms: 4,
    bathrooms: 3,
    isSaved: false,
  },
];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const searchInputRef = useRef<RNTextInput>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedLocation] = useState("Accra");
  const [savedProperties, setSavedProperties] = useState<Set<string>>(
    new Set(["2", "5"])
  );
  const [filters, setFilters] = useState<Filter>({});
  const [filteredProperties, setFilteredProperties] =
    useState<Property[]>(ALL_PROPERTIES);

  // Auto-focus search input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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
    if (filters.type && filters.type.length > 0) {
      // Filter by type logic would go here
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

  const activeFiltersCount = Object.keys(filters).filter(
    (key) => filters[key as keyof Filter] !== undefined
  ).length;

  const hasActiveFilters = activeFiltersCount > 0;

  const renderPropertyList = (property: Property) => (
    <TouchableOpacity
      style={styles.propertyCard}
      onPress={() => {
        console.log("Navigate to property:", property.id);
        // TODO: Navigate to property detail
      }}
      activeOpacity={0.8}
    >
      <View style={styles.propertyImageContainer}>
        <Image
          source={{ uri: property.image }}
          style={styles.propertyImage}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.propertySaveButton}
          onPress={() => toggleSave(property.id)}
          activeOpacity={0.7}
        >
          <View style={styles.propertySaveButtonBackground}>
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
          <View style={styles.propertyBadge}>
            <Ionicons name="bed-outline" size={12} color={Colors.textPrimary} />
            <Text style={styles.propertyBadgeText}>{property.bedrooms}</Text>
            <Ionicons
              name="water-outline"
              size={12}
              color={Colors.textPrimary}
              style={{ marginLeft: Spacing.xs }}
            />
            <Text style={styles.propertyBadgeText}>{property.bathrooms}</Text>
          </View>
        )}
      </View>
      <View style={styles.propertyContent}>
        <Text style={styles.propertyTitle} numberOfLines={2}>
          {property.title}
        </Text>
        <View style={styles.propertyLocation}>
          <Ionicons
            name="location-outline"
            size={14}
            color={Colors.textSecondary}
          />
          <Text style={styles.propertyLocationText} numberOfLines={1}>
            {property.location}
          </Text>
        </View>
        <Text style={styles.propertyPrice}>{formatPrice(property.price)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderPropertyGrid = (property: Property) => (
    <TouchableOpacity
      style={styles.gridCard}
      onPress={() => {
        console.log("Navigate to property:", property.id);
        // TODO: Navigate to property detail
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
          onPress={() => toggleSave(property.id)}
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
              style={{ marginLeft: Spacing.xs }}
            />
            <Text style={styles.gridBadgeText}>{property.bathrooms}</Text>
          </View>
        )}
      </View>
      <View style={styles.gridContent}>
        <Text style={styles.gridTitle} numberOfLines={2}>
          {property.title}
        </Text>
        <View style={styles.gridLocation}>
          <Ionicons
            name="location-outline"
            size={12}
            color={Colors.textSecondary}
          />
          <Text style={styles.gridLocationText} numberOfLines={1}>
            {property.location}
          </Text>
        </View>
        <Text style={styles.gridPrice}>{formatPrice(property.price)}</Text>
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

        {/* Floating Sticky Header - Same as Home Screen */}
        <View
          style={[
            styles.floatingHeader,
            { paddingTop: insets.top + Spacing.md },
          ]}
        >
          <TouchableOpacity
            onPress={() => {
              // TODO: Show location picker
              console.log("Change Location");
            }}
            style={styles.locationContainer}
            activeOpacity={0.7}
          >
            <View style={styles.locationIconContainer}>
              <Ionicons name="location" size={18} color={Colors.primaryGreen} />
            </View>
            <Text style={styles.location}>{selectedLocation}</Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Search and Notification Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              onPress={() => {
                // Focus the search input at bottom
                searchInputRef.current?.focus();
              }}
              style={styles.searchButton}
              activeOpacity={0.7}
            >
              <View style={styles.searchIconContainer}>
                <Ionicons
                  name="search-outline"
                  size={22}
                  color={Colors.textPrimary}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                // TODO: Navigate to notifications
                console.log("Notifications");
              }}
              style={styles.notificationButton}
              activeOpacity={0.7}
            >
              <View style={styles.notificationIconContainer}>
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color={Colors.textPrimary}
                />
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>3</Text>
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
                {filters.type && filters.type.length > 0 && (
                  <View style={styles.filterChip}>
                    <Text style={styles.filterChipText}>
                      {filters.type.join(", ")}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setFilters({ ...filters, type: undefined })
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
                <View key={property.id}>{renderPropertyList(property)}</View>
              ))}
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {filteredProperties.map((property) => (
                <View key={property.id}>{renderPropertyGrid(property)}</View>
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

        {/* Floating Search Input - Above Bottom Navigation */}
        <View
          style={[
            styles.floatingSearchContainer,
            {
              paddingBottom: Math.max(insets.bottom, Spacing.md) + 70, // Space for bottom nav
            },
          ]}
        >
          <View style={styles.floatingSearchInputContainer}>
            <Ionicons
              name="search"
              size={20}
              color={Colors.textSecondary}
              style={styles.floatingSearchIcon}
            />
            <RNTextInput
              ref={searchInputRef}
              style={styles.floatingSearchInput}
              placeholder="Search properties..."
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.floatingClearButton}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter and View Mode Buttons */}
          <View style={styles.floatingActionsContainer}>
            <TouchableOpacity
              style={styles.floatingActionButton}
              onPress={() => {
                console.log("Open filters");
                // TODO: Open filter bottom sheet
              }}
              activeOpacity={0.7}
            >
              <View style={styles.floatingActionButtonBackground}>
                <Ionicons
                  name="options-outline"
                  size={22}
                  color={Colors.textPrimary}
                />
                {hasActiveFilters && (
                  <View style={styles.floatingFilterBadge}>
                    <Text style={styles.floatingFilterBadgeText}>
                      {activeFiltersCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.floatingActionButton}
              onPress={() =>
                setViewMode((prev) => (prev === "list" ? "grid" : "list"))
              }
              activeOpacity={0.7}
            >
              <View style={styles.floatingActionButtonBackground}>
                <Ionicons
                  name={viewMode === "list" ? "grid-outline" : "list-outline"}
                  size={22}
                  color={Colors.textPrimary}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
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
  floatingHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    zIndex: 100,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
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
  locationIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F1F8F4",
    justifyContent: "center",
    alignItems: "center",
  },
  location: {
    ...Typography.bodyMedium,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  notificationButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  notificationIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
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
  searchButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  searchIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
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
  floatingActionsContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
    justifyContent: "flex-end",
    marginBottom: Spacing.sm,
  },
  floatingActionButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  floatingActionButtonBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
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
  floatingFilterBadge: {
    position: "absolute",
    top: -2,
    right: -2,
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
  floatingFilterBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  floatingSearchContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    zIndex: 999,
    backgroundColor: Colors.background,
  },
  floatingSearchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.divider,
    gap: Spacing.xs,
    marginBottom: Spacing.md,
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
  floatingSearchIcon: {
    marginRight: Spacing.xs,
  },
  floatingSearchInput: {
    flex: 1,
    ...Typography.bodyMedium,
    fontSize: 15,
    color: Colors.textPrimary,
    padding: 0,
    ...Platform.select({
      android: {
        includeFontPadding: false,
        textAlignVertical: "center",
      },
    }),
  },
  floatingClearButton: {
    padding: Spacing.xs,
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
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  listContainer: {
    gap: Spacing.md,
  },
  propertyCard: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
    overflow: "hidden",
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
  propertyImageContainer: {
    position: "relative",
    width: 140,
    height: 140,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: Spacing.md,
  },
  propertyImage: {
    width: "100%",
    height: "100%",
  },
  propertySaveButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    zIndex: 10,
  },
  propertySaveButtonBackground: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
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
  propertyBadge: {
    position: "absolute",
    bottom: Spacing.sm,
    left: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: Spacing.xs,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  propertyBadgeText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  propertyContent: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: Spacing.xs,
  },
  propertyTitle: {
    ...Typography.titleLarge,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    lineHeight: 22,
  },
  propertyLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  propertyLocationText: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  propertyPrice: {
    ...Typography.headlineMedium,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primaryGreen,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    gap: Spacing.md,
    justifyContent: "space-between",
  },
  gridCard: {
    width: "48%",
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
  gridImageContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 4 / 5,
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  gridSaveButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    zIndex: 10,
  },
  gridSaveButtonBackground: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
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
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: Spacing.xs,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  gridBadgeText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  gridContent: {
    padding: Spacing.md,
    paddingTop: Spacing.sm,
  },
  gridTitle: {
    ...Typography.titleMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs / 2,
    minHeight: 36,
    lineHeight: 18,
  },
  gridLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs / 2,
    marginBottom: Spacing.sm,
  },
  gridLocationText: {
    ...Typography.bodyMedium,
    fontSize: 11,
    color: Colors.textSecondary,
    flex: 1,
  },
  gridPrice: {
    ...Typography.headlineMedium,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primaryGreen,
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
