import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Typography, Spacing } from "@/constants/design";
import { useTheme } from "@/contexts/ThemeContext";
import { FloatingHeader } from "@/components/FloatingHeader";

// Current subscription mock data
const CURRENT_SUBSCRIPTION = {
  plan: "Standard",
  listingsUsed: 3,
  listingsTotal: 5,
  expiresDate: "Feb 28, 2025",
  daysRemaining: 68,
  isActive: true,
};

interface Plan {
  id: string;
  name: string;
  price: number;
  duration: string;
  durationDays: number;
  listings: number;
  features: string[];
  popular?: boolean;
  premium?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 50,
    duration: "30 days",
    durationDays: 30,
    listings: 2,
    features: [
      "2 property listings",
      "Basic analytics",
      "Email support",
      "30 days validity",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    price: 80,
    duration: "60 days",
    durationDays: 60,
    listings: 5,
    features: [
      "5 property listings",
      "Advanced analytics",
      "Priority support",
      "Featured badge",
      "60 days validity",
    ],
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: 120,
    duration: "90 days",
    durationDays: 90,
    listings: 10,
    features: [
      "10 property listings",
      "Premium analytics",
      "24/7 priority support",
      "Verified badge",
      "Homepage spotlight",
      "90 days validity",
    ],
    premium: true,
  },
];

