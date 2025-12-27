import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Keyboard,
  Alert,
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
import { Typography, Spacing } from "@/constants/design";
import { useTheme } from "@/contexts/ThemeContext";
import {
  FloatingHeader,
  HeaderActionButton,
} from "@/components/FloatingHeader";
import { FloatingSearchBar } from "@/components/FloatingSearchBar";
import {
  exportToCSV,
  exportToPDF,
  formatCurrencyForExport,
} from "@/utils/exportUtils";

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
  { id: "completed", label: "Completed", color: "#4CAF50" },
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
  const { colors, isDark } = useTheme();
  const filterSheetRef = useRef<BottomSheetModal>(null);
  const detailSheetRef = useRef<BottomSheetModal>(null);

  const [transactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

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
          bg: `${colors.primary}15`,
          text: colors.primary,
          icon: "checkmark-circle",
        };
      case "pending":
        return {
          bg: isDark ? "#78350F" : "#FEF3C7",
          text: "#F59E0B",
          icon: "time",
        };
      case "failed":
        return {
          bg: isDark ? "#7F1D1D" : "#FEE2E2",
          text: "#EF4444",
          icon: "close-circle",
        };
      case "refunded":
        return {
          bg: isDark ? "#581C87" : "#F3E8FF",
          text: "#8B5CF6",
          icon: "arrow-undo",
        };
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
        style={[
          styles.transactionCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.divider,
          },
        ]}
        activeOpacity={0.7}
        onPress={() => handleTransactionPress(item)}
      >
        {/* Left Icon */}
        <View
          style={[
            styles.transactionIcon,
            { backgroundColor: `${colors.primary}15` },
          ]}
        >
          <Ionicons
            name={getTypeIcon(item.type) as any}
            size={20}
            color={colors.primary}
          />
        </View>

        {/* Content */}
        <View style={styles.transactionContent}>
          <View style={styles.transactionHeader}>
            <Text style={[styles.transactionUser, { color: colors.text }]}>
              {item.user}
            </Text>
            <Text
              style={[
                styles.transactionAmount,
                { color: colors.primary },
                item.type === "refund" && { color: "#EF4444" },
              ]}
            >
              {item.amount}
            </Text>
          </View>

          <View style={styles.transactionMeta}>
            <View
              style={[styles.planBadge, { backgroundColor: colors.background }]}
            >
              <Text
                style={[styles.planBadgeText, { color: colors.textSecondary }]}
              >
                {item.plan ||
                  item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </Text>
            </View>
            <View
              style={[
                styles.paymentMethod,
                { backgroundColor: colors.background },
              ]}
            >
              <Ionicons
                name={getPaymentMethodIcon(item.paymentMethod) as any}
                size={12}
                color={colors.textSecondary}
              />
            </View>
            <Text
              style={[styles.transactionDate, { color: colors.textSecondary }]}
            >
              {item.date} • {item.time}
            </Text>
          </View>

          <View style={styles.transactionFooter}>
            <Text
              style={[styles.transactionRef, { color: colors.textSecondary }]}
            >
              {item.reference}
            </Text>
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
          title="Transactions"
          showBackButton
          onBackPress={() => router.back()}
          rightContent={
            <>
              <TouchableOpacity
                style={styles.exportButton}
                onPress={() => {
                  Alert.alert("Export Transactions", "Choose export format", [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "CSV",
                      onPress: () => {
                        const exportData = filteredTransactions.map((tx) => ({
                          Date: tx.date,
                          Time: tx.time,
                          User: tx.user,
                          Type: tx.type,
                          Plan: tx.plan || "-",
                          Amount: formatCurrencyForExport(tx.amount),
                          Status: tx.status,
                          Reference: tx.reference,
                          "Payment Method": tx.paymentMethod,
                        }));
                        const headers = [
                          "Date",
                          "Time",
                          "User",
                          "Type",
                          "Plan",
                          "Amount",
                          "Status",
                          "Reference",
                          "Payment Method",
                        ];
                        exportToCSV(
                          exportData,
                          headers,
                          `transactions-${new Date().getTime()}`
                        );
                      },
                    },
                    {
                      text: "PDF",
                      onPress: () => {
                        const exportData = filteredTransactions.map((tx) => ({
                          Date: tx.date,
                          Time: tx.time,
                          User: tx.user,
                          Type: tx.type,
                          Plan: tx.plan || "-",
                          Amount: tx.amount,
                          Status: tx.status,
                          Reference: tx.reference,
                          "Payment Method": tx.paymentMethod,
                        }));
                        const headers = [
                          "Date",
                          "Time",
                          "User",
                          "Type",
                          "Plan",
                          "Amount",
                          "Status",
                          "Reference",
                          "Payment Method",
                        ];
                        exportToPDF(
                          "All Transactions Report",
                          exportData,
                          headers,
                          `transactions-${new Date().getTime()}`
                        );
                      },
                    },
                  ]);
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="download-outline"
                  size={18}
                  color={colors.primary}
                />
              </TouchableOpacity>
              <HeaderActionButton
                icon="options-outline"
                onPress={() => filterSheetRef.current?.present()}
                badge={activeFiltersCount > 0 ? activeFiltersCount : undefined}
              />
            </>
          }
        />

        {/* Summary Cards */}
        <View style={[styles.summaryContainer, { top: 70 + insets.top }]}>
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.divider,
              },
            ]}
          >
            <View
              style={[
                styles.summaryIcon,
                { backgroundColor: `${colors.primary}15` },
              ]}
            >
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={colors.primary}
              />
            </View>
            <View>
              <Text
                style={[styles.summaryLabel, { color: colors.textSecondary }]}
              >
                Completed
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                ₵{completedTotal.toFixed(2)}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.divider,
              },
            ]}
          >
            <View
              style={[
                styles.summaryIcon,
                { backgroundColor: isDark ? "#78350F" : "#FEF3C7" },
              ]}
            >
              <Ionicons name="time" size={18} color="#F59E0B" />
            </View>
            <View>
              <Text
                style={[styles.summaryLabel, { color: colors.textSecondary }]}
              >
                Pending
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
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
            <Text
              style={[styles.resultsCount, { color: colors.textSecondary }]}
            >
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
              tintColor={colors.primary}
              progressViewOffset={140 + insets.top}
            />
          }
          ListEmptyComponent={
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
                  name="receipt-outline"
                  size={48}
                  color={colors.textSecondary}
                />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No Transactions Found
              </Text>
              <Text
                style={[styles.emptyMessage, { color: colors.textSecondary }]}
              >
                {searchQuery
                  ? "Try a different search term"
                  : "No transactions match the current filters"}
              </Text>
              {(statusFilter !== "all" || typeFilter !== "all") && (
                <TouchableOpacity
                  style={[
                    styles.clearFiltersButton,
                    { borderColor: colors.primary },
                  ]}
                  onPress={() => {
                    setStatusFilter("all");
                    setTypeFilter("all");
                  }}
                >
                  <Text
                    style={[
                      styles.clearFiltersButtonText,
                      { color: colors.primary },
                    ]}
                  >
                    Clear Filters
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />

        {/* Floating Search Input */}
        <FloatingSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by name or reference..."
          collapsedWidth={200}
          collapsedHeight={44}
        />

        {/* Filter Bottom Sheet */}
        <BottomSheetModal
          ref={filterSheetRef}
          index={0}
          snapPoints={["60%"]}
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={{ backgroundColor: colors.divider }}
          backgroundStyle={{ backgroundColor: colors.surface }}
        >
          <BottomSheetScrollView style={styles.filterSheetContent}>
            <Text style={[styles.filterSheetTitle, { color: colors.text }]}>
              Filter Transactions
            </Text>

            {/* Status Filter */}
            <Text
              style={[
                styles.filterSectionTitle,
                { color: colors.textSecondary },
              ]}
            >
              Status
            </Text>
            <View style={styles.filterOptions}>
              {STATUS_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.filterOption,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.divider,
                    },
                    statusFilter === option.id && {
                      borderColor: option.color,
                      backgroundColor: `${option.color}08`,
                    },
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
                      { color: colors.textSecondary },
                      statusFilter === option.id && {
                        color: colors.text,
                        fontWeight: "600",
                      },
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
            <Text
              style={[
                styles.filterSectionTitle,
                { color: colors.textSecondary },
              ]}
            >
              Transaction Type
            </Text>
            <View style={styles.filterOptions}>
              {TYPE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.filterOption,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.divider,
                    },
                    typeFilter === option.id && {
                      borderColor: colors.primary,
                      backgroundColor: `${colors.primary}08`,
                    },
                  ]}
                  onPress={() => setTypeFilter(option.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      { color: colors.textSecondary },
                      typeFilter === option.id && {
                        color: colors.text,
                        fontWeight: "600",
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                  {typeFilter === option.id && (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Apply Button */}
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: colors.primary }]}
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
                <Text
                  style={[
                    styles.clearButtonText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Clear All Filters
                </Text>
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
          handleIndicatorStyle={{ backgroundColor: colors.divider }}
          backgroundStyle={{ backgroundColor: colors.surface }}
        >
          <BottomSheetView style={styles.detailSheetContent}>
            {selectedTransaction && (
              <>
                {/* Header */}
                <View
                  style={[
                    styles.detailHeader,
                    { borderBottomColor: colors.divider },
                  ]}
                >
                  <View
                    style={[
                      styles.detailIconContainer,
                      { backgroundColor: `${colors.primary}15` },
                    ]}
                  >
                    <Ionicons
                      name={getTypeIcon(selectedTransaction.type) as any}
                      size={28}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.detailHeaderInfo}>
                    <Text style={[styles.detailAmount, { color: colors.text }]}>
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
                <View
                  style={[
                    styles.detailsList,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.divider,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.detailRow,
                      { borderBottomColor: colors.divider },
                    ]}
                  >
                    <View style={styles.detailRowLeft}>
                      <View
                        style={[
                          styles.detailRowIcon,
                          { backgroundColor: colors.background },
                        ]}
                      >
                        <Ionicons
                          name="person-outline"
                          size={18}
                          color={colors.textSecondary}
                        />
                      </View>
                      <Text
                        style={[
                          styles.detailRowLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Customer
                      </Text>
                    </View>
                    <Text
                      style={[styles.detailRowValue, { color: colors.text }]}
                    >
                      {selectedTransaction.user}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.detailRow,
                      { borderBottomColor: colors.divider },
                    ]}
                  >
                    <View style={styles.detailRowLeft}>
                      <View
                        style={[
                          styles.detailRowIcon,
                          { backgroundColor: colors.background },
                        ]}
                      >
                        <Ionicons
                          name="ribbon-outline"
                          size={18}
                          color={colors.textSecondary}
                        />
                      </View>
                      <Text
                        style={[
                          styles.detailRowLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Plan
                      </Text>
                    </View>
                    <Text
                      style={[styles.detailRowValue, { color: colors.text }]}
                    >
                      {selectedTransaction.plan || "N/A"}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.detailRow,
                      { borderBottomColor: colors.divider },
                    ]}
                  >
                    <View style={styles.detailRowLeft}>
                      <View
                        style={[
                          styles.detailRowIcon,
                          { backgroundColor: colors.background },
                        ]}
                      >
                        <Ionicons
                          name="pricetag-outline"
                          size={18}
                          color={colors.textSecondary}
                        />
                      </View>
                      <Text
                        style={[
                          styles.detailRowLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Type
                      </Text>
                    </View>
                    <Text
                      style={[styles.detailRowValue, { color: colors.text }]}
                    >
                      {selectedTransaction.type.charAt(0).toUpperCase() +
                        selectedTransaction.type.slice(1)}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.detailRow,
                      { borderBottomColor: colors.divider },
                    ]}
                  >
                    <View style={styles.detailRowLeft}>
                      <View
                        style={[
                          styles.detailRowIcon,
                          { backgroundColor: colors.background },
                        ]}
                      >
                        <Ionicons
                          name={
                            getPaymentMethodIcon(
                              selectedTransaction.paymentMethod
                            ) as any
                          }
                          size={18}
                          color={colors.textSecondary}
                        />
                      </View>
                      <Text
                        style={[
                          styles.detailRowLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Payment Method
                      </Text>
                    </View>
                    <Text
                      style={[styles.detailRowValue, { color: colors.text }]}
                    >
                      {selectedTransaction.paymentMethod === "momo"
                        ? "Mobile Money"
                        : selectedTransaction.paymentMethod === "card"
                        ? "Card"
                        : "Bank Transfer"}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.detailRow,
                      { borderBottomColor: colors.divider },
                    ]}
                  >
                    <View style={styles.detailRowLeft}>
                      <View
                        style={[
                          styles.detailRowIcon,
                          { backgroundColor: colors.background },
                        ]}
                      >
                        <Ionicons
                          name="calendar-outline"
                          size={18}
                          color={colors.textSecondary}
                        />
                      </View>
                      <Text
                        style={[
                          styles.detailRowLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Date & Time
                      </Text>
                    </View>
                    <Text
                      style={[styles.detailRowValue, { color: colors.text }]}
                    >
                      {selectedTransaction.date} • {selectedTransaction.time}
                    </Text>
                  </View>

                  <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                    <View style={styles.detailRowLeft}>
                      <View
                        style={[
                          styles.detailRowIcon,
                          { backgroundColor: colors.background },
                        ]}
                      >
                        <Ionicons
                          name="receipt-outline"
                          size={18}
                          color={colors.textSecondary}
                        />
                      </View>
                      <Text
                        style={[
                          styles.detailRowLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Reference
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.detailRowValue,
                        styles.detailRefValue,
                        { color: colors.text },
                      ]}
                    >
                      {selectedTransaction.reference}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.detailActions}>
                  <TouchableOpacity
                    style={[
                      styles.detailActionButton,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.divider,
                      },
                    ]}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="download-outline"
                      size={20}
                      color={colors.primary}
                    />
                    <Text
                      style={[
                        styles.detailActionText,
                        { color: colors.primary },
                      ]}
                    >
                      Download Receipt
                    </Text>
                  </TouchableOpacity>
                  {selectedTransaction.status === "pending" && (
                    <TouchableOpacity
                      style={[
                        styles.detailActionButton,
                        {
                          backgroundColor: colors.surface,
                          borderColor: isDark ? "#7F1D1D" : "#FEE2E2",
                        },
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
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.xs,
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
    borderRadius: 14,
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
  },
  summaryValue: {
    ...Typography.labelMedium,
    fontSize: 15,
    fontWeight: "700",
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
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
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
  },
  transactionAmount: {
    ...Typography.labelMedium,
    fontSize: 16,
    fontWeight: "700",
  },
  transactionMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  planBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  planBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "600",
  },
  paymentMethod: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  transactionDate: {
    ...Typography.caption,
    fontSize: 11,
  },
  transactionFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  transactionRef: {
    ...Typography.caption,
    fontSize: 10,
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
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
    borderWidth: 1,
  },
  emptyTitle: {
    ...Typography.titleMedium,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  emptyMessage: {
    ...Typography.bodyMedium,
    fontSize: 14,
    textAlign: "center",
  },
  clearFiltersButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  clearFiltersButtonText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
  },
  // Filter Sheet
  filterSheetContent: {
    padding: Spacing.xl,
  },
  filterSheetTitle: {
    ...Typography.headlineMedium,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: Spacing.xl,
  },
  filterSectionTitle: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
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
    borderRadius: 14,
    borderWidth: 1,
  },
  filterOptionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  filterOptionText: {
    ...Typography.bodyMedium,
    fontSize: 15,
    flex: 1,
  },
  applyButton: {
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
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
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
    alignItems: "center",
    justifyContent: "center",
  },
  detailRowLabel: {
    ...Typography.bodyMedium,
    fontSize: 14,
  },
  detailRowValue: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
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
    borderRadius: 14,
    borderWidth: 1,
  },
  detailActionText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
  },
});
