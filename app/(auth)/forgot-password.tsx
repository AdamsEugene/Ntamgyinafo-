import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Typography, Spacing } from "@/constants/design";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validatePhone = (phoneNumber: string): boolean => {
    const ghanaPhoneRegex = /^(\+233|0)[2-9]\d{8}$/;
    const cleaned = phoneNumber.replace(/\s+/g, "");

    if (!cleaned) {
      setPhoneError("Phone number is required");
      return false;
    }

    if (!ghanaPhoneRegex.test(cleaned)) {
      setPhoneError("Please enter a valid Ghana phone number");
      return false;
    }

    setPhoneError("");
    return true;
  };

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    let formatted = cleaned;
    if (cleaned.startsWith("233")) {
      formatted = "+" + cleaned;
    } else if (cleaned.startsWith("0")) {
      formatted = "+233" + cleaned.substring(1);
    } else if (cleaned.length > 0 && !cleaned.startsWith("+")) {
      formatted = "+233" + cleaned;
    }

    if (formatted.length > 4) {
      formatted = formatted.substring(0, 4) + " " + formatted.substring(4);
    }
    if (formatted.length > 8) {
      formatted = formatted.substring(0, 8) + " " + formatted.substring(8);
    }
    if (formatted.length > 12) {
      formatted = formatted.substring(0, 12) + " " + formatted.substring(12);
    }

    setPhone(formatted);
    if (phoneError) {
      validatePhone(formatted);
    }
  };

  const handleSendResetCode = async () => {
    if (!validatePhone(phone)) {
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Send reset code to phone
      console.log("Sending reset code to:", phone);
      router.push({
        pathname: "/(auth)/reset-otp",
        params: { phone: phone.replace(/\s+/g, "") },
      });
    } catch (error) {
      console.error("Error sending reset code:", error);
      setPhoneError("Failed to send reset code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Decorative Background Elements */}
        <View style={styles.decorativeBackground}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
        </View>

        <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.backButtonCircle}>
              <Ionicons
                name="arrow-back"
                size={20}
                color={Colors.textPrimary}
              />
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Logo/Branding */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Ionicons
                  name="lock-closed-outline"
                  size={32}
                  color={Colors.primaryGreen}
                />
              </View>
            </View>

            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Enter your phone number and we&apos;ll send you a code to reset
                your password
              </Text>
            </View>

            {/* Form Card */}
            <View style={styles.formCard}>
              <TextInput
                label="Phone Number"
                placeholder="+233 XX XXX XXXX"
                value={phone}
                onChangeText={formatPhoneNumber}
                keyboardType="phone-pad"
                error={phoneError}
                leftIcon="call-outline"
                autoFocus
              />

              <Button
                title="Send Reset Code"
                onPress={handleSendResetCode}
                variant="primary"
                disabled={isLoading || !phone.trim()}
                loading={isLoading}
                style={styles.submitButton}
              />
            </View>

            {/* Footer */}
            <TouchableOpacity
              onPress={() => router.push("/(auth)/login")}
              style={styles.backToLoginButton}
              activeOpacity={0.7}
            >
              <Ionicons
                name="arrow-back"
                size={16}
                color={Colors.primaryGreen}
              />
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    zIndex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing["3xl"],
    zIndex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    minHeight: 500,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.primaryGreen,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  titleSection: {
    marginBottom: Spacing["2xl"],
    alignItems: "center",
  },
  title: {
    ...Typography.headlineMedium,
    fontSize: 32,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    ...Typography.bodyMedium,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  formCard: {
    width: "100%",
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: Spacing.xl,
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
  submitButton: {
    width: "100%",
    marginTop: Spacing.md,
  },
  backToLoginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing["2xl"],
    paddingTop: Spacing.xl,
    gap: Spacing.sm,
  },
  backToLoginText: {
    ...Typography.labelLarge,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
});
