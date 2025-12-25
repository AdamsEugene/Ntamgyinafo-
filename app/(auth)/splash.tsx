import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  withRepeat,
  Easing,
  interpolate,
  interpolateColor,
} from "react-native-reanimated";
import { Colors, Spacing } from "@/constants/design";
import { useTheme } from "@/contexts/ThemeContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Floating particle component
const FloatingParticle = ({
  index,
  startAnimation,
}: {
  index: number;
  startAnimation: boolean;
}) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  // Random positions and sizes
  const size = 4 + Math.random() * 8;
  const startX = Math.random() * SCREEN_WIDTH;
  const startY = SCREEN_HEIGHT + 50 + Math.random() * 100;
  const duration = 3000 + Math.random() * 2000;
  const delay = index * 200 + Math.random() * 500;

  useEffect(() => {
    if (startAnimation) {
      opacity.value = withDelay(
        delay,
        withSequence(
          withTiming(0.6 + Math.random() * 0.4, { duration: 500 }),
          withDelay(duration - 1000, withTiming(0, { duration: 500 }))
        )
      );
      scale.value = withDelay(delay, withSpring(1, { damping: 10 }));
      translateY.value = withDelay(
        delay,
        withTiming(-SCREEN_HEIGHT - 100, {
          duration,
          easing: Easing.out(Easing.quad),
        })
      );
      translateX.value = withDelay(
        delay,
        withTiming((Math.random() - 0.5) * 100, {
          duration,
          easing: Easing.inOut(Easing.sin),
        })
      );
    }
  }, [startAnimation, delay, duration, opacity, scale, translateX, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: startX,
          top: startY,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
        },
        animatedStyle,
      ]}
    />
  );
};

// Animated ring component
const PulsingRing = ({
  size,
  delay,
  color,
}: {
  size: number;
  delay: number;
  color: string;
}) => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.3, { duration: 2000, easing: Easing.out(Easing.ease) }),
          withTiming(0.8, { duration: 0 })
        ),
        -1,
        false
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.6, { duration: 200 }),
          withTiming(0, { duration: 1800 })
        ),
        -1,
        false
      )
    );
  }, [delay, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: color,
        },
        animatedStyle,
      ]}
    />
  );
};

