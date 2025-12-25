import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import Animated from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Typography, Spacing } from "@/constants/design";
import { useTheme } from "@/contexts/ThemeContext";

export interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  image: string;
  bedrooms?: number;
  bathrooms?: number;
  isSaved?: boolean;
}

interface PropertyCardProps {
  property: Property;
  savedProperties: Set<string>;
  onToggleSave: (propertyId: string) => void;
  formatPrice: (price: number) => string;
}

/**
 * Property List Card Component
 * Displays property in horizontal list format
 */
export const PropertyListCard: React.FC<PropertyCardProps> = ({
  property,
  savedProperties,
  onToggleSave,
  formatPrice,
}) => {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        PropertyCardStyles.propertyCard,
        { backgroundColor: colors.surface, borderColor: colors.divider },
      ]}
      onPress={() => {
        router.push(`/property/${property.id}`);
      }}
      activeOpacity={0.8}
    >
      <View style={PropertyCardStyles.propertyImageContainer}>
        <Animated.Image
          source={{ uri: property.image }}
          style={PropertyCardStyles.propertyImage}
          resizeMode="cover"
          {...{ sharedTransitionTag: `property-image-${property.id}` }}
        />
        <TouchableOpacity
          style={PropertyCardStyles.propertySaveButton}
          onPress={() => onToggleSave(property.id)}
          activeOpacity={0.7}
        >
          <View
            style={[
              PropertyCardStyles.propertySaveButtonBackground,
              { backgroundColor: colors.surface },
            ]}
          >
            <Ionicons
              name={
                savedProperties.has(property.id) ? "heart" : "heart-outline"
              }
              size={20}
              color={
                savedProperties.has(property.id) ? colors.error : colors.text
              }
            />
          </View>
        </TouchableOpacity>
        {property.bedrooms !== undefined &&
          property.bedrooms !== null &&
          property.bathrooms !== undefined &&
          property.bathrooms !== null && (
            <View
              style={[
                PropertyCardStyles.propertyBadge,
                { backgroundColor: colors.surface },
              ]}
            >
              <Ionicons name="bed-outline" size={12} color={colors.text} />
              <Text
                style={[
                  PropertyCardStyles.propertyBadgeText,
                  { color: colors.text },
                ]}
              >
                {property.bedrooms}
              </Text>
              <Ionicons
                name="water-outline"
                size={12}
                color={colors.text}
                style={{ marginLeft: Spacing.xs }}
              />
              <Text
                style={[
                  PropertyCardStyles.propertyBadgeText,
                  { color: colors.text },
                ]}
              >
                {property.bathrooms}
              </Text>
            </View>
          )}
      </View>
      <View style={PropertyCardStyles.propertyContent}>
        <Text
          style={[PropertyCardStyles.propertyTitle, { color: colors.text }]}
          numberOfLines={2}
        >
          {property.title}
        </Text>
        <View style={PropertyCardStyles.propertyLocation}>
          <Ionicons
            name="location-outline"
            size={14}
            color={colors.textSecondary}
          />
          <Text
            style={[
              PropertyCardStyles.propertyLocationText,
              { color: colors.textSecondary },
            ]}
            numberOfLines={1}
          >
            {property.location}
          </Text>
        </View>
        <Text
          style={[PropertyCardStyles.propertyPrice, { color: colors.primary }]}
        >
          {formatPrice(property.price)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

/**
 * Property Grid Card Component
 * Displays property in vertical grid format
 */
export const PropertyGridCard: React.FC<PropertyCardProps> = ({
  property,
  savedProperties,
  onToggleSave,
  formatPrice,
}) => {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        PropertyCardStyles.gridCard,
        { backgroundColor: colors.surface, borderColor: colors.divider },
      ]}
      onPress={() => {
        router.push(`/property/${property.id}`);
      }}
      activeOpacity={0.8}
    >
      <View style={PropertyCardStyles.gridImageContainer}>
        <Animated.Image
          source={{ uri: property.image }}
          style={PropertyCardStyles.gridImage}
          resizeMode="cover"
          {...{ sharedTransitionTag: `property-image-${property.id}` }}
        />
        <TouchableOpacity
          style={PropertyCardStyles.gridSaveButton}
          onPress={(e) => {
            e.stopPropagation();
            onToggleSave(property.id);
          }}
          activeOpacity={0.7}
        >
          <View
            style={[
              PropertyCardStyles.gridSaveButtonBackground,
              { backgroundColor: colors.surface },
            ]}
          >
            <Ionicons
              name={
                savedProperties.has(property.id) ? "heart" : "heart-outline"
              }
              size={20}
              color={
                savedProperties.has(property.id) ? colors.error : colors.text
              }
            />
          </View>
        </TouchableOpacity>
        {property.bedrooms !== undefined &&
          property.bedrooms !== null &&
          property.bathrooms !== undefined &&
          property.bathrooms !== null && (
            <View
              style={[
                PropertyCardStyles.gridBadge,
                { backgroundColor: colors.surface },
              ]}
            >
              <Ionicons name="bed-outline" size={12} color={colors.text} />
              <Text
                style={[
                  PropertyCardStyles.gridBadgeText,
                  { color: colors.text },
                ]}
              >
                {property.bedrooms}
              </Text>
              <Ionicons
                name="water-outline"
                size={12}
                color={colors.text}
                style={{ marginLeft: Spacing.xs }}
              />
              <Text
                style={[
                  PropertyCardStyles.gridBadgeText,
                  { color: colors.text },
                ]}
              >
                {property.bathrooms}
              </Text>
            </View>
          )}
      </View>
      <View style={PropertyCardStyles.gridContent}>
        <Text
          style={[PropertyCardStyles.gridTitle, { color: colors.text }]}
          numberOfLines={1}
        >
          {property.title}
        </Text>
        <View style={PropertyCardStyles.locationRow}>
          <Ionicons
            name="location-outline"
            size={12}
            color={colors.textSecondary}
          />
          <Text
            style={[
              PropertyCardStyles.gridLocation,
              { color: colors.textSecondary },
            ]}
            numberOfLines={1}
          >
            {property.location}
          </Text>
        </View>
        <Text style={[PropertyCardStyles.gridPrice, { color: colors.primary }]}>
          {formatPrice(property.price)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export const PropertyCardStyles = StyleSheet.create({
  // List Card Styles
  propertyCard: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
    overflow: "hidden",
    marginBottom: Spacing.md,
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
  // Grid Card Styles
  gridCard: {
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
  },
  gridTitle: {
    ...Typography.titleMedium,
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs / 2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs / 2,
    marginBottom: Spacing.xs,
  },
  gridLocation: {
    ...Typography.bodyMedium,
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  gridPrice: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: "800",
    color: Colors.primaryGreen,
  },
});
