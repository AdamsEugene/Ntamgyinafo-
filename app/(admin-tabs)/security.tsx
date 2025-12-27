import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
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
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { Typography, Spacing } from "@/constants/design";
import { useTheme } from "@/contexts/ThemeContext";
import {
  FloatingHeader,
  HeaderActionButton,
} from "@/components/FloatingHeader";

export default function SecurityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(true);
  const [ipWhitelist, setIpWhitelist] = useState(false);

  const handleChangePassword = () => {
    Alert.alert("Change Password", "Password change functionality coming soon");
  };

  const handleManageDevices = () => {
    Alert.alert("Manage Devices", "Device management coming soon");
  };

  const handleViewActivity = () => {
    Alert.alert("View Activity", "Activity log coming soon");
  };

  const handleExportData = () => {
    Alert.alert("Export Data", "Data export coming soon");
  };

  const SECURITY_ITEMS = [
    {
      id: "password",
      title: "Change Password",
      description: "Update your account password",
      icon: "lock-closed-outline" as const,
      onPress: handleChangePassword,
      showArrow: true,
    },
    {
      id: "devices",
      title: "Manage Devices",
      description: "View and manage active sessions",
      icon: "phone-portrait-outline" as const,
      onPress: handleManageDevices,
      showArrow: true,
    },
    {
      id: "activity",
      title: "Login Activity",
      description: "View recent login history",
      icon: "time-outline" as const,
      onPress: handleViewActivity,
      showArrow: true,
    },
    {
      id: "export",
      title: "Export Data",
      description: "Download your account data",
      icon: "download-outline" as const,
      onPress: handleExportData,
      showArrow: true,
    },
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
          title="Security"
          leftContent={
            <HeaderActionButton
              icon="arrow-back"
              onPress={() => router.back()}
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
        >
          {/* Security Status Card */}
          <View
            style={[
              styles.statusCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.divider,
              },
            ]}
          >
            <View style={styles.statusHeader}>
              <View
                style={[
                  styles.statusIcon,
                  { backgroundColor: `${colors.primary}15` },
                ]}
              >
                <Ionicons
                  name="shield-checkmark"
                  size={24}
                  color={colors.primary}
                />
              </View>
              <View style={styles.statusContent}>
                <Text style={[styles.statusTitle, { color: colors.text }]}>
                  Account Security
                </Text>
                <Text
                  style={[
                    styles.statusSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  Your account is secure
                </Text>
              </View>
            </View>
          </View>

          {/* Two-Factor Authentication */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Authentication
            </Text>
            <View
              style={[
                styles.settingCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
            >
              <View style={styles.settingContent}>
                <View
                  style={[
                    styles.settingIcon,
                    { backgroundColor: `${colors.primary}15` },
                  ]}
                >
                  <Ionicons
                    name="keypad-outline"
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>
                    Two-Factor Authentication
                  </Text>
                  <Text
                    style={[
                      styles.settingDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Add an extra layer of security to your account
                  </Text>
                </View>
              </View>
              <Switch
                value={twoFactorEnabled}
                onValueChange={setTwoFactorEnabled}
                trackColor={{
                  false: colors.divider,
                  true: colors.primary,
                }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Security Settings */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Security Settings
            </Text>
            <View
              style={[
                styles.settingsCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
            >
              {/* Login Alerts */}
              <View
                style={[
                  styles.settingItem,
                  {
                    borderBottomColor: colors.divider,
                  },
                ]}
              >
                <View style={styles.settingContent}>
                  <Ionicons
                    name="notifications-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingTitle, { color: colors.text }]}>
                      Login Alerts
                    </Text>
                    <Text
                      style={[
                        styles.settingDescription,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Get notified of new login attempts
                    </Text>
                  </View>
                </View>
                <Switch
                  value={loginAlerts}
                  onValueChange={setLoginAlerts}
                  trackColor={{
                    false: colors.divider,
                    true: colors.primary,
                  }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Session Timeout */}
              <View
                style={[
                  styles.settingItem,
                  {
                    borderBottomColor: colors.divider,
                  },
                ]}
              >
                <View style={styles.settingContent}>
                  <Ionicons
                    name="timer-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingTitle, { color: colors.text }]}>
                      Auto Session Timeout
                    </Text>
                    <Text
                      style={[
                        styles.settingDescription,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Automatically log out after inactivity
                    </Text>
                  </View>
                </View>
                <Switch
                  value={sessionTimeout}
                  onValueChange={setSessionTimeout}
                  trackColor={{
                    false: colors.divider,
                    true: colors.primary,
                  }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* IP Whitelist */}
              <View style={styles.settingItem}>
                <View style={styles.settingContent}>
                  <Ionicons
                    name="globe-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingTitle, { color: colors.text }]}>
                      IP Whitelist
                    </Text>
                    <Text
                      style={[
                        styles.settingDescription,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Restrict access to specific IP addresses
                    </Text>
                  </View>
                </View>
                <Switch
                  value={ipWhitelist}
                  onValueChange={setIpWhitelist}
                  trackColor={{
                    false: colors.divider,
                    true: colors.primary,
                  }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </View>

          {/* Security Actions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Security Actions
            </Text>
            <View
              style={[
                styles.actionsCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
            >
              {SECURITY_ITEMS.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.actionItem,
                    index < SECURITY_ITEMS.length - 1 && {
                      borderBottomColor: colors.divider,
                    },
                  ]}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.actionIcon,
                      { backgroundColor: `${colors.primary}15` },
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.actionContent}>
                    <Text style={[styles.actionTitle, { color: colors.text }]}>
                      {item.title}
                    </Text>
                    <Text
                      style={[
                        styles.actionDescription,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {item.description}
                    </Text>
                  </View>
                  {item.showArrow && (
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={colors.textSecondary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Security Tips */}
          <View
            style={[
              styles.tipsCard,
              {
                backgroundColor: isDark ? "#1E3A8A" : "#DBEAFE",
                borderColor: "#3B82F6",
              },
            ]}
          >
            <Ionicons name="information-circle" size={24} color="#3B82F6" />
            <View style={styles.tipsContent}>
              <Text style={styles.tipsTitle}>Security Tips</Text>
              <Text style={styles.tipsText}>
                • Use a strong, unique password{"\n"}• Enable two-factor
                authentication{"\n"}• Review login activity regularly{"\n"}•
                Keep your devices secure
              </Text>
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
  statusCard: {
    borderRadius: 20,
    padding: Spacing.xl,
    borderWidth: 1,
    marginBottom: Spacing.xl,
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
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  statusIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    ...Typography.titleMedium,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  statusSubtitle: {
    ...Typography.bodyMedium,
    fontSize: 14,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: Spacing.md,
    marginLeft: Spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingCard: {
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
  settingContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    ...Typography.bodyMedium,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  settingDescription: {
    ...Typography.caption,
    fontSize: 12,
  },
  settingsCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  actionsCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 1,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    ...Typography.bodyMedium,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  actionDescription: {
    ...Typography.caption,
    fontSize: 12,
  },
  tipsCard: {
    flexDirection: "row",
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "700",
    color: "#3B82F6",
    marginBottom: Spacing.xs,
  },
  tipsText: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: "#3B82F6",
    lineHeight: 20,
  },
});
