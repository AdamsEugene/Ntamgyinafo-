import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { Typography, Spacing } from "@/constants/design";
import { useTheme } from "@/contexts/ThemeContext";
import {
  FloatingHeader,
  HeaderActionButton,
} from "@/components/FloatingHeader";

type LogLevel = "info" | "warning" | "error" | "success";
type LogCategory = "all" | "auth" | "system" | "api" | "database" | "security";

interface SystemLog {
  id: string;
  timestamp: Date;
  level: LogLevel;
  category: string;
  message: string;
  user?: string;
  ip?: string;
  details?: string;
}

const MOCK_LOGS: SystemLog[] = [
  {
    id: "1",
    timestamp: new Date(Date.now() - 5 * 60000),
    level: "error",
    category: "api",
    message: "Failed to process payment transaction",
    user: "user@example.com",
    ip: "192.168.1.100",
    details: "Payment gateway timeout after 30s",
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 15 * 60000),
    level: "warning",
    category: "security",
    message: "Multiple failed login attempts detected",
    user: "admin@example.com",
    ip: "192.168.1.105",
    details: "5 failed attempts in 5 minutes",
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 30 * 60000),
    level: "success",
    category: "auth",
    message: "User successfully logged in",
    user: "john@example.com",
    ip: "192.168.1.110",
  },
  {
    id: "4",
    timestamp: new Date(Date.now() - 45 * 60000),
    level: "info",
    category: "system",
    message: "Database backup completed",
    details: "Backup size: 2.5GB",
  },
  {
    id: "5",
    timestamp: new Date(Date.now() - 60 * 60000),
    level: "error",
    category: "database",
    message: "Connection pool exhausted",
    details: "Max connections: 100, Current: 100",
  },
  {
    id: "6",
    timestamp: new Date(Date.now() - 90 * 60000),
    level: "info",
    category: "api",
    message: "API rate limit reached",
    user: "api-client-123",
    ip: "192.168.1.120",
    details: "Rate limit: 1000 requests/hour",
  },
  {
    id: "7",
    timestamp: new Date(Date.now() - 120 * 60000),
    level: "success",
    category: "system",
    message: "Scheduled task completed",
    details: "Daily report generation",
  },
  {
    id: "8",
    timestamp: new Date(Date.now() - 150 * 60000),
    level: "warning",
    category: "security",
    message: "Suspicious activity detected",
    user: "user@example.com",
    ip: "192.168.1.130",
    details: "Unusual access pattern",
  },
];

