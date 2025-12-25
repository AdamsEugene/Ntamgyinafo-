import React, { useState, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

import { Colors, Typography, Spacing } from "@/constants/design";
import { useTheme } from "@/contexts/ThemeContext";
import { PropertyListCard, PropertyGridCard } from "@/components/PropertyCard";
import { BottomNavigation, TabItem } from "@/components/BottomNavigation";
import {
  FloatingHeader,
  HeaderActionButton,
} from "@/components/FloatingHeader";
import { ALL_PROPERTIES } from "@/constants/mockData";

// Bottom navigation tabs
const NAV_TABS: TabItem[] = [
  {
    id: "home",
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
    id: "saved",
    label: "Saved",
    icon: "heart-outline",
    activeIcon: "heart",
  },
];

// Sort options
const SORT_OPTIONS = [
  { id: "recent", label: "Recently Saved", icon: "time-outline" },
  { id: "price_low", label: "Price: Low to High", icon: "trending-up-outline" },
  {
    id: "price_high",
    label: "Price: High to Low",
    icon: "trending-down-outline",
  },
  { id: "name_asc", label: "Name: A to Z", icon: "text-outline" },
  { id: "name_desc", label: "Name: Z to A", icon: "text-outline" },
];

export default function SavedPropertiesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { colors, isDark: _isDark } = useTheme();

  // State
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortOption, setSortOption] = useState("recent");
  const [refreshing, setRefreshing] = useState(false);
  const [savedProperties, setSavedProperties] = useState<Set<string>>(() => {
    // Initialize with properties that have isSaved: true from mock data
    const saved = new Set<string>();
    ALL_PROPERTIES.forEach((p) => {
      if (p.isSaved) {
        saved.add(p.id);
      }
    });
    return saved;
  });

  // Refs
  const sortSheetRef = useRef<BottomSheetModal>(null);

  // Get saved properties list
  const savedPropertiesList = useMemo(() => {
    const properties = ALL_PROPERTIES.filter((p) => savedProperties.has(p.id));

    // Sort based on selected option
    switch (sortOption) {
      case "price_low":
        return [...properties].sort((a, b) => a.price - b.price);
      case "price_high":
        return [...properties].sort((a, b) => b.price - a.price);
      case "name_asc":
        return [...properties].sort((a, b) => a.title.localeCompare(b.title));
      case "name_desc":
        return [...properties].sort((a, b) => b.title.localeCompare(a.title));
      default:
        return properties;
    }
  }, [savedProperties, sortOption]);

  // Format price
  const formatPrice = useCallback((price: number) => {
    if (price >= 1000000) {
      return `GHS ${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `GHS ${(price / 1000).toFixed(0)}K`;
    }
    return `GHS ${price.toLocaleString()}`;
  }, []);

  // Toggle save property
  const toggleSaveProperty = useCallback((propertyId: string) => {
    setSavedProperties((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(propertyId)) {
        newSet.delete(propertyId);
      } else {
        newSet.add(propertyId);
      }
      return newSet;
    });
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Handle navigation
  const handleNavigation = useCallback(
    (tabId: string) => {
      switch (tabId) {
        case "home":
          router.replace("/(tabs)");
          break;
        case "search":
          router.replace("/(tabs)/search");
          break;
        case "map":
          router.replace("/(tabs)/map");
          break;
        case "saved":
          // Already here
          break;
      }
    },
    [router]
  );

  // Render backdrop
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

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      {/* Empty icon */}
      <View style={styles.emptyIconContainer}>
        <View
          style={[
            styles.emptyIconBackground,
            {
              backgroundColor: `${colors.primary}15`,
              borderColor: `${colors.primary}30`,
            },
          ]}
        >
          <Ionicons name="heart-outline" size={64} color={colors.primary} />
        </View>
      </View>

      {/* Text */}
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No Saved Properties Yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Properties you save will appear here.{"\n"}Start exploring to find your
        dream property!
      </Text>

      {/* Action button */}
      <TouchableOpacity
        style={[styles.browseButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push("/(tabs)/search")}
        activeOpacity={0.8}
      >
        <Ionicons name="search" size={20} color="#FFFFFF" />
        <Text style={styles.browseButtonText}>Browse Properties</Text>
      </TouchableOpacity>
    </View>
  );

  // Render property list
  const renderPropertyList = () => (
    <View style={styles.propertyList}>
      {savedPropertiesList.map((property) => (
        <PropertyListCard
          key={property.id}
          property={property}
          savedProperties={savedProperties}
          onToggleSave={toggleSaveProperty}
          formatPrice={formatPrice}
        />
      ))}
    </View>
  );

  // Render property grid
  const renderPropertyGrid = () => (
    <View style={styles.propertyGrid}>
      {savedPropertiesList.map((property) => (
        <View key={property.id} style={styles.gridItem}>
          <PropertyGridCard
            property={property}
            savedProperties={savedProperties}
            onToggleSave={toggleSaveProperty}
            formatPrice={formatPrice}
          />
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Decorative Background Elements */}
      <View style={styles.decorativeBackground}>
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />
      </View>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Floating Header with Blur */}
        <FloatingHeader
          title="Saved Properties"
          showBackButton
          onBackPress={() => router.back()}
          rightContent={
            <>
              <HeaderActionButton
                icon="funnel-outline"
                onPress={() => sortSheetRef.current?.present()}
              />
              <HeaderActionButton
                icon={viewMode === "list" ? "grid-outline" : "list-outline"}
                onPress={() =>
                  setViewMode((prev) => (prev === "list" ? "grid" : "list"))
                }
              />
            </>
          }
        />

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 80 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {/* Results count */}
          {savedPropertiesList.length > 0 && (
            <View style={styles.resultsHeader}>
              <Text style={[styles.resultsCount, { color: colors.text }]}>
                {savedPropertiesList.length}{" "}
                {savedPropertiesList.length === 1
                  ? "property saved"
                  : "properties saved"}
              </Text>
              <TouchableOpacity
                style={[
                  styles.sortButton,
                  { backgroundColor: `${colors.primary}15` },
                ]}
                onPress={() => sortSheetRef.current?.present()}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.sortButtonText, { color: colors.primary }]}
                >
                  {SORT_OPTIONS.find((o) => o.id === sortOption)?.label}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={14}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Property list/grid or empty state */}
          {savedPropertiesList.length === 0
            ? renderEmptyState()
            : viewMode === "list"
            ? renderPropertyList()
            : renderPropertyGrid()}

          {/* Bottom padding for navigation */}
          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Bottom Navigation */}
        <BottomNavigation
          tabs={NAV_TABS}
          activeTab="saved"
          onTabPress={handleNavigation}
        />

        {/* Sort Bottom Sheet */}
        <BottomSheetModal
          ref={sortSheetRef}
          snapPoints={["50%"]}
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={{ backgroundColor: colors.textSecondary }}
          backgroundStyle={{ backgroundColor: colors.surface }}
        >
          <BottomSheetView style={styles.sortSheetContent}>
            {/* Header */}
            <View
              style={[styles.sortHeader, { borderBottomColor: colors.divider }]}
            >
              <Text style={[styles.sortTitle, { color: colors.text }]}>
                Sort By
              </Text>
              <TouchableOpacity
                onPress={() => sortSheetRef.current?.dismiss()}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Sort options */}
            <View style={styles.sortOptions}>
              {SORT_OPTIONS.map((option) => {
                const isSelected = sortOption === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.sortOption,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.divider,
                      },
                      isSelected && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
                    onPress={() => {
                      setSortOption(option.id);
                      sortSheetRef.current?.dismiss();
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.sortOptionLeft}>
                      <View
                        style={[
                          styles.sortIconContainer,
                          { backgroundColor: `${colors.textSecondary}15` },
                          isSelected && styles.sortIconContainerSelected,
                        ]}
                      >
                        <Ionicons
                          name={option.icon as any}
                          size={20}
                          color={isSelected ? "#FFFFFF" : colors.textSecondary}
                        />
                      </View>
                      <Text
                        style={[
                          styles.sortOptionText,
                          { color: colors.text },
                          isSelected && styles.sortOptionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="#FFFFFF"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </BottomSheetView>
        </BottomSheetModal>
      </View>
    </View>
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
    overflow: "hidden",
  },
  bgCircle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.primaryGreen,
    opacity: 0.05,
    top: -100,
    right: -100,
  },
  bgCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.primaryGreen,
    opacity: 0.05,
    bottom: 200,
    left: -50,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  headerTitleText: {
    ...Typography.headlineMedium,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  resultsCount: {
    ...Typography.bodyMedium,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  sortButtonText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
  propertyList: {
    gap: Spacing.md,
  },
  propertyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  gridItem: {
    width: "48%",
  },
  // Empty state styles
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl * 2,
    paddingHorizontal: Spacing.xl,
  },
  emptyDecoration: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  decorativeCircle: {
    position: "absolute",
    borderRadius: 1000,
    backgroundColor: "rgba(34, 197, 94, 0.05)",
  },
  circle1: {
    width: 200,
    height: 200,
    top: -50,
    right: -80,
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: 0,
    left: -60,
  },
  circle3: {
    width: 100,
    height: 100,
    top: 100,
    left: 20,
  },
  emptyIconContainer: {
    marginBottom: Spacing.xl,
  },
  emptyIconBackground: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(34, 197, 94, 0.2)",
  },
  emptyTitle: {
    ...Typography.headlineMedium,
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  emptySubtitle: {
    ...Typography.bodyMedium,
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  browseButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primaryGreen,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  browseButtonText: {
    ...Typography.labelLarge,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  // Sort sheet styles
  sortSheetContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  sortHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    marginBottom: Spacing.lg,
  },
  sortTitle: {
    ...Typography.headlineMedium,
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  sortOptions: {
    gap: Spacing.md,
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 16,
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
  sortOptionSelected: {
    backgroundColor: Colors.primaryGreen,
    borderColor: Colors.primaryGreen,
  },
  sortOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  sortIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  sortIconContainerSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  sortOptionText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  sortOptionTextSelected: {
    color: "#FFFFFF",
  },
});
