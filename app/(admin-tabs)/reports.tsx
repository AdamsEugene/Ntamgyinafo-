import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Alert,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BarChart, PieChart } from "react-native-gifted-charts";
import { Typography, Spacing } from "@/constants/design";
import { useTheme } from "@/contexts/ThemeContext";
import { FloatingHeader } from "@/components/FloatingHeader";
import {
  exportToCSV,
  exportToPDF,
  formatCurrencyForExport,
} from "@/utils/exportUtils";

interface Transaction {
  id: string;
  user: string;
  type: "subscription" | "listing";
  plan: string;
  amount: string;
  date: string;
  status: "completed" | "pending" | "failed";
  paymentMethod?: "momo" | "card" | "bank";
}

type TimePeriod = "today" | "week" | "month" | "year";
type PlanFilter = "all" | "basic" | "standard" | "premium";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CHART_WIDTH = SCREEN_WIDTH - Spacing.lg * 2 - Spacing.lg * 2; // Account for padding

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "t1",
    user: "Kofi Mensah",
    type: "subscription",
    plan: "Standard",
    amount: "₵80",
    date: "Today, 2:30 PM",
    status: "completed",
  },
  {
    id: "t2",
    user: "Ama Serwaa",
    type: "subscription",
    plan: "Premium",
    amount: "₵120",
    date: "Today, 11:15 AM",
    status: "completed",
  },
  {
    id: "t3",
    user: "Kwame Asante",
    type: "subscription",
    plan: "Basic",
    amount: "₵50",
    date: "Yesterday",
    status: "completed",
  },
  {
    id: "t4",
    user: "Akua Boateng",
    type: "subscription",
    plan: "Standard",
    amount: "₵80",
    date: "Dec 20, 2024",
    status: "pending",
  },
  {
    id: "t5",
    user: "Yaw Mensah",
    type: "subscription",
    plan: "Basic",
    amount: "₵50",
    date: "Dec 19, 2024",
    status: "failed",
  },
  {
    id: "t6",
    user: "Esi Darkwa",
    type: "subscription",
    plan: "Premium",
    amount: "₵120",
    date: "Dec 18, 2024",
    status: "completed",
  },
];

const TIME_PERIODS: { id: TimePeriod; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "year", label: "This Year" },
];

