import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Typography, Spacing } from "@/constants/design";
import { useTheme } from "@/contexts/ThemeContext";
import { FloatingHeader } from "@/components/FloatingHeader";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  badge?: string;
  badgeColor?: string;
  badgeIcon?: keyof typeof Ionicons.glyphMap;
  features: PlanFeature[];
  isPopular?: boolean;
  isPremium?: boolean;
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 30,
    duration: "month",
    features: [
      { text: "Full property details", included: true },
      { text: "2 owner contacts", included: true },
      { text: "30 days access", included: true },
      { text: "Saved searches", included: false },
      { text: "Early notifications", included: false },
    ],
  },
  {
    id: "standard",
    name: "Standard",
    price: 50,
    duration: "month",
    badge: "POPULAR",
    badgeColor: "#F59E0B",
    badgeIcon: "star",
    isPopular: true,
    features: [
      { text: "Full property details", included: true },
      { text: "5 owner contacts", included: true },
      { text: "60 days access", included: true },
      { text: "Saved searches", included: true },
      { text: "Early notifications", included: false },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 70,
    duration: "month",
    badge: "PREMIUM",
    badgeColor: "#8B5CF6",
    badgeIcon: "diamond",
    isPremium: true,
    features: [
      { text: "Full property details", included: true },
      { text: "Unlimited owner contacts", included: true },
      { text: "90 days access", included: true },
      { text: "Saved searches", included: true },
      { text: "Early notifications", included: true },
      { text: "Priority support", included: true },
    ],
  },
];

// Mock current subscription (null = no subscription)
const CURRENT_PLAN: string | null = null;

