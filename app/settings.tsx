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
import { Colors, Typography, Spacing } from "@/constants/design";
import {
  FloatingHeaderStyles,
  HEADER_ICON_SIZE,
} from "@/components/FloatingHeader.styles";

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

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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

  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("English");
  const [currency, setCurrency] = useState("GHS");

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
            Alert.alert("Coming Soon", "Password change will be available soon.");
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
          id: "dark-mode",
          icon: "moon-outline",
          label: "Dark Mode",
          type: "toggle",
          value: darkMode,
          onPress: () => setDarkMode(!darkMode),
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
            Alert.alert("Cache Cleared", "App cache has been cleared successfully.");
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
        style={[styles.settingItem, isLast && styles.settingItemLast]}
        onPress={item.onPress}
        activeOpacity={item.type === "toggle" ? 1 : 0.7}
        disabled={item.type === "info"}
      >
        <View style={styles.settingItemLeft}>
          <View
            style={[
              styles.settingIconContainer,
              item.danger && styles.settingIconContainerDanger,
            ]}
          >
            <Ionicons
              name={item.icon}
              size={20}
              color={item.danger ? "#EF4444" : Colors.textPrimary}
            />
          </View>
          <Text
            style={[styles.settingLabel, item.danger && styles.settingLabelDanger]}
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
                false: Colors.divider,
                true: `${Colors.primaryGreen}50`,
              }}
              thumbColor={item.value ? Colors.primaryGreen : "#FFFFFF"}
              ios_backgroundColor={Colors.divider}
            />
          )}
          {item.type === "select" && (
            <>
              <Text style={styles.settingValue}>{item.value}</Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={Colors.textSecondary}
              />
            </>
          )}
          {item.type === "link" && (
            <Ionicons
              name="chevron-forward"
              size={18}
              color={Colors.textSecondary}
            />
          )}
          {item.type === "info" && (
            <Text style={styles.settingValueInfo}>{item.value}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
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
            <Text style={styles.headerTitleText}>Settings</Text>
          </View>
        </View>

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
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionContent}>
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
            <View style={styles.sectionContent}>
              <TouchableOpacity
                style={styles.settingItem}
                onPress={handleDeleteAccount}
                activeOpacity={0.7}
              >
                <View style={styles.settingItemLeft}>
                  <View style={styles.settingIconContainerDanger}>
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </View>
                  <Text style={styles.settingLabelDanger}>Delete Account</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#EF4444"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>

          {/* App Info */}
          <View style={styles.appInfo}>
            <Text style={styles.appName}>Ntamgyinafoɔ</Text>
            <Text style={styles.appTagline}>Find. Visit. Own.</Text>
            <Text style={styles.appCopyright}>
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
    flex: 1,
  },
  headerTitleText: {
    ...Typography.titleLarge,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
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
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  sectionTitleDanger: {
    color: "#EF4444",
  },
  sectionContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
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
  // Setting Item
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
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
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  settingIconContainerDanger: {
    backgroundColor: "#FEE2E2",
  },
  settingLabel: {
    ...Typography.bodyMedium,
    fontSize: 15,
    fontWeight: "500",
    color: Colors.textPrimary,
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
    color: Colors.textSecondary,
  },
  settingValueInfo: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.primaryGreen,
    fontWeight: "500",
  },
  // Logout Button
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: "#EF4444",
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
    color: Colors.primaryGreen,
    marginBottom: 4,
  },
  appTagline: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  appCopyright: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
  },
});

