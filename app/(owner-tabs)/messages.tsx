import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Typography, Spacing } from "@/constants/design";
import {
  FloatingHeaderStyles,
  HEADER_ICON_SIZE,
} from "@/components/FloatingHeader.styles";

// Mock conversations
const CONVERSATIONS = [
  {
    id: "1",
    user: {
      name: "Kwame Asante",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
    property: "4 Bedroom House in East Legon",
    lastMessage:
      "Is the property still available? I would like to schedule a viewing.",
    time: "2:30 PM",
    unread: true,
    unreadCount: 2,
  },
  {
    id: "2",
    user: {
      name: "Ama Mensah",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    property: "3 Bedroom Apartment in Airport",
    lastMessage: "Thank you for the information. I'll get back to you soon.",
    time: "11:45 AM",
    unread: false,
    unreadCount: 0,
  },
  {
    id: "3",
    user: {
      name: "Kofi Owusu",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    },
    property: "2 Plots of Land in Tema",
    lastMessage: "What are the terms of payment?",
    time: "Yesterday",
    unread: true,
    unreadCount: 1,
  },
  {
    id: "4",
    user: {
      name: "Akosua Boateng",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    },
    property: "Executive Mansion in Trasacco",
    lastMessage: "I am interested in the property. Can we arrange a visit?",
    time: "Dec 18",
    unread: false,
    unreadCount: 0,
  },
];

export default function OwnerMessagesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const renderConversation = ({
    item,
  }: {
    item: (typeof CONVERSATIONS)[0];
  }) => (
    <TouchableOpacity
      style={styles.conversationCard}
      activeOpacity={0.8}
      onPress={() => {
        // TODO: Navigate to chat screen
      }}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
        {item.unread && <View style={styles.unreadDot} />}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.user.name}
          </Text>
          <Text style={[styles.time, item.unread && styles.timeUnread]}>
            {item.time}
          </Text>
        </View>

        <Text style={styles.propertyContext} numberOfLines={1}>
          {item.property}
        </Text>

        <Text
          style={[styles.lastMessage, item.unread && styles.lastMessageUnread]}
          numberOfLines={1}
        >
          {item.lastMessage}
        </Text>
      </View>

      {item.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* Header */}
        <View
          style={[
            FloatingHeaderStyles.floatingHeader,
            { paddingTop: insets.top + Spacing.md },
          ]}
        >
          <Text style={styles.headerTitle}>Messages</Text>

          <TouchableOpacity
            style={FloatingHeaderStyles.actionButton}
            activeOpacity={0.7}
          >
            <View style={FloatingHeaderStyles.actionButtonBackground}>
              <Ionicons
                name="search-outline"
                size={HEADER_ICON_SIZE}
                color={Colors.textPrimary}
              />
            </View>
          </TouchableOpacity>
        </View>

        <FlatList
          data={CONVERSATIONS}
          keyExtractor={(item) => item.id}
          renderItem={renderConversation}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: 80 + insets.top,
              paddingBottom: 100 + insets.bottom,
            },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={64}
                  color={Colors.textSecondary}
                />
              </View>
              <Text style={styles.emptyTitle}>No Messages Yet</Text>
              <Text style={styles.emptySubtitle}>
                Messages from potential buyers will appear here
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
  headerTitle: {
    ...Typography.headlineMedium,
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
  },
  conversationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  avatarContainer: {
    position: "relative",
    marginRight: Spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  unreadDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.primaryGreen,
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
    marginBottom: 4,
  },
  userName: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
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
    ...Typography.caption,
    fontSize: 11,
    color: Colors.primaryGreen,
    marginBottom: 4,
  },
  lastMessage: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  lastMessageUnread: {
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primaryGreen,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    marginLeft: Spacing.sm,
  },
  unreadBadgeText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["2xl"] * 2,
    paddingHorizontal: Spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.headlineMedium,
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.bodyMedium,
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