export default function SystemLogsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<LogCategory>("all");
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | "all">("all");
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const detailSheetRef = useRef<BottomSheetModal>(null);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

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

  const handleLogPress = (log: SystemLog) => {
    setSelectedLog(log);
    detailSheetRef.current?.present();
  };

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case "error":
        return "#EF4444";
      case "warning":
        return "#F59E0B";
      case "success":
        return "#10B981";
      case "info":
        return "#3B82F6";
      default:
        return colors.textSecondary;
    }
  };

  const getLevelIcon = (level: LogLevel) => {
    switch (level) {
      case "error":
        return "close-circle";
      case "warning":
        return "warning";
      case "success":
        return "checkmark-circle";
      case "info":
        return "information-circle";
      default:
        return "ellipse";
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const filteredLogs = MOCK_LOGS.filter((log) => {
    if (selectedCategory !== "all" && log.category !== selectedCategory) {
      return false;
    }
    if (selectedLevel !== "all" && log.level !== selectedLevel) {
      return false;
    }
    return true;
  });

  const categories: { id: LogCategory; label: string; count: number }[] = [
    { id: "all", label: "All", count: MOCK_LOGS.length },
    {
      id: "auth",
      label: "Auth",
      count: MOCK_LOGS.filter((l) => l.category === "auth").length,
    },
    {
      id: "system",
      label: "System",
      count: MOCK_LOGS.filter((l) => l.category === "system").length,
    },
    {
      id: "api",
      label: "API",
      count: MOCK_LOGS.filter((l) => l.category === "api").length,
    },
    {
      id: "database",
      label: "Database",
      count: MOCK_LOGS.filter((l) => l.category === "database").length,
    },
    {
      id: "security",
      label: "Security",
      count: MOCK_LOGS.filter((l) => l.category === "security").length,
    },
  ];

  const levels: { id: LogLevel | "all"; label: string; icon: string }[] = [
    { id: "all", label: "All", icon: "list" },
    { id: "error", label: "Error", icon: "close-circle" },
    { id: "warning", label: "Warning", icon: "warning" },
    { id: "success", label: "Success", icon: "checkmark-circle" },
    { id: "info", label: "Info", icon: "information-circle" },
  ];

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

        {/* Floating Header */}
        <FloatingHeader
          title="System Logs"
          leftContent={
            <HeaderActionButton
              icon="arrow-back"
              onPress={() => router.back()}
            />
          }
          rightContent={
            <HeaderActionButton
              icon="download-outline"
              onPress={() => {
                // Export logs functionality
              }}
            />
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
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Filter Tabs */}
          <View style={styles.filterSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterTabs}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.filterTab,
                    {
                      backgroundColor:
                        selectedCategory === category.id
                          ? colors.primary
                          : colors.surface,
                      borderColor:
                        selectedCategory === category.id
                          ? colors.primary
                          : colors.divider,
                    },
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      {
                        color:
                          selectedCategory === category.id
                            ? "#FFFFFF"
                            : colors.text,
                      },
                    ]}
                  >
                    {category.label}
                  </Text>
                  {category.count > 0 && (
                    <View
                      style={[
                        styles.filterBadge,
                        {
                          backgroundColor:
                            selectedCategory === category.id
                              ? "#FFFFFF"
                              : colors.primary,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterBadgeText,
                          {
                            color:
                              selectedCategory === category.id
                                ? colors.primary
                                : "#FFFFFF",
                          },
                        ]}
                      >
                        {category.count}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Level Filter */}
          <View style={styles.levelFilter}>
            {levels.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.levelButton,
                  {
                    backgroundColor:
                      selectedLevel === level.id
                        ? `${getLevelColor(level.id as LogLevel)}15`
                        : colors.surface,
                    borderColor:
                      selectedLevel === level.id
                        ? getLevelColor(level.id as LogLevel)
                        : colors.divider,
                  },
                ]}
                onPress={() => setSelectedLevel(level.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={level.icon as any}
                  size={18}
                  color={
                    selectedLevel === level.id
                      ? getLevelColor(level.id as LogLevel)
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.levelButtonText,
                    {
                      color:
                        selectedLevel === level.id
                          ? getLevelColor(level.id as LogLevel)
                          : colors.textSecondary,
                    },
                  ]}
                >
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Logs List */}
          <View style={styles.logsContainer}>
            {filteredLogs.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="document-text-outline"
                  size={64}
                  color={colors.textSecondary}
                />
                <Text
                  style={[styles.emptyText, { color: colors.textSecondary }]}
                >
                  No logs found
                </Text>
                <Text
                  style={[styles.emptySubtext, { color: colors.textSecondary }]}
                >
                  Try adjusting your filters
                </Text>
              </View>
            ) : (
              filteredLogs.map((log) => (
                <TouchableOpacity
                  key={log.id}
                  style={[
                    styles.logCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.divider,
                      borderLeftColor: getLevelColor(log.level),
                      borderLeftWidth: 4,
                    },
                  ]}
                  onPress={() => handleLogPress(log)}
                  activeOpacity={0.7}
                >
                  <View style={styles.logHeader}>
                    <View style={styles.logLevel}>
                      <Ionicons
                        name={getLevelIcon(log.level) as any}
                        size={20}
                        color={getLevelColor(log.level)}
                      />
                      <Text
                        style={[
                          styles.logLevelText,
                          { color: getLevelColor(log.level) },
                        ]}
                      >
                        {log.level.toUpperCase()}
                      </Text>
                    </View>
                    <Text
                      style={[styles.logTime, { color: colors.textSecondary }]}
                    >
                      {formatTimestamp(log.timestamp)}
                    </Text>
                  </View>
                  <Text style={[styles.logMessage, { color: colors.text }]}>
                    {log.message}
                  </Text>
                  <View style={styles.logMeta}>
                    <View style={styles.logMetaItem}>
                      <Ionicons
                        name="pricetag-outline"
                        size={14}
                        color={colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.logMetaText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {log.category}
                      </Text>
                    </View>
                    {log.user && (
                      <View style={styles.logMetaItem}>
                        <Ionicons
                          name="person-outline"
                          size={14}
                          color={colors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.logMetaText,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {log.user}
                        </Text>
                      </View>
                    )}
                    {log.ip && (
                      <View style={styles.logMetaItem}>
                        <Ionicons
                          name="globe-outline"
                          size={14}
                          color={colors.textSecondary}
                        />
                        <Text
                          style={[
                            styles.logMetaText,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {log.ip}
                        </Text>
                      </View>
                    )}
                  </View>
                  {log.details && (
                    <Text
                      style={[
                        styles.logDetails,
                        { color: colors.textSecondary },
                      ]}
                      numberOfLines={1}
                    >
                      {log.details}
                    </Text>
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>

        {/* Log Detail Bottom Sheet */}
        <BottomSheetModal
          ref={detailSheetRef}
          index={0}
          snapPoints={["70%"]}
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={{ backgroundColor: colors.divider }}
          backgroundStyle={{ backgroundColor: colors.surface }}
        >
          <BottomSheetScrollView
            style={[styles.sheetContent, { backgroundColor: colors.surface }]}
            contentContainerStyle={styles.sheetContentContainer}
          >
            {selectedLog && (
              <>
                <View style={styles.sheetHeader}>
                  <View style={styles.sheetLogLevel}>
                    <Ionicons
                      name={getLevelIcon(selectedLog.level) as any}
                      size={24}
                      color={getLevelColor(selectedLog.level)}
                    />
                    <Text
                      style={[
                        styles.sheetLogLevelText,
                        { color: getLevelColor(selectedLog.level) },
                      ]}
                    >
                      {selectedLog.level.toUpperCase()}
                    </Text>
                  </View>
                  <Text
                    style={[styles.sheetTime, { color: colors.textSecondary }]}
                  >
                    {selectedLog.timestamp.toLocaleString()}
                  </Text>
                </View>

                <Text style={[styles.sheetMessage, { color: colors.text }]}>
                  {selectedLog.message}
                </Text>

                <View style={styles.sheetSection}>
                  <Text
                    style={[styles.sheetSectionTitle, { color: colors.text }]}
                  >
                    Category
                  </Text>
                  <Text
                    style={[
                      styles.sheetSectionValue,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {selectedLog.category}
                  </Text>
                </View>

                {selectedLog.user && (
                  <View style={styles.sheetSection}>
                    <Text
                      style={[styles.sheetSectionTitle, { color: colors.text }]}
                    >
                      User
                    </Text>
                    <Text
                      style={[
                        styles.sheetSectionValue,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {selectedLog.user}
                    </Text>
                  </View>
                )}

                {selectedLog.ip && (
                  <View style={styles.sheetSection}>
                    <Text
                      style={[styles.sheetSectionTitle, { color: colors.text }]}
                    >
                      IP Address
                    </Text>
                    <Text
                      style={[
                        styles.sheetSectionValue,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {selectedLog.ip}
                    </Text>
                  </View>
                )}

                {selectedLog.details && (
                  <View style={styles.sheetSection}>
                    <Text
                      style={[styles.sheetSectionTitle, { color: colors.text }]}
                    >
                      Details
                    </Text>
                    <Text
                      style={[
                        styles.sheetSectionValue,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {selectedLog.details}
                    </Text>
                  </View>
                )}
              </>
            )}
          </BottomSheetScrollView>
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
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  filterSection: {
    marginBottom: Spacing.md,
  },
  filterTabs: {
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterTabText: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
  },
  filterBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 20,
    alignItems: "center",
  },
  filterBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "700",
  },
  levelFilter: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    flexWrap: "wrap",
  },
  levelButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
  },
  levelButtonText: {
    ...Typography.labelMedium,
    fontSize: 12,
    fontWeight: "600",
  },
  logsContainer: {
    gap: Spacing.md,
  },
  logCard: {
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
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  logLevel: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  logLevelText: {
    ...Typography.labelMedium,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  logTime: {
    ...Typography.caption,
    fontSize: 11,
  },
  logMessage: {
    ...Typography.bodyMedium,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: Spacing.sm,
  },
  logMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.xs,
  },
  logMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  logMetaText: {
    ...Typography.caption,
    fontSize: 11,
  },
  logDetails: {
    ...Typography.caption,
    fontSize: 11,
    fontStyle: "italic",
    marginTop: Spacing.xs,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["3xl"],
  },
  emptyText: {
    ...Typography.titleMedium,
    fontSize: 18,
    fontWeight: "600",
    marginTop: Spacing.md,
  },
  emptySubtext: {
    ...Typography.bodyMedium,
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  sheetContent: {
    flex: 1,
  },
  sheetContentContainer: {
    padding: Spacing.xl,
  },
  sheetHeader: {
    marginBottom: Spacing.lg,
  },
  sheetLogLevel: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  sheetLogLevelText: {
    ...Typography.titleLarge,
    fontSize: 20,
    fontWeight: "700",
  },
  sheetTime: {
    ...Typography.bodyMedium,
    fontSize: 12,
  },
  sheetMessage: {
    ...Typography.bodyLarge,
    fontSize: 16,
    fontWeight: "500",
    marginBottom: Spacing.lg,
  },
  sheetSection: {
    marginBottom: Spacing.lg,
  },
  sheetSectionTitle: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: Spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sheetSectionValue: {
    ...Typography.bodyMedium,
    fontSize: 14,
  },
});
