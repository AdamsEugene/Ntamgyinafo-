import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  TextInput as RNTextInput,
  Platform,
  Alert,
  Keyboard,
  Animated,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Colors, Typography, Spacing } from "@/constants/design";
import {
  FloatingHeaderStyles,
  HEADER_ICON_SIZE,
} from "@/components/FloatingHeader.styles";

interface Property {
  id: string;
  title: string;
  type: "house" | "apartment" | "land" | "commercial";
  transactionType: "sale" | "rent";
  price: string;
  location: string;
  owner: {
    id: string;
    name: string;
    avatar: string;
    isVerified: boolean;
  };
  images: string[];
  bedrooms?: number;
  bathrooms?: number;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reason?: string;
}

type FilterTab = "pending" | "approved" | "rejected" | "all";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const MOCK_PROPERTIES: Property[] = [
  {
    id: "p1",
    title: "4 Bedroom House in East Legon",
    type: "house",
    transactionType: "sale",
    price: "₵850,000",
    location: "East Legon, Accra",
    owner: {
      id: "u1",
      name: "Kofi Mensah",
      avatar: "https://i.pravatar.cc/150?img=11",
      isVerified: true,
    },
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop",
    ],
    bedrooms: 4,
    bathrooms: 3,
    status: "pending",
    submittedAt: "2 hours ago",
  },
  {
    id: "p2",
    title: "3 Bedroom Apartment in Cantonments",
    type: "apartment",
    transactionType: "rent",
    price: "₵5,000/mo",
    location: "Cantonments, Accra",
    owner: {
      id: "u2",
      name: "Ama Serwaa",
      avatar: "https://i.pravatar.cc/150?img=5",
      isVerified: true,
    },
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop",
    ],
    bedrooms: 3,
    bathrooms: 2,
    status: "pending",
    submittedAt: "4 hours ago",
  },
  {
    id: "p3",
    title: "Plot of Land in Tema",
    type: "land",
    transactionType: "sale",
    price: "₵120,000",
    location: "Tema, Community 25",
    owner: {
      id: "u3",
      name: "Kwame Asante",
      avatar: "https://i.pravatar.cc/150?img=3",
      isVerified: false,
    },
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop",
    ],
    status: "pending",
    submittedAt: "6 hours ago",
  },
  {
    id: "p4",
    title: "2 Bedroom Apartment in Osu",
    type: "apartment",
    transactionType: "rent",
    price: "₵3,500/mo",
    location: "Osu, Accra",
    owner: {
      id: "u4",
      name: "Akua Boateng",
      avatar: "https://i.pravatar.cc/150?img=9",
      isVerified: true,
    },
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
    ],
    bedrooms: 2,
    bathrooms: 1,
    status: "approved",
    submittedAt: "1 day ago",
  },
  {
    id: "p5",
    title: "Commercial Space in Airport City",
    type: "commercial",
    transactionType: "rent",
    price: "₵15,000/mo",
    location: "Airport City, Accra",
    owner: {
      id: "u5",
      name: "Yaw Mensah",
      avatar: "https://i.pravatar.cc/150?img=12",
      isVerified: false,
    },
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
    ],
    status: "rejected",
    submittedAt: "2 days ago",
    reason: "Insufficient photos and inaccurate location",
  },
];

const FILTER_OPTIONS: {
  id: FilterTab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
  { id: "all", label: "All Properties", icon: "apps", color: "#3B82F6" },
  { id: "pending", label: "Pending Review", icon: "time", color: "#F59E0B" },
  {
    id: "approved",
    label: "Approved",
    icon: "checkmark-circle",
    color: Colors.primaryGreen,
  },
  { id: "rejected", label: "Rejected", icon: "close-circle", color: "#EF4444" },
];

const REJECTION_REASONS = [
  "Insufficient photos (minimum 5 required)",
  "Inaccurate or missing location",
  "Misleading property information",
  "Duplicate listing",
  "Inappropriate content",
  "Unverified property ownership",
  "Other",
];

