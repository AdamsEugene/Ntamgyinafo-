import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  Dimensions,
  TextInput,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Typography, Spacing } from "@/constants/design";
import { useTheme } from "@/contexts/ThemeContext";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [phone, setPhone] = useState("+233 24 123 4567");
  const [password, setPassword] = useState("password123");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Animation values
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(30)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const demoOpacity = useRef(new Animated.Value(0)).current;
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

    // Demo buttons entrance
    Animated.sequence([
      Animated.delay(650),
      Animated.timing(demoOpacity, {
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
      demoOpacity.stopAnimation();
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
    demoOpacity,
    ring1Scale,
    ring2Scale,
    pulseAnim,
  ]);

  const logoRotation = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["-180deg", "0deg"],
  });

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

  const validatePassword = (pwd: string): boolean => {
    if (!pwd) {
      setPasswordError("Password is required");
      return false;
    }

    if (pwd.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return false;
    }

    setPasswordError("");
    return true;
  };

  const handleLogin = async () => {
    const isPhoneValid = validatePhone(phone);
    const isPasswordValid = validatePassword(password);

    if (!isPhoneValid || !isPasswordValid) {
      return;
    }

    setIsLoading(true);
    try {
      const formattedPhone = phone.replace(/\s+/g, "");
      console.log("Login:", { phone: formattedPhone, password });
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
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
              Sign In
            </Text>
          </View>

          <View style={styles.headerSpacer} />
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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
                  <Ionicons name="home" size={28} color={colors.primary} />
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
                Welcome Back
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Sign in to continue your journey
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
              {/* Phone Number Input */}
              <Text
                style={[styles.inputLabel, { color: colors.textSecondary }]}
              >
                Phone Number
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.divider,
                  },
                  phoneError ? styles.inputContainerError : null,
                ]}
              >
                <Ionicons
                  name="call-outline"
                  size={20}
                  color={colors.textSecondary}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="+233 XX XXX XXXX"
                  placeholderTextColor={colors.textSecondary}
                  value={phone}
                  onChangeText={formatPhoneNumber}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  maxLength={17}
                />
              </View>
              {phoneError ? (
                <Text style={styles.errorText}>{phoneError}</Text>
              ) : null}

              {/* Password Input */}
              <Text
                style={[styles.inputLabel, { color: colors.textSecondary }]}
              >
                Password
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.divider,
                  },
                  passwordError ? styles.inputContainerError : null,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.textSecondary}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) {
                      validatePassword(text);
                    }
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}

              {/* Forgot Password */}
              <TouchableOpacity
                onPress={() => router.push("/(auth)/forgot-password")}
                style={styles.forgotPasswordContainer}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.forgotPasswordText, { color: colors.primary }]}
                >
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              {/* Sign In Button */}
              <TouchableOpacity
                style={[
                  styles.signInButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleLogin}
                activeOpacity={0.9}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Text style={styles.signInButtonText}>Signing in...</Text>
                ) : (
                  <>
                    <Text style={styles.signInButtonText}>Sign In</Text>
                    <View style={styles.buttonIcon}>
                      <Ionicons
                        name="arrow-forward"
                        size={18}
                        color="#FFFFFF"
                      />
                    </View>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Footer */}
            <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
              <Text
                style={[styles.footerText, { color: colors.textSecondary }]}
              >
                Don&apos;t have an account?{" "}
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(auth)/register")}
                activeOpacity={0.7}
              >
                <Text style={[styles.registerLink, { color: colors.primary }]}>
                  Register
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Demo Buttons */}
            <Animated.View
              style={[styles.demoSection, { opacity: demoOpacity }]}
            >
              <View style={styles.demoHeader}>
                <View
                  style={[styles.demoLine, { backgroundColor: colors.divider }]}
                />
                <Text
                  style={[styles.demoTitle, { color: colors.textSecondary }]}
                >
                  Quick Demo Access
                </Text>
                <View
                  style={[styles.demoLine, { backgroundColor: colors.divider }]}
                />
              </View>

              <View style={styles.demoButtons}>
                <TouchableOpacity
                  style={[
                    styles.demoBuyerButton,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.divider,
                    },
                  ]}
                  onPress={() => router.replace("/(tabs)")}
                  activeOpacity={0.8}
                >
                  <View style={styles.demoIconContainer}>
                    <Ionicons name="search" size={18} color={colors.primary} />
                  </View>
                  <Text
                    style={[styles.demoBuyerText, { color: colors.primary }]}
                  >
                    Buyer
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.demoOwnerButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={() => router.replace("/(owner-tabs)")}
                  activeOpacity={0.8}
                >
                  <View style={styles.demoIconContainerFilled}>
                    <Ionicons name="home" size={18} color="#FFFFFF" />
                  </View>
                  <Text style={styles.demoOwnerText}>Owner</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.demoAdminButton}
                  onPress={() => router.replace("/(admin-tabs)")}
                  activeOpacity={0.8}
                >
                  <View style={styles.demoIconContainerAdmin}>
                    <Ionicons name="shield" size={18} color="#FFFFFF" />
                  </View>
                  <Text style={styles.demoAdminText}>Admin</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
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
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing["3xl"],
    zIndex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    minHeight: 500,
    paddingTop: Spacing.lg,
  },
  logoSection: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
    width: 120,
    height: 120,
    alignSelf: "center",
  },
  ring: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1,
  },
  ring1: {
    width: 100,
    height: 100,
    borderColor: "rgba(34, 197, 94, 0.15)",
  },
  ring2: {
    width: 120,
    height: 120,
    borderColor: "rgba(34, 197, 94, 0.08)",
    borderStyle: "dashed",
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(34, 197, 94, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(34, 197, 94, 0.2)",
  },
  titleSection: {
    marginBottom: Spacing.xl,
    alignItems: "center",
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
  inputLabel: {
    ...Typography.labelMedium,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.divider,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  inputContainerError: {
    borderColor: "#EF4444",
  },
  input: {
    flex: 1,
    ...Typography.bodyMedium,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: Spacing.md,
  },
  errorText: {
    ...Typography.caption,
    fontSize: 12,
    color: "#EF4444",
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },
  forgotPasswordText: {
    ...Typography.labelMedium,
    fontSize: 14,
    color: Colors.primaryGreen,
    fontWeight: "600",
  },
  signInButton: {
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
    marginTop: Spacing.sm,
  },
  signInButtonText: {
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
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  footerText: {
    ...Typography.bodyMedium,
    fontSize: 15,
    color: Colors.textSecondary,
  },
  registerLink: {
    ...Typography.bodyMedium,
    fontSize: 15,
    color: Colors.primaryGreen,
    fontWeight: "700",
  },
  demoSection: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    alignItems: "center",
  },
  demoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  demoLine: {
    width: 40,
    height: 1,
    backgroundColor: Colors.divider,
  },
  demoTitle: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  demoButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  demoBuyerButton: {
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(34, 197, 94, 0.25)",
    backgroundColor: Colors.surface,
    minWidth: 80,
  },
  demoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  demoBuyerText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
  demoOwnerButton: {
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 16,
    backgroundColor: Colors.primaryGreen,
    minWidth: 80,
    shadowColor: Colors.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  demoIconContainerFilled: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  demoOwnerText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  demoAdminButton: {
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 16,
    backgroundColor: "#8B5CF6",
    minWidth: 80,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  demoIconContainerAdmin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  demoAdminText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
