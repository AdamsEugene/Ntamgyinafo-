import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
  FadeIn,
} from "react-native-reanimated";
import { Colors, Typography, Spacing } from "@/constants/design";
import { useTheme } from "@/contexts/ThemeContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface Slide {
  title: string;
  description: string;
  iconName: keyof typeof Ionicons.glyphMap;
}

const slides: Slide[] = [
  {
    title: "Find Your Dream Property",
    description:
      "Browse thousands of verified properties across Ghana with detailed listings and photos",
    iconName: "search-outline",
  },
  {
    title: "Visual Tours",
    description:
      "Experience properties with immersive 360° views and professional video tours",
    iconName: "videocam-outline",
  },
  {
    title: "Exact Locations",
    description:
      "See precise locations with GPS coordinates on interactive maps",
    iconName: "location-outline",
  },
  {
    title: "Direct Contact",
    description:
      "Chat directly with property owners and schedule visits at your convenience",
    iconName: "chatbubbles-outline",
  },
];

// Animated icon component with floating effect
const AnimatedIcon = ({
  iconName,
  isActive,
}: {
  iconName: keyof typeof Ionicons.glyphMap;
  isActive: boolean;
}) => {
  const floatY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      // Floating animation
      floatY.value = withRepeat(
        withSequence(
          withTiming(-10, {
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      // Subtle scale pulse
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 2000 }),
          withTiming(1, { duration: 2000 })
        ),
        -1,
        true
      );
      // Subtle rotation
      rotate.value = withRepeat(
        withSequence(
          withTiming(3, { duration: 3000 }),
          withTiming(-3, { duration: 3000 })
        ),
        -1,
        true
      );
    }
  }, [isActive, floatY, scale, rotate]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.iconWrapper, animatedStyle]}>
      <View style={styles.iconGlow} />
      <View style={styles.iconCircle}>
        <Ionicons name={iconName} size={80} color={Colors.primaryGreen} />
      </View>
    </Animated.View>
  );
};