export default function PaymentReportsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("month");
  const [planFilter, setPlanFilter] = useState<PlanFilter>("all");

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleExport = () => {
    Alert.alert("Export Report", "Choose export format", [
      { text: "Cancel", style: "cancel" },
      {
        text: "CSV",
        onPress: () => {
          const exportData = MOCK_TRANSACTIONS.map((tx) => ({
            Date: tx.date,
            User: tx.user,
            Type: tx.type,
            Plan: tx.plan || "-",
            Amount: formatCurrencyForExport(tx.amount),
            Status: tx.status,
            "Payment Method": tx.paymentMethod,
          }));
          const headers = [
            "Date",
            "User",
            "Type",
            "Plan",
            "Amount",
            "Status",
            "Payment Method",
          ];
          exportToCSV(
            exportData,
            headers,
            `payment-report-${timePeriod}-${new Date().getTime()}`
          );
        },
      },
      {
        text: "PDF",
        onPress: () => {
          const exportData = MOCK_TRANSACTIONS.map((tx) => ({
            Date: tx.date,
            User: tx.user,
            Type: tx.type,
            Plan: tx.plan || "-",
            Amount: tx.amount,
            Status: tx.status,
            "Payment Method": tx.paymentMethod,
          }));
          const headers = [
            "Date",
            "User",
            "Type",
            "Plan",
            "Amount",
            "Status",
            "Payment Method",
          ];
          exportToPDF(
            `Payment Report - ${
              TIME_PERIODS.find((p) => p.id === timePeriod)?.label
            }`,
            exportData,
            headers,
            `payment-report-${timePeriod}-${new Date().getTime()}`
          );
        },
      },
    ]);
  };

  // Revenue data for bar chart
  const revenueData = [
    { value: 12500, label: "Jan", frontColor: colors.primary },
    { value: 18200, label: "Feb", frontColor: colors.primary },
    { value: 15800, label: "Mar", frontColor: colors.primary },
    { value: 22100, label: "Apr", frontColor: colors.primary },
    { value: 28500, label: "May", frontColor: colors.primary },
    { value: 32400, label: "Jun", frontColor: colors.primary },
    { value: 38900, label: "Jul", frontColor: colors.primary },
    { value: 35600, label: "Aug", frontColor: colors.primary },
    { value: 42300, label: "Sep", frontColor: colors.primary },
    { value: 48700, label: "Oct", frontColor: colors.primary },
    { value: 52100, label: "Nov", frontColor: colors.primary },
    { value: 45280, label: "Dec", frontColor: "#3B82F6" },
  ];

  // Plan distribution for pie chart
  const planDistribution = [
    { value: 45, color: "#3B82F6", text: "Basic" },
    { value: 35, color: colors.primary, text: "Standard" },
    { value: 20, color: "#8B5CF6", text: "Premium" },
  ];

  const filteredTransactions = MOCK_TRANSACTIONS.filter((t) => {
    if (planFilter === "all") return true;
    return t.plan.toLowerCase() === planFilter;
  });

  const getStatusStyle = (status: Transaction["status"]) => {
    switch (status) {
      case "completed":
        return {
          bg: `${colors.primary}15`,
          text: colors.primary,
        };
      case "pending":
        return {
          bg: isDark ? "#78350F" : "#FEF3C7",
          text: "#F59E0B",
        };
      case "failed":
        return {
          bg: isDark ? "#7F1D1D" : "#FEE2E2",
          text: "#EF4444",
        };
    }
  };

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
          title="Reports"
          rightContent={
            <TouchableOpacity
              style={styles.exportButton}
              onPress={handleExport}
              activeOpacity={0.7}
            >
              <Ionicons
                name="download-outline"
                size={18}
                color={colors.primary}
              />
              <Text
                style={[styles.exportButtonText, { color: colors.primary }]}
              >
                Export
              </Text>
            </TouchableOpacity>
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
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              progressViewOffset={80 + insets.top}
            />
          }
        >
          {/* Time Period Selector */}
          <View
            style={[
              styles.timePeriodContainer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.divider,
              },
            ]}
          >
            {TIME_PERIODS.map((period) => (
              <TouchableOpacity
                key={period.id}
                style={[
                  styles.timePeriodTab,
                  timePeriod === period.id && {
                    backgroundColor: colors.primary,
                  },
                ]}
                onPress={() => setTimePeriod(period.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.timePeriodText,
                    { color: colors.textSecondary },
                    timePeriod === period.id && {
                      color: "#FFFFFF",
                    },
                  ]}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Revenue Overview */}
          <View style={styles.revenueOverview}>
            <View
              style={[
                styles.revenueCard,
                {
                  backgroundColor: colors.primary,
                  ...Platform.select({
                    ios: {
                      shadowColor: colors.primary,
                    },
                  }),
                },
              ]}
            >
              <Text style={styles.revenueLabel}>Total Revenue</Text>
              <Text style={styles.revenueValue}>₵45,280</Text>
              <View style={styles.revenueChange}>
                <Ionicons name="trending-up" size={16} color="#FFFFFF" />
                <Text style={styles.revenueChangeText}>+18% vs last month</Text>
              </View>
            </View>
            <View style={styles.revenueStats}>
              <View
                style={[
                  styles.revenueStat,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.divider,
                  },
                ]}
              >
                <Text style={[styles.revenueStatValue, { color: colors.text }]}>
                  284
                </Text>
                <Text
                  style={[
                    styles.revenueStatLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Transactions
                </Text>
              </View>
              <View
                style={[
                  styles.revenueStat,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.divider,
                  },
                ]}
              >
                <Text style={[styles.revenueStatValue, { color: colors.text }]}>
                  ₵159
                </Text>
                <Text
                  style={[
                    styles.revenueStatLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Avg. Value
                </Text>
              </View>
            </View>
          </View>

          {/* Revenue Chart */}
          <View style={styles.chartSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Revenue Trend
              </Text>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#3B82F6" }]}
                />
                <Text
                  style={[styles.legendText, { color: colors.textSecondary }]}
                >
                  Current
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.chartCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
            >
              <BarChart
                data={revenueData}
                width={CHART_WIDTH}
                height={200}
                barWidth={18}
                spacing={10}
                noOfSections={5}
                barBorderRadius={6}
                yAxisThickness={0}
                xAxisThickness={1}
                xAxisColor={colors.divider}
                yAxisTextStyle={[
                  styles.chartAxisText,
                  { color: colors.textSecondary },
                ]}
                xAxisLabelTextStyle={[
                  styles.chartAxisTextSmall,
                  { color: colors.textSecondary },
                ]}
                hideRules
                isAnimated
                initialSpacing={8}
                endSpacing={8}
                maxValue={60000}
                formatYLabel={(value) => {
                  const num = Number(value);
                  if (num >= 1000000) {
                    return `${(num / 1000000).toFixed(1)}M`;
                  } else if (num >= 1000) {
                    return `${(num / 1000).toFixed(0)}K`;
                  }
                  return value;
                }}
              />
            </View>
          </View>

          {/* Plan Distribution */}
          <View style={styles.chartSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Subscription Distribution
            </Text>
            <View
              style={[
                styles.pieChartCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
            >
              <View style={styles.pieChartWrapper}>
                <PieChart
                  data={planDistribution}
                  donut
                  radius={85}
                  innerRadius={55}
                  innerCircleColor={colors.background}
                  centerLabelComponent={() => (
                    <View style={styles.pieCenter}>
                      <Text
                        style={[styles.pieCenterValue, { color: colors.text }]}
                      >
                        284
                      </Text>
                      <Text
                        style={[
                          styles.pieCenterLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Total
                      </Text>
                    </View>
                  )}
                  showValuesAsLabels
                  showTextBackground
                  textBackgroundRadius={14}
                  focusOnPress
                  isAnimated
                />
              </View>
              <View style={styles.pieLegend}>
                {planDistribution.map((item) => (
                  <View key={item.text} style={styles.pieLegendItem}>
                    <View
                      style={[
                        styles.pieLegendDot,
                        { backgroundColor: item.color },
                      ]}
                    />
                    <Text
                      style={[styles.pieLegendText, { color: colors.text }]}
                    >
                      {item.text}
                    </Text>
                    <Text
                      style={[
                        styles.pieLegendValue,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {item.value}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View
              style={[
                styles.quickStatCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
            >
              <View
                style={[
                  styles.quickStatIcon,
                  { backgroundColor: `${colors.primary}15` },
                ]}
              >
                <Ionicons name="trending-up" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.quickStatValue, { color: colors.text }]}>
                +24%
              </Text>
              <Text
                style={[styles.quickStatLabel, { color: colors.textSecondary }]}
              >
                Growth Rate
              </Text>
            </View>
            <View
              style={[
                styles.quickStatCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
            >
              <View
                style={[styles.quickStatIcon, { backgroundColor: "#3B82F615" }]}
              >
                <Ionicons name="people" size={20} color="#3B82F6" />
              </View>
              <Text style={[styles.quickStatValue, { color: colors.text }]}>
                156
              </Text>
              <Text
                style={[styles.quickStatLabel, { color: colors.textSecondary }]}
              >
                New Subscribers
              </Text>
            </View>
            <View
              style={[
                styles.quickStatCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
            >
              <View
                style={[styles.quickStatIcon, { backgroundColor: "#8B5CF615" }]}
              >
                <Ionicons name="repeat" size={20} color="#8B5CF6" />
              </View>
              <Text style={[styles.quickStatValue, { color: colors.text }]}>
                89%
              </Text>
              <Text
                style={[styles.quickStatLabel, { color: colors.textSecondary }]}
              >
                Retention
              </Text>
            </View>
          </View>

          {/* Plan Filter */}
          <View style={styles.filterSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recent Transactions
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.planFilters}
            >
              {["all", "basic", "standard", "premium"].map((plan) => (
                <TouchableOpacity
                  key={plan}
                  style={[
                    styles.planFilterTab,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.divider,
                    },
                    planFilter === plan && {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => setPlanFilter(plan as PlanFilter)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.planFilterText,
                      { color: colors.textSecondary },
                      planFilter === plan && {
                        color: "#FFFFFF",
                      },
                    ]}
                  >
                    {plan.charAt(0).toUpperCase() + plan.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Transactions List */}
          <View
            style={[
              styles.transactionsList,
              {
                backgroundColor: colors.surface,
                borderColor: colors.divider,
              },
            ]}
          >
            {filteredTransactions.map((transaction, index) => {
              const statusStyle = getStatusStyle(transaction.status);
              return (
                <View
                  key={transaction.id}
                  style={[
                    styles.transactionItem,
                    { borderBottomColor: colors.divider },
                    index === filteredTransactions.length - 1 && {
                      borderBottomWidth: 0,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.transactionIcon,
                      { backgroundColor: `${colors.primary}15` },
                    ]}
                  >
                    <Ionicons
                      name={
                        transaction.type === "subscription" ? "card" : "home"
                      }
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.transactionContent}>
                    <Text
                      style={[styles.transactionUser, { color: colors.text }]}
                    >
                      {transaction.user}
                    </Text>
                    <View style={styles.transactionMeta}>
                      <View
                        style={[
                          styles.planBadge,
                          { backgroundColor: colors.background },
                        ]}
                      >
                        <Text
                          style={[
                            styles.planBadgeText,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {transaction.plan}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.transactionDate,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {transaction.date}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text
                      style={[styles.transactionAmount, { color: colors.text }]}
                    >
                      {transaction.amount}
                    </Text>
                    <View
                      style={[
                        styles.transactionStatus,
                        { backgroundColor: statusStyle.bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.transactionStatusText,
                          { color: statusStyle.text },
                        ]}
                      >
                        {transaction.status.charAt(0).toUpperCase() +
                          transaction.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* View All Button */}
          <TouchableOpacity
            style={[
              styles.viewAllButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.divider,
              },
            ]}
            activeOpacity={0.7}
            onPress={() => router.push("/(admin-tabs)/transactions")}
          >
            <Text style={[styles.viewAllButtonText, { color: colors.primary }]}>
              View All Transactions
            </Text>
            <Ionicons name="arrow-forward" size={18} color={colors.primary} />
          </TouchableOpacity>
        </ScrollView>
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
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  exportButtonText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
  },
  // Time Period
  timePeriodContainer: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 4,
    marginBottom: Spacing.xl,
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
  timePeriodTab: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    alignItems: "center",
    borderRadius: 10,
  },
  timePeriodText: {
    ...Typography.labelMedium,
    fontSize: 12,
    fontWeight: "600",
  },
  // Revenue Overview
  revenueOverview: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  revenueCard: {
    flex: 1.4,
    borderRadius: 20,
    padding: Spacing.lg,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  revenueLabel: {
    ...Typography.caption,
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  revenueValue: {
    ...Typography.headlineLarge,
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: Spacing.sm,
    letterSpacing: -0.5,
  },
  revenueChange: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  revenueChangeText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  revenueStats: {
    flex: 1,
    gap: Spacing.md,
  },
  revenueStat: {
    flex: 1,
    borderRadius: 16,
    padding: Spacing.md,
    justifyContent: "center",
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
  revenueStatValue: {
    ...Typography.headlineMedium,
    fontSize: 22,
    fontWeight: "700",
  },
  revenueStatLabel: {
    ...Typography.caption,
    fontSize: 11,
    marginTop: 2,
  },
  // Chart Section
  chartSection: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: "700",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    ...Typography.caption,
    fontSize: 12,
  },
  chartCard: {
    borderRadius: 20,
    padding: Spacing.lg,
    paddingRight: Spacing.sm,
    borderWidth: 1,
    overflow: "hidden",
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
  chartAxisText: {
    ...Typography.caption,
    fontSize: 10,
  },
  chartAxisTextSmall: {
    ...Typography.caption,
    fontSize: 9,
  },
  // Pie Chart
  pieChartCard: {
    flexDirection: "row",
    borderRadius: 20,
    padding: Spacing.lg,
    borderWidth: 1,
    alignItems: "center",
    gap: Spacing.lg,
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
  pieChartWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  pieCenter: {
    alignItems: "center",
  },
  pieCenterValue: {
    ...Typography.headlineMedium,
    fontSize: 24,
    fontWeight: "700",
  },
  pieCenterLabel: {
    ...Typography.caption,
    fontSize: 11,
  },
  pieLegend: {
    flex: 1,
    gap: Spacing.md,
  },
  pieLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  pieLegendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  pieLegendText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    flex: 1,
    fontWeight: "500",
  },
  pieLegendValue: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "700",
  },
  // Quick Stats
  quickStats: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  quickStatCard: {
    flex: 1,
    borderRadius: 16,
    padding: Spacing.md,
    alignItems: "center",
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
  quickStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  quickStatValue: {
    ...Typography.titleMedium,
    fontSize: 18,
    fontWeight: "700",
  },
  quickStatLabel: {
    ...Typography.caption,
    fontSize: 10,
    textAlign: "center",
    marginTop: 2,
  },
  // Filter Section
  filterSection: {
    marginBottom: Spacing.md,
  },
  planFilters: {
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  planFilterTab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
  },
  planFilterText: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
  },
  // Transactions List
  transactionsList: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    marginBottom: Spacing.lg,
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
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.md,
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
  transactionUser: {
    ...Typography.labelMedium,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  planBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  planBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "600",
  },
  transactionDate: {
    ...Typography.caption,
    fontSize: 11,
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    ...Typography.labelMedium,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  transactionStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  transactionStatusText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "600",
  },
  // View All Button
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
  },
  viewAllButtonText: {
    ...Typography.labelMedium,
    fontSize: 15,
    fontWeight: "600",
  },
});
