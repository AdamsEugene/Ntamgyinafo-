import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Share,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Typography, Spacing } from "@/constants/design";
import { useTheme } from "@/contexts/ThemeContext";

interface Plan {
  id: string;
  name: string;
  price: number;
  duration: number;
}

const PLANS: Record<string, Plan> = {
  basic: { id: "basic", name: "Basic", price: 30, duration: 30 },
  standard: { id: "standard", name: "Standard", price: 50, duration: 60 },
  premium: { id: "premium", name: "Premium", price: 70, duration: 90 },
};

// Generate a random transaction ID
const generateTransactionId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "TXN-";
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Format date
const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function PaymentReceiptScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const params = useLocalSearchParams();
  const planId = (params.planId as string) || "standard";
  const plan = PLANS[planId] || PLANS.standard;

  const transactionId = generateTransactionId();
  const paymentDate = new Date();
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + plan.duration);

  const handleShareReceipt = async () => {
    try {
      await Share.share({
        message: `Ntamgyinafoɔ Payment Receipt\n\nTransaction ID: ${transactionId}\nPlan: ${
          plan.name
        }\nAmount: GHS ${plan.price}\nDate: ${formatDate(
          paymentDate
        )}\nExpiry: ${formatDate(expiryDate)}`,
        title: "Payment Receipt",
      });
    } catch (error) {
      console.log("Error sharing:", error);
    }
  };

  const handleContinue = () => {
    router.replace("/(tabs)");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}
        <View style={styles.successContainer}>
          <LinearGradient
            colors={[colors.primary, "#10B981"]}
            style={styles.successIconGradient}
          >
            <Ionicons name="checkmark" size={50} color="#FFFFFF" />
          </LinearGradient>
          <Text style={[styles.successTitle, { color: colors.text }]}>
            Payment Successful!
          </Text>
          <Text
            style={[styles.successSubtitle, { color: colors.textSecondary }]}
          >
            Your subscription has been activated
          </Text>
        </View>

        {/* Receipt Card */}
        <View style={[styles.receiptCard, { backgroundColor: colors.surface }]}>
          {/* Receipt Header */}
          <View style={styles.receiptHeader}>
            <View
              style={[
                styles.receiptLogo,
                { backgroundColor: `${colors.primary}15` },
              ]}
            >
              <Ionicons name="home" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.receiptAppName, { color: colors.text }]}>
              Ntamgyinafoɔ
            </Text>
            <Text
              style={[styles.receiptTitle, { color: colors.textSecondary }]}
            >
              Payment Receipt
            </Text>
          </View>

          {/* Dotted Line */}
          <View style={[styles.dottedLine, { borderColor: colors.divider }]} />

          {/* Receipt Details */}
          <View style={styles.receiptDetails}>
            <View style={styles.receiptRow}>
              <Text
                style={[styles.receiptLabel, { color: colors.textSecondary }]}
              >
                Transaction ID
              </Text>
              <Text style={[styles.receiptValue, { color: colors.text }]}>
                {transactionId}
              </Text>
            </View>
            <View style={styles.receiptRow}>
              <Text
                style={[styles.receiptLabel, { color: colors.textSecondary }]}
              >
                Plan
              </Text>
              <Text style={[styles.receiptValue, { color: colors.text }]}>
                {plan.name} Plan
              </Text>
            </View>
            <View style={styles.receiptRow}>
              <Text
                style={[styles.receiptLabel, { color: colors.textSecondary }]}
              >
                Amount Paid
              </Text>
              <Text
                style={[
                  styles.receiptValue,
                  styles.receiptAmount,
                  { color: colors.primary },
                ]}
              >
                GHS {plan.price}
              </Text>
            </View>
            <View style={styles.receiptRow}>
              <Text
                style={[styles.receiptLabel, { color: colors.textSecondary }]}
              >
                Payment Date
              </Text>
              <Text style={[styles.receiptValue, { color: colors.text }]}>
                {formatDate(paymentDate)}
              </Text>
            </View>
            <View style={styles.receiptRow}>
              <Text
                style={[styles.receiptLabel, { color: colors.textSecondary }]}
              >
                Expiry Date
              </Text>
              <Text style={[styles.receiptValue, { color: colors.text }]}>
                {formatDate(expiryDate)}
              </Text>
            </View>
          </View>

          {/* Dotted Line */}
          <View style={[styles.dottedLine, { borderColor: colors.divider }]} />

          {/* Status */}
          <View style={styles.statusContainer}>
            <View style={styles.statusBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.statusText}>Subscription Active</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.shareButton, { borderColor: colors.primary }]}
            onPress={handleShareReceipt}
            activeOpacity={0.8}
          >
            <Ionicons
              name="share-social-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={[styles.shareButtonText, { color: colors.primary }]}>
              Share Receipt
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.downloadButton,
              { backgroundColor: colors.surface, borderColor: colors.divider },
            ]}
            onPress={() => {}}
            activeOpacity={0.8}
          >
            <Ionicons
              name="download-outline"
              size={20}
              color={colors.textSecondary}
            />
            <Text
              style={[
                styles.downloadButtonText,
                { color: colors.textSecondary },
              ]}
            >
              Download PDF
            </Text>
          </TouchableOpacity>
        </View>

        {/* Features Unlocked */}
        <View
          style={[
            styles.featuresContainer,
            { backgroundColor: colors.surface, borderColor: colors.divider },
          ]}
        >
          <Text style={[styles.featuresTitle, { color: colors.text }]}>
            You&apos;ve unlocked:
          </Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: `${colors.primary}15` },
                ]}
              >
                <Ionicons name="eye" size={18} color={colors.primary} />
              </View>
              <Text style={[styles.featureText, { color: colors.text }]}>
                Full property details
              </Text>
            </View>
            <View style={styles.featureItem}>
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: `${colors.primary}15` },
                ]}
              >
                <Ionicons name="call" size={18} color={colors.primary} />
              </View>
              <Text style={[styles.featureText, { color: colors.text }]}>
                Owner contact access
              </Text>
            </View>
            <View style={styles.featureItem}>
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: `${colors.primary}15` },
                ]}
              >
                <Ionicons name="bookmark" size={18} color={colors.primary} />
              </View>
              <Text style={[styles.featureText, { color: colors.text }]}>
                Saved searches
              </Text>
            </View>
            <View style={styles.featureItem}>
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: `${colors.primary}15` },
                ]}
              >
                <Ionicons
                  name="notifications"
                  size={18}
                  color={colors.primary}
                />
              </View>
              <Text style={[styles.featureText, { color: colors.text }]}>
                {plan.duration} days access
              </Text>
            </View>
          </View>
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
          style={[styles.continueButton, { backgroundColor: colors.primary }]}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Start Exploring</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
  },
  // Success Section
  successContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  successIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
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
  successTitle: {
    ...Typography.headlineLarge,
    fontSize: 26,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  successSubtitle: {
    ...Typography.bodyMedium,
    fontSize: 15,
    color: Colors.textSecondary,
  },
  // Receipt Card
  receiptCard: {
    width: "100%",
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  receiptHeader: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  receiptLogo: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  receiptAppName: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  receiptTitle: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  dottedLine: {
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: Colors.divider,
    marginVertical: Spacing.lg,
  },
  receiptDetails: {
    gap: Spacing.md,
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  receiptLabel: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  receiptValue: {
    ...Typography.bodyMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  receiptAmount: {
    color: Colors.primaryGreen,
    fontSize: 16,
    fontWeight: "700",
  },
  statusContainer: {
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  statusText: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    color: "#10B981",
  },
  // Actions
  actionsContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    width: "100%",
    marginBottom: Spacing.xl,
  },
  shareButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    paddingVertical: Spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.primaryGreen,
  },
  shareButtonText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
  downloadButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  downloadButtonText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  // Features Unlocked
  featuresContainer: {
    width: "100%",
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  featuresTitle: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  featuresList: {
    gap: Spacing.md,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  featureText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textPrimary,
    flex: 1,
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
  continueButtonText: {
    ...Typography.labelLarge,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
