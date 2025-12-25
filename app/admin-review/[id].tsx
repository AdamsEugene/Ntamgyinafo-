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
  Alert,
  FlatList,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { Typography, Spacing } from "@/constants/design";
import { useTheme } from "@/contexts/ThemeContext";
import { FloatingHeader } from "@/components/FloatingHeader";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface PropertyDocument {
  id: string;
  name: string;
  type: "pdf" | "image" | "certificate";
  url: string;
  verified: boolean;
  previewImage: string;
  uploadedAt: string;
  fileSize: string;
}

interface PropertyOwner {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  isVerified: boolean;
  totalListings: number;
  joinedDate: string;
}

// Mock property data for review
const MOCK_PROPERTY = {
  id: "p1",
  title: "4 Bedroom House in East Legon",
  description:
    "Beautiful 4 bedroom house with modern finishes, spacious living areas, and a well-maintained garden. The property features a large master bedroom with en-suite bathroom, fitted kitchen with modern appliances, and a separate laundry area. Located in a quiet neighborhood with easy access to schools, shopping centers, and major roads.",
  type: "house" as const,
  transactionType: "sale" as const,
  price: 850000,
  currency: "₵",
  location: "East Legon, Accra",
  address: "15 Boundary Road, East Legon, Greater Accra Region",
  coordinates: { lat: 5.6355, lng: -0.1523 },
  bedrooms: 4,
  bathrooms: 3,
  area: 3500,
  areaUnit: "sqft",
  yearBuilt: 2020,
  parkingSpaces: 2,
  amenities: [
    "Swimming Pool",
    "24/7 Security",
    "Backup Generator",
    "Air Conditioning",
    "Fitted Kitchen",
    "Garden",
    "Boys Quarters",
    "CCTV",
  ],
  images: [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
  ],
  videos: [
    {
      id: "v1",
      thumbnail:
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop",
      duration: "2:30",
    },
  ],
  virtualTour: true,
  documents: [
    {
      id: "d1",
      name: "Land Title Certificate",
      type: "certificate" as const,
      url: "#",
      verified: true,
      previewImage:
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=1000&fit=crop",
      uploadedAt: "Dec 20, 2024",
      fileSize: "2.4 MB",
    },
    {
      id: "d2",
      name: "Building Permit",
      type: "pdf" as const,
      url: "#",
      verified: true,
      previewImage:
        "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=1000&fit=crop",
      uploadedAt: "Dec 20, 2024",
      fileSize: "1.8 MB",
    },
    {
      id: "d3",
      name: "Property Survey Plan",
      type: "pdf" as const,
      url: "#",
      verified: false,
      previewImage:
        "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=1000&fit=crop",
      uploadedAt: "Dec 21, 2024",
      fileSize: "3.2 MB",
    },
    {
      id: "d4",
      name: "Tax Clearance Certificate",
      type: "certificate" as const,
      url: "#",
      verified: false,
      previewImage:
        "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&h=1000&fit=crop",
      uploadedAt: "Dec 21, 2024",
      fileSize: "1.1 MB",
    },
  ] as PropertyDocument[],
  owner: {
    id: "u1",
    name: "Kofi Mensah",
    avatar: "https://i.pravatar.cc/150?img=11",
    phone: "+233 24 123 4567",
    email: "kofi.mensah@email.com",
    isVerified: true,
    totalListings: 5,
    joinedDate: "Jan 2023",
  } as PropertyOwner,
  submittedAt: "Dec 22, 2024 at 2:30 PM",
  status: "pending" as const,
  negotiable: true,
};

const REJECTION_REASONS = [
  "Incomplete or missing property documents",
  "Poor quality images (blurry, dark, insufficient)",
  "Inaccurate or misleading property information",
  "Price seems unrealistic for the market",
  "Duplicate listing detected",
  "Property already listed by another user",
  "Insufficient property details",
  "Other (please specify)",
];

