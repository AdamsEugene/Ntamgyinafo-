import { useState, useRef, useEffect } from "react";
import {
  ScrollView,
  Dimensions,
  Animated,
  View,
  TouchableOpacity,
  Easing,
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

  // Continuous radiating animation
  const radiateAnim1 = useRef(new Animated.Value(0)).current;
  const radiateAnim2 = useRef(new Animated.Value(0)).current;
  const radiateAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous radiating animation - never stops
    const createRadiateAnimation = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    createRadiateAnimation(radiateAnim1, 0).start();
    createRadiateAnimation(radiateAnim2, 667).start();
    createRadiateAnimation(radiateAnim3, 1334).start();
  }, [radiateAnim1, radiateAnim2, radiateAnim3]);

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

  // Generate static bubble positions - corners and some anywhere
  const generateBubbles = () => {
    return [
      // Corners
      { id: 0, size: 100, left: -30, top: -30 }, // Top-left corner
      { id: 1, size: 80, left: width + 10, top: -20 }, // Top-right corner
      { id: 2, size: 90, left: -25, top: height - 50 }, // Bottom-left corner
      { id: 3, size: 110, left: width - 20, top: height - 40 }, // Bottom-right corner
      // Some anywhere
      { id: 4, size: 70, left: width * 0.2, top: height * 0.15 },
      { id: 5, size: 85, left: width * 0.75, top: height * 0.25 },
      { id: 6, size: 65, left: width * 0.15, top: height * 0.7 },
      { id: 7, size: 95, left: width * 0.8, top: height * 0.65 },
    ];
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
        <Text fontSize={14} fontWeight="600" color={Colors.textPrimary}>
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
        {onboardingSlides.map((slide, index) => {
          const bubbles = generateBubbles();

          return (
            <View key={slide.id} style={{ width, height }}>
              <LinearGradient
                colors={slide.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                }}
              >
                {/* Gradient Bubbles Background */}
                {bubbles.map((bubble) => (
                  <Animated.View
                    key={bubble.id}
                    style={{
                      position: "absolute",
                      width: bubble.size,
                      height: bubble.size,
                      borderRadius: bubble.size / 2,
                      backgroundColor: slide.iconColor + "15",
                      left: `${bubble.left}%`,
                      top: `${bubble.top}%`,
                      opacity: 0.6,
                      transform: [
                        {
                          scale: radiateAnim1.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 1.2],
                          }),
                        },
                      ],
                    }}
                  />
                ))}

                {/* Content Container */}
                <YStack
                  flex={1}
                  alignItems="center"
                  justifyContent="center"
                  paddingHorizontal={Spacing["2xl"]}
                  space="$8"
                  paddingTop={100}
                  paddingBottom={160}
                  zIndex={2}
                >
                  {/* Icon Section with Continuous Radiating Effect */}
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
                    {/* Radiating Rings */}
                    <View
                      style={{
                        position: "relative",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {/* Ring 1 */}
                      <Animated.View
                        style={{
                          position: "absolute",
                          width: width * 0.45,
                          height: width * 0.45,
                          borderRadius: (width * 0.45) / 2,
                          borderWidth: 2,
                          borderColor: slide.iconColor + "30",
                          opacity: radiateAnim1.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.6, 0],
                          }),
                          transform: [
                            {
                              scale: radiateAnim1.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 1.5],
                              }),
                            },
                          ],
                        }}
                      />

                      {/* Ring 2 */}
                      <Animated.View
                        style={{
                          position: "absolute",
                          width: width * 0.45,
                          height: width * 0.45,
                          borderRadius: (width * 0.45) / 2,
                          borderWidth: 2,
                          borderColor: slide.iconColor + "30",
                          opacity: radiateAnim2.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.6, 0],
                          }),
                          transform: [
                            {
                              scale: radiateAnim2.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 1.5],
                              }),
                            },
                          ],
                        }}
                      />

                      {/* Ring 3 */}
                      <Animated.View
                        style={{
                          position: "absolute",
                          width: width * 0.45,
                          height: width * 0.45,
                          borderRadius: (width * 0.45) / 2,
                          borderWidth: 2,
                          borderColor: slide.iconColor + "30",
                          opacity: radiateAnim3.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.6, 0],
                          }),
                          transform: [
                            {
                              scale: radiateAnim3.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 1.5],
                              }),
                            },
                          ],
                        }}
                      />

                      {/* Main Icon Container - Clean White Circle */}
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
                    </View>
                  </Animated.View>

                  {/* Text Section */}
                  <Animated.View
                    style={{
                      opacity: index === currentSlide ? fadeAnim : 1,
                    }}
                  >
                    <YStack
                      space="$4"
                      alignItems="center"
                      maxWidth={width * 0.9}
                    >
                      <Text
                        fontSize={Typography.headlineLarge.fontSize + 4}
                        fontWeight="700"
                        textAlign="center"
                        color={Colors.textPrimary}
                        letterSpacing={-0.5}
                        lineHeight={36}
                      >
                        {slide.title}
                      </Text>
                      <Text
                        fontSize={Typography.bodyMedium.fontSize + 2}
                        fontWeight="500"
                        textAlign="center"
                        color={Colors.textSecondary}
                        lineHeight={24}
                      >
                        {slide.description}
                      </Text>
                    </YStack>
                  </Animated.View>
                </YStack>
              </LinearGradient>
            </View>
          );
        })}
      </ScrollView>

      {/* Page Indicator - Only Show Active */}
      {onboardingSlides.map((_, idx) => (
        <XStack
          key={idx}
          position="absolute"
          bottom={100}
          left={0}
          right={0}
          justifyContent="center"
          alignItems="center"
          zIndex={5}
          opacity={currentSlide === idx ? 1 : 0}
        >
          <Animated.View
            style={{
              width: 24,
              height: 8,
              borderRadius: 4,
              backgroundColor: Colors.primaryGreen,
            }}
          />
        </XStack>
      ))}

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
            fontWeight="700"
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
