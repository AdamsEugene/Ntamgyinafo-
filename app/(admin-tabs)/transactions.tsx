import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Platform,
  TextInput as RNTextInput,
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
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Colors, Typography, Spacing } from "@/constants/design";
import {
  FloatingHeaderStyles,
  HEADER_ICON_SIZE,
} from "@/components/FloatingHeader.styles";

interface Transaction {
  id: string;
  user: string;
  userAvatar?: string;
  type: "subscription" | "listing" | "refund";
  plan?: string;
  amount: string;
  date: string;
  time: string;
  status: "completed" | "pending" | "failed" | "refunded";
  reference: string;
  paymentMethod: "momo" | "card" | "bank";
}

type StatusFilter = "all" | "completed" | "pending" | "failed" | "refunded";
type TypeFilter = "all" | "subscription" | "listing" | "refund";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "t1",
    user: "Kofi Mensah",
    type: "subscription",
    plan: "Standard",
    amount: "₵80.00",
    date: "Dec 22, 2024",
    time: "2:30 PM",
    status: "completed",
    reference: "TXN-2024122201",
    paymentMethod: "momo",
  },
  {
    id: "t2",
    user: "Ama Serwaa",
    type: "subscription",
    plan: "Premium",
    amount: "₵120.00",
    date: "Dec 22, 2024",
    time: "11:15 AM",
    status: "completed",
    reference: "TXN-2024122202",
    paymentMethod: "card",
  },
  {
    id: "t3",
    user: "Kwame Asante",
    type: "subscription",
    plan: "Basic",
    amount: "₵50.00",
    date: "Dec 21, 2024",
    time: "4:45 PM",
    status: "completed",
    reference: "TXN-2024122103",
    paymentMethod: "momo",
  },
  {
    id: "t4",
    user: "Akua Boateng",
    type: "subscription",
    plan: "Standard",
    amount: "₵80.00",
    date: "Dec 20, 2024",
    time: "9:20 AM",
    status: "pending",
    reference: "TXN-2024122004",
    paymentMethod: "bank",
  },
  {
    id: "t5",
    user: "Yaw Mensah",
    type: "subscription",
    plan: "Basic",
    amount: "₵50.00",
    date: "Dec 19, 2024",
    time: "3:10 PM",
    status: "failed",
    reference: "TXN-2024121905",
    paymentMethod: "momo",
  },
  {
    id: "t6",
    user: "Esi Darkwa",
    type: "subscription",
    plan: "Premium",
    amount: "₵120.00",
    date: "Dec 18, 2024",
    time: "10:00 AM",
    status: "completed",
    reference: "TXN-2024121806",
    paymentMethod: "card",
  },
  {
    id: "t7",
    user: "Kweku Annan",
    type: "refund",
    plan: "Standard",
    amount: "-₵80.00",
    date: "Dec 17, 2024",
    time: "2:15 PM",
    status: "refunded",
    reference: "TXN-2024121707",
    paymentMethod: "momo",
  },
  {
    id: "t8",
    user: "Adwoa Peprah",
    type: "subscription",
    plan: "Premium",
    amount: "₵120.00",
    date: "Dec 17, 2024",
    time: "11:30 AM",
    status: "completed",
    reference: "TXN-2024121708",
    paymentMethod: "card",
  },
  {
    id: "t9",
    user: "Kojo Bonsu",
    type: "subscription",
    plan: "Basic",
    amount: "₵50.00",
    date: "Dec 16, 2024",
    time: "5:00 PM",
    status: "completed",
    reference: "TXN-2024121609",
    paymentMethod: "momo",
  },
  {
    id: "t10",
    user: "Abena Owusu",
    type: "subscription",
    plan: "Standard",
    amount: "₵80.00",
    date: "Dec 15, 2024",
    time: "1:45 PM",
    status: "pending",
    reference: "TXN-2024121510",
    paymentMethod: "bank",
  },
];

const STATUS_OPTIONS: { id: StatusFilter; label: string; color: string }[] = [
  { id: "all", label: "All Status", color: "#3B82F6" },
  { id: "completed", label: "Completed", color: Colors.primaryGreen },
  { id: "pending", label: "Pending", color: "#F59E0B" },
  { id: "failed", label: "Failed", color: "#EF4444" },
  { id: "refunded", label: "Refunded", color: "#8B5CF6" },
];

