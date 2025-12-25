import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Share,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { LineChart, BarChart, PieChart } from "react-native-gifted-charts";
import { Typography, Spacing } from "@/constants/design";
import { useTheme } from "@/contexts/ThemeContext";
import { FloatingHeader } from "@/components/FloatingHeader";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CHART_WIDTH = SCREEN_WIDTH - Spacing.xl * 2 - 32;

// Time period options
const TIME_PERIODS = [
  { id: "7d", label: "7 Days" },
  { id: "30d", label: "30 Days" },
  { id: "90d", label: "90 Days" },
  { id: "all", label: "All Time" },
];

// Mock analytics data
const ANALYTICS_DATA = {
  overview: {
    totalViews: 1234,
    uniqueViews: 892,
    saves: 156,
    inquiries: 42,
    messages: 28,
    shares: 18,
    avgTimeOnPage: "2:45",
    conversionRate: 3.4,
  },
  viewsOverTime: {
    "7d": [
      { value: 45, label: "Mon" },
      { value: 62, label: "Tue" },
      { value: 58, label: "Wed" },
      { value: 75, label: "Thu" },
      { value: 89, label: "Fri" },
      { value: 102, label: "Sat" },
      { value: 95, label: "Sun" },
    ],
    "30d": [
      { value: 120, label: "W1" },
      { value: 185, label: "W2" },
      { value: 210, label: "W3" },
      { value: 245, label: "W4" },
    ],
    "90d": [
      { value: 320, label: "M1" },
      { value: 480, label: "M2" },
      { value: 434, label: "M3" },
    ],
    all: [
      { value: 150, label: "Oct" },
      { value: 280, label: "Nov" },
      { value: 420, label: "Dec" },
      { value: 384, label: "Jan" },
    ],
  },
  trafficSources: [
    { value: 45, color: "#4CAF50", text: "Search", label: "Search" },
    { value: 25, color: "#F59E0B", text: "Direct", label: "Direct" },
    { value: 18, color: "#FFC107", text: "Shared", label: "Shared" },
    { value: 12, color: "#6366F1", text: "Social", label: "Social" },
  ],
  engagementByDay: [
    { value: 15, label: "Mon", frontColor: "#4CAF50" },
    { value: 22, label: "Tue", frontColor: "#4CAF50" },
    { value: 18, label: "Wed", frontColor: "#4CAF50" },
    { value: 28, label: "Thu", frontColor: "#4CAF50" },
    { value: 35, label: "Fri", frontColor: "#4CAF50" },
    { value: 42, label: "Sat", frontColor: "#4CAF50" },
    { value: 38, label: "Sun", frontColor: "#4CAF50" },
  ],
  recentActivity: [
    { type: "view", count: 12, time: "Last hour" },
    { type: "save", count: 3, time: "Last 3 hours" },
    { type: "inquiry", count: 2, time: "Last 6 hours" },
    { type: "message", count: 1, time: "Last 12 hours" },
  ],
};

