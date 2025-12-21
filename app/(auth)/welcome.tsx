import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Typography, Spacing } from "@/constants/design";
import { Button } from "@/components/ui/Button";

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar style="dark" />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Decorative Background Elements */}
        <View style={styles.decorativeBackground}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="home" size={64} color={Colors.primaryGreen} />
            </View>
          </View>

          {/* App Name */}
          <Text style={styles.appName}>Ntamgyinafoɔ</Text>

          {/* Tagline */}
          <Text style={styles.tagline}>The #1 Property App in Ghana</Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              title="Login"
              onPress={() => router.push("/(auth)/login")}
              variant="primary"
              style={styles.button}
            />
            <Button
              title="Create Account"
              onPress={() => router.push("/(auth)/register")}
              variant="secondary"
              style={styles.button}
            />
          </View>

          {/* Guest Link */}
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)")}
            style={styles.guestLink}
          >
            <Text style={styles.guestText}>Explore as Guest</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
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
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing["3xl"],
    zIndex: 1,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["2xl"],
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.primaryGreen,
    shadowColor: Colors.primaryGreen,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  appName: {
    ...Typography.displayMedium,
    fontSize: 32,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    letterSpacing: 0.5,
  },
  tagline: {
    ...Typography.bodyLarge,
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: Spacing["3xl"],
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
    lineHeight: 24,
  },
  buttonContainer: {
    width: "100%",
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  button: {
    width: "100%",
  },
  guestLink: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  guestText: {
    ...Typography.labelLarge,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.primaryGreen,
    letterSpacing: 0.3,
  },
});
