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
import { Typography, Spacing } from "@/constants/design";
import { useTheme } from "@/contexts/ThemeContext";

export default function PendingApprovalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
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
      <StatusBar style={isDark ? "light" : "dark"} />
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, backgroundColor: colors.background },
        ]}
      >
        {/* Decorative Background */}
        <View style={styles.decorativeBackground}>
          <View
            style={[
              styles.circle1,
              { backgroundColor: colors.primary, opacity: 0.1 },
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
              { backgroundColor: colors.accent, opacity: 0.08 },
            ]}
          />
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 200 + insets.bottom },
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
                colors={[`${colors.primary}20`, `${colors.primary}10`]}
                style={styles.iconGradient}
              >
                <View
                  style={[
                    styles.iconInner,
                    { backgroundColor: colors.surface },
                  ]}
                >
                  <Ionicons
                    name="time-outline"
                    size={64}
                    color={colors.primary}
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
              <Text style={[styles.title, { color: colors.text }]}>
                Listing Under Review
              </Text>
              <Text style={[styles.message, { color: colors.textSecondary }]}>
                Your listing is being reviewed by our team. We&apos;ll notify
                you once it&apos;s approved and live on the platform.
              </Text>

              {/* Listing Info Card */}
              {params.listingTitle && (
                <View
                  style={[
                    styles.listingCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.divider,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.listingIconContainer,
                      { backgroundColor: `${colors.primary}15` },
                    ]}
                  >
                    <Ionicons name="home" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.listingInfo}>
                    <Text
                      style={[
                        styles.listingLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Submitted Listing
                    </Text>
                    <Text
                      style={[styles.listingTitle, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {params.listingTitle}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: isDark ? "#F57C0015" : "#FFF3E0",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: isDark ? "#FFB74D" : "#F57C00" },
                      ]}
                    >
                      Pending
                    </Text>
                  </View>
                </View>
              )}

              {/* Timeline */}
              <View
                style={[
                  styles.timelineCard,
                  {
                    backgroundColor: `${colors.primary}08`,
                    borderColor: `${colors.primary}20`,
                  },
                ]}
              >
                <View style={styles.timelineHeader}>
                  <Ionicons
                    name="timer-outline"
                    size={20}
                    color={colors.primary}
                  />
                  <Text
                    style={[styles.timelineTitle, { color: colors.primary }]}
                  >
                    Estimated Time
                  </Text>
                </View>
                <Text style={[styles.timelineValue, { color: colors.text }]}>
                  24 - 48 hours
                </Text>
                <Text
                  style={[styles.timelineNote, { color: colors.textSecondary }]}
                >
                  We review listings to ensure quality and accuracy
                </Text>
              </View>

              {/* What Happens Next */}
              <View
                style={[
                  styles.stepsCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.divider,
                  },
                ]}
              >
                <Text style={[styles.stepsTitle, { color: colors.text }]}>
                  What happens next?
                </Text>
                <View style={styles.step}>
                  <View
                    style={[
                      styles.stepNumber,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={[styles.stepLabel, { color: colors.text }]}>
                      Review in Progress
                    </Text>
                    <Text
                      style={[
                        styles.stepDescription,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Our team verifies property details and photos
                    </Text>
                  </View>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View
                  style={[
                    styles.stepConnector,
                    { backgroundColor: colors.divider },
                  ]}
                />
                <View style={styles.step}>
                  <View
                    style={[
                      styles.stepNumber,
                      styles.stepNumberPending,
                      { backgroundColor: colors.divider },
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepNumberText,
                        styles.stepNumberTextPending,
                        { color: colors.textSecondary },
                      ]}
                    >
                      2
                    </Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={[styles.stepLabel, { color: colors.text }]}>
                      Approval
                    </Text>
                    <Text
                      style={[
                        styles.stepDescription,
                        { color: colors.textSecondary },
                      ]}
                    >
                      You&apos;ll receive a notification once approved
                    </Text>
                  </View>
                  <Ionicons
                    name="ellipse-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>
                <View
                  style={[
                    styles.stepConnector,
                    { backgroundColor: colors.divider },
                  ]}
                />
                <View style={styles.step}>
                  <View
                    style={[
                      styles.stepNumber,
                      styles.stepNumberPending,
                      { backgroundColor: colors.divider },
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepNumberText,
                        styles.stepNumberTextPending,
                        { color: colors.textSecondary },
                      ]}
                    >
                      3
                    </Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={[styles.stepLabel, { color: colors.text }]}>
                      Go Live
                    </Text>
                    <Text
                      style={[
                        styles.stepDescription,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Your property will be visible to buyers
                    </Text>
                  </View>
                  <Ionicons
                    name="ellipse-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>
              </View>
            </Animated.View>
          </View>
        </ScrollView>

        {/* Fixed Footer Buttons */}
        <Animated.View
          style={[
            styles.footer,
            { paddingBottom: insets.bottom + 100, opacity: fadeAnim },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.primary,
              },
            ]}
            onPress={handleViewMyListings}
            activeOpacity={0.8}
          >
            <Ionicons name="list-outline" size={20} color={colors.primary} />
            <Text
              style={[styles.secondaryButtonText, { color: colors.primary }]}
            >
              View My Listings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleBackToDashboard}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.primaryButtonGradient}
            >
              <Text style={styles.primaryButtonText}>Back to Dashboard</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  circle2: {
    position: "absolute",
    bottom: 100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  circle3: {
    position: "absolute",
    top: "40%",
    right: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
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
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
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
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  message: {
    ...Typography.bodyMedium,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  listingCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
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
    marginBottom: 2,
  },
  listingTitle: {
    ...Typography.titleMedium,
    fontSize: 14,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "600",
  },
  timelineCard: {
    width: "100%",
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
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
  },
  timelineValue: {
    ...Typography.headlineMedium,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  timelineNote: {
    ...Typography.caption,
    fontSize: 12,
  },
  stepsCard: {
    width: "100%",
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 1,
  },
  stepsTitle: {
    ...Typography.titleMedium,
    fontSize: 15,
    fontWeight: "600",
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
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  stepNumberPending: {},
  stepNumberText: {
    ...Typography.labelMedium,
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  stepNumberTextPending: {},
  stepContent: {
    flex: 1,
  },
  stepLabel: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  stepDescription: {
    ...Typography.caption,
    fontSize: 11,
  },
  stepConnector: {
    width: 2,
    height: 20,
    marginLeft: 13,
    marginVertical: 4,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
  },
  secondaryButtonText: {
    ...Typography.labelLarge,
    fontSize: 15,
    fontWeight: "600",
  },
  primaryButton: {
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
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
