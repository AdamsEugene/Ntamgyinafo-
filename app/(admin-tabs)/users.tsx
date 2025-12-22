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

interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar: string;
  role: "buyer" | "owner" | "admin";
  status: "active" | "suspended" | "pending";
  isVerified: boolean;
  joinedDate: string;
  listingsCount?: number;
  lastActive: string;
}

type FilterTab = "all" | "pending" | "owners" | "buyers" | "suspended";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const MOCK_USERS: User[] = [
  {
    id: "u1",
    name: "Kofi Mensah",
    phone: "+233 24 123 4567",
    email: "kofi@email.com",
    avatar: "https://i.pravatar.cc/150?img=11",
    role: "owner",
    status: "pending",
    isVerified: false,
    joinedDate: "Dec 20, 2024",
    listingsCount: 0,
    lastActive: "2 min ago",
  },
  {
    id: "u2",
    name: "Ama Serwaa",
    phone: "+233 20 234 5678",
    avatar: "https://i.pravatar.cc/150?img=5",
    role: "owner",
    status: "active",
    isVerified: true,
    joinedDate: "Nov 15, 2024",
    listingsCount: 5,
    lastActive: "1 hour ago",
  },
  {
    id: "u3",
    name: "Kwame Asante",
    phone: "+233 24 345 6789",
    avatar: "https://i.pravatar.cc/150?img=3",
    role: "buyer",
    status: "active",
    isVerified: true,
    joinedDate: "Oct 10, 2024",
    lastActive: "3 hours ago",
  },
  {
    id: "u4",
    name: "Akua Boateng",
    phone: "+233 27 456 7890",
    avatar: "https://i.pravatar.cc/150?img=9",
    role: "owner",
    status: "pending",
    isVerified: false,
    joinedDate: "Dec 21, 2024",
    listingsCount: 0,
    lastActive: "5 min ago",
  },
  {
    id: "u5",
    name: "Yaw Mensah",
    phone: "+233 55 567 8901",
    avatar: "https://i.pravatar.cc/150?img=12",
    role: "buyer",
    status: "suspended",
    isVerified: false,
    joinedDate: "Sep 5, 2024",
    lastActive: "2 weeks ago",
  },
  {
    id: "u6",
    name: "Esi Darkwa",
    phone: "+233 24 678 9012",
    avatar: "https://i.pravatar.cc/150?img=25",
    role: "owner",
    status: "active",
    isVerified: true,
    joinedDate: "Aug 20, 2024",
    listingsCount: 12,
    lastActive: "30 min ago",
  },
];

const FILTER_OPTIONS: {
  id: FilterTab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: "all", label: "All Users", icon: "people" },
  { id: "pending", label: "Pending Verification", icon: "time" },
  { id: "owners", label: "Property Owners", icon: "home" },
  { id: "buyers", label: "Buyers", icon: "search" },
  { id: "suspended", label: "Suspended", icon: "ban" },
];