const TYPE_OPTIONS: { id: TypeFilter; label: string }[] = [
  { id: "all", label: "All Types" },
  { id: "subscription", label: "Subscription" },
  { id: "listing", label: "Listing" },
  { id: "refund", label: "Refund" },
];

export default function AllTransactionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const searchInputRef = useRef<RNTextInput>(null);
  const filterSheetRef = useRef<BottomSheetModal>(null);
  const detailSheetRef = useRef<BottomSheetModal>(null);

  const [transactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

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

  const filteredTransactions = transactions.filter((transaction) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !transaction.user.toLowerCase().includes(query) &&
        !transaction.reference.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // Status filter
    if (statusFilter !== "all" && transaction.status !== statusFilter) {
      return false;
    }

    // Type filter
    if (typeFilter !== "all" && transaction.type !== typeFilter) {
      return false;
    }

    return true;
  });

  const activeFiltersCount =
    (statusFilter !== "all" ? 1 : 0) + (typeFilter !== "all" ? 1 : 0);

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

  const getStatusStyle = (status: Transaction["status"]) => {
    switch (status) {
      case "completed":
        return {
          bg: `${Colors.primaryGreen}15`,
          text: Colors.primaryGreen,
          icon: "checkmark-circle",
        };
      case "pending":
        return { bg: "#FEF3C7", text: "#F59E0B", icon: "time" };
      case "failed":
        return { bg: "#FEE2E2", text: "#EF4444", icon: "close-circle" };
      case "refunded":
        return { bg: "#F3E8FF", text: "#8B5CF6", icon: "arrow-undo" };
    }
  };

  const getPaymentMethodIcon = (method: Transaction["paymentMethod"]) => {
    switch (method) {
      case "momo":
        return "phone-portrait";
      case "card":
        return "card";
      case "bank":
        return "business";
    }
  };

  const getTypeIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "subscription":
        return "ribbon";
      case "listing":
        return "home";
      case "refund":
        return "arrow-undo";
    }
  };

  const handleTransactionPress = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    detailSheetRef.current?.present();
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const statusStyle = getStatusStyle(item.status);

    return (
      <TouchableOpacity
        style={styles.transactionCard}
        activeOpacity={0.7}
        onPress={() => handleTransactionPress(item)}
      >
        {/* Left Icon */}
        <View
          style={[
            styles.transactionIcon,
            { backgroundColor: `${Colors.primaryGreen}15` },
          ]}
        >
          <Ionicons
            name={getTypeIcon(item.type) as any}
            size={20}
            color={Colors.primaryGreen}
          />
        </View>

        {/* Content */}
        <View style={styles.transactionContent}>
          <View style={styles.transactionHeader}>
            <Text style={styles.transactionUser}>{item.user}</Text>
            <Text
              style={[
                styles.transactionAmount,
                item.type === "refund" && { color: "#EF4444" },
              ]}
            >
              {item.amount}
            </Text>
          </View>

          <View style={styles.transactionMeta}>
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>
                {item.plan ||
                  item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </Text>
            </View>
            <View style={styles.paymentMethod}>
              <Ionicons
                name={getPaymentMethodIcon(item.paymentMethod) as any}
                size={12}
                color={Colors.textSecondary}
              />
            </View>
            <Text style={styles.transactionDate}>
              {item.date} • {item.time}
            </Text>
          </View>

          <View style={styles.transactionFooter}>
            <Text style={styles.transactionRef}>{item.reference}</Text>
            <View
              style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}
            >
              <Ionicons
                name={statusStyle.icon as any}
                size={10}
                color={statusStyle.text}
              />
              <Text
                style={[styles.statusBadgeText, { color: statusStyle.text }]}
              >
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Calculate totals
  const completedTotal = transactions
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + parseFloat(t.amount.replace(/[₵,]/g, "")), 0);

  const pendingTotal = transactions
    .filter((t) => t.status === "pending")
    .reduce((sum, t) => sum + parseFloat(t.amount.replace(/[₵,]/g, "")), 0);

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
            {/* Back Button */}
            <TouchableOpacity
              style={FloatingHeaderStyles.backButton}
              onPress={() => router.back()}
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
            <Text style={styles.headerTitleText}>Transactions</Text>
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
                {activeFiltersCount > 0 && (
                  <View style={FloatingHeaderStyles.filterBadge}>
                    <Text style={FloatingHeaderStyles.filterBadgeText}>
                      {activeFiltersCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary Cards */}
        <View style={[styles.summaryContainer, { top: 70 + insets.top }]}>
          <View style={styles.summaryCard}>
            <View
              style={[
                styles.summaryIcon,
                { backgroundColor: `${Colors.primaryGreen}15` },
              ]}
            >
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={Colors.primaryGreen}
              />
            </View>
            <View>
              <Text style={styles.summaryLabel}>Completed</Text>
              <Text style={styles.summaryValue}>
                ₵{completedTotal.toFixed(2)}
              </Text>
            </View>
          </View>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="time" size={18} color="#F59E0B" />
            </View>
            <View>
              <Text style={styles.summaryLabel}>Pending</Text>
              <Text style={styles.summaryValue}>
                ₵{pendingTotal.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Active Filters */}
        {(statusFilter !== "all" || typeFilter !== "all") && (
          <View style={[styles.activeFiltersBar, { top: 130 + insets.top }]}>
            {statusFilter !== "all" && (
              <View
                style={[
                  styles.activeFilterChip,
                  {
                    backgroundColor: `${
                      STATUS_OPTIONS.find((s) => s.id === statusFilter)?.color
                    }15`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.activeFilterText,
                    {
                      color: STATUS_OPTIONS.find((s) => s.id === statusFilter)
                        ?.color,
                    },
                  ]}
                >
                  {STATUS_OPTIONS.find((s) => s.id === statusFilter)?.label}
                </Text>
                <TouchableOpacity onPress={() => setStatusFilter("all")}>
                  <Ionicons
                    name="close-circle"
                    size={16}
                    color={
                      STATUS_OPTIONS.find((s) => s.id === statusFilter)?.color
                    }
                  />
                </TouchableOpacity>
              </View>
            )}
            {typeFilter !== "all" && (
              <View
                style={[
                  styles.activeFilterChip,
                  { backgroundColor: "#3B82F615" },
                ]}
              >
                <Text style={[styles.activeFilterText, { color: "#3B82F6" }]}>
                  {TYPE_OPTIONS.find((t) => t.id === typeFilter)?.label}
                </Text>
                <TouchableOpacity onPress={() => setTypeFilter("all")}>
                  <Ionicons name="close-circle" size={16} color="#3B82F6" />
                </TouchableOpacity>
              </View>
            )}
            <Text style={styles.resultsCount}>
              {filteredTransactions.length} results
            </Text>
          </View>
        )}

        {/* Transactions List */}
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          renderItem={renderTransaction}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingTop:
                statusFilter !== "all" || typeFilter !== "all"
                  ? 180 + insets.top
                  : 140 + insets.top,
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
              progressViewOffset={140 + insets.top}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons
                  name="receipt-outline"
                  size={48}
                  color={Colors.textSecondary}
                />
              </View>
              <Text style={styles.emptyTitle}>No Transactions Found</Text>
              <Text style={styles.emptyMessage}>
                {searchQuery
                  ? "Try a different search term"
                  : "No transactions match the current filters"}
              </Text>
              {(statusFilter !== "all" || typeFilter !== "all") && (
                <TouchableOpacity
                  style={styles.clearFiltersButton}
                  onPress={() => {
                    setStatusFilter("all");
                    setTypeFilter("all");
                  }}
                >
                  <Text style={styles.clearFiltersButtonText}>
                    Clear Filters
                  </Text>
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
              placeholder="Search by name or reference..."
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
          snapPoints={["60%"]}
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={{ backgroundColor: Colors.textSecondary }}
        >
          <BottomSheetScrollView style={styles.filterSheetContent}>
            <Text style={styles.filterSheetTitle}>Filter Transactions</Text>

            {/* Status Filter */}
            <Text style={styles.filterSectionTitle}>Status</Text>
            <View style={styles.filterOptions}>
              {STATUS_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.filterOption,
                    statusFilter === option.id && styles.filterOptionActive,
                    statusFilter === option.id && { borderColor: option.color },
                  ]}
                  onPress={() => setStatusFilter(option.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.filterOptionDot,
                      { backgroundColor: option.color },
                    ]}
                  />
                  <Text
                    style={[
                      styles.filterOptionText,
                      statusFilter === option.id &&
                        styles.filterOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {statusFilter === option.id && (
                    <Ionicons name="checkmark" size={18} color={option.color} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Type Filter */}
            <Text style={styles.filterSectionTitle}>Transaction Type</Text>
            <View style={styles.filterOptions}>
              {TYPE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.filterOption,
                    typeFilter === option.id && styles.filterOptionActive,
                  ]}
                  onPress={() => setTypeFilter(option.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      typeFilter === option.id && styles.filterOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {typeFilter === option.id && (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={Colors.primaryGreen}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Apply Button */}
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => filterSheetRef.current?.dismiss()}
              activeOpacity={0.8}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>

            {/* Clear Button */}
            {(statusFilter !== "all" || typeFilter !== "all") && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setStatusFilter("all");
                  setTypeFilter("all");
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.clearButtonText}>Clear All Filters</Text>
              </TouchableOpacity>
            )}
          </BottomSheetScrollView>
        </BottomSheetModal>

        {/* Transaction Detail Bottom Sheet */}
        <BottomSheetModal
          ref={detailSheetRef}
          index={0}
          snapPoints={["55%"]}
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={{ backgroundColor: Colors.textSecondary }}
        >
          <BottomSheetView style={styles.detailSheetContent}>
            {selectedTransaction && (
              <>
                {/* Header */}
                <View style={styles.detailHeader}>
                  <View
                    style={[
                      styles.detailIconContainer,
                      { backgroundColor: `${Colors.primaryGreen}15` },
                    ]}
                  >
                    <Ionicons
                      name={getTypeIcon(selectedTransaction.type) as any}
                      size={28}
                      color={Colors.primaryGreen}
                    />
                  </View>
                  <View style={styles.detailHeaderInfo}>
                    <Text style={styles.detailAmount}>
                      {selectedTransaction.amount}
                    </Text>
                    <View
                      style={[
                        styles.detailStatusBadge,
                        {
                          backgroundColor: getStatusStyle(
                            selectedTransaction.status
                          ).bg,
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          getStatusStyle(selectedTransaction.status).icon as any
                        }
                        size={12}
                        color={getStatusStyle(selectedTransaction.status).text}
                      />
                      <Text
                        style={[
                          styles.detailStatusText,
                          {
                            color: getStatusStyle(selectedTransaction.status)
                              .text,
                          },
                        ]}
                      >
                        {selectedTransaction.status.charAt(0).toUpperCase() +
                          selectedTransaction.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Details List */}
                <View style={styles.detailsList}>
                  <View style={styles.detailRow}>
                    <View style={styles.detailRowLeft}>
                      <View style={styles.detailRowIcon}>
                        <Ionicons
                          name="person-outline"
                          size={18}
                          color={Colors.textSecondary}
                        />
                      </View>
                      <Text style={styles.detailRowLabel}>Customer</Text>
                    </View>
                    <Text style={styles.detailRowValue}>
                      {selectedTransaction.user}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.detailRowLeft}>
                      <View style={styles.detailRowIcon}>
                        <Ionicons
                          name="ribbon-outline"
                          size={18}
                          color={Colors.textSecondary}
                        />
                      </View>
                      <Text style={styles.detailRowLabel}>Plan</Text>
                    </View>
                    <Text style={styles.detailRowValue}>
                      {selectedTransaction.plan || "N/A"}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.detailRowLeft}>
                      <View style={styles.detailRowIcon}>
                        <Ionicons
                          name="pricetag-outline"
                          size={18}
                          color={Colors.textSecondary}
                        />
                      </View>
                      <Text style={styles.detailRowLabel}>Type</Text>
                    </View>
                    <Text style={styles.detailRowValue}>
                      {selectedTransaction.type.charAt(0).toUpperCase() +
                        selectedTransaction.type.slice(1)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.detailRowLeft}>
                      <View style={styles.detailRowIcon}>
                        <Ionicons
                          name={
                            getPaymentMethodIcon(
                              selectedTransaction.paymentMethod
                            ) as any
                          }
                          size={18}
                          color={Colors.textSecondary}
                        />
                      </View>
                      <Text style={styles.detailRowLabel}>Payment Method</Text>
                    </View>
                    <Text style={styles.detailRowValue}>
                      {selectedTransaction.paymentMethod === "momo"
                        ? "Mobile Money"
                        : selectedTransaction.paymentMethod === "card"
                        ? "Card"
                        : "Bank Transfer"}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.detailRowLeft}>
                      <View style={styles.detailRowIcon}>
                        <Ionicons
                          name="calendar-outline"
                          size={18}
                          color={Colors.textSecondary}
                        />
                      </View>
                      <Text style={styles.detailRowLabel}>Date & Time</Text>
                    </View>
                    <Text style={styles.detailRowValue}>
                      {selectedTransaction.date} • {selectedTransaction.time}
                    </Text>
                  </View>

                  <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                    <View style={styles.detailRowLeft}>
                      <View style={styles.detailRowIcon}>
                        <Ionicons
                          name="receipt-outline"
                          size={18}
                          color={Colors.textSecondary}
                        />
                      </View>
                      <Text style={styles.detailRowLabel}>Reference</Text>
                    </View>
                    <Text
                      style={[styles.detailRowValue, styles.detailRefValue]}
                    >
                      {selectedTransaction.reference}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.detailActions}>
                  <TouchableOpacity
                    style={styles.detailActionButton}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="download-outline"
                      size={20}
                      color={Colors.primaryGreen}
                    />
                    <Text style={styles.detailActionText}>
                      Download Receipt
                    </Text>
                  </TouchableOpacity>
                  {selectedTransaction.status === "pending" && (
                    <TouchableOpacity
                      style={[
                        styles.detailActionButton,
                        styles.detailActionButtonDanger,
                      ]}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="close-circle-outline"
                        size={20}
                        color="#EF4444"
                      />
                      <Text
                        style={[styles.detailActionText, { color: "#EF4444" }]}
                      >
                        Cancel Transaction
                      </Text>
                    </TouchableOpacity>
                  )}
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
  // Summary
  summaryContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 9,
    paddingHorizontal: Spacing.lg,
    flexDirection: "row",
    gap: Spacing.md,
  },
  summaryCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: 14,
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
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryLabel: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  summaryValue: {
    ...Typography.labelMedium,
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  // Active Filters
  activeFiltersBar: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 8,
    paddingHorizontal: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  activeFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activeFilterText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: "600",
  },
  resultsCount: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: "auto",
  },
  // List
  listContent: {
    paddingHorizontal: Spacing.lg,
    flexGrow: 1,
  },
  // Transaction Card
  transactionCard: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.divider,
    gap: Spacing.md,
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
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  transactionContent: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  transactionUser: {
    ...Typography.labelMedium,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  transactionAmount: {
    ...Typography.labelMedium,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primaryGreen,
  },
  transactionMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  planBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  planBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  paymentMethod: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  transactionDate: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  transactionFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  transactionRef: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textSecondary,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "600",
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
  clearFiltersButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primaryGreen,
  },
  clearFiltersButtonText: {
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
    marginBottom: Spacing.xl,
  },
  filterSectionTitle: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  filterOptionActive: {
    backgroundColor: `${Colors.primaryGreen}08`,
    borderColor: Colors.primaryGreen,
  },
  filterOptionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
  applyButton: {
    backgroundColor: Colors.primaryGreen,
    paddingVertical: Spacing.lg,
    borderRadius: 16,
    marginTop: Spacing.xl,
    alignItems: "center",
  },
  applyButtonText: {
    ...Typography.labelLarge,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  clearButton: {
    paddingVertical: Spacing.md,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  clearButtonText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  // Detail Sheet
  detailSheetContent: {
    padding: Spacing.xl,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  detailIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  detailHeaderInfo: {
    flex: 1,
    gap: Spacing.sm,
  },
  detailAmount: {
    ...Typography.headlineLarge,
    fontSize: 28,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  detailStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  detailStatusText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "600",
  },
  detailsList: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.divider,
    marginBottom: Spacing.lg,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  detailRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  detailRowIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  detailRowLabel: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  detailRowValue: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  detailRefValue: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 12,
  },
  detailActions: {
    gap: Spacing.sm,
  },
  detailActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  detailActionButtonDanger: {
    borderColor: "#FEE2E2",
    backgroundColor: "#FEE2E210",
  },
  detailActionText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
});
