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
import {
  FloatingHeader,
  HeaderActionButton,
} from "@/components/FloatingHeader";
import { MAP_PROPERTIES, MapProperty } from "@/constants/mockData";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.md) / 2;

// Filter options
const PROPERTY_TYPES = [
  { id: "all", label: "All" },
  { id: "house", label: "House" },
  { id: "apartment", label: "Apartment" },
  { id: "land", label: "Land" },
  { id: "commercial", label: "Commercial" },
];

const TRANSACTION_TYPES = [
  { id: "all", label: "All" },
  { id: "buy", label: "For Sale" },
  { id: "rent", label: "For Rent" },
];

// Mock featured properties (in real app, this would be fetched)
const FEATURED_PROPERTIES: MapProperty[] = MAP_PROPERTIES.filter(
  (_, index) => index % 2 === 0
);

export default function FeaturedPropertiesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [savedProperties, setSavedProperties] = useState<Set<string>>(
    new Set(["2", "5"])
  );
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("all");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("all");

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

  const filteredProperties = FEATURED_PROPERTIES.filter((property) => {
    const matchesType =
      propertyTypeFilter === "all" ||
      property.propertyType === propertyTypeFilter;
    const matchesTransaction =
      transactionTypeFilter === "all" ||
      property.transactionType === transactionTypeFilter;
    return matchesType && matchesTransaction;
  });

  const renderPropertyCard = ({ item }: { item: MapProperty }) => {
    const isSaved = savedProperties.has(item.id);

    return (
      <TouchableOpacity
        style={styles.propertyCard}
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

          {/* Save Button */}
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

          {/* Featured Badge */}
          <View style={styles.featuredBadge}>
            <Ionicons name="star" size={10} color="#F59E0B" />
            <Text style={styles.featuredBadgeText}>Featured</Text>
          </View>

          {/* Transaction Type Badge */}
          <View
            style={[
              styles.transactionBadge,
              {
                backgroundColor:
                  item.transactionType === "rent"
                    ? Colors.accentOrange
                    : Colors.primaryGreen,
              },
            ]}
          >
            <Text style={styles.transactionBadgeText}>
              {item.transactionType === "rent" ? "Rent" : "Sale"}
            </Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.propertyTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={12}
              color={Colors.textSecondary}
            />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>

          {/* Property Details */}
          {item.bedrooms && item.bathrooms && (
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Ionicons
                  name="bed-outline"
                  size={14}
                  color={Colors.textSecondary}
                />
                <Text style={styles.detailText}>{item.bedrooms}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons
                  name="water-outline"
                  size={14}
                  color={Colors.textSecondary}
                />
                <Text style={styles.detailText}>{item.bathrooms}</Text>
              </View>
            </View>
          )}

          <Text style={styles.priceText}>{formatPrice(item.price)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <>
      {/* Property Type Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Property Type</Text>
        <FlatList
          data={PROPERTY_TYPES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                propertyTypeFilter === item.id && styles.filterChipActive,
              ]}
              onPress={() => setPropertyTypeFilter(item.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  propertyTypeFilter === item.id && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Transaction Type Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Transaction Type</Text>
        <View style={styles.transactionFilters}>
          {TRANSACTION_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.transactionChip,
                transactionTypeFilter === type.id &&
                  styles.transactionChipActive,
              ]}
              onPress={() => setTransactionTypeFilter(type.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.transactionChipText,
                  transactionTypeFilter === type.id &&
                    styles.transactionChipTextActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredProperties.length} Featured Properties
        </Text>
      </View>
    </>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="home-outline" size={48} color={Colors.textSecondary} />
      </View>
      <Text style={styles.emptyTitle}>No Properties Found</Text>
      <Text style={styles.emptyMessage}>
        Try adjusting your filters to see more results
      </Text>
      <TouchableOpacity
        style={styles.resetButton}
        onPress={() => {
          setPropertyTypeFilter("all");
          setTransactionTypeFilter("all");
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.resetButtonText}>Reset Filters</Text>
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

        {/* Floating Header with Blur */}
        <FloatingHeader
          title="Featured Properties"
          showBackButton
          onBackPress={() => router.back()}
          rightContent={
            <HeaderActionButton
              icon="search-outline"
              onPress={() => router.push("/(tabs)/search")}
            />
          }
        />

        <FlatList
          data={filteredProperties}
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
              tintColor={Colors.primaryGreen}
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
  // List
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  columnWrapper: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  // Filter Section
  filterSection: {
    marginBottom: Spacing.lg,
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
  transactionFilters: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  transactionChip: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
    alignItems: "center",
  },
  transactionChipActive: {
    backgroundColor: Colors.primaryGreen,
    borderColor: Colors.primaryGreen,
  },
  transactionChipText: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  transactionChipTextActive: {
    color: "#FFFFFF",
  },
  // Results Header
  resultsHeader: {
    marginBottom: Spacing.md,
  },
  resultsCount: {
    ...Typography.bodyMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  // Property Card
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
  featuredBadge: {
    position: "absolute",
    top: Spacing.sm,
    left: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  featuredBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "700",
    color: "#F59E0B",
  },
  transactionBadge: {
    position: "absolute",
    bottom: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  transactionBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
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
  priceText: {
    ...Typography.titleMedium,
    fontSize: 15,
    fontWeight: "700",
    color: Colors.primaryGreen,
  },
  // Empty State
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
    marginBottom: Spacing.lg,
  },
  resetButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primaryGreen,
    borderRadius: 12,
  },
  resetButtonText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
