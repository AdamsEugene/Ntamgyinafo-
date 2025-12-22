import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  TextInput,
  Platform,
  Alert,
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
import { FloatingHeaderStyles } from "@/components/FloatingHeader.styles";

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

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "all", label: "All" },
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
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);
  const [activeTab, setActiveTab] = useState<FilterTab>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [selectedReason, setSelectedReason] = useState<string>("");
  const actionSheetRef = useRef<BottomSheetModal>(null);
  const rejectSheetRef = useRef<BottomSheetModal>(null);

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

    if (activeTab === "all") return true;
    return property.status === activeTab;
  });

  const pendingCount = properties.filter((p) => p.status === "pending").length;

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
        return { bg: "#FEF3C7", text: "#F59E0B" };
      case "approved":
        return { bg: `${Colors.primaryGreen}15`, text: Colors.primaryGreen };
      case "rejected":
        return { bg: "#FEE2E2", text: "#EF4444" };
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
        <Image source={{ uri: item.images[0] }} style={styles.propertyImage} />
        <View style={styles.propertyContent}>
          {/* Status Badge */}
          <View
            style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}
          >
            <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>

          {/* Property Info */}
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
          <Text style={styles.propertyPrice}>{item.price}</Text>

          {/* Property Meta */}
          <View style={styles.propertyMeta}>
            <View style={styles.propertyTypeTag}>
              <Ionicons
                name={getTypeIcon(item.type) as any}
                size={12}
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
                  size={12}
                  color={Colors.textSecondary}
                />
                <Text style={styles.propertyMetaText}>{item.bedrooms}</Text>
              </View>
            )}
            {item.bathrooms && (
              <View style={styles.propertyMetaItem}>
                <Ionicons
                  name="water-outline"
                  size={12}
                  color={Colors.textSecondary}
                />
                <Text style={styles.propertyMetaText}>{item.bathrooms}</Text>
              </View>
            )}
          </View>

          {/* Owner Info */}
          <View style={styles.ownerInfo}>
            <Image
              source={{ uri: item.owner.avatar }}
              style={styles.ownerAvatar}
            />
            <Text style={styles.ownerName}>{item.owner.name}</Text>
            {item.owner.isVerified && (
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={Colors.primaryGreen}
              />
            )}
            <Text style={styles.submittedTime}>• {item.submittedAt}</Text>
          </View>

          {/* Rejection Reason */}
          {item.status === "rejected" && item.reason && (
            <View style={styles.rejectionReason}>
              <Ionicons name="alert-circle" size={14} color="#EF4444" />
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
                <Text style={styles.headerBadgeText}>
                  {pendingCount} pending
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { top: 70 + insets.top }]}>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search" size={18} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search properties..."
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={[styles.filterTabsContainer, { top: 120 + insets.top }]}>
          <FlatList
            horizontal
            data={FILTER_TABS}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterTabs}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterTab,
                  activeTab === item.id && styles.filterTabActive,
                ]}
                onPress={() => setActiveTab(item.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    activeTab === item.id && styles.filterTabTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Properties List */}
        <FlatList
          data={filteredProperties}
          keyExtractor={(item) => item.id}
          renderItem={renderProperty}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingTop: 170 + insets.top,
              paddingBottom: 100 + insets.bottom,
            },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primaryGreen}
              progressViewOffset={170 + insets.top}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name="home-outline"
                size={48}
                color={Colors.textSecondary}
              />
              <Text style={styles.emptyTitle}>No Properties Found</Text>
              <Text style={styles.emptyMessage}>
                {searchQuery
                  ? "Try a different search"
                  : "No properties match this filter"}
              </Text>
            </View>
          }
        />

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
    gap: Spacing.md,
    flex: 1,
  },
  headerTitleText: {
    ...Typography.titleLarge,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  headerBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerBadgeText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "600",
    color: "#F59E0B",
  },
  // Search
  searchContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 9,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.background,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.divider,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.bodyMedium,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  // Filter Tabs
  filterTabsContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 8,
    backgroundColor: Colors.background,
    paddingVertical: Spacing.sm,
  },
  filterTabs: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  filterTab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  filterTabActive: {
    backgroundColor: Colors.primaryGreen,
    borderColor: Colors.primaryGreen,
  },
  filterTabText: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  filterTabTextActive: {
    color: "#FFFFFF",
  },
  // List
  listContent: {
    paddingHorizontal: Spacing.lg,
    flexGrow: 1,
  },
  // Property Card
  propertyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: Spacing.md,
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
  propertyImage: {
    width: "100%",
    height: 160,
  },
  propertyContent: {
    padding: Spacing.md,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: Spacing.sm,
  },
  statusBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "600",
  },
  propertyTitle: {
    ...Typography.labelMedium,
    fontSize: 16,
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
  },
  propertyPrice: {
    ...Typography.headlineMedium,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primaryGreen,
    marginBottom: Spacing.sm,
  },
  propertyMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  propertyTypeTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${Colors.primaryGreen}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  propertyTypeText: {
    ...Typography.caption,
    fontSize: 10,
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
    fontSize: 11,
    color: Colors.textSecondary,
  },
  ownerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  ownerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  ownerName: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  submittedTime: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  rejectionReason: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
  },
  rejectionReasonText: {
    ...Typography.caption,
    fontSize: 11,
    color: "#EF4444",
    flex: 1,
  },
  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xl * 2,
  },
  emptyTitle: {
    ...Typography.titleMedium,
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  emptyMessage: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  // Bottom Sheet
  sheetContent: {
    padding: Spacing.xl,
  },
  sheetHeader: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  sheetPropertyImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  sheetPropertyInfo: {
    flex: 1,
  },
  sheetPropertyTitle: {
    ...Typography.labelMedium,
    fontSize: 16,
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
    gap: Spacing.sm,
  },
  sheetAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  sheetActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetActionText: {
    ...Typography.bodyMedium,
    fontSize: 15,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  // Reject Sheet
  rejectSheetContent: {
    padding: Spacing.xl,
  },
  rejectSheetTitle: {
    ...Typography.headlineMedium,
    fontSize: 20,
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
    borderRadius: 12,
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
