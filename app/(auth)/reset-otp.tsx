import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors, Typography, Spacing } from "@/constants/design";
import { useTheme } from "@/contexts/ThemeContext";
import { OTPInput } from "@/components/ui/OTPInput";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ResetOTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string }>();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const phoneNumber = params.phone || "";

  // Animation values
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(30)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const ring1Scale = useRef(new Animated.Value(0)).current;
  const ring2Scale = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Header fade in
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Logo entrance
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Rings entrance
    Animated.stagger(80, [
      Animated.spring(ring1Scale, {
        toValue: 1,
        tension: 30,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(ring2Scale, {
        toValue: 1,
        tension: 30,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Title entrance
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(titleTranslateY, {
          toValue: 0,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Form entrance
    Animated.sequence([
      Animated.delay(350),
      Animated.parallel([
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(formTranslateY, {
          toValue: 0,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Footer entrance
    Animated.sequence([
      Animated.delay(500),
      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => {
      headerOpacity.stopAnimation();
      logoScale.stopAnimation();
      logoRotate.stopAnimation();
      titleOpacity.stopAnimation();
      titleTranslateY.stopAnimation();
      formOpacity.stopAnimation();
      formTranslateY.stopAnimation();
      footerOpacity.stopAnimation();
      ring1Scale.stopAnimation();
      ring2Scale.stopAnimation();
      pulseAnim.stopAnimation();
    };
  }, [
    headerOpacity,
    logoScale,
    logoRotate,
    titleOpacity,
    titleTranslateY,
    formOpacity,
    formTranslateY,
    footerOpacity,
    ring1Scale,
    ring2Scale,
    pulseAnim,
  ]);

  const logoRotation = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["-180deg", "0deg"],
  });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <StatusBar style={isDark ? "light" : "dark"} />
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
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
          <View
            style={[
              styles.circle3,
              { backgroundColor: colors.primary, opacity: 0.03 },
            ]}
          />
        </View>

        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            { paddingTop: insets.top + Spacing.md, opacity: headerOpacity },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.backButtonCircle,
                { backgroundColor: colors.surface },
              ]}
            >
              <Ionicons name="arrow-back" size={20} color={colors.text} />
            </View>
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Verify Code
            </Text>
          </View>

          <View style={styles.headerSpacer} />
        </Animated.View>

        <View style={styles.scrollContent}>
          <View style={styles.content}>
            {/* Logo Section */}
            <View style={styles.logoSection}>
              {/* Animated Rings */}
              <Animated.View
                style={[
                  styles.ring,
                  styles.ring2,
                  {
                    transform: [{ scale: ring2Scale }, { scale: pulseAnim }],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.ring,
                  styles.ring1,
                  {
                    transform: [{ scale: ring1Scale }],
                  },
                ]}
              />

              {/* Logo */}
              <Animated.View
                style={[
                  styles.logoCircle,
                  {
                    transform: [{ scale: logoScale }, { rotate: logoRotation }],
                    backgroundColor: colors.surface,
                  },
                ]}
              >
                <View style={styles.logoInner}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={32}
                    color={colors.primary}
                  />
                </View>
              </Animated.View>
            </View>

            {/* Title Section */}
            <Animated.View
              style={[
                styles.titleSection,
                {
                  opacity: titleOpacity,
                  transform: [{ translateY: titleTranslateY }],
                },
              ]}
            >
              <Text style={[styles.title, { color: colors.text }]}>
                Verify Reset Code
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                We sent a code to {formatPhoneNumber(phoneNumber)}
              </Text>
            </Animated.View>

            {/* Form Card */}
            <Animated.View
              style={[
                styles.formCard,
                {
                  opacity: formOpacity,
                  transform: [{ translateY: formTranslateY }],
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
            >
              {/* OTP Input */}
              <View style={styles.otpContainer}>
                <OTPInput
                  length={4}
                  value={otp}
                  onChangeText={setOtp}
                  onComplete={handleOTPComplete}
                  error={!!error}
                  colors={colors}
                />
              </View>

              {/* Error Message */}
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              {/* Resend Section */}
              <View style={styles.resendContainer}>
                <Text
                  style={[styles.resendText, { color: colors.textSecondary }]}
                >
                  Didn&apos;t receive code?{" "}
                </Text>
                {canResend ? (
                  <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                    <Text
                      style={[styles.resendButton, { color: colors.primary }]}
                    >
                      Resend
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text
                    style={[styles.resendCooldown, { color: colors.primary }]}
                  >
                    Resend in {formatTime(resendCooldown)}
                  </Text>
                )}
              </View>

              {/* Verify Button */}
              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  { backgroundColor: colors.primary },
                  (otp.length !== 4 || isLoading) &&
                    styles.verifyButtonDisabled,
                ]}
                onPress={handleVerify}
                activeOpacity={0.9}
                disabled={otp.length !== 4 || isLoading}
              >
                <Text style={styles.verifyButtonText}>
                  {isLoading ? "Verifying..." : "Verify"}
                </Text>
                {!isLoading && (
                  <View style={styles.buttonIcon}>
                    <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Change Phone Number */}
            <Animated.View style={{ opacity: footerOpacity }}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.changePhoneContainer}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="pencil-outline"
                  size={16}
                  color={colors.primary}
                />
                <Text
                  style={[styles.changePhoneText, { color: colors.primary }]}
                >
                  Change Phone Number
                </Text>
              </TouchableOpacity>
            </Animated.View>
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
    top: -120,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: Colors.primaryLight,
    opacity: 0.08,
  },
  circle2: {
    position: "absolute",
    bottom: -180,
    left: -120,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: Colors.primaryGreen,
    opacity: 0.05,
  },
  circle3: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.45,
    right: -60,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Colors.primaryGreen,
    opacity: 0.03,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
  },
  backButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    ...Typography.labelLarge,
    fontSize: 17,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  headerSpacer: {
    width: 44,
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
  logoSection: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
    width: 130,
    height: 130,
  },
  ring: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1,
  },
  ring1: {
    width: 110,
    height: 110,
    borderColor: "rgba(34, 197, 94, 0.15)",
  },
  ring2: {
    width: 130,
    height: 130,
    borderColor: "rgba(34, 197, 94, 0.08)",
    borderStyle: "dashed",
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primaryGreen,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  logoInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(34, 197, 94, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(34, 197, 94, 0.2)",
  },
  titleSection: {
    marginBottom: Spacing.xl,
    alignItems: "center",
    width: "100%",
  },
  title: {
    ...Typography.headlineMedium,
    fontSize: 28,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    ...Typography.bodyMedium,
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  formCard: {
    width: "100%",
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: Spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.03)",
  },
  otpContainer: {
    width: "100%",
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  errorText: {
    ...Typography.caption,
    color: "#EF4444",
    marginBottom: Spacing.md,
    textAlign: "center",
    fontSize: 13,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  resendText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  resendButton: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.primaryGreen,
    fontWeight: "600",
  },
  resendCooldown: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  verifyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primaryGreen,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: 16,
    gap: Spacing.md,
    shadowColor: Colors.primaryGreen,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  verifyButtonDisabled: {
    backgroundColor: Colors.divider,
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyButtonText: {
    ...Typography.labelLarge,
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  buttonIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  changePhoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  changePhoneText: {
    ...Typography.labelMedium,
    fontSize: 14,
    color: Colors.primaryGreen,
    fontWeight: "600",
  },
});
