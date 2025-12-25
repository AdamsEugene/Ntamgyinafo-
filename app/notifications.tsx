import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Swipeable } from "react-native-gesture-handler";
import { Colors, Typography, Spacing } from "@/constants/design";
import { useTheme } from "@/contexts/ThemeContext";
import { FloatingHeader } from "@/components/FloatingHeader";

interface Notification {
  id: string;
  type:
    | "inquiry"
    | "message"
    | "listing"
    | "payment"
    | "system"
    | "verification";
  title: string;
  message: string;
  time: string;
  timestamp: string;
  isRead: boolean;
  navigateTo?: string;
  data?: {
    propertyId?: string;
    chatId?: string;
    userId?: string;
  };
}

// Mock notifications data
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "inquiry",
    title: "New Inquiry",
    message: "Kwame Asante is interested in your 4 Bedroom House in East Legon",
    time: "2 min ago",
    timestamp: "2024-12-22T14:30:00",
    isRead: false,
    navigateTo: "/chat/1",
    data: { chatId: "1", propertyId: "p1" },
  },
  {
    id: "2",
    type: "message",
    title: "New Message",
    message: "You have a new message from Ama Serwaa",
    time: "15 min ago",
    timestamp: "2024-12-22T14:17:00",
    isRead: false,
    navigateTo: "/chat/2",
    data: { chatId: "2" },
  },
  {
    id: "3",
    type: "listing",
    title: "Listing Approved",
    message:
      "Your listing '3 Bedroom Apartment in Cantonments' has been approved and is now live!",
    time: "1 hour ago",
    timestamp: "2024-12-22T13:30:00",
    isRead: false,
    navigateTo: "/owner-listing/p2",
    data: { propertyId: "p2" },
  },
  {
    id: "4",
    type: "payment",
    title: "Payment Successful",
    message: "Your subscription payment of GHS 80 was successful",
    time: "3 hours ago",
    timestamp: "2024-12-22T11:30:00",
    isRead: true,
    navigateTo: "/payment-receipt",
  },
  {
    id: "5",
    type: "inquiry",
    title: "New Inquiry",
    message: "Kofi Boateng wants to schedule a viewing for your property",
    time: "5 hours ago",
    timestamp: "2024-12-22T09:30:00",
    isRead: true,
    navigateTo: "/chat/3",
    data: { chatId: "3", propertyId: "p1" },
  },
  {
    id: "6",
    type: "system",
    title: "Subscription Expiring Soon",
    message: "Your Standard plan expires in 5 days. Renew now to continue.",
    time: "1 day ago",
    timestamp: "2024-12-21T14:30:00",
    isRead: true,
    navigateTo: "/subscription-plans",
  },
  {
    id: "7",
    type: "listing",
    title: "Price Drop Alert",
    message: "A property you saved has reduced its price by 10%! Check it out.",
    time: "2 days ago",
    timestamp: "2024-12-20T10:00:00",
    isRead: true,
    navigateTo: "/property/p3",
    data: { propertyId: "p3" },
  },
  {
    id: "8",
    type: "verification",
    title: "Verification Complete",
    message: "Your account has been verified. You can now list properties.",
    time: "1 week ago",
    timestamp: "2024-12-15T09:00:00",
    isRead: true,
  },
];

type FilterTab = "all" | "unread";

const NOTIFICATION_ICONS: Record<
  Notification["type"],
  keyof typeof Ionicons.glyphMap
> = {
  inquiry: "chatbubble-ellipses",
  message: "mail",
  listing: "home",
  payment: "card",
  system: "notifications",
  verification: "shield-checkmark",
};

