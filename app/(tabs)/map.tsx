import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  Region,
  MapPressEvent,
} from "react-native-maps";
import * as Location from "expo-location";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Colors, Typography, Spacing } from "@/constants/design";
import {
  FloatingHeaderStyles,
  HEADER_ICON_SIZE,
} from "@/components/FloatingHeader.styles";
import {
  FilterBottomSheet,
  type FilterOptions,
} from "@/components/FilterBottomSheet";
import { BottomNavigation, type TabItem } from "@/components/BottomNavigation";
import { PropertyListCard, type Property } from "@/components/PropertyCard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Extended Property interface with coordinates
interface MapProperty extends Property {
  latitude: number;
  longitude: number;
  images?: string[]; // Additional images for the property
}

// Mock properties with coordinates (Accra area)
const MAP_PROPERTIES: MapProperty[] = [
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
    latitude: 5.6037,
    longitude: -0.187,
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
    latitude: 5.6147,
    longitude: -0.1756,
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
    latitude: 5.5556,
    longitude: -0.1969,
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
    latitude: 5.5667,
    longitude: -0.1833,
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
    latitude: 5.55,
    longitude: -0.1667,
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
    latitude: 5.55,
    longitude: -0.2,
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
    latitude: 5.5833,
    longitude: -0.0667,
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
    latitude: 5.6167,
    longitude: -0.1167,
  },
];

// Default Accra region
const DEFAULT_REGION: Region = {
  latitude: 5.6037,
  longitude: -0.187,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

const BOTTOM_NAV_TABS: TabItem[] = [
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
    id: "messages",
    label: "Messages",
    icon: "chatbubbles-outline",
    activeIcon: "chatbubbles",
  },
  {
    id: "profile",
    label: "Profile",
    icon: "person-outline",
    activeIcon: "person",
  },
];

