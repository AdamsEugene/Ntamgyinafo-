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
import {
  FloatingHeaderStyles,
  HEADER_ICON_SIZE,
} from "@/components/FloatingHeader.styles";

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
          isSelected && styles.planCardSelected,
          plan.isPopular && styles.planCardPopular,
          plan.isPremium && styles.planCardPremium,
        ]}
        onPress={() => handleSelectPlan(plan.id)}
        activeOpacity={0.8}
      >
        {/* Badge */}
        {plan.badge && (
          <View
            style={[
              styles.planBadge,
              { backgroundColor: plan.badgeColor || Colors.primaryGreen },
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
          <View style={styles.currentBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
            <Text style={styles.currentBadgeText}>Current Plan</Text>
          </View>
        )}

        {/* Selection indicator */}
        <View style={styles.selectionIndicator}>
          <View
            style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}
          >
            {isSelected && <View style={styles.radioInner} />}
          </View>
        </View>

        {/* Plan Header */}
        <View style={styles.planHeader}>
          <Text
            style={[styles.planName, isSelected && styles.planNameSelected]}
          >
            {plan.name}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={styles.currency}>GHS</Text>
            <Text style={[styles.price, isSelected && styles.priceSelected]}>
              {plan.price}
            </Text>
            <Text style={styles.duration}>/{plan.duration}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.planDivider} />

        {/* Features */}
        <View style={styles.featuresContainer}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View
                style={[
                  styles.featureIcon,
                  feature.included
                    ? styles.featureIconIncluded
                    : styles.featureIconExcluded,
                ]}
              >
                <Ionicons
                  name={feature.included ? "checkmark" : "close"}
                  size={14}
                  color={feature.included ? Colors.primaryGreen : "#9CA3AF"}
                />
              </View>
              <Text
                style={[
                  styles.featureText,
                  !feature.included && styles.featureTextExcluded,
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
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={[
          FloatingHeaderStyles.floatingHeader,
          { paddingTop: insets.top + Spacing.md },
        ]}
      >
        <TouchableOpacity
          style={FloatingHeaderStyles.backButton}
          onPress={() => router.back()}
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

        <Text style={styles.headerTitle}>Choose Plan</Text>

        <View style={{ width: 44 }} />
      </View>

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
              colors={[Colors.primaryGreen, "#10B981"]}
              style={styles.heroIconGradient}
            >
              <Ionicons name="rocket" size={40} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <Text style={styles.heroTitle}>Unlock Full Access</Text>
          <Text style={styles.heroSubtitle}>
            Get unlimited access to property details, owner contacts, and
            exclusive features
          </Text>
        </View>

        {/* Plans */}
        <View style={styles.plansContainer}>
          {SUBSCRIPTION_PLANS.map(renderPlanCard)}
        </View>

        {/* Features Comparison Note */}
        <View style={styles.comparisonNote}>
          <Ionicons
            name="information-circle"
            size={20}
            color={Colors.textSecondary}
          />
          <Text style={styles.comparisonNoteText}>
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
          { paddingBottom: Math.max(insets.bottom, Spacing.lg) },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedPlan && styles.continueButtonDisabled,
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
            color={Colors.textSecondary}
          />
          <Text style={styles.secureNoteText}>Secure payment via Paystack</Text>
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
