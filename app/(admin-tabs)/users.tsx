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
} from "@gorhom/bottom-sheet";
import { Colors, Typography, Spacing } from "@/constants/design";
import { FloatingHeaderStyles } from "@/components/FloatingHeader.styles";

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

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "owners", label: "Owners" },
  { id: "buyers", label: "Buyers" },
  { id: "suspended", label: "Suspended" },
];

export default function UserManagementScreen() {
  useRouter();
  const insets = useSafeAreaInsets();
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const actionSheetRef = useRef<BottomSheetModal>(null);

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
    switch (activeTab) {
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
          >
            <Ionicons
              name="ellipsis-vertical"
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.userCardDetails}>
          <View style={styles.userBadges}>
            <View style={[styles.roleBadge, { backgroundColor: roleStyle.bg }]}>
              <Text style={[styles.roleBadgeText, { color: roleStyle.text }]}>
                {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
              </Text>
            </View>
            <View
              style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}
            >
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
                size={12}
                color={Colors.textSecondary}
              />
              <Text style={styles.userMetaText}>Joined {item.joinedDate}</Text>
            </View>
            <View style={styles.userMetaItem}>
              <Ionicons
                name="time-outline"
                size={12}
                color={Colors.textSecondary}
              />
              <Text style={styles.userMetaText}>{item.lastActive}</Text>
            </View>
          </View>

          {item.role === "owner" && item.listingsCount !== undefined && (
            <View style={styles.listingsInfo}>
              <Ionicons
                name="home-outline"
                size={14}
                color={Colors.primaryGreen}
              />
              <Text style={styles.listingsText}>
                {item.listingsCount} listings
              </Text>
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
            <Text style={styles.headerTitleText}>Users</Text>
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
              placeholder="Search users..."
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

        {/* Users List */}
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderUser}
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
                name="people-outline"
                size={48}
                color={Colors.textSecondary}
              />
              <Text style={styles.emptyTitle}>No Users Found</Text>
              <Text style={styles.emptyMessage}>
                {searchQuery
                  ? "Try a different search"
                  : "No users match this filter"}
              </Text>
            </View>
          }
        />

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
                  <View>
                    <Text style={styles.sheetUserName}>
                      {selectedUser.name}
                    </Text>
                    <Text style={styles.sheetUserPhone}>
                      {selectedUser.phone}
                    </Text>
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
  // User Card
  userCard: {
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
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
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
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
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
    ...Typography.labelMedium,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  userPhone: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  userCardDetails: {
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  userBadges: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "600",
  },
  userMeta: {
    flexDirection: "row",
    gap: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  userMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  userMetaText: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  listingsInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  listingsText: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.primaryGreen,
    fontWeight: "500",
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
  sheetUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  sheetAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
});
