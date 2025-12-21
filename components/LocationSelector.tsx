import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography, Spacing } from "@/constants/design";

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

  const latDelta = (maxLat - minLat) * 1.5; // Add padding
  const lngDelta = (maxLng - minLng) * 1.5;

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(latDelta, 2), // Minimum delta for better view
    longitudeDelta: Math.max(lngDelta, 2),
  };
};

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedLocations,
  onLocationsChange,
}) => {
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
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color={Colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search locations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textSecondary}
          />
        </View>
        <TouchableOpacity
          style={[styles.mapButton, showMap && styles.mapButtonActive]}
          onPress={() => setShowMap(!showMap)}
        >
          <Ionicons
            name="map-outline"
            size={20}
            color={showMap ? "#FFFFFF" : Colors.primaryGreen}
          />
          <Text
            style={[
              styles.mapButtonText,
              showMap && styles.mapButtonTextActive,
            ]}
          >
            Map
          </Text>
        </TouchableOpacity>
      </View>

      {/* Select All */}
      <View style={styles.selectAllContainer}>
        <TouchableOpacity onPress={selectAll}>
          <Text style={styles.selectAllText}>
            {selectedLocations.length === filteredLocations.length &&
            filteredLocations.length > 0
              ? "Deselect All"
              : "Select All"}
          </Text>
        </TouchableOpacity>
        <Text style={styles.selectedCount}>
          {selectedLocations.length} selected
        </Text>
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
              // Fit map to show all markers
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
                  pinColor={isSelected ? Colors.primaryGreen : "#999999"}
                />
              );
            })}
          </MapView>
          {/* Map Instructions Overlay */}
          <View style={styles.mapInstructions}>
            <Text style={styles.mapInstructionsText}>
              Tap markers to select locations
            </Text>
          </View>
        </View>
      )}

      {/* Location List */}
      {!showMap && (
        <View style={styles.list}>
          {filteredLocations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No locations found</Text>
            </View>
          ) : (
            filteredLocations.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.locationItem,
                  selectedLocations.includes(item) &&
                    styles.locationItemSelected,
                ]}
                onPress={() => toggleLocation(item)}
              >
                <Ionicons
                  name={
                    selectedLocations.includes(item)
                      ? "location"
                      : "location-outline"
                  }
                  size={20}
                  color={
                    selectedLocations.includes(item)
                      ? Colors.primaryGreen
                      : Colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.locationText,
                    selectedLocations.includes(item) &&
                      styles.locationTextSelected,
                  ]}
                >
                  {item}
                </Text>
                {selectedLocations.includes(item) && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={Colors.primaryGreen}
                  />
                )}
              </TouchableOpacity>
            ))
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  header: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.divider,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.bodyMedium,
    fontSize: 16,
    color: Colors.textPrimary,
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primaryGreen,
    backgroundColor: Colors.surface,
    gap: Spacing.xs,
  },
  mapButtonActive: {
    backgroundColor: Colors.primaryGreen,
  },
  mapButtonText: {
    ...Typography.labelMedium,
    fontSize: 14,
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
  },
  selectAllText: {
    ...Typography.labelMedium,
    fontSize: 14,
    color: Colors.primaryGreen,
    fontWeight: "600",
  },
  selectedCount: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  mapContainer: {
    height: 400,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: Spacing.lg,
    width: "100%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapInstructions: {
    position: "absolute",
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: Spacing.md,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  mapInstructionsText: {
    ...Typography.bodyMedium,
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  list: {
    maxHeight: 400,
    overflow: "hidden",
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.divider,
    gap: Spacing.md,
  },
  locationItemSelected: {
    borderColor: Colors.primaryGreen,
    backgroundColor: "#F1F8F4",
  },
  locationText: {
    flex: 1,
    ...Typography.bodyMedium,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  locationTextSelected: {
    color: Colors.primaryGreen,
    fontWeight: "600",
  },
  emptyContainer: {
    padding: Spacing["2xl"],
    alignItems: "center",
  },
  emptyText: {
    ...Typography.bodyMedium,
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