export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const filterSheetRef = useRef<BottomSheetModal>(null);

  const [mapType, setMapType] = useState<"standard" | "satellite">("standard");
  const [selectedProperty, setSelectedProperty] = useState<MapProperty | null>(
    null
  );
  const [popupExpanded, setPopupExpanded] = useState(false);
  const [, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [filteredProperties, setFilteredProperties] =
    useState<MapProperty[]>(MAP_PROPERTIES);
  const [savedProperties, setSavedProperties] = useState<Set<string>>(
    new Set(["2", "5"])
  );

  // Snap points for bottom sheet
  const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

  // Request location permission and get user location
  React.useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        // Center map on user location
        if (mapRef.current) {
          mapRef.current.animateToRegion(
            {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            },
            1000
          );
        }
      }
    })();
  }, []);

  // Filter properties based on filters
  React.useEffect(() => {
    let filtered = [...MAP_PROPERTIES];

    if (filters.propertyTypes && filters.propertyTypes.length > 0) {
      // Filter by property type (simplified - would need actual property type data)
      // For now, we'll skip this filter
    }

    if (filters.transactionType) {
      // Filter by transaction type (simplified - would need actual transaction type data)
      // For now, we'll skip this filter
    }

    if (filters.minPrice !== undefined) {
      filtered = filtered.filter((p) => p.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter((p) => p.price <= filters.maxPrice!);
    }

    if (filters.bedrooms !== null && filters.bedrooms !== undefined) {
      filtered = filtered.filter((p) => p.bedrooms === filters.bedrooms);
    }

    setFilteredProperties(filtered);
  }, [filters]);

  const formatPrice = (price: number): string => {
    if (price >= 1000000) {
      return `GHS ${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `GHS ${(price / 1000).toFixed(0)}K`;
    }
    return `GHS ${price.toLocaleString()}`;
  };

  const handleMarkerPress = (property: MapProperty) => {
    setSelectedProperty(property);
    setPopupExpanded(false); // Reset expanded state when selecting new property
    // Center map on selected property
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: property.latitude,
          longitude: property.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
    }
  };

  const handleMapPress = (event: MapPressEvent) => {
    // Close popup if clicking on map (not on marker)
    if (selectedProperty) {
      setSelectedProperty(null);
      setPopupExpanded(false);
    }
  };

  const toggleMapType = () => {
    setMapType(mapType === "standard" ? "satellite" : "standard");
  };

  const handleFilterApply = (appliedFilters: FilterOptions) => {
    setFilters(appliedFilters);
    filterSheetRef.current?.dismiss();
  };

  const handleToggleSave = (propertyId: string) => {
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

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  // Calculate initial region to show all properties
  const initialRegion = useMemo(() => {
    if (filteredProperties.length === 0) return DEFAULT_REGION;

    const latitudes = filteredProperties.map((p) => p.latitude);
    const longitudes = filteredProperties.map((p) => p.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const latDelta = (maxLat - minLat) * 1.5 || 0.1;
    const lngDelta = (maxLng - minLng) * 1.5 || 0.1;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latDelta, 0.05),
      longitudeDelta: Math.max(lngDelta, 0.05),
    };
  }, [filteredProperties]);

  return (
    <>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* Header */}
        <View
          style={[
            FloatingHeaderStyles.floatingHeader,
            {
              paddingTop: insets.top + Spacing.md,
              paddingBottom: Spacing.sm,
            },
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
            <Text style={styles.headerTitleText}>Map View</Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={FloatingHeaderStyles.actionButtonBackground}
              onPress={() => filterSheetRef.current?.present()}
              activeOpacity={0.7}
            >
              <Ionicons
                name="options"
                size={HEADER_ICON_SIZE}
                color={Colors.textPrimary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                FloatingHeaderStyles.actionButtonBackground,
                styles.mapTypeButton,
              ]}
              onPress={toggleMapType}
              activeOpacity={0.7}
            >
              <Ionicons
                name={mapType === "standard" ? "map" : "globe"}
                size={HEADER_ICON_SIZE}
                color={Colors.textPrimary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Map */}
        <MapView
          ref={mapRef}
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          style={styles.map}
          initialRegion={initialRegion}
          mapType={mapType}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsBuildings={true}
          showsTraffic={false}
          onPress={handleMapPress}
          onMapReady={() => {
            // Fit map to show all markers
            if (filteredProperties.length > 0) {
              setTimeout(() => {
                mapRef.current?.fitToCoordinates(
                  filteredProperties.map((p) => ({
                    latitude: p.latitude,
                    longitude: p.longitude,
                  })),
                  {
                    edgePadding: {
                      top: 150,
                      right: 50,
                      bottom: 250,
                      left: 50,
                    },
                    animated: true,
                  }
                );
              }, 500);
            }
          }}
        >
          {/* Property Markers */}
          {filteredProperties.map((property) => (
            <Marker
              key={property.id}
              coordinate={{
                latitude: property.latitude,
                longitude: property.longitude,
              }}
              onPress={() => handleMarkerPress(property)}
              tracksViewChanges={false}
              anchor={{ x: 0.5, y: 1 }}
            >
              <View style={styles.markerContainer}>
                <View style={styles.markerPin}>
                  <Text style={styles.markerPrice} numberOfLines={1}>
                    {formatPrice(property.price)}
                  </Text>
                </View>
                <View style={styles.markerDot} />
              </View>
            </Marker>
          ))}
        </MapView>

        {/* Property Popup Card */}
        {selectedProperty && (
          <View style={styles.popupContainer}>
            <View style={styles.popupCard}>
              <TouchableOpacity
                style={styles.popupCardContent}
                onPress={() => router.push(`/property/${selectedProperty.id}`)}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: selectedProperty.image }}
                  style={styles.popupImage}
                />
                <View style={styles.popupContent}>
                  <Text style={styles.popupTitle} numberOfLines={1}>
                    {selectedProperty.title}
                  </Text>
                  <Text style={styles.popupLocation} numberOfLines={1}>
                    {selectedProperty.location}
                  </Text>
                  <Text style={styles.popupPrice}>
                    {formatPrice(selectedProperty.price)}
                  </Text>
                  {selectedProperty.bedrooms && (
                    <View style={styles.popupStats}>
                      <Text style={styles.popupStat}>
                        {selectedProperty.bedrooms} Bed
                      </Text>
                      {selectedProperty.bathrooms && (
                        <Text style={styles.popupStat}>
                          {selectedProperty.bathrooms} Bath
                        </Text>
                      )}
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.popupCloseButton}
                  onPress={() => {
                    setSelectedProperty(null);
                    setPopupExpanded(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={20} color={Colors.textPrimary} />
                </TouchableOpacity>
              </TouchableOpacity>

              {/* Expandable Images Section */}
              <TouchableOpacity
                style={styles.expandButton}
                onPress={() => setPopupExpanded(!popupExpanded)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={popupExpanded ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={Colors.textSecondary}
                />
                <Text style={styles.expandButtonText}>
                  {popupExpanded ? "Hide Images" : "Show Images"}
                </Text>
              </TouchableOpacity>

              {popupExpanded && (
                <View style={styles.popupImagesContainer}>
                  <View style={styles.popupImagesGrid}>
                    {[
                      selectedProperty.image,
                      ...(selectedProperty.images || []),
                    ]
                      .slice(0, 4)
                      .map((img, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() =>
                            router.push(
                              `/property/${selectedProperty.id}/gallery?index=${index}`
                            )
                          }
                          activeOpacity={0.8}
                        >
                          <Image
                            source={{ uri: img }}
                            style={styles.popupThumbnail}
                          />
                        </TouchableOpacity>
                      ))}
                  </View>
                  {(selectedProperty.images?.length || 0) + 1 > 4 && (
                    <TouchableOpacity
                      style={styles.viewAllImagesButton}
                      onPress={() =>
                        router.push(`/property/${selectedProperty.id}/gallery`)
                      }
                      activeOpacity={0.8}
                    >
                      <Text style={styles.viewAllImagesText}>
                        View All {(selectedProperty.images?.length || 0) + 1}{" "}
                        Images
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.viewDetailsButton}
              onPress={() => router.push(`/property/${selectedProperty.id}`)}
              activeOpacity={0.8}
            >
              <Text style={styles.viewDetailsText}>View Details</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Sheet Toggle Button */}
        <TouchableOpacity
          style={styles.bottomSheetToggle}
          onPress={() => bottomSheetRef.current?.present()}
          activeOpacity={0.8}
        >
          <View style={styles.bottomSheetToggleContent}>
            <Ionicons name="chevron-up" size={20} color={Colors.textPrimary} />
            <Text style={styles.bottomSheetToggleText}>
              {filteredProperties.length} Properties Nearby
            </Text>
          </View>
        </TouchableOpacity>

        {/* Bottom Sheet - Nearby Properties */}
        <BottomSheetModal
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          enablePanDownToClose
          backdropComponent={renderBackdrop}
          backgroundStyle={styles.bottomSheetBackground}
          handleIndicatorStyle={styles.handleIndicator}
        >
          <BottomSheetView style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>Nearby Properties</Text>
            <Text style={styles.bottomSheetSubtitle}>
              {filteredProperties.length} properties found
            </Text>
          </BottomSheetView>
          <BottomSheetScrollView
            style={styles.bottomSheetContent}
            contentContainerStyle={styles.bottomSheetContentContainer}
          >
            {filteredProperties.map((property) => (
              <PropertyListCard
                key={property.id}
                property={property}
                savedProperties={savedProperties}
                onToggleSave={handleToggleSave}
                formatPrice={formatPrice}
              />
            ))}
          </BottomSheetScrollView>
        </BottomSheetModal>

        {/* Filter Bottom Sheet */}
        <FilterBottomSheet
          ref={filterSheetRef}
          visible={false}
          onClose={() => filterSheetRef.current?.dismiss()}
          onApply={handleFilterApply}
          initialFilters={filters}
          resultsCount={filteredProperties.length}
        />

        {/* Bottom Navigation */}
        <BottomNavigation
          tabs={BOTTOM_NAV_TABS}
          activeTab="map"
          onTabPress={(tabId) => {
            if (tabId === "index") {
              router.replace("/(tabs)");
            } else if (tabId === "search") {
              router.replace("/(tabs)/search");
            } else if (tabId === "map") {
              // Already on map
            } else if (tabId === "messages") {
              router.replace("/(tabs)/messages");
            } else if (tabId === "profile") {
              router.replace("/(tabs)/profile");
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
  map: {
    flex: 1,
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  mapTypeButton: {
    marginLeft: Spacing.xs,
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  markerPin: {
    backgroundColor: Colors.primaryGreen,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
    maxWidth: 100,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  markerPrice: {
    ...Typography.labelMedium,
    color: Colors.surface,
    fontWeight: "600",
    fontSize: 10,
    textAlign: "center",
  },
  markerDot: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: Colors.primaryGreen,
    marginTop: -1,
  },
  popupContainer: {
    position: "absolute",
    top: 140,
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 1000,
  },
  popupCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  popupCardContent: {
    flexDirection: "row",
  },
  popupImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: Spacing.md,
  },
  popupContent: {
    flex: 1,
    justifyContent: "center",
  },
  popupTitle: {
    ...Typography.titleMedium,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  popupLocation: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontSize: 12,
  },
  popupPrice: {
    ...Typography.titleLarge,
    color: Colors.primaryGreen,
    fontWeight: "700",
    marginBottom: 4,
  },
  popupStats: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: 4,
  },
  popupStat: {
    ...Typography.labelMedium,
    color: Colors.textSecondary,
    fontSize: 12,
  },
  popupCloseButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  viewDetailsButton: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.primaryGreen,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  viewDetailsText: {
    ...Typography.labelLarge,
    color: Colors.surface,
    fontWeight: "600",
  },
  expandButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  expandButtonText: {
    ...Typography.labelMedium,
    color: Colors.textSecondary,
    fontSize: 12,
  },
  popupImagesContainer: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  popupImagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  popupThumbnail: {
    width:
      (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.md * 2 - Spacing.sm * 3) / 4,
    height:
      (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.md * 2 - Spacing.sm * 3) / 4,
    borderRadius: 8,
    backgroundColor: Colors.divider,
  },
  viewAllImagesButton: {
    paddingVertical: Spacing.sm,
    alignItems: "center",
  },
  viewAllImagesText: {
    ...Typography.labelMedium,
    color: Colors.primaryGreen,
    fontSize: 12,
    fontWeight: "600",
  },
  bottomSheetToggle: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    backgroundColor: Colors.surface,
    borderRadius: 24,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
    maxWidth: "70%",
    minWidth: 200,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  bottomSheetToggleContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  bottomSheetToggleText: {
    ...Typography.labelMedium,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  bottomSheetBackground: {
    backgroundColor: Colors.surface,
  },
  handleIndicator: {
    backgroundColor: Colors.textSecondary,
    width: 40,
  },
  bottomSheetHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  bottomSheetTitle: {
    ...Typography.headlineMedium,
    color: Colors.textPrimary,
    fontWeight: "700",
    marginBottom: 4,
  },
  bottomSheetSubtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  bottomSheetContent: {
    flex: 1,
  },
  bottomSheetContentContainer: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
});
