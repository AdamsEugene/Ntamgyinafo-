import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  Share,
  FlatList,
  Alert,
} from "react-native";
import Animated from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { LinearGradient } from "expo-linear-gradient";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Typography, Spacing } from "@/constants/design";
import { useTheme } from "@/contexts/ThemeContext";
import { getDetailedProperty } from "@/constants/mockData";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type ListingStatus = "active" | "pending" | "sold" | "rented";

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  plotSize?: number;
  description: string;
  amenities: string[];
  latitude?: number;
  longitude?: number;
  address: string;
  negotiable?: boolean;
  owner: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
    memberSince: string;
    phone?: string;
  };
  transactionType: "buy" | "rent";
  propertyType?: "house" | "apartment" | "land" | "commercial";
  yearBuilt?: number;
  propertySize?: number;
  listedDate?: string;
  propertyId?: string;
  features?: {
    furnished?: boolean;
    airConditioning?: boolean;
    heating?: boolean;
    balcony?: boolean;
    garden?: boolean;
    garage?: boolean;
    elevator?: boolean;
    swimmingPool?: boolean;
  };
}

// Mock stats for owner view
const LISTING_STATS = {
  views: 234,
  uniqueViews: 189,
  saves: 45,
  inquiries: 12,
  messages: 8,
  shares: 6,
};

const getStatusOptions = (primaryColor: string) => [
  {
    id: "active" as ListingStatus,
    label: "Active",
    icon: "checkmark-circle",
    color: primaryColor,
  },
  {
    id: "pending" as ListingStatus,
    label: "Pending",
    icon: "time",
    color: "#F59E0B",
  },
  {
    id: "sold" as ListingStatus,
    label: "Sold",
    icon: "pricetag",
    color: "#F59E0B",
  },
  {
    id: "rented" as ListingStatus,
    label: "Rented",
    icon: "key",
    color: "#6B7280",
  },
];

