import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography, Spacing } from "@/constants/design";
import { useTheme } from "@/contexts/ThemeContext";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface LocationSelectorProps {
  selectedLocations: string[];
  onLocationsChange: (locations: string[]) => void;
}

interface LocationData {
  name: string;
  latitude: number;
  longitude: number;
}

const LOCATIONS_DATA: LocationData[] = [
  { name: "Accra", latitude: 5.6037, longitude: -0.187 },
  { name: "Kumasi", latitude: 6.6885, longitude: -1.6244 },
  { name: "Tamale", latitude: 9.4004, longitude: -0.8393 },
  { name: "Takoradi", latitude: 4.8845, longitude: -1.7554 },
  { name: "Cape Coast", latitude: 5.1053, longitude: -1.2466 },
  { name: "Tema", latitude: 5.6833, longitude: -0.0167 },
  { name: "Sunyani", latitude: 7.3399, longitude: -2.3268 },
  { name: "Ho", latitude: 6.6008, longitude: 0.4713 },
  { name: "Koforidua", latitude: 6.0833, longitude: -0.25 },
  { name: "Techiman", latitude: 7.5833, longitude: -1.9333 },
  { name: "Wa", latitude: 10.0607, longitude: -2.5019 },
  { name: "Bolgatanga", latitude: 10.7856, longitude: -0.8514 },
];

const ALL_LOCATIONS = LOCATIONS_DATA.map((loc) => loc.name);

