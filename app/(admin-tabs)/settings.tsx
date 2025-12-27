import React, { useState, useCallback, useRef } from "react";
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
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
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

// Settings sections will be created inside component to access handlers

export default function SystemSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [settings, setSettings] = useState<Record<string, boolean | string>>({
    "app-name": "Ntamgyinafoɔ",
    "support-email": "support@ntamgyinafo.com",
    "support-phone": "+233 XX XXX XXXX",
    "paystack-enabled": true,
    "momo-enabled": true,
    "bank-transfer": false,
    "email-notifications": true,
    "sms-notifications": true,
    "push-notifications": true,
  });

  // Edit Text Setting State
  const [editingSetting, setEditingSetting] = useState<{
    id: string;
    label: string;
    value: string;
  } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const editSheetRef = useRef<BottomSheetModal>(null);

  // Content Management State
  const contentSheetRef = useRef<BottomSheetModal>(null);
  const [contentType, setContentType] = useState<
    "amenities" | "property-types" | "locations" | null
  >(null);
  const [contentItems, setContentItems] = useState<string[]>([]);
  const [newContentItem, setNewContentItem] = useState("");

  // Admin Management State
  const adminSheetRef = useRef<BottomSheetModal>(null);
  const [adminAction, setAdminAction] = useState<"add" | "manage" | null>(null);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminRole, setNewAdminRole] = useState<"admin" | "super-admin">(
    "admin"
  );

  // Paystack Keys Management State
  const paystackSheetRef = useRef<BottomSheetModal>(null);
  const [paystackPublicKey, setPaystackPublicKey] = useState("pk_test_...");
  const [paystackSecretKey, setPaystackSecretKey] = useState("sk_test_...");
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [isSavingKeys, setIsSavingKeys] = useState(false);

  // Templates Management State
  const templatesSheetRef = useRef<BottomSheetModal>(null);
  const [templateType, setTemplateType] = useState<"email" | "sms" | null>(
    null
  );
  const [templates, setTemplates] = useState<
    { id: string; name: string; subject?: string; content: string }[]
  >([]);
  const [selectedTemplate, setSelectedTemplate] = useState<{
    id: string;
    name: string;
    subject?: string;
    content: string;
  } | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [templateSubject, setTemplateSubject] = useState("");
  const [templateContent, setTemplateContent] = useState("");

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
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

  const handleToggle = (id: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [id]: value }));
    // In a real app, save to API here
  };

  const handleEditTextSetting = (item: SettingItem) => {
    setEditingSetting({
      id: item.id,
      label: item.label,
      value: (settings[item.id] as string) || (item.value as string) || "",
    });
    setEditValue((settings[item.id] as string) || (item.value as string) || "");
    editSheetRef.current?.present();
  };

  const handleSaveTextSetting = async () => {
    if (!editingSetting || !editValue.trim()) {
      Alert.alert("Error", "Please enter a value");
      return;
    }

    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSettings((prev) => ({
        ...prev,
        [editingSetting.id]: editValue.trim(),
      }));
      setIsSaving(false);
      editSheetRef.current?.dismiss();
      setEditingSetting(null);
      setEditValue("");
      Alert.alert("Success", `${editingSetting.label} updated successfully`);
    }, 1000);
  };

  const handleManageContent = (
    type: "amenities" | "property-types" | "locations"
  ) => {
    setContentType(type);
    // Load mock data based on type
    const mockData: Record<string, string[]> = {
      amenities: [
        "Wi-Fi",
        "Parking",
        "Swimming Pool",
        "Gym",
        "Security",
        "Air Conditioning",
      ],
      "property-types": ["House", "Apartment", "Villa", "Townhouse", "Studio"],
      locations: ["Accra", "Kumasi", "Tamale", "Takoradi", "Cape Coast"],
    };
    setContentItems(mockData[type] || []);
    setNewContentItem("");
    contentSheetRef.current?.present();
  };

  const handleAddContentItem = () => {
    if (!newContentItem.trim()) return;
    setContentItems((prev) => [...prev, newContentItem.trim()]);
    setNewContentItem("");
  };

  const handleRemoveContentItem = (index: number) => {
    Alert.alert("Remove Item", "Are you sure you want to remove this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setContentItems((prev) => prev.filter((_, i) => i !== index));
        },
      },
    ]);
  };

  const handleAddAdmin = () => {
    setAdminAction("add");
    setNewAdminEmail("");
    setNewAdminRole("admin");
    adminSheetRef.current?.present();
  };

  const handleManageAdmins = () => {
    setAdminAction("manage");
    adminSheetRef.current?.present();
  };

  const handleSaveAdmin = async () => {
    if (!newAdminEmail.trim()) {
      Alert.alert("Error", "Please enter an email address");
      return;
    }

    // Simulate API call
    Alert.alert("Success", `Admin access granted to ${newAdminEmail}`);
    setNewAdminEmail("");
    setNewAdminRole("admin");
    adminSheetRef.current?.dismiss();
  };

  const handleManagePaystackKeys = () => {
    paystackSheetRef.current?.present();
  };

  const handleSavePaystackKeys = async () => {
    if (!paystackPublicKey.trim() || !paystackSecretKey.trim()) {
      Alert.alert("Error", "Please enter both public and secret keys");
      return;
    }

    setIsSavingKeys(true);
    // Simulate API call
    setTimeout(() => {
      setIsSavingKeys(false);
      Alert.alert("Success", "Paystack keys saved successfully");
      paystackSheetRef.current?.dismiss();
    }, 1000);
  };

  const handleManageTemplates = (type: "email" | "sms") => {
    setTemplateType(type);
    // Load mock templates
    const mockTemplates = {
      email: [
        {
          id: "welcome",
          name: "Welcome Email",
          subject: "Welcome to Ntamgyinafoɔ",
          content: "Welcome {{name}}! Thank you for joining...",
        },
        {
          id: "verification",
          name: "Verification Email",
          subject: "Verify your account",
          content: "Please verify your account by clicking...",
        },
      ],
      sms: [
        {
          id: "otp",
          name: "OTP Code",
          content: "Your OTP code is {{code}}. Valid for 5 minutes.",
        },
        {
          id: "welcome",
          name: "Welcome SMS",
          content: "Welcome to Ntamgyinafoɔ! Start browsing properties now.",
        },
      ],
    };
    setTemplates(mockTemplates[type] || []);
    templatesSheetRef.current?.present();
  };

  const handleEditTemplate = (template: {
    id: string;
    name: string;
    subject?: string;
    content: string;
  }) => {
    setSelectedTemplate(template);
    setTemplateName(template.name);
    setTemplateSubject(template.subject || "");
    setTemplateContent(template.content);
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim() || !templateContent.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (templateType === "email" && !templateSubject.trim()) {
      Alert.alert("Error", "Email template requires a subject");
      return;
    }

    // Simulate API call
    Alert.alert("Success", "Template saved successfully");
    setSelectedTemplate(null);
    setTemplateName("");
    setTemplateSubject("");
    setTemplateContent("");
    templatesSheetRef.current?.dismiss();
  };

  // Create settings sections with handlers
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
          id: "paystack-keys",
          label: "Paystack API Keys",
          description: "Manage Paystack public and secret keys",
          type: "action",
          icon: "key",
          onPress: () => handleManagePaystackKeys(),
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
          id: "email-templates",
          label: "Email Templates",
          description: "Manage email notification templates",
          type: "action",
          icon: "document-text",
          onPress: () => handleManageTemplates("email"),
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
          id: "sms-templates",
          label: "SMS Templates",
          description: "Manage SMS notification templates",
          type: "action",
          icon: "document-text",
          onPress: () => handleManageTemplates("sms"),
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
          onPress: () => handleManageContent("amenities"),
        },
        {
          id: "property-types",
          label: "Property Types",
          description: "Edit property type categories",
          type: "action",
          icon: "home",
          onPress: () => handleManageContent("property-types"),
        },
        {
          id: "locations",
          label: "Regions & Cities",
          description: "Manage available locations",
          type: "action",
          icon: "location",
          onPress: () => handleManageContent("locations"),
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
          onPress: handleAddAdmin,
        },
        {
          id: "manage-admins",
          label: "Manage Admins",
          description: "View and manage admin users",
          type: "action",
          icon: "people",
          onPress: handleManageAdmins,
        },
      ],
    },
  ];

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
      const currentValue =
        (settings[item.id] as string) ||
        (item.value as string) ||
        item.description ||
        "";
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
          onPress={() => handleEditTextSetting(item)}
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
              <Text
                style={[
                  styles.settingDescription,
                  { color: colors.textSecondary },
                ]}
              >
                {currentValue}
              </Text>
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

        {/* Edit Text Setting Bottom Sheet */}
        <BottomSheetModal
          ref={editSheetRef}
          index={0}
          snapPoints={["40%"]}
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={{ backgroundColor: colors.divider }}
          backgroundStyle={{ backgroundColor: colors.surface }}
        >
          <BottomSheetScrollView
            style={[styles.sheetContent, { backgroundColor: colors.surface }]}
            contentContainerStyle={styles.sheetContentContainer}
          >
            {editingSetting && (
              <>
                <Text style={[styles.sheetTitle, { color: colors.text }]}>
                  Edit {editingSetting.label}
                </Text>
                <BottomSheetTextInput
                  style={[
                    styles.editInput,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.divider,
                      color: colors.text,
                    },
                  ]}
                  placeholder={`Enter ${editingSetting.label.toLowerCase()}`}
                  placeholderTextColor={colors.textSecondary}
                  value={editValue}
                  onChangeText={setEditValue}
                  autoCapitalize="none"
                  keyboardType={
                    editingSetting.id === "support-email"
                      ? "email-address"
                      : editingSetting.id === "support-phone"
                      ? "phone-pad"
                      : "default"
                  }
                />
                <View style={styles.sheetActions}>
                  <TouchableOpacity
                    style={[
                      styles.sheetCancelButton,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.divider,
                      },
                    ]}
                    onPress={() => editSheetRef.current?.dismiss()}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[styles.sheetButtonText, { color: colors.text }]}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.sheetSaveButton,
                      {
                        backgroundColor: colors.primary,
                        opacity: !editValue.trim() || isSaving ? 0.5 : 1,
                      },
                    ]}
                    onPress={handleSaveTextSetting}
                    disabled={!editValue.trim() || isSaving}
                    activeOpacity={0.8}
                  >
                    {isSaving ? (
                      <Text style={styles.sheetButtonTextWhite}>Saving...</Text>
                    ) : (
                      <>
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#FFFFFF"
                        />
                        <Text style={styles.sheetButtonTextWhite}>Save</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </BottomSheetScrollView>
        </BottomSheetModal>

        {/* Content Management Bottom Sheet */}
        <BottomSheetModal
          ref={contentSheetRef}
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
              Manage{" "}
              {contentType === "amenities"
                ? "Amenities"
                : contentType === "property-types"
                ? "Property Types"
                : "Locations"}
            </Text>
            <View style={styles.addContentContainer}>
              <BottomSheetTextInput
                style={[
                  styles.addContentInput,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.divider,
                    color: colors.text,
                  },
                ]}
                placeholder={`Add new ${
                  contentType === "amenities"
                    ? "amenity"
                    : contentType === "property-types"
                    ? "property type"
                    : "location"
                }`}
                placeholderTextColor={colors.textSecondary}
                value={newContentItem}
                onChangeText={setNewContentItem}
                onSubmitEditing={handleAddContentItem}
              />
              <TouchableOpacity
                style={[
                  styles.addContentButton,
                  {
                    backgroundColor: colors.primary,
                    opacity: !newContentItem.trim() ? 0.5 : 1,
                  },
                ]}
                onPress={handleAddContentItem}
                disabled={!newContentItem.trim()}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.contentList}>
              {contentItems.map((item, index) => (
                <View
                  key={index}
                  style={[
                    styles.contentItem,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.divider,
                    },
                  ]}
                >
                  <Text
                    style={[styles.contentItemText, { color: colors.text }]}
                  >
                    {item}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.removeContentButton,
                      { backgroundColor: isDark ? "#7F1D1D" : "#FEE2E2" },
                    ]}
                    onPress={() => handleRemoveContentItem(index)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </BottomSheetScrollView>
        </BottomSheetModal>

        {/* Admin Management Bottom Sheet */}
        <BottomSheetModal
          ref={adminSheetRef}
          index={0}
          snapPoints={adminAction === "add" ? ["60%"] : ["80%"]}
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={{ backgroundColor: colors.divider }}
          backgroundStyle={{ backgroundColor: colors.surface }}
        >
          <BottomSheetScrollView
            style={[styles.sheetContent, { backgroundColor: colors.surface }]}
            contentContainerStyle={styles.sheetContentContainer}
          >
            {adminAction === "add" ? (
              <>
                <Text style={[styles.sheetTitle, { color: colors.text }]}>
                  Add Admin User
                </Text>
                <Text
                  style={[
                    styles.sheetSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  Grant admin access to a user by email
                </Text>
                <View style={styles.formSection}>
                  <Text style={[styles.formLabel, { color: colors.text }]}>
                    Email Address *
                  </Text>
                  <BottomSheetTextInput
                    style={[
                      styles.editInput,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.divider,
                        color: colors.text,
                      },
                    ]}
                    placeholder="user@example.com"
                    placeholderTextColor={colors.textSecondary}
                    value={newAdminEmail}
                    onChangeText={setNewAdminEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                <View style={styles.formSection}>
                  <Text style={[styles.formLabel, { color: colors.text }]}>
                    Role *
                  </Text>
                  <View style={styles.roleContainer}>
                    <TouchableOpacity
                      style={[
                        styles.roleButton,
                        {
                          backgroundColor:
                            newAdminRole === "admin"
                              ? colors.primary
                              : colors.surface,
                          borderColor:
                            newAdminRole === "admin"
                              ? colors.primary
                              : colors.divider,
                        },
                      ]}
                      onPress={() => setNewAdminRole("admin")}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.roleButtonText,
                          {
                            color:
                              newAdminRole === "admin"
                                ? "#FFFFFF"
                                : colors.text,
                          },
                        ]}
                      >
                        Admin
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.roleButton,
                        {
                          backgroundColor:
                            newAdminRole === "super-admin"
                              ? colors.primary
                              : colors.surface,
                          borderColor:
                            newAdminRole === "super-admin"
                              ? colors.primary
                              : colors.divider,
                        },
                      ]}
                      onPress={() => setNewAdminRole("super-admin")}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.roleButtonText,
                          {
                            color:
                              newAdminRole === "super-admin"
                                ? "#FFFFFF"
                                : colors.text,
                          },
                        ]}
                      >
                        Super Admin
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.sheetActions}>
                  <TouchableOpacity
                    style={[
                      styles.sheetCancelButton,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.divider,
                      },
                    ]}
                    onPress={() => adminSheetRef.current?.dismiss()}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[styles.sheetButtonText, { color: colors.text }]}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.sheetSaveButton,
                      {
                        backgroundColor: colors.primary,
                        opacity: !newAdminEmail.trim() ? 0.5 : 1,
                      },
                    ]}
                    onPress={handleSaveAdmin}
                    disabled={!newAdminEmail.trim()}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#FFFFFF"
                    />
                    <Text style={styles.sheetButtonTextWhite}>Add Admin</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.sheetTitle, { color: colors.text }]}>
                  Manage Admin Users
                </Text>
                <Text
                  style={[
                    styles.sheetSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  View and manage admin users
                </Text>
                {[
                  {
                    email: "admin@ntamgyinafo.com",
                    role: "Super Admin",
                    status: "Active",
                  },
                  {
                    email: "moderator@ntamgyinafo.com",
                    role: "Admin",
                    status: "Active",
                  },
                ].map((admin, index) => (
                  <View
                    key={index}
                    style={[
                      styles.adminCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.divider,
                      },
                    ]}
                  >
                    <View style={styles.adminInfo}>
                      <Text style={[styles.adminEmail, { color: colors.text }]}>
                        {admin.email}
                      </Text>
                      <View style={styles.adminMeta}>
                        <Text
                          style={[
                            styles.adminRole,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {admin.role}
                        </Text>
                        <Text
                          style={[
                            styles.adminStatus,
                            { color: colors.textSecondary },
                          ]}
                        >
                          • {admin.status}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.removeAdminButton,
                        { backgroundColor: isDark ? "#7F1D1D" : "#FEE2E2" },
                      ]}
                      onPress={() =>
                        Alert.alert("Remove Admin", `Remove ${admin.email}?`)
                      }
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#EF4444"
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}
          </BottomSheetScrollView>
        </BottomSheetModal>

        {/* Paystack Keys Management Bottom Sheet */}
        <BottomSheetModal
          ref={paystackSheetRef}
          index={0}
          snapPoints={["60%"]}
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={{ backgroundColor: colors.divider }}
          backgroundStyle={{ backgroundColor: colors.surface }}
        >
          <BottomSheetScrollView
            style={styles.sheetContent}
            contentContainerStyle={styles.sheetContentContainer}
          >
            <Text style={[styles.sheetTitle, { color: colors.text }]}>
              Paystack API Keys
            </Text>
            <Text
              style={[styles.sheetSubtitle, { color: colors.textSecondary }]}
            >
              Manage your Paystack public and secret keys
            </Text>
            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: colors.text }]}>
                Public Key *
              </Text>
              <BottomSheetTextInput
                style={[
                  styles.editInput,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.divider,
                    color: colors.text,
                  },
                ]}
                placeholder="pk_test_..."
                placeholderTextColor={colors.textSecondary}
                value={paystackPublicKey}
                onChangeText={setPaystackPublicKey}
                autoCapitalize="none"
              />
            </View>
            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: colors.text }]}>
                Secret Key *
              </Text>
              <View style={{ position: "relative" }}>
                <BottomSheetTextInput
                  style={[
                    styles.editInput,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.divider,
                      color: colors.text,
                      paddingRight: 50,
                    },
                  ]}
                  placeholder="sk_test_..."
                  placeholderTextColor={colors.textSecondary}
                  value={showSecretKey ? paystackSecretKey : "••••••••••••"}
                  onChangeText={setPaystackSecretKey}
                  autoCapitalize="none"
                  secureTextEntry={!showSecretKey}
                />
                <TouchableOpacity
                  style={{
                    position: "absolute",
                    right: 15,
                    top: 15,
                  }}
                  onPress={() => setShowSecretKey(!showSecretKey)}
                >
                  <Ionicons
                    name={showSecretKey ? "eye-off" : "eye"}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.sheetActions}>
              <TouchableOpacity
                style={[
                  styles.sheetCancelButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.divider,
                  },
                ]}
                onPress={() => paystackSheetRef.current?.dismiss()}
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
                  styles.sheetSaveButton,
                  {
                    backgroundColor: colors.primary,
                    opacity: isSavingKeys ? 0.6 : 1,
                  },
                ]}
                onPress={handleSavePaystackKeys}
                disabled={isSavingKeys}
                activeOpacity={0.8}
              >
                <Text style={styles.sheetSaveButtonText}>
                  {isSavingKeys ? "Saving..." : "Save Keys"}
                </Text>
              </TouchableOpacity>
            </View>
          </BottomSheetScrollView>
        </BottomSheetModal>

        {/* Templates Management Bottom Sheet */}
        <BottomSheetModal
          ref={templatesSheetRef}
          index={0}
          snapPoints={["80%"]}
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={{ backgroundColor: colors.divider }}
          backgroundStyle={{ backgroundColor: colors.surface }}
        >
          <BottomSheetScrollView
            style={styles.sheetContent}
            contentContainerStyle={styles.sheetContentContainer}
          >
            <Text style={[styles.sheetTitle, { color: colors.text }]}>
              {templateType === "email" ? "Email" : "SMS"} Templates
            </Text>
            <Text
              style={[styles.sheetSubtitle, { color: colors.textSecondary }]}
            >
              Manage notification templates
            </Text>

            {!selectedTemplate ? (
              <>
                <View style={styles.templatesList}>
                  {templates.map((template) => (
                    <TouchableOpacity
                      key={template.id}
                      style={[
                        styles.templateCard,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.divider,
                        },
                      ]}
                      onPress={() => handleEditTemplate(template)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.templateCardHeader}>
                        <Text
                          style={[styles.templateName, { color: colors.text }]}
                        >
                          {template.name}
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color={colors.textSecondary}
                        />
                      </View>
                      {template.subject && (
                        <Text
                          style={[
                            styles.templateSubject,
                            { color: colors.textSecondary },
                          ]}
                        >
                          Subject: {template.subject}
                        </Text>
                      )}
                      <Text
                        style={[
                          styles.templatePreview,
                          { color: colors.textSecondary },
                        ]}
                        numberOfLines={2}
                      >
                        {template.content}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  style={[
                    styles.addTemplateButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={() => {
                    setSelectedTemplate({
                      id: "new",
                      name: "",
                      subject: "",
                      content: "",
                    });
                    setTemplateName("");
                    setTemplateSubject("");
                    setTemplateContent("");
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.addTemplateButtonText}>
                    Add New Template
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.formSection}>
                  <Text style={[styles.formLabel, { color: colors.text }]}>
                    Template Name *
                  </Text>
                  <BottomSheetTextInput
                    style={[
                      styles.editInput,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.divider,
                        color: colors.text,
                      },
                    ]}
                    placeholder="e.g., Welcome Email"
                    placeholderTextColor={colors.textSecondary}
                    value={templateName}
                    onChangeText={setTemplateName}
                  />
                </View>
                {templateType === "email" && (
                  <View style={styles.formSection}>
                    <Text style={[styles.formLabel, { color: colors.text }]}>
                      Subject *
                    </Text>
                    <BottomSheetTextInput
                      style={[
                        styles.editInput,
                        {
                          backgroundColor: colors.inputBackground,
                          borderColor: colors.divider,
                          color: colors.text,
                        },
                      ]}
                      placeholder="Email subject line"
                      placeholderTextColor={colors.textSecondary}
                      value={templateSubject}
                      onChangeText={setTemplateSubject}
                    />
                  </View>
                )}
                <View style={styles.formSection}>
                  <Text style={[styles.formLabel, { color: colors.text }]}>
                    Content *
                  </Text>
                  <BottomSheetTextInput
                    style={[
                      styles.editInput,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.divider,
                        color: colors.text,
                        minHeight: 120,
                        textAlignVertical: "top",
                      },
                    ]}
                    placeholder="Template content (use {{variable}} for dynamic values)"
                    placeholderTextColor={colors.textSecondary}
                    value={templateContent}
                    onChangeText={setTemplateContent}
                    multiline
                    numberOfLines={6}
                  />
                  <Text
                    style={[styles.formHint, { color: colors.textSecondary }]}
                  >
                    Use {"{{name}}"}, {"{{code}}"}, etc. for dynamic values
                  </Text>
                </View>
                <View style={styles.sheetActions}>
                  <TouchableOpacity
                    style={[
                      styles.sheetCancelButton,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.divider,
                      },
                    ]}
                    onPress={() => {
                      setSelectedTemplate(null);
                      setTemplateName("");
                      setTemplateSubject("");
                      setTemplateContent("");
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.sheetCancelButtonText,
                        { color: colors.text },
                      ]}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.sheetSaveButton,
                      { backgroundColor: colors.primary },
                    ]}
                    onPress={handleSaveTemplate}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.sheetSaveButtonText}>
                      Save Template
                    </Text>
                  </TouchableOpacity>
                </View>
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
  editInput: {
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: Spacing.lg,
  },
  sheetActions: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  sheetCancelButton: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  sheetSaveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: 16,
  },
  sheetCancelButtonText: {
    ...Typography.labelMedium,
    fontSize: 15,
    fontWeight: "600",
  },
  sheetSaveButtonText: {
    ...Typography.labelMedium,
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  sheetButtonText: {
    ...Typography.labelLarge,
    fontSize: 16,
    fontWeight: "700",
  },
  sheetButtonTextWhite: {
    ...Typography.labelLarge,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  addContentContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  addContentInput: {
    flex: 1,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    fontSize: 16,
  },
  addContentButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  contentList: {
    gap: Spacing.sm,
  },
  contentItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  contentItemText: {
    ...Typography.bodyMedium,
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  removeContentButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
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
  roleContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  roleButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  roleButtonText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
  },
  adminCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  formHint: {
    ...Typography.caption,
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  templatesList: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  templateCard: {
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  templateCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  templateName: {
    ...Typography.bodyMedium,
    fontSize: 15,
    fontWeight: "600",
  },
  templateSubject: {
    ...Typography.caption,
    fontSize: 12,
    marginBottom: Spacing.xs,
  },
  templatePreview: {
    ...Typography.bodyMedium,
    fontSize: 13,
  },
  addTemplateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: 16,
    marginTop: Spacing.md,
  },
  addTemplateButtonText: {
    ...Typography.labelMedium,
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  adminInfo: {
    flex: 1,
  },
  adminEmail: {
    ...Typography.bodyMedium,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  adminMeta: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  adminRole: {
    ...Typography.caption,
    fontSize: 12,
  },
  adminStatus: {
    ...Typography.caption,
    fontSize: 12,
  },
  removeAdminButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
