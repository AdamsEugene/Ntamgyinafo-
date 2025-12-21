import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Typography, Spacing } from "@/constants/design";
import { Button } from "@/components/ui/Button";

export default function PendingVerificationScreen() {
  const router = useRouter();

  const handleContactSupport = () => {
    Linking.openURL("mailto:support@ntamgyinafo.app");
  };

  return (
    <>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* Decorative Background Elements */}
        <View style={styles.decorativeBackground}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name="time-outline"
                  size={64}
                  color={Colors.primaryGreen}
                />
              </View>
              {/* Animated pulse effect */}
              <View style={styles.iconPulse1} />
              <View style={styles.iconPulse2} />
            </View>

            {/* Title */}
            <Text style={styles.title}>Verification Pending</Text>

            {/* Message */}
            <Text style={styles.message}>
              Your account is being reviewed. We&apos;ll notify you once
              verified.
            </Text>

            {/* Estimated Time Card */}
            <View style={styles.timeCard}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color={Colors.primaryGreen}
              />
              <View style={styles.timeCardContent}>
                <Text style={styles.timeCardTitle}>Estimated Time</Text>
                <Text style={styles.timeCardText}>
                  Usually takes 24-48 hours
                </Text>
              </View>
            </View>

            {/* What Happens Next */}
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>What Happens Next?</Text>
              <View style={styles.infoList}>
                <View style={styles.infoItem}>
                  <View style={styles.infoIcon}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={Colors.primaryGreen}
                    />
                  </View>
                  <Text style={styles.infoText}>
                    Our team reviews your documents
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <View style={styles.infoIcon}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={Colors.primaryGreen}
                    />
                  </View>
                  <Text style={styles.infoText}>
                    You&apos;ll receive a notification when approved
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <View style={styles.infoIcon}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={Colors.primaryGreen}
                    />
                  </View>
                  <Text style={styles.infoText}>
                    Start listing properties once verified
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <Button
                title="Go to Dashboard"
                onPress={() => {
                  // TODO: Navigate to owner dashboard (disabled until verified)
                  console.log("Navigate to Owner Dashboard");
                }}
                variant="secondary"
                disabled={true}
                style={styles.dashboardButton}
              />
              <TouchableOpacity
                onPress={handleContactSupport}
                style={styles.supportButton}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="chatbubble-outline"
                  size={18}
                  color={Colors.primaryGreen}
                />
                <Text style={styles.supportButtonText}>Contact Support</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing["3xl"],
    zIndex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Spacing["3xl"],
    minHeight: 600,
  },
  iconContainer: {
    width: 160,
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing["2xl"],
    position: "relative",
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F1F8F4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.primaryGreen,
    zIndex: 10,
  },
  iconPulse1: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.primaryGreen,
    opacity: 0.1,
    zIndex: 1,
  },
  iconPulse2: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.primaryGreen,
    opacity: 0.05,
    zIndex: 0,
  },
  title: {
    ...Typography.headlineMedium,
    fontSize: 28,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  message: {
    ...Typography.bodyLarge,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: Spacing["2xl"],
    paddingHorizontal: Spacing.lg,
  },
  timeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F8F4",
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    width: "100%",
    borderLeftWidth: 4,
    borderLeftColor: Colors.primaryGreen,
    gap: Spacing.md,
  },
  timeCardContent: {
    flex: 1,
  },
  timeCardTitle: {
    ...Typography.labelLarge,
    fontSize: 14,
    fontWeight: "700",
    color: Colors.primaryGreen,
    marginBottom: Spacing.xs,
  },
  timeCardText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.xl,
    width: "100%",
    marginBottom: Spacing["2xl"],
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
  infoCardTitle: {
    ...Typography.headlineMedium,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  infoList: {
    gap: Spacing.md,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  infoIcon: {
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    ...Typography.bodyMedium,
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  actionsContainer: {
    width: "100%",
    gap: Spacing.md,
  },
  dashboardButton: {
    width: "100%",
  },
  supportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  supportButtonText: {
    ...Typography.labelLarge,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
});
