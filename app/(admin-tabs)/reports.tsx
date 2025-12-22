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
import { BarChart, PieChart } from "react-native-gifted-charts";
import { Colors, Typography, Spacing } from "@/constants/design";
import { FloatingHeaderStyles } from "@/components/FloatingHeader.styles";

interface Transaction {
  id: string;
  user: string;
  type: "subscription" | "listing";
  plan: string;
  amount: string;
  date: string;
  status: "completed" | "pending" | "failed";
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
  const insets = useSafeAreaInsets();
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
        text: "PDF",
        onPress: () => Alert.alert("Success", "Report exported as PDF"),
      },
      {
        text: "CSV",
        onPress: () => Alert.alert("Success", "Report exported as CSV"),
      },
    ]);
  };

  // Revenue data for bar chart
  const revenueData = [
    { value: 12500, label: "Jan", frontColor: Colors.primaryGreen },
    { value: 18200, label: "Feb", frontColor: Colors.primaryGreen },
    { value: 15800, label: "Mar", frontColor: Colors.primaryGreen },
    { value: 22100, label: "Apr", frontColor: Colors.primaryGreen },
    { value: 28500, label: "May", frontColor: Colors.primaryGreen },
    { value: 32400, label: "Jun", frontColor: Colors.primaryGreen },
    { value: 38900, label: "Jul", frontColor: Colors.primaryGreen },
    { value: 35600, label: "Aug", frontColor: Colors.primaryGreen },
    { value: 42300, label: "Sep", frontColor: Colors.primaryGreen },
    { value: 48700, label: "Oct", frontColor: Colors.primaryGreen },
    { value: 52100, label: "Nov", frontColor: Colors.primaryGreen },
    { value: 45280, label: "Dec", frontColor: "#3B82F6" },
  ];

  // Plan distribution for pie chart
  const planDistribution = [
    { value: 45, color: "#3B82F6", text: "Basic" },
    { value: 35, color: Colors.primaryGreen, text: "Standard" },
    { value: 20, color: "#8B5CF6", text: "Premium" },
  ];

  const filteredTransactions = MOCK_TRANSACTIONS.filter((t) => {
    if (planFilter === "all") return true;
    return t.plan.toLowerCase() === planFilter;
  });

  const getStatusStyle = (status: Transaction["status"]) => {
    switch (status) {
      case "completed":
        return { bg: `${Colors.primaryGreen}15`, text: Colors.primaryGreen };
      case "pending":
        return { bg: "#FEF3C7", text: "#F59E0B" };
      case "failed":
        return { bg: "#FEE2E2", text: "#EF4444" };
    }
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
            <Text style={styles.headerTitleText}>Reports</Text>
          </View>

          {/* Export Button */}
          <TouchableOpacity
            style={styles.exportButton}
            onPress={handleExport}
            activeOpacity={0.7}
          >
            <Ionicons
              name="download-outline"
              size={18}
              color={Colors.primaryGreen}
            />
            <Text style={styles.exportButtonText}>Export</Text>
          </TouchableOpacity>
        </View>

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
              tintColor={Colors.primaryGreen}
              progressViewOffset={80 + insets.top}
            />
          }
        >
          {/* Time Period Selector */}
          <View style={styles.timePeriodContainer}>
            {TIME_PERIODS.map((period) => (
              <TouchableOpacity
                key={period.id}
                style={[
                  styles.timePeriodTab,
                  timePeriod === period.id && styles.timePeriodTabActive,
                ]}
                onPress={() => setTimePeriod(period.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.timePeriodText,
                    timePeriod === period.id && styles.timePeriodTextActive,
                  ]}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Revenue Overview */}
          <View style={styles.revenueOverview}>
            <View style={styles.revenueCard}>
              <Text style={styles.revenueLabel}>Total Revenue</Text>
              <Text style={styles.revenueValue}>₵45,280</Text>
              <View style={styles.revenueChange}>
                <Ionicons name="trending-up" size={16} color="#FFFFFF" />
                <Text style={styles.revenueChangeText}>+18% vs last month</Text>
              </View>
            </View>
            <View style={styles.revenueStats}>
              <View style={styles.revenueStat}>
                <Text style={styles.revenueStatValue}>284</Text>
                <Text style={styles.revenueStatLabel}>Transactions</Text>
              </View>
              <View style={styles.revenueStat}>
                <Text style={styles.revenueStatValue}>₵159</Text>
                <Text style={styles.revenueStatLabel}>Avg. Value</Text>
              </View>
            </View>
          </View>

          {/* Revenue Chart */}
          <View style={styles.chartSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Revenue Trend</Text>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#3B82F6" }]}
                />
                <Text style={styles.legendText}>Current</Text>
              </View>
            </View>
            <View style={styles.chartCard}>
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
                xAxisColor={Colors.divider}
                yAxisTextStyle={styles.chartAxisText}
                xAxisLabelTextStyle={styles.chartAxisTextSmall}
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
            <Text style={styles.sectionTitle}>Subscription Distribution</Text>
            <View style={styles.pieChartCard}>
              <View style={styles.pieChartWrapper}>
                <PieChart
                  data={planDistribution}
                  donut
                  radius={85}
                  innerRadius={55}
                  centerLabelComponent={() => (
                    <View style={styles.pieCenter}>
                      <Text style={styles.pieCenterValue}>284</Text>
                      <Text style={styles.pieCenterLabel}>Total</Text>
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
                    <Text style={styles.pieLegendText}>{item.text}</Text>
                    <Text style={styles.pieLegendValue}>{item.value}%</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.quickStatCard}>
              <View
                style={[
                  styles.quickStatIcon,
                  { backgroundColor: `${Colors.primaryGreen}15` },
                ]}
              >
                <Ionicons
                  name="trending-up"
                  size={20}
                  color={Colors.primaryGreen}
                />
              </View>
              <Text style={styles.quickStatValue}>+24%</Text>
              <Text style={styles.quickStatLabel}>Growth Rate</Text>
            </View>
            <View style={styles.quickStatCard}>
              <View
                style={[styles.quickStatIcon, { backgroundColor: "#3B82F615" }]}
              >
                <Ionicons name="people" size={20} color="#3B82F6" />
              </View>
              <Text style={styles.quickStatValue}>156</Text>
              <Text style={styles.quickStatLabel}>New Subscribers</Text>
            </View>
            <View style={styles.quickStatCard}>
              <View
                style={[styles.quickStatIcon, { backgroundColor: "#8B5CF615" }]}
              >
                <Ionicons name="repeat" size={20} color="#8B5CF6" />
              </View>
              <Text style={styles.quickStatValue}>89%</Text>
              <Text style={styles.quickStatLabel}>Retention</Text>
            </View>
          </View>

          {/* Plan Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
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
                    planFilter === plan && styles.planFilterTabActive,
                  ]}
                  onPress={() => setPlanFilter(plan as PlanFilter)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.planFilterText,
                      planFilter === plan && styles.planFilterTextActive,
                    ]}
                  >
                    {plan.charAt(0).toUpperCase() + plan.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Transactions List */}
          <View style={styles.transactionsList}>
            {filteredTransactions.map((transaction, index) => {
              const statusStyle = getStatusStyle(transaction.status);
              return (
                <View
                  key={transaction.id}
                  style={[
                    styles.transactionItem,
                    index === filteredTransactions.length - 1 && {
                      borderBottomWidth: 0,
                    },
                  ]}
                >
                  <View style={styles.transactionIcon}>
                    <Ionicons
                      name={
                        transaction.type === "subscription" ? "card" : "home"
                      }
                      size={20}
                      color={Colors.primaryGreen}
                    />
                  </View>
                  <View style={styles.transactionContent}>
                    <Text style={styles.transactionUser}>
                      {transaction.user}
                    </Text>
                    <View style={styles.transactionMeta}>
                      <View style={styles.planBadge}>
                        <Text style={styles.planBadgeText}>
                          {transaction.plan}
                        </Text>
                      </View>
                      <Text style={styles.transactionDate}>
                        {transaction.date}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text style={styles.transactionAmount}>
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
          <TouchableOpacity style={styles.viewAllButton} activeOpacity={0.7}>
            <Text style={styles.viewAllButtonText}>View All Transactions</Text>
            <Ionicons
              name="arrow-forward"
              size={18}
              color={Colors.primaryGreen}
            />
          </TouchableOpacity>
        </ScrollView>
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
    color: Colors.textPrimary,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.primaryGreen,
    backgroundColor: Colors.surface,
  },
  exportButtonText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
  // Time Period
  timePeriodContainer: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 4,
    marginBottom: Spacing.xl,
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
  timePeriodTab: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    alignItems: "center",
    borderRadius: 10,
  },
  timePeriodTabActive: {
    backgroundColor: Colors.primaryGreen,
  },
  timePeriodText: {
    ...Typography.labelMedium,
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  timePeriodTextActive: {
    color: "#FFFFFF",
  },
  // Revenue Overview
  revenueOverview: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  revenueCard: {
    flex: 1.4,
    backgroundColor: Colors.primaryGreen,
    borderRadius: 20,
    padding: Spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryGreen,
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
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    justifyContent: "center",
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
  revenueStatValue: {
    ...Typography.headlineMedium,
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  revenueStatLabel: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
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
    color: Colors.textPrimary,
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
    color: Colors.textSecondary,
  },
  chartCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.lg,
    paddingRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.divider,
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
    color: Colors.textSecondary,
  },
  chartAxisTextSmall: {
    ...Typography.caption,
    fontSize: 9,
    color: Colors.textSecondary,
  },
  // Pie Chart
  pieChartCard: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.divider,
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
    color: Colors.textPrimary,
  },
  pieCenterLabel: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
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
    color: Colors.textPrimary,
    flex: 1,
    fontWeight: "500",
  },
  pieLegendValue: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  // Quick Stats
  quickStats: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    alignItems: "center",
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
    color: Colors.textPrimary,
  },
  quickStatLabel: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textSecondary,
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
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  planFilterTabActive: {
    backgroundColor: Colors.primaryGreen,
    borderColor: Colors.primaryGreen,
  },
  planFilterText: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  planFilterTextActive: {
    color: "#FFFFFF",
  },
  // Transactions List
  transactionsList: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.divider,
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
    borderBottomColor: Colors.divider,
    gap: Spacing.md,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: `${Colors.primaryGreen}15`,
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
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  planBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  planBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  transactionDate: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    ...Typography.labelMedium,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
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
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  viewAllButtonText: {
    ...Typography.labelMedium,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
});
