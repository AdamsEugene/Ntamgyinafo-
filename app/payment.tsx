import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors, Typography, Spacing } from "@/constants/design";
import {
  FloatingHeaderStyles,
  HEADER_ICON_SIZE,
} from "@/components/FloatingHeader.styles";

type PaymentMethod = "momo" | "card";
type MomoNetwork = "mtn" | "vodafone" | "airteltigo";

interface Plan {
  id: string;
  name: string;
  price: number;
  duration: string;
}

const PLANS: Record<string, Plan> = {
  basic: { id: "basic", name: "Basic", price: 30, duration: "30 days" },
  standard: {
    id: "standard",
    name: "Standard",
    price: 50,
    duration: "60 days",
  },
  premium: { id: "premium", name: "Premium", price: 70, duration: "90 days" },
};

const MOMO_NETWORKS = [
  { id: "mtn", name: "MTN Mobile Money", color: "#FFCB05" },
  { id: "vodafone", name: "Vodafone Cash", color: "#E60000" },
  { id: "airteltigo", name: "AirtelTigo Money", color: "#FF0000" },
];

export default function PaymentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const planId = (params.planId as string) || "standard";
  const plan = PLANS[planId] || PLANS.standard;

  // State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("momo");
  const [momoNetwork, setMomoNetwork] = useState<MomoNetwork>("mtn");
  const [momoNumber, setMomoNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Format card number with spaces
  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, "").replace(/\D/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    return formatted.substring(0, 19);
  };

  // Format expiry date
  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + "/" + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  // Validate form
  const isFormValid = useCallback(() => {
    if (paymentMethod === "momo") {
      return momoNumber.length >= 10;
    } else {
      return (
        cardNumber.replace(/\s/g, "").length >= 16 &&
        expiryDate.length === 5 &&
        cvv.length >= 3 &&
        cardholderName.length > 0
      );
    }
  }, [paymentMethod, momoNumber, cardNumber, expiryDate, cvv, cardholderName]);

  // Handle payment
  const handlePayment = async () => {
    if (!isFormValid()) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate occasional payment failure (10% chance for demo)
      // In production, this would be replaced with actual Paystack integration
      const shouldFail = Math.random() < 0.1;

      if (shouldFail) {
        throw new Error(
          "Payment failed. Please check your details and try again."
        );
      }

      setIsProcessing(false);
      setShowSuccess(true);

      // Navigate to receipt after showing success
      setTimeout(() => {
        router.push({
          pathname: "/payment-receipt",
          params: { planId: plan.id },
        });
      }, 1500);
    } catch (err) {
      setIsProcessing(false);
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      );
    }
  };

  // Dismiss error
  const dismissError = () => {
    setError(null);
  };

  // Success overlay
  if (showSuccess) {
    return (
      <View style={styles.successOverlay}>
        <StatusBar style="light" />
        <View style={styles.successContent}>
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark" size={60} color="#FFFFFF" />
          </View>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successSubtitle}>
            Redirecting to your receipt...
          </Text>
        </View>
      </View>
    );
  }

  // Error modal
  const renderErrorModal = () => (
    <Modal
      visible={!!error}
      transparent
      animationType="fade"
      onRequestClose={dismissError}
    >
      <View style={styles.errorModalOverlay}>
        <View style={styles.errorModalContent}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="alert-circle" size={50} color="#EF4444" />
          </View>
          <Text style={styles.errorTitle}>Payment Failed</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={dismissError}
            activeOpacity={0.8}
          >
            <Text style={styles.errorButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Decorative Background Elements */}
      <View style={styles.decorativeBackground}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
      </View>

      {/* Error Modal */}
      {renderErrorModal()}

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

        <Text style={styles.headerTitle}>Payment</Text>

        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 80 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Selected Plan Card */}
          <View style={styles.planCard}>
            <View style={styles.planCardHeader}>
              <Text style={styles.planCardTitle}>Selected Plan</Text>
              <TouchableOpacity
                onPress={() => router.back()}
                activeOpacity={0.7}
              >
                <Text style={styles.changeLink}>Change</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.planCardContent}>
              <View style={styles.planInfo}>
                <Text style={styles.planName}>{plan.name} Plan</Text>
                <Text style={styles.planDuration}>{plan.duration} access</Text>
              </View>
              <Text style={styles.planPrice}>GHS {plan.price}</Text>
            </View>
          </View>

          {/* Payment Method Selection */}
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          <View style={styles.methodsContainer}>
            <TouchableOpacity
              style={[
                styles.methodCard,
                paymentMethod === "momo" && styles.methodCardSelected,
              ]}
              onPress={() => setPaymentMethod("momo")}
              activeOpacity={0.8}
            >
              <View style={styles.methodIconContainer}>
                <Ionicons
                  name="phone-portrait"
                  size={24}
                  color={
                    paymentMethod === "momo"
                      ? Colors.primaryGreen
                      : Colors.textSecondary
                  }
                />
              </View>
              <Text
                style={[
                  styles.methodText,
                  paymentMethod === "momo" && styles.methodTextSelected,
                ]}
              >
                Mobile Money
              </Text>
              {paymentMethod === "momo" && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={Colors.primaryGreen}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodCard,
                paymentMethod === "card" && styles.methodCardSelected,
              ]}
              onPress={() => setPaymentMethod("card")}
              activeOpacity={0.8}
            >
              <View style={styles.methodIconContainer}>
                <Ionicons
                  name="card"
                  size={24}
                  color={
                    paymentMethod === "card"
                      ? Colors.primaryGreen
                      : Colors.textSecondary
                  }
                />
              </View>
              <Text
                style={[
                  styles.methodText,
                  paymentMethod === "card" && styles.methodTextSelected,
                ]}
              >
                Visa / Mastercard
              </Text>
              {paymentMethod === "card" && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={Colors.primaryGreen}
                />
              )}
            </TouchableOpacity>
          </View>

          {/* Payment Form */}
          {paymentMethod === "momo" ? (
            <View style={styles.formContainer}>
              <Text style={styles.inputLabel}>Select Network</Text>
              <View style={styles.networkContainer}>
                {MOMO_NETWORKS.map((network) => (
                  <TouchableOpacity
                    key={network.id}
                    style={[
                      styles.networkCard,
                      momoNetwork === network.id && styles.networkCardSelected,
                    ]}
                    onPress={() => setMomoNetwork(network.id as MomoNetwork)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.networkDot,
                        { backgroundColor: network.color },
                      ]}
                    />
                    <Text
                      style={[
                        styles.networkText,
                        momoNetwork === network.id &&
                          styles.networkTextSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {network.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputPrefix}>+233</Text>
                <TextInput
                  style={styles.input}
                  placeholder="XX XXX XXXX"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="phone-pad"
                  value={momoNumber}
                  onChangeText={setMomoNumber}
                  maxLength={10}
                />
              </View>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="card-outline"
                  size={20}
                  color={Colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="number-pad"
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                  maxLength={19}
                />
              </View>

              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Expiry Date</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="MM/YY"
                      placeholderTextColor={Colors.textSecondary}
                      keyboardType="number-pad"
                      value={expiryDate}
                      onChangeText={(text) =>
                        setExpiryDate(formatExpiryDate(text))
                      }
                      maxLength={5}
                    />
                  </View>
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>CVV</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="123"
                      placeholderTextColor={Colors.textSecondary}
                      keyboardType="number-pad"
                      value={cvv}
                      onChangeText={setCvv}
                      maxLength={4}
                      secureTextEntry
                    />
                  </View>
                </View>
              </View>

              <Text style={styles.inputLabel}>Cardholder Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={Colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor={Colors.textSecondary}
                  autoCapitalize="words"
                  value={cardholderName}
                  onChangeText={setCardholderName}
                />
              </View>
            </View>
          )}

          {/* Security Badges */}
          <View style={styles.securityContainer}>
            <View style={styles.securityBadge}>
              <Ionicons
                name="shield-checkmark"
                size={16}
                color={Colors.primaryGreen}
              />
              <Text style={styles.securityText}>SSL Secured</Text>
            </View>
            <View style={styles.securityBadge}>
              <Ionicons
                name="lock-closed"
                size={16}
                color={Colors.primaryGreen}
              />
              <Text style={styles.securityText}>Powered by Paystack</Text>
            </View>
          </View>

          {/* Bottom padding */}
          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Fixed Bottom Button */}
      <View
        style={[
          styles.bottomContainer,
          { paddingBottom: Math.max(insets.bottom, Spacing.lg) },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.payButton,
            (!isFormValid() || isProcessing) && styles.payButtonDisabled,
          ]}
          onPress={handlePayment}
          activeOpacity={0.8}
          disabled={!isFormValid() || isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="lock-closed" size={18} color="#FFFFFF" />
              <Text style={styles.payButtonText}>Pay GHS {plan.price}</Text>
            </>
          )}
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  // Plan Card
  planCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
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
  planCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  planCardTitle: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  changeLink: {
    ...Typography.labelMedium,
    fontSize: 13,
    color: Colors.primaryGreen,
    fontWeight: "600",
  },
  planCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    ...Typography.titleLarge,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  planDuration: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  planPrice: {
    ...Typography.headlineMedium,
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primaryGreen,
  },
  // Section
  sectionTitle: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  // Payment Methods
  methodsContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  methodCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.divider,
  },
  methodCardSelected: {
    borderColor: Colors.primaryGreen,
    backgroundColor: "rgba(34, 197, 94, 0.05)",
  },
  methodIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    justifyContent: "center",
    alignItems: "center",
  },
  methodText: {
    ...Typography.labelMedium,
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  methodTextSelected: {
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  // Form
  formContainer: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    ...Typography.labelMedium,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.divider,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  inputPrefix: {
    ...Typography.bodyMedium,
    fontSize: 15,
    color: Colors.textSecondary,
  },
  input: {
    flex: 1,
    ...Typography.bodyMedium,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: Spacing.md,
  },
  rowInputs: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  // Network Selection
  networkContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  networkCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.divider,
  },
  networkCardSelected: {
    borderColor: Colors.primaryGreen,
    backgroundColor: "rgba(34, 197, 94, 0.05)",
  },
  networkDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  networkText: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textSecondary,
    flex: 1,
  },
  networkTextSelected: {
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  // Security
  securityContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.lg,
    marginTop: Spacing.md,
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  securityText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
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
  payButton: {
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
  payButtonDisabled: {
    backgroundColor: Colors.divider,
    shadowOpacity: 0,
    elevation: 0,
  },
  payButtonText: {
    ...Typography.labelLarge,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  // Success Overlay
  successOverlay: {
    flex: 1,
    backgroundColor: Colors.primaryGreen,
    justifyContent: "center",
    alignItems: "center",
  },
  successContent: {
    alignItems: "center",
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  successTitle: {
    ...Typography.headlineLarge,
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: Spacing.sm,
  },
  successSubtitle: {
    ...Typography.bodyMedium,
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.8)",
  },
  // Error Modal
  errorModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  errorModalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: Spacing.xl,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  errorTitle: {
    ...Typography.headlineMedium,
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  errorMessage: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  errorButton: {
    backgroundColor: Colors.primaryGreen,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl * 2,
    borderRadius: 14,
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
  errorButtonText: {
    ...Typography.labelLarge,
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
