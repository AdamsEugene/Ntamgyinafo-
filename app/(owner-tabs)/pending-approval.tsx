import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Typography, Spacing } from "@/constants/design";

export default function PendingApprovalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ listingTitle?: string }>();

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entry animations - runs once on mount
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Pulse animation for the icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBackToDashboard = () => {
    router.replace("/(owner-tabs)");
  };

  const handleViewMyListings = () => {
    router.replace("/(owner-tabs)/my-listings");
  };

  return (
    <>
      <StatusBar style="dark" />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Decorative Background */}
        <View style={styles.decorativeBackground}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <View style={styles.circle3} />
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 100 + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Icon Container */}
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [{ scale: scaleAnim }, { scale: pulseAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={[
                  `${Colors.primaryGreen}20`,
                  `${Colors.primaryGreen}10`,
                ]}
                style={styles.iconGradient}
              >
                <View style={styles.iconInner}>
                  <Ionicons
                    name="time-outline"
                    size={64}
                    color={Colors.primaryGreen}
                  />
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Title and Message */}
            <Animated.View
              style={[
                styles.textContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={styles.title}>Listing Under Review</Text>
              <Text style={styles.message}>
                Your listing is being reviewed by our team. We&apos;ll notify
                you once it&apos;s approved and live on the platform.
              </Text>

              {/* Listing Info Card */}
              {params.listingTitle && (
                <View style={styles.listingCard}>
                  <View style={styles.listingIconContainer}>
                    <Ionicons
                      name="home"
                      size={20}
                      color={Colors.primaryGreen}
                    />
                  </View>
                  <View style={styles.listingInfo}>
                    <Text style={styles.listingLabel}>Submitted Listing</Text>
                    <Text style={styles.listingTitle} numberOfLines={1}>
                      {params.listingTitle}
                    </Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Pending</Text>
                  </View>
                </View>
              )}

              {/* Timeline */}
              <View style={styles.timelineCard}>
                <View style={styles.timelineHeader}>
                  <Ionicons
                    name="timer-outline"
                    size={20}
                    color={Colors.primaryGreen}
                  />
                  <Text style={styles.timelineTitle}>Estimated Time</Text>
                </View>
                <Text style={styles.timelineValue}>24 - 48 hours</Text>
                <Text style={styles.timelineNote}>
                  We review listings to ensure quality and accuracy
                </Text>
              </View>

              {/* What Happens Next */}
              <View style={styles.stepsCard}>
                <Text style={styles.stepsTitle}>What happens next?</Text>
                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepLabel}>Review in Progress</Text>
                    <Text style={styles.stepDescription}>
                      Our team verifies property details and photos
                    </Text>
                  </View>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={Colors.primaryGreen}
                  />
                </View>
                <View style={styles.stepConnector} />
                <View style={styles.step}>
                  <View style={[styles.stepNumber, styles.stepNumberPending]}>
                    <Text
                      style={[
                        styles.stepNumberText,
                        styles.stepNumberTextPending,
                      ]}
                    >
                      2
                    </Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepLabel}>Approval</Text>
                    <Text style={styles.stepDescription}>
                      You&apos;ll receive a notification once approved
                    </Text>
                  </View>
                  <Ionicons
                    name="ellipse-outline"
                    size={20}
                    color={Colors.textSecondary}
                  />
                </View>
                <View style={styles.stepConnector} />
                <View style={styles.step}>
                  <View style={[styles.stepNumber, styles.stepNumberPending]}>
                    <Text
                      style={[
                        styles.stepNumberText,
                        styles.stepNumberTextPending,
                      ]}
                    >
                      3
                    </Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepLabel}>Go Live</Text>
                    <Text style={styles.stepDescription}>
                      Your property will be visible to buyers
                    </Text>
                  </View>
                  <Ionicons
                    name="ellipse-outline"
                    size={20}
                    color={Colors.textSecondary}
                  />
                </View>
              </View>
            </Animated.View>

            {/* Footer Buttons */}
            <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleViewMyListings}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="list-outline"
                  size={20}
                  color={Colors.primaryGreen}
                />
                <Text style={styles.secondaryButtonText}>View My Listings</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleBackToDashboard}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[Colors.primaryGreen, "#2E7D32"]}
                  style={styles.primaryButtonGradient}
                >
                  <Text style={styles.primaryButtonText}>
                    Back to Dashboard
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
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
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.primaryLight,
    opacity: 0.1,
  },
  circle2: {
    position: "absolute",
    bottom: 100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.primaryGreen,
    opacity: 0.05,
  },
  circle3: {
    position: "absolute",
    top: "40%",
    right: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.accentGold,
    opacity: 0.08,
  },
  content: {
    alignItems: "center",
    paddingTop: Spacing.xl,
  },
  iconContainer: {
    marginBottom: Spacing.xl,
  },
  iconGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  iconInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  textContainer: {
    width: "100%",
    alignItems: "center",
  },
  title: {
    ...Typography.headlineLarge,
    fontSize: 26,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  message: {
    ...Typography.bodyMedium,
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  listingCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.divider,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  listingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${Colors.primaryGreen}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  listingInfo: {
    flex: 1,
  },
  listingLabel: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  listingTitle: {
    ...Typography.titleMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  statusBadge: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "600",
    color: "#F57C00",
  },
  timelineCard: {
    width: "100%",
    backgroundColor: `${Colors.primaryGreen}08`,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: `${Colors.primaryGreen}20`,
  },
  timelineHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  timelineTitle: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
  timelineValue: {
    ...Typography.headlineMedium,
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  timelineNote: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  stepsCard: {
    width: "100%",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  stepsTitle: {
    ...Typography.titleMedium,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryGreen,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  stepNumberPending: {
    backgroundColor: Colors.divider,
  },
  stepNumberText: {
    ...Typography.labelMedium,
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  stepNumberTextPending: {
    color: Colors.textSecondary,
  },
  stepContent: {
    flex: 1,
  },
  stepLabel: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  stepDescription: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  stepConnector: {
    width: 2,
    height: 20,
    backgroundColor: Colors.divider,
    marginLeft: 13,
    marginVertical: 4,
  },
  footer: {
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primaryGreen,
  },
  secondaryButtonText: {
    ...Typography.labelLarge,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  primaryButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  primaryButtonText: {
    ...Typography.labelLarge,
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