export default function AdminPropertyReviewScreen() {
  const router = useRouter();
  useLocalSearchParams(); // id available for API call
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const rejectSheetRef = useRef<BottomSheetModal>(null);
  const documentPreviewRef = useRef<BottomSheetModal>(null);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customReason, setCustomReason] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [selectedDocument, setSelectedDocument] =
    useState<PropertyDocument | null>(null);
  const [isVerifyingDoc, setIsVerifyingDoc] = useState(false);

  const property = MOCK_PROPERTY;

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

  const handleApprove = () => {
    Alert.alert(
      "Approve Listing",
      "Are you sure you want to approve this property listing? It will be published immediately.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: () => {
            setIsApproving(true);
            // Simulate API call
            setTimeout(() => {
              setIsApproving(false);
              Alert.alert(
                "Success",
                "Property listing has been approved and is now live.",
                [{ text: "OK", onPress: () => router.back() }]
              );
            }, 1500);
          },
        },
      ]
    );
  };

  const handleReject = () => {
    if (!selectedReason) {
      Alert.alert("Error", "Please select a reason for rejection.");
      return;
    }

    // Determine the rejection reason for API
    if (selectedReason === "Other (please specify)" && !customReason.trim()) {
      Alert.alert("Error", "Please provide a reason for rejection.");
      return;
    }

    // API would use: selectedReason === "Other (please specify)" ? customReason : selectedReason
    setIsRejecting(true);
    // Simulate API call
    setTimeout(() => {
      setIsRejecting(false);
      rejectSheetRef.current?.dismiss();
      Alert.alert(
        "Listing Rejected",
        "The property owner has been notified with the rejection reason.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    }, 1500);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${property.currency}${(price / 1000000).toFixed(2)}M`;
    }
    return `${property.currency}${price.toLocaleString()}`;
  };

  const getDocIcon = (type: PropertyDocument["type"]) => {
    switch (type) {
      case "pdf":
        return "document-text";
      case "image":
        return "image";
      case "certificate":
        return "ribbon";
      default:
        return "document";
    }
  };

  const handleDocumentPress = (doc: PropertyDocument) => {
    setSelectedDocument(doc);
    documentPreviewRef.current?.present();
  };

  const handleVerifyDocument = () => {
    if (!selectedDocument) return;

    Alert.alert(
      "Verify Document",
      `Are you sure you want to mark "${selectedDocument.name}" as verified?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Verify",
          onPress: () => {
            setIsVerifyingDoc(true);
            // Simulate API call
            setTimeout(() => {
              setIsVerifyingDoc(false);
              documentPreviewRef.current?.dismiss();
              Alert.alert("Success", "Document has been verified.");
            }, 1000);
          },
        },
      ]
    );
  };

  const handleRejectDocument = () => {
    if (!selectedDocument) return;

    Alert.alert(
      "Reject Document",
      `Are you sure you want to reject "${selectedDocument.name}"? The owner will be notified to upload a new document.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: () => {
            documentPreviewRef.current?.dismiss();
            Alert.alert(
              "Document Rejected",
              "The property owner has been notified."
            );
          },
        },
      ]
    );
  };

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Decorative Background Elements */}
        <View style={styles.decorativeBackground}>
          <View
            style={[
              styles.circle1,
              { backgroundColor: colors.primary, opacity: 0.08 },
            ]}
          />
          <View
            style={[
              styles.circle2,
              { backgroundColor: colors.primary, opacity: 0.05 },
            ]}
          />
        </View>

        {/* Floating Sticky Header */}
        {/* Floating Header with Blur */}
        <FloatingHeader
          title="Review Property"
          showBackButton
          onBackPress={() => router.back()}
          rightContent={
            <View style={styles.pendingBadge}>
              <Ionicons name="time" size={14} color="#F59E0B" />
              <Text style={styles.pendingBadgeText}>Pending Review</Text>
            </View>
          }
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: 80 + insets.top,
              paddingBottom: 180 + insets.bottom,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Image Gallery */}
          <View style={styles.imageGallery}>
            <FlatList
              data={property.images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(
                  e.nativeEvent.contentOffset.x /
                    (SCREEN_WIDTH - Spacing.lg * 2)
                );
                setActiveImageIndex(index);
              }}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => {
                    router.push(`/property/1/gallery?index=${index}`);
                  }}
                >
                  <Image
                    source={{ uri: item }}
                    style={styles.galleryImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
            <View style={styles.imagePagination}>
              {property.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    activeImageIndex === index && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
            {/* Media Badges */}
            <View style={styles.mediaBadges}>
              <TouchableOpacity
                style={styles.mediaBadge}
                onPress={() => {
                  router.push(`/property/1/gallery?tab=photos`);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="images-outline" size={14} color="#FFFFFF" />
                <Text style={styles.mediaBadgeText}>
                  {property.images.length}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.mediaBadge}
                onPress={() => {
                  router.push(`/property/1/gallery?tab=videos`);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="videocam-outline" size={14} color="#FFFFFF" />
                <Text style={styles.mediaBadgeText}>
                  {property.videos.length}
                </Text>
              </TouchableOpacity>
              {property.virtualTour && (
                <TouchableOpacity
                  style={styles.mediaBadge}
                  onPress={() => {
                    router.push(`/property/1/360`);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="cube-outline" size={14} color="#FFFFFF" />
                  <Text style={styles.mediaBadgeText}>360°</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.imageCount}>
              <Ionicons name="images" size={14} color="#FFFFFF" />
              <Text style={styles.imageCountText}>
                {activeImageIndex + 1}/{property.images.length}
              </Text>
            </View>
          </View>

          {/* Property Title & Price */}
          <View style={styles.titleSection}>
            <View style={[styles.typeTag, { backgroundColor: colors.primary }]}>
              <Text style={styles.typeTagText}>
                For {property.transactionType === "sale" ? "Sale" : "Rent"}
              </Text>
            </View>
            <Text style={[styles.propertyTitle, { color: colors.text }]}>
              {property.title}
            </Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color={colors.primary} />
              <Text style={[styles.locationText, { color: colors.textSecondary }]}>
                {property.location}
              </Text>
            </View>
            <Text style={[styles.priceText, { color: colors.primary }]}>
              {formatPrice(property.price)}
            </Text>
            {property.negotiable && (
              <Text style={[styles.negotiableText, { color: colors.textSecondary }]}>
                Price is negotiable
              </Text>
            )}
          </View>

          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="bed-outline" size={22} color={colors.primary} />
              <Text style={styles.statValue}>{property.bedrooms}</Text>
              <Text style={styles.statLabel}>Beds</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="water-outline" size={22} color={colors.primary} />
              <Text style={styles.statValue}>{property.bathrooms}</Text>
              <Text style={styles.statLabel}>Baths</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons
                name="expand-outline"
                size={22}
                color={colors.primary}
              />
              <Text style={styles.statValue}>
                {property.area.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>{property.areaUnit}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="car-outline" size={22} color={colors.primary} />
              <Text style={styles.statValue}>{property.parkingSpaces}</Text>
              <Text style={styles.statLabel}>Parking</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Description
            </Text>
            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
            >
              <Text style={[styles.descriptionText, { color: colors.text }]}>
                {property.description}
              </Text>
            </View>
          </View>

          {/* Property Details */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Property Details
            </Text>
            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
            >
              <View
                style={[
                  styles.detailRow,
                  { borderBottomColor: colors.divider },
                ]}
              >
                <Text
                  style={[styles.detailLabel, { color: colors.textSecondary }]}
                >
                  Property Type
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {property.type.charAt(0).toUpperCase() +
                    property.type.slice(1)}
                </Text>
              </View>
              <View
                style={[
                  styles.detailRow,
                  { borderBottomColor: colors.divider },
                ]}
              >
                <Text
                  style={[styles.detailLabel, { color: colors.textSecondary }]}
                >
                  Year Built
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {property.yearBuilt}
                </Text>
              </View>
              <View
                style={[
                  styles.detailRow,
                  { borderBottomColor: colors.divider },
                ]}
              >
                <Text
                  style={[styles.detailLabel, { color: colors.textSecondary }]}
                >
                  Full Address
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {property.address}
                </Text>
              </View>
              <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                <Text
                  style={[styles.detailLabel, { color: colors.textSecondary }]}
                >
                  Submitted
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {property.submittedAt}
                </Text>
              </View>
            </View>
          </View>

          {/* Amenities */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Amenities
            </Text>
            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
            >
              <View style={styles.amenitiesGrid}>
                {property.amenities.map((amenity, index) => (
                  <View key={index} style={styles.amenityItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={colors.primary}
                    />
                    <Text style={[styles.amenityText, { color: colors.text }]}>
                      {amenity}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Videos */}
          {property.videos.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Videos
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {property.videos.map((video, index) => (
                  <TouchableOpacity
                    key={video.id}
                    style={styles.videoThumbnail}
                    onPress={() => {
                      router.push(`/property/1/video?index=${index}`);
                    }}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: video.thumbnail }}
                      style={styles.videoImage}
                    />
                    <View style={styles.videoPlayButton}>
                      <Ionicons name="play" size={24} color="#FFFFFF" />
                    </View>
                    <View style={styles.videoDuration}>
                      <Text style={styles.videoDurationText}>
                        {video.duration}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {property.virtualTour && (
                <TouchableOpacity
                  style={styles.virtualTourButton}
                  onPress={() => {
                    router.push(`/property/1/360`);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="cube-outline"
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={styles.virtualTourText}>
                    360° Virtual Tour Available
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Documents */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Documents
              </Text>
              <View style={styles.docStats}>
                <Text
                  style={[styles.docStatsText, { color: colors.textSecondary }]}
                >
                  {property.documents.filter((d) => d.verified).length}/
                  {property.documents.length} Verified
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
            >
              {property.documents.map((doc, index) => (
                <TouchableOpacity
                  key={doc.id}
                  style={[
                    styles.documentRow,
                    { borderBottomColor: colors.divider },
                    index === property.documents.length - 1 && {
                      borderBottomWidth: 0,
                    },
                  ]}
                  onPress={() => handleDocumentPress(doc)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.documentIcon,
                      {
                        backgroundColor: doc.verified
                          ? `${colors.primary}15`
                          : isDark
                          ? "#78350F"
                          : "#FEF3C7",
                      },
                    ]}
                  >
                    <Ionicons
                      name={getDocIcon(doc.type) as any}
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.documentInfo}>
                    <Text style={[styles.documentName, { color: colors.text }]}>
                      {doc.name}
                    </Text>
                    <View style={styles.documentStatus}>
                      <Ionicons
                        name={doc.verified ? "checkmark-circle" : "time"}
                        size={14}
                        color={doc.verified ? colors.primary : "#F59E0B"}
                      />
                      <Text
                        style={[
                          styles.documentStatusText,
                          {
                            color: doc.verified ? colors.primary : "#F59E0B",
                          },
                        ]}
                      >
                        {doc.verified ? "Verified" : "Pending Verification"}
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name="eye-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Owner Information */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Property Owner
            </Text>
            <View
              style={[
                styles.ownerCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
            >
              <Image
                source={{ uri: property.owner.avatar }}
                style={[styles.ownerAvatar, { borderColor: colors.divider }]}
              />
              <View style={styles.ownerInfo}>
                <View style={styles.ownerNameRow}>
                  <Text style={[styles.ownerName, { color: colors.text }]}>
                    {property.owner.name}
                  </Text>
                  {property.owner.isVerified && (
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={colors.primary}
                    />
                  )}
                </View>
                <Text
                  style={[styles.ownerMeta, { color: colors.textSecondary }]}
                >
                  {property.owner.totalListings} listings • Joined{" "}
                  {property.owner.joinedDate}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.ownerViewButton,
                  { backgroundColor: colors.background },
                ]}
              >
                <Text
                  style={[
                    styles.ownerViewButtonText,
                    { color: colors.primary },
                  ]}
                >
                  View Profile
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.ownerContactCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
            >
              <View style={styles.ownerContactRow}>
                <Ionicons
                  name="call-outline"
                  size={18}
                  color={colors.textSecondary}
                />
                <Text style={[styles.ownerContactText, { color: colors.text }]}>
                  {property.owner.phone}
                </Text>
              </View>
              <View style={styles.ownerContactRow}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={colors.textSecondary}
                />
                <Text style={[styles.ownerContactText, { color: colors.text }]}>
                  {property.owner.email}
                </Text>
              </View>
            </View>
          </View>

          {/* Review Notes */}
          <View
            style={[
              styles.reviewNotesCard,
              {
                backgroundColor: isDark ? "#1E3A8A" : "#DBEAFE",
                borderColor: "#3B82F6",
              },
            ]}
          >
            <Ionicons name="information-circle" size={22} color="#3B82F6" />
            <View style={styles.reviewNotesContent}>
              <Text style={[styles.reviewNotesTitle, { color: "#3B82F6" }]}>
                Review Checklist
              </Text>
              <Text
                style={[
                  styles.reviewNotesText,
                  { color: isDark ? "#DBEAFE" : "#1E3A8A" },
                ]}
              >
                • Verify all images are clear and genuine{"\n"}• Check document
                authenticity{"\n"}• Confirm pricing is market-appropriate{"\n"}•
                Validate property details accuracy
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Fixed Action Bar */}
        <View
          style={[
            styles.actionBar,
            {
              paddingBottom: insets.bottom + Spacing.md,
              backgroundColor: colors.surface,
              borderTopColor: colors.divider,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.rejectButton,
              {
                backgroundColor: isDark ? "#7F1D1D" : "#FEE2E2",
              },
            ]}
            onPress={() => rejectSheetRef.current?.present()}
            activeOpacity={0.8}
            disabled={isApproving}
          >
            <Ionicons name="close-circle" size={22} color="#EF4444" />
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.approveButton,
              { backgroundColor: colors.primary },
              isApproving && {
                backgroundColor: colors.divider,
              },
            ]}
            onPress={handleApprove}
            activeOpacity={0.8}
            disabled={isApproving}
          >
            {isApproving ? (
              <Text style={styles.approveButtonText}>Approving...</Text>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
                <Text style={styles.approveButtonText}>Approve Listing</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Rejection Reason Bottom Sheet */}
        <BottomSheetModal
          ref={rejectSheetRef}
          index={0}
          snapPoints={["75%"]}
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={{ backgroundColor: colors.divider }}
          backgroundStyle={{ backgroundColor: colors.surface }}
        >
          <BottomSheetView
            style={[styles.rejectSheetContent, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.rejectSheetTitle, { color: colors.text }]}>
              Reject Listing
            </Text>
            <Text style={[styles.rejectSheetSubtitle, { color: colors.textSecondary }]}>
              Select a reason for rejection. The property owner will be
              notified.
            </Text>

            <ScrollView
              style={styles.reasonsList}
              showsVerticalScrollIndicator={false}
            >
              {REJECTION_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[
                    styles.reasonOption,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.divider,
                    },
                    selectedReason === reason && {
                      borderColor: colors.primary,
                      backgroundColor: `${colors.primary}08`,
                    },
                  ]}
                  onPress={() => setSelectedReason(reason)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={
                      selectedReason === reason
                        ? "radio-button-on"
                        : "radio-button-off"
                    }
                    size={22}
                    color={
                      selectedReason === reason
                        ? colors.primary
                        : colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.reasonText,
                      { color: colors.textSecondary },
                      selectedReason === reason && {
                        color: colors.text,
                        fontWeight: "600",
                      },
                    ]}
                  >
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}

              {selectedReason === "Other (please specify)" && (
                <BottomSheetTextInput
                  style={[
                    styles.customReasonInput,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.divider,
                      color: colors.text,
                    },
                  ]}
                  placeholder="Enter reason for rejection..."
                  placeholderTextColor={colors.textSecondary}
                  value={customReason}
                  onChangeText={setCustomReason}
                  multiline
                  numberOfLines={3}
                />
              )}
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.confirmRejectButton,
                {
                  backgroundColor: colors.error,
                },
                (!selectedReason || isRejecting) && {
                  backgroundColor: colors.divider,
                },
              ]}
              onPress={handleReject}
              disabled={!selectedReason || isRejecting}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmRejectButtonText}>
                {isRejecting ? "Rejecting..." : "Confirm Rejection"}
              </Text>
            </TouchableOpacity>
          </BottomSheetView>
        </BottomSheetModal>

        {/* Document Preview Bottom Sheet */}
        <BottomSheetModal
          ref={documentPreviewRef}
          index={0}
          snapPoints={["90%"]}
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={{ backgroundColor: colors.divider }}
          backgroundStyle={{ backgroundColor: colors.surface }}
        >
          <BottomSheetView
            style={[
              styles.docPreviewContainer,
              { backgroundColor: colors.surface },
            ]}
          >
            {selectedDocument && (
              <>
                {/* Document Header */}
                <View style={styles.docPreviewHeader}>
                  <View style={styles.docPreviewTitleRow}>
                    <View style={styles.docPreviewIconContainer}>
                      <Ionicons
                        name={getDocIcon(selectedDocument.type) as any}
                        size={24}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.docPreviewTitleInfo}>
                      <Text style={[styles.docPreviewTitle, { color: colors.text }]}>
                        {selectedDocument.name}
                      </Text>
                      <View style={styles.docPreviewMeta}>
                        <Text
                          style={[
                            styles.docPreviewMetaText,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {selectedDocument.fileSize}
                        </Text>
                        <View
                          style={[
                            styles.docPreviewMetaDot,
                            { backgroundColor: colors.divider },
                          ]}
                        />
                        <Text
                          style={[
                            styles.docPreviewMetaText,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {selectedDocument.uploadedAt}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.docPreviewStatusBadge,
                      {
                        backgroundColor: selectedDocument.verified
                          ? `${colors.primary}15`
                          : isDark
                          ? "#78350F"
                          : "#FEF3C7",
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        selectedDocument.verified ? "checkmark-circle" : "time"
                      }
                      size={16}
                      color={
                        selectedDocument.verified ? colors.primary : "#F59E0B"
                      }
                    />
                    <Text
                      style={[
                        styles.docPreviewStatusText,
                        {
                          color: selectedDocument.verified
                            ? colors.primary
                            : "#F59E0B",
                        },
                      ]}
                    >
                      {selectedDocument.verified ? "Verified" : "Pending"}
                    </Text>
                  </View>
                </View>

                {/* Document Preview Image */}
                <View style={styles.docPreviewImageContainer}>
                  <Image
                    source={{ uri: selectedDocument.previewImage }}
                    style={styles.docPreviewImage}
                    resizeMode="contain"
                  />
                  <View style={styles.docPreviewOverlay}>
                    <TouchableOpacity style={styles.docPreviewZoomButton}>
                      <Ionicons
                        name="expand-outline"
                        size={24}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Document Info */}
                <View style={styles.docPreviewInfoCard}>
                  <View style={styles.docPreviewInfoRow}>
                    <Text style={styles.docPreviewInfoLabel}>
                      Document Type
                    </Text>
                    <Text style={styles.docPreviewInfoValue}>
                      {selectedDocument.type === "pdf"
                        ? "PDF Document"
                        : selectedDocument.type === "certificate"
                        ? "Certificate"
                        : "Image"}
                    </Text>
                  </View>
                  <View style={styles.docPreviewInfoRow}>
                    <Text style={styles.docPreviewInfoLabel}>File Size</Text>
                    <Text style={styles.docPreviewInfoValue}>
                      {selectedDocument.fileSize}
                    </Text>
                  </View>
                  <View
                    style={[styles.docPreviewInfoRow, { borderBottomWidth: 0 }]}
                  >
                    <Text style={styles.docPreviewInfoLabel}>Uploaded</Text>
                    <Text style={styles.docPreviewInfoValue}>
                      {selectedDocument.uploadedAt}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.docPreviewActions}>
                  <TouchableOpacity
                    style={styles.docPreviewDownloadButton}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="download-outline"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.docPreviewDownloadText}>Download</Text>
                  </TouchableOpacity>

                  {!selectedDocument.verified ? (
                    <View style={styles.docPreviewVerifyActions}>
                      <TouchableOpacity
                        style={styles.docPreviewRejectButton}
                        onPress={handleRejectDocument}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="close-circle"
                          size={20}
                          color="#EF4444"
                        />
                        <Text style={styles.docPreviewRejectText}>Reject</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.docPreviewVerifyButton,
                          {
                            backgroundColor: colors.primary,
                          },
                          isVerifyingDoc && {
                            backgroundColor: colors.divider,
                          },
                        ]}
                        onPress={handleVerifyDocument}
                        disabled={isVerifyingDoc}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#FFFFFF"
                        />
                        <Text style={styles.docPreviewVerifyText}>
                          {isVerifyingDoc ? "Verifying..." : "Verify Document"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.docVerifiedBanner,
                        {
                          backgroundColor: `${colors.primary}15`,
                        },
                      ]}
                    >
                      <Ionicons
                        name="shield-checkmark"
                        size={22}
                        color={colors.primary}
                      />
                      <Text
                        style={[styles.docVerifiedText, { color: colors.primary }]}
                      >
                        This document has been verified
                      </Text>
                    </View>
                  )}
                </View>
              </>
            )}
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
  },
  circle2: {
    position: "absolute",
    bottom: -150,
    left: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
  },
  // Header
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  headerTitleText: {
    ...Typography.titleLarge,
    fontSize: 18,
    fontWeight: "700",
  },
  pendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pendingBadgeText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "600",
    color: "#F59E0B",
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  // Image Gallery
  imageGallery: {
    marginBottom: Spacing.lg,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  galleryImage: {
    width: SCREEN_WIDTH - Spacing.lg * 2,
    height: 240,
    borderRadius: 20,
  },
  imagePagination: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: "#FFFFFF",
  },
  imageCount: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  imageCountText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  mediaBadges: {
    position: "absolute",
    bottom: 50,
    left: 16,
    flexDirection: "row",
    gap: 8,
  },
  mediaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  mediaBadgeText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Title Section
  titleSection: {
    marginBottom: Spacing.lg,
  },
  typeTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: Spacing.sm,
  },
  typeTagText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  propertyTitle: {
    ...Typography.headlineMedium,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: Spacing.sm,
  },
  locationText: {
    ...Typography.bodyMedium,
    fontSize: 14,
  },
  priceText: {
    ...Typography.headlineLarge,
    fontSize: 28,
    fontWeight: "800",
  },
  negotiableText: {
    ...Typography.caption,
    fontSize: 12,
    marginTop: 4,
  },
  // Stats Row
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    ...Typography.titleMedium,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
  },
  statLabel: {
    ...Typography.caption,
    fontSize: 11,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  // Section
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: Spacing.md,
  },
  sectionCard: {
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 1,
  },
  descriptionText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    lineHeight: 22,
  },
  // Detail Row
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  detailLabel: {
    ...Typography.bodyMedium,
    fontSize: 14,
    flex: 1,
  },
  detailValue: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    flex: 1.5,
    textAlign: "right",
  },
  // Amenities
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: "47%",
  },
  amenityText: {
    ...Typography.bodyMedium,
    fontSize: 13,
  },
  // Videos
  videoThumbnail: {
    width: 180,
    height: 120,
    borderRadius: 14,
    marginRight: Spacing.md,
    overflow: "hidden",
    position: "relative",
  },
  videoImage: {
    width: "100%",
    height: "100%",
  },
  videoPlayButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -20,
    marginLeft: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  videoDuration: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  videoDurationText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  virtualTourButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderRadius: 14,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1,
  },
  virtualTourText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  // Documents
  docStats: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  docStatsText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "600",
  },
  documentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  documentStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  documentStatusText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "500",
  },
  // Owner
  ownerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  ownerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  ownerInfo: {
    flex: 1,
  },
  ownerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ownerName: {
    ...Typography.labelMedium,
    fontSize: 16,
    fontWeight: "600",
  },
  ownerMeta: {
    ...Typography.caption,
    fontSize: 12,
    marginTop: 2,
  },
  ownerViewButton: {
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 10,
  },
  ownerViewButtonText: {
    ...Typography.labelMedium,
    fontSize: 12,
    fontWeight: "600",
  },
  ownerContactCard: {
    borderRadius: 14,
    padding: Spacing.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  ownerContactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  ownerContactText: {
    ...Typography.bodyMedium,
    fontSize: 14,
  },
  // Review Notes
  reviewNotesCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    backgroundColor: "#DBEAFE",
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  reviewNotesContent: {
    flex: 1,
  },
  reviewNotesTitle: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: "#3B82F6",
    marginBottom: 4,
  },
  reviewNotesText: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: "#1E40AF",
    lineHeight: 20,
  },
  // Action Bar
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: "row",
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  rejectButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: 16,
    backgroundColor: "#FEE2E2",
  },
  rejectButtonText: {
    ...Typography.labelLarge,
    fontSize: 16,
    fontWeight: "700",
    color: "#EF4444",
  },
  approveButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: 16,
  },
  approveButtonText: {
    ...Typography.labelLarge,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  // Reject Sheet
  rejectSheetContent: {
    flex: 1,
    padding: Spacing.xl,
  },
  rejectSheetTitle: {
    ...Typography.headlineMedium,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  rejectSheetSubtitle: {
    ...Typography.bodyMedium,
    fontSize: 14,
    marginBottom: Spacing.xl,
  },
  reasonsList: {
    flex: 1,
  },
  reasonOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 14,
    marginBottom: Spacing.sm,
    borderWidth: 1,
  },
  reasonOptionActive: {
  },
  reasonText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    flex: 1,
  },
  reasonTextActive: {
    fontWeight: "500",
  },
  customReasonInput: {
    borderRadius: 14,
    padding: Spacing.md,
    borderWidth: 1,
    ...Typography.bodyMedium,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
    marginTop: Spacing.sm,
  },
  confirmRejectButton: {
    backgroundColor: "#EF4444",
    paddingVertical: Spacing.lg,
    borderRadius: 16,
    marginTop: Spacing.lg,
    alignItems: "center",
  },
  confirmRejectButtonText: {
    ...Typography.labelLarge,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  // Document Preview
  docPreviewContainer: {
    flex: 1,
    padding: Spacing.xl,
  },
  docPreviewHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  docPreviewTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  docPreviewIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  docPreviewTitleInfo: {
    flex: 1,
  },
  docPreviewTitle: {
    ...Typography.titleMedium,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  docPreviewMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  docPreviewMetaText: {
    ...Typography.caption,
    fontSize: 12,
  },
  docPreviewMetaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  docPreviewStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  docPreviewStatusText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: "600",
  },
  docPreviewImageContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    marginBottom: Spacing.lg,
    position: "relative",
  },
  docPreviewImage: {
    width: "100%",
    height: "100%",
  },
  docPreviewOverlay: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  docPreviewZoomButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  docPreviewInfoCard: {
    borderRadius: 14,
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  docPreviewInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  docPreviewInfoLabel: {
    ...Typography.bodyMedium,
    fontSize: 14,
  },
  docPreviewInfoValue: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
  },
  docPreviewActions: {
    gap: Spacing.md,
  },
  docPreviewDownloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: 14,
  },
  docPreviewDownloadText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
  },
  docPreviewVerifyActions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  docPreviewRejectButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: 14,
    backgroundColor: "#FEE2E2",
  },
  docPreviewRejectText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: "#EF4444",
  },
  docPreviewVerifyButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: 14,
  },
  docPreviewVerifyText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  docVerifiedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: 14,
    borderWidth: 1,
  },
  docVerifiedText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
  },
});
