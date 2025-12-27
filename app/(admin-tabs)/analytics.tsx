import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Dimensions,
  LayoutChangeEvent,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { BarChart, LineChart } from "react-native-gifted-charts";
import { Typography, Spacing } from "@/constants/design";
import { useTheme } from "@/contexts/ThemeContext";
import { FloatingHeader } from "@/components/FloatingHeader";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface AnalyticsMetric {
  id: string;
  label: string;
  value: string;
  change: string;
  changeType: "up" | "down" | "neutral";
  icon: keyof typeof Ionicons.glyphMap;
}

const USER_ANALYTICS: AnalyticsMetric[] = [
  {
    id: "signups",
    label: "Total Signups",
    value: "12,458",
    change: "+234 this week",
    changeType: "up",
    icon: "person-add",
  },
  {
    id: "dau",
    label: "Daily Active Users",
    value: "3,245",
    change: "+12% vs last week",
    changeType: "up",
    icon: "people",
  },
  {
    id: "mau",
    label: "Monthly Active Users",
    value: "8,923",
    change: "+8% vs last month",
    changeType: "up",
    icon: "people-circle",
  },
  {
    id: "retention",
    label: "7-Day Retention",
    value: "68%",
    change: "+5% vs last month",
    changeType: "up",
    icon: "trending-up",
  },
];

const PROPERTY_ANALYTICS: AnalyticsMetric[] = [
  {
    id: "listings",
    label: "Total Listings",
    value: "3,892",
    change: "+56 today",
    changeType: "up",
    icon: "home",
  },
  {
    id: "views",
    label: "Total Views",
    value: "124,567",
    change: "+1,234 today",
    changeType: "up",
    icon: "eye",
  },
  {
    id: "contacts",
    label: "Property Contacts",
    value: "8,234",
    change: "+89 today",
    changeType: "up",
    icon: "chatbubble",
  },
  {
    id: "conversion",
    label: "Contact Rate",
    value: "6.6%",
    change: "+0.8% vs last week",
    changeType: "up",
    icon: "trending-up",
  },
];

const REVENUE_ANALYTICS: AnalyticsMetric[] = [
  {
    id: "revenue",
    label: "Total Revenue",
    value: "₵245,680",
    change: "+18% vs last month",
    changeType: "up",
    icon: "cash",
  },
  {
    id: "arpu",
    label: "ARPU",
    value: "₵19.72",
    change: "+₵2.15 vs last month",
    changeType: "up",
    icon: "trending-up",
  },
  {
    id: "conversion",
    label: "Conversion Rate",
    value: "12.4%",
    change: "+1.2% vs last month",
    changeType: "up",
    icon: "arrow-up",
  },
  {
    id: "churn",
    label: "Churn Rate",
    value: "4.2%",
    change: "-0.8% vs last month",
    changeType: "down",
    icon: "arrow-down",
  },
];

const SIGNUPS_DATA = [
  { value: 120, label: "Mon" },
  { value: 145, label: "Tue" },
  { value: 98, label: "Wed" },
  { value: 167, label: "Thu" },
  { value: 134, label: "Fri" },
  { value: 189, label: "Sat" },
  { value: 156, label: "Sun" },
];

const REVENUE_DATA = [
  { value: 45000, label: "Week 1" },
  { value: 52000, label: "Week 2" },
  { value: 48000, label: "Week 3" },
  { value: 61000, label: "Week 4" },
];

const POPULAR_LOCATIONS = [
  { name: "Accra", count: 1245, percentage: 32 },
  { name: "Kumasi", count: 892, percentage: 23 },
  { name: "Tamale", count: 456, percentage: 12 },
  { name: "Takoradi", count: 389, percentage: 10 },
  { name: "Cape Coast", count: 234, percentage: 6 },
];

