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
import RNMapView, {
  Marker,
  PROVIDER_GOOGLE,
  Region,
  MapPressEvent,
} from "react-native-maps";
import MapView from "react-native-map-clustering";
import * as Location from "expo-location";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
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
import { PropertyListCard } from "@/components/PropertyCard";
import { MAP_PROPERTIES, type MapProperty } from "@/constants/mockData";

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
  const mapRef = useRef<RNMapView>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const filterSheetRef = useRef<BottomSheetModal>(null);

  const [mapType, setMapType] = useState<"standard" | "satellite">("satellite");
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

  // Snap points for bottom sheet - max height is 50% of screen
  // Using absolute values to ensure it never exceeds 50% of screen height
  const snapPoints = useMemo(() => {
    const screenHeight = Dimensions.get("window").height;
    return [screenHeight * 0.25, screenHeight * 0.5];
  }, []);

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

  const fitToProperties = () => {
    if (filteredProperties.length > 0 && mapRef.current) {
      mapRef.current.fitToCoordinates(
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
    }
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
          // Clustering configuration
          clusterColor={Colors.primaryGreen}
          clusterTextColor={Colors.surface}
          clusterFontFamily={Platform.OS === "ios" ? "System" : "Roboto"}
          radius={50}
          extent={512}
          minZoom={1}
          maxZoom={20}
          minPoints={2}
          preserveClusterPressBehavior={false}
          animationEnabled={true}
          spiralEnabled={false}
          onClusterPress={(cluster, markers) => {
            // Get the coordinates of all markers in this cluster
            const coordinates = markers?.map((marker: any) => ({
              latitude: marker.geometry.coordinates[1],
              longitude: marker.geometry.coordinates[0],
            }));

            if (coordinates && coordinates.length > 0 && mapRef.current) {
              // Zoom in to fit all markers in this cluster
              mapRef.current.fitToCoordinates(coordinates, {
                edgePadding: {
                  top: 100,
                  right: 50,
                  bottom: 200,
                  left: 50,
                },
                animated: true,
              });
            }
          }}
          renderCluster={(cluster) => {
            const { id, geometry, onPress, properties } = cluster;
            const points = properties.point_count;
            return (
              <Marker
                key={`cluster-${id}`}
                coordinate={{
                  longitude: geometry.coordinates[0],
                  latitude: geometry.coordinates[1],
                }}
                onPress={onPress}
                tracksViewChanges={false}
              >
                <View style={styles.clusterContainer}>
                  <View style={styles.clusterCircle}>
                    <Text style={styles.clusterText}>{points}</Text>
                  </View>
                  <Text style={styles.clusterLabel}>properties</Text>
                </View>
              </Marker>
            );
          }}
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
          {filteredProperties.map((property) => {
            const isSelected = selectedProperty?.id === property.id;
            return (
              <Marker
                key={property.id}
                coordinate={{
                  latitude: property.latitude,
                  longitude: property.longitude,
                }}
                onPress={() => handleMarkerPress(property)}
                tracksViewChanges={isSelected}
                anchor={{ x: 0.5, y: 1 }}
              >
                {isSelected ? (
                  <View style={styles.activeMarkerContainer}>
                    <View style={styles.activeMarkerCard}>
                      <Image
                        source={{ uri: property.image }}
                        style={styles.activeMarkerImage}
                      />
                      <View style={styles.activeMarkerPriceBadge}>
                        <Text
                          style={styles.activeMarkerPrice}
                          numberOfLines={1}
                        >
                          {formatPrice(property.price)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.activeMarkerPointer} />
                  </View>
                ) : (
                  <View style={styles.markerContainer}>
                    <View style={styles.markerPin}>
                      <Text style={styles.markerPrice} numberOfLines={1}>
                        {formatPrice(property.price)}
                      </Text>
                    </View>
                    <View style={styles.markerDot} />
                  </View>
                )}
              </Marker>
            );
          })}
        </MapView>

        {/* Property Popup Card */}
        {selectedProperty && (
          <View style={styles.popupContainer}>
            <View style={styles.popupCard}>
              {/* Hero Image */}
              <TouchableOpacity
                onPress={() => router.push(`/property/${selectedProperty.id}`)}
                activeOpacity={0.95}
              >
                <View style={styles.popupImageContainer}>
                  <Image
                    source={{ uri: selectedProperty.image }}
                    style={styles.popupImage}
                  />
                  {/* Image Overlay Gradient */}
                  <View style={styles.popupImageOverlay} />

                  {/* Close Button */}
                  <TouchableOpacity
                    style={styles.popupCloseButton}
                    onPress={() => {
                      setSelectedProperty(null);
                      setPopupExpanded(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close" size={18} color={Colors.surface} />
                  </TouchableOpacity>

                  {/* Save Button */}
                  <TouchableOpacity
                    style={styles.popupSaveButton}
                    onPress={() => handleToggleSave(selectedProperty.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={
                        savedProperties.has(selectedProperty.id)
                          ? "heart"
                          : "heart-outline"
                      }
                      size={18}
                      color={
                        savedProperties.has(selectedProperty.id)
                          ? "#EF4444"
                          : Colors.surface
                      }
                    />
                  </TouchableOpacity>

                  {/* Price Badge */}
                  <View style={styles.popupPriceBadge}>
                    <Text style={styles.popupPriceText}>
                      {formatPrice(selectedProperty.price)}
                    </Text>
                  </View>

                  {/* Image Count Badge */}
                  {(selectedProperty.images?.length || 0) > 0 && (
                    <View style={styles.popupImageCountBadge}>
                      <Ionicons
                        name="images"
                        size={12}
                        color={Colors.surface}
                      />
                      <Text style={styles.popupImageCountText}>
                        {(selectedProperty.images?.length || 0) + 1}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              {/* Content */}
              <View style={styles.popupContent}>
                <Text style={styles.popupTitle} numberOfLines={2}>
                  {selectedProperty.title}
                </Text>

                <View style={styles.popupLocationRow}>
                  <Ionicons
                    name="location"
                    size={14}
                    color={Colors.primaryGreen}
                  />
                  <Text style={styles.popupLocation} numberOfLines={1}>
                    {selectedProperty.location}
                  </Text>
                </View>

                {/* Stats Row */}
                {(selectedProperty.bedrooms || selectedProperty.bathrooms) && (
                  <View style={styles.popupStatsRow}>
                    {selectedProperty.bedrooms && (
                      <View style={styles.popupStatBadge}>
                        <Ionicons
                          name="bed-outline"
                          size={14}
                          color={Colors.textSecondary}
                        />
                        <Text style={styles.popupStatText}>
                          {selectedProperty.bedrooms} Beds
                        </Text>
                      </View>
                    )}
                    {selectedProperty.bathrooms && (
                      <View style={styles.popupStatBadge}>
                        <Ionicons
                          name="water-outline"
                          size={14}
                          color={Colors.textSecondary}
                        />
                        <Text style={styles.popupStatText}>
                          {selectedProperty.bathrooms} Baths
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.popupActions}>
                <TouchableOpacity
                  style={styles.popupExpandButton}
                  onPress={() => setPopupExpanded(!popupExpanded)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={popupExpanded ? "images" : "images-outline"}
                    size={16}
                    color={
                      popupExpanded ? Colors.primaryGreen : Colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.popupExpandText,
                      popupExpanded && styles.popupExpandTextActive,
                    ]}
                  >
                    {popupExpanded ? "Hide" : "Gallery"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.popupViewButton}
                  onPress={() =>
                    router.push(`/property/${selectedProperty.id}`)
                  }
                  activeOpacity={0.8}
                >
                  <Text style={styles.popupViewButtonText}>View Details</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={Colors.surface}
                  />
                </TouchableOpacity>
              </View>

              {/* Expandable Images Section */}
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
                          style={styles.popupThumbnailWrapper}
                        >
                          <Image
                            source={{ uri: img }}
                            style={styles.popupThumbnail}
                          />
                          {index === 3 &&
                            (selectedProperty.images?.length || 0) + 1 > 4 && (
                              <View style={styles.popupThumbnailOverlay}>
                                <Text style={styles.popupThumbnailMoreText}>
                                  +
                                  {(selectedProperty.images?.length || 0) +
                                    1 -
                                    4}
                                </Text>
                              </View>
                            )}
                        </TouchableOpacity>
                      ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Fit to Properties Floating Button */}
        {filteredProperties.length > 0 && (
          <TouchableOpacity
            style={styles.fitToPropertiesButton}
            onPress={fitToProperties}
            activeOpacity={0.8}
          >
            <Ionicons name="locate" size={24} color={Colors.primaryGreen} />
          </TouchableOpacity>
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
          enableOverDrag={false}
          backdropComponent={renderBackdrop}
          backgroundStyle={styles.bottomSheetBackground}
          handleIndicatorStyle={styles.handleIndicator}
        >
          <BottomSheetScrollView
            style={styles.bottomSheetContent}
            contentContainerStyle={styles.bottomSheetContentContainer}
            showsVerticalScrollIndicator={true}
            stickyHeaderIndices={[0]}
          >
            {/* Sticky Header */}
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetTitle}>Nearby Properties</Text>
              <Text style={styles.bottomSheetSubtitle}>
                {filteredProperties.length} properties found
              </Text>
            </View>
            {/* Property List */}
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
  // Cluster Styles
  clusterContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  clusterCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primaryGreen,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.surface,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  clusterText: {
    ...Typography.titleMedium,
    color: Colors.surface,
    fontWeight: "700",
    fontSize: 16,
  },
  clusterLabel: {
    ...Typography.caption,
    color: Colors.primaryGreen,
    fontWeight: "600",
    fontSize: 9,
    marginTop: 2,
    backgroundColor: Colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
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
  // Active Marker Styles (when selected)
  activeMarkerContainer: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  activeMarkerCard: {
    width: 90,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: Colors.primaryGreen,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  activeMarkerImage: {
    width: "100%",
    height: 70,
    backgroundColor: Colors.divider,
  },
  activeMarkerPriceBadge: {
    backgroundColor: Colors.primaryGreen,
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  activeMarkerPrice: {
    ...Typography.labelMedium,
    color: Colors.surface,
    fontWeight: "700",
    fontSize: 11,
    textAlign: "center",
  },
  activeMarkerPointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: Colors.primaryGreen,
    marginTop: -1,
  },
  popupContainer: {
    position: "absolute",
    top: 130,
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 1000,
  },
  popupCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  popupImageContainer: {
    position: "relative",
    width: "100%",
    height: 140,
  },
  popupImage: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.divider,
  },
  popupImageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "transparent",
    // Gradient effect using multiple views would be ideal, but we'll use opacity
  },
  popupCloseButton: {
    position: "absolute",
    top: Spacing.sm,
    left: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  popupSaveButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  popupPriceBadge: {
    position: "absolute",
    bottom: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: Colors.primaryGreen,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  popupPriceText: {
    ...Typography.labelLarge,
    color: Colors.surface,
    fontWeight: "700",
    fontSize: 14,
  },
  popupImageCountBadge: {
    position: "absolute",
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  popupImageCountText: {
    ...Typography.caption,
    color: Colors.surface,
    fontWeight: "600",
    fontSize: 11,
  },
  popupContent: {
    padding: Spacing.md,
    paddingBottom: 0,
  },
  popupTitle: {
    ...Typography.titleMedium,
    color: Colors.textPrimary,
    fontWeight: "700",
    marginBottom: 6,
    lineHeight: 22,
  },
  popupLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: Spacing.sm,
  },
  popupLocation: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flex: 1,
    fontSize: 13,
  },
  popupStatsRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  popupStatBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  popupStatText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 12,
  },
  popupActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
  popupExpandButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: 10,
  },
  popupExpandText: {
    ...Typography.labelMedium,
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
  popupExpandTextActive: {
    color: Colors.primaryGreen,
    fontWeight: "600",
  },
  popupViewButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.primaryGreen,
    paddingVertical: Spacing.sm + 2,
    borderRadius: 10,
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
  popupViewButtonText: {
    ...Typography.labelMedium,
    color: Colors.surface,
    fontWeight: "600",
    fontSize: 13,
  },
  popupImagesContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  popupImagesGrid: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  popupThumbnailWrapper: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  popupThumbnail: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.divider,
  },
  popupThumbnailOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  popupThumbnailMoreText: {
    ...Typography.titleMedium,
    color: Colors.surface,
    fontWeight: "700",
  },
  fitToPropertiesButton: {
    position: "absolute",
    bottom: 180,
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
    borderWidth: 2,
    borderColor: Colors.primaryGreen,
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
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    marginBottom: Spacing.md,
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
});
