import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
  Linking,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Typography, Spacing } from "@/constants/design";
import { FloatingHeader } from "@/components/FloatingHeader";
import { useTheme, ThemeMode } from "@/contexts/ThemeContext";

interface SettingItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  type: "toggle" | "link" | "select" | "info";
  value?: boolean | string;
  onPress?: () => void;
  danger?: boolean;
}

interface SettingSection {
  id: string;
  title: string;
  items: SettingItem[];
}

// Theme mode display labels
const themeModeLabels: Record<ThemeMode, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mode, setMode, colors, isDark } = useTheme();

  // Settings state
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [newListingAlerts, setNewListingAlerts] = useState(true);
  const [priceDropAlerts, setPriceDropAlerts] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);

  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [showLastSeen, setShowLastSeen] = useState(true);
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);

  const [language, setLanguage] = useState("English");
  const [currency, setCurrency] = useState("GHS");

  // Theme selection handler
  const handleThemeSelect = () => {
    Alert.alert("Select Theme", "Choose your preferred appearance", [
      {
        text: "☀️ Light",
        onPress: () => setMode("light"),
      },
      {
        text: "🌙 Dark",
        onPress: () => setMode("dark"),
      },
      {
        text: "📱 System",
        onPress: () => setMode("system"),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          router.replace("/(auth)/welcome");
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // Handle account deletion
            Alert.alert(
              "Account Scheduled for Deletion",
              "Your account will be deleted within 30 days. You can cancel this by logging in again.",
              [{ text: "OK", onPress: () => router.replace("/(auth)/welcome") }]
            );
          },
        },
      ]
    );
  };

  const handleLanguageSelect = () => {
    Alert.alert("Select Language", "Choose your preferred language", [
      { text: "English", onPress: () => setLanguage("English") },
      { text: "Akan (Twi)", onPress: () => setLanguage("Akan (Twi)") },
      { text: "Ewe", onPress: () => setLanguage("Ewe") },
      { text: "Ga", onPress: () => setLanguage("Ga") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleCurrencySelect = () => {
    Alert.alert("Select Currency", "Choose your preferred currency", [
      { text: "GHS (Ghana Cedis)", onPress: () => setCurrency("GHS") },
      { text: "USD (US Dollar)", onPress: () => setCurrency("USD") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const sections: SettingSection[] = [
    {
      id: "account",
      title: "Account",
      items: [
        {
          id: "edit-profile",
          icon: "person-outline",
          label: "Edit Profile",
          type: "link",
          onPress: () => router.push("/edit-profile"),
        },
        {
          id: "change-password",
          icon: "lock-closed-outline",
          label: "Change Password",
          type: "link",
          onPress: () => {
            Alert.alert(
              "Coming Soon",
              "Password change will be available soon."
            );
          },
        },
        {
          id: "phone-verification",
          icon: "call-outline",
          label: "Phone Verification",
          type: "info",
          value: "Verified ✓",
        },
      ],
    },
    {
      id: "notifications",
      title: "Notifications",
      items: [
        {
          id: "push-notifications",
          icon: "notifications-outline",
          label: "Push Notifications",
          type: "toggle",
          value: pushNotifications,
          onPress: () => setPushNotifications(!pushNotifications),
        },
        {
          id: "email-notifications",
          icon: "mail-outline",
          label: "Email Notifications",
          type: "toggle",
          value: emailNotifications,
          onPress: () => setEmailNotifications(!emailNotifications),
        },
        {
          id: "sms-notifications",
          icon: "chatbubble-outline",
          label: "SMS Notifications",
          type: "toggle",
          value: smsNotifications,
          onPress: () => setSmsNotifications(!smsNotifications),
        },
        {
          id: "new-listing-alerts",
          icon: "home-outline",
          label: "New Listing Alerts",
          type: "toggle",
          value: newListingAlerts,
          onPress: () => setNewListingAlerts(!newListingAlerts),
        },
        {
          id: "price-drop-alerts",
          icon: "pricetag-outline",
          label: "Price Drop Alerts",
          type: "toggle",
          value: priceDropAlerts,
          onPress: () => setPriceDropAlerts(!priceDropAlerts),
        },
        {
          id: "message-notifications",
          icon: "chatbubbles-outline",
          label: "Message Notifications",
          type: "toggle",
          value: messageNotifications,
          onPress: () => setMessageNotifications(!messageNotifications),
        },
      ],
    },
    {
      id: "privacy",
      title: "Privacy",
      items: [
        {
          id: "show-online-status",
          icon: "ellipse",
          label: "Show Online Status",
          type: "toggle",
          value: showOnlineStatus,
          onPress: () => setShowOnlineStatus(!showOnlineStatus),
        },
        {
          id: "show-last-seen",
          icon: "time-outline",
          label: "Show Last Seen",
          type: "toggle",
          value: showLastSeen,
          onPress: () => setShowLastSeen(!showLastSeen),
        },
        {
          id: "show-phone-number",
          icon: "call-outline",
          label: "Show Phone to Buyers",
          type: "toggle",
          value: showPhoneNumber,
          onPress: () => setShowPhoneNumber(!showPhoneNumber),
        },
        {
          id: "blocked-users",
          icon: "ban-outline",
          label: "Blocked Users",
          type: "link",
          onPress: () => {
            Alert.alert("Blocked Users", "You haven't blocked any users.");
          },
        },
      ],
    },
    {
      id: "app-settings",
      title: "App Settings",
      items: [
        {
          id: "theme",
          icon: isDark ? "moon" : "sunny-outline",
          label: "Appearance",
          type: "select",
          value: themeModeLabels[mode],
          onPress: handleThemeSelect,
        },
        {
          id: "language",
          icon: "language-outline",
          label: "Language",
          type: "select",
          value: language,
          onPress: handleLanguageSelect,
        },
        {
          id: "currency",
          icon: "cash-outline",
          label: "Currency",
          type: "select",
          value: currency,
          onPress: handleCurrencySelect,
        },
        {
          id: "clear-cache",
          icon: "trash-outline",
          label: "Clear Cache",
          type: "link",
          onPress: () => {
            Alert.alert(
              "Cache Cleared",
              "App cache has been cleared successfully."
            );
          },
        },
      ],
    },
    {
      id: "about",
      title: "About",
      items: [
        {
          id: "app-version",
          icon: "information-circle-outline",
          label: "App Version",
          type: "info",
          value: "1.0.0",
        },
        {
          id: "terms",
          icon: "document-text-outline",
          label: "Terms of Service",
          type: "link",
          onPress: () => {
            Linking.openURL("https://ntamgyinafo.com/terms");
          },
        },
        {
          id: "privacy-policy",
          icon: "shield-outline",
          label: "Privacy Policy",
          type: "link",
          onPress: () => {
            Linking.openURL("https://ntamgyinafo.com/privacy");
          },
        },
        {
          id: "help",
          icon: "help-circle-outline",
          label: "Help & Support",
          type: "link",
          onPress: () => {
            Linking.openURL("mailto:support@ntamgyinafo.com");
          },
        },
        {
          id: "rate-app",
          icon: "star-outline",
          label: "Rate the App",
          type: "link",
          onPress: () => {
            Alert.alert(
              "Rate Ntamgyinafoɔ",
              "Would you like to rate us on the App Store?",
              [
                { text: "Not Now", style: "cancel" },
                { text: "Rate", onPress: () => {} },
              ]
            );
          },
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem, isLast: boolean) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.settingItem,
          { borderBottomColor: colors.divider },
          isLast && styles.settingItemLast,
        ]}
        onPress={item.onPress}
        activeOpacity={item.type === "toggle" ? 1 : 0.7}
        disabled={item.type === "info"}
      >
        <View style={styles.settingItemLeft}>
          <View
            style={[
              styles.settingIconContainer,
              { backgroundColor: colors.inputBackground },
              item.danger && styles.settingIconContainerDanger,
            ]}
          >
            <Ionicons
              name={item.icon}
              size={20}
              color={item.danger ? colors.error : colors.text}
            />
          </View>
          <Text
            style={[
              styles.settingLabel,
              { color: colors.text },
              item.danger && { color: colors.error },
            ]}
          >
            {item.label}
          </Text>
        </View>

        <View style={styles.settingItemRight}>
          {item.type === "toggle" && (
            <Switch
              value={item.value as boolean}
              onValueChange={item.onPress}
              trackColor={{
                false: colors.divider,
                true: `${colors.primary}50`,
              }}
              thumbColor={item.value ? colors.primary : "#FFFFFF"}
              ios_backgroundColor={colors.divider}
            />
          )}
          {item.type === "select" && (
            <>
              <Text
                style={[styles.settingValue, { color: colors.textSecondary }]}
              >
                {item.value}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textSecondary}
              />
            </>
          )}
          {item.type === "link" && (
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textSecondary}
            />
          )}
          {item.type === "info" && (
            <Text style={[styles.settingValueInfo, { color: colors.primary }]}>
              {item.value}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <StatusBar style={colors.statusBar} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Decorative Background Elements */}
        <View style={styles.decorativeBackground}>
          <View
            style={[styles.circle1, { backgroundColor: `${colors.primary}15` }]}
          />
          <View
            style={[styles.circle2, { backgroundColor: `${colors.accent}10` }]}
          />
        </View>

        {/* Floating Header with Blur */}
        <FloatingHeader
          title="Settings"
          showBackButton
          onBackPress={() => router.back()}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: 80 + insets.top,
              paddingBottom: 40 + insets.bottom,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Settings Sections */}
          {sections.map((section) => (
            <View key={section.id} style={styles.section}>
              <Text
                style={[styles.sectionTitle, { color: colors.textSecondary }]}
              >
                {section.title}
              </Text>
              <View
                style={[
                  styles.sectionContent,
                  { backgroundColor: colors.surface },
                ]}
              >
                {section.items.map((item, index) =>
                  renderSettingItem(item, index === section.items.length - 1)
                )}
              </View>
            </View>
          ))}

          {/* Danger Zone */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, styles.sectionTitleDanger]}>
              Danger Zone
            </Text>
            <View
              style={[
                styles.sectionContent,
                { backgroundColor: colors.surface },
              ]}
            >
              <TouchableOpacity
                style={styles.settingItem}
                onPress={handleDeleteAccount}
                activeOpacity={0.7}
              >
                <View style={styles.settingItemLeft}>
                  <View style={styles.settingIconContainerDanger}>
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={colors.error}
                    />
                  </View>
                  <Text
                    style={[styles.settingLabelDanger, { color: colors.error }]}
                  >
                    Delete Account
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.error}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colors.error }]}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>

          {/* App Info */}
          <View style={styles.appInfo}>
            <Text style={[styles.appName, { color: colors.primary }]}>
              Ntamgyinafoɔ
            </Text>
            <Text style={[styles.appTagline, { color: colors.textSecondary }]}>
              Find. Visit. Own.
            </Text>
            <Text style={[styles.appCopyright, { color: colors.textTertiary }]}>
              © 2024 Ntamgyinafoɔ. All rights reserved.
            </Text>
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
  content: {
    paddingHorizontal: Spacing.lg,
  },
  // Section
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.labelMedium,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  sectionTitleDanger: {
    color: "#EF4444",
  },
  sectionContent: {
    borderRadius: 16,
    overflow: "hidden",
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
  // Setting Item
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  settingIconContainerDanger: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  settingLabel: {
    ...Typography.bodyMedium,
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  settingLabelDanger: {
    color: "#EF4444",
  },
  settingItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  settingValue: {
    ...Typography.bodyMedium,
    fontSize: 14,
  },
  settingValueInfo: {
    ...Typography.bodyMedium,
    fontSize: 14,
    fontWeight: "500",
  },
  // Logout Button
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: 16,
    marginBottom: Spacing.xl,
    ...Platform.select({
      ios: {
        shadowColor: "#EF4444",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  logoutButtonText: {
    ...Typography.labelLarge,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  // App Info
  appInfo: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  appName: {
    ...Typography.headlineMedium,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  appTagline: {
    ...Typography.bodyMedium,
    fontSize: 13,
    marginBottom: Spacing.sm,
  },
  appCopyright: {
    ...Typography.caption,
    fontSize: 11,
  },
});
