import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
  Text,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Spacing, Typography } from "@/constants/design";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(50)).current;
  const gradientOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Create beautiful entrance animation sequence
    Animated.sequence([
      // Logo scale and rotate entrance
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 40,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // Fade in content
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(textSlide, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(gradientOpacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Continuous pulse animation for logo glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
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

    // Complete initialization after minimum time
    const timer = setTimeout(() => {
      router.replace("/(auth)/onboarding");
    }, 2800);

    return () => clearTimeout(timer);
  }, [
    router,
    fadeAnim,
    logoScale,
    logoRotate,
    textSlide,
    gradientOpacity,
    pulseAnim,
  ]);

  const logoRotation = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["-180deg", "0deg"],
  });

  return (
    <>
      <StatusBar hidden />
      <View style={styles.container}>
        {/* Beautiful gradient background layers */}
        <Animated.View
          style={[
            styles.gradientLayer1,
            {
              opacity: gradientOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.6],
              }),
            },
          ]}
        />
        <Animated.View
          style={[
            styles.gradientLayer2,
            {
              opacity: gradientOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.4],
              }),
            },
          ]}
        />
        <View style={styles.gradientLayer3} />

        {/* Animated decorative circles */}
        <Animated.View
          style={[
            styles.decorativeCircle1,
            {
              transform: [
                {
                  scale: pulseAnim.interpolate({
                    inputRange: [1, 1.15],
                    outputRange: [1, 1.1],
                  }),
                },
              ],
              opacity: gradientOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.15],
              }),
            },
          ]}
        />
        <Animated.View
          style={[
            styles.decorativeCircle2,
            {
              transform: [
                {
                  scale: pulseAnim.interpolate({
                    inputRange: [1, 1.15],
                    outputRange: [1, 1.2],
                  }),
                },
              ],
              opacity: gradientOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.1],
              }),
            },
          ]}
        />

        {/* Main Content */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Logo Container with beautiful effects */}
          <View style={styles.logoWrapper}>
            {/* Outer glow rings */}
            <Animated.View
              style={[
                styles.outerGlow,
                {
                  transform: [{ scale: pulseAnim }, { rotate: logoRotation }],
                  opacity: pulseAnim.interpolate({
                    inputRange: [1, 1.15],
                    outputRange: [0.3, 0.5],
                  }),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.middleGlow,
                {
                  transform: [{ scale: pulseAnim }],
                  opacity: pulseAnim.interpolate({
                    inputRange: [1, 1.15],
                    outputRange: [0.4, 0.6],
                  }),
                },
              ]}
            />

            {/* Logo Circle */}
            <Animated.View
              style={[
                styles.logoCircle,
                {
                  transform: [{ scale: logoScale }],
                },
              ]}
            >
              <View style={styles.logoInner}>
                <Ionicons name="home" size={85} color={Colors.primaryGreen} />
              </View>
            </Animated.View>
          </View>

          {/* App Name */}
          <Animated.Text
            style={[
              styles.appName,
              {
                opacity: fadeAnim,
                transform: [{ translateY: textSlide }],
              },
            ]}
          >
            Ntamgyinafoɔ
          </Animated.Text>

          {/* Tagline */}
          <Animated.Text
            style={[
              styles.tagline,
              {
                opacity: fadeAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 0, 1],
                }),
                transform: [{ translateY: textSlide }],
              },
            ]}
          >
            Find. Visit. Own.
          </Animated.Text>
        </Animated.View>

        {/* Loading Indicator */}
        <Animated.View
          style={[
            styles.loadingContainer,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 0.7, 1],
                outputRange: [0, 0, 1],
              }),
            },
          ]}
        >
          <ActivityIndicator size="large" color="#FFFFFF" />
        </Animated.View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryGreen,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
  // Gradient layers for depth
  gradientLayer1: {
    position: "absolute",
    top: -SCREEN_HEIGHT * 0.3,
    left: -SCREEN_WIDTH * 0.2,
    width: SCREEN_WIDTH * 1.4,
    height: SCREEN_HEIGHT * 0.6,
    borderRadius: SCREEN_WIDTH * 0.7,
    backgroundColor: Colors.primaryLight,
    transform: [{ rotate: "-15deg" }],
  },
  gradientLayer2: {
    position: "absolute",
    bottom: -SCREEN_HEIGHT * 0.2,
    right: -SCREEN_WIDTH * 0.15,
    width: SCREEN_WIDTH * 1.3,
    height: SCREEN_HEIGHT * 0.5,
    borderRadius: SCREEN_WIDTH * 0.65,
    backgroundColor: "#66BB6A",
    transform: [{ rotate: "20deg" }],
  },
  gradientLayer3: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.3,
    left: SCREEN_WIDTH * 0.5,
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    borderRadius: SCREEN_WIDTH * 0.4,
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    transform: [{ translateX: -SCREEN_WIDTH * 0.4 }],
  },
  // Decorative elements
  decorativeCircle1: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.15,
    right: SCREEN_WIDTH * 0.1,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  decorativeCircle2: {
    position: "absolute",
    bottom: SCREEN_HEIGHT * 0.2,
    left: SCREEN_WIDTH * 0.15,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  logoWrapper: {
    width: 180,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing["2xl"],
    position: "relative",
  },
  outerGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  middleGlow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 1)",
  },
  logoInner: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  appName: {
    fontSize: 44,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: Spacing.md,
    letterSpacing: 2,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  tagline: {
    fontSize: 16,
    fontWeight: "400",
    color: "rgba(255, 255, 255, 0.92)",
    letterSpacing: 4,
    textTransform: "uppercase",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  loadingContainer: {
    position: "absolute",
    bottom: Spacing["3xl"],
    alignItems: "center",
    zIndex: 10,
  },
});
