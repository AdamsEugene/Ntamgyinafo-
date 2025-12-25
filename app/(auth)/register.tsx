import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Linking,
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

type Role = "buyer" | "owner" | null;

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [fullName, setFullName] = useState("John Doe");
  const [phone, setPhone] = useState("+233 24 123 4567");
  const [password, setPassword] = useState("password123");
  const [confirmPassword, setConfirmPassword] = useState("password123");
  const [role, setRole] = useState<Role>("buyer");

  const [fullNameError, setFullNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [roleError, setRoleError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const validateFullName = (name: string): boolean => {
    if (!name.trim()) {
      setFullNameError("Full name is required");
      return false;
    }
    if (name.trim().length < 2) {
      setFullNameError("Full name must be at least 2 characters");
      return false;
    }
    setFullNameError("");
    return true;
  };

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

  const validateConfirmPassword = (
    confirmPwd: string,
    pwd: string
  ): boolean => {
    if (!confirmPwd) {
      setConfirmPasswordError("Please confirm your password");
      return false;
    }

    if (confirmPwd !== pwd) {
      setConfirmPasswordError("Passwords do not match");
      return false;
    }

    setConfirmPasswordError("");
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

  const handleContinue = () => {
    const isFullNameValid = validateFullName(fullName);
    const isPhoneValid = validatePhone(phone);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(
      confirmPassword,
      password
    );
    const isRoleValid = role !== null;

    if (!isRoleValid) {
      setRoleError("Please select your role");
    } else {
      setRoleError("");
    }

    if (
      !isFullNameValid ||
      !isPhoneValid ||
      !isPasswordValid ||
      !isConfirmPasswordValid ||
      !isRoleValid
    ) {
      return;
    }

    router.push({
      pathname: "/(auth)/otp-verification",
      params: {
        phone: phone.replace(/\s+/g, ""),
        fullName: fullName.trim(),
        role: role!,
        password: password,
      },
    });
  };

  const isFormValid = () => {
    return (
      fullName.trim().length >= 2 &&
      phone.replace(/\s+/g, "").length > 0 &&
      password.length >= 6 &&
      confirmPassword === password &&
      role !== null &&
      !fullNameError &&
      !phoneError &&
      !passwordError &&
      !confirmPasswordError
    );
  };

  const handleTermsPress = () => {
    Linking.openURL("https://ntamgyinafo.app/terms");
  };

  const handlePrivacyPress = () => {
    Linking.openURL("https://ntamgyinafo.app/privacy");
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
              Create Account
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
                  <Ionicons
                    name="person-add"
                    size={28}
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
                Join Ntamgyinafoɔ
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Create your account to get started
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
              {/* Full Name Input */}
              <Text
                style={[styles.inputLabel, { color: colors.textSecondary }]}
              >
                Full Name
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.divider,
                  },
                  fullNameError ? styles.inputContainerError : null,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={colors.textSecondary}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.textSecondary}
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    if (fullNameError) {
                      validateFullName(text);
                    }
                  }}
                  autoCapitalize="words"
                />
              </View>
              {fullNameError ? (
                <Text style={styles.errorText}>{fullNameError}</Text>
              ) : null}

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
                  placeholder="Create password (min 6 characters)"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) {
                      validatePassword(text);
                    }
                    if (confirmPassword && confirmPasswordError) {
                      validateConfirmPassword(confirmPassword, text);
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

              {/* Confirm Password Input */}
              <Text
                style={[styles.inputLabel, { color: colors.textSecondary }]}
              >
                Confirm Password
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.divider,
                  },
                  confirmPasswordError ? styles.inputContainerError : null,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.textSecondary}
                />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Re-enter password"
                  placeholderTextColor={colors.textSecondary}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (confirmPasswordError || text) {
                      validateConfirmPassword(text, password);
                    }
                  }}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-off-outline" : "eye-outline"
                    }
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {confirmPasswordError ? (
                <Text style={styles.errorText}>{confirmPasswordError}</Text>
              ) : null}

              {/* Role Selection */}
              <View style={styles.roleSection}>
                <Text style={[styles.roleTitle, { color: colors.text }]}>
                  I am a:
                </Text>
                {roleError ? (
                  <Text style={styles.roleError}>{roleError}</Text>
                ) : null}

                <View style={styles.roleOptions}>
                  <TouchableOpacity
                    style={[
                      styles.roleCard,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.divider,
                      },
                      role === "buyer" && [
                        styles.roleCardSelected,
                        { borderColor: colors.primary },
                      ],
                    ]}
                    onPress={() => {
                      setRole("buyer");
                      setRoleError("");
                    }}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.roleIconContainer,
                        role === "buyer" && styles.roleIconContainerSelected,
                      ]}
                    >
                      <Ionicons
                        name="search"
                        size={24}
                        color={
                          role === "buyer"
                            ? colors.primary
                            : colors.textSecondary
                        }
                      />
                    </View>
                    <Text
                      style={[
                        styles.roleCardText,
                        { color: colors.textSecondary },
                        role === "buyer" && [
                          styles.roleCardTextSelected,
                          { color: colors.text },
                        ],
                      ]}
                    >
                      Buyer / Tenant
                    </Text>
                    {role === "buyer" && (
                      <View
                        style={[
                          styles.roleCheckmark,
                          { backgroundColor: colors.primary },
                        ]}
                      >
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.roleCard,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.divider,
                      },
                      role === "owner" && [
                        styles.roleCardSelected,
                        { borderColor: colors.primary },
                      ],
                    ]}
                    onPress={() => {
                      setRole("owner");
                      setRoleError("");
                    }}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.roleIconContainer,
                        role === "owner" && styles.roleIconContainerSelected,
                      ]}
                    >
                      <Ionicons
                        name="home"
                        size={24}
                        color={
                          role === "owner"
                            ? colors.primary
                            : colors.textSecondary
                        }
                      />
                    </View>
                    <Text
                      style={[
                        styles.roleCardText,
                        { color: colors.textSecondary },
                        role === "owner" && [
                          styles.roleCardTextSelected,
                          { color: colors.text },
                        ],
                      ]}
                    >
                      Property Owner
                    </Text>
                    {role === "owner" && (
                      <View
                        style={[
                          styles.roleCheckmark,
                          { backgroundColor: colors.primary },
                        ]}
                      >
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Continue Button */}
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  { backgroundColor: colors.primary },
                  !isFormValid() && styles.continueButtonDisabled,
                ]}
                onPress={handleContinue}
                activeOpacity={0.9}
                disabled={!isFormValid()}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
                <View style={styles.buttonIcon}>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* Footer */}
            <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
              <Text
                style={[styles.footerText, { color: colors.textSecondary }]}
              >
                By continuing, you agree to our{" "}
              </Text>
              <TouchableOpacity onPress={handleTermsPress} activeOpacity={0.7}>
                <Text style={[styles.linkText, { color: colors.primary }]}>
                  Terms
                </Text>
              </TouchableOpacity>
              <Text
                style={[styles.footerText, { color: colors.textSecondary }]}
              >
                {" "}
                and{" "}
              </Text>
              <TouchableOpacity
                onPress={handlePrivacyPress}
                activeOpacity={0.7}
              >
                <Text style={[styles.linkText, { color: colors.primary }]}>
                  Privacy Policy
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Already have account */}
            <Animated.View
              style={[styles.loginSection, { opacity: footerOpacity }]}
            >
              <Text style={[styles.loginText, { color: colors.textSecondary }]}>
                Already have an account?{" "}
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(auth)/login")}
                activeOpacity={0.7}
              >
                <Text style={[styles.loginLink, { color: colors.primary }]}>
                  Sign In
                </Text>
              </TouchableOpacity>
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
    paddingTop: Spacing.md,
  },
  logoSection: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
    width: 100,
    height: 100,
    alignSelf: "center",
  },
  ring: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1,
  },
  ring1: {
    width: 85,
    height: 85,
    borderColor: "rgba(34, 197, 94, 0.15)",
  },
  ring2: {
    width: 100,
    height: 100,
    borderColor: "rgba(34, 197, 94, 0.08)",
    borderStyle: "dashed",
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(34, 197, 94, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(34, 197, 94, 0.2)",
  },
  titleSection: {
    marginBottom: Spacing.lg,
    alignItems: "center",
  },
  title: {
    ...Typography.headlineMedium,
    fontSize: 26,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  formCard: {
    width: "100%",
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: Spacing.lg,
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
  roleSection: {
    marginTop: Spacing.lg,
  },
  roleTitle: {
    ...Typography.labelLarge,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    fontWeight: "600",
  },
  roleError: {
    ...Typography.caption,
    color: "#EF4444",
    marginBottom: Spacing.sm,
    fontSize: 12,
  },
  roleOptions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  roleCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: Spacing.md,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.divider,
    position: "relative",
  },
  roleCardSelected: {
    borderColor: Colors.primaryGreen,
    backgroundColor: "rgba(34, 197, 94, 0.05)",
  },
  roleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  roleIconContainerSelected: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
  },
  roleCardText: {
    ...Typography.labelMedium,
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  roleCardTextSelected: {
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  roleCheckmark: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primaryGreen,
    justifyContent: "center",
    alignItems: "center",
  },
  continueButton: {
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
    marginTop: Spacing.xl,
  },
  continueButtonDisabled: {
    backgroundColor: Colors.divider,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
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
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  footerText: {
    ...Typography.bodyMedium,
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  linkText: {
    ...Typography.bodyMedium,
    fontSize: 12,
    color: Colors.primaryGreen,
    fontWeight: "600",
  },
  loginSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  loginText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  loginLink: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.primaryGreen,
    fontWeight: "700",
  },
});
