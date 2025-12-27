import React, { useState, useCallback, useRef } from "react";
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
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Colors, Typography, Spacing } from "@/constants/design";
import { useTheme } from "@/contexts/ThemeContext";
import {
  FloatingHeader,
  HeaderActionButton,
} from "@/components/FloatingHeader";
import { MAP_PROPERTIES, MapProperty } from "@/constants/mockData";
import { LocationSelector } from "@/components/LocationSelector";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.md) / 2;

// Filter options
const DISTANCE_FILTERS = [
  { id: "all", label: "All" },
  { id: "1km", label: "< 1 km" },
  { id: "5km", label: "< 5 km" },
  { id: "10km", label: "< 10 km" },
];

const PROPERTY_TYPES = [
  { id: "all", label: "All" },
  { id: "house", label: "House" },
  { id: "apartment", label: "Apartment" },
  { id: "land", label: "Land" },
];

// Mock near you properties
const NEAR_YOU_PROPERTIES: MapProperty[] = MAP_PROPERTIES.slice(0, 8);

export default function NearYouPropertiesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [savedProperties, setSavedProperties] = useState<Set<string>>(
    new Set(["2", "5"])
  );
  const [distanceFilter, setDistanceFilter] = useState("all");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("all");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([
    "East Legon",
  ]);

  // Location selector bottom sheet
  const locationSheetRef = useRef<BottomSheetModal>(null);
  // const snapPoints = useMemo(() => ["90%"], []);

  const handleLocationChange = (locations: string[]) => {
    setSelectedLocations(locations);
  };

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.5}
    />
  );

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

  const filteredProperties = NEAR_YOU_PROPERTIES.filter((property) => {
    const matchesType =
      propertyTypeFilter === "all" ||
      property.propertyType === propertyTypeFilter;
    return matchesType;
  });

  const renderPropertyCard = ({ item }: { item: MapProperty }) => {
    const isSaved = savedProperties.has(item.id);
    // Mock distance for display
    const distance = (Math.random() * 5 + 0.5).toFixed(1);

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

          {/* Distance Badge */}
          <View
            style={[styles.distanceBadge, { backgroundColor: colors.surface }]}
          >
            <Ionicons name="location" size={10} color={colors.primary} />
            <Text style={[styles.distanceBadgeText, { color: colors.primary }]}>
              {distance} km
            </Text>
          </View>

          {/* Transaction Type Badge */}
          <View
            style={[
              styles.transactionBadge,
              {
                backgroundColor:
                  item.transactionType === "rent"
                    ? Colors.accentOrange
                    : colors.primary,
              },
            ]}
          >
            <Text style={styles.transactionBadgeText}>
              {item.transactionType === "rent" ? "Rent" : "Sale"}
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

          <Text style={[styles.priceText, { color: colors.primary }]}>
            {formatPrice(item.price)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <>
      {/* Location Info */}
      <View
        style={[
          styles.locationInfo,
          { backgroundColor: colors.surface, borderColor: colors.divider },
        ]}
      >
        <View
          style={[
            styles.locationIcon,
            { backgroundColor: `${colors.primary}15` },
          ]}
        >
          <Ionicons name="navigate" size={20} color={colors.primary} />
        </View>
        <View style={styles.locationDetails}>
          <Text style={[styles.locationLabel, { color: colors.textSecondary }]}>
            Selected Locations
          </Text>
          {selectedLocations.length > 0 ? (
            <View style={styles.selectedLocationsContainer}>
              {selectedLocations.slice(0, 3).map((location) => (
                <View
                  key={location}
                  style={[
                    styles.locationTag,
                    {
                      backgroundColor: `${colors.primary}15`,
                      borderColor: `${colors.primary}30`,
                    },
                  ]}
                >
                  <Text
                    style={[styles.locationTagText, { color: colors.primary }]}
                  >
                    {location}
                  </Text>
                </View>
              ))}
              {selectedLocations.length > 3 && (
                <View
                  style={[
                    styles.locationTag,
                    {
                      backgroundColor: `${colors.primary}15`,
                      borderColor: `${colors.primary}30`,
                    },
                  ]}
                >
                  <Text
                    style={[styles.locationTagText, { color: colors.primary }]}
                  >
                    +{selectedLocations.length - 3} more
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={[styles.locationValue, { color: colors.text }]}>
              No locations selected
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.changeLocation}
          activeOpacity={0.7}
          onPress={() => locationSheetRef.current?.present()}
        >
          <Text style={[styles.changeLocationText, { color: colors.primary }]}>
            Change
          </Text>
        </TouchableOpacity>
      </View>

      {/* Distance Filter */}
      <View style={styles.filterSection}>
        <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>
          Distance
        </Text>
        <View style={styles.distanceFilters}>
          {DISTANCE_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
                distanceFilter === filter.id && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => setDistanceFilter(filter.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: colors.textSecondary },
                  distanceFilter === filter.id && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Property Type Filter */}
      <View style={styles.filterSection}>
        <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>
          Property Type
        </Text>
        <View style={styles.distanceFilters}>
          {PROPERTY_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.filterChip,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
                propertyTypeFilter === type.id && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => setPropertyTypeFilter(type.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: colors.textSecondary },
                  propertyTypeFilter === type.id && styles.filterChipTextActive,
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
        <Text style={[styles.resultsCount, { color: colors.text }]}>
          {filteredProperties.length} Properties Near You
        </Text>
      </View>
    </>
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
          title="Near You"
          showBackButton
          onBackPress={() => router.back()}
          rightContent={
            <HeaderActionButton
              icon="map-outline"
              onPress={() => {
                // Pass flag to show distance filters on map if distance is selected
                if (distanceFilter && distanceFilter !== "all") {
                  router.push({
                    pathname: "/(tabs)/map",
                    params: { showDistanceFilter: "true" },
                  });
                } else {
                  router.push("/(tabs)/map");
                }
              }}
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              progressViewOffset={80 + insets.top}
            />
          }
        />

        {/* Location Selector Bottom Sheet */}
        <BottomSheetModal
          ref={locationSheetRef}
          index={0}
          snapPoints={["75%"]}
          enablePanDownToClose
          backdropComponent={renderBackdrop}
          backgroundStyle={{ backgroundColor: colors.background }}
          handleIndicatorStyle={{ backgroundColor: colors.textSecondary }}
        >
          <BottomSheetView style={styles.bottomSheetContent}>
            <View
              style={[
                styles.bottomSheetHeader,
                { borderBottomColor: colors.divider },
              ]}
            >
              <Text style={[styles.bottomSheetTitle, { color: colors.text }]}>
                Select Location
              </Text>
              <TouchableOpacity
                onPress={() => locationSheetRef.current?.dismiss()}
                style={[
                  styles.closeButton,
                  { backgroundColor: colors.surface },
                ]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.locationSelectorWrapper}>
              <LocationSelector
                selectedLocations={selectedLocations}
                onLocationsChange={handleLocationChange}
              />
            </View>
          </BottomSheetView>
        </BottomSheetModal>
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
  // Location Info
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  locationIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${Colors.primaryGreen}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  locationDetails: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  locationLabel: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  locationValue: {
    ...Typography.bodyMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  selectedLocationsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginTop: 4,
  },
  locationTag: {
    backgroundColor: `${Colors.primaryGreen}15`,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${Colors.primaryGreen}30`,
  },
  locationTagText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
  changeLocation: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  changeLocationText: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
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
  distanceFilters: {
    flexDirection: "row",
    flexWrap: "wrap",
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
  distanceBadge: {
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
  distanceBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "700",
    color: Colors.primaryGreen,
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
  bottomSheetBackground: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    marginBottom: Spacing.md,
  },
  bottomSheetTitle: {
    ...Typography.titleLarge,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  locationSelectorWrapper: {
    flex: 1,
  },
});