export default function ListingAnalyticsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState("7d");

  const handleExportReport = async () => {
    try {
      await Share.share({
        message: `Listing Analytics Report\n\nTotal Views: ${
          ANALYTICS_DATA.overview.totalViews
        }\nUnique Views: ${ANALYTICS_DATA.overview.uniqueViews}\nSaves: ${
          ANALYTICS_DATA.overview.saves
        }\nInquiries: ${
          ANALYTICS_DATA.overview.inquiries
        }\n\nGenerated on ${new Date().toLocaleDateString()}`,
        title: "Listing Analytics Report",
      });
    } catch (error) {
      console.error("Error exporting:", error);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "view":
        return "eye-outline";
      case "save":
        return "heart-outline";
      case "inquiry":
        return "chatbubble-outline";
      case "message":
        return "mail-outline";
      default:
        return "ellipse-outline";
    }
  };

  const getActivityColor = (type: string, themeColors: any) => {
    switch (type) {
      case "view":
        return themeColors.primary;
      case "save":
        return "#F59E0B";
      case "inquiry":
        return "#FFC107";
      case "message":
        return "#6366F1";
      default:
        return themeColors.textSecondary;
    }
  };

  const currentViewsData =
    ANALYTICS_DATA.viewsOverTime[
      selectedPeriod as keyof typeof ANALYTICS_DATA.viewsOverTime
    ];

  // Update chart data with theme colors
  const engagementByDayData = ANALYTICS_DATA.engagementByDay.map((item) => ({
    ...item,
    frontColor: colors.primary,
  }));

  const trafficSourcesData = ANALYTICS_DATA.trafficSources.map(
    (item, index) => ({
      ...item,
      color: index === 0 ? colors.primary : item.color,
    })
  );

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
          title="Listing Analytics"
          showBackButton
          onBackPress={() => router.back()}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: 80 + insets.top,
              paddingBottom: insets.bottom + 40,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Time Period Selector */}
          <View
            style={[styles.periodSelector, { backgroundColor: colors.surface }]}
          >
            {TIME_PERIODS.map((period) => (
              <TouchableOpacity
                key={period.id}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.id && {
                    backgroundColor: colors.primary,
                  },
                ]}
                onPress={() => setSelectedPeriod(period.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    {
                      color:
                        selectedPeriod === period.id
                          ? "#FFFFFF"
                          : colors.textSecondary,
                    },
                    selectedPeriod === period.id && { fontWeight: "600" },
                  ]}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Stats Overview Cards */}
          <View style={styles.statsGrid}>
            <View
              style={[styles.statCard, { backgroundColor: colors.surface }]}
            >
              <View
                style={[
                  styles.statIconBg,
                  { backgroundColor: `${colors.primary}15` },
                ]}
              >
                <Ionicons name="eye-outline" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {ANALYTICS_DATA.overview.totalViews.toLocaleString()}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Total Views
              </Text>
              <View
                style={[
                  styles.statTrend,
                  { backgroundColor: `${colors.primary}10` },
                ]}
              >
                <Ionicons name="trending-up" size={14} color={colors.primary} />
                <Text style={[styles.statTrendText, { color: colors.primary }]}>
                  +12%
                </Text>
              </View>
            </View>

            <View
              style={[styles.statCard, { backgroundColor: colors.surface }]}
            >
              <View
                style={[styles.statIconBg, { backgroundColor: "#F59E0B15" }]}
              >
                <Ionicons name="people-outline" size={24} color="#F59E0B" />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {ANALYTICS_DATA.overview.uniqueViews.toLocaleString()}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Unique Views
              </Text>
              <View
                style={[
                  styles.statTrend,
                  { backgroundColor: `${colors.primary}10` },
                ]}
              >
                <Ionicons name="trending-up" size={14} color={colors.primary} />
                <Text style={[styles.statTrendText, { color: colors.primary }]}>
                  +8%
                </Text>
              </View>
            </View>

            <View
              style={[styles.statCard, { backgroundColor: colors.surface }]}
            >
              <View
                style={[styles.statIconBg, { backgroundColor: "#FFC10715" }]}
              >
                <Ionicons name="heart-outline" size={24} color="#FFC107" />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {ANALYTICS_DATA.overview.saves}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Saves
              </Text>
              <View
                style={[
                  styles.statTrend,
                  { backgroundColor: `${colors.primary}10` },
                ]}
              >
                <Ionicons name="trending-up" size={14} color={colors.primary} />
                <Text style={[styles.statTrendText, { color: colors.primary }]}>
                  +15%
                </Text>
              </View>
            </View>

            <View
              style={[styles.statCard, { backgroundColor: colors.surface }]}
            >
              <View
                style={[styles.statIconBg, { backgroundColor: "#6366F115" }]}
              >
                <Ionicons name="chatbubble-outline" size={24} color="#6366F1" />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {ANALYTICS_DATA.overview.inquiries}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Inquiries
              </Text>
              <View
                style={[
                  styles.statTrend,
                  { backgroundColor: `${colors.primary}10` },
                ]}
              >
                <Ionicons name="trending-up" size={14} color={colors.primary} />
                <Text style={[styles.statTrendText, { color: colors.primary }]}>
                  +22%
                </Text>
              </View>
            </View>
          </View>

          {/* Additional Stats Row */}
          <View
            style={[
              styles.additionalStats,
              { backgroundColor: colors.surface },
            ]}
          >
            <View style={styles.additionalStatItem}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={colors.textSecondary}
              />
              <Text
                style={[styles.additionalStatValue, { color: colors.text }]}
              >
                {ANALYTICS_DATA.overview.messages}
              </Text>
              <Text
                style={[
                  styles.additionalStatLabel,
                  { color: colors.textSecondary },
                ]}
              >
                Messages
              </Text>
            </View>
            <View
              style={[
                styles.additionalStatDivider,
                { backgroundColor: colors.divider },
              ]}
            />
            <View style={styles.additionalStatItem}>
              <Ionicons
                name="share-social-outline"
                size={20}
                color={colors.textSecondary}
              />
              <Text
                style={[styles.additionalStatValue, { color: colors.text }]}
              >
                {ANALYTICS_DATA.overview.shares}
              </Text>
              <Text
                style={[
                  styles.additionalStatLabel,
                  { color: colors.textSecondary },
                ]}
              >
                Shares
              </Text>
            </View>
            <View
              style={[
                styles.additionalStatDivider,
                { backgroundColor: colors.divider },
              ]}
            />
            <View style={styles.additionalStatItem}>
              <Ionicons
                name="time-outline"
                size={20}
                color={colors.textSecondary}
              />
              <Text
                style={[styles.additionalStatValue, { color: colors.text }]}
              >
                {ANALYTICS_DATA.overview.avgTimeOnPage}
              </Text>
              <Text
                style={[
                  styles.additionalStatLabel,
                  { color: colors.textSecondary },
                ]}
              >
                Avg. Time
              </Text>
            </View>
            <View
              style={[
                styles.additionalStatDivider,
                { backgroundColor: colors.divider },
              ]}
            />
            <View style={styles.additionalStatItem}>
              <Ionicons
                name="analytics-outline"
                size={20}
                color={colors.textSecondary}
              />
              <Text
                style={[styles.additionalStatValue, { color: colors.text }]}
              >
                {ANALYTICS_DATA.overview.conversionRate}%
              </Text>
              <Text
                style={[
                  styles.additionalStatLabel,
                  { color: colors.textSecondary },
                ]}
              >
                Conversion
              </Text>
            </View>
          </View>

          {/* Views Over Time Chart */}
          <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
            <View style={styles.chartHeader}>
              <Text style={[styles.chartTitle, { color: colors.text }]}>
                Views Over Time
              </Text>
              <View style={styles.chartLegend}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: colors.primary },
                  ]}
                />
                <Text
                  style={[styles.legendText, { color: colors.textSecondary }]}
                >
                  Views
                </Text>
              </View>
            </View>
            <View style={styles.chartContainer}>
              <LineChart
                data={currentViewsData}
                width={CHART_WIDTH}
                height={180}
                spacing={CHART_WIDTH / (currentViewsData.length + 1)}
                initialSpacing={20}
                color={colors.primary}
                thickness={3}
                startFillColor={`${colors.primary}40`}
                endFillColor={`${colors.primary}05`}
                startOpacity={0.9}
                endOpacity={0.1}
                hideDataPoints={false}
                dataPointsColor={colors.primary}
                dataPointsRadius={5}
                curved
                areaChart
                yAxisColor="transparent"
                xAxisColor={colors.divider}
                yAxisTextStyle={{
                  ...styles.axisText,
                  color: colors.textSecondary,
                }}
                xAxisLabelTextStyle={{
                  ...styles.axisText,
                  color: colors.textSecondary,
                }}
                hideRules
                noOfSections={4}
                maxValue={
                  Math.max(...currentViewsData.map((d) => d.value)) * 1.2
                }
              />
            </View>
          </View>

          {/* Engagement by Day Chart */}
          <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
            <View style={styles.chartHeader}>
              <Text style={[styles.chartTitle, { color: colors.text }]}>
                Engagement by Day
              </Text>
            </View>
            <View style={styles.chartContainer}>
              <BarChart
                data={engagementByDayData}
                width={CHART_WIDTH}
                height={160}
                barWidth={28}
                spacing={16}
                initialSpacing={10}
                roundedTop
                roundedBottom
                hideRules
                xAxisThickness={1}
                yAxisThickness={0}
                xAxisColor={colors.divider}
                yAxisTextStyle={{
                  ...styles.axisText,
                  color: colors.textSecondary,
                }}
                xAxisLabelTextStyle={{
                  ...styles.axisText,
                  color: colors.textSecondary,
                }}
                noOfSections={4}
                maxValue={50}
                isAnimated
              />
            </View>
          </View>

          {/* Traffic Sources */}
          <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
            <View style={styles.chartHeader}>
              <Text style={[styles.chartTitle, { color: colors.text }]}>
                Traffic Sources
              </Text>
            </View>
            <View style={styles.pieChartContainer}>
              <PieChart
                data={trafficSourcesData}
                donut
                radius={80}
                innerRadius={50}
                innerCircleColor={colors.surface}
                centerLabelComponent={() => (
                  <View style={styles.pieCenter}>
                    <Text
                      style={[styles.pieCenterValue, { color: colors.text }]}
                    >
                      100%
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
              />
              <View style={styles.pieChartLegend}>
                {trafficSourcesData.map((source, index) => (
                  <View key={index} style={styles.pieChartLegendItem}>
                    <View
                      style={[
                        styles.pieChartLegendDot,
                        { backgroundColor: source.color },
                      ]}
                    />
                    <Text
                      style={[
                        styles.pieChartLegendLabel,
                        { color: colors.text },
                      ]}
                    >
                      {source.label}
                    </Text>
                    <Text
                      style={[
                        styles.pieChartLegendValue,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {source.value}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Recent Activity */}
          <View
            style={[styles.activityCard, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.activityTitle, { color: colors.text }]}>
              Recent Activity
            </Text>
            {ANALYTICS_DATA.recentActivity.map((activity, index) => {
              const activityColor = getActivityColor(activity.type, colors);
              return (
                <View
                  key={index}
                  style={[
                    styles.activityItem,
                    { borderBottomColor: colors.divider },
                  ]}
                >
                  <View
                    style={[
                      styles.activityIconBg,
                      { backgroundColor: `${activityColor}15` },
                    ]}
                  >
                    <Ionicons
                      name={getActivityIcon(activity.type) as any}
                      size={18}
                      color={activityColor}
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text
                      style={[styles.activityCount, { color: colors.text }]}
                    >
                      {activity.count}{" "}
                      {activity.type === "view"
                        ? "views"
                        : activity.type === "save"
                        ? "saves"
                        : activity.type === "inquiry"
                        ? "inquiries"
                        : "messages"}
                    </Text>
                    <Text
                      style={[
                        styles.activityTime,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {activity.time}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.textSecondary}
                  />
                </View>
              );
            })}
          </View>

          {/* Export Button */}
          <TouchableOpacity
            style={styles.exportButton}
            onPress={handleExportReport}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.exportButtonGradient}
            >
              <Ionicons name="download-outline" size={20} color="#FFFFFF" />
              <Text style={styles.exportButtonText}>Export Report</Text>
            </LinearGradient>
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
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },

  // Period Selector
  periodSelector: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  periodButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    borderRadius: 10,
  },
  periodButtonActive: {},
  periodButtonText: {
    ...Typography.labelMedium,
  },
  periodButtonTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm) / 2,
    borderRadius: 16,
    padding: Spacing.md,
    alignItems: "center",
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
  statIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  statValue: {
    ...Typography.headlineLarge,
  },
  statLabel: {
    ...Typography.caption,
    marginTop: 2,
  },
  statTrend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: Spacing.xs,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statTrendText: {
    ...Typography.caption,
    fontWeight: "600",
  },

  // Additional Stats
  additionalStats: {
    flexDirection: "row",
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
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
  additionalStatItem: {
    flex: 1,
    alignItems: "center",
  },
  additionalStatValue: {
    ...Typography.headlineMedium,
    fontSize: 18,
    marginTop: 4,
  },
  additionalStatLabel: {
    ...Typography.caption,
    marginTop: 2,
  },
  additionalStatDivider: {
    width: 1,
    height: 40,
    alignSelf: "center",
  },

  // Chart Card
  chartCard: {
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
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
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  chartTitle: {
    ...Typography.headlineMedium,
    fontSize: 18,
  },
  chartLegend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    ...Typography.caption,
  },
  chartContainer: {
    alignItems: "center",
    overflow: "hidden",
  },
  axisText: {
    fontSize: 10,
  },

  // Pie Chart
  pieChartContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  pieCenter: {
    alignItems: "center",
  },
  pieCenterValue: {
    ...Typography.headlineMedium,
  },
  pieCenterLabel: {
    ...Typography.caption,
  },
  pieChartLegend: {
    gap: Spacing.sm,
  },
  pieChartLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  pieChartLegendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pieChartLegendLabel: {
    ...Typography.bodyMedium,
    flex: 1,
  },
  pieChartLegendValue: {
    ...Typography.labelMedium,
  },

  // Activity Card
  activityCard: {
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
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
  activityTitle: {
    ...Typography.headlineMedium,
    fontSize: 18,
    marginBottom: Spacing.md,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  activityIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityCount: {
    ...Typography.bodyMedium,
    fontWeight: "500",
  },
  activityTime: {
    ...Typography.caption,
    marginTop: 2,
  },

  // Export Button
  exportButton: {
    marginTop: Spacing.sm,
  },
  exportButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md + 2,
    borderRadius: 16,
  },
  exportButtonText: {
    ...Typography.labelLarge,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
