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
import { Colors, Typography, Spacing } from "@/constants/design";
import {
  FloatingHeaderStyles,
  HEADER_ICON_SIZE,
} from "@/components/FloatingHeader.styles";

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
    { value: 28, label: "Jan", frontColor: Colors.primaryGreen },
    { value: 45, label: "Feb", frontColor: Colors.primaryGreen },
    { value: 38, label: "Mar", frontColor: Colors.primaryGreen },
    { value: 52, label: "Apr", frontColor: Colors.primaryGreen },
    { value: 48, label: "May", frontColor: Colors.primaryGreen },
    { value: 65, label: "Jun", frontColor: Colors.primaryGreen },
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
    { value: 42, color: Colors.primaryGreen, text: "42%" },
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
            <TouchableOpacity
              onPress={() => router.back()}
              style={FloatingHeaderStyles.actionButton}
              activeOpacity={0.7}
            >
              <View style={FloatingHeaderStyles.actionButtonBackground}>
                <Ionicons
                  name="arrow-back"
                  size={HEADER_ICON_SIZE}
                  color={Colors.textPrimary}
                />
              </View>
            </TouchableOpacity>
            <Text style={styles.headerTitleText}>Analytics</Text>
          </View>

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
        </View>

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
              tintColor={Colors.primaryGreen}
              progressViewOffset={90 + insets.top}
            />
          }
        >
          {/* Overview Stats */}
          <View style={styles.overviewGrid}>
            <View style={styles.overviewCard}>
              <View
                style={[
                  styles.overviewIcon,
                  { backgroundColor: `${Colors.primaryGreen}15` },
                ]}
              >
                <Ionicons name="eye" size={20} color={Colors.primaryGreen} />
              </View>
              <Text style={styles.overviewValue}>
                {formatNumber(ANALYTICS_DATA.overview.totalViews)}
              </Text>
              <Text style={styles.overviewLabel}>Total Views</Text>
            </View>

            <View style={styles.overviewCard}>
              <View
                style={[styles.overviewIcon, { backgroundColor: "#3B82F615" }]}
              >
                <Ionicons
                  name="chatbubble-ellipses"
                  size={20}
                  color="#3B82F6"
                />
              </View>
              <Text style={styles.overviewValue}>
                {ANALYTICS_DATA.overview.totalInquiries}
              </Text>
              <Text style={styles.overviewLabel}>Inquiries</Text>
            </View>

            <View style={styles.overviewCard}>
              <View
                style={[styles.overviewIcon, { backgroundColor: "#F59E0B15" }]}
              >
                <Ionicons name="home" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.overviewValue}>
                {ANALYTICS_DATA.overview.activeListings}/
                {ANALYTICS_DATA.overview.totalListings}
              </Text>
              <Text style={styles.overviewLabel}>Active</Text>
            </View>

            <View style={styles.overviewCard}>
              <View
                style={[styles.overviewIcon, { backgroundColor: "#10B98115" }]}
              >
                <Ionicons name="trending-up" size={20} color="#10B981" />
              </View>
              <Text style={styles.overviewValue}>
                {ANALYTICS_DATA.overview.conversionRate}%
              </Text>
              <Text style={styles.overviewLabel}>Conversion</Text>
            </View>
          </View>

          {/* Views Trend Chart */}
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Views Trend</Text>
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
                color={Colors.primaryGreen}
                thickness={3}
                startFillColor={`${Colors.primaryGreen}30`}
                endFillColor={`${Colors.primaryGreen}05`}
                startOpacity={0.9}
                endOpacity={0.1}
                initialSpacing={20}
                noOfSections={4}
                yAxisColor="transparent"
                xAxisColor={Colors.divider}
                yAxisTextStyle={{
                  color: Colors.textSecondary,
                  fontSize: 10,
                }}
                hideDataPoints={false}
                dataPointsColor={Colors.primaryGreen}
                dataPointsRadius={4}
                curved
                areaChart
              />
            </View>
          </View>

          {/* Inquiries by Month */}
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Inquiries by Month</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.viewAllText}>View Details</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.chartContainer}>
              <BarChart
                data={ANALYTICS_DATA.inquiriesByMonth}
                width={CHART_WIDTH}
                height={160}
                barWidth={32}
                spacing={24}
                initialSpacing={15}
                endSpacing={15}
                noOfSections={4}
                yAxisColor="transparent"
                xAxisColor={Colors.divider}
                yAxisTextStyle={{
                  color: Colors.textSecondary,
                  fontSize: 10,
                }}
                xAxisLabelTextStyle={{
                  color: Colors.textSecondary,
                  fontSize: 11,
                }}
                barBorderRadius={6}
                frontColor={Colors.primaryGreen}
                isAnimated
              />
            </View>
          </View>

          {/* Top Performing Listings */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Performing Listings</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push("/(owner-tabs)/my-listings")}
              >
                <Text style={styles.viewAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {ANALYTICS_DATA.topListings.map((listing, index) => (
              <TouchableOpacity
                key={listing.id}
                style={[
                  styles.listingItem,
                  index === ANALYTICS_DATA.topListings.length - 1 &&
                    styles.listingItemLast,
                ]}
                activeOpacity={0.7}
                onPress={() => router.push(`/owner-listing/${listing.id}`)}
              >
                <View style={styles.listingRank}>
                  <Text style={styles.listingRankText}>#{index + 1}</Text>
                </View>
                <View style={styles.listingInfo}>
                  <Text style={styles.listingTitle} numberOfLines={1}>
                    {listing.title}
                  </Text>
                  <View style={styles.listingStats}>
                    <View style={styles.listingStat}>
                      <Ionicons
                        name="eye-outline"
                        size={14}
                        color={Colors.textSecondary}
                      />
                      <Text style={styles.listingStatText}>
                        {formatNumber(listing.views)}
                      </Text>
                    </View>
                    <View style={styles.listingStat}>
                      <Ionicons
                        name="chatbubble-outline"
                        size={14}
                        color={Colors.textSecondary}
                      />
                      <Text style={styles.listingStatText}>
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
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Traffic Sources</Text>
            <View style={styles.trafficContainer}>
              <View style={styles.pieChartContainer}>
                <PieChart
                  data={ANALYTICS_DATA.trafficSources}
                  donut
                  radius={70}
                  innerRadius={45}
                  centerLabelComponent={() => (
                    <View style={styles.pieCenter}>
                      <Text style={styles.pieCenterValue}>
                        {formatNumber(ANALYTICS_DATA.overview.totalViews)}
                      </Text>
                      <Text style={styles.pieCenterLabel}>Total</Text>
                    </View>
                  )}
                />
              </View>
              <View style={styles.trafficLegend}>
                {ANALYTICS_DATA.trafficSources.map((source, index) => (
                  <View key={index} style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: source.color },
                      ]}
                    />
                    <Text style={styles.legendLabel}>
                      {TRAFFIC_LABELS[index]}
                    </Text>
                    <Text style={styles.legendValue}>{source.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Recent Performance */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Recent Performance</Text>
            <View style={styles.performanceGrid}>
              {ANALYTICS_DATA.recentPerformance.map((item, index) => (
                <View key={index} style={styles.performanceItem}>
                  <Text style={styles.performanceLabel}>{item.label}</Text>
                  <View style={styles.performanceStats}>
                    <View style={styles.performanceStat}>
                      <Ionicons
                        name="eye"
                        size={14}
                        color={Colors.primaryGreen}
                      />
                      <Text style={styles.performanceValue}>
                        {formatNumber(item.views)}
                      </Text>
                    </View>
                    <View style={styles.performanceStat}>
                      <Ionicons name="chatbubble" size={14} color="#3B82F6" />
                      <Text style={styles.performanceValue}>
                        {item.inquiries}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Response Time Card */}
          <View style={styles.responseCard}>
            <View style={styles.responseIcon}>
              <Ionicons name="time" size={28} color={Colors.primaryGreen} />
            </View>
            <View style={styles.responseInfo}>
              <Text style={styles.responseLabel}>Average Response Time</Text>
              <Text style={styles.responseValue}>
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
    backgroundColor: Colors.background,
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
  },
  headerTitleText: {
    ...Typography.titleLarge,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: Colors.primaryGreen,
  },
  periodButtonText: {
    ...Typography.labelMedium,
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
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
    backgroundColor: Colors.surface,
    borderRadius: 16,
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
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  overviewLabel: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  // Chart Card
  chartCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
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
    color: Colors.textPrimary,
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
    color: Colors.primaryGreen,
  },
  // Section Card
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
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
    color: Colors.textPrimary,
  },
  // Listing Items
  listingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
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
    backgroundColor: `${Colors.primaryGreen}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  listingRankText: {
    ...Typography.labelMedium,
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primaryGreen,
  },
  listingInfo: {
    flex: 1,
  },
  listingTitle: {
    ...Typography.bodyMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
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
    color: Colors.textSecondary,
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
    color: Colors.textPrimary,
  },
  pieCenterLabel: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
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
    color: Colors.textPrimary,
    flex: 1,
  },
  legendValue: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
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
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: Spacing.md,
  },
  performanceLabel: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
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
    color: Colors.textPrimary,
  },
  // Response Card
  responseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    gap: Spacing.md,
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
  responseIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: `${Colors.primaryGreen}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  responseInfo: {
    flex: 1,
  },
  responseLabel: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  responseValue: {
    ...Typography.titleMedium,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
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
