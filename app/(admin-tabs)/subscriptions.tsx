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
  BottomSheetTextInput,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Typography, Spacing } from "@/constants/design";
import { useTheme } from "@/contexts/ThemeContext";
import { FloatingHeader } from "@/components/FloatingHeader";

interface SubscriptionPlan {
  id: string;
  name: string;
  userType: "owner" | "buyer";
  price: number;
  duration: number; // days
  propertyLimit: number;
  contactLimit: number;
  features: string[];
  isActive: boolean;
  subscribers: number;
}

const MOCK_PLANS: SubscriptionPlan[] = [
  {
    id: "owner-basic",
    name: "Basic",
    userType: "owner",
    price: 50,
    duration: 30,
    propertyLimit: 2,
    contactLimit: 0,
    features: ["2 property listings", "Standard placement", "Basic analytics"],
    isActive: true,
    subscribers: 1245,
  },
  {
    id: "owner-standard",
    name: "Standard",
    userType: "owner",
    price: 80,
    duration: 60,
    propertyLimit: 2,
    contactLimit: 0,
    features: [
      "2 property listings",
      "Priority placement",
      "Advanced analytics",
    ],
    isActive: true,
    subscribers: 892,
  },
  {
    id: "owner-premium",
    name: "Premium",
    userType: "owner",
    price: 120,
    duration: 90,
    propertyLimit: 2,
    contactLimit: 0,
    features: [
      "2 property listings",
      "Featured placement",
      "Full analytics",
      "Priority support",
    ],
    isActive: true,
    subscribers: 456,
  },
  {
    id: "buyer-basic",
    name: "Basic",
    userType: "buyer",
    price: 30,
    duration: 30,
    propertyLimit: 0,
    contactLimit: 2,
    features: ["2 property contacts", "Full property details", "GPS locations"],
    isActive: true,
    subscribers: 3456,
  },
  {
    id: "buyer-standard",
    name: "Standard",
    userType: "buyer",
    price: 50,
    duration: 60,
    propertyLimit: 0,
    contactLimit: 2,
    features: [
      "2 property contacts",
      "Full details",
      "GPS locations",
      "Priority notifications",
    ],
    isActive: true,
    subscribers: 2134,
  },
];

