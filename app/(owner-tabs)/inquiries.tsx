import React, { useState, useRef, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Platform,
  FlatList,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Colors, Typography, Spacing } from "@/constants/design";
import {
  FloatingHeaderStyles,
  HEADER_ICON_SIZE,
} from "@/components/FloatingHeader.styles";

// Filter options
const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "replied", label: "Replied" },
  { id: "archived", label: "Archived" },
];

const PROPERTY_FILTERS = [
  { id: "all", label: "All Properties" },
  { id: "1", label: "4 Bedroom House in East Legon" },
  { id: "2", label: "3 Bedroom Apartment in Airport" },
  { id: "3", label: "2 Plots of Land in Tema" },
];

type InquiryStatus = "new" | "replied" | "archived";

interface Inquiry {
  id: string;
  buyer: {
    id: string;
    name: string;
    avatar: string;
    phone?: string;
  };
  property: {
    id: string;
    title: string;
    image: string;
  };
  message: string;
  timestamp: string;
  timeAgo: string;
  status: InquiryStatus;
  unread: boolean;
}

// Mock inquiries data
const INQUIRIES: Inquiry[] = [
  {
    id: "1",
    buyer: {
      id: "b1",
      name: "Ama Serwaa",
      avatar: "https://i.pravatar.cc/150?img=1",
      phone: "+233241234567",
    },
    property: {
      id: "1",
      title: "4 Bedroom House in East Legon",
      image:
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=100&h=100&fit=crop",
    },
    message:
      "Hello, I'm very interested in this property. Is it still available? I would love to schedule a viewing this weekend if possible.",
    timestamp: "2024-12-22T10:30:00",
    timeAgo: "2 hours ago",
    status: "new",
    unread: true,
  },
  {
    id: "2",
    buyer: {
      id: "b2",
      name: "Kwame Asante",
      avatar: "https://i.pravatar.cc/150?img=3",
      phone: "+233201234567",
    },
    property: {
      id: "1",
      title: "4 Bedroom House in East Legon",
      image:
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=100&h=100&fit=crop",
    },
    message:
      "Good afternoon. What is the best price you can offer? I'm a serious buyer looking to close quickly.",
    timestamp: "2024-12-22T08:15:00",
    timeAgo: "4 hours ago",
    status: "new",
    unread: true,
  },
  {
    id: "3",
    buyer: {
      id: "b3",
      name: "Yaa Mensah",
      avatar: "https://i.pravatar.cc/150?img=5",
      phone: "+233271234567",
    },
    property: {
      id: "2",
      title: "3 Bedroom Apartment in Airport",
      image:
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=100&h=100&fit=crop",
    },
    message:
      "Is the apartment furnished? Also, are utilities included in the rent?",
    timestamp: "2024-12-21T16:45:00",
    timeAgo: "Yesterday",
    status: "replied",
    unread: false,
  },
  {
    id: "4",
    buyer: {
      id: "b4",
      name: "Kofi Owusu",
      avatar: "https://i.pravatar.cc/150?img=8",
      phone: "+233551234567",
    },
    property: {
      id: "3",
      title: "2 Plots of Land in Tema",
      image:
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=100&h=100&fit=crop",
    },
    message:
      "I'm interested in buying the land. Can you share the documents and any encumbrances?",
    timestamp: "2024-12-21T11:20:00",
    timeAgo: "Yesterday",
    status: "replied",
    unread: false,
  },
  {
    id: "5",
    buyer: {
      id: "b5",
      name: "Akua Darko",
      avatar: "https://i.pravatar.cc/150?img=9",
      phone: "+233261234567",
    },
    property: {
      id: "1",
      title: "4 Bedroom House in East Legon",
      image:
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=100&h=100&fit=crop",
    },
    message:
      "Thank you for the information. I'll get back to you after discussing with my family.",
    timestamp: "2024-12-20T09:00:00",
    timeAgo: "2 days ago",
    status: "archived",
    unread: false,
  },
];

