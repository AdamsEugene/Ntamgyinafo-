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
import { Colors, Typography, Spacing } from "@/constants/design";
import {
  FloatingHeaderStyles,
  HEADER_ICON_SIZE,
} from "@/components/FloatingHeader.styles";

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
          isSelected && styles.planCardSelected,
          isCurrent && styles.planCardCurrent,
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
              style={[styles.planName, isSelected && styles.planNameSelected]}
            >
              {plan.name}
            </Text>
            <View
              style={[
                styles.listingsBadge,
                isSelected && styles.listingsBadgeSelected,
              ]}
            >
              <Text
                style={[
                  styles.listingsBadgeText,
                  isSelected && styles.listingsBadgeTextSelected,
                ]}
              >
                {plan.listings} listings
              </Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.currency}>GHS</Text>
            <Text style={[styles.price, isSelected && styles.priceSelected]}>
              {plan.price}
            </Text>
            <Text style={styles.duration}>/{plan.duration}</Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View
                style={[
                  styles.featureIcon,
                  isSelected && styles.featureIconSelected,
                ]}
              >
                <Ionicons
                  name="checkmark"
                  size={12}
                  color={isSelected ? "#FFFFFF" : Colors.primaryGreen}
                />
              </View>
              <Text
                style={[
                  styles.featureText,
                  isSelected && styles.featureTextSelected,
                ]}
              >
                {feature}
              </Text>
            </View>
          ))}
        </View>

        {/* Selection Indicator */}
        <View style={styles.selectionRow}>
          <View
            style={[
              styles.radioOuter,
              isSelected && styles.radioOuterSelected,
              isCurrent && styles.radioOuterCurrent,
            ]}
          >
            {(isSelected || isCurrent) && (
              <View
                style={[
                  styles.radioInner,
                  isCurrent && styles.radioInnerCurrent,
                ]}
              />
            )}
          </View>
          <Text
            style={[
              styles.selectText,
              isSelected && styles.selectTextSelected,
              isCurrent && styles.selectTextCurrent,
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
              style={FloatingHeaderStyles.backButton}
              activeOpacity={0.7}
            >
              <View style={FloatingHeaderStyles.backButtonCircle}>
                <Ionicons
                  name="arrow-back"
                  size={HEADER_ICON_SIZE}
                  color={Colors.textPrimary}
                />
              </View>
            </TouchableOpacity>
            <Text style={styles.headerTitleText}>Subscription</Text>
          </View>

          {/* Action Buttons */}
          <View style={FloatingHeaderStyles.headerActions}>
            <TouchableOpacity
              style={FloatingHeaderStyles.actionButton}
              activeOpacity={0.7}
            >
              <View style={FloatingHeaderStyles.actionButtonBackground}>
                <Ionicons
                  name="help-circle-outline"
                  size={HEADER_ICON_SIZE}
                  color={Colors.textPrimary}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

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
            <View style={styles.currentSubscriptionCard}>
              <View style={styles.currentSubHeader}>
                <View style={styles.currentSubIcon}>
                  <Ionicons
                    name="diamond"
                    size={24}
                    color={Colors.primaryGreen}
                  />
                </View>
                <View style={styles.currentSubInfo}>
                  <Text style={styles.currentSubTitle}>
                    {CURRENT_SUBSCRIPTION.plan} Plan
                  </Text>
                  <Text style={styles.currentSubExpiry}>
                    Expires {CURRENT_SUBSCRIPTION.expiresDate}
                  </Text>
                </View>
                <View style={styles.currentSubDays}>
                  <Text style={styles.currentSubDaysValue}>
                    {CURRENT_SUBSCRIPTION.daysRemaining}
                  </Text>
                  <Text style={styles.currentSubDaysLabel}>days left</Text>
                </View>
              </View>

              {/* Usage Progress */}
              <View style={styles.usageContainer}>
                <View style={styles.usageHeader}>
                  <Text style={styles.usageLabel}>Listings Used</Text>
                  <Text style={styles.usageValue}>
                    {CURRENT_SUBSCRIPTION.listingsUsed}/
                    {CURRENT_SUBSCRIPTION.listingsTotal}
                  </Text>
                </View>
                <View style={styles.usageBar}>
                  <View
                    style={[
                      styles.usageProgress,
                      {
                        width: `${
                          (CURRENT_SUBSCRIPTION.listingsUsed /
                            CURRENT_SUBSCRIPTION.listingsTotal) *
                          100
                        }%`,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>
              {CURRENT_SUBSCRIPTION.isActive
                ? "Upgrade Your Plan"
                : "Choose a Plan"}
            </Text>
            <Text style={styles.subtitle}>
              Select the best plan for your property listing needs
            </Text>
          </View>

          {/* Plan Cards */}
          <View style={styles.plansContainer}>{PLANS.map(renderPlanCard)}</View>

          {/* Security Note */}
          <View style={styles.securityNote}>
            <Ionicons
              name="shield-checkmark"
              size={20}
              color={Colors.primaryGreen}
            />
            <Text style={styles.securityNoteText}>
              Secure payment powered by Paystack. Your payment information is
              encrypted and secure.
            </Text>
          </View>
        </ScrollView>

        {/* Fixed Continue Button */}
        <View
          style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}
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
                  ? [Colors.primaryGreen, "#2E7D32"]
                  : [Colors.textSecondary, Colors.textSecondary]
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

  // Current Subscription Card
  currentSubscriptionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.primaryGreen,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryGreen,
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
    backgroundColor: `${Colors.primaryGreen}15`,
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
    color: Colors.textPrimary,
  },
  currentSubExpiry: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  currentSubDays: {
    alignItems: "center",
    backgroundColor: `${Colors.primaryGreen}15`,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
  },
  currentSubDaysValue: {
    ...Typography.headlineMedium,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primaryGreen,
  },
  currentSubDaysLabel: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.primaryGreen,
  },
  usageContainer: {
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  usageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  usageLabel: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  usageValue: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  usageBar: {
    height: 8,
    backgroundColor: Colors.divider,
    borderRadius: 4,
    overflow: "hidden",
  },
  usageProgress: {
    height: "100%",
    backgroundColor: Colors.primaryGreen,
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
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
  },

  // Plan Cards
  plansContainer: {
    gap: Spacing.md,
  },
  planCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.divider,
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
  planCardSelected: {
    borderColor: Colors.primaryGreen,
    backgroundColor: `${Colors.primaryGreen}08`,
  },
  planCardCurrent: {
    borderColor: Colors.textSecondary,
    opacity: 0.7,
  },
  popularBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.accentOrange,
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
    backgroundColor: Colors.textSecondary,
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
    color: Colors.textPrimary,
  },
  planNameSelected: {
    color: Colors.primaryGreen,
  },
  listingsBadge: {
    backgroundColor: `${Colors.primaryGreen}15`,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: 10,
  },
  listingsBadgeSelected: {
    backgroundColor: Colors.primaryGreen,
  },
  listingsBadgeText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
  listingsBadgeTextSelected: {
    color: "#FFFFFF",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  currency: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: 4,
  },
  price: {
    ...Typography.displayMedium,
    fontSize: 36,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  priceSelected: {
    color: Colors.primaryGreen,
  },
  duration: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  featuresContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
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
    backgroundColor: `${Colors.primaryGreen}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  featureIconSelected: {
    backgroundColor: Colors.primaryGreen,
  },
  featureText: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  featureTextSelected: {
    color: Colors.textPrimary,
  },
  selectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.divider,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: Colors.primaryGreen,
  },
  radioOuterCurrent: {
    borderColor: Colors.textSecondary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primaryGreen,
  },
  radioInnerCurrent: {
    backgroundColor: Colors.textSecondary,
  },
  selectText: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  selectTextSelected: {
    color: Colors.primaryGreen,
    fontWeight: "600",
  },
  selectTextCurrent: {
    color: Colors.textSecondary,
    fontStyle: "italic",
  },

  // Security Note
  securityNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    padding: Spacing.md,
    backgroundColor: `${Colors.primaryGreen}08`,
    borderRadius: 12,
  },
  securityNoteText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
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