export default function OwnerListingDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id;
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [listingStatus, setListingStatus] = useState<ListingStatus>("active");
  const scrollViewRef = useRef<ScrollView>(null);
  const statusBottomSheetRef = useRef<BottomSheetModal>(null);
  const deleteBottomSheetRef = useRef<BottomSheetModal>(null);

  // Get property from mock data
  const detailedProperty = getDetailedProperty(id || "1");
  const property: Property = detailedProperty
    ? {
        id: detailedProperty.id,
        title: detailedProperty.title,
        location: detailedProperty.location,
        price: detailedProperty.price,
        images: detailedProperty.images,
        bedrooms: detailedProperty.bedrooms,
        bathrooms: detailedProperty.bathrooms,
        plotSize: detailedProperty.plotSize,
        description: detailedProperty.description,
        amenities: detailedProperty.amenities,
        latitude: detailedProperty.latitude,
        longitude: detailedProperty.longitude,
        address: detailedProperty.address,
        negotiable: detailedProperty.negotiable,
        owner: detailedProperty.owner,
        transactionType: detailedProperty.transactionType,
        propertyType: detailedProperty.propertyType,
        yearBuilt: detailedProperty.yearBuilt,
        propertySize: detailedProperty.propertySize,
        listedDate: detailedProperty.listedDate,
        propertyId: detailedProperty.propertyId,
        features: detailedProperty.features,
      }
    : {
        id: "1",
        title: "4 Bedroom House in East Legon",
        location: "East Legon, Accra",
        price: 850000,
        images: [
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
        ],
        bedrooms: 4,
        bathrooms: 3,
        plotSize: 2,
        description: "Beautiful modern 4-bedroom house.",
        amenities: ["Water", "Electricity", "Security"],
        latitude: 5.6037,
        longitude: -0.187,
        address: "123 Main Street, East Legon, Accra",
        negotiable: true,
        owner: {
          id: "owner1",
          name: "Kofi Mensah",
          avatar: "https://i.pravatar.cc/150?img=12",
          verified: true,
          memberSince: "2023",
          phone: "+233123456789",
        },
        transactionType: "buy",
        propertyType: "house",
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

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out my property: ${property.title} - ${formatPrice(
          property.price
        )}`,
        url: `https://ntamgyinafo.com/property/${property.id}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleEditListing = () => {
    // Navigate to edit listing screen
    router.push(`/(owner-tabs)/add-listing?edit=${property.id}` as any);
  };

  const handleViewStats = () => {
    // Navigate to listing analytics screen
    router.push(`/(owner-tabs)/listing/${property.id}/analytics` as any);
  };

  const handleChangeStatus = () => {
    statusBottomSheetRef.current?.present();
  };

  const handleDeleteListing = () => {
    deleteBottomSheetRef.current?.present();
  };

  const confirmDelete = () => {
    deleteBottomSheetRef.current?.dismiss();
    // In a real app, delete the listing from the backend
    Alert.alert(
      "Listing Deleted",
      "Your listing has been permanently deleted.",
      [
        {
          text: "OK",
          onPress: () => router.replace("/(owner-tabs)/my-listings"),
        },
      ]
    );
  };

  const selectStatus = (status: ListingStatus) => {
    setListingStatus(status);
    statusBottomSheetRef.current?.dismiss();
    // In a real app, update the listing status on the backend
  };

  // const statusSnapPoints = useMemo(() => ["45%"], []);
  // const deleteSnapPoints = useMemo(() => ["35%"], []);

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

  const handleImageScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentImageIndex(index);
  };

  const STATUS_OPTIONS = getStatusOptions(colors.primary);

  const getStatusInfo = (status: ListingStatus) => {
    return STATUS_OPTIONS.find((s) => s.id === status) || STATUS_OPTIONS[0];
  };

  const currentStatusInfo = getStatusInfo(listingStatus);

  return (
    <>
      <StatusBar style="light" />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 120 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Image Carousel */}
          <View style={styles.imageCarousel}>
            <FlatList
              data={property.images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleImageScroll}
              scrollEventThrottle={16}
              keyExtractor={(item, index) => `image-${index}`}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => {
                    router.push(
                      `/property/${property.id}/gallery?index=${index}`
                    );
                  }}
                  style={{ width: SCREEN_WIDTH }}
                >
                  {index === 0 ? (
                    <Animated.Image
                      source={{ uri: item }}
                      style={styles.carouselImage}
                      {...{
                        sharedTransitionTag: `property-image-${property.id}`,
                      }}
                    />
                  ) : (
                    <Image
                      source={{ uri: item }}
                      style={styles.carouselImage}
                    />
                  )}
                </TouchableOpacity>
              )}
            />

            {/* Header */}
            <View
              style={[
                styles.header,
                {
                  paddingTop: insets.top + Spacing.sm,
                  paddingBottom: Spacing.md,
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.headerButton}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.headerButtonBackground,
                    { backgroundColor: colors.surface },
                  ]}
                >
                  <Ionicons name="arrow-back" size={22} color={colors.text} />
                </View>
              </TouchableOpacity>

              <Text style={styles.headerTitle}>My Listing</Text>

              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={handleShare}
                  style={styles.headerButton}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.headerButtonBackground,
                      { backgroundColor: colors.surface },
                    ]}
                  >
                    <Ionicons
                      name="share-outline"
                      size={22}
                      color={colors.text}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Status Badge */}
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: currentStatusInfo.color },
              ]}
            >
              <Ionicons
                name={currentStatusInfo.icon as any}
                size={14}
                color="#FFFFFF"
              />
              <Text style={styles.statusBadgeText}>
                {currentStatusInfo.label}
              </Text>
            </View>

            {/* Image Counter */}
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>
                {currentImageIndex + 1}/{property.images.length}
              </Text>
            </View>

            {/* Gradient Overlay */}
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.4)"]}
              style={styles.imageGradientOverlay}
            />

            {/* Image Dots */}
            <View style={styles.imageDots}>
              {property.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentImageIndex && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Quick Stats Banner */}
          <View
            style={[
              styles.statsSection,
              {
                backgroundColor: colors.surface,
              },
            ]}
          >
            <Text
              style={[
                styles.statsSectionTitle,
                { color: colors.textSecondary },
              ]}
            >
              Performance Overview
            </Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: `${colors.primary}15` },
                  ]}
                >
                  <Ionicons
                    name="eye-outline"
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {LISTING_STATS.views}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Views
                </Text>
              </View>
              <View style={styles.statCard}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: "#F59E0B15" },
                  ]}
                >
                  <Ionicons name="heart-outline" size={20} color="#F59E0B" />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {LISTING_STATS.saves}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Saves
                </Text>
              </View>
              <View style={styles.statCard}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: "#F59E0B15" },
                  ]}
                >
                  <Ionicons
                    name="chatbubble-outline"
                    size={20}
                    color="#F59E0B"
                  />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {LISTING_STATS.inquiries}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Inquiries
                </Text>
              </View>
              <View style={styles.statCard}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: "#6366F115" },
                  ]}
                >
                  <Ionicons
                    name="share-social-outline"
                    size={20}
                    color="#6366F1"
                  />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {LISTING_STATS.shares}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Shares
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.viewAllStatsButton,
                { borderTopColor: colors.divider },
              ]}
              onPress={handleViewStats}
            >
              <Text
                style={[styles.viewAllStatsText, { color: colors.primary }]}
              >
                View Detailed Analytics
              </Text>
              <Ionicons name="arrow-forward" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Property Info */}
          <View style={styles.propertyInfo}>
            <View style={styles.propertyTypeRow}>
              {property.propertyType && (
                <View
                  style={[
                    styles.typeBadge,
                    { backgroundColor: `${colors.primary}10` },
                  ]}
                >
                  <Ionicons
                    name={
                      property.propertyType === "house"
                        ? "home-outline"
                        : property.propertyType === "apartment"
                        ? "business-outline"
                        : property.propertyType === "land"
                        ? "map-outline"
                        : "storefront-outline"
                    }
                    size={14}
                    color={colors.primary}
                  />
                  <Text
                    style={[styles.typeBadgeText, { color: colors.primary }]}
                  >
                    {property.propertyType.charAt(0).toUpperCase() +
                      property.propertyType.slice(1)}
                  </Text>
                </View>
              )}
              <View
                style={[
                  styles.transactionBadge,
                  { backgroundColor: colors.primary },
                  property.transactionType === "rent" && {
                    backgroundColor: "#F59E0B",
                  },
                ]}
              >
                <Text style={styles.transactionBadgeText}>
                  For {property.transactionType === "buy" ? "Sale" : "Rent"}
                </Text>
              </View>
            </View>

            <Text style={[styles.propertyTitle, { color: colors.text }]}>
              {property.title}
            </Text>

            <View style={styles.locationRow}>
              <Ionicons
                name="location-outline"
                size={18}
                color={colors.textSecondary}
              />
              <Text
                style={[styles.locationText, { color: colors.textSecondary }]}
              >
                {property.location}
              </Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: colors.primary }]}>
                {formatPrice(property.price)}
              </Text>
              {property.transactionType === "rent" && (
                <Text
                  style={[styles.priceUnit, { color: colors.textSecondary }]}
                >
                  /month
                </Text>
              )}
              {property.negotiable && (
                <View
                  style={[
                    styles.negotiableBadge,
                    { backgroundColor: `${colors.accent}20` },
                  ]}
                >
                  <Text
                    style={[styles.negotiableText, { color: colors.accent }]}
                  >
                    Negotiable
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Quick Stats */}
          <View
            style={[
              styles.quickStats,
              {
                backgroundColor: colors.surface,
              },
            ]}
          >
            <View style={styles.quickStatItem}>
              <Ionicons name="bed-outline" size={22} color={colors.primary} />
              <Text style={[styles.quickStatValue, { color: colors.text }]}>
                {property.bedrooms}
              </Text>
              <Text
                style={[styles.quickStatLabel, { color: colors.textSecondary }]}
              >
                Beds
              </Text>
            </View>
            <View
              style={[
                styles.quickStatDivider,
                { backgroundColor: colors.divider },
              ]}
            />
            <View style={styles.quickStatItem}>
              <Ionicons name="water-outline" size={22} color={colors.primary} />
              <Text style={[styles.quickStatValue, { color: colors.text }]}>
                {property.bathrooms}
              </Text>
              <Text
                style={[styles.quickStatLabel, { color: colors.textSecondary }]}
              >
                Baths
              </Text>
            </View>
            {property.plotSize && (
              <>
                <View
                  style={[
                    styles.quickStatDivider,
                    { backgroundColor: colors.divider },
                  ]}
                />
                <View style={styles.quickStatItem}>
                  <Ionicons
                    name="resize-outline"
                    size={22}
                    color={colors.primary}
                  />
                  <Text style={[styles.quickStatValue, { color: colors.text }]}>
                    {property.plotSize}
                  </Text>
                  <Text
                    style={[
                      styles.quickStatLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Plots
                  </Text>
                </View>
              </>
            )}
            {property.propertySize && (
              <>
                <View
                  style={[
                    styles.quickStatDivider,
                    { backgroundColor: colors.divider },
                  ]}
                />
                <View style={styles.quickStatItem}>
                  <Ionicons
                    name="square-outline"
                    size={22}
                    color={colors.primary}
                  />
                  <Text style={[styles.quickStatValue, { color: colors.text }]}>
                    {property.propertySize}
                  </Text>
                  <Text
                    style={[
                      styles.quickStatLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    m²
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Description
            </Text>
            <View
              style={[
                styles.descriptionCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
            >
              <Text
                style={[styles.description, { color: colors.textSecondary }]}
                numberOfLines={showFullDescription ? undefined : 3}
              >
                {property.description}
              </Text>
              {property.description.length > 150 && (
                <TouchableOpacity
                  onPress={() => setShowFullDescription(!showFullDescription)}
                  style={styles.readMoreButton}
                >
                  <Text
                    style={[styles.readMoreText, { color: colors.primary }]}
                  >
                    {showFullDescription ? "Show Less" : "Read More"}
                  </Text>
                  <Ionicons
                    name={showFullDescription ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Amenities */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Amenities
            </Text>
            <View style={styles.amenitiesGrid}>
              {property.amenities.map((amenity, index) => (
                <View
                  key={index}
                  style={[
                    styles.amenityChip,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.divider,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.amenityIconContainer,
                      { backgroundColor: `${colors.primary}15` },
                    ]}
                  >
                    <Ionicons
                      name="checkmark"
                      size={14}
                      color={colors.primary}
                    />
                  </View>
                  <Text style={[styles.amenityText, { color: colors.text }]}>
                    {amenity}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Location Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Location
              </Text>
              <TouchableOpacity
                onPress={() =>
                  router.push(`/(tabs)/map?property=${property.id}` as any)
                }
                style={styles.viewButton}
              >
                <Text
                  style={[styles.viewButtonText, { color: colors.primary }]}
                >
                  View Full Map
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.mapPreview}>
              {property.latitude && property.longitude ? (
                <MapView
                  style={styles.map}
                  provider={
                    Platform.OS === "android" ? PROVIDER_GOOGLE : undefined
                  }
                  initialRegion={{
                    latitude: property.latitude,
                    longitude: property.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  rotateEnabled={false}
                  pitchEnabled={false}
                >
                  <Marker
                    coordinate={{
                      latitude: property.latitude,
                      longitude: property.longitude,
                    }}
                    title={property.title}
                  >
                    <View
                      style={[
                        styles.customMarker,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.primary,
                        },
                      ]}
                    >
                      <Ionicons
                        name="location"
                        size={24}
                        color={colors.primary}
                      />
                    </View>
                  </Marker>
                </MapView>
              ) : (
                <View
                  style={[
                    styles.mapPlaceholder,
                    { backgroundColor: colors.surface },
                  ]}
                >
                  <Ionicons
                    name="map-outline"
                    size={48}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.mapPlaceholderText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Map not available
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.address, { color: colors.textSecondary }]}>
              {property.address}
            </Text>
          </View>

          {/* Listing Info */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Listing Info
            </Text>
            <View
              style={[
                styles.listingInfoCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
            >
              <View
                style={[
                  styles.listingInfoRow,
                  { borderBottomColor: colors.divider },
                ]}
              >
                <Text
                  style={[
                    styles.listingInfoLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Property ID
                </Text>
                <Text style={[styles.listingInfoValue, { color: colors.text }]}>
                  {property.propertyId || `#${property.id}`}
                </Text>
              </View>
              <View
                style={[
                  styles.listingInfoRow,
                  { borderBottomColor: colors.divider },
                ]}
              >
                <Text
                  style={[
                    styles.listingInfoLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Listed Date
                </Text>
                <Text style={[styles.listingInfoValue, { color: colors.text }]}>
                  {property.listedDate || "Dec 15, 2024"}
                </Text>
              </View>
              <View style={styles.listingInfoRow}>
                <Text
                  style={[
                    styles.listingInfoLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Status
                </Text>
                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: currentStatusInfo.color },
                  ]}
                >
                  <Text style={styles.statusIndicatorText}>
                    {currentStatusInfo.label}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Fixed Owner Action Buttons */}
        <View
          style={[
            styles.ownerActionsContainer,
            {
              paddingBottom: insets.bottom + Spacing.md,
              paddingTop: Spacing.md,
              backgroundColor: colors.surface,
              borderTopColor: colors.divider,
            },
          ]}
        >
          <View style={styles.ownerActionsRow}>
            <TouchableOpacity
              style={styles.ownerActionButton}
              onPress={handleEditListing}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.ownerActionGradient}
              >
                <Ionicons name="create-outline" size={20} color="#FFFFFF" />
                <Text style={styles.ownerActionText}>Edit</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.ownerActionButton}
              onPress={handleViewStats}
            >
              <View
                style={[
                  styles.ownerActionOutline,
                  {
                    borderColor: colors.primary,
                    backgroundColor: colors.surface,
                  },
                ]}
              >
                <Ionicons
                  name="stats-chart-outline"
                  size={20}
                  color={colors.primary}
                />
                <Text
                  style={[
                    styles.ownerActionOutlineText,
                    { color: colors.primary },
                  ]}
                >
                  Stats
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.ownerActionButton}
              onPress={handleChangeStatus}
            >
              <View
                style={[
                  styles.ownerActionOutline,
                  {
                    borderColor: colors.primary,
                    backgroundColor: colors.surface,
                  },
                ]}
              >
                <Ionicons
                  name="swap-horizontal-outline"
                  size={20}
                  color={colors.primary}
                />
                <Text
                  style={[
                    styles.ownerActionOutlineText,
                    { color: colors.primary },
                  ]}
                >
                  Status
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.ownerActionButton}
              onPress={handleDeleteListing}
            >
              <View
                style={[
                  styles.ownerActionOutline,
                  styles.deleteActionOutline,
                  {
                    borderColor: "#DC2626",
                    backgroundColor: colors.surface,
                  },
                ]}
              >
                <Ionicons name="trash-outline" size={20} color="#DC2626" />
                <Text style={styles.deleteActionText}>Delete</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Bottom Sheet */}
        <BottomSheetModal
          ref={statusBottomSheetRef}
          index={0}
          snapPoints={["45%"]}
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={{ backgroundColor: colors.textSecondary }}
          backgroundStyle={{ backgroundColor: colors.surface }}
        >
          <BottomSheetView style={styles.sheetContent}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>
              Change Status
            </Text>
            <Text
              style={[styles.sheetSubtitle, { color: colors.textSecondary }]}
            >
              Update your listing status
            </Text>

            <View style={styles.statusOptions}>
              {STATUS_OPTIONS.map((status) => (
                <TouchableOpacity
                  key={status.id}
                  style={[
                    styles.statusOption,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.divider,
                    },
                    listingStatus === status.id && {
                      borderColor: colors.primary,
                      backgroundColor: `${colors.primary}08`,
                    },
                  ]}
                  onPress={() => selectStatus(status.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.statusOptionIcon,
                      { backgroundColor: `${status.color}15` },
                    ]}
                  >
                    <Ionicons
                      name={status.icon as any}
                      size={24}
                      color={status.color}
                    />
                  </View>
                  <Text
                    style={[styles.statusOptionLabel, { color: colors.text }]}
                  >
                    {status.label}
                  </Text>
                  {listingStatus === status.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </BottomSheetView>
        </BottomSheetModal>

        {/* Delete Confirmation Bottom Sheet */}
        <BottomSheetModal
          ref={deleteBottomSheetRef}
          index={0}
          snapPoints={["35%"]}
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={{ backgroundColor: colors.textSecondary }}
          backgroundStyle={{ backgroundColor: colors.surface }}
        >
          <BottomSheetView style={styles.sheetContent}>
            <View
              style={[
                styles.deleteWarningIcon,
                {
                  backgroundColor: isDark ? "#DC262615" : "#FEE2E2",
                },
              ]}
            >
              <Ionicons name="warning-outline" size={48} color="#DC2626" />
            </View>
            <Text style={[styles.deleteTitle, { color: colors.text }]}>
              Delete Listing?
            </Text>
            <Text
              style={[styles.deleteMessage, { color: colors.textSecondary }]}
            >
              This action cannot be undone. All data associated with this
              listing will be permanently removed.
            </Text>
            <View style={styles.deleteActions}>
              <TouchableOpacity
                style={[
                  styles.cancelDeleteButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.divider,
                  },
                ]}
                onPress={() => deleteBottomSheetRef.current?.dismiss()}
              >
                <Text style={[styles.cancelDeleteText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmDeleteButton}
                onPress={confirmDelete}
              >
                <Ionicons name="trash" size={18} color="#FFFFFF" />
                <Text style={styles.confirmDeleteText}>Delete</Text>
              </TouchableOpacity>
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
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  imageCarousel: {
    height: SCREEN_HEIGHT * 0.4,
    position: "relative",
  },
  carouselImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.4,
    resizeMode: "cover",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
  },
  headerButtonBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
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
  headerTitle: {
    ...Typography.headlineMedium,
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  headerActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  statusBadge: {
    position: "absolute",
    top: 100,
    left: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeText: {
    ...Typography.labelMedium,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  imageCounter: {
    position: "absolute",
    bottom: 60,
    right: Spacing.lg,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageCounterText: {
    ...Typography.caption,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  imageGradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  imageDots: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  dotActive: {
    width: 28,
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },

  // Stats Section
  statsSection: {
    marginHorizontal: Spacing.lg,
    marginTop: -30,
    borderRadius: 16,
    padding: Spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  statsSectionTitle: {
    ...Typography.labelMedium,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    alignItems: "center",
    flex: 1,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  statValue: {
    ...Typography.headlineMedium,
  },
  statLabel: {
    ...Typography.caption,
  },
  viewAllStatsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    gap: Spacing.xs,
  },
  viewAllStatsText: {
    ...Typography.labelMedium,
    fontWeight: "600",
  },

  // Property Info
  propertyInfo: {
    padding: Spacing.lg,
  },
  propertyTypeRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    ...Typography.caption,
    fontWeight: "600",
  },
  transactionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rentBadge: {},
  transactionBadgeText: {
    ...Typography.caption,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  propertyTitle: {
    ...Typography.headlineLarge,
    marginBottom: Spacing.xs,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: Spacing.sm,
  },
  locationText: {
    ...Typography.bodyMedium,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.xs,
  },
  price: {
    ...Typography.displayMedium,
  },
  priceUnit: {
    ...Typography.bodyMedium,
  },
  negotiableBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: Spacing.sm,
  },
  negotiableText: {
    ...Typography.caption,
    fontWeight: "600",
  },

  // Quick Stats
  quickStats: {
    flexDirection: "row",
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  quickStatItem: {
    alignItems: "center",
    flex: 1,
  },
  quickStatValue: {
    ...Typography.headlineMedium,
    marginTop: 4,
  },
  quickStatLabel: {
    ...Typography.caption,
  },
  quickStatDivider: {
    width: 1,
    height: 40,
  },

  // Sections
  section: {
    padding: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.headlineMedium,
    fontSize: 18,
    marginBottom: Spacing.md,
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewButtonText: {
    ...Typography.labelMedium,
  },
  descriptionCard: {
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  description: {
    ...Typography.bodyMedium,
    lineHeight: 24,
  },
  readMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: Spacing.sm,
  },
  readMoreText: {
    ...Typography.labelMedium,
  },

  // Amenities
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  amenityChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
  },
  amenityIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  amenityText: {
    ...Typography.labelMedium,
  },

  // Map
  mapPreview: {
    height: 180,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: Spacing.sm,
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  mapPlaceholderText: {
    ...Typography.bodyMedium,
    marginTop: Spacing.sm,
  },
  customMarker: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
  },
  address: {
    ...Typography.bodyMedium,
  },

  // Listing Info
  listingInfoCard: {
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  listingInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  listingInfoLabel: {
    ...Typography.bodyMedium,
  },
  listingInfoValue: {
    ...Typography.bodyMedium,
    fontWeight: "600",
  },
  statusIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIndicatorText: {
    ...Typography.caption,
    color: "#FFFFFF",
    fontWeight: "600",
  },

  // Owner Actions
  ownerActionsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    borderTopWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  ownerActionsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  ownerActionButton: {
    flex: 1,
  },
  ownerActionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
  },
  ownerActionText: {
    ...Typography.labelMedium,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  ownerActionOutline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  ownerActionOutlineText: {
    ...Typography.labelMedium,
    fontWeight: "600",
  },
  deleteActionOutline: {
    borderColor: "#DC2626",
  },
  deleteActionText: {
    ...Typography.labelMedium,
    color: "#DC2626",
    fontWeight: "600",
  },

  // Bottom Sheet
  sheetContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  sheetTitle: {
    ...Typography.headlineMedium,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  sheetSubtitle: {
    ...Typography.bodyMedium,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  statusOptions: {
    gap: Spacing.sm,
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    gap: Spacing.md,
  },
  statusOptionActive: {},
  statusOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  statusOptionLabel: {
    ...Typography.bodyLarge,
    fontWeight: "500",
    flex: 1,
  },

  // Delete Confirmation
  deleteWarningIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: Spacing.md,
  },
  deleteTitle: {
    ...Typography.headlineMedium,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  deleteMessage: {
    ...Typography.bodyMedium,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  deleteActions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  cancelDeleteButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  cancelDeleteText: {
    ...Typography.labelMedium,
    fontWeight: "600",
  },
  confirmDeleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#DC2626",
  },
  confirmDeleteText: {
    ...Typography.labelMedium,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
