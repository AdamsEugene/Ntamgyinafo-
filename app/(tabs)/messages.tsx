import React, { useState, useRef, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  TextInput,
  Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Swipeable } from "react-native-gesture-handler";
import { Colors, Typography, Spacing } from "@/constants/design";
import {
  FloatingHeader,
  HeaderActionButton,
} from "@/components/FloatingHeader";

interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    isOnline: boolean;
    isVerified: boolean;
  };
  property?: {
    id: string;
    title: string;
  };
  lastMessage: {
    text: string;
    time: string;
    isFromMe: boolean;
    isRead: boolean;
    isDelivered: boolean;
  };
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isTyping: boolean;
}

// Mock conversations for buyers
const CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    user: {
      id: "o1",
      name: "Kofi Properties Ltd",
      avatar: "https://i.pravatar.cc/150?img=11",
      isOnline: true,
      isVerified: true,
    },
    property: {
      id: "p1",
      title: "4 Bedroom House in East Legon",
    },
    lastMessage: {
      text: "Yes, the property is still available. When would you like to schedule a viewing?",
      time: "2:30 PM",
      isFromMe: false,
      isRead: false,
      isDelivered: true,
    },
    unreadCount: 1,
    isPinned: true,
    isMuted: false,
    isTyping: false,
  },
  {
    id: "2",
    user: {
      id: "o2",
      name: "Ama Realty",
      avatar: "https://i.pravatar.cc/150?img=21",
      isOnline: true,
      isVerified: true,
    },
    property: {
      id: "p2",
      title: "3 Bedroom Apartment in Airport",
    },
    lastMessage: {
      text: "The apartment is available for viewing this weekend.",
      time: "Yesterday",
      isFromMe: false,
      isRead: true,
      isDelivered: true,
    },
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    isTyping: true,
  },
  {
    id: "3",
    user: {
      id: "o3",
      name: "Accra Homes",
      avatar: "https://i.pravatar.cc/150?img=33",
      isOnline: false,
      isVerified: true,
    },
    property: {
      id: "p3",
      title: "2 Plots of Land in Tema",
    },
    lastMessage: {
      text: "Thank you for your interest. I'll send you the documents.",
      time: "Dec 19",
      isFromMe: true,
      isRead: true,
      isDelivered: true,
    },
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    isTyping: false,
  },
  {
    id: "4",
    user: {
      id: "o4",
      name: "Ghana Prime Properties",
      avatar: "https://i.pravatar.cc/150?img=44",
      isOnline: false,
      isVerified: false,
    },
    lastMessage: {
      text: "I'll get back to you with more details about the property.",
      time: "Dec 18",
      isFromMe: false,
      isRead: true,
      isDelivered: true,
    },
    unreadCount: 0,
    isPinned: false,
    isMuted: true,
    isTyping: false,
  },
];

