import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing,
  interpolate,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { Colors, Typography, Spacing } from "@/constants/design";

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface AnimatedSuccessOverlayProps {
  onComplete: () => void;
  title?: string;
  subtitle?: string;
  backgroundColor?: string;
  duration?: number;
}

// Confetti particle component
const ConfettiParticle = ({
  index,
  startAnimation,
}: {
  index: number;
  startAnimation: boolean;
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  const colors = [
    "#FFD700",
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E9",
    "#F8B500",
  ];
  const color = colors[index % colors.length];
  const angle = index * 30 * (Math.PI / 180);
  const distance = 120 + Math.random() * 80;

  useEffect(() => {
    if (startAnimation) {
      const targetX = Math.cos(angle) * distance;
      const targetY = Math.sin(angle) * distance;

      scale.value = withSequence(
        withDelay(400, withSpring(1, { damping: 8, stiffness: 200 })),
        withDelay(600, withTiming(0, { duration: 400 }))
      );
      translateX.value = withDelay(
        400,
        withTiming(targetX, { duration: 800, easing: Easing.out(Easing.cubic) })
      );
      translateY.value = withDelay(
        400,
        withTiming(targetY + 50, {
          duration: 800,
          easing: Easing.out(Easing.cubic),
        })
      );
      rotate.value = withDelay(
        400,
        withTiming(360 + Math.random() * 360, { duration: 800 })
      );
      opacity.value = withDelay(1000, withTiming(0, { duration: 300 }));
    }
  }, [
    angle,
    distance,
    opacity,
    rotate,
    scale,
    startAnimation,
    translateX,
    translateY,
  ]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const size = 8 + Math.random() * 8;
  const isCircle = index % 3 === 0;

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: isCircle ? size : size * 0.4,
          backgroundColor: color,
          borderRadius: isCircle ? size / 2 : 2,
        },
        animatedStyle,
      ]}
    />
  );
};

export const AnimatedSuccessOverlay = ({
  onComplete,
  title = "Success!",
  subtitle = "Redirecting...",
  backgroundColor = Colors.primaryGreen,
  duration = 2500,
}: AnimatedSuccessOverlayProps) => {
  const circleScale = useSharedValue(0);
  const circleOpacity = useSharedValue(1);
  const checkProgress = useSharedValue(0);
  const ringScale = useSharedValue(0);
  const ringOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(30);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Step 1: Circle appears
    circleScale.value = withSpring(1, { damping: 12, stiffness: 100 });

    // Step 2: Checkmark draws
    checkProgress.value = withDelay(
      300,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
    );

    // Step 3: Ring explosion
    ringScale.value = withDelay(800, withTiming(2.5, { duration: 500 }));
    ringOpacity.value = withDelay(
      800,
      withSequence(
        withTiming(0.8, { duration: 100 }),
        withTiming(0, { duration: 400 })
      )
    );

    // Step 4: Show confetti
    setTimeout(() => setShowConfetti(true), 800);

    // Step 5: Text appears
    textOpacity.value = withDelay(1000, withTiming(1, { duration: 400 }));
    textTranslateY.value = withDelay(
      1000,
      withSpring(0, { damping: 12, stiffness: 100 })
    );

    // Step 6: Navigate
    const timer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [
    checkProgress,
    circleScale,
    duration,
    onComplete,
    ringOpacity,
    ringScale,
    textOpacity,
    textTranslateY,
  ]);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
    opacity: circleOpacity.value,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  // Checkmark path for SVG
  const checkmarkPath = "M 15 45 L 35 65 L 70 25";

  return (
    <View style={[styles.successOverlay, { backgroundColor }]}>
      <StatusBar style="light" />

      {/* Confetti particles */}
      <View style={styles.confettiContainer}>
        {showConfetti &&
          Array.from({ length: 12 }).map((_, index) => (
            <ConfettiParticle
              key={index}
              index={index}
              startAnimation={showConfetti}
            />
          ))}
      </View>

      {/* Explosion ring */}
      <Animated.View style={[styles.explosionRing, ringStyle]} />

      {/* Main circle with checkmark */}
      <Animated.View style={[styles.successCircle, circleStyle]}>
        <Svg width={85} height={85} viewBox="0 0 85 85">
          <AnimatedPath
            d={checkmarkPath}
            stroke="#FFFFFF"
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray={100}
            strokeDashoffset={interpolate(
              checkProgress.value,
              [0, 1],
              [100, 0]
            )}
          />
        </Svg>
      </Animated.View>

      {/* Text */}
      <Animated.View style={[styles.successTextContainer, textStyle]}>
        <Text style={styles.successTitle}>{title}</Text>
        <Text style={styles.successSubtitle}>{subtitle}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  successOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  confettiContainer: {
    position: "absolute",
    width: 1,
    height: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  explosionRing: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.6)",
    backgroundColor: "transparent",
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  successTextContainer: {
    alignItems: "center",
    marginTop: Spacing.xl,
  },
  successTitle: {
    ...Typography.headlineLarge,
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  successSubtitle: {
    ...Typography.bodyMedium,
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
});

export default AnimatedSuccessOverlay;