export default function SubscriptionPlansScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(
    CURRENT_PLAN || "standard"
  );

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleContinue = () => {
    if (selectedPlan) {
      router.push({
        pathname: "/payment",
        params: { planId: selectedPlan },
      });
    }
  };

  const renderPlanCard = (plan: SubscriptionPlan) => {
    const isSelected = selectedPlan === plan.id;
    const isCurrent = CURRENT_PLAN === plan.id;

    return (
      <TouchableOpacity
        key={plan.id}
        style={[
          styles.planCard,
          { backgroundColor: colors.surface, borderColor: colors.divider },
          isSelected && {
            borderColor: colors.primary,
            backgroundColor: `${colors.primary}08`,
          },
          plan.isPopular && { borderColor: "#F59E0B" },
          plan.isPremium && { borderColor: "#8B5CF6" },
        ]}
        onPress={() => handleSelectPlan(plan.id)}
        activeOpacity={0.8}
      >
        {/* Badge */}
        {plan.badge && (
          <View
            style={[
              styles.planBadge,
              { backgroundColor: plan.badgeColor || colors.primary },
            ]}
          >
            {plan.badgeIcon && (
              <Ionicons name={plan.badgeIcon} size={12} color="#FFFFFF" />
            )}
            <Text style={styles.planBadgeText}>{plan.badge}</Text>
          </View>
        )}

        {/* Current Plan Badge */}
        {isCurrent && (
          <View
            style={[styles.currentBadge, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
            <Text style={styles.currentBadgeText}>Current Plan</Text>
          </View>
        )}

        {/* Selection indicator */}
        <View style={styles.selectionIndicator}>
          <View
            style={[
              styles.radioOuter,
              { borderColor: colors.divider },
              isSelected && { borderColor: colors.primary },
            ]}
          >
            {isSelected && (
              <View
                style={[styles.radioInner, { backgroundColor: colors.primary }]}
              />
            )}
          </View>
        </View>

        {/* Plan Header */}
        <View style={styles.planHeader}>
          <Text
            style={[
              styles.planName,
              { color: colors.text },
              isSelected && { color: colors.primary },
            ]}
          >
            {plan.name}
          </Text>
          <View style={styles.priceContainer}>
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

        {/* Divider */}
        <View
          style={[styles.planDivider, { backgroundColor: colors.divider }]}
        />

        {/* Features */}
        <View style={styles.featuresContainer}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View
                style={[
                  styles.featureIcon,
                  feature.included
                    ? { backgroundColor: `${colors.primary}15` }
                    : { backgroundColor: `${colors.textSecondary}15` },
                ]}
              >
                <Ionicons
                  name={feature.included ? "checkmark" : "close"}
                  size={14}
                  color={
                    feature.included ? colors.primary : colors.textSecondary
                  }
                />
              </View>
              <Text
                style={[
                  styles.featureText,
                  { color: colors.text },
                  !feature.included && { color: colors.textSecondary },
                ]}
              >
                {feature.text}
              </Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      {/* Decorative Background Elements */}
      <View style={styles.decorativeBackground}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
      </View>

      {/* Floating Header with Blur */}
      <FloatingHeader
        title="Choose Plan"
        showBackButton
        onBackPress={() => router.back()}
      />

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIconContainer}>
            <LinearGradient
              colors={[colors.primary, "#10B981"]}
              style={styles.heroIconGradient}
            >
              <Ionicons name="rocket" size={40} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            Unlock Full Access
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            Get unlimited access to property details, owner contacts, and
            exclusive features
          </Text>
        </View>

        {/* Plans */}
        <View style={styles.plansContainer}>
          {SUBSCRIPTION_PLANS.map(renderPlanCard)}
        </View>

        {/* Features Comparison Note */}
        <View
          style={[
            styles.comparisonNote,
            { backgroundColor: `${colors.textSecondary}15` },
          ]}
        >
          <Ionicons
            name="information-circle"
            size={20}
            color={colors.textSecondary}
          />
          <Text
            style={[styles.comparisonNoteText, { color: colors.textSecondary }]}
          >
            All plans include basic property browsing and search functionality
          </Text>
        </View>

        {/* Bottom padding */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View
        style={[
          styles.bottomContainer,
          {
            paddingBottom: Math.max(insets.bottom, Spacing.lg),
            backgroundColor: colors.background,
            borderTopColor: colors.divider,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.continueButton,
            { backgroundColor: colors.primary },
            !selectedPlan && { backgroundColor: colors.divider },
          ]}
          onPress={handleContinue}
          activeOpacity={0.8}
          disabled={!selectedPlan}
        >
          <Text style={styles.continueButtonText}>
            Continue with{" "}
            {SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlan)?.name ||
              "Plan"}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Secure payment note */}
        <View style={styles.secureNote}>
          <Ionicons
            name="shield-checkmark"
            size={16}
            color={colors.textSecondary}
          />
          <Text
            style={[styles.secureNoteText, { color: colors.textSecondary }]}
          >
            Secure payment via Paystack
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  decorativeBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  circle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.primaryGreen,
    opacity: 0.05,
    top: -100,
    right: -100,
  },
  circle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.primaryGreen,
    opacity: 0.05,
    bottom: 200,
    left: -50,
  },
  headerTitle: {
    ...Typography.headlineMedium,
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  // Hero Section
  heroSection: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  heroIconContainer: {
    marginBottom: Spacing.lg,
  },
  heroIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  heroTitle: {
    ...Typography.headlineLarge,
    fontSize: 28,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  heroSubtitle: {
    ...Typography.bodyMedium,
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 300,
  },
  // Plans
  plansContainer: {
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  planCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.divider,
    position: "relative",
    overflow: "hidden",
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
  planCardSelected: {
    borderColor: Colors.primaryGreen,
    backgroundColor: "rgba(34, 197, 94, 0.03)",
  },
  planCardPopular: {
    borderColor: "#F59E0B",
  },
  planCardPremium: {
    borderColor: "#8B5CF6",
  },
  planBadge: {
    position: "absolute",
    top: 0,
    right: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  planBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  currentBadge: {
    position: "absolute",
    top: 0,
    left: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.primaryGreen,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  currentBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  selectionIndicator: {
    position: "absolute",
    top: Spacing.lg,
    left: Spacing.lg,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.divider,
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterSelected: {
    borderColor: Colors.primaryGreen,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primaryGreen,
  },
  planHeader: {
    alignItems: "center",
    marginBottom: Spacing.md,
    paddingTop: Spacing.sm,
  },
  planName: {
    ...Typography.titleLarge,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  planNameSelected: {
    color: Colors.primaryGreen,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  currency: {
    ...Typography.bodyMedium,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginRight: 2,
  },
  price: {
    ...Typography.displayLarge,
    fontSize: 42,
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
    marginLeft: 2,
  },
  planDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.md,
  },
  featuresContainer: {
    gap: Spacing.sm,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  featureIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  featureIconIncluded: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
  },
  featureIconExcluded: {
    backgroundColor: "rgba(156, 163, 175, 0.1)",
  },
  featureText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textPrimary,
    flex: 1,
  },
  featureTextExcluded: {
    color: Colors.textSecondary,
    textDecorationLine: "line-through",
  },
  // Comparison Note
  comparisonNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    backgroundColor: "rgba(156, 163, 175, 0.1)",
    padding: Spacing.md,
    borderRadius: 16,
  },
  comparisonNoteText: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  // Bottom Container
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primaryGreen,
    paddingVertical: Spacing.md,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  continueButtonDisabled: {
    backgroundColor: Colors.divider,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    ...Typography.labelLarge,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  secureNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  secureNoteText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