// Animated page indicator
const PageIndicator = ({
  total,
  current,
  colors,
  isDark,
}: {
  total: number;
  current: number;
  colors: any;
  isDark: boolean;
}) => {
  return (
    <View style={styles.pageIndicator}>
      {Array.from({ length: total }).map((_, index) => {
        const isActive = current === index;
        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: isActive ? 32 : 10,
                backgroundColor: isActive
                  ? colors.primary
                  : isDark
                  ? "rgba(255, 255, 255, 0.2)"
                  : "rgba(0, 0, 0, 0.15)",
              },
            ]}
          />
        );
      })}
    </View>
  );
};

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  // Animation values
  const buttonScale = useSharedValue(1);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(30);

  useEffect(() => {
    contentOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    contentTranslateY.value = withDelay(
      300,
      withSpring(0, { damping: 12, stiffness: 100 })
    );
  }, [contentOpacity, contentTranslateY]);

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(
      event.nativeEvent.contentOffset.x / SCREEN_WIDTH
    );
    if (slideIndex !== currentSlide) {
      setCurrentSlide(slideIndex);
    }
  };

  const goToNext = () => {
    // Button press animation
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );

    if (currentSlide < slides.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (currentSlide + 1) * SCREEN_WIDTH,
        animated: true,
      });
    } else {
      router.replace("/(auth)/welcome");
    }
  };

  const handleSkip = () => {
    router.replace("/(auth)/welcome");
  };

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Decorative Background Elements */}
        <View style={styles.decorativeBackground}>
          <View
            style={[
              styles.circle1,
              { backgroundColor: colors.primary, opacity: 0.08 },
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
              { backgroundColor: colors.primary, opacity: 0.03 },
            ]}
          />
        </View>

        {/* Floating Skip Button */}
        <Animated.View
          entering={FadeIn.delay(600).duration(400)}
          style={[styles.skipButtonContainer, { top: insets.top + Spacing.lg }]}
        >
          <TouchableOpacity
            onPress={handleSkip}
            style={[
              styles.skipButton,
              { backgroundColor: colors.surface, borderColor: colors.divider },
            ]}
            activeOpacity={0.8}
          >
            <Text style={[styles.skipText, { color: colors.textSecondary }]}>
              Skip
            </Text>
            <View
              style={[
                styles.skipIconContainer,
                {
                  backgroundColor: isDark
                    ? "rgba(34, 197, 94, 0.2)"
                    : "rgba(34, 197, 94, 0.1)",
                },
              ]}
            >
              <Ionicons
                name="chevron-forward"
                size={14}
                color={colors.primary}
              />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Slides */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
        >
          {slides.map((slide, index) => (
            <View key={index} style={styles.slide}>
              <Animated.View style={[styles.slideContent, contentStyle]}>
                {/* Illustration Container */}
                <View style={styles.illustrationContainer}>
                  <View style={styles.illustrationBackground}>
                    <View style={styles.illustrationRing1} />
                    <View style={styles.illustrationRing2} />
                    <AnimatedIcon
                      iconName={slide.iconName}
                      isActive={currentSlide === index}
                    />
                  </View>
                </View>

                {/* Text Content */}
                <View style={styles.textContent}>
                  <View
                    style={[
                      styles.slideNumberBadge,
                      {
                        backgroundColor: isDark
                          ? "rgba(34, 197, 94, 0.2)"
                          : "rgba(34, 197, 94, 0.1)",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.slideNumberText,
                        { color: colors.primary },
                      ]}
                    >
                      {index + 1} of {slides.length}
                    </Text>
                  </View>

                  <Text style={[styles.title, { color: colors.text }]}>
                    {slide.title}
                  </Text>

                  <Text
                    style={[
                      styles.description,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {slide.description}
                  </Text>
                </View>
              </Animated.View>
            </View>
          ))}
        </ScrollView>

        {/* Bottom Section */}
        <View
          style={[
            styles.bottomSection,
            { paddingBottom: insets.bottom + Spacing.lg },
          ]}
        >
          {/* Page Indicator */}
          <PageIndicator
            total={slides.length}
            current={currentSlide}
            colors={colors}
            isDark={isDark}
          />

          {/* Next Button */}
          <Animated.View style={[styles.buttonContainer, buttonStyle]}>
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: colors.primary }]}
              onPress={goToNext}
              activeOpacity={0.9}
            >
              <Text style={styles.nextButtonText}>
                {currentSlide === slides.length - 1
                  ? "Get Started"
                  : "Continue"}
              </Text>
              <View style={styles.buttonIconContainer}>
                <Ionicons
                  name={
                    currentSlide === slides.length - 1
                      ? "checkmark"
                      : "arrow-forward"
                  }
                  size={20}
                  color={colors.primary}
                />
              </View>
            </TouchableOpacity>
          </Animated.View>
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
  circle3: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.4,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Colors.primaryGreen,
    opacity: 0.03,
  },
  skipButtonContainer: {
    position: "absolute",
    right: Spacing.lg,
    zIndex: 100,
  },
  skipButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingVertical: Spacing.sm,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.sm,
    borderRadius: 24,
    gap: Spacing.xs,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.15)",
  },
  skipText: {
    ...Typography.labelMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  skipIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    paddingTop: SCREEN_HEIGHT * 0.12,
  },
  slideContent: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  illustrationContainer: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  illustrationBackground: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  illustrationRing1: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: SCREEN_WIDTH * 0.35,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.1)",
  },
  illustrationRing2: {
    position: "absolute",
    width: "80%",
    height: "80%",
    borderRadius: SCREEN_WIDTH * 0.28,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.15)",
    borderStyle: "dashed",
  },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconGlow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  textContent: {
    alignItems: "center",
    paddingHorizontal: Spacing.md,
  },
  slideNumberBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: 20,
    marginBottom: Spacing.lg,
  },
  slideNumberText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primaryGreen,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    ...Typography.headlineLarge,
    fontSize: 28,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.md,
    lineHeight: 36,
  },
  description: {
    ...Typography.bodyMedium,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 26,
    maxWidth: 320,
  },
  bottomSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    backgroundColor: "transparent",
  },
  pageIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  dot: {
    height: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    width: "100%",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primaryGreen,
    paddingVertical: Spacing.md + 4,
    paddingHorizontal: Spacing.xl,
    borderRadius: 16,
    gap: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  nextButtonText: {
    ...Typography.labelLarge,
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  buttonIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
});
