import React, { useState, useRef } from "react";
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
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Typography, Spacing } from "@/constants/design";

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
  };
  transactionType: "buy" | "rent";
}

// Mock data - replace with actual API call
const MOCK_PROPERTY: Property = {
  id: "1",
  title: "4 Bedroom House in East Legon",
  location: "East Legon, Accra",
  price: 850000,
  images: [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
  ],
  bedrooms: 4,
  bathrooms: 3,
  plotSize: 2,
  description:
    "Beautiful modern 4-bedroom house located in the prestigious East Legon area. This stunning property features spacious rooms, modern finishes, and a well-maintained garden. Perfect for families looking for comfort and style in a prime location.",
  amenities: ["Water", "Electricity", "Security", "Parking", "Internet"],
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
  },
  transactionType: "buy",
};

export default function PropertyDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // const params = useLocalSearchParams(); // Will be used to fetch property by ID

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // In a real app, fetch property by ID
  const property = MOCK_PROPERTY;

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
    Linking.openURL(`tel:+233123456789`);
  };

  const handleChat = () => {
    // In a real app, check subscription first
    // TODO: Navigate to chat screen when implemented
    console.log("Navigate to chat with:", property.owner.id);
  };

  const handleImageScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentImageIndex(index);
  };

  return (
    <>
      <StatusBar style="light" />
      <View style={styles.container}>
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
              renderItem={({ item }) => (
                <Image source={{ uri: item }} style={styles.carouselImage} />
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
                <View style={styles.headerButtonBackground}>
                  <Ionicons
                    name="arrow-back"
                    size={22}
                    color={Colors.textPrimary}
                  />
                </View>
              </TouchableOpacity>

              <Text style={styles.headerTitle}>Property</Text>

              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={handleShare}
                  style={styles.headerButton}
                  activeOpacity={0.7}
                >
                  <View style={styles.headerButtonBackground}>
                    <Ionicons
                      name="share-outline"
                      size={22}
                      color={Colors.textPrimary}
                    />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsSaved(!isSaved)}
                  style={styles.headerButton}
                  activeOpacity={0.7}
                >
                  <View style={styles.headerButtonBackground}>
                    <Ionicons
                      name={isSaved ? "heart" : "heart-outline"}
                      size={22}
                      color={isSaved ? "#FF3B30" : Colors.textPrimary}
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
              <View style={styles.mediaBadge}>
                <Ionicons name="camera-outline" size={14} color="#FFFFFF" />
                <Text style={styles.mediaBadgeText}>
                  {property.images.length}
                </Text>
              </View>
              <View style={styles.mediaBadge}>
                <Ionicons name="videocam-outline" size={14} color="#FFFFFF" />
                <Text style={styles.mediaBadgeText}>3</Text>
              </View>
              <View style={styles.mediaBadge}>
                <Ionicons name="cube-outline" size={14} color="#FFFFFF" />
                <Text style={styles.mediaBadgeText}>360°</Text>
              </View>
            </View>
          </View>

          {/* Property Info */}
          <View style={styles.propertyInfo}>
            <Text style={styles.propertyTitle}>{property.title}</Text>
            <View style={styles.locationRow}>
              <Ionicons
                name="location-outline"
                size={16}
                color={Colors.textSecondary}
              />
              <Text style={styles.locationText}>{property.location}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{formatPrice(property.price)}</Text>
              {property.negotiable && (
                <View style={styles.negotiableBadge}>
                  <Text style={styles.negotiableText}>Negotiable</Text>
                </View>
              )}
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.statCard}>
              <Ionicons
                name="bed-outline"
                size={24}
                color={Colors.primaryGreen}
              />
              <Text style={styles.statValue}>{property.bedrooms}</Text>
              <Text style={styles.statLabel}>Beds</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons
                name="water-outline"
                size={24}
                color={Colors.primaryGreen}
              />
              <Text style={styles.statValue}>{property.bathrooms}</Text>
              <Text style={styles.statLabel}>Baths</Text>
            </View>
            {property.plotSize && (
              <View style={styles.statCard}>
                <Ionicons
                  name="resize-outline"
                  size={24}
                  color={Colors.primaryGreen}
                />
                <Text style={styles.statValue}>{property.plotSize}</Text>
                <Text style={styles.statLabel}>Plot Size</Text>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text
              style={styles.description}
              numberOfLines={showFullDescription ? undefined : 3}
            >
              {property.description}
            </Text>
            {property.description.length > 150 && (
              <TouchableOpacity
                onPress={() => setShowFullDescription(!showFullDescription)}
                style={styles.readMoreButton}
              >
                <Text style={styles.readMoreText}>
                  {showFullDescription ? "Read Less" : "Read More"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Amenities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {property.amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityItem}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={Colors.primaryGreen}
                  />
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Location Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Location</Text>
              <TouchableOpacity
                onPress={() => {
                  // Navigate to full map view
                  router.push(`/map?property=${property.id}`);
                }}
              >
                <Text style={styles.viewButton}>View</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.mapPreview}>
              <View style={styles.mapPlaceholder}>
                <Ionicons
                  name="map-outline"
                  size={48}
                  color={Colors.textSecondary}
                />
                <Text style={styles.mapPlaceholderText}>Map Preview</Text>
              </View>
            </View>
            <Text style={styles.addressText}>{property.address}</Text>
          </View>

          {/* Listed By Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Listed By</Text>
            <View style={styles.ownerCard}>
              <Image
                source={{ uri: property.owner.avatar }}
                style={styles.ownerAvatar}
              />
              <View style={styles.ownerInfo}>
                <View style={styles.ownerNameRow}>
                  <Text style={styles.ownerName}>{property.owner.name}</Text>
                  {property.owner.verified && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={Colors.primaryGreen}
                    />
                  )}
                </View>
                <Text style={styles.memberSince}>
                  Member since {property.owner.memberSince}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  // TODO: Navigate to owner profile when implemented
                  console.log("Navigate to profile:", property.owner.id);
                }}
                style={styles.viewProfileButton}
              >
                <Text style={styles.viewProfileText}>View Profile</Text>
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
            },
          ]}
        >
          <TouchableOpacity
            onPress={handleCall}
            style={[styles.actionButton, styles.callButton]}
            activeOpacity={0.8}
          >
            <Ionicons name="call-outline" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleChat}
            style={[styles.actionButton, styles.chatButton]}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Chat</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  dotActive: {
    backgroundColor: "#FFFFFF",
    width: 24,
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
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  propertyTitle: {
    ...Typography.headlineMedium,
    fontSize: 26,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    lineHeight: 32,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  locationText: {
    ...Typography.bodyMedium,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  price: {
    ...Typography.headlineLarge,
    fontSize: 32,
    fontWeight: "800",
    color: Colors.primaryGreen,
    letterSpacing: -0.5,
  },
  negotiableBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  negotiableText: {
    ...Typography.labelMedium,
    fontSize: 12,
    color: Colors.primaryGreen,
    fontWeight: "600",
  },
  quickStats: {
    flexDirection: "row",
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.divider,
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
  statValue: {
    ...Typography.headlineMedium,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  statLabel: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: Spacing.xs / 2,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing["2xl"],
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.titleLarge,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  viewButton: {
    ...Typography.labelMedium,
    fontSize: 14,
    color: Colors.primaryGreen,
    fontWeight: "600",
  },
  description: {
    ...Typography.bodyMedium,
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  readMoreButton: {
    marginTop: Spacing.sm,
  },
  readMoreText: {
    ...Typography.labelMedium,
    fontSize: 14,
    color: Colors.primaryGreen,
    fontWeight: "600",
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    width: "48%",
  },
  amenityText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  mapPreview: {
    height: 220,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
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
    fontSize: 14,
    color: Colors.textSecondary,
  },
  ownerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.divider,
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
  ownerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: Spacing.md,
  },
  ownerInfo: {
    flex: 1,
  },
  ownerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.xs / 2,
  },
  ownerName: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  memberSince: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  viewProfileButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primaryGreen,
  },
  viewProfileText: {
    ...Typography.labelMedium,
    fontSize: 14,
    color: Colors.primaryGreen,
    fontWeight: "600",
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
    backgroundColor: Colors.primaryGreen,
    paddingVertical: Spacing.lg,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  callButton: {
    backgroundColor: Colors.primaryGreen,
  },
  chatButton: {
    backgroundColor: Colors.primaryGreen,
  },
  actionButtonText: {
    ...Typography.labelLarge,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
