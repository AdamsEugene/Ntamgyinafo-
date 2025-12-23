import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Typography, Spacing } from "@/constants/design";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Floating particle component
const FloatingParticle = ({ index }: { index: number }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = index * 150;

    // Fade and scale in
    Animated.sequence([
      Animated.delay(delay + 300),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Continuous floating
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: -15 - Math.random() * 10,
            duration: 2000 + Math.random() * 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 2000 + Math.random() * 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(translateX, {
            toValue: -5 + Math.random() * 10,
            duration: 3000 + Math.random() * 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: 0,
            duration: 3000 + Math.random() * 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    return () => {
      translateY.stopAnimation();
      translateX.stopAnimation();
      opacity.stopAnimation();
      scale.stopAnimation();
    };
  }, [index, translateY, translateX, opacity, scale]);

  const positions = [
    { top: SCREEN_HEIGHT * 0.15, left: 40 },
    { top: SCREEN_HEIGHT * 0.2, left: 320 },
    { top: SCREEN_HEIGHT * 0.35, left: 20 },
    { top: SCREEN_HEIGHT * 0.45, left: 350 },
    { top: SCREEN_HEIGHT * 0.6, left: 48 },
    { top: SCREEN_HEIGHT * 0.7, left: 340 },
    { top: SCREEN_HEIGHT * 0.25, left: 300 },
    { top: SCREEN_HEIGHT * 0.55, left: 12 },
  ];

  const pos = positions[index % positions.length];
  const size = 6 + (index % 4) * 2;

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          top: pos.top,
          left: pos.left,
        },
        {
          opacity,
          transform: [{ translateY }, { translateX }, { scale }],
        },
      ]}
    />
  );
};

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Animation values
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const ring1Scale = useRef(new Animated.Value(0)).current;
  const ring2Scale = useRef(new Animated.Value(0)).current;
  const ring3Scale = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const button1TranslateY = useRef(new Animated.Value(50)).current;
  const button1Opacity = useRef(new Animated.Value(0)).current;
  const button2TranslateY = useRef(new Animated.Value(50)).current;
  const button2Opacity = useRef(new Animated.Value(0)).current;
  const guestOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Staggered entrance animations
    Animated.sequence([
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
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
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
          duration: 500,
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

    // Tagline entrance
    Animated.sequence([
      Animated.delay(450),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Buttons entrance
    Animated.sequence([
      Animated.delay(600),
      Animated.parallel([
        Animated.timing(button1Opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(button1TranslateY, {
          toValue: 0,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    Animated.sequence([
      Animated.delay(750),
      Animated.parallel([
        Animated.timing(button2Opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(button2TranslateY, {
          toValue: 0,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Guest link
    Animated.sequence([
      Animated.delay(900),
      Animated.timing(guestOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
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
      logoScale.stopAnimation();
      logoRotate.stopAnimation();
      ring1Scale.stopAnimation();
      ring2Scale.stopAnimation();
      ring3Scale.stopAnimation();
      titleOpacity.stopAnimation();
      titleTranslateY.stopAnimation();
      taglineOpacity.stopAnimation();
      button1TranslateY.stopAnimation();
      button1Opacity.stopAnimation();
      button2TranslateY.stopAnimation();
      button2Opacity.stopAnimation();
      guestOpacity.stopAnimation();
      pulseAnim.stopAnimation();
    };
  }, [
    logoScale,
    logoRotate,
    ring1Scale,
    ring2Scale,
    ring3Scale,
    titleOpacity,
    titleTranslateY,
    taglineOpacity,
    button1TranslateY,
    button1Opacity,
    button2TranslateY,
    button2Opacity,
    guestOpacity,
    pulseAnim,
  ]);

  const logoRotation = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["-180deg", "0deg"],
  });

  return (
    <>
      <StatusBar style="dark" />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Decorative Background Elements */}
        <View style={styles.decorativeBackground}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <View style={styles.circle3} />
        </View>

        {/* Floating Particles */}
        {Array.from({ length: 8 }).map((_, i) => (
          <FloatingParticle key={i} index={i} />
        ))}

        {/* Main Content */}
        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
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
                },
              ]}
            >
              <View style={styles.logoInner}>
                <Ionicons name="home" size={52} color={Colors.primaryGreen} />
              </View>
            </Animated.View>
          </View>

          {/* Title & Tagline */}
          <View style={styles.textSection}>
            <Animated.Text
              style={[
                styles.appName,
                {
                  opacity: titleOpacity,
                  transform: [{ translateY: titleTranslateY }],
                },
              ]}
            >
              Ntamgyinafoɔ
            </Animated.Text>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <View style={styles.dividerDot} />
              <View style={styles.dividerLine} />
            </View>

            <Animated.Text
              style={[
                styles.tagline,
                {
                  opacity: taglineOpacity,
                },
              ]}
            >
              The #1 Property App in Ghana
            </Animated.Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <Animated.View
              style={{
                opacity: button1Opacity,
                transform: [{ translateY: button1TranslateY }],
              }}
            >
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push("/(auth)/login")}
                activeOpacity={0.9}
              >
                <Text style={styles.primaryButtonText}>Login</Text>
                <View style={styles.buttonIcon}>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              style={{
                opacity: button2Opacity,
                transform: [{ translateY: button2TranslateY }],
              }}
            >
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => router.push("/(auth)/register")}
                activeOpacity={0.9}
              >
                <Text style={styles.secondaryButtonText}>Create Account</Text>
                <View style={styles.buttonIconSecondary}>
                  <Ionicons
                    name="person-add-outline"
                    size={18}
                    color={Colors.primaryGreen}
                  />
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Guest Link */}
          <Animated.View style={{ opacity: guestOpacity }}>
            <TouchableOpacity
              onPress={() => router.replace("/(tabs)")}
              style={styles.guestLink}
              activeOpacity={0.7}
            >
              <Text style={styles.guestText}>Explore as Guest</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Bottom decoration */}
        <View
          style={[styles.bottomDecoration, { paddingBottom: insets.bottom }]}
        >
          <View style={styles.bottomLine} />
        </View>
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
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: Colors.primaryLight,
    opacity: 0.08,
  },
  circle2: {
    position: "absolute",
    bottom: -180,
    left: -120,
    width: 450,
    height: 450,
    borderRadius: 225,
    backgroundColor: Colors.primaryGreen,
    opacity: 0.05,
  },
  circle3: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.4,
    left: -80,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Colors.primaryGreen,
    opacity: 0.03,
  },
  particle: {
    position: "absolute",
    backgroundColor: Colors.primaryGreen,
    zIndex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    zIndex: 2,
  },
  logoSection: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["2xl"],
    width: 200,
    height: 200,
  },
  ring: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1,
  },
  ring1: {
    width: 140,
    height: 140,
    borderColor: "rgba(34, 197, 94, 0.2)",
  },
  ring2: {
    width: 170,
    height: 170,
    borderColor: "rgba(34, 197, 94, 0.1)",
    borderStyle: "dashed",
  },
  ring3: {
    width: 200,
    height: 200,
    borderColor: "rgba(34, 197, 94, 0.05)",
  },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primaryGreen,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  logoInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(34, 197, 94, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(34, 197, 94, 0.2)",
  },
  textSection: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  appName: {
    ...Typography.displayMedium,
    fontSize: 34,
    fontWeight: "700",
    color: Colors.textPrimary,
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  dividerLine: {
    width: 30,
    height: 2,
    backgroundColor: Colors.primaryGreen,
    opacity: 0.3,
    borderRadius: 1,
  },
  dividerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primaryGreen,
    opacity: 0.5,
  },
  tagline: {
    ...Typography.bodyLarge,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  buttonContainer: {
    width: "100%",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  primaryButton: {
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
  },
  primaryButtonText: {
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
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: 16,
    gap: Spacing.md,
    borderWidth: 1.5,
    borderColor: "rgba(34, 197, 94, 0.25)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  secondaryButtonText: {
    ...Typography.labelLarge,
    fontSize: 17,
    fontWeight: "600",
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  buttonIconSecondary: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  guestLink: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
  },
  guestText: {
    ...Typography.labelMedium,
    fontSize: 15,
    color: Colors.textSecondary,
  },
  bottomDecoration: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  bottomLine: {
    width: 60,
    height: 4,
    backgroundColor: Colors.textSecondary,
    opacity: 0.15,
    borderRadius: 2,
  },
});