export default function PropertyQueueScreen() {
  useRouter();
  const insets = useSafeAreaInsets();
  const searchInputRef = useRef<RNTextInput>(null);
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const actionSheetRef = useRef<BottomSheetModal>(null);
  const rejectSheetRef = useRef<BottomSheetModal>(null);
  const filterSheetRef = useRef<BottomSheetModal>(null);
  const searchInputWidth = useRef(new Animated.Value(200)).current;
  const searchInputHeight = useRef(new Animated.Value(44)).current;

  // Handle keyboard show/hide
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setIsKeyboardVisible(true);
        Animated.parallel([
          Animated.timing(searchInputWidth, {
            toValue: SCREEN_WIDTH * 0.9 - Spacing.lg * 2,
            duration: 250,
            useNativeDriver: false,
          }),
          Animated.timing(searchInputHeight, {
            toValue: 52,
            duration: 250,
            useNativeDriver: false,
          }),
        ]).start();
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
        Animated.parallel([
          Animated.timing(searchInputWidth, {
            toValue: 200,
            duration: 250,
            useNativeDriver: false,
          }),
          Animated.timing(searchInputHeight, {
            toValue: 44,
            duration: 250,
            useNativeDriver: false,
          }),
        ]).start();
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [searchInputWidth, searchInputHeight]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const filteredProperties = properties.filter((property) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !property.title.toLowerCase().includes(query) &&
        !property.location.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    if (activeFilter === "all") return true;
    return property.status === activeFilter;
  });

  const pendingCount = properties.filter((p) => p.status === "pending").length;
  const activeFilterOption = FILTER_OPTIONS.find((f) => f.id === activeFilter);
  const activeFilterLabel = activeFilterOption?.label || "All";

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

  const handleApprove = (propertyId: string) => {
    Alert.alert(
      "Approve Listing",
      "Are you sure you want to approve this listing?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: () => {
            setProperties((prev) =>
              prev.map((p) =>
                p.id === propertyId ? { ...p, status: "approved" as const } : p
              )
            );
            actionSheetRef.current?.dismiss();
            Alert.alert(
              "Success",
              "Listing has been approved and is now live."
            );
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

    if (selectedProperty) {
      setProperties((prev) =>
        prev.map((p) =>
          p.id === selectedProperty.id
            ? { ...p, status: "rejected" as const, reason: selectedReason }
            : p
        )
      );
      rejectSheetRef.current?.dismiss();
      actionSheetRef.current?.dismiss();
      setSelectedReason("");
      Alert.alert("Success", "Listing has been rejected.");
    }
  };

  const getTypeIcon = (type: Property["type"]) => {
    switch (type) {
      case "house":
        return "home";
      case "apartment":
        return "business";
      case "land":
        return "map";
      case "commercial":
        return "storefront";
    }
  };

  const getStatusStyle = (status: Property["status"]) => {
    switch (status) {
      case "pending":
        return { bg: "#FEF3C7", text: "#F59E0B", icon: "time" };
      case "approved":
        return {
          bg: `${Colors.primaryGreen}15`,
          text: Colors.primaryGreen,
          icon: "checkmark-circle",
        };
      case "rejected":
        return { bg: "#FEE2E2", text: "#EF4444", icon: "close-circle" };
    }
  };

  const renderProperty = ({ item }: { item: Property }) => {
    const statusStyle = getStatusStyle(item.status);

    return (
      <TouchableOpacity
        style={styles.propertyCard}
        activeOpacity={0.7}
        onPress={() => {
          setSelectedProperty(item);
          actionSheetRef.current?.present();
        }}
      >
        {/* Property Image with Overlay */}
        <View style={styles.propertyImageContainer}>
          <Image
            source={{ uri: item.images[0] }}
            style={styles.propertyImage}
          />
          <View style={styles.propertyImageOverlay}>
            {/* Transaction Type Badge */}
            <View style={styles.transactionBadge}>
              <Text style={styles.transactionBadgeText}>
                For {item.transactionType === "sale" ? "Sale" : "Rent"}
              </Text>
            </View>
            {/* Status Badge */}
            <View
              style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}
            >
              <Ionicons
                name={statusStyle.icon as any}
                size={12}
                color={statusStyle.text}
              />
              <Text
                style={[styles.statusBadgeText, { color: statusStyle.text }]}
              >
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.propertyContent}>
          {/* Property Info */}
          <Text style={styles.propertyTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.propertyLocation}>
            <Ionicons name="location" size={14} color={Colors.primaryGreen} />
            <Text style={styles.propertyLocationText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
          <Text style={styles.propertyPrice}>{item.price}</Text>

          {/* Property Meta */}
          <View style={styles.propertyMeta}>
            <View style={styles.propertyTypeTag}>
              <Ionicons
                name={getTypeIcon(item.type) as any}
                size={14}
                color={Colors.primaryGreen}
              />
              <Text style={styles.propertyTypeText}>
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </Text>
            </View>
            {item.bedrooms && (
              <View style={styles.propertyMetaItem}>
                <Ionicons
                  name="bed-outline"
                  size={14}
                  color={Colors.textSecondary}
                />
                <Text style={styles.propertyMetaText}>
                  {item.bedrooms} Beds
                </Text>
              </View>
            )}
            {item.bathrooms && (
              <View style={styles.propertyMetaItem}>
                <Ionicons
                  name="water-outline"
                  size={14}
                  color={Colors.textSecondary}
                />
                <Text style={styles.propertyMetaText}>
                  {item.bathrooms} Baths
                </Text>
              </View>
            )}
          </View>

          {/* Owner Info */}
          <View style={styles.ownerInfo}>
            <View style={styles.ownerLeft}>
              <Image
                source={{ uri: item.owner.avatar }}
                style={styles.ownerAvatar}
              />
              <View>
                <View style={styles.ownerNameRow}>
                  <Text style={styles.ownerName}>{item.owner.name}</Text>
                  {item.owner.isVerified && (
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color={Colors.primaryGreen}
                    />
                  )}
                </View>
                <Text style={styles.submittedTime}>{item.submittedAt}</Text>
              </View>
            </View>
            <View style={styles.viewButton}>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={Colors.textSecondary}
              />
            </View>
          </View>

          {/* Rejection Reason */}
          {item.status === "rejected" && item.reason && (
            <View style={styles.rejectionReason}>
              <Ionicons name="alert-circle" size={16} color="#EF4444" />
              <Text style={styles.rejectionReasonText}>{item.reason}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* Decorative Background Elements */}
        <View style={styles.decorativeBackground}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
        </View>

        {/* Floating Sticky Header */}
        <View
          style={[
            FloatingHeaderStyles.floatingHeader,
            { paddingTop: insets.top + Spacing.md },
          ]}
        >
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitleText}>Properties</Text>
            {pendingCount > 0 && (
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>{pendingCount}</Text>
              </View>
            )}
          </View>

          {/* Filter Button */}
          <View style={FloatingHeaderStyles.headerActions}>
            <TouchableOpacity
              style={FloatingHeaderStyles.actionButton}
              onPress={() => filterSheetRef.current?.present()}
              activeOpacity={0.7}
            >
              <View style={FloatingHeaderStyles.actionButtonBackground}>
                <Ionicons
                  name="options-outline"
                  size={HEADER_ICON_SIZE}
                  color={Colors.textPrimary}
                />
                {activeFilter !== "pending" && (
                  <View style={FloatingHeaderStyles.filterBadge}>
                    <Text style={FloatingHeaderStyles.filterBadgeText}>1</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Filter Indicator */}
        <View style={[styles.activeFilterBar, { top: 70 + insets.top }]}>
          <View
            style={[
              styles.activeFilterChip,
              { backgroundColor: `${activeFilterOption?.color}15` },
            ]}
          >
            <Ionicons
              name={activeFilterOption?.icon as any}
              size={16}
              color={activeFilterOption?.color}
            />
            <Text
              style={[
                styles.activeFilterText,
                { color: activeFilterOption?.color },
              ]}
            >
              {activeFilterLabel}
            </Text>
            {activeFilter !== "pending" && (
              <TouchableOpacity onPress={() => setActiveFilter("pending")}>
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={activeFilterOption?.color}
                />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.resultsCount}>
            {filteredProperties.length}{" "}
            {filteredProperties.length === 1 ? "property" : "properties"}
          </Text>
        </View>

        {/* Properties List */}
        <FlatList
          data={filteredProperties}
          keyExtractor={(item) => item.id}
          renderItem={renderProperty}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingTop: 120 + insets.top,
              paddingBottom: 140 + insets.bottom,
            },
          ]}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={Keyboard.dismiss}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primaryGreen}
              progressViewOffset={120 + insets.top}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons
                  name="home-outline"
                  size={48}
                  color={Colors.textSecondary}
                />
              </View>
              <Text style={styles.emptyTitle}>No Properties Found</Text>
              <Text style={styles.emptyMessage}>
                {searchQuery
                  ? "Try a different search term"
                  : "No properties match the current filter"}
              </Text>
              {activeFilter !== "all" && (
                <TouchableOpacity
                  style={styles.clearFilterButton}
                  onPress={() => setActiveFilter("all")}
                >
                  <Text style={styles.clearFilterButtonText}>
                    View All Properties
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />

        {/* Floating Search Input */}
        <Animated.View
          style={[
            styles.floatingSearchContainer,
            {
              bottom: isKeyboardVisible
                ? keyboardHeight + Spacing.md
                : Math.max(insets.bottom, Spacing.md) + 70,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.floatingSearchInputContainer,
              {
                width: searchInputWidth,
                height: searchInputHeight,
              },
            ]}
          >
            <Ionicons
              name="search"
              size={isKeyboardVisible ? 18 : 16}
              color={Colors.textSecondary}
              style={styles.floatingSearchIcon}
            />
            <RNTextInput
              ref={searchInputRef}
              style={[
                styles.floatingSearchInput,
                { fontSize: isKeyboardVisible ? 15 : 13 },
              ]}
              placeholder="Search properties..."
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.floatingClearButton}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="close-circle"
                  size={isKeyboardVisible ? 20 : 18}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </Animated.View>
        </Animated.View>

        {/* Filter Bottom Sheet */}
        <BottomSheetModal
          ref={filterSheetRef}
          index={0}
          snapPoints={["45%"]}
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={{ backgroundColor: Colors.textSecondary }}
        >
          <BottomSheetScrollView style={styles.filterSheetContent}>
            <Text style={styles.filterSheetTitle}>Filter Properties</Text>
            <Text style={styles.filterSheetSubtitle}>
              Select a status to filter listings
            </Text>

            <View style={styles.filterOptions}>
              {FILTER_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.filterOption,
                    activeFilter === option.id && styles.filterOptionActive,
                    activeFilter === option.id && { borderColor: option.color },
                  ]}
                  onPress={() => {
                    setActiveFilter(option.id);
                    filterSheetRef.current?.dismiss();
                  }}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.filterOptionIcon,
                      { backgroundColor: `${option.color}15` },
                      activeFilter === option.id && {
                        backgroundColor: option.color,
                      },
                    ]}
                  >
                    <Ionicons
                      name={option.icon}
                      size={20}
                      color={
                        activeFilter === option.id ? "#FFFFFF" : option.color
                      }
                    />
                  </View>
                  <Text
                    style={[
                      styles.filterOptionText,
                      activeFilter === option.id &&
                        styles.filterOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {activeFilter === option.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={option.color}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </BottomSheetScrollView>
        </BottomSheetModal>

        {/* Property Actions Bottom Sheet */}
        <BottomSheetModal
          ref={actionSheetRef}
          index={0}
          snapPoints={["55%"]}
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={{ backgroundColor: Colors.textSecondary }}
        >
          <BottomSheetView style={styles.sheetContent}>
            {selectedProperty && (
              <>
                <View style={styles.sheetHeader}>
                  <Image
                    source={{ uri: selectedProperty.images[0] }}
                    style={styles.sheetPropertyImage}
                  />
                  <View style={styles.sheetPropertyInfo}>
                    <View
                      style={[
                        styles.sheetStatusBadge,
                        {
                          backgroundColor: getStatusStyle(
                            selectedProperty.status
                          ).bg,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.sheetStatusBadgeText,
                          {
                            color: getStatusStyle(selectedProperty.status).text,
                          },
                        ]}
                      >
                        {selectedProperty.status.charAt(0).toUpperCase() +
                          selectedProperty.status.slice(1)}
                      </Text>
                    </View>
                    <Text style={styles.sheetPropertyTitle} numberOfLines={2}>
                      {selectedProperty.title}
                    </Text>
                    <Text style={styles.sheetPropertyPrice}>
                      {selectedProperty.price}
                    </Text>
                    <Text style={styles.sheetPropertyLocation}>
                      {selectedProperty.location}
                    </Text>
                  </View>
                </View>

                <View style={styles.sheetActions}>
                  <TouchableOpacity
                    style={styles.sheetAction}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.sheetActionIcon,
                        { backgroundColor: "#3B82F615" },
                      ]}
                    >
                      <Ionicons name="eye" size={20} color="#3B82F6" />
                    </View>
                    <Text style={styles.sheetActionText}>View Details</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>

                  {selectedProperty.status === "pending" && (
                    <>
                      <TouchableOpacity
                        style={styles.sheetAction}
                        onPress={() => handleApprove(selectedProperty.id)}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.sheetActionIcon,
                            { backgroundColor: `${Colors.primaryGreen}15` },
                          ]}
                        >
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={Colors.primaryGreen}
                          />
                        </View>
                        <Text style={styles.sheetActionText}>
                          Approve Listing
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color={Colors.textSecondary}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.sheetAction}
                        onPress={() => rejectSheetRef.current?.present()}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.sheetActionIcon,
                            { backgroundColor: "#FEE2E2" },
                          ]}
                        >
                          <Ionicons
                            name="close-circle"
                            size={20}
                            color="#EF4444"
                          />
                        </View>
                        <Text
                          style={[styles.sheetActionText, { color: "#EF4444" }]}
                        >
                          Reject Listing
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color="#EF4444"
                        />
                      </TouchableOpacity>
                    </>
                  )}

                  <TouchableOpacity
                    style={styles.sheetAction}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.sheetActionIcon,
                        { backgroundColor: "#F3E8FF" },
                      ]}
                    >
                      <Ionicons name="person" size={20} color="#8B5CF6" />
                    </View>
                    <Text style={styles.sheetActionText}>
                      View Owner Profile
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </BottomSheetView>
        </BottomSheetModal>

        {/* Rejection Reason Bottom Sheet */}
        <BottomSheetModal
          ref={rejectSheetRef}
          index={0}
          snapPoints={["70%"]}
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={{ backgroundColor: Colors.textSecondary }}
        >
          <BottomSheetScrollView style={styles.rejectSheetContent}>
            <Text style={styles.rejectSheetTitle}>Select Rejection Reason</Text>
            <Text style={styles.rejectSheetSubtitle}>
              The owner will be notified with this reason
            </Text>

            {REJECTION_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason}
                style={[
                  styles.reasonOption,
                  selectedReason === reason && styles.reasonOptionActive,
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
                      ? Colors.primaryGreen
                      : Colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.reasonText,
                    selectedReason === reason && styles.reasonTextActive,
                  ]}
                >
                  {reason}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[
                styles.rejectButton,
                !selectedReason && styles.rejectButtonDisabled,
              ]}
              onPress={handleReject}
              disabled={!selectedReason}
              activeOpacity={0.8}
            >
              <Text style={styles.rejectButtonText}>Confirm Rejection</Text>
            </TouchableOpacity>
          </BottomSheetScrollView>
        </BottomSheetModal>
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
    gap: Spacing.sm,
    flex: 1,
  },
  headerTitleText: {
    ...Typography.titleLarge,
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  headerBadge: {
    backgroundColor: "#EF4444",
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  headerBadgeText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  // Active Filter Bar
  activeFilterBar: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 9,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.background,
  },
  activeFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  activeFilterText: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
  },
  resultsCount: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  // List
  listContent: {
    paddingHorizontal: Spacing.lg,
    flexGrow: 1,
  },
  // Property Card
  propertyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  propertyImageContainer: {
    position: "relative",
  },
  propertyImage: {
    width: "100%",
    height: 180,
  },
  propertyImageOverlay: {
    position: "absolute",
    top: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  transactionBadge: {
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  transactionBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "600",
  },
  propertyContent: {
    padding: Spacing.lg,
  },
  propertyTitle: {
    ...Typography.titleMedium,
    fontSize: 17,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  propertyLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  propertyLocationText: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  propertyPrice: {
    ...Typography.headlineMedium,
    fontSize: 20,
    fontWeight: "800",
    color: Colors.primaryGreen,
    marginBottom: Spacing.md,
  },
  propertyMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.md,
    flexWrap: "wrap",
  },
  propertyTypeTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: `${Colors.primaryGreen}15`,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  propertyTypeText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
  propertyMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  propertyMetaText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  ownerInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  ownerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  ownerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Colors.divider,
  },
  ownerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ownerName: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  submittedTime: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  viewButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectionReason: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
  },
  rejectionReasonText: {
    ...Typography.bodyMedium,
    fontSize: 12,
    color: "#EF4444",
    flex: 1,
    lineHeight: 18,
  },
  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xl * 2,
    paddingHorizontal: Spacing.xl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  emptyTitle: {
    ...Typography.titleMedium,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  emptyMessage: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  clearFilterButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primaryGreen,
  },
  clearFilterButtonText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
  // Floating Search
  floatingSearchContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 999,
    backgroundColor: "transparent",
  },
  floatingSearchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.divider,
    gap: Spacing.xs / 2,
    alignSelf: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  floatingSearchIcon: {
    marginRight: Spacing.xs / 2,
  },
  floatingSearchInput: {
    flex: 1,
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textPrimary,
    padding: 0,
    minWidth: 120,
    ...Platform.select({
      android: {
        includeFontPadding: false,
        textAlignVertical: "center",
      },
    }),
  },
  floatingClearButton: {
    padding: Spacing.xs / 2,
  },
  // Filter Sheet
  filterSheetContent: {
    padding: Spacing.xl,
  },
  filterSheetTitle: {
    ...Typography.headlineMedium,
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  filterSheetSubtitle: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  filterOptions: {
    gap: Spacing.sm,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  filterOptionActive: {
    backgroundColor: `${Colors.primaryGreen}08`,
  },
  filterOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  filterOptionText: {
    ...Typography.bodyMedium,
    fontSize: 15,
    color: Colors.textSecondary,
    flex: 1,
  },
  filterOptionTextActive: {
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  // Bottom Sheet
  sheetContent: {
    padding: Spacing.xl,
  },
  sheetHeader: {
    flexDirection: "row",
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  sheetPropertyImage: {
    width: 90,
    height: 90,
    borderRadius: 16,
  },
  sheetPropertyInfo: {
    flex: 1,
  },
  sheetStatusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  sheetStatusBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "600",
  },
  sheetPropertyTitle: {
    ...Typography.labelMedium,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  sheetPropertyPrice: {
    ...Typography.headlineMedium,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primaryGreen,
  },
  sheetPropertyLocation: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sheetActions: {
    gap: Spacing.xs,
  },
  sheetAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: 12,
  },
  sheetActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetActionText: {
    ...Typography.bodyMedium,
    fontSize: 15,
    fontWeight: "500",
    color: Colors.textPrimary,
    flex: 1,
  },
  // Reject Sheet
  rejectSheetContent: {
    padding: Spacing.xl,
  },
  rejectSheetTitle: {
    ...Typography.headlineMedium,
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  rejectSheetSubtitle: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  reasonOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  reasonOptionActive: {
    borderColor: Colors.primaryGreen,
    backgroundColor: `${Colors.primaryGreen}08`,
  },
  reasonText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  reasonTextActive: {
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  rejectButton: {
    backgroundColor: "#EF4444",
    paddingVertical: Spacing.lg,
    borderRadius: 16,
    marginTop: Spacing.lg,
    alignItems: "center",
  },
  rejectButtonDisabled: {
    backgroundColor: Colors.divider,
  },
  rejectButtonText: {
    ...Typography.labelLarge,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
