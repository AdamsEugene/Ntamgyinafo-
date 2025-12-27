import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  RefreshControl,
  Platform,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Typography, Spacing } from "@/constants/design";
import { useTheme } from "@/contexts/ThemeContext";
import { FloatingHeader } from "@/components/FloatingHeader";

interface SettingSection {
  id: string;
  title: string;
  items: SettingItem[];
}

interface SettingItem {
  id: string;
  label: string;
  description?: string;
  type: "toggle" | "text" | "action";
  value?: boolean | string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

const SETTINGS_SECTIONS: SettingSection[] = [
  {
    id: "general",
    title: "General Settings",
    items: [
      {
        id: "app-name",
        label: "App Name",
        description: "Ntamgyinafoɔ",
        type: "text",
        value: "Ntamgyinafoɔ",
        icon: "business",
      },
      {
        id: "support-email",
        label: "Support Email",
        description: "support@ntamgyinafo.com",
        type: "text",
        value: "support@ntamgyinafo.com",
        icon: "mail",
      },
      {
        id: "support-phone",
        label: "Support Phone",
        description: "+233 XX XXX XXXX",
        type: "text",
        value: "+233 XX XXX XXXX",
        icon: "call",
      },
    ],
  },
  {
    id: "payment",
    title: "Payment Settings",
    items: [
      {
        id: "paystack-enabled",
        label: "Paystack Integration",
        description: "Enable Paystack payment gateway",
        type: "toggle",
        value: true,
        icon: "card",
      },
      {
        id: "momo-enabled",
        label: "Mobile Money",
        description: "Enable Mobile Money payments",
        type: "toggle",
        value: true,
        icon: "phone-portrait",
      },
      {
        id: "bank-transfer",
        label: "Bank Transfer",
        description: "Enable bank transfer payments",
        type: "toggle",
        value: false,
        icon: "cash",
      },
    ],
  },
  {
    id: "notifications",
    title: "Notification Settings",
    items: [
      {
        id: "email-notifications",
        label: "Email Notifications",
        description: "Send email notifications to users",
        type: "toggle",
        value: true,
        icon: "mail",
      },
      {
        id: "sms-notifications",
        label: "SMS Notifications",
        description: "Send SMS notifications to users",
        type: "toggle",
        value: true,
        icon: "chatbubble",
      },
      {
        id: "push-notifications",
        label: "Push Notifications",
        description: "Send push notifications to users",
        type: "toggle",
        value: true,
        icon: "notifications",
      },
    ],
  },
  {
    id: "content",
    title: "Content Settings",
    items: [
      {
        id: "amenities",
        label: "Manage Amenities",
        description: "Edit available amenities list",
        type: "action",
        icon: "list",
        onPress: () => Alert.alert("Amenities", "Manage amenities list"),
      },
      {
        id: "property-types",
        label: "Property Types",
        description: "Edit property type categories",
        type: "action",
        icon: "home",
        onPress: () => Alert.alert("Property Types", "Manage property types"),
      },
      {
        id: "locations",
        label: "Regions & Cities",
        description: "Manage available locations",
        type: "action",
        icon: "location",
        onPress: () => Alert.alert("Locations", "Manage regions and cities"),
      },
    ],
  },
  {
    id: "admin",
    title: "Admin Users",
    items: [
      {
        id: "add-admin",
        label: "Add Admin User",
        description: "Grant admin access to a user",
        type: "action",
        icon: "person-add",
        onPress: () => Alert.alert("Add Admin", "Add new admin user"),
      },
      {
        id: "manage-admins",
        label: "Manage Admins",
        description: "View and manage admin users",
        type: "action",
        icon: "people",
        onPress: () => Alert.alert("Manage Admins", "View admin users list"),
      },
    ],
  },
];

export default function SystemSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [settings, setSettings] = useState<Record<string, boolean | string>>({
    "paystack-enabled": true,
    "momo-enabled": true,
    "bank-transfer": false,
    "email-notifications": true,
    "sms-notifications": true,
    "push-notifications": true,
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleToggle = (id: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [id]: value }));
  };

  const renderSettingItem = (item: SettingItem) => {
    if (item.type === "toggle") {
      const value = (settings[item.id] as boolean) ?? (item.value as boolean);
      return (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.settingItem,
            {
              backgroundColor: colors.surface,
              borderColor: colors.divider,
            },
          ]}
          activeOpacity={0.7}
        >
          <View style={styles.settingItemLeft}>
            {item.icon && (
              <View
                style={[
                  styles.settingIconContainer,
                  { backgroundColor: `${colors.primary}15` },
                ]}
              >
                <Ionicons name={item.icon} size={20} color={colors.primary} />
              </View>
            )}
            <View style={styles.settingItemContent}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {item.label}
              </Text>
              {item.description && (
                <Text
                  style={[
                    styles.settingDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  {item.description}
                </Text>
              )}
            </View>
          </View>
          <Switch
            value={value}
            onValueChange={(newValue) => handleToggle(item.id, newValue)}
            trackColor={{
              false: colors.divider,
              true: colors.primary,
            }}
            thumbColor="#FFFFFF"
          />
        </TouchableOpacity>
      );
    }

    if (item.type === "text") {
      return (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.settingItem,
            {
              backgroundColor: colors.surface,
              borderColor: colors.divider,
            },
          ]}
          activeOpacity={0.7}
          onPress={() => Alert.alert("Edit", `Edit ${item.label}`)}
        >
          <View style={styles.settingItemLeft}>
            {item.icon && (
              <View
                style={[
                  styles.settingIconContainer,
                  { backgroundColor: `${colors.primary}15` },
                ]}
              >
                <Ionicons name={item.icon} size={20} color={colors.primary} />
              </View>
            )}
            <View style={styles.settingItemContent}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {item.label}
              </Text>
              {item.description && (
                <Text
                  style={[
                    styles.settingDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  {item.description}
                </Text>
              )}
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      );
    }

    if (item.type === "action") {
      return (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.settingItem,
            {
              backgroundColor: colors.surface,
              borderColor: colors.divider,
            },
          ]}
          activeOpacity={0.7}
          onPress={item.onPress}
        >
          <View style={styles.settingItemLeft}>
            {item.icon && (
              <View
                style={[
                  styles.settingIconContainer,
                  { backgroundColor: `${colors.primary}15` },
                ]}
              >
                <Ionicons name={item.icon} size={20} color={colors.primary} />
              </View>
            )}
            <View style={styles.settingItemContent}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {item.label}
              </Text>
              {item.description && (
                <Text
                  style={[
                    styles.settingDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  {item.description}
                </Text>
              )}
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      );
    }

    return null;
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
          title="System Settings"
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
          {SETTINGS_SECTIONS.map((section) => (
            <View key={section.id} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {section.title}
              </Text>
              <View style={styles.sectionContent}>
                {section.items.map(renderSettingItem)}
              </View>
            </View>
          ))}
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
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: Spacing.md,
  },
  sectionContent: {
    gap: Spacing.sm,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: Spacing.md,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  settingItemContent: {
    flex: 1,
  },
  settingLabel: {
    ...Typography.bodyMedium,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  settingDescription: {
    ...Typography.bodyMedium,
    fontSize: 12,
  },
});