export default function UserManagementScreen() {
  useRouter();
  const insets = useSafeAreaInsets();
  const searchInputRef = useRef<RNTextInput>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const actionSheetRef = useRef<BottomSheetModal>(null);
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

  const filteredUsers = users.filter((user) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !user.name.toLowerCase().includes(query) &&
        !user.phone.includes(query)
      ) {
        return false;
      }
    }

    // Tab filter
    switch (activeFilter) {
      case "pending":
        return user.status === "pending";
      case "owners":
        return user.role === "owner";
      case "buyers":
        return user.role === "buyer";
      case "suspended":
        return user.status === "suspended";
      default:
        return true;
    }
  });

  const pendingCount = users.filter((u) => u.status === "pending").length;
  const activeFilterLabel =
    FILTER_OPTIONS.find((f) => f.id === activeFilter)?.label || "All";

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

  const handleVerifyUser = (userId: string) => {
    Alert.alert("Verify User", "Are you sure you want to verify this user?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Verify",
        onPress: () => {
          setUsers((prev) =>
            prev.map((u) =>
              u.id === userId
                ? { ...u, isVerified: true, status: "active" as const }
                : u
            )
          );
          actionSheetRef.current?.dismiss();
          Alert.alert("Success", "User has been verified.");
        },
      },
    ]);
  };

  const handleSuspendUser = (userId: string) => {
    Alert.alert("Suspend User", "Are you sure you want to suspend this user?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Suspend",
        style: "destructive",
        onPress: () => {
          setUsers((prev) =>
            prev.map((u) =>
              u.id === userId ? { ...u, status: "suspended" as const } : u
            )
          );
          actionSheetRef.current?.dismiss();
          Alert.alert("Success", "User has been suspended.");
        },
      },
    ]);
  };

  const handleReactivateUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, status: "active" as const } : u
      )
    );
    actionSheetRef.current?.dismiss();
    Alert.alert("Success", "User has been reactivated.");
  };

  const handleDeleteUser = (userId: string) => {
    Alert.alert("Delete User", "This action cannot be undone. Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setUsers((prev) => prev.filter((u) => u.id !== userId));
          actionSheetRef.current?.dismiss();
          Alert.alert("Success", "User has been deleted.");
        },
      },
    ]);
  };

  const getStatusStyle = (status: User["status"]) => {
    switch (status) {
      case "active":
        return { bg: `${Colors.primaryGreen}15`, text: Colors.primaryGreen };
      case "pending":
        return { bg: "#FEF3C7", text: "#F59E0B" };
      case "suspended":
        return { bg: "#FEE2E2", text: "#EF4444" };
    }
  };

  const getRoleStyle = (role: User["role"]) => {
    switch (role) {
      case "owner":
        return { bg: "#DBEAFE", text: "#3B82F6" };
      case "buyer":
        return { bg: "#F3E8FF", text: "#8B5CF6" };
      case "admin":
        return { bg: "#FEE2E2", text: "#EF4444" };
    }
  };

  const renderUser = ({ item }: { item: User }) => {
    const statusStyle = getStatusStyle(item.status);
    const roleStyle = getRoleStyle(item.role);

    return (
      <TouchableOpacity
        style={styles.userCard}
        activeOpacity={0.7}
        onPress={() => {
          setSelectedUser(item);
          actionSheetRef.current?.present();
        }}
      >
        <View style={styles.userCardHeader}>
          <View style={styles.userAvatarContainer}>
            <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
            {item.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={10} color="#FFFFFF" />
              </View>
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userPhone}>{item.phone}</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setSelectedUser(item);
              actionSheetRef.current?.present();
            }}
            style={styles.moreButton}
          >
            <Ionicons
              name="ellipsis-vertical"
              size={18}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.userCardDetails}>
          <View style={styles.userBadges}>
            <View style={[styles.roleBadge, { backgroundColor: roleStyle.bg }]}>
              <Ionicons
                name={
                  item.role === "owner"
                    ? "home"
                    : item.role === "buyer"
                    ? "search"
                    : "shield"
                }
                size={10}
                color={roleStyle.text}
              />
              <Text style={[styles.roleBadgeText, { color: roleStyle.text }]}>
                {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
              </Text>
            </View>
            <View
              style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: statusStyle.text },
                ]}
              />
              <Text
                style={[styles.statusBadgeText, { color: statusStyle.text }]}
              >
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.userMeta}>
            <View style={styles.userMetaItem}>
              <Ionicons
                name="calendar-outline"
                size={13}
                color={Colors.textSecondary}
              />
              <Text style={styles.userMetaText}>{item.joinedDate}</Text>
            </View>
            <View style={styles.userMetaItem}>
              <Ionicons
                name="time-outline"
                size={13}
                color={Colors.textSecondary}
              />
              <Text style={styles.userMetaText}>{item.lastActive}</Text>
            </View>
            {item.role === "owner" && item.listingsCount !== undefined && (
              <View style={styles.userMetaItem}>
                <Ionicons
                  name="home-outline"
                  size={13}
                  color={Colors.primaryGreen}
                />
                <Text
                  style={[
                    styles.userMetaText,
                    { color: Colors.primaryGreen, fontWeight: "600" },
                  ]}
                >
                  {item.listingsCount} listings
                </Text>
              </View>
            )}
          </View>
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
            <Text style={styles.headerTitleText}>Users</Text>
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
                {activeFilter !== "all" && (
                  <View style={FloatingHeaderStyles.filterBadge}>
                    <Text style={FloatingHeaderStyles.filterBadgeText}>1</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Filter Indicator */}
        {activeFilter !== "all" && (
          <View style={[styles.activeFilterBar, { top: 70 + insets.top }]}>
            <View style={styles.activeFilterChip}>
              <Text style={styles.activeFilterText}>{activeFilterLabel}</Text>
              <TouchableOpacity onPress={() => setActiveFilter("all")}>
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={Colors.primaryGreen}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.resultsCount}>
              {filteredUsers.length}{" "}
              {filteredUsers.length === 1 ? "user" : "users"}
            </Text>
          </View>
        )}

        {/* Users List */}
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderUser}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingTop:
                activeFilter !== "all" ? 120 + insets.top : 90 + insets.top,
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
              progressViewOffset={90 + insets.top}
            />
          }
          ListHeaderComponent={
            activeFilter === "all" ? (
              <Text style={styles.listHeaderText}>
                {filteredUsers.length}{" "}
                {filteredUsers.length === 1 ? "user" : "users"}
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons
                  name="people-outline"
                  size={48}
                  color={Colors.textSecondary}
                />
              </View>
              <Text style={styles.emptyTitle}>No Users Found</Text>
              <Text style={styles.emptyMessage}>
                {searchQuery
                  ? "Try a different search term"
                  : "No users match the current filter"}
              </Text>
              {activeFilter !== "all" && (
                <TouchableOpacity
                  style={styles.clearFilterButton}
                  onPress={() => setActiveFilter("all")}
                >
                  <Text style={styles.clearFilterButtonText}>Clear Filter</Text>
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
              placeholder="Search users..."
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
          snapPoints={["50%"]}
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={{ backgroundColor: Colors.textSecondary }}
        >
          <BottomSheetScrollView style={styles.filterSheetContent}>
            <Text style={styles.filterSheetTitle}>Filter Users</Text>
            <Text style={styles.filterSheetSubtitle}>
              Select a category to filter users
            </Text>

            <View style={styles.filterOptions}>
              {FILTER_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.filterOption,
                    activeFilter === option.id && styles.filterOptionActive,
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
                      activeFilter === option.id &&
                        styles.filterOptionIconActive,
                    ]}
                  >
                    <Ionicons
                      name={option.icon}
                      size={20}
                      color={
                        activeFilter === option.id
                          ? "#FFFFFF"
                          : Colors.textSecondary
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
                      color={Colors.primaryGreen}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {activeFilter !== "all" && (
              <TouchableOpacity
                style={styles.resetFilterButton}
                onPress={() => {
                  setActiveFilter("all");
                  filterSheetRef.current?.dismiss();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.resetFilterButtonText}>Reset Filter</Text>
              </TouchableOpacity>
            )}
          </BottomSheetScrollView>
        </BottomSheetModal>

        {/* User Actions Bottom Sheet */}
        <BottomSheetModal
          ref={actionSheetRef}
          index={0}
          snapPoints={["50%"]}
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={{ backgroundColor: Colors.textSecondary }}
        >
          <BottomSheetView style={styles.sheetContent}>
            {selectedUser && (
              <>
                {/* User Info */}
                <View style={styles.sheetUserInfo}>
                  <Image
                    source={{ uri: selectedUser.avatar }}
                    style={styles.sheetAvatar}
                  />
                  <View style={styles.sheetUserDetails}>
                    <Text style={styles.sheetUserName}>
                      {selectedUser.name}
                    </Text>
                    <Text style={styles.sheetUserPhone}>
                      {selectedUser.phone}
                    </Text>
                    <View style={styles.sheetUserBadges}>
                      <View
                        style={[
                          styles.sheetUserBadge,
                          {
                            backgroundColor: getRoleStyle(selectedUser.role).bg,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.sheetUserBadgeText,
                            { color: getRoleStyle(selectedUser.role).text },
                          ]}
                        >
                          {selectedUser.role.charAt(0).toUpperCase() +
                            selectedUser.role.slice(1)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Actions */}
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
                    <Text style={styles.sheetActionText}>View Profile</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>

                  {selectedUser.status === "pending" && (
                    <TouchableOpacity
                      style={styles.sheetAction}
                      onPress={() => handleVerifyUser(selectedUser.id)}
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
                      <Text style={styles.sheetActionText}>Verify User</Text>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={Colors.textSecondary}
                      />
                    </TouchableOpacity>
                  )}

                  {selectedUser.status === "suspended" ? (
                    <TouchableOpacity
                      style={styles.sheetAction}
                      onPress={() => handleReactivateUser(selectedUser.id)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.sheetActionIcon,
                          { backgroundColor: `${Colors.primaryGreen}15` },
                        ]}
                      >
                        <Ionicons
                          name="refresh"
                          size={20}
                          color={Colors.primaryGreen}
                        />
                      </View>
                      <Text style={styles.sheetActionText}>
                        Reactivate User
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={Colors.textSecondary}
                      />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.sheetAction}
                      onPress={() => handleSuspendUser(selectedUser.id)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.sheetActionIcon,
                          { backgroundColor: "#FEF3C7" },
                        ]}
                      >
                        <Ionicons name="ban" size={20} color="#F59E0B" />
                      </View>
                      <Text style={styles.sheetActionText}>Suspend User</Text>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={Colors.textSecondary}
                      />
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.sheetAction}
                    onPress={() => handleDeleteUser(selectedUser.id)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.sheetActionIcon,
                        { backgroundColor: "#FEE2E2" },
                      ]}
                    >
                      <Ionicons name="trash" size={20} color="#EF4444" />
                    </View>
                    <Text
                      style={[styles.sheetActionText, { color: "#EF4444" }]}
                    >
                      Delete User
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#EF4444"
                    />
                  </TouchableOpacity>
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
    backgroundColor: `${Colors.primaryGreen}15`,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  activeFilterText: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primaryGreen,
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
  listHeaderText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  // User Card
  userCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.lg,
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
  userCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  userAvatarContainer: {
    position: "relative",
  },
  userAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: Colors.divider,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primaryGreen,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  userPhone: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  moreButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  userCardDetails: {
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  userBadges: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  roleBadgeText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "600",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "600",
  },
  userMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  userMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  userMetaText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
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
    borderColor: Colors.primaryGreen,
    backgroundColor: `${Colors.primaryGreen}08`,
  },
  filterOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  filterOptionIconActive: {
    backgroundColor: Colors.primaryGreen,
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
  resetFilterButton: {
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  resetFilterButtonText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
  // Bottom Sheet
  sheetContent: {
    padding: Spacing.xl,
  },
  sheetUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  sheetAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: Colors.primaryGreen,
  },
  sheetUserDetails: {
    flex: 1,
  },
  sheetUserName: {
    ...Typography.titleMedium,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  sheetUserPhone: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  sheetUserBadges: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  sheetUserBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sheetUserBadgeText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "600",
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
});
