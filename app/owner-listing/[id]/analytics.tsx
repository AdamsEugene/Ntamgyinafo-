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
import { Colors, Typography, Spacing } from "@/constants/design";

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
    { value: 45, color: Colors.primaryGreen, text: "Search", label: "Search" },
    { value: 25, color: Colors.accentOrange, text: "Direct", label: "Direct" },
    { value: 18, color: Colors.accentGold, text: "Shared", label: "Shared" },
    { value: 12, color: "#6366F1", text: "Social", label: "Social" },
  ],
  engagementByDay: [
    { value: 15, label: "Mon", frontColor: Colors.primaryGreen },
    { value: 22, label: "Tue", frontColor: Colors.primaryGreen },
    { value: 18, label: "Wed", frontColor: Colors.primaryGreen },
    { value: 28, label: "Thu", frontColor: Colors.primaryGreen },
    { value: 35, label: "Fri", frontColor: Colors.primaryGreen },
    { value: 42, label: "Sat", frontColor: Colors.primaryGreen },
    { value: 38, label: "Sun", frontColor: Colors.primaryGreen },
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

  const getActivityColor = (type: string) => {
    switch (type) {
      case "view":
        return Colors.primaryGreen;
      case "save":
        return Colors.accentOrange;
      case "inquiry":
        return Colors.accentGold;
      case "message":
        return "#6366F1";
      default:
        return Colors.textSecondary;
    }
  };

  const currentViewsData =
    ANALYTICS_DATA.viewsOverTime[
      selectedPeriod as keyof typeof ANALYTICS_DATA.viewsOverTime
    ];

  return (
    <>
      <StatusBar style="dark" />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Listing Analytics</Text>
          <TouchableOpacity
            onPress={handleExportReport}
            style={styles.headerButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name="download-outline"
              size={24}
              color={Colors.primaryGreen}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Time Period Selector */}
          <View style={styles.periodSelector}>
            {TIME_PERIODS.map((period) => (
              <TouchableOpacity
                key={period.id}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.id && styles.periodButtonActive,
                ]}
                onPress={() => setSelectedPeriod(period.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    selectedPeriod === period.id &&
                      styles.periodButtonTextActive,
                  ]}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Stats Overview Cards */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconBg,
                  { backgroundColor: `${Colors.primaryGreen}15` },
                ]}
              >
                <Ionicons
                  name="eye-outline"
                  size={24}
                  color={Colors.primaryGreen}
                />
              </View>
              <Text style={styles.statValue}>
                {ANALYTICS_DATA.overview.totalViews.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Total Views</Text>
              <View style={styles.statTrend}>
                <Ionicons
                  name="trending-up"
                  size={14}
                  color={Colors.primaryGreen}
                />
                <Text style={styles.statTrendText}>+12%</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconBg,
                  { backgroundColor: `${Colors.accentOrange}15` },
                ]}
              >
                <Ionicons
                  name="people-outline"
                  size={24}
                  color={Colors.accentOrange}
                />
              </View>
              <Text style={styles.statValue}>
                {ANALYTICS_DATA.overview.uniqueViews.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Unique Views</Text>
              <View style={styles.statTrend}>
                <Ionicons
                  name="trending-up"
                  size={14}
                  color={Colors.primaryGreen}
                />
                <Text style={styles.statTrendText}>+8%</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconBg,
                  { backgroundColor: `${Colors.accentGold}15` },
                ]}
              >
                <Ionicons
                  name="heart-outline"
                  size={24}
                  color={Colors.accentGold}
                />
              </View>
              <Text style={styles.statValue}>
                {ANALYTICS_DATA.overview.saves}
              </Text>
              <Text style={styles.statLabel}>Saves</Text>
              <View style={styles.statTrend}>
                <Ionicons
                  name="trending-up"
                  size={14}
                  color={Colors.primaryGreen}
                />
                <Text style={styles.statTrendText}>+15%</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View
                style={[styles.statIconBg, { backgroundColor: "#6366F115" }]}
              >
                <Ionicons name="chatbubble-outline" size={24} color="#6366F1" />
              </View>
              <Text style={styles.statValue}>
                {ANALYTICS_DATA.overview.inquiries}
              </Text>
              <Text style={styles.statLabel}>Inquiries</Text>
              <View style={styles.statTrend}>
                <Ionicons
                  name="trending-up"
                  size={14}
                  color={Colors.primaryGreen}
                />
                <Text style={styles.statTrendText}>+22%</Text>
              </View>
            </View>
          </View>

          {/* Additional Stats Row */}
          <View style={styles.additionalStats}>
            <View style={styles.additionalStatItem}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={Colors.textSecondary}
              />
              <Text style={styles.additionalStatValue}>
                {ANALYTICS_DATA.overview.messages}
              </Text>
              <Text style={styles.additionalStatLabel}>Messages</Text>
            </View>
            <View style={styles.additionalStatDivider} />
            <View style={styles.additionalStatItem}>
              <Ionicons
                name="share-social-outline"
                size={20}
                color={Colors.textSecondary}
              />
              <Text style={styles.additionalStatValue}>
                {ANALYTICS_DATA.overview.shares}
              </Text>
              <Text style={styles.additionalStatLabel}>Shares</Text>
            </View>
            <View style={styles.additionalStatDivider} />
            <View style={styles.additionalStatItem}>
              <Ionicons
                name="time-outline"
                size={20}
                color={Colors.textSecondary}
              />
              <Text style={styles.additionalStatValue}>
                {ANALYTICS_DATA.overview.avgTimeOnPage}
              </Text>
              <Text style={styles.additionalStatLabel}>Avg. Time</Text>
            </View>
            <View style={styles.additionalStatDivider} />
            <View style={styles.additionalStatItem}>
              <Ionicons
                name="analytics-outline"
                size={20}
                color={Colors.textSecondary}
              />
              <Text style={styles.additionalStatValue}>
                {ANALYTICS_DATA.overview.conversionRate}%
              </Text>
              <Text style={styles.additionalStatLabel}>Conversion</Text>
            </View>
          </View>

          {/* Views Over Time Chart */}
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Views Over Time</Text>
              <View style={styles.chartLegend}>
                <View style={styles.legendDot} />
                <Text style={styles.legendText}>Views</Text>
              </View>
            </View>
            <View style={styles.chartContainer}>
              <LineChart
                data={currentViewsData}
                width={CHART_WIDTH}
                height={180}
                spacing={CHART_WIDTH / (currentViewsData.length + 1)}
                initialSpacing={20}
                color={Colors.primaryGreen}
                thickness={3}
                startFillColor={`${Colors.primaryGreen}40`}
                endFillColor={`${Colors.primaryGreen}05`}
                startOpacity={0.9}
                endOpacity={0.1}
                hideDataPoints={false}
                dataPointsColor={Colors.primaryGreen}
                dataPointsRadius={5}
                curved
                areaChart
                yAxisColor="transparent"
                xAxisColor="#E5E5E5"
                yAxisTextStyle={styles.axisText}
                xAxisLabelTextStyle={styles.axisText}
                hideRules
                noOfSections={4}
                maxValue={
                  Math.max(...currentViewsData.map((d) => d.value)) * 1.2
                }
              />
            </View>
          </View>

          {/* Engagement by Day Chart */}
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Engagement by Day</Text>
            </View>
            <View style={styles.chartContainer}>
              <BarChart
                data={ANALYTICS_DATA.engagementByDay}
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
                xAxisColor="#E5E5E5"
                yAxisTextStyle={styles.axisText}
                xAxisLabelTextStyle={styles.axisText}
                noOfSections={4}
                maxValue={50}
                isAnimated
              />
            </View>
          </View>

          {/* Traffic Sources */}
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Traffic Sources</Text>
            </View>
            <View style={styles.pieChartContainer}>
              <PieChart
                data={ANALYTICS_DATA.trafficSources}
                donut
                radius={80}
                innerRadius={50}
                innerCircleColor={Colors.surface}
                centerLabelComponent={() => (
                  <View style={styles.pieCenter}>
                    <Text style={styles.pieCenterValue}>100%</Text>
                    <Text style={styles.pieCenterLabel}>Total</Text>
                  </View>
                )}
              />
              <View style={styles.pieChartLegend}>
                {ANALYTICS_DATA.trafficSources.map((source, index) => (
                  <View key={index} style={styles.pieChartLegendItem}>
                    <View
                      style={[
                        styles.pieChartLegendDot,
                        { backgroundColor: source.color },
                      ]}
                    />
                    <Text style={styles.pieChartLegendLabel}>
                      {source.label}
                    </Text>
                    <Text style={styles.pieChartLegendValue}>
                      {source.value}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.activityCard}>
            <Text style={styles.activityTitle}>Recent Activity</Text>
            {ANALYTICS_DATA.recentActivity.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View
                  style={[
                    styles.activityIconBg,
                    { backgroundColor: `${getActivityColor(activity.type)}15` },
                  ]}
                >
                  <Ionicons
                    name={getActivityIcon(activity.type) as any}
                    size={18}
                    color={getActivityColor(activity.type)}
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityCount}>
                    {activity.count}{" "}
                    {activity.type === "view"
                      ? "views"
                      : activity.type === "save"
                      ? "saves"
                      : activity.type === "inquiry"
                      ? "inquiries"
                      : "messages"}
                  </Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={Colors.textSecondary}
                />
              </View>
            ))}
          </View>

          {/* Export Button */}
          <TouchableOpacity
            style={styles.exportButton}
            onPress={handleExportReport}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.primaryGreen, "#2E7D32"]}
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
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    ...Typography.headlineMedium,
    color: Colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },

  // Period Selector
  periodSelector: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
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
  periodButtonActive: {
    backgroundColor: Colors.primaryGreen,
  },
  periodButtonText: {
    ...Typography.labelMedium,
    color: Colors.textSecondary,
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
    backgroundColor: Colors.surface,
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
    color: Colors.textPrimary,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statTrend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: Spacing.xs,
    backgroundColor: `${Colors.primaryGreen}10`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statTrendText: {
    ...Typography.caption,
    color: Colors.primaryGreen,
    fontWeight: "600",
  },

  // Additional Stats
  additionalStats: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
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
    color: Colors.textPrimary,
    marginTop: 4,
  },
  additionalStatLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  additionalStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E5E5",
    alignSelf: "center",
  },

  // Chart Card
  chartCard: {
    backgroundColor: Colors.surface,
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
    color: Colors.textPrimary,
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
    backgroundColor: Colors.primaryGreen,
  },
  legendText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  chartContainer: {
    alignItems: "center",
    overflow: "hidden",
  },
  axisText: {
    fontSize: 10,
    color: Colors.textSecondary,
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
    color: Colors.textPrimary,
  },
  pieCenterLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
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
    color: Colors.textPrimary,
    flex: 1,
  },
  pieChartLegendValue: {
    ...Typography.labelMedium,
    color: Colors.textSecondary,
  },

  // Activity Card
  activityCard: {
    backgroundColor: Colors.surface,
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
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
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
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  activityTime: {
    ...Typography.caption,
    color: Colors.textSecondary,
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
