import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Typography, Spacing } from "@/constants/design";
import { Button } from "@/components/ui/Button";
import { MapSlide } from "@/components/MapSlide";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface Slide {
  title: string;
  description: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  isMap?: boolean;
}

const slides: Slide[] = [
  {
    title: "Find Your Dream Property",
    description: "Browse thousands of verified properties across Ghana",
    iconName: "search-outline",
  },
  {
    title: "Visual Tours",
    description: "Experience properties with 360° views and video tours",
    iconName: "videocam-outline",
  },
  {
    title: "Exact Locations",
    description:
      "See precise locations with GPS coordinates on interactive maps",
    iconName: "location-outline",
    isMap: true,
  },
  {
    title: "Direct Contact",
    description: "Chat directly with property owners and schedule visits",
    iconName: "chatbubbles-outline",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const insets = useSafeAreaInsets();

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(
      event.nativeEvent.contentOffset.x / SCREEN_WIDTH
    );
    setCurrentSlide(slideIndex);
  };

  const goToNext = () => {
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

  const renderPageIndicator = () => {
    return (
      <View style={styles.pageIndicator}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, currentSlide === index && styles.activeDot]}
          />
        ))}
      </View>
    );
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

        {/* Floating Skip Button */}
        <TouchableOpacity
          style={[styles.skipButton, { top: Spacing["2xl"] + insets.top }]}
          onPress={handleSkip}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* Slides */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {slides.map((slide, index) => (
            <View key={index} style={styles.slide}>
              {slide.isMap ? (
                // Map slide
                <MapSlide title={slide.title} description={slide.description} />
              ) : (
                // Regular slide
                <>
                  <View style={styles.illustrationContainer}>
                    {slide.iconName && (
                      <Ionicons
                        name={slide.iconName}
                        size={120}
                        color={Colors.primaryGreen}
                      />
                    )}
                  </View>
                  <Text style={styles.title}>{slide.title}</Text>
                  <Text style={styles.description}>{slide.description}</Text>
                </>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Floating Page Indicator */}
        <View
          style={[styles.floatingIndicator, { bottom: 120 + insets.bottom }]}
        >
          {renderPageIndicator()}
        </View>

        {/* Floating Action Button */}
        <View
          style={[
            styles.floatingButton,
            { bottom: Spacing["2xl"] + insets.bottom },
          ]}
        >
          <Button
            title={currentSlide === slides.length - 1 ? "Get Started" : "Next"}
            onPress={goToNext}
            variant="primary"
            style={styles.button}
          />
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
  skipButton: {
    position: "absolute",
    right: Spacing.xl,
    zIndex: 20,
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  skipText: {
    ...Typography.labelLarge,
    color: Colors.primaryGreen,
  },
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing["3xl"],
    position: "relative",
  },
  illustrationContainer: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  title: {
    ...Typography.headlineLarge,
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  description: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
  },
  floatingIndicator: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pageIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.divider,
    marginHorizontal: Spacing.xs,
  },
  activeDot: {
    width: 24,
    backgroundColor: Colors.primaryGreen,
  },
  floatingButton: {
    position: "absolute",
    bottom: Spacing["2xl"],
    left: Spacing.xl,
    right: Spacing.xl,
    zIndex: 20,
  },
  button: {
    width: "100%",
  },
});