export default function SubscriptionPlansScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState<"owner" | "buyer" | "all">(
    "all"
  );
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null
  );
  const editSheetRef = useRef<BottomSheetModal>(null);
  const createSheetRef = useRef<BottomSheetModal>(null);

  // Create plan form state
  const [newPlan, setNewPlan] = useState({
    name: "",
    userType: "owner" as "owner" | "buyer",
    price: "",
    duration: "",
    propertyLimit: "",
    contactLimit: "",
    features: [""],
    isActive: true,
  });
  const [isCreating, setIsCreating] = useState(false);

  // Edit plan form state
  const [editPlan, setEditPlan] = useState({
    name: "",
    userType: "owner" as "owner" | "buyer",
    price: "",
    duration: "",
    propertyLimit: "",
    contactLimit: "",
    features: [""],
    isActive: true,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredPlans = MOCK_PLANS.filter(
    (plan) => selectedType === "all" || plan.userType === selectedType
  );

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

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setEditPlan({
      name: plan.name,
      userType: plan.userType,
      price: plan.price.toString(),
      duration: plan.duration.toString(),
      propertyLimit: plan.propertyLimit.toString(),
      contactLimit: plan.contactLimit.toString(),
      features: plan.features.length > 0 ? plan.features : [""],
      isActive: plan.isActive,
    });
    editSheetRef.current?.present();
  };

  const handleDeletePlan = (plan: SubscriptionPlan) => {
    if (isDeleting) return; // Prevent multiple deletions

    Alert.alert(
      "Delete Plan",
      `Are you sure you want to delete the "${plan.name}" plan? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            // Simulate API call
            setTimeout(() => {
              setIsDeleting(false);
              Alert.alert("Success", "Plan deleted successfully");
            }, 1000);
          },
        },
      ]
    );
  };

  // Keep selectedPlan for potential future use (e.g., showing plan details)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _selectedPlan = selectedPlan;

  const handleAddEditFeature = () => {
    setEditPlan((prev) => ({
      ...prev,
      features: [...prev.features, ""],
    }));
  };

  const handleRemoveEditFeature = (index: number) => {
    setEditPlan((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateEditFeature = (index: number, value: string) => {
    setEditPlan((prev) => ({
      ...prev,
      features: prev.features.map((f, i) => (i === index ? value : f)),
    }));
  };

  const handleEditPlanSubmit = async () => {
    if (
      !editPlan.name ||
      !editPlan.price ||
      !editPlan.duration ||
      (!editPlan.propertyLimit && editPlan.userType === "owner") ||
      (!editPlan.contactLimit && editPlan.userType === "buyer") ||
      editPlan.features.filter((f) => f.trim()).length === 0
    ) {
      return;
    }

    setIsEditing(true);
    // Simulate API call
    setTimeout(() => {
      setIsEditing(false);
      editSheetRef.current?.dismiss();
      setSelectedPlan(null);
    }, 1500);
  };

  const handleCreatePlan = () => {
    setNewPlan({
      name: "",
      userType: "owner",
      price: "",
      duration: "",
      propertyLimit: "",
      contactLimit: "",
      features: [""],
      isActive: true,
    });
    createSheetRef.current?.present();
  };

  const handleAddFeature = () => {
    setNewPlan((prev) => ({
      ...prev,
      features: [...prev.features, ""],
    }));
  };

  const handleRemoveFeature = (index: number) => {
    setNewPlan((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateFeature = (index: number, value: string) => {
    setNewPlan((prev) => ({
      ...prev,
      features: prev.features.map((f, i) => (i === index ? value : f)),
    }));
  };

  const handleCreatePlanSubmit = async () => {
    if (
      !newPlan.name ||
      !newPlan.price ||
      !newPlan.duration ||
      (!newPlan.propertyLimit && newPlan.userType === "owner") ||
      (!newPlan.contactLimit && newPlan.userType === "buyer") ||
      newPlan.features.filter((f) => f.trim()).length === 0
    ) {
      return;
    }

    setIsCreating(true);
    // Simulate API call
    setTimeout(() => {
      setIsCreating(false);
      createSheetRef.current?.dismiss();
      // Reset form
      setNewPlan({
        name: "",
        userType: "owner",
        price: "",
        duration: "",
        propertyLimit: "",
        contactLimit: "",
        features: [""],
        isActive: true,
      });
    }, 1500);
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
          title="Subscription Plans"
          showBackButton
          onBackPress={() => router.back()}
          rightContent={
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: colors.primary }]}
              onPress={handleCreatePlan}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.createButtonText}>New Plan</Text>
            </TouchableOpacity>
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
          <View style={styles.filterTabs}>
            <TouchableOpacity
              style={[
                styles.filterTab,
                selectedType === "all" && {
                  backgroundColor: colors.primary,
                },
              ]}
              onPress={() => setSelectedType("all")}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  {
                    color:
                      selectedType === "all" ? "#FFFFFF" : colors.textSecondary,
                  },
                ]}
              >
                All Plans
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterTab,
                selectedType === "owner" && {
                  backgroundColor: colors.primary,
                },
              ]}
              onPress={() => setSelectedType("owner")}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  {
                    color:
                      selectedType === "owner"
                        ? "#FFFFFF"
                        : colors.textSecondary,
                  },
                ]}
              >
                Owners
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterTab,
                selectedType === "buyer" && {
                  backgroundColor: colors.primary,
                },
              ]}
              onPress={() => setSelectedType("buyer")}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  {
                    color:
                      selectedType === "buyer"
                        ? "#FFFFFF"
                        : colors.textSecondary,
                  },
                ]}
              >
                Buyers
              </Text>
            </TouchableOpacity>
          </View>

          {/* Plans List */}
          {filteredPlans.map((plan) => (
            <View
              key={plan.id}
              style={[
                styles.planCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
            >
              <View style={styles.planHeader}>
                <View style={styles.planTitleRow}>
                  <View
                    style={[
                      styles.planTypeBadge,
                      {
                        backgroundColor:
                          plan.userType === "owner"
                            ? `${colors.primary}15`
                            : `${colors.primary}15`,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.planTypeText, { color: colors.primary }]}
                    >
                      {plan.userType === "owner" ? "Owner" : "Buyer"}
                    </Text>
                  </View>
                  <Text style={[styles.planName, { color: colors.text }]}>
                    {plan.name}
                  </Text>
                  {plan.isActive ? (
                    <View
                      style={[
                        styles.activeBadge,
                        { backgroundColor: `${colors.primary}15` },
                      ]}
                    >
                      <View
                        style={[
                          styles.activeDot,
                          { backgroundColor: colors.primary },
                        ]}
                      />
                      <Text
                        style={[styles.activeText, { color: colors.primary }]}
                      >
                        Active
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.inactiveBadge,
                        {
                          backgroundColor: isDark ? "#7F1D1D" : "#FEE2E2",
                        },
                      ]}
                    >
                      <Text style={[styles.inactiveText, { color: "#EF4444" }]}>
                        Inactive
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.planDetails}>
                <View style={styles.priceRow}>
                  <Text
                    style={[styles.priceLabel, { color: colors.textSecondary }]}
                  >
                    Price:
                  </Text>
                  <Text style={[styles.priceValue, { color: colors.primary }]}>
                    ₵{plan.price}
                  </Text>
                  <Text
                    style={[
                      styles.durationText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    / {plan.duration} days
                  </Text>
                </View>

                <View style={styles.limitsRow}>
                  {plan.propertyLimit > 0 && (
                    <View style={styles.limitItem}>
                      <Ionicons
                        name="home-outline"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.limitText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {plan.propertyLimit} listings
                      </Text>
                    </View>
                  )}
                  {plan.contactLimit > 0 && (
                    <View style={styles.limitItem}>
                      <Ionicons
                        name="chatbubble-outline"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.limitText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {plan.contactLimit} contacts
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.featuresList}>
                  {plan.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={colors.primary}
                      />
                      <Text
                        style={[styles.featureText, { color: colors.text }]}
                      >
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.subscribersRow}>
                  <Ionicons
                    name="people-outline"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.subscribersText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {plan.subscribers.toLocaleString()} active subscribers
                  </Text>
                </View>
              </View>

              <View style={styles.planActions}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.divider,
                    },
                  ]}
                  onPress={() => handleEditPlan(plan)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="create-outline"
                    size={18}
                    color={colors.primary}
                  />
                  <Text
                    style={[styles.actionButtonText, { color: colors.primary }]}
                  >
                    Edit
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: plan.isActive
                        ? isDark
                          ? "#7F1D1D"
                          : "#FEE2E2"
                        : `${colors.primary}15`,
                      borderColor: plan.isActive ? "#EF4444" : colors.primary,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={plan.isActive ? "pause-outline" : "play-outline"}
                    size={18}
                    color={plan.isActive ? "#EF4444" : colors.primary}
                  />
                  <Text
                    style={[
                      styles.actionButtonText,
                      { color: plan.isActive ? "#EF4444" : colors.primary },
                    ]}
                  >
                    {plan.isActive ? "Disable" : "Enable"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.deleteButton,
                    {
                      backgroundColor: isDark ? "#7F1D1D" : "#FEE2E2",
                      borderColor: "#EF4444",
                    },
                  ]}
                  onPress={() => handleDeletePlan(plan)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  <Text style={[styles.actionButtonText, { color: "#EF4444" }]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Edit Plan Bottom Sheet */}
      <BottomSheetModal
        ref={editSheetRef}
        index={0}
        snapPoints={["90%"]}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: colors.divider }}
        backgroundStyle={{ backgroundColor: colors.surface }}
      >
        <BottomSheetScrollView
          style={[styles.sheetContent, { backgroundColor: colors.surface }]}
          contentContainerStyle={styles.sheetContentContainer}
        >
          <Text style={[styles.sheetTitle, { color: colors.text }]}>
            Edit Subscription Plan
          </Text>
          <Text style={[styles.sheetSubtitle, { color: colors.textSecondary }]}>
            Update plan details and pricing
          </Text>

          {/* Plan Name */}
          <View style={styles.formSection}>
            <Text style={[styles.formLabel, { color: colors.text }]}>
              Plan Name *
            </Text>
            <BottomSheetTextInput
              style={[
                styles.formInput,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.divider,
                  color: colors.text,
                },
              ]}
              placeholder="e.g., Basic, Standard, Premium"
              placeholderTextColor={colors.textSecondary}
              value={editPlan.name}
              onChangeText={(text) =>
                setEditPlan((prev) => ({ ...prev, name: text }))
              }
            />
          </View>

          {/* User Type */}
          <View style={styles.formSection}>
            <Text style={[styles.formLabel, { color: colors.text }]}>
              User Type *
            </Text>
            <View style={styles.userTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  {
                    backgroundColor:
                      editPlan.userType === "owner"
                        ? colors.primary
                        : colors.surface,
                    borderColor:
                      editPlan.userType === "owner"
                        ? colors.primary
                        : colors.divider,
                  },
                ]}
                onPress={() =>
                  setEditPlan((prev) => ({ ...prev, userType: "owner" }))
                }
                activeOpacity={0.7}
              >
                <Ionicons
                  name="home"
                  size={20}
                  color={
                    editPlan.userType === "owner"
                      ? "#FFFFFF"
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.userTypeButtonText,
                    {
                      color:
                        editPlan.userType === "owner"
                          ? "#FFFFFF"
                          : colors.textSecondary,
                    },
                  ]}
                >
                  Owner
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  {
                    backgroundColor:
                      editPlan.userType === "buyer"
                        ? colors.primary
                        : colors.surface,
                    borderColor:
                      editPlan.userType === "buyer"
                        ? colors.primary
                        : colors.divider,
                  },
                ]}
                onPress={() =>
                  setEditPlan((prev) => ({ ...prev, userType: "buyer" }))
                }
                activeOpacity={0.7}
              >
                <Ionicons
                  name="search"
                  size={20}
                  color={
                    editPlan.userType === "buyer"
                      ? "#FFFFFF"
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.userTypeButtonText,
                    {
                      color:
                        editPlan.userType === "buyer"
                          ? "#FFFFFF"
                          : colors.textSecondary,
                    },
                  ]}
                >
                  Buyer
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Price and Duration Row */}
          <View style={styles.formRow}>
            <View style={[styles.formSection, { flex: 1 }]}>
              <Text style={[styles.formLabel, { color: colors.text }]}>
                Price (₵) *
              </Text>
              <BottomSheetTextInput
                style={[
                  styles.formInput,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.divider,
                    color: colors.text,
                  },
                ]}
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                value={editPlan.price}
                onChangeText={(text) =>
                  setEditPlan((prev) => ({ ...prev, price: text }))
                }
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.formSection, { flex: 1 }]}>
              <Text style={[styles.formLabel, { color: colors.text }]}>
                Duration (Days) *
              </Text>
              <BottomSheetTextInput
                style={[
                  styles.formInput,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.divider,
                    color: colors.text,
                  },
                ]}
                placeholder="30"
                placeholderTextColor={colors.textSecondary}
                value={editPlan.duration}
                onChangeText={(text) =>
                  setEditPlan((prev) => ({ ...prev, duration: text }))
                }
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Limits Row */}
          <View style={styles.formRow}>
            {editPlan.userType === "owner" ? (
              <View style={[styles.formSection, { flex: 1 }]}>
                <Text style={[styles.formLabel, { color: colors.text }]}>
                  Property Limit *
                </Text>
                <BottomSheetTextInput
                  style={[
                    styles.formInput,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.divider,
                      color: colors.text,
                    },
                  ]}
                  placeholder="2"
                  placeholderTextColor={colors.textSecondary}
                  value={editPlan.propertyLimit}
                  onChangeText={(text) =>
                    setEditPlan((prev) => ({ ...prev, propertyLimit: text }))
                  }
                  keyboardType="numeric"
                />
              </View>
            ) : (
              <View style={[styles.formSection, { flex: 1 }]}>
                <Text style={[styles.formLabel, { color: colors.text }]}>
                  Contact Limit *
                </Text>
                <BottomSheetTextInput
                  style={[
                    styles.formInput,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.divider,
                      color: colors.text,
                    },
                  ]}
                  placeholder="2"
                  placeholderTextColor={colors.textSecondary}
                  value={editPlan.contactLimit}
                  onChangeText={(text) =>
                    setEditPlan((prev) => ({ ...prev, contactLimit: text }))
                  }
                  keyboardType="numeric"
                />
              </View>
            )}
          </View>

          {/* Features */}
          <View style={styles.formSection}>
            <View style={styles.featuresHeader}>
              <Text style={[styles.formLabel, { color: colors.text }]}>
                Features *
              </Text>
              <TouchableOpacity
                style={[
                  styles.addFeatureButton,
                  { backgroundColor: `${colors.primary}15` },
                ]}
                onPress={handleAddEditFeature}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={18} color={colors.primary} />
                <Text
                  style={[styles.addFeatureText, { color: colors.primary }]}
                >
                  Add Feature
                </Text>
              </TouchableOpacity>
            </View>
            {editPlan.features.map((feature, index) => (
              <View key={index} style={styles.featureInputRow}>
                <BottomSheetTextInput
                  style={[
                    styles.formInput,
                    styles.featureInput,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.divider,
                      color: colors.text,
                    },
                  ]}
                  placeholder={`Feature ${index + 1}`}
                  placeholderTextColor={colors.textSecondary}
                  value={feature}
                  onChangeText={(text) => handleUpdateEditFeature(index, text)}
                />
                {editPlan.features.length > 1 && (
                  <TouchableOpacity
                    style={[
                      styles.removeFeatureButton,
                      { backgroundColor: isDark ? "#7F1D1D" : "#FEE2E2" },
                    ]}
                    onPress={() => handleRemoveEditFeature(index)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close" size={18} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {/* Active Toggle */}
          <View style={styles.formSection}>
            <View
              style={[
                styles.toggleRow,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
            >
              <View style={styles.toggleLeft}>
                <Ionicons
                  name="power"
                  size={20}
                  color={
                    editPlan.isActive ? colors.primary : colors.textSecondary
                  }
                />
                <View style={styles.toggleContent}>
                  <Text style={[styles.toggleLabel, { color: colors.text }]}>
                    Plan Active
                  </Text>
                  <Text
                    style={[
                      styles.toggleDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {editPlan.isActive
                      ? "Plan will be available for subscription"
                      : "Plan will be hidden from users"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() =>
                  setEditPlan((prev) => ({ ...prev, isActive: !prev.isActive }))
                }
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.toggleSwitch,
                    {
                      backgroundColor: editPlan.isActive
                        ? colors.primary
                        : colors.divider,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.toggleThumb,
                      {
                        transform: [{ translateX: editPlan.isActive ? 20 : 0 }],
                      },
                    ]}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.editActionButtons}>
            <TouchableOpacity
              style={[
                styles.cancelButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
              onPress={() => editSheetRef.current?.dismiss()}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor: colors.primary,
                  opacity:
                    !editPlan.name ||
                    !editPlan.price ||
                    !editPlan.duration ||
                    (!editPlan.propertyLimit &&
                      editPlan.userType === "owner") ||
                    (!editPlan.contactLimit && editPlan.userType === "buyer") ||
                    editPlan.features.filter((f) => f.trim()).length === 0
                      ? 0.5
                      : 1,
                },
              ]}
              onPress={handleEditPlanSubmit}
              disabled={
                isEditing ||
                !editPlan.name ||
                !editPlan.price ||
                !editPlan.duration ||
                (!editPlan.propertyLimit && editPlan.userType === "owner") ||
                (!editPlan.contactLimit && editPlan.userType === "buyer") ||
                editPlan.features.filter((f) => f.trim()).length === 0
              }
              activeOpacity={0.8}
            >
              {isEditing ? (
                <Text style={styles.submitButtonText}>Updating Plan...</Text>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Update Plan</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>

      {/* Create Plan Bottom Sheet */}
      <BottomSheetModal
        ref={createSheetRef}
        index={0}
        snapPoints={["90%"]}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: colors.divider }}
        backgroundStyle={{ backgroundColor: colors.surface }}
      >
        <BottomSheetScrollView
          style={[styles.sheetContent, { backgroundColor: colors.surface }]}
          contentContainerStyle={styles.sheetContentContainer}
        >
          <Text style={[styles.sheetTitle, { color: colors.text }]}>
            Create New Plan
          </Text>
          <Text style={[styles.sheetSubtitle, { color: colors.textSecondary }]}>
            Add a new subscription plan
          </Text>

          {/* Plan Name */}
          <View style={styles.formSection}>
            <Text style={[styles.formLabel, { color: colors.text }]}>
              Plan Name *
            </Text>
            <BottomSheetTextInput
              style={[
                styles.formInput,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.divider,
                  color: colors.text,
                },
              ]}
              placeholder="e.g., Basic, Standard, Premium"
              placeholderTextColor={colors.textSecondary}
              value={newPlan.name}
              onChangeText={(text) =>
                setNewPlan((prev) => ({ ...prev, name: text }))
              }
            />
          </View>

          {/* User Type */}
          <View style={styles.formSection}>
            <Text style={[styles.formLabel, { color: colors.text }]}>
              User Type *
            </Text>
            <View style={styles.userTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  {
                    backgroundColor:
                      newPlan.userType === "owner"
                        ? colors.primary
                        : colors.surface,
                    borderColor:
                      newPlan.userType === "owner"
                        ? colors.primary
                        : colors.divider,
                  },
                ]}
                onPress={() =>
                  setNewPlan((prev) => ({ ...prev, userType: "owner" }))
                }
                activeOpacity={0.7}
              >
                <Ionicons
                  name="home"
                  size={20}
                  color={
                    newPlan.userType === "owner"
                      ? "#FFFFFF"
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.userTypeButtonText,
                    {
                      color:
                        newPlan.userType === "owner"
                          ? "#FFFFFF"
                          : colors.textSecondary,
                    },
                  ]}
                >
                  Owner
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  {
                    backgroundColor:
                      newPlan.userType === "buyer"
                        ? colors.primary
                        : colors.surface,
                    borderColor:
                      newPlan.userType === "buyer"
                        ? colors.primary
                        : colors.divider,
                  },
                ]}
                onPress={() =>
                  setNewPlan((prev) => ({ ...prev, userType: "buyer" }))
                }
                activeOpacity={0.7}
              >
                <Ionicons
                  name="search"
                  size={20}
                  color={
                    newPlan.userType === "buyer"
                      ? "#FFFFFF"
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.userTypeButtonText,
                    {
                      color:
                        newPlan.userType === "buyer"
                          ? "#FFFFFF"
                          : colors.textSecondary,
                    },
                  ]}
                >
                  Buyer
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Price and Duration Row */}
          <View style={styles.formRow}>
            <View style={[styles.formSection, { flex: 1 }]}>
              <Text style={[styles.formLabel, { color: colors.text }]}>
                Price (₵) *
              </Text>
              <BottomSheetTextInput
                style={[
                  styles.formInput,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.divider,
                    color: colors.text,
                  },
                ]}
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                value={newPlan.price}
                onChangeText={(text) =>
                  setNewPlan((prev) => ({ ...prev, price: text }))
                }
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.formSection, { flex: 1 }]}>
              <Text style={[styles.formLabel, { color: colors.text }]}>
                Duration (Days) *
              </Text>
              <BottomSheetTextInput
                style={[
                  styles.formInput,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.divider,
                    color: colors.text,
                  },
                ]}
                placeholder="30"
                placeholderTextColor={colors.textSecondary}
                value={newPlan.duration}
                onChangeText={(text) =>
                  setNewPlan((prev) => ({ ...prev, duration: text }))
                }
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Limits Row */}
          <View style={styles.formRow}>
            {newPlan.userType === "owner" ? (
              <View style={[styles.formSection, { flex: 1 }]}>
                <Text style={[styles.formLabel, { color: colors.text }]}>
                  Property Limit *
                </Text>
                <BottomSheetTextInput
                  style={[
                    styles.formInput,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.divider,
                      color: colors.text,
                    },
                  ]}
                  placeholder="2"
                  placeholderTextColor={colors.textSecondary}
                  value={newPlan.propertyLimit}
                  onChangeText={(text) =>
                    setNewPlan((prev) => ({ ...prev, propertyLimit: text }))
                  }
                  keyboardType="numeric"
                />
              </View>
            ) : (
              <View style={[styles.formSection, { flex: 1 }]}>
                <Text style={[styles.formLabel, { color: colors.text }]}>
                  Contact Limit *
                </Text>
                <BottomSheetTextInput
                  style={[
                    styles.formInput,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.divider,
                      color: colors.text,
                    },
                  ]}
                  placeholder="2"
                  placeholderTextColor={colors.textSecondary}
                  value={newPlan.contactLimit}
                  onChangeText={(text) =>
                    setNewPlan((prev) => ({ ...prev, contactLimit: text }))
                  }
                  keyboardType="numeric"
                />
              </View>
            )}
          </View>

          {/* Features */}
          <View style={styles.formSection}>
            <View style={styles.featuresHeader}>
              <Text style={[styles.formLabel, { color: colors.text }]}>
                Features *
              </Text>
              <TouchableOpacity
                style={[
                  styles.addFeatureButton,
                  { backgroundColor: `${colors.primary}15` },
                ]}
                onPress={handleAddFeature}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={18} color={colors.primary} />
                <Text
                  style={[styles.addFeatureText, { color: colors.primary }]}
                >
                  Add Feature
                </Text>
              </TouchableOpacity>
            </View>
            {newPlan.features.map((feature, index) => (
              <View key={index} style={styles.featureInputRow}>
                <BottomSheetTextInput
                  style={[
                    styles.formInput,
                    styles.featureInput,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.divider,
                      color: colors.text,
                    },
                  ]}
                  placeholder={`Feature ${index + 1}`}
                  placeholderTextColor={colors.textSecondary}
                  value={feature}
                  onChangeText={(text) => handleUpdateFeature(index, text)}
                />
                {newPlan.features.length > 1 && (
                  <TouchableOpacity
                    style={[
                      styles.removeFeatureButton,
                      { backgroundColor: isDark ? "#7F1D1D" : "#FEE2E2" },
                    ]}
                    onPress={() => handleRemoveFeature(index)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close" size={18} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {/* Active Toggle */}
          <View style={styles.formSection}>
            <View
              style={[
                styles.toggleRow,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
            >
              <View style={styles.toggleLeft}>
                <Ionicons
                  name="power"
                  size={20}
                  color={
                    newPlan.isActive ? colors.primary : colors.textSecondary
                  }
                />
                <View style={styles.toggleContent}>
                  <Text style={[styles.toggleLabel, { color: colors.text }]}>
                    Plan Active
                  </Text>
                  <Text
                    style={[
                      styles.toggleDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {newPlan.isActive
                      ? "Plan will be available for subscription"
                      : "Plan will be hidden from users"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() =>
                  setNewPlan((prev) => ({ ...prev, isActive: !prev.isActive }))
                }
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.toggleSwitch,
                    {
                      backgroundColor: newPlan.isActive
                        ? colors.primary
                        : colors.divider,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.toggleThumb,
                      {
                        transform: [{ translateX: newPlan.isActive ? 20 : 0 }],
                      },
                    ]}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: colors.primary,
                opacity:
                  !newPlan.name ||
                  !newPlan.price ||
                  !newPlan.duration ||
                  (!newPlan.propertyLimit && newPlan.userType === "owner") ||
                  (!newPlan.contactLimit && newPlan.userType === "buyer") ||
                  newPlan.features.filter((f) => f.trim()).length === 0
                    ? 0.5
                    : 1,
              },
            ]}
            onPress={handleCreatePlanSubmit}
            disabled={
              isCreating ||
              !newPlan.name ||
              !newPlan.price ||
              !newPlan.duration ||
              (!newPlan.propertyLimit && newPlan.userType === "owner") ||
              (!newPlan.contactLimit && newPlan.userType === "buyer") ||
              newPlan.features.filter((f) => f.trim()).length === 0
            }
            activeOpacity={0.8}
          >
            {isCreating ? (
              <Text style={styles.submitButtonText}>Creating Plan...</Text>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Create Plan</Text>
              </>
            )}
          </TouchableOpacity>
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
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
  },
  createButtonText: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  filterTabs: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  filterTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  filterTabText: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
  },
  planCard: {
    borderRadius: 16,
    padding: Spacing.lg,
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
  planHeader: {
    marginBottom: Spacing.md,
  },
  planTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  planTypeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  planTypeText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "600",
  },
  planName: {
    ...Typography.titleMedium,
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "600",
  },
  inactiveBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  inactiveText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "600",
  },
  planDetails: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.xs,
  },
  priceLabel: {
    ...Typography.bodyMedium,
    fontSize: 14,
  },
  priceValue: {
    ...Typography.headlineMedium,
    fontSize: 24,
    fontWeight: "700",
  },
  durationText: {
    ...Typography.bodyMedium,
    fontSize: 14,
  },
  limitsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    flexWrap: "wrap",
  },
  limitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  limitText: {
    ...Typography.bodyMedium,
    fontSize: 13,
  },
  featuresList: {
    gap: Spacing.xs,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  featureText: {
    ...Typography.bodyMedium,
    fontSize: 13,
  },
  subscribersRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  subscribersText: {
    ...Typography.bodyMedium,
    fontSize: 13,
  },
  planActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    flexWrap: "wrap",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: "30%",
  },
  deleteButton: {
    flex: 1,
    minWidth: "30%",
  },
  actionButtonText: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
  },
  sheetContent: {
    flex: 1,
  },
  sheetContentContainer: {
    padding: Spacing.xl,
    paddingBottom: Spacing["3xl"],
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
  formInput: {
    ...Typography.bodyMedium,
    fontSize: 15,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 48,
  },
  formRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  userTypeContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  userTypeButtonText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
  },
  featuresHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  addFeatureButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
  },
  addFeatureText: {
    ...Typography.labelMedium,
    fontSize: 12,
    fontWeight: "600",
  },
  featureInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  featureInput: {
    flex: 1,
  },
  removeFeatureButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  toggleContent: {
    flex: 1,
  },
  toggleLabel: {
    ...Typography.bodyMedium,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  toggleDescription: {
    ...Typography.caption,
    fontSize: 12,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: 16,
    marginTop: Spacing.lg,
  },
  submitButtonText: {
    ...Typography.labelLarge,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  editActionButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  cancelButtonText: {
    ...Typography.labelLarge,
    fontSize: 16,
    fontWeight: "700",
  },
});
