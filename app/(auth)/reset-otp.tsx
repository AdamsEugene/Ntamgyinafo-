import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors, Typography, Spacing } from "@/constants/design";
import { Button } from "@/components/ui/Button";
import { OTPInput } from "@/components/ui/OTPInput";

export default function ResetOTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string }>();
  const insets = useSafeAreaInsets();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const phoneNumber = params.phone || "";

  useEffect(() => {
    if (resendCooldown > 0) {
      cooldownTimerRef.current = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, []);

  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\s+/g, "");
    if (cleaned.startsWith("+233")) {
      const rest = cleaned.substring(4);
      if (rest.length >= 2) {
        return `+233 ${rest.substring(0, 2)} ${rest.substring(
          2,
          5
        )} ${rest.substring(5)}`;
      }
      return cleaned;
    }
    return phone;
  };

  const handleOTPComplete = async (code: string) => {
    if (code.length === 4) {
      setIsLoading(true);
      setError("");
      try {
        // TODO: Verify reset OTP with backend
        console.log("Verifying reset OTP:", code);
        router.push({
          pathname: "/(auth)/reset-password",
          params: { phone: phoneNumber },
        });
      } catch {
        setError("Invalid verification code. Please try again.");
        setOtp("");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 4) {
      setError("Please enter the complete verification code");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      // TODO: Verify reset OTP with backend
      console.log("Verifying reset OTP:", otp);
      router.push({
        pathname: "/(auth)/reset-password",
        params: { phone: phoneNumber },
      });
    } catch {
      setError("Invalid verification code. Please try again.");
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setResendCooldown(30);
    setCanResend(false);
    setOtp("");
    setError("");

    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
    }

    cooldownTimerRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    try {
      // TODO: Resend reset OTP
      console.log("Resending reset OTP to:", phoneNumber);
    } catch (err) {
      console.error("Error resending OTP:", err);
      setError("Failed to resend code. Please try again.");
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
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

        <View style={styles.scrollContent}>
          <View style={styles.content}>
            {/* Logo/Branding */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={32}
                  color={Colors.primaryGreen}
                />
              </View>
            </View>

            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>Verify Reset Code</Text>
              <Text style={styles.subtitle}>
                We sent a code to {formatPhoneNumber(phoneNumber)}
              </Text>
            </View>

            {/* Form Card */}
            <View style={styles.formCard}>
              {/* OTP Input */}
              <View style={styles.otpSection}>
                <OTPInput
                  length={4}
                  onComplete={handleOTPComplete}
                  value={otp}
                  onChangeText={setOtp}
                  error={!!error}
                />

                {error && <Text style={styles.errorText}>{error}</Text>}
              </View>

              {/* Resend Section */}
              <View style={styles.resendSection}>
                <Text style={styles.resendText}>Didn&apos;t receive code?</Text>
                {canResend ? (
                  <TouchableOpacity
                    onPress={handleResend}
                    style={styles.resendButton}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.resendButtonText}>Resend</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.resendCooldown}>
                    Resend in {formatTime(resendCooldown)}
                  </Text>
                )}
              </View>

              {/* Verify Button */}
              <Button
                title="Verify"
                onPress={handleVerify}
                variant="primary"
                disabled={otp.length !== 4 || isLoading}
                loading={isLoading}
                style={styles.verifyButton}
              />
            </View>

            {/* Change Phone Number */}
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.changePhoneButton}
              activeOpacity={0.7}
            >
              <Text style={styles.changePhoneText}>Change Phone Number</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
  },
  backButton: {
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
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing["3xl"],
    zIndex: 1,
    justifyContent: "center",
  },
  content: {
    width: "100%",
    alignItems: "center",
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
  otpSection: {
    marginBottom: Spacing.xl,
    alignItems: "center",
  },
  errorText: {
    ...Typography.caption,
    color: "#D32F2F",
    marginTop: Spacing.md,
    textAlign: "center",
  },
  resendSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  resendText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  resendButton: {
    paddingHorizontal: Spacing.sm,
  },
  resendButtonText: {
    ...Typography.labelLarge,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
  resendCooldown: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  verifyButton: {
    width: "100%",
    marginTop: Spacing.md,
  },
  changePhoneButton: {
    alignItems: "center",
    marginTop: Spacing["2xl"],
    paddingTop: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  changePhoneText: {
    ...Typography.labelLarge,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
});
