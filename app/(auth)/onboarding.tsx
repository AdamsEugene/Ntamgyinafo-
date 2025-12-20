import { useState, useRef } from "react";
import {
  ScrollView,
  Dimensions,
  Animated,
  View,
  TouchableOpacity,
} from "react-native";
import { YStack, XStack, Text } from "tamagui";
import { useRouter } from "expo-router";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/design";
import { Button } from "@/components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

type IconName = keyof typeof Ionicons.glyphMap;

interface OnboardingSlide {
  id: number;
  icon: IconName;
  iconColor: string;
  title: string;
  description: string;
  gradient: [string, string];
}

const onboardingSlides: OnboardingSlide[] = [
  {
    id: 1,
    icon: "search",
    iconColor: Colors.primaryGreen,
    title: "Find Your Dream Property",
    description: "Browse thousands of verified properties across Ghana",
    gradient: ["#E8F5E9", "#C8E6C9"],
  },
  {
    id: 2,
    icon: "videocam",
    iconColor: Colors.primaryGreen,
    title: "Visual Tours",
    description: "Experience properties with 360° views and video tours",
    gradient: ["#E3F2FD", "#BBDEFB"],
  },
  {
    id: 3,
    icon: "location",
    iconColor: Colors.primaryGreen,
    title: "Exact Locations",
    description:
      "See precise locations with GPS coordinates on interactive maps",
    gradient: ["#FFF3E0", "#FFE0B2"],
  },
  {
    id: 4,
    icon: "chatbubbles",
    iconColor: Colors.primaryGreen,
    title: "Direct Contact",
    description: "Chat directly with property owners and schedule visits",
    gradient: ["#F3E5F5", "#E1BEE7"],
  },
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleNext = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);

      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      scrollViewRef.current?.scrollTo({
        x: nextSlide * width,
        animated: true,
      });
    } else {
      router.replace("/(auth)/welcome");
    }
  };

  const handleSkip = () => {
    router.replace("/(auth)/welcome");
  };

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (slideIndex !== currentSlide) {
      setCurrentSlide(slideIndex);
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <YStack flex={1} backgroundColor={Colors.surface}>
      {/* Skip Button - Clean White Circular Button */}
      <TouchableOpacity
        onPress={handleSkip}
        style={{
          position: "absolute",
          top: Spacing.xl + 40,
          right: Spacing.lg,
          zIndex: 10,
          backgroundColor: Colors.surface,
          borderRadius: BorderRadius.full,
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.sm,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Text fontSize={14} fontWeight="500" color={Colors.textPrimary}>
          Skip
        </Text>
      </TouchableOpacity>

      {/* Slides - Full Screen */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={width}
        snapToAlignment="center"
        style={{ flex: 1 }}
      >
        {onboardingSlides.map((slide, index) => (
          <View key={slide.id} style={{ width, height }}>
            <LinearGradient
              colors={slide.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: "100%",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Content Container */}
              <YStack
                flex={1}
                alignItems="center"
                justifyContent="center"
                paddingHorizontal={Spacing["2xl"]}
                space="$8"
                paddingTop={100}
                paddingBottom={160}
              >
                {/* Icon Section */}
                <Animated.View
                  style={{
                    opacity: index === currentSlide ? fadeAnim : 1,
                    transform: [
                      {
                        scale:
                          index === currentSlide
                            ? fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.9, 1],
                              })
                            : 1,
                      },
                    ],
                  }}
                >
                  {/* Beautiful Icon Container - Clean White Circle */}
                  <YStack
                    width={width * 0.45}
                    height={width * 0.45}
                    borderRadius={9999}
                    backgroundColor={Colors.surface}
                    alignItems="center"
                    justifyContent="center"
                    borderWidth={1}
                    borderColor={Colors.divider}
                    shadowColor="#000"
                    shadowOffset={{ width: 0, height: 4 }}
                    shadowOpacity={0.08}
                    shadowRadius={12}
                    elevation={4}
                  >
                    <YStack
                      width={width * 0.35}
                      height={width * 0.35}
                      borderRadius={9999}
                      backgroundColor={slide.iconColor + "08"}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Ionicons
                        name={slide.icon}
                        size={width * 0.18}
                        color={slide.iconColor}
                      />
                    </YStack>
                  </YStack>
                </Animated.View>

                {/* Text Section */}
                <Animated.View
                  style={{
                    opacity: index === currentSlide ? fadeAnim : 1,
                  }}
                >
                  <YStack space="$4" alignItems="center" maxWidth={width * 0.9}>
                    <Text
                      fontSize={Typography.headlineLarge.fontSize + 2}
                      fontWeight={Typography.headlineLarge.fontWeight}
                      textAlign="center"
                      color={Colors.textPrimary}
                      letterSpacing={-0.5}
                      lineHeight={32}
                    >
                      {slide.title}
                    </Text>
                    <Text
                      fontSize={Typography.bodyMedium.fontSize + 1}
                      fontWeight={Typography.bodyMedium.fontWeight}
                      textAlign="center"
                      color={Colors.textSecondary}
                      lineHeight={22}
                    >
                      {slide.description}
                    </Text>
                  </YStack>
                </Animated.View>
              </YStack>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>

      {/* Page Indicator - Moved Down Below Content */}
      <XStack
        position="absolute"
        bottom={100}
        left={0}
        right={0}
        justifyContent="center"
        space="$2"
        alignItems="center"
        zIndex={5}
      >
        {onboardingSlides.map((_, idx) => (
          <Animated.View
            key={idx}
            style={{
              width: currentSlide === idx ? 24 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor:
                currentSlide === idx ? Colors.primaryGreen : Colors.divider,
              opacity: currentSlide === idx ? 1 : 0.4,
            }}
          />
        ))}
      </XStack>

      {/* Floating Next/Get Started Button - Bottom */}
      <XStack
        position="absolute"
        bottom={Spacing["2xl"]}
        left={Spacing["2xl"]}
        right={Spacing["2xl"]}
        zIndex={10}
      >
        <Button
          buttonVariant="primary"
          onPress={handleNext}
          width="100%"
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.25}
          shadowRadius={12}
          elevation={6}
        >
          <Text
            fontSize={16}
            fontWeight="600"
            color="#FFFFFF"
            letterSpacing={0.5}
          >
            {currentSlide === onboardingSlides.length - 1
              ? "Get Started"
              : "Next"}
          </Text>
        </Button>
      </XStack>
    </YStack>
  );
}
