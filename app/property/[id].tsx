import React, { useState, useRef, useMemo, useCallback } from "react";
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
  Linking,
  FlatList,
} from "react-native";
import Animated from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Colors, Typography, Spacing } from "@/constants/design";
import { useTheme } from "@/contexts/ThemeContext";
import { getDetailedProperty } from "@/constants/mockData";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

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
  propertySize?: number; // in square meters
  listedDate?: string;
  propertyId?: string; // Reference number
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

export default function PropertyDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id;
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const chatBottomSheetRef = useRef<BottomSheetModal>(null);

  // Get property from mock data or use default
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
        message: `Check out this property: ${property.title} - ${formatPrice(
          property.price
        )}`,
        url: `https://ntamgyinafo.com/property/${property.id}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleCall = () => {
    // In a real app, check subscription first
    const phoneNumber = property.owner.phone || "+233123456789";
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const chatSnapPoints = useMemo(() => ["50%"], []);

  const handleChat = () => {
    // In a real app, check subscription first
    console.log("Chat button clicked, presenting bottom sheet");
    try {
      chatBottomSheetRef.current?.present();
    } catch (error) {
      console.error("Error presenting bottom sheet:", error);
    }
  };

  const handleChatInApp = () => {
    chatBottomSheetRef.current?.dismiss();
    // Navigate to in-app chat screen
    // TODO: Implement chat screen route
    console.log("Navigate to in-app chat with:", property.owner.id);
    // router.push(`/chat/${property.owner.id}` as any);
  };

  const handleChatViaApp = async (app: string, phoneNumber: string) => {
    chatBottomSheetRef.current?.dismiss();
    const formattedPhone = phoneNumber.replace(/[^0-9]/g, ""); // Remove non-digits

    try {
      let url = "";
      switch (app) {
        case "whatsapp":
          url = `whatsapp://send?phone=${formattedPhone}`;
          break;
        case "telegram":
          url = `tg://resolve?phone=${formattedPhone}`;
          break;
        case "sms":
          url = `sms:${phoneNumber}`;
          break;
        case "call":
          url = `tel:${phoneNumber}`;
          break;
        default:
          return;
      }

      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        // Fallback for WhatsApp web or install prompt
        if (app === "whatsapp") {
          await Linking.openURL(`https://wa.me/${formattedPhone}`);
        }
      }
    } catch (error) {
      console.error(`Error opening ${app}:`, error);
    }
  };

  const renderChatBackdrop = useCallback(
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

  return (
    <>
      <StatusBar style="light" />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Image Carousel - Full Bleed */}
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
                    // Navigate to Gallery Screen when image is tapped
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

            {/* Header - Overlay on Image */}
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

              <Text style={styles.headerTitle}>Property</Text>

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
                <TouchableOpacity
                  onPress={() => setIsSaved(!isSaved)}
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
                      name={isSaved ? "heart" : "heart-outline"}
                      size={22}
                      color={isSaved ? "#FF3B30" : colors.text}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Image Counter */}
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>
                {currentImageIndex + 1}/{property.images.length}
              </Text>
            </View>

            {/* Gradient Overlay for better visibility */}
            <View style={styles.imageGradientOverlay} />

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

            {/* Media Badges */}
            <View style={styles.mediaBadges}>
              <TouchableOpacity
                style={styles.mediaBadge}
                onPress={() => {
                  // Navigate to Gallery Screen with Photos tab
                  router.push(`/property/${property.id}/gallery?tab=photos`);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="camera-outline" size={14} color="#FFFFFF" />
                <Text style={styles.mediaBadgeText}>
                  {property.images.length}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.mediaBadge}
                onPress={() => {
                  // Navigate to Gallery Screen with Videos tab
                  router.push(`/property/${property.id}/gallery?tab=videos`);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="videocam-outline" size={14} color="#FFFFFF" />
                <Text style={styles.mediaBadgeText}>3</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.mediaBadge}
                onPress={() => {
                  // Navigate to 360° Viewer Screen
                  router.push(`/property/${property.id}/360`);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="cube-outline" size={14} color="#FFFFFF" />
                <Text style={styles.mediaBadgeText}>360°</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Property Info */}
          <View
            style={[
              styles.propertyInfo,
              { backgroundColor: colors.background },
            ]}
          >
            <View style={styles.propertyTypeRow}>
              {property.propertyType && (
                <View
                  style={[
                    styles.typeBadge,
                    {
                      backgroundColor: `${colors.primary}15`,
                      borderColor: `${colors.primary}30`,
                    },
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
                  property.transactionType === "rent" && styles.rentBadge,
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
            <TouchableOpacity
              style={styles.locationRow}
              onPress={() => {
                const lat = property.latitude || 5.6037;
                const lng = property.longitude || -0.187;
                router.push(
                  `/(tabs)/map?propertyId=${property.id}&lat=${lat}&lng=${lng}`
                );
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="location-outline"
                size={16}
                color={colors.primary}
              />
              <Text style={[styles.locationText, { color: colors.primary }]}>
                {property.location}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.primary}
              />
            </TouchableOpacity>
            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: colors.primary }]}>
                {formatPrice(property.price)}
              </Text>
              {property.negotiable && (
                <View
                  style={[
                    styles.negotiableBadge,
                    {
                      backgroundColor: `${colors.primary}15`,
                      borderColor: `${colors.primary}30`,
                    },
                  ]}
                >
                  <Text
                    style={[styles.negotiableText, { color: colors.primary }]}
                  >
                    Negotiable
                  </Text>
                </View>
              )}
            </View>
            {property.propertyId && (
              <View
                style={[
                  styles.propertyIdRow,
                  { borderTopColor: colors.divider },
                ]}
              >
                <Text
                  style={[
                    styles.propertyIdLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Property ID:
                </Text>
                <Text style={[styles.propertyIdText, { color: colors.text }]}>
                  {property.propertyId}
                </Text>
              </View>
            )}
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
            >
              <Ionicons name="bed-outline" size={24} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {property.bedrooms}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Beds
              </Text>
            </View>
            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
            >
              <Ionicons name="water-outline" size={24} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {property.bathrooms}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Baths
              </Text>
            </View>
            {property.plotSize && (
              <View
                style={[
                  styles.statCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.divider,
                  },
                ]}
              >
                <Ionicons
                  name="resize-outline"
                  size={24}
                  color={colors.primary}
                />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {property.plotSize}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Plot Size
                </Text>
              </View>
            )}
            {property.propertySize && (
              <View
                style={[
                  styles.statCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.divider,
                  },
                ]}
              >
                <Ionicons
                  name="square-outline"
                  size={24}
                  color={colors.primary}
                />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {property.propertySize}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  m²
                </Text>
              </View>
            )}
          </View>

          {/* Property Details */}
          {(property.yearBuilt ||
            property.propertySize ||
            property.listedDate) && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Property Details
              </Text>
              <View style={styles.detailsGrid}>
                {property.yearBuilt && (
                  <View
                    style={[
                      styles.detailItem,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.divider,
                      },
                    ]}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color={colors.primary}
                    />
                    <View style={styles.detailContent}>
                      <Text
                        style={[
                          styles.detailLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Year Built
                      </Text>
                      <Text
                        style={[styles.detailValue, { color: colors.text }]}
                      >
                        {property.yearBuilt}
                      </Text>
                    </View>
                  </View>
                )}
                {property.propertySize && (
                  <View
                    style={[
                      styles.detailItem,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.divider,
                      },
                    ]}
                  >
                    <Ionicons
                      name="expand-outline"
                      size={20}
                      color={colors.primary}
                    />
                    <View style={styles.detailContent}>
                      <Text
                        style={[
                          styles.detailLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Property Size
                      </Text>
                      <Text
                        style={[styles.detailValue, { color: colors.text }]}
                      >
                        {property.propertySize} m²
                      </Text>
                    </View>
                  </View>
                )}
                {property.listedDate && (
                  <View
                    style={[
                      styles.detailItem,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.divider,
                      },
                    ]}
                  >
                    <Ionicons
                      name="time-outline"
                      size={20}
                      color={colors.primary}
                    />
                    <View style={styles.detailContent}>
                      <Text
                        style={[
                          styles.detailLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Listed
                      </Text>
                      <Text
                        style={[styles.detailValue, { color: colors.text }]}
                      >
                        {new Date(property.listedDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Property Features */}
          {property.features && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Features
              </Text>
              <View style={styles.featuresGrid}>
                {property.features.furnished && (
                  <View
                    style={[
                      styles.featureItem,
                      {
                        backgroundColor: colors.surface,
                        borderColor: `${colors.primary}15`,
                      },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={[styles.featureText, { color: colors.text }]}>
                      Furnished
                    </Text>
                  </View>
                )}
                {property.features.airConditioning && (
                  <View
                    style={[
                      styles.featureItem,
                      {
                        backgroundColor: colors.surface,
                        borderColor: `${colors.primary}15`,
                      },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={[styles.featureText, { color: colors.text }]}>
                      Air Conditioning
                    </Text>
                  </View>
                )}
                {property.features.heating && (
                  <View
                    style={[
                      styles.featureItem,
                      {
                        backgroundColor: colors.surface,
                        borderColor: `${colors.primary}15`,
                      },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={[styles.featureText, { color: colors.text }]}>
                      Heating
                    </Text>
                  </View>
                )}
                {property.features.balcony && (
                  <View
                    style={[
                      styles.featureItem,
                      {
                        backgroundColor: colors.surface,
                        borderColor: `${colors.primary}15`,
                      },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={[styles.featureText, { color: colors.text }]}>
                      Balcony
                    </Text>
                  </View>
                )}
                {property.features.garden && (
                  <View
                    style={[
                      styles.featureItem,
                      {
                        backgroundColor: colors.surface,
                        borderColor: `${colors.primary}15`,
                      },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={[styles.featureText, { color: colors.text }]}>
                      Garden
                    </Text>
                  </View>
                )}
                {property.features.garage && (
                  <View
                    style={[
                      styles.featureItem,
                      {
                        backgroundColor: colors.surface,
                        borderColor: `${colors.primary}15`,
                      },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={[styles.featureText, { color: colors.text }]}>
                      Garage
                    </Text>
                  </View>
                )}
                {property.features.elevator && (
                  <View
                    style={[
                      styles.featureItem,
                      {
                        backgroundColor: colors.surface,
                        borderColor: `${colors.primary}15`,
                      },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={[styles.featureText, { color: colors.text }]}>
                      Elevator
                    </Text>
                  </View>
                )}
                {property.features.swimmingPool && (
                  <View
                    style={[
                      styles.featureItem,
                      {
                        backgroundColor: colors.surface,
                        borderColor: `${colors.primary}15`,
                      },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={[styles.featureText, { color: colors.text }]}>
                      Swimming Pool
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

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
                style={[styles.description, { color: colors.text }]}
                numberOfLines={showFullDescription ? undefined : 4}
              >
                {property.description}
              </Text>
              {property.description.length > 150 && (
                <TouchableOpacity
                  onPress={() => setShowFullDescription(!showFullDescription)}
                  style={[
                    styles.readMoreButton,
                    { borderTopColor: colors.divider },
                  ]}
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
                    styles.amenityItem,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.divider,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.amenityIconBg,
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

          {/* Image Gallery Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Photos & Media
              </Text>
              <TouchableOpacity
                onPress={() => {
                  router.push(`/property/${property.id}/gallery?tab=photos`);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.viewButton, { color: colors.primary }]}>
                  View All
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imageGalleryContainer}
            >
              {property.images.slice(0, 6).map((image, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.galleryImageWrapper,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.divider,
                    },
                  ]}
                  onPress={() => {
                    router.push(
                      `/property/${property.id}/gallery?tab=photos&index=${index}`
                    );
                  }}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: image }} style={styles.galleryImage} />
                  {index === 5 && property.images.length > 6 && (
                    <View style={styles.moreImagesOverlay}>
                      <Text style={styles.moreImagesText}>
                        +{property.images.length - 6}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.mediaButtonsRow}>
              <TouchableOpacity
                style={[
                  styles.mediaButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: `${colors.primary}30`,
                  },
                ]}
                onPress={() => {
                  router.push(`/property/${property.id}/gallery?tab=photos`);
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="camera-outline"
                  size={18}
                  color={colors.primary}
                />
                <Text
                  style={[styles.mediaButtonText, { color: colors.primary }]}
                >
                  {property.images.length} Photos
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.mediaButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: `${colors.primary}30`,
                  },
                ]}
                onPress={() => {
                  router.push(`/property/${property.id}/gallery?tab=videos`);
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="videocam-outline"
                  size={18}
                  color={colors.primary}
                />
                <Text
                  style={[styles.mediaButtonText, { color: colors.primary }]}
                >
                  3 Videos
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.mediaButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: `${colors.primary}30`,
                  },
                ]}
                onPress={() => {
                  router.push(`/property/${property.id}/360`);
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="cube-outline"
                  size={18}
                  color={colors.primary}
                />
                <Text
                  style={[styles.mediaButtonText, { color: colors.primary }]}
                >
                  360° View
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Location Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Location
              </Text>
              <TouchableOpacity
                onPress={() => {
                  // Navigate to full map view
                  const lat = property.latitude || 5.6037;
                  const lng = property.longitude || -0.187;
                  router.push(
                    `/(tabs)/map?propertyId=${property.id}&lat=${lat}&lng=${lng}`
                  );
                }}
              >
                <Text style={[styles.viewButton, { color: colors.primary }]}>
                  View
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[
                styles.mapPreview,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
              onPress={() => {
                const lat = property.latitude || 5.6037;
                const lng = property.longitude || -0.187;
                router.push(
                  `/(tabs)/map?propertyId=${property.id}&lat=${lat}&lng=${lng}`
                );
              }}
              activeOpacity={0.9}
            >
              {property.latitude && property.longitude ? (
                <MapView
                  provider={
                    Platform.OS === "android" ? PROVIDER_GOOGLE : undefined
                  }
                  style={styles.map}
                  initialRegion={{
                    latitude: property.latitude,
                    longitude: property.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  pitchEnabled={false}
                  rotateEnabled={false}
                  showsUserLocation={false}
                  showsBuildings={true}
                  mapType="standard"
                >
                  <Marker
                    coordinate={{
                      latitude: property.latitude,
                      longitude: property.longitude,
                    }}
                    title={property.title}
                    pinColor={Colors.primaryGreen}
                  />
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
                    Map Preview
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={[styles.addressText, { color: colors.textSecondary }]}>
              {property.address}
            </Text>
          </View>

          {/* Listed By Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Listed By
            </Text>
            <View
              style={[
                styles.ownerCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: `${colors.primary}20`,
                },
              ]}
            >
              <View style={styles.ownerAvatarContainer}>
                <Image
                  source={{ uri: property.owner.avatar }}
                  style={[
                    styles.ownerAvatar,
                    { borderColor: `${colors.primary}30` },
                  ]}
                />
                {property.owner.verified && (
                  <View
                    style={[
                      styles.verifiedBadge,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                  </View>
                )}
              </View>
              <View style={styles.ownerInfo}>
                <Text style={[styles.ownerName, { color: colors.text }]}>
                  {property.owner.name}
                </Text>
                {property.owner.verified && (
                  <View style={styles.verifiedTextRow}>
                    <Ionicons
                      name="shield-checkmark"
                      size={14}
                      color={colors.primary}
                    />
                    <Text
                      style={[styles.verifiedText, { color: colors.primary }]}
                    >
                      Verified Owner
                    </Text>
                  </View>
                )}
                <Text
                  style={[styles.memberSince, { color: colors.textSecondary }]}
                >
                  Member since {property.owner.memberSince}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  // TODO: Navigate to owner profile when implemented
                  console.log("Navigate to profile:", property.owner.id);
                }}
                style={[
                  styles.viewProfileButton,
                  { backgroundColor: `${colors.primary}15` },
                ]}
              >
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Fixed Action Buttons */}
        <View
          style={[
            styles.actionButtons,
            {
              paddingBottom: insets.bottom + Spacing.md,
              paddingTop: Spacing.md,
              backgroundColor: colors.surface,
              borderTopColor: colors.divider,
            },
          ]}
        >
          <TouchableOpacity
            onPress={handleCall}
            style={[
              styles.actionButton,
              styles.callButton,
              { backgroundColor: colors.primary },
            ]}
            activeOpacity={0.8}
          >
            <View style={styles.actionButtonIconBg}>
              <Ionicons name="call" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.callButtonText}>Call Now</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleChat}
            style={[
              styles.actionButton,
              styles.chatButton,
              { backgroundColor: colors.surface, borderColor: colors.primary },
            ]}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.chatButtonIconBg,
                { backgroundColor: `${colors.primary}15` },
              ]}
            >
              <Ionicons name="chatbubbles" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.chatButtonText, { color: colors.primary }]}>
              Message
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Options Bottom Sheet */}
      <BottomSheetModal
        ref={chatBottomSheetRef}
        index={0}
        snapPoints={chatSnapPoints}
        enablePanDownToClose
        onDismiss={() => {
          // Optional: handle dismiss if needed
        }}
        backdropComponent={renderChatBackdrop}
        backgroundStyle={[
          styles.chatBottomSheet,
          { backgroundColor: colors.surface },
        ]}
        handleIndicatorStyle={[
          styles.handleIndicator,
          { backgroundColor: colors.textSecondary },
        ]}
      >
        <BottomSheetView style={styles.chatSheetContent}>
          <Text style={[styles.chatSheetTitle, { color: colors.text }]}>
            Choose how to contact
          </Text>

          {/* In-App Chat Option */}
          <TouchableOpacity
            style={[
              styles.chatOption,
              { backgroundColor: colors.surface, borderColor: colors.primary },
            ]}
            onPress={handleChatInApp}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.chatOptionIcon,
                { backgroundColor: `${colors.primary}15` },
              ]}
            >
              <Ionicons name="chatbubbles" size={24} color={colors.primary} />
            </View>
            <View style={styles.chatOptionContent}>
              <Text style={[styles.chatOptionTitle, { color: colors.text }]}>
                Chat in-app
              </Text>
              <Text
                style={[
                  styles.chatOptionSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Send messages within the app
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.chatDivider}>
            <View
              style={[styles.dividerLine, { backgroundColor: colors.divider }]}
            />
            <Text style={[styles.dividerText, { color: colors.textSecondary }]}>
              Or use external apps
            </Text>
            <View
              style={[styles.dividerLine, { backgroundColor: colors.divider }]}
            />
          </View>

          {/* External Chat Apps */}
          <View style={styles.externalAppsContainer}>
            <TouchableOpacity
              style={[
                styles.externalAppOption,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
              onPress={() =>
                handleChatViaApp(
                  "whatsapp",
                  property.owner.phone || "+233123456789"
                )
              }
              activeOpacity={0.7}
            >
              <Ionicons name="logo-whatsapp" size={28} color="#25D366" />
              <Text style={[styles.externalAppText, { color: colors.text }]}>
                WhatsApp
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.externalAppOption,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
              onPress={() =>
                handleChatViaApp(
                  "telegram",
                  property.owner.phone || "+233123456789"
                )
              }
              activeOpacity={0.7}
            >
              <Ionicons name="paper-plane" size={28} color="#0088cc" />
              <Text style={[styles.externalAppText, { color: colors.text }]}>
                Telegram
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.externalAppOption,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
              onPress={() =>
                handleChatViaApp("sms", property.owner.phone || "+233123456789")
              }
              activeOpacity={0.7}
            >
              <Ionicons name="chatbubble" size={28} color={colors.primary} />
              <Text style={[styles.externalAppText, { color: colors.text }]}>
                SMS
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.externalAppOption,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
              onPress={() =>
                handleChatViaApp(
                  "call",
                  property.owner.phone || "+233123456789"
                )
              }
              activeOpacity={0.7}
            >
              <Ionicons name="call" size={28} color={colors.primary} />
              <Text style={[styles.externalAppText, { color: colors.text }]}>
                Call
              </Text>
            </TouchableOpacity>
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
  imageCarousel: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.5,
    position: "relative",
    marginTop: 0,
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
    backgroundColor: "transparent",
  },
  headerButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  headerButtonBackground: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerTitle: {
    ...Typography.headlineMedium,
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  headerActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: Spacing.xl,
  },
  carouselImage: {
    width: SCREEN_WIDTH,
    height: "100%",
  },
  imageCounter: {
    position: "absolute",
    top: Spacing.xl + 120,
    right: Spacing.lg,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backdropFilter: "blur(10px)",
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
  imageCounterText: {
    ...Typography.caption,
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  imageGradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: "transparent",
    // Creating gradient effect with multiple steps
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -60 },
        shadowOpacity: 0.5,
        shadowRadius: 30,
      },
      android: {},
    }),
  },
  imageDots: {
    position: "absolute",
    bottom: Spacing.lg,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  dotActive: {
    backgroundColor: "#FFFFFF",
    width: 28,
    borderColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#FFF",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {},
    }),
  },
  mediaBadges: {
    position: "absolute",
    bottom: Spacing.lg + 30,
    left: Spacing.lg,
    flexDirection: "row",
    gap: Spacing.sm,
  },
  mediaBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 16,
    gap: Spacing.xs / 2,
    backdropFilter: "blur(10px)",
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
  mediaBadgeText: {
    ...Typography.caption,
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  propertyInfo: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing["2xl"],
    paddingBottom: Spacing.xl,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  propertyTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    gap: Spacing.xs / 2,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.2)",
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  typeBadgeText: {
    ...Typography.labelMedium,
    fontSize: 13,
    color: Colors.primaryGreen,
    fontWeight: "700",
    textTransform: "capitalize",
    letterSpacing: 0.2,
  },
  transactionBadge: {
    backgroundColor: Colors.primaryGreen,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  rentBadge: {
    backgroundColor: "#6366F1",
  },
  transactionBadgeText: {
    ...Typography.labelMedium,
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  propertyTitle: {
    ...Typography.headlineMedium,
    fontSize: 28,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  propertyIdRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    gap: Spacing.xs,
  },
  propertyIdLabel: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  propertyIdText: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: "700",
    fontFamily: "monospace",
    letterSpacing: 0.5,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  locationText: {
    ...Typography.bodyMedium,
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  price: {
    ...Typography.headlineLarge,
    fontSize: 36,
    fontWeight: "900",
    color: Colors.primaryGreen,
    letterSpacing: -1,
  },
  negotiableBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  negotiableText: {
    ...Typography.labelMedium,
    fontSize: 13,
    color: Colors.primaryGreen,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  quickStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: Spacing.xl,
    marginBottom: Spacing["2xl"],
    gap: Spacing.md,
  },
  statCard: {
    width: "48%",
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: Spacing.lg,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(0, 0, 0, 0.05)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statValue: {
    ...Typography.headlineMedium,
    fontSize: 24,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    letterSpacing: -0.5,
  },
  statLabel: {
    ...Typography.caption,
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  section: {
    paddingHorizontal: Spacing.xl,
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
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    letterSpacing: -0.3,
  },
  viewButton: {
    ...Typography.labelMedium,
    fontSize: 14,
    color: Colors.primaryGreen,
    fontWeight: "600",
  },
  descriptionCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  description: {
    ...Typography.bodyMedium,
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 26,
    fontWeight: "400",
  },
  readMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  readMoreText: {
    ...Typography.labelMedium,
    fontSize: 14,
    color: Colors.primaryGreen,
    fontWeight: "700",
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  amenityIconBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  amenityText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  detailsGrid: {
    gap: Spacing.md,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: 20,
    gap: Spacing.lg,
    borderWidth: 1.5,
    borderColor: "rgba(0, 0, 0, 0.05)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    ...Typography.titleMedium,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    width: "48%",
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(34, 197, 94, 0.1)",
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  featureText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textPrimary,
    flex: 1,
    fontWeight: "600",
  },
  imageGalleryContainer: {
    gap: Spacing.md,
    paddingRight: Spacing.xl,
  },
  galleryImageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: "rgba(0, 0, 0, 0.05)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  galleryImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  moreImagesOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  moreImagesText: {
    ...Typography.headlineMedium,
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  mediaButtonsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  mediaButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(34, 197, 94, 0.2)",
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  mediaButtonText: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
  mapPreview: {
    height: 240,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: "rgba(0, 0, 0, 0.05)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
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
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mapPlaceholderText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  addressText: {
    ...Typography.bodyMedium,
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: "500",
    lineHeight: 22,
  },
  ownerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: "rgba(34, 197, 94, 0.15)",
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  ownerAvatarContainer: {
    position: "relative",
    marginRight: Spacing.md,
  },
  ownerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: Colors.primaryLight,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primaryGreen,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    ...Typography.titleMedium,
    fontSize: 17,
    fontWeight: "700",
    color: Colors.textPrimary,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  verifiedTextRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  verifiedText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.primaryGreen,
    fontWeight: "600",
  },
  memberSince: {
    ...Typography.bodyMedium,
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "500",
    marginTop: 2,
  },
  viewProfileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  actionButtons: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md + 2,
    borderRadius: 16,
  },
  callButton: {
    backgroundColor: Colors.primaryGreen,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  chatButton: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.primaryGreen,
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
  actionButtonIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  chatButtonIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  callButtonText: {
    ...Typography.labelLarge,
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  chatButtonText: {
    ...Typography.labelLarge,
    fontSize: 15,
    fontWeight: "700",
    color: Colors.primaryGreen,
    letterSpacing: 0.3,
  },
  chatBottomSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: Colors.divider,
    width: 40,
    height: 4,
  },
  chatSheetContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  chatSheetTitle: {
    ...Typography.titleLarge,
    fontSize: 22,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: Spacing.xl,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  chatOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.primaryGreen,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  chatOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  chatOptionContent: {
    flex: 1,
  },
  chatOptionTitle: {
    ...Typography.titleMedium,
    fontSize: 17,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs / 2,
  },
  chatOptionSubtitle: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  chatDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.lg,
    gap: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.divider,
  },
  dividerText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  externalAppsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
    gap: Spacing.xs,
    width: "100%",
  },
  externalAppOption: {
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    padding: Spacing.sm,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.divider,
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
  externalAppText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
});
