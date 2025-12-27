import React, { useState, useRef, useCallback } from "react";
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
import { Typography, Spacing } from "@/constants/design";
import { useTheme } from "@/contexts/ThemeContext";
import {
  FloatingHeader,
  HeaderActionButton,
} from "@/components/FloatingHeader";

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
  const { colors, isDark } = useTheme();
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

  // const filterSnapPoints = useMemo(() => ["50%"], []);

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
        return colors.primary;
      case "replied":
        return "#3B82F6";
      case "archived":
        return colors.textSecondary;
      default:
        return colors.textSecondary;
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
      style={[
        styles.inquiryCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.divider,
        },
        inquiry.unread && {
          borderLeftColor: colors.primary,
          backgroundColor: `${colors.primary}05`,
        },
      ]}
      activeOpacity={0.7}
      onPress={() => handleInquiryPress(inquiry)}
    >
      {/* Unread Indicator */}
      {inquiry.unread && (
        <View
          style={[styles.unreadIndicator, { backgroundColor: colors.primary }]}
        />
      )}

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Image source={{ uri: inquiry.buyer.avatar }} style={styles.avatar} />
        {inquiry.unread && (
          <View
            style={[
              styles.onlineIndicator,
              {
                backgroundColor: colors.primary,
                borderColor: colors.surface,
              },
            ]}
          />
        )}
      </View>

      {/* Content */}
      <View style={styles.inquiryContent}>
        <View style={styles.inquiryHeader}>
          <Text
            style={[
              styles.buyerName,
              { color: colors.text },
              inquiry.unread && styles.buyerNameUnread,
            ]}
          >
            {inquiry.buyer.name}
          </Text>
          <Text style={[styles.timeAgo, { color: colors.textSecondary }]}>
            {inquiry.timeAgo}
          </Text>
        </View>

        {/* Property Context */}
        <View style={styles.propertyContext}>
          <Image
            source={{ uri: inquiry.property.image }}
            style={styles.propertyThumbnail}
          />
          <Text
            style={[styles.propertyTitle, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {inquiry.property.title}
          </Text>
        </View>

        {/* Message Preview */}
        <Text
          style={[
            styles.messagePreview,
            { color: colors.textSecondary },
            inquiry.unread && { color: colors.text },
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
            color={colors.textSecondary}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

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
          title="Inquiries"
          showBackButton
          onBackPress={() => router.back()}
          rightContent={
            <HeaderActionButton
              icon="options-outline"
              onPress={openFilterSheet}
              badge={newInquiriesCount > 0 ? newInquiriesCount : undefined}
            />
          }
        />

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
              tintColor={colors.primary}
            />
          }
        >
          {/* Quick Stats */}
          <View
            style={[
              styles.quickStats,
              {
                backgroundColor: colors.surface,
                borderColor: colors.divider,
              },
            ]}
          >
            <View style={styles.quickStatItem}>
              <View
                style={[
                  styles.quickStatIcon,
                  { backgroundColor: `${colors.primary}15` },
                ]}
              >
                <Ionicons name="mail-unread" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.quickStatValue, { color: colors.text }]}>
                {INQUIRIES.filter((i) => i.status === "new").length}
              </Text>
              <Text
                style={[styles.quickStatLabel, { color: colors.textSecondary }]}
              >
                New
              </Text>
            </View>
            <View
              style={[
                styles.quickStatDivider,
                { backgroundColor: colors.divider },
              ]}
            />
            <View style={styles.quickStatItem}>
              <View
                style={[styles.quickStatIcon, { backgroundColor: "#3B82F615" }]}
              >
                <Ionicons name="checkmark-done" size={20} color="#3B82F6" />
              </View>
              <Text style={[styles.quickStatValue, { color: colors.text }]}>
                {INQUIRIES.filter((i) => i.status === "replied").length}
              </Text>
              <Text
                style={[styles.quickStatLabel, { color: colors.textSecondary }]}
              >
                Replied
              </Text>
            </View>
            <View
              style={[
                styles.quickStatDivider,
                { backgroundColor: colors.divider },
              ]}
            />
            <View style={styles.quickStatItem}>
              <View
                style={[styles.quickStatIcon, { backgroundColor: "#6B728015" }]}
              >
                <Ionicons name="archive" size={20} color="#6B7280" />
              </View>
              <Text style={[styles.quickStatValue, { color: colors.text }]}>
                {INQUIRIES.filter((i) => i.status === "archived").length}
              </Text>
              <Text
                style={[styles.quickStatLabel, { color: colors.textSecondary }]}
              >
                Archived
              </Text>
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
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.divider,
                    },
                    activeStatusFilter === tab.id && {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => setActiveStatusFilter(tab.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.tabText,
                      { color: colors.textSecondary },
                      activeStatusFilter === tab.id && {
                        color: "#FFFFFF",
                      },
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
            <Text
              style={[styles.resultsCount, { color: colors.textSecondary }]}
            >
              {filteredInquiries.length} inquiry
              {filteredInquiries.length !== 1 ? "ies" : ""}
            </Text>
          </View>

          {/* Inquiries List or Empty State */}
          {filteredInquiries.length === 0 ? (
            <View style={styles.emptyState}>
              <View
                style={[
                  styles.emptyIconContainer,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.divider,
                  },
                ]}
              >
                <Ionicons
                  name="chatbubbles-outline"
                  size={48}
                  color={colors.textSecondary}
                />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No Inquiries Yet
              </Text>
              <Text
                style={[styles.emptySubtitle, { color: colors.textSecondary }]}
              >
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
          snapPoints={["50%"]}
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={{ backgroundColor: colors.textSecondary }}
          backgroundStyle={{ backgroundColor: colors.surface }}
        >
          <BottomSheetView style={styles.filterSheet}>
            <View
              style={[
                styles.filterHeader,
                { borderBottomColor: colors.divider },
              ]}
            >
              <Text style={[styles.filterTitle, { color: colors.text }]}>
                Filter Inquiries
              </Text>
              <TouchableOpacity onPress={resetFilters}>
                <Text style={[styles.resetText, { color: colors.primary }]}>
                  Reset
                </Text>
              </TouchableOpacity>
            </View>

            {/* Status Filter */}
            <View style={styles.filterSection}>
              <Text
                style={[
                  styles.filterSectionTitle,
                  { color: colors.textSecondary },
                ]}
              >
                Status
              </Text>
              <View style={styles.filterOptions}>
                {STATUS_FILTERS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.filterOption,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.divider,
                      },
                      activeStatusFilter === option.id && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
                    onPress={() => setActiveStatusFilter(option.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        { color: colors.text },
                        activeStatusFilter === option.id && {
                          color: "#FFFFFF",
                        },
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
              <Text
                style={[
                  styles.filterSectionTitle,
                  { color: colors.textSecondary },
                ]}
              >
                Property
              </Text>
              <View style={styles.filterOptions}>
                {PROPERTY_FILTERS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.filterOption,
                      styles.filterOptionFull,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.divider,
                      },
                      activePropertyFilter === option.id && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
                    onPress={() => setActivePropertyFilter(option.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        { color: colors.text },
                        activePropertyFilter === option.id && {
                          color: "#FFFFFF",
                        },
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
              style={[styles.applyButton, { backgroundColor: colors.primary }]}
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
    fontSize: 20,
    fontWeight: "700",
  },
  headerBadge: {
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
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
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
  },
  quickStatLabel: {
    ...Typography.caption,
    fontSize: 11,
  },
  quickStatDivider: {
    width: 1,
    height: 50,
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
    borderWidth: 1,
  },
  tabActive: {},
  tabText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
  },
  tabTextActive: {},

  // Results Header
  resultsHeader: {
    marginBottom: Spacing.md,
  },
  resultsCount: {
    ...Typography.bodyMedium,
    fontSize: 14,
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
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
    borderWidth: 1,
  },
  emptyTitle: {
    ...Typography.headlineMedium,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.bodyMedium,
    fontSize: 14,
    textAlign: "center",
    maxWidth: 280,
  },

  // Inquiries List
  inquiriesContainer: {
    gap: Spacing.md,
  },
  inquiryCard: {
    flexDirection: "row",
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
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
  },
  unreadIndicator: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    width: 8,
    height: 8,
    borderRadius: 4,
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
    borderWidth: 2,
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
  },
  buyerNameUnread: {
    fontWeight: "700",
  },
  timeAgo: {
    ...Typography.caption,
    fontSize: 11,
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
    flex: 1,
  },
  messagePreview: {
    ...Typography.bodyMedium,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  messagePreviewUnread: {},
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
  },
  filterTitle: {
    ...Typography.headlineMedium,
    fontSize: 20,
    fontWeight: "700",
  },
  resetText: {
    ...Typography.labelMedium,
    fontWeight: "600",
  },
  filterSection: {
    marginBottom: Spacing.xl,
  },
  filterSectionTitle: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
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
    borderWidth: 1,
  },
  filterOptionFull: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterOptionActive: {},
  filterOptionText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "500",
  },
  filterOptionTextActive: {
    fontWeight: "600",
  },
  applyButton: {
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
