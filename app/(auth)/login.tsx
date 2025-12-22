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

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState("+233 24 123 4567");
  const [password, setPassword] = useState("password123");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validatePhone = (phoneNumber: string): boolean => {
    // Ghana phone format: +233 XX XXX XXXX or 0XX XXX XXXX
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
      // TODO: Implement login logic
      const formattedPhone = phone.replace(/\s+/g, "");
      console.log("Login:", { phone: formattedPhone, password });
      // Navigate to home after successful login
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, "");

    // Format as +233 XX XXX XXXX
    let formatted = cleaned;
    if (cleaned.startsWith("233")) {
      formatted = "+" + cleaned;
    } else if (cleaned.startsWith("0")) {
      formatted = "+233" + cleaned.substring(1);
    } else if (cleaned.length > 0 && !cleaned.startsWith("+")) {
      formatted = "+233" + cleaned;
    }

    // Add spacing: +233 XX XXX XXXX
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
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Sign in to continue your journey
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
                autoCapitalize="none"
                error={phoneError}
                maxLength={17} // +233 XX XXX XXXX
                leftIcon="call-outline"
              />

              <TextInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) {
                    validatePassword(text);
                  }
                }}
                secureTextEntry
                showPasswordToggle
                error={passwordError}
                autoCapitalize="none"
                leftIcon="lock-closed-outline"
              />

              {/* Forgot Password */}
              <TouchableOpacity
                onPress={() => router.push("/(auth)/forgot-password")}
                style={styles.forgotPasswordContainer}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Sign In Button */}
              <Button
                title="Sign In"
                onPress={handleLogin}
                variant="primary"
                loading={isLoading}
                style={styles.signInButton}
              />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Don&apos;t have an account?{" "}
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(auth)/register")}
                activeOpacity={0.7}
              >
                <Text style={styles.registerLink}>Register</Text>
              </TouchableOpacity>
            </View>

            {/* Demo Buttons */}
            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>Quick Demo Access</Text>
              <View style={styles.demoButtons}>
                <TouchableOpacity
                  style={styles.demoBuyerButton}
                  onPress={() => router.replace("/(tabs)")}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="search"
                    size={18}
                    color={Colors.primaryGreen}
                  />
                  <Text style={styles.demoBuyerText}>Buyer Demo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.demoOwnerButton}
                  onPress={() => router.replace("/(owner-tabs)")}
                  activeOpacity={0.8}
                >
                  <Ionicons name="home" size={18} color="#FFFFFF" />
                  <Text style={styles.demoOwnerText}>Owner Demo</Text>
                </TouchableOpacity>
              </View>
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
    justifyContent: "center",
    minHeight: 500,
    paddingTop: Spacing["2xl"],
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
    marginBottom: Spacing["3xl"],
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
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: Spacing.xl,
    marginTop: Spacing.sm,
  },
  forgotPasswordText: {
    ...Typography.labelMedium,
    fontSize: 14,
    color: Colors.primaryGreen,
    fontWeight: "600",
  },
  signInButton: {
    width: "100%",
    marginTop: Spacing.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing["2xl"],
    paddingTop: Spacing.xl,
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
  // Demo Section
  demoSection: {
    marginTop: Spacing["2xl"],
    paddingTop: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    alignItems: "center",
  },
  demoTitle: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  demoButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  demoBuyerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primaryGreen,
    backgroundColor: Colors.surface,
  },
  demoBuyerText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
  demoOwnerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    backgroundColor: Colors.primaryGreen,
  },
  demoOwnerText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