export default function SplashScreen() {
  const router = useRouter();
  const [showParticles, setShowParticles] = useState(false);

  // Animation values
  const logoScale = useSharedValue(0);
  const logoRotate = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(30);
  const taglineOpacity = useSharedValue(0);
  const taglineScale = useSharedValue(0.8);
  const progressWidth = useSharedValue(0);
  const bgGradientProgress = useSharedValue(0);

  useEffect(() => {
    // Start particles
    setTimeout(() => setShowParticles(true), 500);

    // Logo entrance
    logoScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    logoRotate.value = withTiming(360, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });

    // Glow pulse
    glowOpacity.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1200 }),
          withTiming(0.3, { duration: 1200 })
        ),
        -1,
        true
      )
    );

    // Background gradient
    bgGradientProgress.value = withTiming(1, { duration: 2000 });

    // Text entrance
    textOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));
    textTranslateY.value = withDelay(
      600,
      withSpring(0, { damping: 12, stiffness: 100 })
    );

    // Tagline entrance
    taglineOpacity.value = withDelay(900, withTiming(1, { duration: 500 }));
    taglineScale.value = withDelay(
      900,
      withSpring(1, { damping: 10, stiffness: 100 })
    );

    // Progress bar
    progressWidth.value = withDelay(
      500,
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
    );

    // Navigate after animation
    const timer = setTimeout(() => {
      router.replace("/(auth)/onboarding");
    }, 3000);

    return () => clearTimeout(timer);
  }, [
    router,
    logoScale,
    logoRotate,
    glowOpacity,
    textOpacity,
    textTranslateY,
    taglineOpacity,
    taglineScale,
    progressWidth,
    bgGradientProgress,
  ]);

  // Animated styles
  const logoContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotate.value}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [
      { scale: interpolate(glowOpacity.value, [0.3, 0.8], [1, 1.2]) },
    ],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ scale: taglineScale.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  const bgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      bgGradientProgress.value,
      [0, 1],
      ["#1a472a", Colors.primaryGreen]
    ),
  }));

  return (
    <>
      <StatusBar style="light" />
      <Animated.View style={[styles.container, bgStyle]}>
        {/* Floating particles */}
        {showParticles &&
          Array.from({ length: 15 }).map((_, index) => (
            <FloatingParticle
              key={index}
              index={index}
              startAnimation={showParticles}
            />
          ))}

        {/* Decorative shapes */}
        <View style={styles.decorativeShape1} />
        <View style={styles.decorativeShape2} />
        <View style={styles.decorativeShape3} />

        {/* Main content */}
        <View style={styles.content}>
          {/* Logo section */}
          <View style={styles.logoSection}>
            {/* Pulsing rings */}
            <PulsingRing
              size={200}
              delay={0}
              color="rgba(255, 255, 255, 0.3)"
            />
            <PulsingRing
              size={200}
              delay={700}
              color="rgba(255, 255, 255, 0.2)"
            />
            <PulsingRing
              size={200}
              delay={1400}
              color="rgba(255, 255, 255, 0.1)"
            />

            {/* Glow effect */}
            <Animated.View style={[styles.logoGlow, glowStyle]} />

            {/* Logo circle */}
            <Animated.View style={[styles.logoCircle, logoContainerStyle]}>
              <View style={styles.logoInner}>
                <Ionicons name="home" size={70} color={Colors.primaryGreen} />
              </View>
            </Animated.View>
          </View>

          {/* App name */}
          <Animated.View style={[styles.textContainer, textStyle]}>
            <Text style={styles.appName}>Ntamgyinafoɔ</Text>
            <View style={styles.appNameUnderline} />
          </Animated.View>

          {/* Tagline */}
          <Animated.View style={[styles.taglineContainer, taglineStyle]}>
            <View style={styles.taglineDot} />
            <Text style={styles.tagline}>Find</Text>
            <View style={styles.taglineDot} />
            <Text style={styles.tagline}>Visit</Text>
            <View style={styles.taglineDot} />
            <Text style={styles.tagline}>Own</Text>
            <View style={styles.taglineDot} />
          </Animated.View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressBar, progressStyle]} />
          </View>
          <Text style={styles.loadingText}>Loading your dream home...</Text>
        </View>

        {/* Bottom decorative element */}
        <View style={styles.bottomWave}>
          <View style={styles.waveShape1} />
          <View style={styles.waveShape2} />
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  // Decorative shapes
  decorativeShape1: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  decorativeShape2: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.3,
    left: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  decorativeShape3: {
    position: "absolute",
    bottom: SCREEN_HEIGHT * 0.2,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoSection: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl * 2,
  },
  logoGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  logoInner: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  appName: {
    fontSize: 38,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 1,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appNameUnderline: {
    width: 60,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 2,
    marginTop: Spacing.sm,
  },
  taglineContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  taglineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  tagline: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  progressContainer: {
    position: "absolute",
    bottom: SCREEN_HEIGHT * 0.12,
    alignItems: "center",
    width: "100%",
    paddingHorizontal: Spacing.xl * 2,
  },
  progressTrack: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.7)",
    letterSpacing: 0.5,
  },
  bottomWave: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    overflow: "hidden",
  },
  waveShape1: {
    position: "absolute",
    bottom: -30,
    left: -20,
    width: SCREEN_WIDTH * 0.7,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    transform: [{ rotate: "-5deg" }],
  },
  waveShape2: {
    position: "absolute",
    bottom: -40,
    right: -20,
    width: SCREEN_WIDTH * 0.6,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    transform: [{ rotate: "5deg" }],
  },
});
