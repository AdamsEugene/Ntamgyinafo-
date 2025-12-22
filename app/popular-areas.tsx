import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  RefreshControl,
  TextInput,
} from "react-native";
import Animated from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors, Typography, Spacing } from "@/constants/design";
import {
  FloatingHeaderStyles,
  HEADER_ICON_SIZE,
} from "@/components/FloatingHeader.styles";
import { MAP_PROPERTIES, MapProperty } from "@/constants/mockData";

// Popular areas data
const POPULAR_AREAS = [
  {
    id: "east-legon",
    name: "East Legon",
    count: 234,
    icon: "location" as const,
    color: "#10B981",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400",
  },
  {
    id: "airport",
    name: "Airport Residential",
    count: 189,
    icon: "airplane" as const,
    color: "#3B82F6",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400",
  },
  {
    id: "labone",
    name: "Labone",
    count: 156,
    icon: "leaf" as const,
    color: "#8B5CF6",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400",
  },
  {
    id: "cantonments",
    name: "Cantonments",
    count: 142,
    icon: "shield" as const,
    color: "#F59E0B",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400",
  },
  {
    id: "osu",
    name: "Osu",
    count: 128,
    icon: "restaurant" as const,
    color: "#EF4444",
    image: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=400",
  },
  {
    id: "ridge",
    name: "Ridge",
    count: 98,
    icon: "business" as const,
    color: "#06B6D4",
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400",
  },
  {
    id: "spintex",
    name: "Spintex Road",
    count: 210,
    icon: "car" as const,
    color: "#84CC16",
    image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400",
  },
  {
    id: "tema",
    name: "Tema",
    count: 175,
    icon: "boat" as const,
    color: "#0EA5E9",
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400",
  },
];

interface Area {
  id: string;
  name: string;
  count: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  image: string;
}

export default function PopularAreasScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState<string | null>(
    (params.area as string) || null
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const filteredAreas = POPULAR_AREAS.filter((area) =>
    area.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get properties for selected area (mock)
  const areaProperties: MapProperty[] = selectedArea
    ? MAP_PROPERTIES.filter((_, index) => index % 3 === 0)
    : [];

  const formatPrice = (price: number): string => {
    if (price >= 1000000) {
      return `GHS ${(price / 1000000).toFixed(1)}M`;
    }
    if (price >= 1000) {
      return `GHS ${(price / 1000).toFixed(0)}K`;
    }
    return `GHS ${price.toLocaleString()}`;
  };

  const renderAreaCard = ({ item }: { item: Area }) => (
    <TouchableOpacity
      style={[
        styles.areaCard,
        selectedArea === item.id && styles.areaCardSelected,
      ]}
      onPress={() => setSelectedArea(selectedArea === item.id ? null : item.id)}
      activeOpacity={0.9}
    >
      <Animated.Image
        source={{ uri: item.image }}
        style={styles.areaImage}
        resizeMode="cover"
      />
      <View style={styles.areaOverlay} />
      <View style={styles.areaContent}>
        <View style={[styles.areaIconBg, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon} size={18} color="#FFFFFF" />
        </View>
        <Text style={styles.areaName}>{item.name}</Text>
        <Text style={styles.areaCount}>{item.count} properties</Text>
      </View>
      {selectedArea === item.id && (
        <View style={styles.selectedIndicator}>
          <Ionicons
            name="checkmark-circle"
            size={24}
            color={Colors.primaryGreen}
          />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderPropertyCard = ({ item }: { item: MapProperty }) => (
    <TouchableOpacity
      style={styles.propertyCard}
      onPress={() => router.push(`/property/${item.id}`)}
      activeOpacity={0.9}
    >
      <Animated.Image
        source={{ uri: item.image }}
        style={styles.propertyImage}
        resizeMode="cover"
      />
      <View style={styles.propertyContent}>
        <Text style={styles.propertyTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.propertyLocation}>
          <Ionicons
            name="location-outline"
            size={12}
            color={Colors.textSecondary}
          />
          <Text style={styles.propertyLocationText} numberOfLines={1}>
            {item.location}
          </Text>
        </View>
        <Text style={styles.propertyPrice}>{formatPrice(item.price)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
    </TouchableOpacity>
  );

  const selectedAreaData = POPULAR_AREAS.find((a) => a.id === selectedArea);

  return (
    <>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.decorativeBackground}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
        </View>

        <View
          style={[
            FloatingHeaderStyles.floatingHeader,
            { paddingTop: insets.top + Spacing.md },
          ]}
        >
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={FloatingHeaderStyles.actionButton}
              activeOpacity={0.7}
            >
              <View style={FloatingHeaderStyles.actionButtonBackground}>
                <Ionicons
                  name="arrow-back"
                  size={HEADER_ICON_SIZE}
                  color={Colors.textPrimary}
                />
              </View>
            </TouchableOpacity>
            <Text style={styles.headerTitleText}>Popular Areas</Text>
          </View>
        </View>

        <FlatList
          data={selectedArea ? areaProperties : []}
          renderItem={renderPropertyCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingTop: 80 + insets.top,
              paddingBottom: 100 + insets.bottom,
            },
          ]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <Ionicons
                  name="search"
                  size={20}
                  color={Colors.textSecondary}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search areas..."
                  placeholderTextColor={Colors.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Ionicons
                      name="close-circle"
                      size={20}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                )}
              </View>

              {/* Areas Grid */}
              <Text style={styles.sectionTitle}>
                {selectedArea ? "Selected Area" : "All Popular Areas"}
              </Text>
              <FlatList
                data={selectedArea ? [selectedAreaData!] : filteredAreas}
                renderItem={renderAreaCard}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.areasGrid}
                scrollEnabled={false}
                style={styles.areasContainer}
              />

              {/* Properties Header */}
              {selectedArea && (
                <View style={styles.propertiesHeader}>
                  <Text style={styles.sectionTitle}>
                    Properties in {selectedAreaData?.name}
                  </Text>
                  <Text style={styles.propertiesCount}>
                    {areaProperties.length} available
                  </Text>
                </View>
              )}

              {!selectedArea && (
                <View style={styles.selectPrompt}>
                  <Ionicons
                    name="hand-left-outline"
                    size={32}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.selectPromptText}>
                    Tap an area to see properties
                  </Text>
                </View>
              )}
            </>
          }
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
  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.divider,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.bodyMedium,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  areasContainer: {
    marginBottom: Spacing.lg,
  },
  areasGrid: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  areaCard: {
    flex: 1,
    aspectRatio: 1.2,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    borderWidth: 2,
    borderColor: "transparent",
  },
  areaCardSelected: {
    borderColor: Colors.primaryGreen,
  },
  areaImage: {
    width: "100%",
    height: "100%",
  },
  areaOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  areaContent: {
    position: "absolute",
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
  },
  areaIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  areaName: {
    ...Typography.titleMedium,
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  areaCount: {
    ...Typography.caption,
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
  },
  selectedIndicator: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
  },
  propertiesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  propertiesCount: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  selectPrompt: {
    alignItems: "center",
    paddingVertical: Spacing.xl * 2,
    gap: Spacing.md,
  },
  selectPromptText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  propertyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
    gap: Spacing.md,
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
  propertyImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  propertyContent: {
    flex: 1,
  },
  propertyTitle: {
    ...Typography.bodyMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  propertyLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  propertyLocationText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  propertyPrice: {
    ...Typography.titleMedium,
    fontSize: 15,
    fontWeight: "700",
    color: Colors.primaryGreen,
  },
});