export default function BuyerMessagesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const filteredConversations = useMemo(() => {
    let filtered = CONVERSATIONS;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.user.name.toLowerCase().includes(query) ||
          c.lastMessage.text.toLowerCase().includes(query) ||
          c.property?.title.toLowerCase().includes(query)
      );
    }
    // Sort: pinned first, then by time
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }, [searchQuery]);

  const handleChatPress = (conversation: Conversation) => {
    // Close any open swipeables
    Object.values(swipeableRefs.current).forEach((ref) => ref?.close());
    // Navigate to chat
    router.push(`/chat/${conversation.user.id}` as any);
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    conversation: Conversation
  ) => {
    const translateX = dragX.interpolate({
      inputRange: [-160, 0],
      outputRange: [0, 160],
      extrapolate: "clamp",
    });

    return (
      <View style={styles.swipeActionsContainer}>
        <Animated.View
          style={[styles.swipeActions, { transform: [{ translateX }] }]}
        >
          {/* Mute/Unmute */}
          <TouchableOpacity
            style={[styles.swipeAction, styles.swipeActionMute]}
            onPress={() => {
              swipeableRefs.current[conversation.id]?.close();
            }}
          >
            <Ionicons
              name={
                conversation.isMuted ? "notifications" : "notifications-off"
              }
              size={22}
              color="#FFFFFF"
            />
            <Text style={styles.swipeActionText}>
              {conversation.isMuted ? "Unmute" : "Mute"}
            </Text>
          </TouchableOpacity>

          {/* Archive */}
          <TouchableOpacity
            style={[styles.swipeAction, styles.swipeActionArchive]}
            onPress={() => {
              swipeableRefs.current[conversation.id]?.close();
            }}
          >
            <Ionicons name="archive" size={22} color="#FFFFFF" />
            <Text style={styles.swipeActionText}>Archive</Text>
          </TouchableOpacity>

          {/* Delete */}
          <TouchableOpacity
            style={[styles.swipeAction, styles.swipeActionDelete]}
            onPress={() => {
              swipeableRefs.current[conversation.id]?.close();
            }}
          >
            <Ionicons name="trash" size={22} color="#FFFFFF" />
            <Text style={styles.swipeActionText}>Delete</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <Swipeable
      ref={(ref) => {
        swipeableRefs.current[item.id] = ref;
      }}
      renderRightActions={(progress, dragX) =>
        renderRightActions(progress, dragX, item)
      }
      overshootRight={false}
      friction={2}
    >
      <TouchableOpacity
        style={[
          styles.conversationCard,
          item.isPinned && styles.conversationCardPinned,
        ]}
        activeOpacity={0.7}
        onPress={() => handleChatPress(item)}
      >
        {/* Avatar with Online Status */}
        <View style={styles.avatarContainer}>
          <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
          {item.user.isOnline && <View style={styles.onlineIndicator} />}
          {item.user.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={8} color="#FFFFFF" />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.conversationContent}>
          {/* Header Row */}
          <View style={styles.conversationHeader}>
            <View style={styles.nameContainer}>
              {item.isPinned && (
                <Ionicons
                  name="pin"
                  size={14}
                  color={Colors.textSecondary}
                  style={styles.pinIcon}
                />
              )}
              <Text
                style={[
                  styles.userName,
                  item.unreadCount > 0 && styles.userNameUnread,
                ]}
                numberOfLines={1}
              >
                {item.user.name}
              </Text>
            </View>
            <View style={styles.timeContainer}>
              {item.lastMessage.isFromMe && (
                <View style={styles.readStatus}>
                  <Ionicons
                    name={
                      item.lastMessage.isRead ? "checkmark-done" : "checkmark"
                    }
                    size={16}
                    color={
                      item.lastMessage.isRead
                        ? Colors.primaryGreen
                        : Colors.textSecondary
                    }
                  />
                </View>
              )}
              <Text
                style={[styles.time, item.unreadCount > 0 && styles.timeUnread]}
              >
                {item.lastMessage.time}
              </Text>
            </View>
          </View>

          {/* Property Context */}
          {item.property && (
            <View style={styles.propertyContext}>
              <Ionicons name="home" size={10} color={Colors.primaryGreen} />
              <Text style={styles.propertyTitle} numberOfLines={1}>
                {item.property.title}
              </Text>
            </View>
          )}

          {/* Last Message Row */}
          <View style={styles.lastMessageRow}>
            <View style={styles.messagePreviewContainer}>
              {item.isTyping ? (
                <View style={styles.typingIndicator}>
                  <Text style={styles.typingText}>typing</Text>
                  <View style={styles.typingDots}>
                    <View style={[styles.typingDot, styles.typingDot1]} />
                    <View style={[styles.typingDot, styles.typingDot2]} />
                    <View style={[styles.typingDot, styles.typingDot3]} />
                  </View>
                </View>
              ) : (
                <Text
                  style={[
                    styles.lastMessage,
                    item.unreadCount > 0 && styles.lastMessageUnread,
                  ]}
                  numberOfLines={1}
                >
                  {item.lastMessage.isFromMe && (
                    <Text style={styles.youPrefix}>You: </Text>
                  )}
                  {item.lastMessage.text}
                </Text>
              )}
            </View>

            {/* Badges */}
            <View style={styles.badgesContainer}>
              {item.isMuted && (
                <Ionicons
                  name="notifications-off"
                  size={16}
                  color={Colors.textSecondary}
                  style={styles.mutedIcon}
                />
              )}
              {item.unreadCount > 0 && (
                <View
                  style={[
                    styles.unreadBadge,
                    item.isMuted && styles.unreadBadgeMuted,
                  ]}
                >
                  <Text style={styles.unreadBadgeText}>
                    {item.unreadCount > 99 ? "99+" : item.unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
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

        {/* Floating Header with Blur */}
        <FloatingHeader
          title="Messages"
          showBackButton={isSearching}
          onBackPress={() => {
            setIsSearching(false);
            setSearchQuery("");
          }}
          rightContent={
            <HeaderActionButton
              icon="search-outline"
              onPress={() => setIsSearching(!isSearching)}
            />
          }
        />

        {/* Search Bar */}
        {isSearching && (
          <View style={[styles.searchContainer, { top: 70 + insets.top }]}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={18} color={Colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search messages..."
                placeholderTextColor={Colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
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
        )}

        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.id}
          renderItem={renderConversation}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: isSearching ? 130 + insets.top : 80 + insets.top,
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
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={56}
                  color={Colors.textSecondary}
                />
              </View>
              <Text style={styles.emptyTitle}>
                {searchQuery ? "No Results Found" : "No Messages Yet"}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? "Try searching with different keywords"
                  : "Messages from property owners will appear here"}
              </Text>
            </View>
          }
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
  // Search
  searchContainer: {
    position: "absolute",
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 10,
  },
  searchInputContainer: {
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
    paddingVertical: 4,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  // Conversation Card - Telegram Style
  conversationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.divider,
  },
  conversationCardPinned: {
    backgroundColor: `${Colors.primaryGreen}05`,
  },
  avatarContainer: {
    position: "relative",
    marginRight: Spacing.md,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.primaryGreen,
    borderWidth: 2.5,
    borderColor: Colors.surface,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: Spacing.sm,
  },
  pinIcon: {
    marginRight: 4,
    transform: [{ rotate: "45deg" }],
  },
  userName: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: "500",
    color: Colors.textPrimary,
    flex: 1,
  },
  userNameUnread: {
    fontWeight: "700",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  readStatus: {
    marginRight: 2,
  },
  time: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  timeUnread: {
    color: Colors.primaryGreen,
    fontWeight: "600",
  },
  propertyContext: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  propertyTitle: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.primaryGreen,
    fontWeight: "500",
    flex: 1,
  },
  lastMessageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  messagePreviewContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  lastMessage: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  lastMessageUnread: {
    color: Colors.textPrimary,
  },
  youPrefix: {
    color: Colors.textSecondary,
    fontWeight: "400",
  },
  // Typing Indicator
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  typingText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.primaryGreen,
    fontStyle: "italic",
    marginRight: 4,
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primaryGreen,
  },
  typingDot1: {
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.6,
  },
  typingDot3: {
    opacity: 1,
  },
  // Badges
  badgesContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  mutedIcon: {
    opacity: 0.6,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primaryGreen,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadBadgeMuted: {
    backgroundColor: Colors.textSecondary,
  },
  unreadBadgeText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  // Swipe Actions
  swipeActionsContainer: {
    width: 200,
    flexDirection: "row",
  },
  swipeActions: {
    flex: 1,
    flexDirection: "row",
  },
  swipeAction: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  swipeActionMute: {
    backgroundColor: "#F59E0B",
  },
  swipeActionArchive: {
    backgroundColor: "#3B82F6",
  },
  swipeActionDelete: {
    backgroundColor: "#EF4444",
  },
  swipeActionText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 4,
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
});