// Calculate region to fit all markers
const calculateRegion = (): Region => {
  const latitudes = LOCATIONS_DATA.map((loc) => loc.latitude);
  const longitudes = LOCATIONS_DATA.map((loc) => loc.longitude);

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  const latDelta = (maxLat - minLat) * 1.5;
  const lngDelta = (maxLng - minLng) * 1.5;

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(latDelta, 2),
    longitudeDelta: Math.max(lngDelta, 2),
  };
};

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedLocations,
  onLocationsChange,
}) => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef<MapView>(null);

  const filteredLocations = ALL_LOCATIONS.filter((location) =>
    location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLocationsData = LOCATIONS_DATA.filter((loc) =>
    filteredLocations.includes(loc.name)
  );

  const toggleLocation = (location: string) => {
    if (selectedLocations.includes(location)) {
      onLocationsChange(selectedLocations.filter((l) => l !== location));
    } else {
      onLocationsChange([...selectedLocations, location]);
    }
  };

  const selectAll = () => {
    if (selectedLocations.length === filteredLocations.length) {
      onLocationsChange([]);
    } else {
      onLocationsChange([...filteredLocations]);
    }
  };

  const handleMarkerPress = (locationName: string) => {
    toggleLocation(locationName);
  };

  return (
    <View style={styles.container}>
      {/* Search and Map Toggle */}
      <View style={styles.header}>
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.inputBackground },
          ]}
        >
          <Ionicons
            name="search-outline"
            size={18}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search locations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textSecondary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.mapButton,
            { borderColor: colors.primary },
            showMap && { backgroundColor: colors.primary },
          ]}
          onPress={() => setShowMap(!showMap)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={showMap ? "list-outline" : "map-outline"}
            size={18}
            color={showMap ? "#FFFFFF" : colors.primary}
          />
          <Text
            style={[
              styles.mapButtonText,
              { color: colors.primary },
              showMap && styles.mapButtonTextActive,
            ]}
          >
            {showMap ? "List" : "Map"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Select All */}
      <View style={styles.selectAllContainer}>
        <TouchableOpacity
          onPress={selectAll}
          style={styles.selectAllButton}
          activeOpacity={0.7}
        >
          <Ionicons
            name={
              selectedLocations.length === filteredLocations.length &&
              filteredLocations.length > 0
                ? "checkbox"
                : "square-outline"
            }
            size={18}
            color={colors.primary}
          />
          <Text style={[styles.selectAllText, { color: colors.text }]}>
            {selectedLocations.length === filteredLocations.length &&
            filteredLocations.length > 0
              ? "Deselect All"
              : "Select All"}
          </Text>
        </TouchableOpacity>
        <View
          style={[
            styles.selectedBadge,
            { backgroundColor: `${colors.primary}15` },
          ]}
        >
          <Text style={[styles.selectedCount, { color: colors.primary }]}>
            {selectedLocations.length}
          </Text>
          <Text style={[styles.selectedLabel, { color: colors.textSecondary }]}>
            selected
          </Text>
        </View>
      </View>

      {/* Map View */}
      {showMap && (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
            style={styles.map}
            initialRegion={calculateRegion()}
            showsUserLocation={false}
            showsBuildings={true}
            showsTraffic={false}
            mapType="standard"
            onMapReady={() => {
              mapRef.current?.fitToCoordinates(
                filteredLocationsData.map((loc) => ({
                  latitude: loc.latitude,
                  longitude: loc.longitude,
                })),
                {
                  edgePadding: {
                    top: 50,
                    right: 50,
                    bottom: 50,
                    left: 50,
                  },
                  animated: true,
                }
              );
            }}
          >
            {filteredLocationsData.map((location) => {
              const isSelected = selectedLocations.includes(location.name);
              return (
                <Marker
                  key={location.name}
                  coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }}
                  title={location.name}
                  description={isSelected ? "Selected" : "Tap to select"}
                  onPress={() => handleMarkerPress(location.name)}
                  pinColor={isSelected ? colors.primary : "#999999"}
                />
              );
            })}
          </MapView>
          {/* Map Instructions Overlay */}
          <View
            style={[
              styles.mapInstructions,
              { backgroundColor: colors.surface },
            ]}
          >
            <Ionicons
              name="finger-print-outline"
              size={16}
              color={colors.primary}
            />
            <Text
              style={[
                styles.mapInstructionsText,
                { color: colors.textSecondary },
              ]}
            >
              Tap markers to select locations
            </Text>
          </View>
        </View>
      )}

      {/* Location List */}
      {!showMap && (
        <ScrollView
          style={styles.listScrollView}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
        >
          {filteredLocations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View
                style={[
                  styles.emptyIconContainer,
                  { backgroundColor: `${colors.textSecondary}15` },
                ]}
              >
                <Ionicons
                  name="location-outline"
                  size={48}
                  color={colors.textSecondary}
                />
              </View>
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No locations found
              </Text>
              <Text
                style={[styles.emptySubtext, { color: colors.textSecondary }]}
              >
                Try searching for a different city
              </Text>
            </View>
          ) : (
            filteredLocations.map((item, index) => {
              const isSelected = selectedLocations.includes(item);
              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.locationItem,
                    { borderBottomColor: colors.divider },
                    isSelected && { backgroundColor: `${colors.primary}08` },
                    index === filteredLocations.length - 1 &&
                      styles.locationItemLast,
                  ]}
                  onPress={() => toggleLocation(item)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.locationIconContainer,
                      { backgroundColor: `${colors.textSecondary}12` },
                      isSelected && { backgroundColor: `${colors.primary}15` },
                    ]}
                  >
                    <Ionicons
                      name={isSelected ? "location" : "location-outline"}
                      size={18}
                      color={isSelected ? colors.primary : colors.textSecondary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.locationText,
                      { color: colors.text },
                      isSelected && { color: colors.primary },
                    ]}
                  >
                    {item}
                  </Text>
                  <View
                    style={[
                      styles.checkbox,
                      { borderColor: colors.divider },
                      isSelected && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },
  header: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.divider,
    paddingHorizontal: Spacing.md,
    minHeight: 44,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textPrimary,
    paddingVertical: Platform.OS === "ios" ? Spacing.sm : 0,
    ...Platform.select({
      android: {
        includeFontPadding: false,
        textAlignVertical: "center",
      },
    }),
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.primaryGreen,
    backgroundColor: Colors.surface,
    gap: Spacing.xs,
    minHeight: 44,
  },
  mapButtonActive: {
    backgroundColor: Colors.primaryGreen,
    borderColor: Colors.primaryGreen,
  },
  mapButtonText: {
    ...Typography.labelMedium,
    fontSize: 13,
    color: Colors.primaryGreen,
    fontWeight: "600",
  },
  mapButtonTextActive: {
    color: "#FFFFFF",
  },
  selectAllContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  selectAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  selectAllText: {
    ...Typography.labelMedium,
    fontSize: 13,
    color: Colors.primaryGreen,
    fontWeight: "600",
  },
  selectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  selectedCount: {
    ...Typography.labelMedium,
    fontSize: 13,
    color: Colors.primaryGreen,
    fontWeight: "700",
  },
  selectedLabel: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  mapContainer: {
    borderRadius: 16,
    overflow: "hidden",
    width: "100%",
    height: SCREEN_HEIGHT * 0.6, // 60% of screen height
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapInstructions: {
    position: "absolute",
    bottom: Spacing.lg,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: Spacing.sm,
    borderRadius: 12,
    gap: Spacing.xs,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  mapInstructionsText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  listScrollView: {
    height: SCREEN_HEIGHT * 0.65, // Fixed height to ensure scrolling works
  },
  listContent: {
    paddingBottom: Spacing["3xl"],
    flexGrow: 1,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: 14,
    backgroundColor: Colors.background,
    marginBottom: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.divider,
    gap: Spacing.md,
  },
  locationItemSelected: {
    borderColor: Colors.primaryGreen,
    backgroundColor: "rgba(34, 197, 94, 0.05)",
  },
  locationItemLast: {
    marginBottom: 0,
  },
  locationIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    justifyContent: "center",
    alignItems: "center",
  },
  locationIconContainerSelected: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
  },
  locationText: {
    flex: 1,
    ...Typography.bodyMedium,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  locationTextSelected: {
    color: Colors.primaryGreen,
    fontWeight: "600",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.divider,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: Colors.primaryGreen,
    borderColor: Colors.primaryGreen,
  },
  emptyContainer: {
    paddingVertical: Spacing["3xl"],
    alignItems: "center",
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  emptyText: {
    ...Typography.labelLarge,
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
