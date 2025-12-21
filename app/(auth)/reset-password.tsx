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

export default function ResetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setNewPasswordError("Password is required");
      return false;
    }

    if (password.length < 6) {
      setNewPasswordError("Password must be at least 6 characters");
      return false;
    }

    setNewPasswordError("");
    return true;
  };

  const validateConfirmPassword = (
    confirm: string,
    password: string
  ): boolean => {
    if (!confirm) {
      setConfirmPasswordError("Please confirm your password");
      return false;
    }

    if (confirm !== password) {
      setConfirmPasswordError("Passwords do not match");
      return false;
    }

    setConfirmPasswordError("");
    return true;
  };

  const handleNewPasswordChange = (text: string) => {
    setNewPassword(text);
    if (newPasswordError) {
      setNewPasswordError("");
    }
    if (confirmPassword && confirmPasswordError) {
      validateConfirmPassword(confirmPassword, text);
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (confirmPasswordError) {
      setConfirmPasswordError("");
    }
  };

  const handleResetPassword = async () => {
    const isNewPasswordValid = validatePassword(newPassword);
    const isConfirmPasswordValid = validateConfirmPassword(
      confirmPassword,
      newPassword
    );

    if (!isNewPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Reset password with backend
      console.log("Resetting password:", { newPassword, confirmPassword });
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Error resetting password:", error);
      setConfirmPasswordError("Failed to reset password. Please try again.");
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
                  name="key-outline"
                  size={32}
                  color={Colors.primaryGreen}
                />
              </View>
            </View>

            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>New Password</Text>
              <Text style={styles.subtitle}>
                Create a new password for your account
              </Text>
            </View>

            {/* Form Card */}
            <View style={styles.formCard}>
              <TextInput
                label="New Password"
                placeholder="Enter new password (min 6 characters)"
                value={newPassword}
                onChangeText={handleNewPasswordChange}
                secureTextEntry={true}
                showPasswordToggle={true}
                error={newPasswordError}
                leftIcon="lock-closed-outline"
                autoFocus
              />

              <TextInput
                label="Confirm Password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                secureTextEntry={true}
                showPasswordToggle={true}
                error={confirmPasswordError}
                leftIcon="lock-closed-outline"
              />

              <Button
                title="Reset Password"
                onPress={handleResetPassword}
                variant="primary"
                disabled={
                  isLoading ||
                  !newPassword.trim() ||
                  !confirmPassword.trim() ||
                  !!newPasswordError ||
                  !!confirmPasswordError
                }
                loading={isLoading}
                style={styles.submitButton}
              />
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
});