export default function InquiriesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");
  const [activePropertyFilter, setActivePropertyFilter] = useState("all");
  const filterSheetRef = useRef<BottomSheetModal>(null);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const filterSnapPoints = useMemo(() => ["50%"], []);

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

  const openFilterSheet = () => {
    filterSheetRef.current?.present();
  };

  const applyFilters = () => {
    filterSheetRef.current?.dismiss();
  };

  const resetFilters = () => {
    setActiveStatusFilter("all");
    setActivePropertyFilter("all");
  };

  const getStatusColor = (status: InquiryStatus) => {
    switch (status) {
      case "new":
        return Colors.primaryGreen;
      case "replied":
        return "#3B82F6";
      case "archived":
        return Colors.textSecondary;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusLabel = (status: InquiryStatus) => {
    switch (status) {
      case "new":
        return "New";
      case "replied":
        return "Replied";
      case "archived":
        return "Archived";
      default:
        return status;
    }
  };

  const filteredInquiries = INQUIRIES.filter((inquiry) => {
    if (activeStatusFilter !== "all" && inquiry.status !== activeStatusFilter) {
      return false;
    }
    if (
      activePropertyFilter !== "all" &&
      inquiry.property.id !== activePropertyFilter
    ) {
      return false;
    }
    return true;
  });

  const newInquiriesCount = INQUIRIES.filter((i) => i.status === "new").length;

  const handleInquiryPress = (inquiry: Inquiry) => {
    // Navigate to chat screen with this inquiry
    // For now, we'll just log it
    console.log("Navigate to chat with:", inquiry.buyer.name);
    // router.push(`/chat/${inquiry.buyer.id}?property=${inquiry.property.id}` as any);
  };

  const renderInquiryCard = (inquiry: Inquiry) => (
    <TouchableOpacity
      key={inquiry.id}
      style={[styles.inquiryCard, inquiry.unread && styles.inquiryCardUnread]}
      activeOpacity={0.7}
      onPress={() => handleInquiryPress(inquiry)}
    >
      {/* Unread Indicator */}
      {inquiry.unread && <View style={styles.unreadIndicator} />}

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Image source={{ uri: inquiry.buyer.avatar }} style={styles.avatar} />
        {inquiry.unread && <View style={styles.onlineIndicator} />}
      </View>

      {/* Content */}
      <View style={styles.inquiryContent}>
        <View style={styles.inquiryHeader}>
          <Text
            style={[styles.buyerName, inquiry.unread && styles.buyerNameUnread]}
          >
            {inquiry.buyer.name}
          </Text>
          <Text style={styles.timeAgo}>{inquiry.timeAgo}</Text>
        </View>

        {/* Property Context */}
        <View style={styles.propertyContext}>
          <Image
            source={{ uri: inquiry.property.image }}
            style={styles.propertyThumbnail}
          />
          <Text style={styles.propertyTitle} numberOfLines={1}>
            {inquiry.property.title}
          </Text>
        </View>

        {/* Message Preview */}
        <Text
          style={[
            styles.messagePreview,
            inquiry.unread && styles.messagePreviewUnread,
          ]}
          numberOfLines={2}
        >
          {inquiry.message}
        </Text>

        {/* Footer */}
        <View style={styles.inquiryFooter}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(inquiry.status)}15` },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(inquiry.status) },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(inquiry.status) },
              ]}
            >
              {getStatusLabel(inquiry.status)}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={Colors.textSecondary}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

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
            <TouchableOpacity
              onPress={() => router.back()}
              style={FloatingHeaderStyles.backButton}
              activeOpacity={0.7}
            >
              <View style={FloatingHeaderStyles.backButtonCircle}>
                <Ionicons
                  name="arrow-back"
                  size={HEADER_ICON_SIZE}
                  color={Colors.textPrimary}
                />
              </View>
            </TouchableOpacity>
            <Text style={styles.headerTitleText}>Inquiries</Text>
            {newInquiriesCount > 0 && (
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>{newInquiriesCount}</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={FloatingHeaderStyles.headerActions}>
            <TouchableOpacity
              style={FloatingHeaderStyles.actionButton}
              onPress={openFilterSheet}
              activeOpacity={0.7}
            >
              <View style={FloatingHeaderStyles.actionButtonBackground}>
                <Ionicons
                  name="options-outline"
                  size={HEADER_ICON_SIZE}
                  color={Colors.textPrimary}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: 80 + insets.top,
              paddingBottom: 100 + insets.bottom,
            },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primaryGreen}
            />
          }
        >
          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.quickStatItem}>
              <View
                style={[
                  styles.quickStatIcon,
                  { backgroundColor: `${Colors.primaryGreen}15` },
                ]}
              >
                <Ionicons
                  name="mail-unread"
                  size={20}
                  color={Colors.primaryGreen}
                />
              </View>
              <Text style={styles.quickStatValue}>
                {INQUIRIES.filter((i) => i.status === "new").length}
              </Text>
              <Text style={styles.quickStatLabel}>New</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStatItem}>
              <View
                style={[styles.quickStatIcon, { backgroundColor: "#3B82F615" }]}
              >
                <Ionicons name="checkmark-done" size={20} color="#3B82F6" />
              </View>
              <Text style={styles.quickStatValue}>
                {INQUIRIES.filter((i) => i.status === "replied").length}
              </Text>
              <Text style={styles.quickStatLabel}>Replied</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStatItem}>
              <View
                style={[styles.quickStatIcon, { backgroundColor: "#6B728015" }]}
              >
                <Ionicons name="archive" size={20} color="#6B7280" />
              </View>
              <Text style={styles.quickStatValue}>
                {INQUIRIES.filter((i) => i.status === "archived").length}
              </Text>
              <Text style={styles.quickStatLabel}>Archived</Text>
            </View>
          </View>

          {/* Status Tabs */}
          <View style={styles.tabsContainer}>
            <FlatList
              data={STATUS_FILTERS}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsContent}
              keyExtractor={(item) => item.id}
              renderItem={({ item: tab }) => (
                <TouchableOpacity
                  style={[
                    styles.tab,
                    activeStatusFilter === tab.id && styles.tabActive,
                  ]}
                  onPress={() => setActiveStatusFilter(tab.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeStatusFilter === tab.id && styles.tabTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* Results Count */}
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {filteredInquiries.length} inquiry
              {filteredInquiries.length !== 1 ? "ies" : ""}
            </Text>
          </View>

          {/* Inquiries List or Empty State */}
          {filteredInquiries.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={48}
                  color={Colors.textSecondary}
                />
              </View>
              <Text style={styles.emptyTitle}>No Inquiries Yet</Text>
              <Text style={styles.emptySubtitle}>
                When buyers contact you about your properties, their messages
                will appear here
              </Text>
            </View>
          ) : (
            <View style={styles.inquiriesContainer}>
              {filteredInquiries.map(renderInquiryCard)}
            </View>
          )}
        </ScrollView>

        {/* Filter Bottom Sheet */}
        <BottomSheetModal
          ref={filterSheetRef}
          index={0}
          snapPoints={filterSnapPoints}
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={{ backgroundColor: Colors.textSecondary }}
        >
          <BottomSheetView style={styles.filterSheet}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filter Inquiries</Text>
              <TouchableOpacity onPress={resetFilters}>
                <Text style={styles.resetText}>Reset</Text>
              </TouchableOpacity>
            </View>

            {/* Status Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Status</Text>
              <View style={styles.filterOptions}>
                {STATUS_FILTERS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.filterOption,
                      activeStatusFilter === option.id &&
                        styles.filterOptionActive,
                    ]}
                    onPress={() => setActiveStatusFilter(option.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        activeStatusFilter === option.id &&
                          styles.filterOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Property Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Property</Text>
              <View style={styles.filterOptions}>
                {PROPERTY_FILTERS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.filterOption,
                      styles.filterOptionFull,
                      activePropertyFilter === option.id &&
                        styles.filterOptionActive,
                    ]}
                    onPress={() => setActivePropertyFilter(option.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        activePropertyFilter === option.id &&
                          styles.filterOptionTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {option.label}
                    </Text>
                    {activePropertyFilter === option.id && (
                      <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Apply Button */}
            <TouchableOpacity
              style={styles.applyButton}
              onPress={applyFilters}
              activeOpacity={0.8}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </BottomSheetView>
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
  // Decorative Background
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
  // Header
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
    backgroundColor: Colors.primaryGreen,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  headerBadgeText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },

  // Quick Stats
  quickStats: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  quickStatItem: {
    flex: 1,
    alignItems: "center",
  },
  quickStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  quickStatValue: {
    ...Typography.headlineMedium,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  quickStatLabel: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  quickStatDivider: {
    width: 1,
    height: 50,
    backgroundColor: Colors.divider,
    alignSelf: "center",
  },

  // Tabs
  tabsContainer: {
    marginBottom: Spacing.lg,
    marginHorizontal: -Spacing.lg,
  },
  tabsContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  tab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  tabActive: {
    backgroundColor: Colors.primaryGreen,
    borderColor: Colors.primaryGreen,
  },
  tabText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: "#FFFFFF",
  },

  // Results Header
  resultsHeader: {
    marginBottom: Spacing.md,
  },
  resultsCount: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["2xl"] * 2,
    paddingHorizontal: Spacing.xl,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  emptyTitle: {
    ...Typography.headlineMedium,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    maxWidth: 280,
  },

  // Inquiries List
  inquiriesContainer: {
    gap: Spacing.md,
  },
  inquiryCard: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
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
  inquiryCardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.primaryGreen,
    backgroundColor: `${Colors.primaryGreen}05`,
  },
  unreadIndicator: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primaryGreen,
  },
  avatarContainer: {
    position: "relative",
    marginRight: Spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primaryGreen,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  inquiryContent: {
    flex: 1,
  },
  inquiryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  buyerName: {
    ...Typography.titleMedium,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  buyerNameUnread: {
    fontWeight: "700",
  },
  timeAgo: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  propertyContext: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  propertyThumbnail: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  propertyTitle: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
    flex: 1,
  },
  messagePreview: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  messagePreviewUnread: {
    color: Colors.textPrimary,
  },
  inquiryFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "600",
  },

  // Filter Bottom Sheet
  filterSheet: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  filterTitle: {
    ...Typography.headlineMedium,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  resetText: {
    ...Typography.labelMedium,
    color: Colors.primaryGreen,
    fontWeight: "600",
  },
  filterSection: {
    marginBottom: Spacing.xl,
  },
  filterSectionTitle: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  filterOption: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  filterOptionFull: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterOptionActive: {
    backgroundColor: Colors.primaryGreen,
    borderColor: Colors.primaryGreen,
  },
  filterOptionText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  filterOptionTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  applyButton: {
    backgroundColor: Colors.primaryGreen,
    borderRadius: 14,
    paddingVertical: Spacing.md,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  applyButtonText: {
    ...Typography.labelLarge,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
