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

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const changePasswordSheetRef = useRef<BottomSheetModal>(null);

  // Manage Devices State
  const devicesSheetRef = useRef<BottomSheetModal>(null);
  const [devices] = useState([
    {
      id: "1",
      device: "iPhone 14 Pro",
      location: "Accra, Ghana",
      ip: "192.168.1.100",
      lastActive: "Active now",
      isCurrent: true,
    },
    {
      id: "2",
      device: "MacBook Pro",
      location: "Accra, Ghana",
      ip: "192.168.1.101",
      lastActive: "2 hours ago",
      isCurrent: false,
    },
    {
      id: "3",
      device: "Samsung Galaxy S23",
      location: "Kumasi, Ghana",
      ip: "192.168.1.102",
      lastActive: "5 days ago",
      isCurrent: false,
    },
  ]);

  // Login Activity State
  const activitySheetRef = useRef<BottomSheetModal>(null);
  const [loginActivity] = useState([
    {
      id: "1",
      device: "iPhone 14 Pro",
      location: "Accra, Ghana",
      ip: "192.168.1.100",
      timestamp: "Today, 9:30 AM",
      status: "success",
    },
    {
      id: "2",
      device: "MacBook Pro",
      location: "Accra, Ghana",
      ip: "192.168.1.101",
      timestamp: "Yesterday, 2:15 PM",
      status: "success",
    },
    {
      id: "3",
      device: "Samsung Galaxy S23",
      location: "Kumasi, Ghana",
      ip: "192.168.1.102",
      timestamp: "Dec 20, 10:45 AM",
      status: "success",
    },
    {
      id: "4",
      device: "Unknown Device",
      location: "Unknown",
      ip: "192.168.1.200",
      timestamp: "Dec 18, 3:20 PM",
      status: "failed",
    },
  ]);

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

  const handleChangePassword = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    changePasswordSheetRef.current?.present();
  };

  const handleChangePasswordSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return;
    }

    setIsChangingPassword(true);
    // Simulate API call
    setTimeout(() => {
      setIsChangingPassword(false);
      changePasswordSheetRef.current?.dismiss();
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert("Success", "Password changed successfully");
    }, 1500);
  };

  const handleManageDevices = () => {
    devicesSheetRef.current?.present();
  };

  const handleViewActivity = () => {
    activitySheetRef.current?.present();
  };

  const handleExportData = () => {
    Alert.alert(
      "Export Data",
      "Your account data will be prepared and sent to your email. This may take a few minutes.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Export",
          onPress: () => {
            Alert.alert(
              "Success",
              "Data export initiated. You will receive an email shortly."
            );
          },
        },
      ]
    );
  };

  const handleRevokeDevice = (deviceId: string) => {
    Alert.alert(
      "Revoke Device",
      "Are you sure you want to revoke access for this device?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Revoke",
          style: "destructive",
          onPress: () => {
            Alert.alert("Success", "Device access revoked successfully");
          },
        },
      ]
    );
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

        {/* Change Password Bottom Sheet */}
        <BottomSheetModal
          ref={changePasswordSheetRef}
          index={0}
          snapPoints={["75%"]}
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={{ backgroundColor: colors.divider }}
          backgroundStyle={{ backgroundColor: colors.surface }}
        >
          <BottomSheetScrollView
            style={[styles.sheetContent, { backgroundColor: colors.surface }]}
            contentContainerStyle={styles.sheetContentContainer}
          >
            <Text style={[styles.sheetTitle, { color: colors.text }]}>
              Change Password
            </Text>
            <Text
              style={[styles.sheetSubtitle, { color: colors.textSecondary }]}
            >
              Enter your current password and choose a new one
            </Text>

            {/* Current Password */}
            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: colors.text }]}>
                Current Password *
              </Text>
              <View style={styles.passwordInputContainer}>
                <BottomSheetTextInput
                  style={[
                    styles.passwordInput,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.divider,
                      color: colors.text,
                    },
                  ]}
                  placeholder="Enter current password"
                  placeholderTextColor={colors.textSecondary}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrentPassword}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  <Ionicons
                    name={
                      showCurrentPassword ? "eye-off-outline" : "eye-outline"
                    }
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password */}
            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: colors.text }]}>
                New Password *
              </Text>
              <View style={styles.passwordInputContainer}>
                <BottomSheetTextInput
                  style={[
                    styles.passwordInput,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.divider,
                      color: colors.text,
                    },
                  ]}
                  placeholder="Enter new password"
                  placeholderTextColor={colors.textSecondary}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <Ionicons
                    name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              <Text
                style={[styles.passwordHint, { color: colors.textSecondary }]}
              >
                Must be at least 8 characters long
              </Text>
            </View>

            {/* Confirm Password */}
            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: colors.text }]}>
                Confirm New Password *
              </Text>
              <View style={styles.passwordInputContainer}>
                <BottomSheetTextInput
                  style={[
                    styles.passwordInput,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.divider,
                      color: colors.text,
                    },
                  ]}
                  placeholder="Confirm new password"
                  placeholderTextColor={colors.textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-off-outline" : "eye-outline"
                    }
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {confirmPassword && newPassword !== confirmPassword && (
                <Text style={styles.passwordError}>Passwords do not match</Text>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.sheetActions}>
              <TouchableOpacity
                style={[
                  styles.sheetCancelButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.divider,
                  },
                ]}
                onPress={() => changePasswordSheetRef.current?.dismiss()}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.sheetCancelButtonText, { color: colors.text }]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sheetSubmitButton,
                  {
                    backgroundColor: colors.primary,
                    opacity:
                      !currentPassword ||
                      !newPassword ||
                      !confirmPassword ||
                      newPassword !== confirmPassword ||
                      isChangingPassword
                        ? 0.5
                        : 1,
                  },
                ]}
                onPress={handleChangePasswordSubmit}
                disabled={
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword ||
                  newPassword !== confirmPassword ||
                  isChangingPassword
                }
                activeOpacity={0.8}
              >
                {isChangingPassword ? (
                  <Text style={styles.sheetSubmitButtonText}>Changing...</Text>
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#FFFFFF"
                    />
                    <Text style={styles.sheetSubmitButtonText}>
                      Change Password
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </BottomSheetScrollView>
        </BottomSheetModal>

        {/* Manage Devices Bottom Sheet */}
        <BottomSheetModal
          ref={devicesSheetRef}
          index={0}
          snapPoints={["80%"]}
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={{ backgroundColor: colors.divider }}
          backgroundStyle={{ backgroundColor: colors.surface }}
        >
          <BottomSheetScrollView
            style={[styles.sheetContent, { backgroundColor: colors.surface }]}
            contentContainerStyle={styles.sheetContentContainer}
          >
            <Text style={[styles.sheetTitle, { color: colors.text }]}>
              Manage Devices
            </Text>
            <Text
              style={[styles.sheetSubtitle, { color: colors.textSecondary }]}
            >
              View and manage devices with access to your account
            </Text>

            {devices.map((device, index) => (
              <View
                key={device.id}
                style={[
                  styles.deviceCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.divider,
                    marginBottom: index < devices.length - 1 ? Spacing.md : 0,
                  },
                ]}
              >
                <View style={styles.deviceHeader}>
                  <View style={styles.deviceInfo}>
                    <Ionicons
                      name="phone-portrait-outline"
                      size={24}
                      color={colors.primary}
                    />
                    <View style={styles.deviceDetails}>
                      <View style={styles.deviceTitleRow}>
                        <Text
                          style={[styles.deviceName, { color: colors.text }]}
                        >
                          {device.device}
                        </Text>
                        {device.isCurrent && (
                          <View
                            style={[
                              styles.currentBadge,
                              { backgroundColor: `${colors.primary}15` },
                            ]}
                          >
                            <Text
                              style={[
                                styles.currentBadgeText,
                                { color: colors.primary },
                              ]}
                            >
                              Current
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.deviceLocation,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {device.location}
                      </Text>
                      <Text
                        style={[
                          styles.deviceIp,
                          { color: colors.textSecondary },
                        ]}
                      >
                        IP: {device.ip}
                      </Text>
                      <Text
                        style={[
                          styles.deviceLastActive,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Last active: {device.lastActive}
                      </Text>
                    </View>
                  </View>
                </View>
                {!device.isCurrent && (
                  <TouchableOpacity
                    style={[
                      styles.revokeButton,
                      {
                        backgroundColor: isDark ? "#7F1D1D" : "#FEE2E2",
                        borderColor: "#EF4444",
                      },
                    ]}
                    onPress={() => handleRevokeDevice(device.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle" size={18} color="#EF4444" />
                    <Text style={styles.revokeButtonText}>Revoke Access</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </BottomSheetScrollView>
        </BottomSheetModal>

        {/* Login Activity Bottom Sheet */}
        <BottomSheetModal
          ref={activitySheetRef}
          index={0}
          snapPoints={["80%"]}
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={{ backgroundColor: colors.divider }}
          backgroundStyle={{ backgroundColor: colors.surface }}
        >
          <BottomSheetScrollView
            style={[styles.sheetContent, { backgroundColor: colors.surface }]}
            contentContainerStyle={styles.sheetContentContainer}
          >
            <Text style={[styles.sheetTitle, { color: colors.text }]}>
              Login Activity
            </Text>
            <Text
              style={[styles.sheetSubtitle, { color: colors.textSecondary }]}
            >
              Recent login attempts and activity
            </Text>

            {loginActivity.map((activity, index) => (
              <View
                key={activity.id}
                style={[
                  styles.activityCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.divider,
                    borderLeftColor:
                      activity.status === "success" ? "#10B981" : "#EF4444",
                    borderLeftWidth: 4,
                    marginBottom:
                      index < loginActivity.length - 1 ? Spacing.md : 0,
                  },
                ]}
              >
                <View style={styles.activityHeader}>
                  <View
                    style={[
                      styles.activityIcon,
                      {
                        backgroundColor:
                          activity.status === "success"
                            ? "#10B98115"
                            : "#EF444415",
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        activity.status === "success"
                          ? "checkmark-circle"
                          : "close-circle"
                      }
                      size={20}
                      color={
                        activity.status === "success" ? "#10B981" : "#EF4444"
                      }
                    />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text
                      style={[styles.activityDevice, { color: colors.text }]}
                    >
                      {activity.device}
                    </Text>
                    <Text
                      style={[
                        styles.activityLocation,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {activity.location}
                    </Text>
                    <Text
                      style={[
                        styles.activityIp,
                        { color: colors.textSecondary },
                      ]}
                    >
                      IP: {activity.ip}
                    </Text>
                    <Text
                      style={[
                        styles.activityTime,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {activity.timestamp}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
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
  sheetContent: {
    flex: 1,
  },
  sheetContentContainer: {
    padding: Spacing.xl,
  },
  sheetTitle: {
    ...Typography.headlineMedium,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  sheetSubtitle: {
    ...Typography.bodyMedium,
    fontSize: 14,
    marginBottom: Spacing.lg,
  },
  formSection: {
    marginBottom: Spacing.lg,
  },
  formLabel: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  passwordInputContainer: {
    position: "relative",
  },
  passwordInput: {
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    fontSize: 16,
    paddingRight: 50,
  },
  passwordToggle: {
    position: "absolute",
    right: Spacing.md,
    top: Spacing.md,
    padding: 4,
  },
  passwordHint: {
    ...Typography.caption,
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  passwordError: {
    ...Typography.caption,
    fontSize: 12,
    color: "#EF4444",
    marginTop: Spacing.xs,
  },
  sheetActions: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  sheetCancelButton: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  sheetCancelButtonText: {
    ...Typography.labelLarge,
    fontSize: 16,
    fontWeight: "700",
  },
  sheetSubmitButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: 16,
  },
  sheetSubmitButtonText: {
    ...Typography.labelLarge,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  deviceCard: {
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
  deviceHeader: {
    marginBottom: Spacing.sm,
  },
  deviceInfo: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  deviceName: {
    ...Typography.bodyMedium,
    fontSize: 16,
    fontWeight: "600",
  },
  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  currentBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "700",
  },
  deviceLocation: {
    ...Typography.bodyMedium,
    fontSize: 13,
    marginBottom: 2,
  },
  deviceIp: {
    ...Typography.caption,
    fontSize: 12,
    marginBottom: 2,
  },
  deviceLastActive: {
    ...Typography.caption,
    fontSize: 12,
  },
  revokeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
  revokeButtonText: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    color: "#EF4444",
  },
  activityCard: {
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
  activityHeader: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activityInfo: {
    flex: 1,
  },
  activityDevice: {
    ...Typography.bodyMedium,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  activityLocation: {
    ...Typography.bodyMedium,
    fontSize: 13,
    marginBottom: 2,
  },
  activityIp: {
    ...Typography.caption,
    fontSize: 12,
    marginBottom: 2,
  },
  activityTime: {
    ...Typography.caption,
    fontSize: 12,
  },
});
