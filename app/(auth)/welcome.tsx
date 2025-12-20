import { useEffect, useRef } from "react";
import { YStack, Text } from "tamagui";
import { useRouter } from "expo-router";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/design";
import { Button } from "@/components/ui/Button";
import { LinearGradient } from "expo-linear-gradient";
import { Animated, Easing } from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  return (
    <LinearGradient
      colors={[Colors.primaryDark, Colors.primaryGreen, Colors.primaryLight]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        padding={Spacing["2xl"]}
        space="$8"
      >
        {/* Logo with animation */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          }}
        >
          <YStack alignItems="center" space="$4">
            <YStack
              width={120}
              height={120}
              borderRadius={BorderRadius.xlarge}
              backgroundColor="rgba(255,255,255,0.25)"
              alignItems="center"
              justifyContent="center"
              shadowColor="#000"
              shadowOffset={{ width: 0, height: 12 }}
              shadowOpacity={0.3}
              shadowRadius={20}
              elevation={12}
            >
              <Text fontSize={56}>🏠</Text>
            </YStack>

            <YStack alignItems="center" space="$2">
              <Text
                fontSize={Typography.displayMedium.fontSize}
                fontWeight={Typography.displayMedium.fontWeight}
                color="#FFFFFF"
                letterSpacing={Typography.displayMedium.letterSpacing}
                textShadowColor="rgba(0,0,0,0.2)"
                textShadowOffset={{ width: 0, height: 2 }}
                textShadowRadius={4}
              >
                Ntamgyinafoɔ
              </Text>

              <Text
                fontSize={Typography.headlineMedium.fontSize}
                fontWeight={Typography.headlineMedium.fontWeight}
                color="rgba(255,255,255,0.95)"
                textAlign="center"
                letterSpacing={0.5}
              >
                The #1 Property App in Ghana
              </Text>
            </YStack>
          </YStack>
        </Animated.View>

        {/* Buttons with staggered animation */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            width: "100%",
          }}
        >
          <YStack width="100%" space="$3">
            <Button
              buttonVariant="primary"
              onPress={() => router.push("/(auth)/login")}
              backgroundColor="#FFFFFF"
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
                color={Colors.primaryGreen}
                letterSpacing={0.5}
              >
                Login
              </Text>
            </Button>

            <Button
              buttonVariant="secondary"
              onPress={() => router.push("/(auth)/register")}
              borderColor="#FFFFFF"
              borderWidth={2}
              width="100%"
              backgroundColor="transparent"
            >
              <Text
                fontSize={16}
                fontWeight="600"
                color="#FFFFFF"
                letterSpacing={0.5}
              >
                Create Account
              </Text>
            </Button>

            <Button
              buttonVariant="text"
              onPress={() => router.replace("/(tabs)")}
              width="100%"
              marginTop={Spacing.md}
            >
              <Text
                fontSize={14}
                fontWeight="400"
                color="rgba(255,255,255,0.9)"
                letterSpacing={0.3}
              >
                Explore as Guest
              </Text>
            </Button>
          </YStack>
        </Animated.View>
      </YStack>
    </LinearGradient>
  );
}