const NOTIFICATION_COLORS: Record<Notification["type"], string> = {
  inquiry: "#3B82F6",
  message: Colors.primaryGreen,
  listing: "#8B5CF6",
  payment: "#F59E0B",
  system: "#6B7280",
  verification: Colors.primaryGreen,
};

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [notifications, setNotifications] =
    useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [refreshing, setRefreshing] = useState(false);
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => !n.isRead);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
    );

    // Navigate if applicable
    if (notification.navigateTo) {
      router.push(notification.navigateTo as any);
    }
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    swipeableRefs.current.get(id)?.close();
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    notification: Notification
  ) => {
    const translateX = dragX.interpolate({
      inputRange: [-160, 0],
      outputRange: [0, 160],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={[styles.swipeActionsContainer, { transform: [{ translateX }] }]}
      >
        {!notification.isRead && (
          <TouchableOpacity
            style={[styles.swipeAction, styles.swipeActionRead]}
            onPress={() => handleMarkAsRead(notification.id)}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-done" size={22} color="#FFFFFF" />
            <Text style={styles.swipeActionText}>Read</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.swipeAction, styles.swipeActionDelete]}
          onPress={() => handleDeleteNotification(notification.id)}
          activeOpacity={0.8}
        >
          <Ionicons name="trash" size={22} color="#FFFFFF" />
          <Text style={styles.swipeActionText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const iconName = NOTIFICATION_ICONS[item.type];
    const iconColor = NOTIFICATION_COLORS[item.type];

    return (
      <Swipeable
        ref={(ref) => {
          if (ref) {
            swipeableRefs.current.set(item.id, ref);
          }
        }}
        renderRightActions={(progress, dragX) =>
          renderRightActions(progress, dragX, item)
        }
        overshootRight={false}
        friction={2}
      >
        <TouchableOpacity
          style={[
            styles.notificationItem,
            { backgroundColor: colors.surface },
            !item.isRead && { backgroundColor: `${colors.primary}08` },
          ]}
          onPress={() => handleNotificationPress(item)}
          activeOpacity={0.7}
        >
          {/* Unread Indicator */}
          {!item.isRead && (
            <View
              style={[styles.unreadDot, { backgroundColor: colors.primary }]}
            />
          )}

          {/* Icon */}
          <View
            style={[
              styles.notificationIcon,
              { backgroundColor: `${iconColor}15` },
            ]}
          >
            <Ionicons name={iconName} size={22} color={iconColor} />
          </View>

          {/* Content */}
          <View style={styles.notificationContent}>
            <View style={styles.notificationHeader}>
              <Text
                style={[
                  styles.notificationTitle,
                  { color: colors.text },
                  !item.isRead && styles.notificationTitleUnread,
                ]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text
                style={[
                  styles.notificationTime,
                  { color: colors.textSecondary },
                ]}
              >
                {item.time}
              </Text>
            </View>
            <Text
              style={[
                styles.notificationMessage,
                { color: colors.textSecondary },
                !item.isRead && { color: colors.text },
              ]}
              numberOfLines={2}
            >
              {item.message}
            </Text>
          </View>

          {/* Arrow */}
          {item.navigateTo && (
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textSecondary}
              style={styles.notificationArrow}
            />
          )}
        </TouchableOpacity>
      </Swipeable>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View
        style={[
          styles.emptyIconContainer,
          { backgroundColor: colors.surface, borderColor: colors.divider },
        ]}
      >
        <Ionicons
          name="notifications-off-outline"
          size={64}
          color={colors.textSecondary}
        />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {activeTab === "unread" ? "All Caught Up!" : "No Notifications"}
      </Text>
      <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
        {activeTab === "unread"
          ? "You've read all your notifications"
          : "You don't have any notifications yet.\nWe'll notify you when something happens."}
      </Text>
    </View>
  );

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Floating Header with Blur */}
        <FloatingHeader
          title="Notifications"
          showBackButton
          onBackPress={() => router.back()}
          rightContent={
            unreadCount > 0 ? (
              <TouchableOpacity
                style={styles.markAllReadButton}
                onPress={handleMarkAllRead}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="checkmark-done"
                  size={18}
                  color={colors.primary}
                />
                <Text
                  style={[styles.markAllReadText, { color: colors.primary }]}
                >
                  Mark All Read
                </Text>
              </TouchableOpacity>
            ) : undefined
          }
        />

        {/* Filter Tabs */}
        <View
          style={[
            styles.filterTabsContainer,
            { top: 70 + insets.top, backgroundColor: colors.background },
          ]}
        >
          <View
            style={[
              styles.filterTabs,
              { backgroundColor: colors.surface, borderColor: colors.divider },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.filterTab,
                activeTab === "all" && { backgroundColor: colors.primary },
              ]}
              onPress={() => setActiveTab("all")}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  { color: colors.textSecondary },
                  activeTab === "all" && styles.filterTabTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterTab,
                activeTab === "unread" && { backgroundColor: colors.primary },
              ]}
              onPress={() => setActiveTab("unread")}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  { color: colors.textSecondary },
                  activeTab === "unread" && styles.filterTabTextActive,
                ]}
              >
                Unread
              </Text>
              {unreadCount > 0 && (
                <View style={styles.filterTabBadge}>
                  <Text style={styles.filterTabBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications List */}
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingTop: 120 + insets.top,
              paddingBottom: 40 + insets.bottom,
            },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              progressViewOffset={120 + insets.top}
            />
          }
          ItemSeparatorComponent={() => (
            <View
              style={[styles.separator, { backgroundColor: colors.divider }]}
            />
          )}
        />
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
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: "center",
  },
  headerBadgeText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  markAllReadButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  markAllReadText: {
    ...Typography.labelMedium,
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
  // Filter Tabs
  filterTabsContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 9,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
  },
  filterTabs: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  filterTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: Spacing.sm,
    borderRadius: 10,
  },
  filterTabActive: {
    backgroundColor: Colors.primaryGreen,
  },
  filterTabText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  filterTabTextActive: {
    color: "#FFFFFF",
  },
  filterTabBadge: {
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 20,
    alignItems: "center",
  },
  filterTabBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  // List
  listContent: {
    paddingHorizontal: Spacing.lg,
    flexGrow: 1,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.divider,
    marginLeft: 72,
  },
  // Notification Item
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.surface,
    gap: Spacing.md,
  },
  notificationItemUnread: {
    backgroundColor: `${Colors.primaryGreen}08`,
  },
  unreadDot: {
    position: "absolute",
    left: 0,
    width: 4,
    height: 40,
    backgroundColor: Colors.primaryGreen,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationContent: {
    flex: 1,
    gap: 4,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  notificationTitle: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textPrimary,
    flex: 1,
  },
  notificationTitleUnread: {
    fontWeight: "700",
  },
  notificationTime: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  notificationMessage: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  notificationMessageUnread: {
    color: Colors.textPrimary,
  },
  notificationArrow: {
    marginLeft: Spacing.xs,
  },
  // Swipe Actions
  swipeActionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  swipeAction: {
    width: 80,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  swipeActionRead: {
    backgroundColor: "#3B82F6",
  },
  swipeActionDelete: {
    backgroundColor: "#EF4444",
  },
  swipeActionText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Empty State
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    paddingTop: 80,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
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
  emptyMessage: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
