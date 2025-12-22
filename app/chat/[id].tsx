import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Alert,
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
import { Colors, Typography, Spacing } from "@/constants/design";

interface Message {
  id: string;
  text: string;
  timestamp: string;
  time: string;
  isFromMe: boolean;
  isRead: boolean;
  isDelivered: boolean;
  type: "text" | "image" | "property";
  imageUrl?: string;
  property?: {
    id: string;
    title: string;
    price: string;
    image: string;
  };
}

interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: string;
  isVerified: boolean;
  phone?: string;
}

interface PropertyContext {
  id: string;
  title: string;
  price: string;
  image: string;
}

// Mock chat data
const CHAT_USER: ChatUser = {
  id: "u1",
  name: "Kwame Asante",
  avatar: "https://i.pravatar.cc/150?img=3",
  isOnline: true,
  lastSeen: "Online",
  isVerified: false,
  phone: "+233241234567",
};

const PROPERTY_CONTEXT: PropertyContext = {
  id: "p1",
  title: "4 Bedroom House in East Legon",
  price: "GHS 850,000",
  image:
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&h=200&fit=crop",
};

const MESSAGES: Message[] = [
  {
    id: "1",
    text: "Hello! I'm interested in the 4 Bedroom House in East Legon. Is it still available?",
    timestamp: "2024-12-22T09:00:00",
    time: "9:00 AM",
    isFromMe: false,
    isRead: true,
    isDelivered: true,
    type: "text",
  },
  {
    id: "2",
    text: "Good morning! Yes, the property is still available. Would you like to schedule a viewing?",
    timestamp: "2024-12-22T09:15:00",
    time: "9:15 AM",
    isFromMe: true,
    isRead: true,
    isDelivered: true,
    type: "text",
  },
  {
    id: "3",
    text: "That would be great! When is a good time for you?",
    timestamp: "2024-12-22T09:20:00",
    time: "9:20 AM",
    isFromMe: false,
    isRead: true,
    isDelivered: true,
    type: "text",
  },
  {
    id: "4",
    text: "I'm available this Saturday morning from 10 AM. Does that work for you?",
    timestamp: "2024-12-22T09:25:00",
    time: "9:25 AM",
    isFromMe: true,
    isRead: true,
    isDelivered: true,
    type: "text",
  },
  {
    id: "5",
    text: "Saturday at 10 AM works perfectly. Can you share the exact location?",
    timestamp: "2024-12-22T09:30:00",
    time: "9:30 AM",
    isFromMe: false,
    isRead: true,
    isDelivered: true,
    type: "text",
  },
  {
    id: "6",
    text: "",
    timestamp: "2024-12-22T09:35:00",
    time: "9:35 AM",
    isFromMe: true,
    isRead: true,
    isDelivered: true,
    type: "property",
    property: PROPERTY_CONTEXT,
  },
  {
    id: "7",
    text: "I'll send you the directions. The house is near the A&C Mall.",
    timestamp: "2024-12-22T09:40:00",
    time: "9:40 AM",
    isFromMe: true,
    isRead: true,
    isDelivered: true,
    type: "text",
  },
  {
    id: "8",
    text: "Perfect! I know the area. Looking forward to seeing the property!",
    timestamp: "2024-12-22T14:30:00",
    time: "2:30 PM",
    isFromMe: false,
    isRead: false,
    isDelivered: true,
    type: "text",
  },
];

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>(MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const menuSheetRef = useRef<BottomSheetModal>(null);
  const attachmentSheetRef = useRef<BottomSheetModal>(null);

  // Scroll to bottom on mount
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }, []);

  const handleSend = useCallback(() => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      timestamp: new Date().toISOString(),
      time: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      isFromMe: true,
      isRead: false,
      isDelivered: true,
      type: "text",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Simulate typing response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  }, [inputText]);

  const handleCall = () => {
    if (CHAT_USER.phone) {
      Linking.openURL(`tel:${CHAT_USER.phone}`);
    }
  };

  const handleBlockUser = () => {
    Alert.alert(
      "Block User",
      `Are you sure you want to block ${CHAT_USER.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: () => {
            menuSheetRef.current?.dismiss();
            router.back();
          },
        },
      ]
    );
  };

  const handleReportUser = () => {
    Alert.alert("Report User", "This user has been reported. Thank you.", [
      { text: "OK", onPress: () => menuSheetRef.current?.dismiss() },
    ]);
  };

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

  const getDateLabel = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const shouldShowDateSeparator = (index: number) => {
    if (index === 0) return true;
    const currentDate = new Date(messages[index].timestamp).toDateString();
    const prevDate = new Date(messages[index - 1].timestamp).toDateString();
    return currentDate !== prevDate;
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const showDateSeparator = shouldShowDateSeparator(index);

    return (
      <View>
        {/* Date Separator */}
        {showDateSeparator && (
          <View style={styles.dateSeparator}>
            <View style={styles.dateSeparatorLine} />
            <Text style={styles.dateSeparatorText}>
              {getDateLabel(item.timestamp)}
            </Text>
            <View style={styles.dateSeparatorLine} />
          </View>
        )}

        {/* Message Bubble */}
        <View
          style={[
            styles.messageContainer,
            item.isFromMe
              ? styles.messageContainerRight
              : styles.messageContainerLeft,
          ]}
        >
          {/* Avatar for received messages */}
          {!item.isFromMe && index === 0 && (
            <Image
              source={{ uri: CHAT_USER.avatar }}
              style={styles.messageAvatar}
            />
          )}

          <View
            style={[
              styles.messageBubble,
              item.isFromMe
                ? styles.messageBubbleSent
                : styles.messageBubbleReceived,
              item.type === "property" && styles.messageBubbleProperty,
            ]}
          >
            {/* Property Card Message */}
            {item.type === "property" && item.property && (
              <TouchableOpacity
                style={styles.propertyCard}
                activeOpacity={0.8}
                onPress={() =>
                  router.push(`/property/${item.property?.id}` as any)
                }
              >
                <Image
                  source={{ uri: item.property.image }}
                  style={styles.propertyCardImage}
                />
                <View style={styles.propertyCardContent}>
                  <Text style={styles.propertyCardTitle} numberOfLines={2}>
                    {item.property.title}
                  </Text>
                  <Text style={styles.propertyCardPrice}>
                    {item.property.price}
                  </Text>
                  <View style={styles.propertyCardButton}>
                    <Text style={styles.propertyCardButtonText}>
                      View Property
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={14}
                      color={Colors.primaryGreen}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {/* Text Message */}
            {item.type === "text" && (
              <Text
                style={[
                  styles.messageText,
                  item.isFromMe
                    ? styles.messageTextSent
                    : styles.messageTextReceived,
                ]}
              >
                {item.text}
              </Text>
            )}

            {/* Time and Status */}
            <View style={styles.messageFooter}>
              <Text
                style={[
                  styles.messageTime,
                  item.isFromMe
                    ? styles.messageTimeSent
                    : styles.messageTimeReceived,
                ]}
              >
                {item.time}
              </Text>
              {item.isFromMe && (
                <Ionicons
                  name={item.isRead ? "checkmark-done" : "checkmark"}
                  size={14}
                  color={item.isRead ? "#FFFFFF" : "rgba(255,255,255,0.7)"}
                  style={styles.readReceipt}
                />
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>

          {/* User Info */}
          <TouchableOpacity style={styles.userInfo} activeOpacity={0.7}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: CHAT_USER.avatar }}
                style={styles.headerAvatar}
              />
              {CHAT_USER.isOnline && <View style={styles.onlineIndicator} />}
            </View>
            <View style={styles.userDetails}>
              <View style={styles.userNameRow}>
                <Text style={styles.userName}>{CHAT_USER.name}</Text>
                {CHAT_USER.isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                  </View>
                )}
              </View>
              <Text style={styles.userStatus}>
                {isTyping ? "typing..." : CHAT_USER.lastSeen}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Header Actions */}
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleCall}
              style={styles.headerActionButton}
              activeOpacity={0.7}
            >
              <Ionicons name="call" size={22} color={Colors.primaryGreen} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => menuSheetRef.current?.present()}
              style={styles.headerActionButton}
              activeOpacity={0.7}
            >
              <Ionicons
                name="ellipsis-vertical"
                size={22}
                color={Colors.textPrimary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Property Context Bar */}
        <TouchableOpacity
          style={styles.propertyContextBar}
          activeOpacity={0.7}
          onPress={() => router.push(`/property/${PROPERTY_CONTEXT.id}` as any)}
        >
          <Image
            source={{ uri: PROPERTY_CONTEXT.image }}
            style={styles.propertyContextImage}
          />
          <View style={styles.propertyContextInfo}>
            <Text style={styles.propertyContextLabel}>About:</Text>
            <Text style={styles.propertyContextTitle} numberOfLines={1}>
              {PROPERTY_CONTEXT.title}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={Colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }}
        />

        {/* Typing Indicator */}
        {isTyping && (
          <View style={styles.typingContainer}>
            <Image
              source={{ uri: CHAT_USER.avatar }}
              style={styles.typingAvatar}
            />
            <View style={styles.typingBubble}>
              <View style={styles.typingDots}>
                <View style={[styles.typingDot, styles.typingDot1]} />
                <View style={[styles.typingDot, styles.typingDot2]} />
                <View style={[styles.typingDot, styles.typingDot3]} />
              </View>
            </View>
          </View>
        )}

        {/* Input Bar */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={0}
        >
          <View
            style={[
              styles.inputBar,
              { paddingBottom: insets.bottom + Spacing.sm },
            ]}
          >
            {/* Attachment Button */}
            <TouchableOpacity
              style={styles.attachmentButton}
              onPress={() => attachmentSheetRef.current?.present()}
              activeOpacity={0.7}
            >
              <Ionicons name="attach" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>

            {/* Text Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Message..."
                placeholderTextColor={Colors.textSecondary}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={1000}
              />
              <TouchableOpacity style={styles.emojiButton} activeOpacity={0.7}>
                <Ionicons
                  name="happy-outline"
                  size={24}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Send Button */}
            <TouchableOpacity
              style={[
                styles.sendButton,
                inputText.trim() && styles.sendButtonActive,
              ]}
              onPress={handleSend}
              activeOpacity={0.7}
              disabled={!inputText.trim()}
            >
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() ? "#FFFFFF" : Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* Menu Bottom Sheet */}
        <BottomSheetModal
          ref={menuSheetRef}
          index={0}
          snapPoints={["35%"]}
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={{ backgroundColor: Colors.textSecondary }}
        >
          <BottomSheetView style={styles.menuSheet}>
            <Text style={styles.menuTitle}>Options</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                menuSheetRef.current?.dismiss();
                router.push(`/property/${PROPERTY_CONTEXT.id}` as any);
              }}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: `${Colors.primaryGreen}15` },
                ]}
              >
                <Ionicons name="home" size={20} color={Colors.primaryGreen} />
              </View>
              <Text style={styles.menuItemText}>View Property</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                menuSheetRef.current?.dismiss();
                // View profile
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: "#3B82F615" }]}>
                <Ionicons name="person" size={20} color="#3B82F6" />
              </View>
              <Text style={styles.menuItemText}>View Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleReportUser}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: "#F59E0B15" }]}>
                <Ionicons name="flag" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.menuItemText}>Report User</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleBlockUser}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: "#EF444415" }]}>
                <Ionicons name="ban" size={20} color="#EF4444" />
              </View>
              <Text style={[styles.menuItemText, { color: "#EF4444" }]}>
                Block User
              </Text>
            </TouchableOpacity>
          </BottomSheetView>
        </BottomSheetModal>

        {/* Attachment Bottom Sheet */}
        <BottomSheetModal
          ref={attachmentSheetRef}
          index={0}
          snapPoints={["25%"]}
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={{ backgroundColor: Colors.textSecondary }}
        >
          <BottomSheetView style={styles.attachmentSheet}>
            <View style={styles.attachmentOptions}>
              <TouchableOpacity
                style={styles.attachmentOption}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.attachmentIcon,
                    { backgroundColor: "#3B82F6" },
                  ]}
                >
                  <Ionicons name="image" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.attachmentLabel}>Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.attachmentOption}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.attachmentIcon,
                    { backgroundColor: "#8B5CF6" },
                  ]}
                >
                  <Ionicons name="camera" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.attachmentLabel}>Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.attachmentOption}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.attachmentIcon,
                    { backgroundColor: "#F59E0B" },
                  ]}
                >
                  <Ionicons name="document" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.attachmentLabel}>Document</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.attachmentOption}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.attachmentIcon,
                    { backgroundColor: Colors.primaryGreen },
                  ]}
                >
                  <Ionicons name="location" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.attachmentLabel}>Location</Text>
              </TouchableOpacity>
            </View>
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
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.divider,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: Spacing.xs,
  },
  avatarContainer: {
    position: "relative",
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primaryGreen,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  userDetails: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  userNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  userName: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
  },
  userStatus: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.primaryGreen,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  // Property Context Bar
  propertyContextBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: `${Colors.primaryGreen}08`,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.divider,
    gap: Spacing.sm,
  },
  propertyContextImage: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  propertyContextInfo: {
    flex: 1,
  },
  propertyContextLabel: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  propertyContextTitle: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  // Messages List
  messagesList: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    flexGrow: 1,
  },
  // Date Separator
  dateSeparator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  dateSeparatorLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: Colors.divider,
  },
  dateSeparatorText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.sm,
  },
  // Message Container
  messageContainer: {
    flexDirection: "row",
    marginBottom: Spacing.sm,
    maxWidth: "80%",
  },
  messageContainerLeft: {
    alignSelf: "flex-start",
  },
  messageContainerRight: {
    alignSelf: "flex-end",
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: Spacing.xs,
    marginTop: 4,
  },
  // Message Bubble
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    maxWidth: "100%",
  },
  messageBubbleSent: {
    backgroundColor: Colors.primaryGreen,
    borderBottomRightRadius: 4,
  },
  messageBubbleReceived: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 0.5,
    borderColor: Colors.divider,
  },
  messageBubbleProperty: {
    padding: 0,
    overflow: "hidden",
  },
  messageText: {
    ...Typography.bodyMedium,
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextSent: {
    color: "#FFFFFF",
  },
  messageTextReceived: {
    color: Colors.textPrimary,
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
    gap: 4,
  },
  messageTime: {
    ...Typography.caption,
    fontSize: 10,
  },
  messageTimeSent: {
    color: "rgba(255,255,255,0.7)",
  },
  messageTimeReceived: {
    color: Colors.textSecondary,
  },
  readReceipt: {
    marginLeft: 2,
  },
  // Property Card in Message
  propertyCard: {
    width: 220,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    overflow: "hidden",
  },
  propertyCardImage: {
    width: "100%",
    height: 120,
  },
  propertyCardContent: {
    padding: Spacing.sm,
  },
  propertyCardTitle: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  propertyCardPrice: {
    ...Typography.headlineMedium,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primaryGreen,
    marginBottom: Spacing.sm,
  },
  propertyCardButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  propertyCardButtonText: {
    ...Typography.labelMedium,
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
  // Typing Indicator
  typingContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  typingAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: Spacing.xs,
  },
  typingBubble: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 0.5,
    borderColor: Colors.divider,
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 20,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textSecondary,
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
  // Input Bar
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 0.5,
    borderTopColor: Colors.divider,
    gap: Spacing.sm,
  },
  attachmentButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === "ios" ? Spacing.sm : 4,
    borderWidth: 1,
    borderColor: Colors.divider,
    minHeight: 40,
    maxHeight: 120,
  },
  textInput: {
    flex: 1,
    ...Typography.bodyMedium,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingTop: 0,
    paddingBottom: 0,
    marginRight: Spacing.sm,
  },
  emojiButton: {
    paddingBottom: 2,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.divider,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  sendButtonActive: {
    backgroundColor: Colors.primaryGreen,
  },
  // Menu Sheet
  menuSheet: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  menuTitle: {
    ...Typography.headlineMedium,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuItemText: {
    ...Typography.bodyMedium,
    fontSize: 15,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  // Attachment Sheet
  attachmentSheet: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  attachmentOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  attachmentOption: {
    alignItems: "center",
    gap: Spacing.sm,
  },
  attachmentIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  attachmentLabel: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
