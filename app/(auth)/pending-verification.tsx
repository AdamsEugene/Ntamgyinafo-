import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Typography, Spacing } from "@/constants/design";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function PendingVerificationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Animation values
  const iconScale = useRef(new Animated.Value(0)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;
  const ring1Scale = useRef(new Animated.Value(0)).current;
  const ring2Scale = useRef(new Animated.Value(0)).current;
  const ring3Scale = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;
  const messageOpacity = useRef(new Animated.Value(0)).current;
  const card1Opacity = useRef(new Animated.Value(0)).current;
  const card1TranslateY = useRef(new Animated.Value(30)).current;
  const card2Opacity = useRef(new Animated.Value(0)).current;
  const card2TranslateY = useRef(new Animated.Value(30)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const clockRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Icon entrance with rotation
    Animated.parallel([
      Animated.spring(iconScale, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(iconRotate, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Rings entrance with stagger
    Animated.stagger(100, [
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
      Animated.spring(ring3Scale, {
        toValue: 1,
        tension: 30,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Title entrance
    Animated.sequence([
      Animated.delay(300),
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

    // Message entrance
    Animated.sequence([
      Animated.delay(450),
      Animated.timing(messageOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Card 1 entrance
    Animated.sequence([
      Animated.delay(550),
      Animated.parallel([
        Animated.timing(card1Opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(card1TranslateY, {
          toValue: 0,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Card 2 entrance
    Animated.sequence([
      Animated.delay(700),
      Animated.parallel([
        Animated.timing(card2Opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(card2TranslateY, {
          toValue: 0,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Buttons entrance
    Animated.sequence([
      Animated.delay(850),
      Animated.timing(buttonsOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Clock hand rotation animation
    Animated.loop(
      Animated.timing(clockRotate, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    return () => {
      iconScale.stopAnimation();
      iconRotate.stopAnimation();
      ring1Scale.stopAnimation();
      ring2Scale.stopAnimation();
      ring3Scale.stopAnimation();
      titleOpacity.stopAnimation();
      titleTranslateY.stopAnimation();
      messageOpacity.stopAnimation();
      card1Opacity.stopAnimation();
      card1TranslateY.stopAnimation();
      card2Opacity.stopAnimation();
      card2TranslateY.stopAnimation();
      buttonsOpacity.stopAnimation();
      pulseAnim.stopAnimation();
      clockRotate.stopAnimation();
    };
  }, [
    iconScale,
    iconRotate,
    ring1Scale,
    ring2Scale,
    ring3Scale,
    titleOpacity,
    titleTranslateY,
    messageOpacity,
    card1Opacity,
    card1TranslateY,
    card2Opacity,
    card2TranslateY,
    buttonsOpacity,
    pulseAnim,
    clockRotate,
  ]);

  const iconRotation = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["-180deg", "0deg"],
  });

  const handleContactSupport = () => {
    Linking.openURL("mailto:support@ntamgyinafo.app");
  };

  const handleLogout = () => {
    router.replace("/(auth)/welcome");
  };

  return (
    <>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* Decorative Background Elements */}
        <View style={styles.decorativeBackground}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <View style={styles.circle3} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + Spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Animated Icon Section */}
            <View style={styles.iconSection}>
              {/* Animated Rings */}
              <Animated.View
                style={[
                  styles.ring,
                  styles.ring3,
                  {
                    transform: [{ scale: ring3Scale }, { scale: pulseAnim }],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.ring,
                  styles.ring2,
                  {
                    transform: [{ scale: ring2Scale }],
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

              {/* Main Icon */}
              <Animated.View
                style={[
                  styles.iconCircle,
                  {
                    transform: [{ scale: iconScale }, { rotate: iconRotation }],
                  },
                ]}
              >
                <View style={styles.iconInner}>
                  <Ionicons
                    name="hourglass-outline"
                    size={40}
                    color={Colors.primaryGreen}
                  />
                </View>
              </Animated.View>
            </View>

            {/* Title */}
            <Animated.View
              style={[
                styles.titleContainer,
                {
                  opacity: titleOpacity,
                  transform: [{ translateY: titleTranslateY }],
                },
              ]}
            >
              <Text style={styles.title}>Verification Pending</Text>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Under Review</Text>
              </View>
            </Animated.View>

            {/* Message */}
            <Animated.Text
              style={[styles.message, { opacity: messageOpacity }]}
            >
              Your account is being reviewed by our team. We&apos;ll notify you
              once the verification is complete.
            </Animated.Text>

            {/* Estimated Time Card */}
            <Animated.View
              style={[
                styles.timeCard,
                {
                  opacity: card1Opacity,
                  transform: [{ translateY: card1TranslateY }],
                },
              ]}
            >
              <View style={styles.timeCardIcon}>
                <Ionicons name="time" size={24} color={Colors.primaryGreen} />
              </View>
              <View style={styles.timeCardContent}>
                <Text style={styles.timeCardTitle}>Estimated Time</Text>
                <Text style={styles.timeCardText}>24-48 hours</Text>
              </View>
              <View style={styles.timeCardBadge}>
                <Ionicons name="flash" size={14} color={Colors.primaryGreen} />
                <Text style={styles.timeCardBadgeText}>Fast</Text>
              </View>
            </Animated.View>

            {/* What Happens Next Card */}
            <Animated.View
              style={[
                styles.infoCard,
                {
                  opacity: card2Opacity,
                  transform: [{ translateY: card2TranslateY }],
                },
              ]}
            >
              <View style={styles.infoCardHeader}>
                <View style={styles.infoCardIconContainer}>
                  <Ionicons
                    name="list-outline"
                    size={20}
                    color={Colors.primaryGreen}
                  />
                </View>
                <Text style={styles.infoCardTitle}>What Happens Next?</Text>
              </View>
              <View style={styles.infoList}>
                <View style={styles.infoItem}>
                  <View style={styles.infoStepNumber}>
                    <Text style={styles.infoStepText}>1</Text>
                  </View>
                  <View style={styles.infoItemContent}>
                    <Text style={styles.infoItemTitle}>Document Review</Text>
                    <Text style={styles.infoItemText}>
                      Our team verifies your documents
                    </Text>
                  </View>
                </View>
                <View style={styles.infoConnector} />
                <View style={styles.infoItem}>
                  <View style={styles.infoStepNumber}>
                    <Text style={styles.infoStepText}>2</Text>
                  </View>
                  <View style={styles.infoItemContent}>
                    <Text style={styles.infoItemTitle}>Get Notified</Text>
                    <Text style={styles.infoItemText}>
                      Receive notification when approved
                    </Text>
                  </View>
                </View>
                <View style={styles.infoConnector} />
                <View style={styles.infoItem}>
                  <View style={styles.infoStepNumber}>
                    <Text style={styles.infoStepText}>3</Text>
                  </View>
                  <View style={styles.infoItemContent}>
                    <Text style={styles.infoItemTitle}>Start Listing</Text>
                    <Text style={styles.infoItemText}>
                      List your properties and find tenants
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* Action Buttons */}
            <Animated.View
              style={[styles.actionsContainer, { opacity: buttonsOpacity }]}
            >
              <TouchableOpacity
                style={styles.supportButton}
                onPress={handleContactSupport}
                activeOpacity={0.8}
              >
                <View style={styles.supportButtonIcon}>
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={20}
                    color={Colors.primaryGreen}
                  />
                </View>
                <Text style={styles.supportButtonText}>Contact Support</Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={Colors.primaryGreen}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="log-out-outline"
                  size={18}
                  color={Colors.textSecondary}
                />
                <Text style={styles.logoutButtonText}>Sign Out</Text>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing["3xl"],
    zIndex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
  },
  iconSection: {
    alignItems: "center",
    justifyContent: "center",
    width: 180,
    height: 180,
    marginBottom: Spacing.xl,
  },
  ring: {
    position: "absolute",
    borderRadius: 999,
  },
  ring1: {
    width: 130,
    height: 130,
    borderWidth: 1.5,
    borderColor: "rgba(34, 197, 94, 0.2)",
  },
  ring2: {
    width: 155,
    height: 155,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.12)",
    borderStyle: "dashed",
  },
  ring3: {
    width: 180,
    height: 180,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.06)",
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primaryGreen,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  iconInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(34, 197, 94, 0.2)",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.headlineMedium,
    fontSize: 28,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FBBF24",
  },
  statusText: {
    ...Typography.labelMedium,
    fontSize: 13,
    color: "#B45309",
    fontWeight: "600",
  },
  message: {
    ...Typography.bodyMedium,
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  timeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  timeCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  timeCardContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  timeCardTitle: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  timeCardText: {
    ...Typography.labelLarge,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  timeCardBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  timeCardBadgeText: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.primaryGreen,
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.xl,
    width: "100%",
    marginBottom: Spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.03)",
  },
  infoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  infoCardIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  infoCardTitle: {
    ...Typography.labelLarge,
    fontSize: 17,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  infoList: {
    gap: Spacing.xs,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  infoStepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryGreen,
    justifyContent: "center",
    alignItems: "center",
  },
  infoStepText: {
    ...Typography.labelMedium,
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  infoItemContent: {
    flex: 1,
    paddingTop: 2,
  },
  infoItemTitle: {
    ...Typography.labelMedium,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  infoItemText: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  infoConnector: {
    width: 2,
    height: 16,
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    marginLeft: 13,
    borderRadius: 1,
  },
  actionsContainer: {
    width: "100%",
    gap: Spacing.md,
  },
  supportButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.primaryGreen,
    gap: Spacing.md,
    shadowColor: Colors.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  supportButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  supportButtonText: {
    flex: 1,
    ...Typography.labelLarge,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  logoutButtonText: {
    ...Typography.labelMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
});
