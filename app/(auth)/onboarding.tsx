import { useState, useRef } from "react";
import { ScrollView, Dimensions, Animated, View } from "react-native";
import { YStack, XStack, Text } from "tamagui";
import { useRouter } from "expo-router";
import { Colors, Typography, Spacing } from "@/constants/design";
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
    iconColor: "#4CAF50",
    title: "Find Your Dream Property",
    description: "Browse thousands of verified properties across Ghana",
    gradient: ["#E8F5E9", "#C8E6C9"],
  },
  {
    id: 2,
    icon: "videocam",
    iconColor: "#2196F3",
    title: "Visual Tours",
    description: "Experience properties with 360° views and video tours",
    gradient: ["#E3F2FD", "#BBDEFB"],
  },
  {
    id: 3,
    icon: "location",
    iconColor: "#FF6D00",
    title: "Exact Locations",
    description:
      "See precise locations with GPS coordinates on interactive maps",
    gradient: ["#FFF3E0", "#FFE0B2"],
  },
  {
    id: 4,
    icon: "chatbubbles",
    iconColor: "#9C27B0",
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
      {/* Skip Button */}
      <XStack
        justifyContent="flex-end"
        padding={Spacing.lg}
        paddingTop={Spacing["2xl"]}
      >
        <Button buttonVariant="text" onPress={handleSkip} padding={0}>
          <Text fontSize={14} fontWeight="500" color={Colors.textSecondary}>
            Skip
          </Text>
        </Button>
      </XStack>

      {/* Slides */}
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
      >
        {onboardingSlides.map((slide, index) => (
          <View key={slide.id} style={{ width }}>
            <LinearGradient
              colors={slide.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: "100%",
                height: height * 0.6,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
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
                {/* Beautiful Icon Container */}
                <YStack
                  width={width * 0.5}
                  height={width * 0.5}
                  borderRadius={9999}
                  backgroundColor="rgba(255,255,255,0.6)"
                  alignItems="center"
                  justifyContent="center"
                  shadowColor="#000"
                  shadowOffset={{ width: 0, height: 8 }}
                  shadowOpacity={0.15}
                  shadowRadius={16}
                  elevation={8}
                >
                  <YStack
                    width={width * 0.4}
                    height={width * 0.4}
                    borderRadius={9999}
                    backgroundColor={slide.iconColor + "20"}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Ionicons
                      name={slide.icon}
                      size={width * 0.15}
                      color={slide.iconColor}
                    />
                  </YStack>
                </YStack>
              </Animated.View>
            </LinearGradient>

            {/* Content Section */}
            <YStack
              flex={1}
              alignItems="center"
              justifyContent="center"
              paddingHorizontal={Spacing["2xl"]}
              space="$4"
            >
              <Animated.View
                style={{
                  opacity: index === currentSlide ? fadeAnim : 1,
                }}
              >
                <YStack space="$3" alignItems="center">
                  <Text
                    fontSize={Typography.headlineLarge.fontSize}
                    fontWeight={Typography.headlineLarge.fontWeight}
                    textAlign="center"
                    color={Colors.textPrimary}
                    letterSpacing={-0.5}
                  >
                    {slide.title}
                  </Text>
                  <Text
                    fontSize={Typography.bodyMedium.fontSize + 2}
                    fontWeight={Typography.bodyMedium.fontWeight}
                    textAlign="center"
                    color={Colors.textSecondary}
                    maxWidth={width * 0.85}
                    lineHeight={22}
                  >
                    {slide.description}
                  </Text>
                </YStack>
              </Animated.View>
            </YStack>
          </View>
        ))}
      </ScrollView>

      {/* Page Indicator & Button */}
      <YStack
        space="$5"
        padding={Spacing["2xl"]}
        paddingBottom={Spacing["3xl"]}
      >
        {/* Beautiful Page Indicator */}
        <XStack justifyContent="center" space="$2" alignItems="center">
          {onboardingSlides.map((_, index) => (
            <Animated.View
              key={index}
              style={{
                width: currentSlide === index ? 32 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor:
                  currentSlide === index ? Colors.primaryGreen : Colors.divider,
                opacity: currentSlide === index ? 1 : 0.5,
              }}
            />
          ))}
        </XStack>

        {/* Next/Get Started Button */}
        <Button
          buttonVariant="primary"
          onPress={handleNext}
          width="100%"
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.2}
          shadowRadius={8}
          elevation={4}
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
      </YStack>
    </YStack>
  );
}
