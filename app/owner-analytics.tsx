import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LineChart, BarChart, PieChart } from "react-native-gifted-charts";
import { Typography, Spacing } from "@/constants/design";
import { useTheme } from "@/contexts/ThemeContext";
import { FloatingHeader } from "@/components/FloatingHeader";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CHART_WIDTH = SCREEN_WIDTH - Spacing.xl * 2 - 32;

// Time period options
const TIME_PERIODS = [
  { id: "7d", label: "7D" },
  { id: "30d", label: "30D" },
  { id: "90d", label: "90D" },
  { id: "1y", label: "1Y" },
];

// Mock analytics data
const ANALYTICS_DATA = {
  overview: {
    totalViews: 12450,
    totalInquiries: 342,
    totalListings: 8,
    activeListings: 5,
    conversionRate: 2.7,
    avgResponseTime: "2.5h",
  },
  viewsTrend: [
    { value: 850, dataPointText: "850" },
    { value: 1200, dataPointText: "1200" },
    { value: 980, dataPointText: "980" },
    { value: 1450, dataPointText: "1450" },
    { value: 1320, dataPointText: "1320" },
    { value: 1680, dataPointText: "1680" },
    { value: 1890, dataPointText: "1890" },
  ],
  inquiriesByMonth: [
    { value: 28, label: "Jan", frontColor: "#4CAF50" },
    { value: 45, label: "Feb", frontColor: "#4CAF50" },
    { value: 38, label: "Mar", frontColor: "#4CAF50" },
    { value: 52, label: "Apr", frontColor: "#4CAF50" },
    { value: 48, label: "May", frontColor: "#4CAF50" },
    { value: 65, label: "Jun", frontColor: "#4CAF50" },
  ],
  topListings: [
    {
      id: "1",
      title: "Modern 3BR Apartment",
      views: 2450,
      inquiries: 45,
      trend: "+12%",
    },
    {
      id: "2",
      title: "Luxury Villa with Pool",
      views: 1890,
      inquiries: 38,
      trend: "+8%",
    },
    {
      id: "3",
      title: "Cozy Studio in Cantonments",
      views: 1560,
      inquiries: 32,
      trend: "+5%",
    },
  ],
  trafficSources: [
    { value: 42, color: "#4CAF50", text: "42%" },
    { value: 28, color: "#3B82F6", text: "28%" },
    { value: 18, color: "#F59E0B", text: "18%" },
    { value: 12, color: "#8B5CF6", text: "12%" },
  ],
  recentPerformance: [
    { label: "Today", views: 145, inquiries: 8 },
    { label: "Yesterday", views: 132, inquiries: 6 },
    { label: "This Week", views: 890, inquiries: 42 },
    { label: "This Month", views: 3250, inquiries: 156 },
  ],
};

const TRAFFIC_LABELS = ["Search", "Direct", "Shared", "Social"];

