import { useEffect, useState } from "react";
import { YStack, Text, Spinner } from "tamagui";
import { useRouter } from "expo-router";
import { Colors, Typography } from "@/constants/design";
import { LinearGradient } from "expo-linear-gradient";
import { Animated, Easing } from "react-native";

export default function SplashScreen() {
  const router = useRouter();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    // Fade in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
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

    // Navigate after delay
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        router.replace("/(auth)/onboarding");
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, router]);

  return (
    <LinearGradient
      colors={[Colors.primaryDark, Colors.primaryGreen, Colors.primaryLight]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <YStack flex={1} alignItems="center" justifyContent="center" space="$6">
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          {/* Logo with beautiful shadow effect */}
          <YStack
            width={140}
            height={140}
            borderRadius={32}
            backgroundColor="rgba(255,255,255,0.25)"
            alignItems="center"
            justifyContent="center"
            shadowColor="#000"
            shadowOffset={{ width: 0, height: 8 }}
            shadowOpacity={0.3}
            shadowRadius={16}
            elevation={10}
          >
            <Text fontSize={64}>🏠</Text>
          </YStack>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <YStack alignItems="center" space="$2">
            <Text
              fontSize={Typography.displayLarge.fontSize}
              fontWeight={Typography.displayLarge.fontWeight}
              color="#FFFFFF"
              letterSpacing={Typography.displayLarge.letterSpacing}
              textShadowColor="rgba(0,0,0,0.2)"
              textShadowOffset={{ width: 0, height: 2 }}
              textShadowRadius={4}
            >
              Ntamgyinafoɔ
            </Text>

            <Text
              fontSize={Typography.bodyLarge.fontSize}
              fontWeight={Typography.bodyLarge.fontWeight}
              color="rgba(255,255,255,0.95)"
              letterSpacing={Typography.bodyLarge.letterSpacing + 2}
            >
              Find. Visit. Own.
            </Text>
          </YStack>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, marginTop: 40 }}>
          <Spinner size="large" color="#FFFFFF" />
        </Animated.View>
      </YStack>
    </LinearGradient>
  );
}
