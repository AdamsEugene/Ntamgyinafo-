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
import { useRouter } from "expo-router";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetTextInput,
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
    editSheetRef.current?.present();
  };

  const handleCreatePlan = () => {
    setSelectedPlan(null);
    createSheetRef.current?.present();
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
        <BottomSheetView
          style={[styles.sheetContent, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.sheetTitle, { color: colors.text }]}>
            Edit Subscription Plan
          </Text>
          <Text style={[styles.sheetSubtitle, { color: colors.textSecondary }]}>
            Update plan details and pricing
          </Text>
          {/* Edit form would go here */}
        </BottomSheetView>
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
        <BottomSheetView
          style={[styles.sheetContent, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.sheetTitle, { color: colors.text }]}>
            Create New Plan
          </Text>
          <Text style={[styles.sheetSubtitle, { color: colors.textSecondary }]}>
            Add a new subscription plan
          </Text>
          {/* Create form would go here */}
        </BottomSheetView>
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
  },
  actionButtonText: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
  },
  sheetContent: {
    flex: 1,
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
});
