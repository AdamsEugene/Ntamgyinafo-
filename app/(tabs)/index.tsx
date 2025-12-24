import React, { useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  FlatList,
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
import {
  FloatingHeaderStyles,
  HEADER_ICON_SIZE,
} from "@/components/FloatingHeader.styles";
import {
  FEATURED_PROPERTIES,
  NEAR_YOU_PROPERTIES,
  NEW_LISTINGS,
} from "@/constants/mockData";
import { LocationSelector } from "@/components/LocationSelector";

const CATEGORIES = [
  {
    id: "house",
    label: "House",
    icon: "home-outline" as const,
  },
  {
    id: "apartment",
    label: "Apartment",
    icon: "business-outline" as const,
  },
  {
    id: "land",
    label: "Land",
    icon: "map-outline" as const,
  },
  {
    id: "commercial",
    label: "Commercial",
    icon: "storefront-outline" as const,
  },
];

const POPULAR_AREAS = [
  {
    id: "east-legon",
    name: "East Legon",
    count: 234,
    icon: "location" as const,
    color: "#10B981",
  },
  {
    id: "airport",
    name: "Airport Residential",
    count: 189,
    icon: "airplane" as const,
    color: "#3B82F6",
  },
  {
    id: "labone",
    name: "Labone",
    count: 156,
    icon: "leaf" as const,
    color: "#8B5CF6",
  },
  {
    id: "cantonments",
    name: "Cantonments",
    count: 142,
    icon: "shield" as const,
    color: "#F59E0B",
  },
  {
    id: "osu",
    name: "Osu",
    count: 128,
    icon: "restaurant" as const,
    color: "#EF4444",
  },
];

// Quick stats for the dashboard
const QUICK_STATS = [
  {
    id: "properties",
    label: "Properties",
    value: "2,450+",
    icon: "home" as const,
  },
  {
    id: "verified",
    label: "Verified",
    value: "1,200+",
    icon: "shield-checkmark" as const,
  },
  { id: "cities", label: "Cities", value: "16", icon: "map" as const },
];

export default function BuyerHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([
    "Accra",
  ]);
  const [savedProperties, setSavedProperties] = useState<Set<string>>(
    new Set(["2", "5"])
  );

  // Location selector bottom sheet
  const locationSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["90%"], []);

  const selectedLocation =
    selectedLocations.length > 0 ? selectedLocations[0] : "Select Location";

  const handleLocationChange = (locations: string[]) => {
    setSelectedLocations(locations);
    // If a location is selected, close the sheet
    // (LocationSelector allows multiple selections, but we'll use the first one for display)
    if (locations.length > 0) {
      // Optionally auto-close, or let user close manually
      // locationSheetRef.current?.dismiss();
    }
  };

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.5}
    />
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // TODO: Fetch fresh data
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
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
          <TouchableOpacity
            onPress={() => locationSheetRef.current?.present()}
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
              onPress={() => router.push("/(tabs)/search")}
              style={FloatingHeaderStyles.actionButton}
              activeOpacity={0.7}
            >
              <View style={FloatingHeaderStyles.actionButtonBackground}>
                <Ionicons
                  name="search-outline"
                  size={HEADER_ICON_SIZE}
                  color={Colors.textPrimary}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/notifications")}
              style={FloatingHeaderStyles.actionButton}
              activeOpacity={0.7}
            >
              <View style={FloatingHeaderStyles.actionButtonBackground}>
                <Ionicons
                  name="notifications-outline"
                  size={HEADER_ICON_SIZE}
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
              paddingBottom: 40 + insets.bottom,
            },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Hello, Kofi 👋</Text>
            <Text style={styles.welcomeSubtext}>
              Find your dream property today
            </Text>
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStatsContainer}>
            {QUICK_STATS.map((stat) => (
              <View key={stat.id} style={styles.quickStatCard}>
                <View style={styles.quickStatIcon}>
                  <Ionicons
                    name={stat.icon}
                    size={18}
                    color={Colors.primaryGreen}
                  />
                </View>
                <Text style={styles.quickStatValue}>{stat.value}</Text>
                <Text style={styles.quickStatLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Categories Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <FlatList
              data={CATEGORIES}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
              keyExtractor={(item) => item.id}
              renderItem={({ item: category }) => (
                <TouchableOpacity
                  style={styles.categoryCard}
                  onPress={() => router.push(`/category/${category.id}`)}
                  activeOpacity={0.8}
                >
                  <View style={styles.categoryIconContainer}>
                    <View style={styles.categoryIconBackground}>
                      <Ionicons
                        name={category.icon}
                        size={32}
                        color={Colors.primaryGreen}
                      />
                    </View>
                  </View>
                  <Text style={styles.categoryLabel}>{category.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* Featured Properties Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Properties</Text>
              <TouchableOpacity
                onPress={() => router.push("/featured-properties")}
                activeOpacity={0.7}
              >
                <Text style={styles.seeAll}>See All →</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={FEATURED_PROPERTIES}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredContainer}
              keyExtractor={(item) => item.id}
              renderItem={({ item: property }) => (
                <TouchableOpacity
                  style={styles.featuredCard}
                  onPress={() => router.push(`/property/${property.id}`)}
                  activeOpacity={0.9}
                >
                  <View style={styles.featuredImageContainer}>
                    <Animated.Image
                      source={{ uri: property.image }}
                      style={styles.featuredImage}
                      resizeMode="cover"
                      {...{
                        sharedTransitionTag: `property-image-${property.id}`,
                      }}
                    />
                    <View style={styles.featuredImageOverlay} />
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={() => toggleSave(property.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={
                          savedProperties.has(property.id)
                            ? "heart"
                            : "heart-outline"
                        }
                        size={22}
                        color={
                          savedProperties.has(property.id)
                            ? "#FF3B30"
                            : Colors.textPrimary
                        }
                      />
                    </TouchableOpacity>
                    {property.bedrooms && property.bathrooms && (
                      <View style={styles.featuredBadge}>
                        <Ionicons
                          name="bed-outline"
                          size={14}
                          color={Colors.textPrimary}
                        />
                        <Text style={styles.featuredBadgeText}>
                          {property.bedrooms}
                        </Text>
                        <Ionicons
                          name="water-outline"
                          size={14}
                          color={Colors.textPrimary}
                          style={{ marginLeft: Spacing.xs }}
                        />
                        <Text style={styles.featuredBadgeText}>
                          {property.bathrooms}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.featuredContent}>
                    <Text style={styles.featuredTitle} numberOfLines={2}>
                      {property.title}
                    </Text>
                    <View style={styles.featuredLocationRow}>
                      <Ionicons
                        name="location-outline"
                        size={14}
                        color={Colors.textSecondary}
                      />
                      <Text style={styles.featuredLocation} numberOfLines={1}>
                        {property.location}
                      </Text>
                    </View>
                    <Text style={styles.featuredPrice}>
                      {formatPrice(property.price)}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* Near You Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Near You</Text>
              <TouchableOpacity
                onPress={() => router.push("/near-you-properties")}
                activeOpacity={0.7}
              >
                <Text style={styles.seeAll}>See All →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.nearYouContainer}>
              {NEAR_YOU_PROPERTIES.map((property) => (
                <TouchableOpacity
                  key={property.id}
                  style={styles.nearYouCard}
                  onPress={() => router.push(`/property/${property.id}`)}
                  activeOpacity={0.8}
                >
                  <View style={styles.nearYouImageContainer}>
                    <Animated.Image
                      source={{ uri: property.image }}
                      style={styles.nearYouImage}
                      resizeMode="cover"
                      {...{
                        sharedTransitionTag: `property-image-${property.id}`,
                      }}
                    />
                    <TouchableOpacity
                      style={styles.nearYouSaveButton}
                      onPress={() => toggleSave(property.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.nearYouSaveButtonBackground}>
                        <Ionicons
                          name={
                            savedProperties.has(property.id)
                              ? "heart"
                              : "heart-outline"
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
                      <View style={styles.nearYouBadge}>
                        <Ionicons
                          name="bed-outline"
                          size={12}
                          color={Colors.textPrimary}
                        />
                        <Text style={styles.nearYouBadgeText}>
                          {property.bedrooms}
                        </Text>
                        <Ionicons
                          name="water-outline"
                          size={12}
                          color={Colors.textPrimary}
                          style={{ marginLeft: Spacing.xs }}
                        />
                        <Text style={styles.nearYouBadgeText}>
                          {property.bathrooms}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.nearYouContent}>
                    <Text style={styles.nearYouTitle} numberOfLines={2}>
                      {property.title}
                    </Text>
                    <View style={styles.nearYouLocation}>
                      <Ionicons
                        name="location-outline"
                        size={14}
                        color={Colors.textSecondary}
                      />
                      <Text
                        style={styles.nearYouLocationText}
                        numberOfLines={1}
                      >
                        {property.location}
                      </Text>
                    </View>
                    <View style={styles.nearYouFooter}>
                      <Text style={styles.nearYouPrice}>
                        {formatPrice(property.price)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Popular Areas Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular Areas</Text>
              <TouchableOpacity
                onPress={() => router.push("/popular-areas")}
                activeOpacity={0.7}
              >
                <Text style={styles.seeAll}>See All →</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={POPULAR_AREAS}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.popularAreasContainer}
              keyExtractor={(item) => item.id}
              renderItem={({ item: area }) => (
                <TouchableOpacity
                  style={styles.popularAreaCard}
                  onPress={() => {
                    router.push("/(tabs)/search");
                  }}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.popularAreaIconContainer,
                      { backgroundColor: `${area.color}15` },
                    ]}
                  >
                    <Ionicons name={area.icon} size={28} color={area.color} />
                  </View>
                  <Text style={styles.popularAreaName}>{area.name}</Text>
                  <View style={styles.popularAreaCountContainer}>
                    <Ionicons
                      name="home-outline"
                      size={12}
                      color={Colors.textSecondary}
                    />
                    <Text style={styles.popularAreaCount}>{area.count}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* New Listings Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>New Listings</Text>
              <TouchableOpacity
                onPress={() => router.push("/new-listings")}
                activeOpacity={0.7}
              >
                <Text style={styles.seeAll}>See All →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.nearYouContainer}>
              {NEW_LISTINGS.map((property) => (
                <TouchableOpacity
                  key={property.id}
                  style={styles.nearYouCard}
                  onPress={() => router.push(`/property/${property.id}`)}
                  activeOpacity={0.8}
                >
                  <View style={styles.nearYouImageContainer}>
                    <Animated.Image
                      source={{ uri: property.image }}
                      style={styles.nearYouImage}
                      resizeMode="cover"
                      {...{
                        sharedTransitionTag: `property-image-${property.id}`,
                      }}
                    />
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>NEW</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.nearYouSaveButton}
                      onPress={() => toggleSave(property.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.nearYouSaveButtonBackground}>
                        <Ionicons
                          name={
                            savedProperties.has(property.id)
                              ? "heart"
                              : "heart-outline"
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
                      <View style={styles.nearYouBadge}>
                        <Ionicons
                          name="bed-outline"
                          size={12}
                          color={Colors.textPrimary}
                        />
                        <Text style={styles.nearYouBadgeText}>
                          {property.bedrooms}
                        </Text>
                        <Ionicons
                          name="water-outline"
                          size={12}
                          color={Colors.textPrimary}
                          style={{ marginLeft: Spacing.xs }}
                        />
                        <Text style={styles.nearYouBadgeText}>
                          {property.bathrooms}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.nearYouContent}>
                    <Text style={styles.nearYouTitle} numberOfLines={2}>
                      {property.title}
                    </Text>
                    <View style={styles.nearYouLocation}>
                      <Ionicons
                        name="location-outline"
                        size={14}
                        color={Colors.textSecondary}
                      />
                      <Text
                        style={styles.nearYouLocationText}
                        numberOfLines={1}
                      >
                        {property.location}
                      </Text>
                    </View>
                    <View style={styles.nearYouFooter}>
                      <Text style={styles.nearYouPrice}>
                        {formatPrice(property.price)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Location Selector Bottom Sheet */}
      <BottomSheetModal
        ref={locationSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.bottomSheetBackground}
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>Select Location</Text>
            <TouchableOpacity
              onPress={() => locationSheetRef.current?.dismiss()}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
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
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 100,
    paddingBottom: Spacing["2xl"],
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
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.titleLarge,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  seeAll: {
    ...Typography.labelLarge,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
  categoriesContainer: {
    paddingRight: Spacing.xl,
    gap: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  categoryCard: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.lg,
    minWidth: 100,
    borderWidth: 1,
    borderColor: Colors.divider,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  categoryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  categoryIconBackground: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F1F8F4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E8F5E9",
  },
  categoryLabel: {
    ...Typography.labelLarge,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  featuredContainer: {
    paddingRight: Spacing.xl,
    gap: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  featuredCard: {
    width: 280,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.divider,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  featuredImageContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 4 / 5,
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },
  featuredImageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "transparent",
  },
  saveButton: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
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
  featuredBadge: {
    position: "absolute",
    bottom: Spacing.md,
    left: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
    gap: Spacing.xs,
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
  featuredBadgeText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  featuredContent: {
    padding: Spacing.lg,
  },
  featuredTitle: {
    ...Typography.titleLarge,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    minHeight: 44,
    lineHeight: 22,
  },
  featuredLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  featuredLocation: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  featuredPrice: {
    ...Typography.headlineMedium,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primaryGreen,
  },
  nearYouContainer: {
    gap: Spacing.lg,
  },
  nearYouCard: {
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
  nearYouImageContainer: {
    position: "relative",
    width: 140,
    height: 140,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: Spacing.md,
  },
  nearYouImage: {
    width: "100%",
    height: "100%",
  },
  nearYouSaveButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    zIndex: 10,
  },
  nearYouSaveButtonBackground: {
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
  nearYouBadge: {
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
  nearYouBadgeText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  nearYouContent: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: Spacing.xs,
  },
  nearYouTitle: {
    ...Typography.titleLarge,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    lineHeight: 22,
  },
  nearYouLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  nearYouLocationText: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  nearYouFooter: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  nearYouPrice: {
    ...Typography.headlineMedium,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primaryGreen,
  },
  popularAreasContainer: {
    paddingRight: Spacing.xl,
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  popularAreaCard: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.lg,
    minWidth: 120,
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
  popularAreaIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  popularAreaName: {
    ...Typography.labelLarge,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  popularAreaCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  popularAreaCount: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  newBadge: {
    position: "absolute",
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: Colors.primaryGreen,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 5,
  },
  newBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  // Welcome Section
  welcomeSection: {
    marginBottom: Spacing.lg,
  },
  welcomeText: {
    ...Typography.headlineLarge,
    fontSize: 28,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  welcomeSubtext: {
    ...Typography.bodyMedium,
    fontSize: 15,
    color: Colors.textSecondary,
  },
  // Quick Stats
  quickStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  quickStatCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.divider,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  quickStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  quickStatValue: {
    ...Typography.titleLarge,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  quickStatLabel: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
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
