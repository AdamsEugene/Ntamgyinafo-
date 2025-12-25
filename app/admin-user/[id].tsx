import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  Linking,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
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

interface UserListing {
  id: string;
  title: string;
  image: string;
  price: number;
  status: "active" | "pending" | "rejected";
  views: number;
}

interface UserActivity {
  id: string;
  type: "login" | "listing" | "message" | "payment";
  message: string;
  time: string;
}

// Mock user data
const MOCK_USERS: Record<
  string,
  {
    id: string;
    name: string;
    phone: string;
    email: string;
    avatar: string;
    role: "buyer" | "owner" | "admin";
    status: "active" | "suspended" | "pending";
    isVerified: boolean;
    joinedDate: string;
    lastActive: string;
    bio?: string;
    location?: string;
    listings?: UserListing[];
    activity?: UserActivity[];
    stats: {
      totalListings: number;
      activeListings: number;
      totalViews: number;
      totalInquiries: number;
    };
  }
> = {
  u1: {
    id: "u1",
    name: "Kofi Mensah",
    phone: "+233 24 123 4567",
    email: "kofi.mensah@email.com",
    avatar: "https://i.pravatar.cc/150?img=11",
    role: "owner",
    status: "pending",
    isVerified: false,
    joinedDate: "Dec 20, 2024",
    lastActive: "2 min ago",
    bio: "Professional real estate investor with 5+ years of experience in the Ghanaian property market.",
    location: "Accra, Ghana",
    stats: {
      totalListings: 0,
      activeListings: 0,
      totalViews: 0,
      totalInquiries: 0,
    },
    activity: [
      {
        id: "a1",
        type: "login",
        message: "Logged in from iPhone",
        time: "2 min ago",
      },
      {
        id: "a2",
        type: "listing",
        message: "Submitted listing for review",
        time: "1 hour ago",
      },
    ],
  },
  u2: {
    id: "u2",
    name: "Ama Serwaa",
    phone: "+233 20 234 5678",
    email: "ama.serwaa@email.com",
    avatar: "https://i.pravatar.cc/150?img=5",
    role: "owner",
    status: "active",
    isVerified: true,
    joinedDate: "Nov 15, 2024",
    lastActive: "1 hour ago",
    bio: "Property developer specializing in luxury apartments and residential complexes.",
    location: "East Legon, Accra",
    stats: {
      totalListings: 5,
      activeListings: 4,
      totalViews: 2450,
      totalInquiries: 32,
    },
    listings: [
      {
        id: "l1",
        title: "3 Bed Apartment in East Legon",
        image:
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&h=200&fit=crop",
        price: 450000,
        status: "active",
        views: 890,
      },
      {
        id: "l2",
        title: "2 Bed Apartment in Cantonments",
        image:
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&h=200&fit=crop",
        price: 320000,
        status: "active",
        views: 650,
      },
    ],
    activity: [
      {
        id: "a1",
        type: "listing",
        message: "Updated listing price",
        time: "1 hour ago",
      },
      {
        id: "a2",
        type: "message",
        message: "Replied to inquiry",
        time: "3 hours ago",
      },
      {
        id: "a3",
        type: "payment",
        message: "Subscription renewed",
        time: "2 days ago",
      },
    ],
  },
  u3: {
    id: "u3",
    name: "Kwame Asante",
    phone: "+233 24 345 6789",
    email: "kwame.asante@email.com",
    avatar: "https://i.pravatar.cc/150?img=3",
    role: "buyer",
    status: "active",
    isVerified: true,
    joinedDate: "Oct 10, 2024",
    lastActive: "3 hours ago",
    bio: "Looking for my dream home in Accra.",
    location: "Tema, Ghana",
    stats: {
      totalListings: 0,
      activeListings: 0,
      totalViews: 0,
      totalInquiries: 15,
    },
    activity: [
      {
        id: "a1",
        type: "message",
        message: "Sent inquiry for property",
        time: "3 hours ago",
      },
      { id: "a2", type: "login", message: "Logged in", time: "5 hours ago" },
    ],
  },
  u4: {
    id: "u4",
    name: "Akua Boateng",
    phone: "+233 27 456 7890",
    email: "akua.boateng@email.com",
    avatar: "https://i.pravatar.cc/150?img=9",
    role: "owner",
    status: "pending",
    isVerified: false,
    joinedDate: "Dec 21, 2024",
    lastActive: "5 min ago",
    location: "Kumasi, Ghana",
    stats: {
      totalListings: 0,
      activeListings: 0,
      totalViews: 0,
      totalInquiries: 0,
    },
    activity: [
      {
        id: "a1",
        type: "login",
        message: "Account created",
        time: "5 min ago",
      },
    ],
  },
};

