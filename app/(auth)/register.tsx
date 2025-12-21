import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Typography, Spacing } from "@/constants/design";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { RadioButton } from "@/components/ui/RadioButton";

type Role = "buyer" | "owner" | null;

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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

    // Navigate to OTP verification
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
                <Ionicons name="home" size={32} color={Colors.primaryGreen} />
              </View>
            </View>

            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join Ntamgyinafoɔ today</Text>
            </View>

            {/* Form Card */}
            <View style={styles.formCard}>
              <TextInput
                label="Full Name"
                placeholder="Enter your full name"
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  if (fullNameError) {
                    validateFullName(text);
                  }
                }}
                autoCapitalize="words"
                error={fullNameError}
                leftIcon="person-outline"
              />

              <TextInput
                label="Phone Number"
                placeholder="+233 XX XXX XXXX"
                value={phone}
                onChangeText={formatPhoneNumber}
                keyboardType="phone-pad"
                autoCapitalize="none"
                error={phoneError}
                maxLength={17}
                leftIcon="call-outline"
              />

              <TextInput
                label="Password"
                placeholder="Create password (min 6 characters)"
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
                secureTextEntry
                showPasswordToggle
                error={passwordError}
                autoCapitalize="none"
                leftIcon="lock-closed-outline"
              />

              <TextInput
                label="Confirm Password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (confirmPasswordError || text) {
                    validateConfirmPassword(text, password);
                  }
                }}
                secureTextEntry
                showPasswordToggle
                error={confirmPasswordError}
                autoCapitalize="none"
                leftIcon="lock-closed-outline"
              />

              {/* Role Selection */}
              <View style={styles.roleSection}>
                <Text style={styles.roleTitle}>I am a:</Text>
                {roleError && <Text style={styles.roleError}>{roleError}</Text>}
                <RadioButton
                  label="Buyer/Tenant"
                  selected={role === "buyer"}
                  onPress={() => {
                    setRole("buyer");
                    setRoleError("");
                  }}
                  value="buyer"
                />
                <RadioButton
                  label="Property Owner"
                  selected={role === "owner"}
                  onPress={() => {
                    setRole("owner");
                    setRoleError("");
                  }}
                  value="owner"
                />
              </View>

              {/* Continue Button */}
              <Button
                title="Continue"
                onPress={handleContinue}
                variant="primary"
                disabled={!isFormValid()}
                style={styles.continueButton}
              />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By continuing, you agree to our{" "}
              </Text>
              <TouchableOpacity onPress={handleTermsPress} activeOpacity={0.7}>
                <Text style={styles.linkText}>Terms</Text>
              </TouchableOpacity>
              <Text style={styles.footerText}> and </Text>
              <TouchableOpacity
                onPress={handlePrivacyPress}
                activeOpacity={0.7}
              >
                <Text style={styles.linkText}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
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
        elevation: 3,
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
    paddingTop: Spacing.xl,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
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
  roleSection: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  roleTitle: {
    ...Typography.labelLarge,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    fontWeight: "600",
  },
  roleError: {
    ...Typography.caption,
    color: "#D32F2F",
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  continueButton: {
    width: "100%",
    marginTop: Spacing.md,
  },
  footer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  footerText: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  linkText: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.primaryGreen,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
