import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
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
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Typography, Spacing } from "@/constants/design";
import { useTheme } from "@/contexts/ThemeContext";
import { FloatingHeader } from "@/components/FloatingHeader";

interface Report {
  id: string;
  type: "user" | "property" | "bug";
  title: string;
  description: string;
  reporter: {
    name: string;
    phone: string;
    avatar?: string;
  };
  reportedItem?: {
    name: string;
    id: string;
  };
  reason: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  createdAt: string;
  priority: "low" | "medium" | "high";
}

const MOCK_REPORTS: Report[] = [
  {
    id: "r1",
    type: "user",
    title: "Fake Profile",
    description: "User is using fake photos and information",
    reporter: {
      name: "Kofi Mensah",
      phone: "+233 24 123 4567",
      avatar: "https://i.pravatar.cc/150?img=11",
    },
    reportedItem: {
      name: "Ama Serwaa",
      id: "u2",
    },
    reason: "Fake identity",
    status: "pending",
    createdAt: "2 hours ago",
    priority: "high",
  },
  {
    id: "r2",
    type: "property",
    title: "Misleading Listing",
    description: "Property photos don't match the actual property",
    reporter: {
      name: "Kwame Asante",
      phone: "+233 24 345 6789",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
    reportedItem: {
      name: "4 Bedroom House in East Legon",
      id: "p1",
    },
    reason: "Misleading information",
    status: "pending",
    createdAt: "5 hours ago",
    priority: "medium",
  },
  {
    id: "r3",
    type: "bug",
    title: "App Crashes on Property View",
    description: "App crashes when viewing property with 360° tour",
    reporter: {
      name: "Akua Boateng",
      phone: "+233 27 456 7890",
      avatar: "https://i.pravatar.cc/150?img=9",
    },
    reason: "Technical issue",
    status: "pending",
    createdAt: "1 day ago",
    priority: "high",
  },
  {
    id: "r4",
    type: "user",
    title: "Spam Messages",
    description: "User is sending spam messages to multiple users",
    reporter: {
      name: "Yaw Mensah",
      phone: "+233 55 567 8901",
      avatar: "https://i.pravatar.cc/150?img=12",
    },
    reportedItem: {
      name: "Esi Darkwa",
      id: "u6",
    },
    reason: "Spam/Harassment",
    status: "reviewed",
    createdAt: "2 days ago",
    priority: "medium",
  },
];

type ReportFilter = "all" | "pending" | "user" | "property" | "bug";

export default function ReportsSupportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ReportFilter>("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const detailSheetRef = useRef<BottomSheetModal>(null);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const filteredReports = MOCK_REPORTS.filter((report) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "pending") return report.status === "pending";
    return report.type === activeFilter;
  });

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    detailSheetRef.current?.present();
  };

  const handleAction = (action: "dismiss" | "warn" | "suspend" | "contact") => {
    Alert.alert("Confirm Action", `Are you sure you want to ${action}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        style: "destructive",
        onPress: () => {
          Alert.alert("Success", `Action ${action} completed`);
          detailSheetRef.current?.dismiss();
        },
      },
    ]);
  };

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

  const getStatusStyle = (status: Report["status"]) => {
    switch (status) {
      case "pending":
        return {
          bg: isDark ? "#78350F" : "#FEF3C7",
          text: "#F59E0B",
        };
      case "reviewed":
        return {
          bg: `${colors.primary}15`,
          text: colors.primary,
        };
      case "resolved":
        return {
          bg: `${colors.primary}15`,
          text: colors.primary,
        };
      case "dismissed":
        return {
          bg: isDark ? "#7F1D1D" : "#FEE2E2",
          text: "#EF4444",
        };
    }
  };

  const getPriorityStyle = (priority: Report["priority"]) => {
    switch (priority) {
      case "high":
        return {
          bg: isDark ? "#7F1D1D" : "#FEE2E2",
          text: "#EF4444",
        };
      case "medium":
        return {
          bg: isDark ? "#78350F" : "#FEF3C7",
          text: "#F59E0B",
        };
      case "low":
        return {
          bg: `${colors.primary}15`,
          text: colors.primary,
        };
    }
  };

  const getTypeIcon = (type: Report["type"]) => {
    switch (type) {
      case "user":
        return "person";
      case "property":
        return "home";
      case "bug":
        return "bug";
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
          title="User Reports"
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
          {/* Filter Tabs */}
          <View style={styles.filterTabs}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterTabsContainer}>
                {[
                  { id: "all" as ReportFilter, label: "All" },
                  { id: "pending" as ReportFilter, label: "Pending" },
                  { id: "user" as ReportFilter, label: "Users" },
                  { id: "property" as ReportFilter, label: "Properties" },
                  { id: "bug" as ReportFilter, label: "Bugs" },
                ].map((filter) => (
                  <TouchableOpacity
                    key={filter.id}
                    style={[
                      styles.filterTab,
                      activeFilter === filter.id && {
                        backgroundColor: colors.primary,
                      },
                    ]}
                    onPress={() => setActiveFilter(filter.id)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.filterTabText,
                        {
                          color:
                            activeFilter === filter.id
                              ? "#FFFFFF"
                              : colors.textSecondary,
                        },
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Reports List */}
          {filteredReports.length === 0 ? (
            <View style={styles.emptyState}>
              <View
                style={[
                  styles.emptyIconContainer,
                  { backgroundColor: `${colors.textSecondary}15` },
                ]}
              >
                <Ionicons
                  name="document-text-outline"
                  size={48}
                  color={colors.textSecondary}
                />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No Reports Found
              </Text>
              <Text
                style={[styles.emptyMessage, { color: colors.textSecondary }]}
              >
                There are no reports matching your filter
              </Text>
            </View>
          ) : (
            filteredReports.map((report) => {
              const statusStyle = getStatusStyle(report.status);
              const priorityStyle = getPriorityStyle(report.priority);
              return (
                <TouchableOpacity
                  key={report.id}
                  style={[
                    styles.reportCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.divider,
                    },
                  ]}
                  onPress={() => handleViewReport(report)}
                  activeOpacity={0.7}
                >
                  <View style={styles.reportHeader}>
                    <View style={styles.reportHeaderLeft}>
                      <View
                        style={[
                          styles.reportTypeIcon,
                          { backgroundColor: `${colors.primary}15` },
                        ]}
                      >
                        <Ionicons
                          name={getTypeIcon(report.type) as any}
                          size={20}
                          color={colors.primary}
                        />
                      </View>
                      <View style={styles.reportTitleContainer}>
                        <Text
                          style={[styles.reportTitle, { color: colors.text }]}
                        >
                          {report.title}
                        </Text>
                        <Text
                          style={[
                            styles.reportTime,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {report.createdAt}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.badgesRow}>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: statusStyle.bg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            { color: statusStyle.text },
                          ]}
                        >
                          {report.status}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.priorityBadge,
                          { backgroundColor: priorityStyle.bg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.priorityBadgeText,
                            { color: priorityStyle.text },
                          ]}
                        >
                          {report.priority}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.reportDescription,
                      { color: colors.textSecondary },
                    ]}
                    numberOfLines={2}
                  >
                    {report.description}
                  </Text>
                  <View style={styles.reportFooter}>
                    <View style={styles.reporterInfo}>
                      <Ionicons
                        name="person-outline"
                        size={14}
                        color={colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.reporterText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Reported by {report.reporter.name}
                      </Text>
                    </View>
                    {report.reportedItem && (
                      <View style={styles.reportedItemInfo}>
                        <Ionicons
                          name="arrow-forward-outline"
                          size={14}
                          color={colors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.reportedItemText,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {report.reportedItem.name}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </View>

      {/* Report Detail Bottom Sheet */}
      <BottomSheetModal
        ref={detailSheetRef}
        index={0}
        snapPoints={["85%"]}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: colors.divider }}
        backgroundStyle={{ backgroundColor: colors.surface }}
      >
        <BottomSheetScrollView
          style={[styles.sheetContent, { backgroundColor: colors.surface }]}
        >
          {selectedReport && (
            <>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>
                Report Details
              </Text>
              <View style={styles.detailSection}>
                <Text
                  style={[styles.detailLabel, { color: colors.textSecondary }]}
                >
                  Type
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {selectedReport.type.charAt(0).toUpperCase() +
                    selectedReport.type.slice(1)}
                </Text>
              </View>
              <View style={styles.detailSection}>
                <Text
                  style={[styles.detailLabel, { color: colors.textSecondary }]}
                >
                  Title
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {selectedReport.title}
                </Text>
              </View>
              <View style={styles.detailSection}>
                <Text
                  style={[styles.detailLabel, { color: colors.textSecondary }]}
                >
                  Description
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {selectedReport.description}
                </Text>
              </View>
              <View style={styles.detailSection}>
                <Text
                  style={[styles.detailLabel, { color: colors.textSecondary }]}
                >
                  Reporter
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {selectedReport.reporter.name} (
                  {selectedReport.reporter.phone})
                </Text>
              </View>
              {selectedReport.reportedItem && (
                <View style={styles.detailSection}>
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Reported Item
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {selectedReport.reportedItem.name}
                  </Text>
                </View>
              )}
              <View style={styles.detailSection}>
                <Text
                  style={[styles.detailLabel, { color: colors.textSecondary }]}
                >
                  Reason
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {selectedReport.reason}
                </Text>
              </View>
              <View style={styles.detailSection}>
                <Text
                  style={[styles.detailLabel, { color: colors.textSecondary }]}
                >
                  Status
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: getStatusStyle(selectedReport.status).bg,
                      alignSelf: "flex-start",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      { color: getStatusStyle(selectedReport.status).text },
                    ]}
                  >
                    {selectedReport.status}
                  </Text>
                </View>
              </View>
              <View style={styles.detailSection}>
                <Text
                  style={[styles.detailLabel, { color: colors.textSecondary }]}
                >
                  Priority
                </Text>
                <View
                  style={[
                    styles.priorityBadge,
                    {
                      backgroundColor: getPriorityStyle(selectedReport.priority)
                        .bg,
                      alignSelf: "flex-start",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.priorityBadgeText,
                      { color: getPriorityStyle(selectedReport.priority).text },
                    ]}
                  >
                    {selectedReport.priority}
                  </Text>
                </View>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.divider,
                    },
                  ]}
                  onPress={() => handleAction("dismiss")}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.actionButtonText, { color: colors.text }]}
                  >
                    Dismiss
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: isDark ? "#78350F" : "#FEF3C7",
                      borderColor: "#F59E0B",
                    },
                  ]}
                  onPress={() => handleAction("warn")}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.actionButtonText, { color: "#F59E0B" }]}>
                    Warn
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: isDark ? "#7F1D1D" : "#FEE2E2",
                      borderColor: "#EF4444",
                    },
                  ]}
                  onPress={() => handleAction("suspend")}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.actionButtonText, { color: "#EF4444" }]}>
                    Suspend
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={() => handleAction("contact")}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.actionButtonText, { color: "#FFFFFF" }]}>
                    Contact
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
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
  filterTabs: {
    marginBottom: Spacing.lg,
  },
  filterTabsContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  filterTab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterTabText: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
  },
  reportCard: {
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
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
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  reportHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: Spacing.sm,
  },
  reportTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  reportTitleContainer: {
    flex: 1,
  },
  reportTitle: {
    ...Typography.bodyMedium,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  reportTime: {
    ...Typography.caption,
    fontSize: 11,
  },
  badgesRow: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  priorityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  reportDescription: {
    ...Typography.bodyMedium,
    fontSize: 13,
    marginBottom: Spacing.sm,
  },
  reportFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  reporterInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reporterText: {
    ...Typography.caption,
    fontSize: 11,
  },
  reportedItemInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reportedItemText: {
    ...Typography.caption,
    fontSize: 11,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
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
  sheetContent: {
    flex: 1,
    padding: Spacing.xl,
  },
  sheetTitle: {
    ...Typography.headlineMedium,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: Spacing.lg,
  },
  detailSection: {
    marginBottom: Spacing.md,
  },
  detailLabel: {
    ...Typography.bodyMedium,
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    ...Typography.bodyMedium,
    fontSize: 15,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  actionButton: {
    flex: 1,
    minWidth: "45%",
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  actionButtonText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
  },
});