export default function AdminUserProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const chatSheetRef = useRef<BottomSheetModal>(null);
  const actionSheetRef = useRef<BottomSheetModal>(null);

  const [isVerifying, setIsVerifying] = useState(false);

  // Get user from mock data
  const user = MOCK_USERS[id || "u1"] || MOCK_USERS["u1"];

  const chatSnapPoints = useMemo(() => ["40%"], []);

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

  const handleCall = () => {
    const phoneNumber = user.phone.replace(/[^0-9+]/g, "");
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleMessage = () => {
    chatSheetRef.current?.present();
  };

  const handleChatInApp = () => {
    chatSheetRef.current?.dismiss();
    router.push(`/chat/${user.id}` as any);
  };

  const handleChatViaApp = async (app: string) => {
    chatSheetRef.current?.dismiss();
    const formattedPhone = user.phone.replace(/[^0-9]/g, "");

    try {
      let url = "";
      switch (app) {
        case "whatsapp":
          url = `whatsapp://send?phone=${formattedPhone}`;
          break;
        case "sms":
          url = `sms:${formattedPhone}`;
          break;
      }

      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", `${app} is not installed on this device`);
      }
    } catch (error) {
      Alert.alert("Error", `Unable to open ${app}`);
    }
  };

  const handleVerifyUser = () => {
    Alert.alert(
      "Verify User",
      `Are you sure you want to verify ${user.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Verify",
          onPress: () => {
            setIsVerifying(true);
            setTimeout(() => {
              setIsVerifying(false);
              Alert.alert("Success", "User has been verified.", [
                { text: "OK", onPress: () => router.back() },
              ]);
            }, 1500);
          },
        },
      ]
    );
  };

  const handleSuspendUser = () => {
    Alert.alert(
      "Suspend User",
      `Are you sure you want to suspend ${user.name}? They will not be able to access their account.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Suspend",
          style: "destructive",
          onPress: () => {
            actionSheetRef.current?.dismiss();
            Alert.alert("Success", "User has been suspended.", [
              { text: "OK", onPress: () => router.back() },
            ]);
          },
        },
      ]
    );
  };

  const handleDeleteUser = () => {
    Alert.alert(
      "Delete User",
      "This action cannot be undone. All user data will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            actionSheetRef.current?.dismiss();
            Alert.alert("Success", "User has been deleted.", [
              { text: "OK", onPress: () => router.back() },
            ]);
          },
        },
      ]
    );
  };

  const getStatusStyle = () => {
    switch (user.status) {
      case "active":
        return {
          bg: `${colors.primary}15`,
          text: colors.primary,
          label: "Active",
        };
      case "pending":
        return {
          bg: isDark ? "#78350F" : "#FEF3C7",
          text: "#F59E0B",
          label: "Pending",
        };
      case "suspended":
        return {
          bg: isDark ? "#7F1D1D" : "#FEE2E2",
          text: "#EF4444",
          label: "Suspended",
        };
    }
  };

  const getRoleStyle = () => {
    switch (user.role) {
      case "owner":
        return {
          bg: isDark ? "#1E3A8A" : "#DBEAFE",
          text: "#3B82F6",
          label: "Property Owner",
        };
      case "buyer":
        return {
          bg: isDark ? "#581C87" : "#F3E8FF",
          text: "#8B5CF6",
          label: "Buyer",
        };
      case "admin":
        return {
          bg: isDark ? "#7F1D1D" : "#FEE2E2",
          text: "#EF4444",
          label: "Admin",
        };
    }
  };

  const getActivityIcon = (type: UserActivity["type"]) => {
    switch (type) {
      case "login":
        return "log-in";
      case "listing":
        return "home";
      case "message":
        return "chatbubbles";
      case "payment":
        return "card";
    }
  };

  const statusStyle = getStatusStyle();
  const roleStyle = getRoleStyle();

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
          title="User Profile"
          showBackButton
          onBackPress={() => router.back()}
          rightContent={
            <HeaderActionButton
              icon="ellipsis-vertical"
              onPress={() => actionSheetRef.current?.present()}
            />
          }
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: 80 + insets.top,
              paddingBottom: 140 + insets.bottom,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* User Profile Card */}
          <View
            style={[
              styles.profileCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.divider,
              },
            ]}
          >
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: user.avatar }}
                style={[styles.avatar, { borderColor: colors.primary }]}
              />
              {user.isVerified && (
                <View
                  style={[
                    styles.verifiedBadge,
                    {
                      backgroundColor: colors.primary,
                      borderColor: colors.surface,
                    },
                  ]}
                >
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
              )}
            </View>

            <Text style={[styles.userName, { color: colors.text }]}>
              {user.name}
            </Text>

            <View style={styles.userBadges}>
              <View style={[styles.badge, { backgroundColor: roleStyle.bg }]}>
                <Ionicons
                  name={
                    user.role === "owner"
                      ? "home"
                      : user.role === "buyer"
                      ? "search"
                      : "shield"
                  }
                  size={12}
                  color={roleStyle.text}
                />
                <Text style={[styles.badgeText, { color: roleStyle.text }]}>
                  {roleStyle.label}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: statusStyle.text },
                  ]}
                />
                <Text style={[styles.badgeText, { color: statusStyle.text }]}>
                  {statusStyle.label}
                </Text>
              </View>
            </View>

            {user.bio && (
              <Text style={[styles.userBio, { color: colors.textSecondary }]}>
                {user.bio}
              </Text>
            )}

            <View style={styles.userMeta}>
              {user.location && (
                <View style={styles.metaItem}>
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[styles.metaText, { color: colors.textSecondary }]}
                  >
                    {user.location}
                  </Text>
                </View>
              )}
              <View style={styles.metaItem}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text
                  style={[styles.metaText, { color: colors.textSecondary }]}
                >
                  Joined {user.joinedDate}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text
                  style={[styles.metaText, { color: colors.textSecondary }]}
                >
                  Active {user.lastActive}
                </Text>
              </View>
            </View>
          </View>

          {/* Contact Info */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Contact Information
            </Text>
            <View
              style={[
                styles.contactCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
            >
              <View style={styles.contactRow}>
                <View
                  style={[
                    styles.contactIcon,
                    { backgroundColor: `${colors.primary}15` },
                  ]}
                >
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.contactInfo}>
                  <Text
                    style={[
                      styles.contactLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Phone
                  </Text>
                  <Text style={[styles.contactValue, { color: colors.text }]}>
                    {user.phone}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.contactAction,
                    { backgroundColor: `${colors.primary}15` },
                  ]}
                  onPress={handleCall}
                >
                  <Ionicons name="call" size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <View
                style={[
                  styles.contactDivider,
                  { backgroundColor: colors.divider },
                ]}
              />
              <View style={styles.contactRow}>
                <View
                  style={[
                    styles.contactIcon,
                    { backgroundColor: `${colors.primary}15` },
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.contactInfo}>
                  <Text
                    style={[
                      styles.contactLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Email
                  </Text>
                  <Text style={[styles.contactValue, { color: colors.text }]}>
                    {user.email}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.contactAction,
                    { backgroundColor: `${colors.primary}15` },
                  ]}
                  onPress={() => Linking.openURL(`mailto:${user.email}`)}
                >
                  <Ionicons name="mail" size={18} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Stats */}
          {user.role === "owner" && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Statistics
              </Text>
              <View style={styles.statsGrid}>
                <View
                  style={[
                    styles.statCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.divider,
                    },
                  ]}
                >
                  <Text style={[styles.statValue, { color: colors.primary }]}>
                    {user.stats.totalListings}
                  </Text>
                  <Text
                    style={[styles.statLabel, { color: colors.textSecondary }]}
                  >
                    Total Listings
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
                  <Text style={[styles.statValue, { color: colors.primary }]}>
                    {user.stats.activeListings}
                  </Text>
                  <Text
                    style={[styles.statLabel, { color: colors.textSecondary }]}
                  >
                    Active
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
                  <Text style={[styles.statValue, { color: colors.primary }]}>
                    {user.stats.totalViews > 999
                      ? `${(user.stats.totalViews / 1000).toFixed(1)}K`
                      : user.stats.totalViews}
                  </Text>
                  <Text
                    style={[styles.statLabel, { color: colors.textSecondary }]}
                  >
                    Views
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
                  <Text style={[styles.statValue, { color: colors.primary }]}>
                    {user.stats.totalInquiries}
                  </Text>
                  <Text
                    style={[styles.statLabel, { color: colors.textSecondary }]}
                  >
                    Inquiries
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Listings */}
          {user.listings && user.listings.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Properties
                </Text>
                <TouchableOpacity>
                  <Text style={[styles.seeAllText, { color: colors.primary }]}>
                    See All
                  </Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.listingsScroll}
              >
                {user.listings.map((listing) => (
                  <TouchableOpacity
                    key={listing.id}
                    style={[
                      styles.listingCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.divider,
                      },
                    ]}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: listing.image }}
                      style={styles.listingImage}
                    />
                    <View
                      style={[
                        styles.listingStatusBadge,
                        {
                          backgroundColor:
                            listing.status === "active"
                              ? colors.primary
                              : listing.status === "pending"
                              ? "#F59E0B"
                              : "#EF4444",
                        },
                      ]}
                    >
                      <Text style={styles.listingStatusText}>
                        {listing.status.charAt(0).toUpperCase() +
                          listing.status.slice(1)}
                      </Text>
                    </View>
                    <View style={styles.listingInfo}>
                      <Text
                        style={[styles.listingTitle, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {listing.title}
                      </Text>
                      <Text
                        style={[styles.listingPrice, { color: colors.primary }]}
                      >
                        ₵{listing.price.toLocaleString()}
                      </Text>
                      <View style={styles.listingViews}>
                        <Ionicons
                          name="eye-outline"
                          size={12}
                          color={colors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.listingViewsText,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {listing.views} views
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Recent Activity */}
          {user.activity && user.activity.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Recent Activity
              </Text>
              <View
                style={[
                  styles.activityCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.divider,
                  },
                ]}
              >
                {user.activity.map((activity, index) => (
                  <View
                    key={activity.id}
                    style={[
                      styles.activityItem,
                      { borderBottomColor: colors.divider },
                      index === user.activity!.length - 1 && {
                        borderBottomWidth: 0,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.activityIcon,
                        { backgroundColor: `${colors.primary}15` },
                      ]}
                    >
                      <Ionicons
                        name={getActivityIcon(activity.type) as any}
                        size={18}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.activityContent}>
                      <Text
                        style={[styles.activityMessage, { color: colors.text }]}
                      >
                        {activity.message}
                      </Text>
                      <Text
                        style={[
                          styles.activityTime,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {activity.time}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Admin Actions for Pending Users */}
          {user.status === "pending" && (
            <View style={styles.pendingActions}>
              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  { backgroundColor: colors.primary },
                  isVerifying && styles.buttonDisabled,
                ]}
                onPress={handleVerifyUser}
                disabled={isVerifying}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
                <Text style={styles.verifyButtonText}>
                  {isVerifying ? "Verifying..." : "Verify User"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Fixed Action Bar */}
        <View
          style={[
            styles.actionBar,
            {
              paddingBottom: insets.bottom + Spacing.md,
              backgroundColor: colors.background,
              borderTopColor: colors.divider,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.callActionButton,
              { backgroundColor: colors.primary },
            ]}
            onPress={handleCall}
            activeOpacity={0.8}
          >
            <Ionicons name="call" size={20} color="#FFFFFF" />
            <Text style={styles.callActionText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.messageActionButton,
              {
                backgroundColor: `${colors.primary}15`,
                borderColor: colors.primary,
              },
            ]}
            onPress={handleMessage}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubbles" size={20} color={colors.primary} />
            <Text style={[styles.messageActionText, { color: colors.primary }]}>
              Message
            </Text>
          </TouchableOpacity>
        </View>

        {/* Chat Options Bottom Sheet */}
        <BottomSheetModal
          ref={chatSheetRef}
          index={0}
          snapPoints={chatSnapPoints}
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={{ backgroundColor: colors.divider }}
          backgroundStyle={{ backgroundColor: colors.surface }}
        >
          <BottomSheetView style={styles.chatSheetContent}>
            <Text style={[styles.chatSheetTitle, { color: colors.text }]}>
              Choose how to contact
            </Text>

            {/* In-App Chat Option */}
            <TouchableOpacity
              style={[
                styles.chatOption,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
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
                style={[
                  styles.dividerLine,
                  { backgroundColor: colors.divider },
                ]}
              />
              <Text
                style={[styles.dividerText, { color: colors.textSecondary }]}
              >
                Or use external apps
              </Text>
              <View
                style={[
                  styles.dividerLine,
                  { backgroundColor: colors.divider },
                ]}
              />
            </View>

            {/* External Apps */}
            <View style={styles.externalApps}>
              <TouchableOpacity
                style={styles.externalApp}
                onPress={() => handleChatViaApp("whatsapp")}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.externalAppIcon,
                    { backgroundColor: "#25D36615" },
                  ]}
                >
                  <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
                </View>
                <Text style={styles.externalAppText}>WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.externalApp}
                onPress={() => handleChatViaApp("sms")}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.externalAppIcon,
                    { backgroundColor: "#3B82F615" },
                  ]}
                >
                  <Ionicons name="chatbox" size={24} color="#3B82F6" />
                </View>
                <Text
                  style={[
                    styles.externalAppText,
                    { color: colors.textSecondary },
                  ]}
                >
                  SMS
                </Text>
              </TouchableOpacity>
            </View>
          </BottomSheetView>
        </BottomSheetModal>

        {/* Actions Bottom Sheet */}
        <BottomSheetModal
          ref={actionSheetRef}
          index={0}
          snapPoints={["40%"]}
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={{ backgroundColor: colors.divider }}
          backgroundStyle={{ backgroundColor: colors.surface }}
        >
          <BottomSheetView style={styles.actionSheetContent}>
            <Text style={[styles.actionSheetTitle, { color: colors.text }]}>
              User Actions
            </Text>

            {user.status === "pending" && (
              <TouchableOpacity
                style={styles.actionSheetItem}
                onPress={() => {
                  actionSheetRef.current?.dismiss();
                  handleVerifyUser();
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.actionSheetIcon,
                    { backgroundColor: `${colors.primary}15` },
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={colors.primary}
                  />
                </View>
                <Text
                  style={[styles.actionSheetItemText, { color: colors.text }]}
                >
                  Verify User
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            )}

            {user.status !== "suspended" && (
              <TouchableOpacity
                style={styles.actionSheetItem}
                onPress={handleSuspendUser}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.actionSheetIcon,
                    {
                      backgroundColor: isDark ? "#78350F" : "#FEF3C7",
                    },
                  ]}
                >
                  <Ionicons name="ban" size={22} color="#F59E0B" />
                </View>
                <Text
                  style={[styles.actionSheetItemText, { color: colors.text }]}
                >
                  Suspend User
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            )}

            {user.status === "suspended" && (
              <TouchableOpacity
                style={styles.actionSheetItem}
                onPress={() => {
                  actionSheetRef.current?.dismiss();
                  Alert.alert("Success", "User has been reactivated.");
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.actionSheetIcon,
                    { backgroundColor: `${colors.primary}15` },
                  ]}
                >
                  <Ionicons name="refresh" size={22} color={colors.primary} />
                </View>
                <Text
                  style={[styles.actionSheetItemText, { color: colors.text }]}
                >
                  Reactivate User
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.actionSheetItem}
              onPress={handleDeleteUser}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.actionSheetIcon,
                  {
                    backgroundColor: isDark ? "#7F1D1D" : "#FEE2E2",
                  },
                ]}
              >
                <Ionicons name="trash" size={22} color="#EF4444" />
              </View>
              <Text style={[styles.actionSheetItemText, { color: "#EF4444" }]}>
                Delete User
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#EF4444" />
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
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  // Profile Card
  profileCard: {
    borderRadius: 24,
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.lg,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  avatarContainer: {
    position: "relative",
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
  },
  userName: {
    ...Typography.headlineMedium,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  userBadges: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: "600",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  userBio: {
    ...Typography.bodyMedium,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  userMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.md,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    ...Typography.caption,
    fontSize: 13,
  },
  // Section
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: Spacing.md,
  },
  seeAllText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
  },
  // Contact Card
  contactCard: {
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 1,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    ...Typography.caption,
    fontSize: 12,
    marginBottom: 2,
  },
  contactValue: {
    ...Typography.labelMedium,
    fontSize: 15,
    fontWeight: "600",
  },
  contactAction: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  contactDivider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  // Stats
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 14,
    padding: Spacing.md,
    alignItems: "center",
    borderWidth: 1,
  },
  statValue: {
    ...Typography.headlineMedium,
    fontSize: 24,
    fontWeight: "700",
  },
  statLabel: {
    ...Typography.caption,
    fontSize: 12,
    marginTop: 2,
  },
  // Listings
  listingsScroll: {
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  listingCard: {
    width: 160,
    borderRadius: 14,
    marginRight: Spacing.md,
    overflow: "hidden",
    borderWidth: 1,
  },
  listingImage: {
    width: "100%",
    height: 100,
  },
  listingStatusBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  listingStatusText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  listingInfo: {
    padding: Spacing.sm,
  },
  listingTitle: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  listingPrice: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  listingViews: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  listingViewsText: {
    ...Typography.caption,
    fontSize: 11,
  },
  // Activity
  activityCard: {
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    ...Typography.bodyMedium,
    fontSize: 14,
  },
  activityTime: {
    ...Typography.caption,
    fontSize: 12,
    marginTop: 2,
  },
  // Pending Actions
  pendingActions: {
    marginTop: Spacing.md,
  },
  verifyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: 16,
  },
  verifyButtonText: {
    ...Typography.labelLarge,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  buttonDisabled: {
    opacity: 0.6,
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
  callActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: 14,
  },
  callActionText: {
    ...Typography.labelMedium,
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  messageActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  messageActionText: {
    ...Typography.labelMedium,
    fontSize: 15,
    fontWeight: "700",
  },
  // Chat Sheet
  chatSheetContent: {
    padding: Spacing.xl,
  },
  chatSheetTitle: {
    ...Typography.titleMedium,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  chatOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
  },
  chatOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  chatOptionContent: {
    flex: 1,
  },
  chatOptionTitle: {
    ...Typography.labelMedium,
    fontSize: 15,
    fontWeight: "600",
  },
  chatOptionSubtitle: {
    ...Typography.caption,
    fontSize: 13,
  },
  chatDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    ...Typography.caption,
    fontSize: 12,
  },
  externalApps: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.xl,
  },
  externalApp: {
    alignItems: "center",
    gap: Spacing.sm,
  },
  externalAppIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  externalAppText: {
    ...Typography.caption,
    fontSize: 12,
  },
  // Action Sheet
  actionSheetContent: {
    padding: Spacing.xl,
  },
  actionSheetTitle: {
    ...Typography.titleMedium,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.lg,
  },
  actionSheetItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  actionSheetIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionSheetItemText: {
    ...Typography.bodyMedium,
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
});