export default function PlatformAnalyticsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "users" | "properties" | "revenue"
  >("users");
  const [chartWidth, setChartWidth] = useState(
    SCREEN_WIDTH - Spacing.lg * 2 - Spacing.lg * 2
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleChartLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    // Account for card padding (Spacing.lg on each side)
    const availableWidth = width - Spacing.lg * 2;
    setChartWidth(availableWidth);
  };

  const renderMetricCard = (metric: AnalyticsMetric) => (
    <View
      key={metric.id}
      style={[
        styles.metricCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.divider,
        },
      ]}
    >
      <View style={styles.metricHeader}>
        <View
          style={[
            styles.metricIconContainer,
            { backgroundColor: `${colors.primary}15` },
          ]}
        >
          <Ionicons name={metric.icon} size={20} color={colors.primary} />
        </View>
        <View
          style={[
            styles.changeBadge,
            {
              backgroundColor:
                metric.changeType === "up"
                  ? `${colors.primary}15`
                  : metric.changeType === "down"
                  ? isDark
                    ? "#7F1D1D"
                    : "#FEE2E2"
                  : `${colors.textSecondary}15`,
            },
          ]}
        >
          <Ionicons
            name={
              metric.changeType === "up"
                ? "arrow-up"
                : metric.changeType === "down"
                ? "arrow-down"
                : "remove"
            }
            size={12}
            color={
              metric.changeType === "up"
                ? colors.primary
                : metric.changeType === "down"
                ? "#EF4444"
                : colors.textSecondary
            }
          />
          <Text
            style={[
              styles.changeText,
              {
                color:
                  metric.changeType === "up"
                    ? colors.primary
                    : metric.changeType === "down"
                    ? "#EF4444"
                    : colors.textSecondary,
              },
            ]}
          >
            {metric.change}
          </Text>
        </View>
      </View>
      <Text style={[styles.metricValue, { color: colors.text }]}>
        {metric.value}
      </Text>
      <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
        {metric.label}
      </Text>
    </View>
  );

  const getCurrentMetrics = () => {
    switch (activeTab) {
      case "users":
        return USER_ANALYTICS;
      case "properties":
        return PROPERTY_ANALYTICS;
      case "revenue":
        return REVENUE_ANALYTICS;
      default:
        return USER_ANALYTICS;
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

        <FloatingHeader
          title="Platform Analytics"
          showBackButton
          onBackPress={() => router.back()}
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
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Tab Selector */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "users" && {
                  backgroundColor: colors.primary,
                },
              ]}
              onPress={() => setActiveTab("users")}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === "users" ? "#FFFFFF" : colors.textSecondary,
                  },
                ]}
              >
                Users
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "properties" && {
                  backgroundColor: colors.primary,
                },
              ]}
              onPress={() => setActiveTab("properties")}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === "properties"
                        ? "#FFFFFF"
                        : colors.textSecondary,
                  },
                ]}
              >
                Properties
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "revenue" && {
                  backgroundColor: colors.primary,
                },
              ]}
              onPress={() => setActiveTab("revenue")}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === "revenue"
                        ? "#FFFFFF"
                        : colors.textSecondary,
                  },
                ]}
              >
                Revenue
              </Text>
            </TouchableOpacity>
          </View>

          {/* Metrics Grid */}
          <View style={styles.metricsGrid}>
            {getCurrentMetrics().map(renderMetricCard)}
          </View>

          {/* Charts Section */}
          {activeTab === "users" && (
            <View
              style={[
                styles.chartCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
            >
              <Text style={[styles.chartTitle, { color: colors.text }]}>
                Weekly Signups
              </Text>
              <View style={styles.chartContainer} onLayout={handleChartLayout}>
                <BarChart
                  data={SIGNUPS_DATA.map((item) => ({
                    value: item.value,
                    label: item.label,
                  }))}
                  width={chartWidth}
                  height={200}
                  barWidth={28}
                  spacing={16}
                  frontColor={colors.primary}
                  yAxisThickness={1}
                  xAxisThickness={1}
                  yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
                  xAxisLabelTextStyle={{
                    color: colors.textSecondary,
                    fontSize: 10,
                  }}
                  noOfSections={4}
                  maxValue={200}
                  isAnimated
                />
              </View>
            </View>
          )}

          {activeTab === "revenue" && (
            <View
              style={[
                styles.chartCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
            >
              <Text style={[styles.chartTitle, { color: colors.text }]}>
                Monthly Revenue Trend
              </Text>
              <View style={styles.chartContainer} onLayout={handleChartLayout}>
                <LineChart
                  data={REVENUE_DATA.map((item) => ({
                    value: item.value / 1000,
                    label: item.label,
                  }))}
                  width={chartWidth}
                  height={200}
                  color={colors.primary}
                  thickness={3}
                  yAxisThickness={1}
                  xAxisThickness={1}
                  yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
                  xAxisLabelTextStyle={{
                    color: colors.textSecondary,
                    fontSize: 10,
                  }}
                  noOfSections={4}
                  maxValue={70}
                  isAnimated
                />
              </View>
            </View>
          )}

          {activeTab === "properties" && (
            <View
              style={[
                styles.chartCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
            >
              <Text style={[styles.chartTitle, { color: colors.text }]}>
                Popular Locations
              </Text>
              <View style={styles.locationsList}>
                {POPULAR_LOCATIONS.map((location, index) => (
                  <View key={index} style={styles.locationItem}>
                    <View style={styles.locationInfo}>
                      <Text
                        style={[styles.locationName, { color: colors.text }]}
                      >
                        {location.name}
                      </Text>
                      <Text
                        style={[
                          styles.locationCount,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {location.count} listings
                      </Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                      <View
                        style={[
                          styles.progressBar,
                          {
                            width: `${location.percentage}%`,
                            backgroundColor: colors.primary,
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.locationPercentage,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {location.percentage}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
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
    height: 300,
    overflow: "hidden",
  },
  circle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -50,
    right: -50,
  },
  circle2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    top: 100,
    left: -30,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  tabContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  tabText: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  metricCard: {
    width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.md) / 2,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  metricIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 6,
  },
  changeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "600",
  },
  metricValue: {
    ...Typography.headlineMedium,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  metricLabel: {
    ...Typography.bodyMedium,
    fontSize: 12,
  },
  chartCard: {
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  chartTitle: {
    ...Typography.titleMedium,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.md,
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    width: "100%",
  },
  locationsList: {
    gap: Spacing.md,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    ...Typography.bodyMedium,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  locationCount: {
    ...Typography.caption,
    fontSize: 12,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  locationPercentage: {
    ...Typography.labelMedium,
    fontSize: 12,
    fontWeight: "600",
    minWidth: 40,
    textAlign: "right",
  },
});