export default function OwnerSubscriptionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleContinue = () => {
    if (selectedPlan) {
      const plan = PLANS.find((p) => p.id === selectedPlan);
      if (plan) {
        router.push({
          pathname: "/payment",
          params: {
            planName: plan.name,
            planPrice: plan.price.toString(),
            planDuration: plan.duration,
          },
        });
      }
    }
  };

  const isCurrentPlan = (planName: string) => {
    return CURRENT_SUBSCRIPTION.plan.toLowerCase() === planName.toLowerCase();
  };

  const renderPlanCard = (plan: Plan) => {
    const isSelected = selectedPlan === plan.id;
    const isCurrent = isCurrentPlan(plan.name);

    return (
      <TouchableOpacity
        key={plan.id}
        style={[
          styles.planCard,
          {
            backgroundColor: colors.surface,
            borderColor: isSelected
              ? colors.primary
              : isCurrent
              ? colors.textSecondary
              : colors.divider,
          },
          isSelected && {
            backgroundColor: `${colors.primary}08`,
          },
          isCurrent && {
            opacity: 0.7,
          },
        ]}
        activeOpacity={0.8}
        onPress={() => handleSelectPlan(plan.id)}
        disabled={isCurrent}
      >
        {/* Badges */}
        {plan.popular && (
          <View style={styles.popularBadge}>
            <Ionicons name="star" size={12} color="#FFFFFF" />
            <Text style={styles.popularBadgeText}>POPULAR</Text>
          </View>
        )}
        {plan.premium && (
          <View style={styles.premiumBadge}>
            <Ionicons name="diamond" size={12} color="#FFFFFF" />
            <Text style={styles.premiumBadgeText}>PREMIUM</Text>
          </View>
        )}
        {isCurrent && (
          <View style={styles.currentBadge}>
            <Ionicons name="checkmark-circle" size={12} color="#FFFFFF" />
            <Text style={styles.currentBadgeText}>CURRENT PLAN</Text>
          </View>
        )}

        {/* Plan Header */}
        <View style={styles.planHeader}>
          <View style={styles.planNameRow}>
            <Text
              style={[
                styles.planName,
                { color: colors.text },
                isSelected && { color: colors.primary },
              ]}
            >
              {plan.name}
            </Text>
            <View
              style={[
                styles.listingsBadge,
                {
                  backgroundColor: isSelected
                    ? colors.primary
                    : `${colors.primary}15`,
                },
              ]}
            >
              <Text
                style={[
                  styles.listingsBadgeText,
                  {
                    color: isSelected ? "#FFFFFF" : colors.primary,
                  },
                ]}
              >
                {plan.listings} listings
              </Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={[styles.currency, { color: colors.textSecondary }]}>
              GHS
            </Text>
            <Text
              style={[
                styles.price,
                { color: colors.text },
                isSelected && { color: colors.primary },
              ]}
            >
              {plan.price}
            </Text>
            <Text style={[styles.duration, { color: colors.textSecondary }]}>
              /{plan.duration}
            </Text>
          </View>
        </View>

        {/* Features */}
        <View
          style={[styles.featuresContainer, { borderTopColor: colors.divider }]}
        >
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View
                style={[
                  styles.featureIcon,
                  {
                    backgroundColor: isSelected
                      ? colors.primary
                      : `${colors.primary}15`,
                  },
                ]}
              >
                <Ionicons
                  name="checkmark"
                  size={12}
                  color={isSelected ? "#FFFFFF" : colors.primary}
                />
              </View>
              <Text
                style={[
                  styles.featureText,
                  {
                    color: isSelected ? colors.text : colors.textSecondary,
                  },
                ]}
              >
                {feature}
              </Text>
            </View>
          ))}
        </View>

        {/* Selection Indicator */}
        <View style={[styles.selectionRow, { borderTopColor: colors.divider }]}>
          <View
            style={[
              styles.radioOuter,
              {
                borderColor: isCurrent
                  ? colors.textSecondary
                  : isSelected
                  ? colors.primary
                  : colors.divider,
              },
            ]}
          >
            {(isSelected || isCurrent) && (
              <View
                style={[
                  styles.radioInner,
                  {
                    backgroundColor: isCurrent
                      ? colors.textSecondary
                      : colors.primary,
                  },
                ]}
              />
            )}
          </View>
          <Text
            style={[
              styles.selectText,
              {
                color: isCurrent
                  ? colors.textSecondary
                  : isSelected
                  ? colors.primary
                  : colors.textSecondary,
              },
              isSelected && { fontWeight: "600" },
              isCurrent && { fontStyle: "italic" },
            ]}
          >
            {isCurrent
              ? "Your current plan"
              : isSelected
              ? "Selected"
              : "Select this plan"}
          </Text>
        </View>
      </TouchableOpacity>
    );
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

        {/* Floating Sticky Header */}
        {/* Floating Header with Blur */}
        <FloatingHeader
          title="Subscription"
          showBackButton
          onBackPress={() => router.back()}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: 80 + insets.top,
              paddingBottom: 120 + insets.bottom,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Current Subscription Card */}
          {CURRENT_SUBSCRIPTION.isActive && (
            <View
              style={[
                styles.currentSubscriptionCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.primary,
                },
              ]}
            >
              <View style={styles.currentSubHeader}>
                <View
                  style={[
                    styles.currentSubIcon,
                    { backgroundColor: `${colors.primary}15` },
                  ]}
                >
                  <Ionicons name="diamond" size={24} color={colors.primary} />
                </View>
                <View style={styles.currentSubInfo}>
                  <Text
                    style={[styles.currentSubTitle, { color: colors.text }]}
                  >
                    {CURRENT_SUBSCRIPTION.plan} Plan
                  </Text>
                  <Text
                    style={[
                      styles.currentSubExpiry,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Expires {CURRENT_SUBSCRIPTION.expiresDate}
                  </Text>
                </View>
                <View
                  style={[
                    styles.currentSubDays,
                    { backgroundColor: `${colors.primary}15` },
                  ]}
                >
                  <Text
                    style={[
                      styles.currentSubDaysValue,
                      { color: colors.primary },
                    ]}
                  >
                    {CURRENT_SUBSCRIPTION.daysRemaining}
                  </Text>
                  <Text
                    style={[
                      styles.currentSubDaysLabel,
                      { color: colors.primary },
                    ]}
                  >
                    days left
                  </Text>
                </View>
              </View>

              {/* Usage Progress */}
              <View
                style={[
                  styles.usageContainer,
                  { borderTopColor: colors.divider },
                ]}
              >
                <View style={styles.usageHeader}>
                  <Text
                    style={[styles.usageLabel, { color: colors.textSecondary }]}
                  >
                    Listings Used
                  </Text>
                  <Text style={[styles.usageValue, { color: colors.text }]}>
                    {CURRENT_SUBSCRIPTION.listingsUsed}/
                    {CURRENT_SUBSCRIPTION.listingsTotal}
                  </Text>
                </View>
                <View
                  style={[styles.usageBar, { backgroundColor: colors.divider }]}
                >
                  <View
                    style={[
                      styles.usageProgress,
                      {
                        width: `${
                          (CURRENT_SUBSCRIPTION.listingsUsed /
                            CURRENT_SUBSCRIPTION.listingsTotal) *
                          100
                        }%`,
                        backgroundColor: colors.primary,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={[styles.title, { color: colors.text }]}>
              {CURRENT_SUBSCRIPTION.isActive
                ? "Upgrade Your Plan"
                : "Choose a Plan"}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Select the best plan for your property listing needs
            </Text>
          </View>

          {/* Plan Cards */}
          <View style={styles.plansContainer}>{PLANS.map(renderPlanCard)}</View>

          {/* Security Note */}
          <View
            style={[
              styles.securityNote,
              { backgroundColor: `${colors.primary}08` },
            ]}
          >
            <Ionicons
              name="shield-checkmark"
              size={20}
              color={colors.primary}
            />
            <Text
              style={[styles.securityNoteText, { color: colors.textSecondary }]}
            >
              Secure payment powered by Paystack. Your payment information is
              encrypted and secure.
            </Text>
          </View>
        </ScrollView>

        {/* Fixed Continue Button */}
        <View
          style={[
            styles.footer,
            {
              paddingBottom: insets.bottom + Spacing.md,
              backgroundColor: colors.background,
              borderTopColor: colors.divider,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedPlan && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!selectedPlan}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                selectedPlan
                  ? [colors.primary, colors.primaryDark]
                  : [colors.divider, colors.divider]
              }
              style={styles.continueButtonGradient}
            >
              <Text style={styles.continueButtonText}>
                {selectedPlan
                  ? `Continue with ${
                      PLANS.find((p) => p.id === selectedPlan)?.name
                    }`
                  : "Select a Plan"}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
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

  // Current Subscription Card
  currentSubscriptionCard: {
    borderRadius: 20,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  currentSubHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  currentSubIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  currentSubInfo: {
    flex: 1,
  },
  currentSubTitle: {
    ...Typography.headlineMedium,
    fontSize: 18,
    fontWeight: "700",
  },
  currentSubExpiry: {
    ...Typography.caption,
    fontSize: 12,
    marginTop: 2,
  },
  currentSubDays: {
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
  },
  currentSubDaysValue: {
    ...Typography.headlineMedium,
    fontSize: 20,
    fontWeight: "700",
  },
  currentSubDaysLabel: {
    ...Typography.caption,
    fontSize: 10,
  },
  usageContainer: {
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  usageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  usageLabel: {
    ...Typography.bodyMedium,
    fontSize: 13,
  },
  usageValue: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
  },
  usageBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  usageProgress: {
    height: "100%",
    borderRadius: 4,
  },

  // Title Section
  titleSection: {
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.headlineLarge,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodyMedium,
    fontSize: 14,
  },

  // Plan Cards
  plansContainer: {
    gap: Spacing.md,
  },
  planCard: {
    borderRadius: 20,
    padding: Spacing.lg,
    borderWidth: 2,
    position: "relative",
    overflow: "hidden",
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
  planCardSelected: {},
  planCardCurrent: {},
  popularBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F59E0B",
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderBottomLeftRadius: 12,
  },
  popularBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  premiumBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#8B5CF6",
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderBottomLeftRadius: 12,
  },
  premiumBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  currentBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#6B7280",
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderBottomLeftRadius: 12,
  },
  currentBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  planHeader: {
    marginBottom: Spacing.lg,
  },
  planNameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  planName: {
    ...Typography.headlineMedium,
    fontSize: 20,
    fontWeight: "700",
  },
  planNameSelected: {},
  listingsBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: 10,
  },
  listingsBadgeSelected: {},
  listingsBadgeText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "600",
  },
  listingsBadgeTextSelected: {},
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  currency: {
    ...Typography.bodyMedium,
    fontSize: 14,
    marginRight: 4,
  },
  price: {
    ...Typography.displayMedium,
    fontSize: 36,
    fontWeight: "700",
  },
  priceSelected: {},
  duration: {
    ...Typography.bodyMedium,
    fontSize: 14,
    marginLeft: 4,
  },
  featuresContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  featureIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  featureIconSelected: {},
  featureText: {
    ...Typography.bodyMedium,
    fontSize: 13,
    flex: 1,
  },
  featureTextSelected: {},
  selectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {},
  radioOuterCurrent: {},
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  radioInnerCurrent: {},
  selectText: {
    ...Typography.bodyMedium,
    fontSize: 13,
  },
  selectTextSelected: {},
  selectTextCurrent: {},

  // Security Note
  securityNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    padding: Spacing.md,
    borderRadius: 12,
  },
  securityNoteText: {
    ...Typography.caption,
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  continueButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md + 2,
  },
  continueButtonText: {
    ...Typography.labelLarge,
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
