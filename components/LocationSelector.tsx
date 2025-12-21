import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
} from "react-native";
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

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedLocations,
  onLocationsChange,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLocations = ALL_LOCATIONS.filter((location) =>
    location.toLowerCase().includes(searchQuery.toLowerCase())
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

  return (
    <View style={styles.container}>
      {/* Search */}
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

      {/* Location List */}
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
                selectedLocations.includes(item) && styles.locationItemSelected,
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