export default function OwnerAnalyticsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  // Update chart data with theme colors
  const inquiriesByMonthData = ANALYTICS_DATA.inquiriesByMonth.map((item) => ({
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
          title="Analytics"
          showBackButton
          onBackPress={() => router.back()}
          rightContent={
            <View
              style={[
                styles.periodSelector,
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
                    ]}
                  >
                    {period.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          }
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: 90 + insets.top,
              paddingBottom: 100 + insets.bottom,
            },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              progressViewOffset={90 + insets.top}
            />
          }
        >
          {/* Overview Stats */}
          <View style={styles.overviewGrid}>
            <View
              style={[
                styles.overviewCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
            >
              <View
                style={[
                  styles.overviewIcon,
                  { backgroundColor: `${colors.primary}15` },
                ]}
              >
                <Ionicons name="eye" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.overviewValue, { color: colors.text }]}>
                {formatNumber(ANALYTICS_DATA.overview.totalViews)}
              </Text>
              <Text
                style={[styles.overviewLabel, { color: colors.textSecondary }]}
              >
                Total Views
              </Text>
            </View>

            <View
              style={[
                styles.overviewCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
            >
              <View
                style={[styles.overviewIcon, { backgroundColor: "#3B82F615" }]}
              >
                <Ionicons
                  name="chatbubble-ellipses"
                  size={20}
                  color="#3B82F6"
                />
              </View>
              <Text style={[styles.overviewValue, { color: colors.text }]}>
                {ANALYTICS_DATA.overview.totalInquiries}
              </Text>
              <Text
                style={[styles.overviewLabel, { color: colors.textSecondary }]}
              >
                Inquiries
              </Text>
            </View>

            <View
              style={[
                styles.overviewCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
            >
              <View
                style={[styles.overviewIcon, { backgroundColor: "#F59E0B15" }]}
              >
                <Ionicons name="home" size={20} color="#F59E0B" />
              </View>
              <Text style={[styles.overviewValue, { color: colors.text }]}>
                {ANALYTICS_DATA.overview.activeListings}/
                {ANALYTICS_DATA.overview.totalListings}
              </Text>
              <Text
                style={[styles.overviewLabel, { color: colors.textSecondary }]}
              >
                Active
              </Text>
            </View>

            <View
              style={[
                styles.overviewCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
            >
              <View
                style={[styles.overviewIcon, { backgroundColor: "#10B98115" }]}
              >
                <Ionicons name="trending-up" size={20} color="#10B981" />
              </View>
              <Text style={[styles.overviewValue, { color: colors.text }]}>
                {ANALYTICS_DATA.overview.conversionRate}%
              </Text>
              <Text
                style={[styles.overviewLabel, { color: colors.textSecondary }]}
              >
                Conversion
              </Text>
            </View>
          </View>

          {/* Views Trend Chart */}
          <View
            style={[
              styles.chartCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.divider,
              },
            ]}
          >
            <View style={styles.chartHeader}>
              <Text style={[styles.chartTitle, { color: colors.text }]}>
                Views Trend
              </Text>
              <View style={styles.trendBadge}>
                <Ionicons name="arrow-up" size={14} color="#10B981" />
                <Text style={styles.trendBadgeText}>+18.5%</Text>
              </View>
            </View>
            <View style={styles.chartContainer}>
              <LineChart
                data={ANALYTICS_DATA.viewsTrend}
                width={CHART_WIDTH}
                height={180}
                spacing={CHART_WIDTH / 7}
                color={colors.primary}
                thickness={3}
                startFillColor={`${colors.primary}30`}
                endFillColor={`${colors.primary}05`}
                startOpacity={0.9}
                endOpacity={0.1}
                initialSpacing={20}
                noOfSections={4}
                yAxisColor="transparent"
                xAxisColor={colors.divider}
                yAxisTextStyle={{
                  color: colors.textSecondary,
                  fontSize: 10,
                }}
                hideDataPoints={false}
                dataPointsColor={colors.primary}
                dataPointsRadius={4}
                curved
                areaChart
              />
            </View>
          </View>

          {/* Inquiries by Month */}
          <View
            style={[
              styles.chartCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.divider,
              },
            ]}
          >
            <View style={styles.chartHeader}>
              <Text style={[styles.chartTitle, { color: colors.text }]}>
                Inquiries by Month
              </Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={[styles.viewAllText, { color: colors.primary }]}>
                  View Details
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.chartContainer}>
              <BarChart
                data={inquiriesByMonthData}
                width={CHART_WIDTH}
                height={160}
                barWidth={32}
                spacing={24}
                initialSpacing={15}
                endSpacing={15}
                noOfSections={4}
                yAxisColor="transparent"
                xAxisColor={colors.divider}
                yAxisTextStyle={{
                  color: colors.textSecondary,
                  fontSize: 10,
                }}
                xAxisLabelTextStyle={{
                  color: colors.textSecondary,
                  fontSize: 11,
                }}
                barBorderRadius={6}
                frontColor={colors.primary}
                isAnimated
              />
            </View>
          </View>

          {/* Top Performing Listings */}
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.divider,
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Top Performing Listings
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push("/(owner-tabs)/my-listings")}
              >
                <Text style={[styles.viewAllText, { color: colors.primary }]}>
                  See All
                </Text>
              </TouchableOpacity>
            </View>

            {ANALYTICS_DATA.topListings.map((listing, index) => (
              <TouchableOpacity
                key={listing.id}
                style={[
                  styles.listingItem,
                  {
                    borderBottomColor: colors.divider,
                  },
                  index === ANALYTICS_DATA.topListings.length - 1 &&
                    styles.listingItemLast,
                ]}
                activeOpacity={0.7}
                onPress={() => router.push(`/owner-listing/${listing.id}`)}
              >
                <View
                  style={[
                    styles.listingRank,
                    { backgroundColor: `${colors.primary}15` },
                  ]}
                >
                  <Text
                    style={[styles.listingRankText, { color: colors.primary }]}
                  >
                    #{index + 1}
                  </Text>
                </View>
                <View style={styles.listingInfo}>
                  <Text
                    style={[styles.listingTitle, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {listing.title}
                  </Text>
                  <View style={styles.listingStats}>
                    <View style={styles.listingStat}>
                      <Ionicons
                        name="eye-outline"
                        size={14}
                        color={colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.listingStatText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {formatNumber(listing.views)}
                      </Text>
                    </View>
                    <View style={styles.listingStat}>
                      <Ionicons
                        name="chatbubble-outline"
                        size={14}
                        color={colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.listingStatText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {listing.inquiries}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.listingTrend}>
                  <Ionicons name="trending-up" size={16} color="#10B981" />
                  <Text style={styles.listingTrendText}>{listing.trend}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Traffic Sources */}
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
              Traffic Sources
            </Text>
            <View style={styles.trafficContainer}>
              <View style={styles.pieChartContainer}>
                <PieChart
                  data={trafficSourcesData}
                  donut
                  radius={70}
                  innerRadius={45}
                  centerLabelComponent={() => (
                    <View style={styles.pieCenter}>
                      <Text
                        style={[styles.pieCenterValue, { color: colors.text }]}
                      >
                        {formatNumber(ANALYTICS_DATA.overview.totalViews)}
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
              </View>
              <View style={styles.trafficLegend}>
                {trafficSourcesData.map((source, index) => (
                  <View key={index} style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: source.color },
                      ]}
                    />
                    <Text style={[styles.legendLabel, { color: colors.text }]}>
                      {TRAFFIC_LABELS[index]}
                    </Text>
                    <Text
                      style={[
                        styles.legendValue,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {source.text}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Recent Performance */}
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.divider,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recent Performance
            </Text>
            <View style={styles.performanceGrid}>
              {ANALYTICS_DATA.recentPerformance.map((item, index) => (
                <View
                  key={index}
                  style={[
                    styles.performanceItem,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <Text
                    style={[
                      styles.performanceLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {item.label}
                  </Text>
                  <View style={styles.performanceStats}>
                    <View style={styles.performanceStat}>
                      <Ionicons name="eye" size={14} color={colors.primary} />
                      <Text
                        style={[
                          styles.performanceValue,
                          { color: colors.text },
                        ]}
                      >
                        {formatNumber(item.views)}
                      </Text>
                    </View>
                    <View style={styles.performanceStat}>
                      <Ionicons name="chatbubble" size={14} color="#3B82F6" />
                      <Text
                        style={[
                          styles.performanceValue,
                          { color: colors.text },
                        ]}
                      >
                        {item.inquiries}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Response Time Card */}
          <View
            style={[
              styles.responseCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.divider,
              },
            ]}
          >
            <View
              style={[
                styles.responseIcon,
                { backgroundColor: `${colors.primary}15` },
              ]}
            >
              <Ionicons name="time" size={28} color={colors.primary} />
            </View>
            <View style={styles.responseInfo}>
              <Text
                style={[styles.responseLabel, { color: colors.textSecondary }]}
              >
                Average Response Time
              </Text>
              <Text style={[styles.responseValue, { color: colors.text }]}>
                {ANALYTICS_DATA.overview.avgResponseTime}
              </Text>
            </View>
            <View style={styles.responseBadge}>
              <Text style={styles.responseBadgeText}>Excellent</Text>
            </View>
          </View>
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
  },
  headerTitleText: {
    ...Typography.titleLarge,
    fontSize: 20,
    fontWeight: "700",
  },
  periodSelector: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  periodButtonActive: {},
  periodButtonText: {
    ...Typography.labelMedium,
    fontSize: 12,
    fontWeight: "600",
  },
  periodButtonTextActive: {
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  // Overview Grid
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  overviewCard: {
    width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.md) / 2 - 1,
    borderRadius: 16,
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
  overviewIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  overviewValue: {
    ...Typography.headlineMedium,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 2,
  },
  overviewLabel: {
    ...Typography.caption,
    fontSize: 12,
  },
  // Chart Card
  chartCard: {
    borderRadius: 20,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
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
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  chartTitle: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: "600",
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#10B98115",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trendBadgeText: {
    ...Typography.labelMedium,
    fontSize: 12,
    fontWeight: "600",
    color: "#10B981",
  },
  chartContainer: {
    alignItems: "center",
  },
  viewAllText: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
  },
  // Section Card
  sectionCard: {
    borderRadius: 20,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: "600",
  },
  // Listing Items
  listingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  listingItemLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  listingRank: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  listingRankText: {
    ...Typography.labelMedium,
    fontSize: 12,
    fontWeight: "700",
  },
  listingInfo: {
    flex: 1,
  },
  listingTitle: {
    ...Typography.bodyMedium,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  listingStats: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  listingStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  listingStatText: {
    ...Typography.caption,
    fontSize: 12,
  },
  listingTrend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#10B98115",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  listingTrendText: {
    ...Typography.labelMedium,
    fontSize: 12,
    fontWeight: "600",
    color: "#10B981",
  },
  // Traffic Sources
  trafficContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.md,
    gap: Spacing.xl,
  },
  pieChartContainer: {
    alignItems: "center",
  },
  pieCenter: {
    alignItems: "center",
  },
  pieCenterValue: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: "700",
  },
  pieCenterLabel: {
    ...Typography.caption,
    fontSize: 11,
  },
  trafficLegend: {
    flex: 1,
    gap: Spacing.sm,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    ...Typography.bodyMedium,
    fontSize: 13,
    flex: 1,
  },
  legendValue: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
  },
  // Performance Grid
  performanceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  performanceItem: {
    width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.lg * 2 - Spacing.md) / 2,
    borderRadius: 12,
    padding: Spacing.md,
  },
  performanceLabel: {
    ...Typography.caption,
    fontSize: 12,
    marginBottom: Spacing.xs,
  },
  performanceStats: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  performanceStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  performanceValue: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
  },
  // Response Card
  responseCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: Spacing.lg,
    gap: Spacing.md,
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
  responseIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  responseInfo: {
    flex: 1,
  },
  responseLabel: {
    ...Typography.caption,
    fontSize: 12,
    marginBottom: 2,
  },
  responseValue: {
    ...Typography.titleMedium,
    fontSize: 20,
    fontWeight: "700",
  },
  responseBadge: {
    backgroundColor: "#10B98115",
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 10,
  },
  responseBadgeText: {
    ...Typography.labelMedium,
    fontSize: 12,
    fontWeight: "600",
    color: "#10B981",
  },
});
