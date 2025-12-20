import { useEffect, useState } from "react";
import { YStack, XStack, Text } from "tamagui";
import { useRouter } from "expo-router";
import { Colors, Typography } from "@/constants/design";
import { LinearGradient } from "expo-linear-gradient";
import { Animated, Easing, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SplashScreen() {
  const router = useRouter();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.5));
  const [logoRotate] = useState(new Animated.Value(0));
  const [textSlide] = useState(new Animated.Value(50));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [dotAnim1] = useState(new Animated.Value(0.3));
  const [dotAnim2] = useState(new Animated.Value(0.3));
  const [dotAnim3] = useState(new Animated.Value(0.3));

  useEffect(() => {
    // Logo rotation animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation for icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Sequential dot animations
    const createDotAnimation = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(anim, {
              toValue: 1,
              duration: 600,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 600,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    };

    createDotAnimation(dotAnim1, 0).start();
    createDotAnimation(dotAnim2, 200).start();
    createDotAnimation(dotAnim3, 400).start();

    // Main entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(textSlide, {
        toValue: 0,
        duration: 800,
        delay: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate after delay
    const timer = setTimeout(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        router.replace("/(auth)/onboarding");
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [
    fadeAnim,
    scaleAnim,
    textSlide,
    logoRotate,
    pulseAnim,
    dotAnim1,
    dotAnim2,
    dotAnim3,
    router,
  ]);

  const logoRotation = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <LinearGradient
      colors={[Colors.primaryDark, Colors.primaryGreen, Colors.primaryLight]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <YStack flex={1} alignItems="center" justifyContent="center" space="$8">
        {/* Main Logo Container with Multiple Layers */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          {/* Outer Glow Ring */}
          <Animated.View
            style={[
              styles.outerRing,
              {
                transform: [{ rotate: logoRotation }],
                opacity: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.3],
                }),
              },
            ]}
          />

          {/* Middle Ring */}
          <Animated.View
            style={[
              styles.middleRing,
              {
                transform: [{ rotate: logoRotation }],
                opacity: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.5],
                }),
              },
            ]}
          />

          {/* Main Logo Container */}
          <YStack
            width={160}
            height={160}
            borderRadius={40}
            backgroundColor="rgba(255,255,255,0.15)"
            alignItems="center"
            justifyContent="center"
            style={styles.logoContainer}
            borderWidth={2}
            borderColor="rgba(255,255,255,0.3)"
          >
            {/* Inner Glow */}
            <YStack
              width={140}
              height={140}
              borderRadius={35}
              backgroundColor="rgba(255,255,255,0.1)"
              alignItems="center"
              justifyContent="center"
              position="absolute"
            />

            {/* Icon with Pulse */}
            <Animated.View
              style={{
                transform: [{ scale: pulseAnim }],
              }}
            >
              <Ionicons name="home" size={80} color="#FFFFFF" />
            </Animated.View>

            {/* Decorative Dots */}
            <YStack position="absolute" top={20} right={20}>
              <YStack
                width={8}
                height={8}
                borderRadius={4}
                backgroundColor="rgba(255,255,255,0.6)"
              />
            </YStack>
            <YStack position="absolute" bottom={20} left={20}>
              <YStack
                width={8}
                height={8}
                borderRadius={4}
                backgroundColor="rgba(255,255,255,0.6)"
              />
            </YStack>
          </YStack>
        </Animated.View>

        {/* App Name with Slide Animation */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: textSlide }],
          }}
        >
          <YStack alignItems="center" space="$3">
            <Text
              fontSize={Typography.displayLarge.fontSize + 4}
              fontWeight={Typography.displayLarge.fontWeight}
              color="#FFFFFF"
              letterSpacing={Typography.displayLarge.letterSpacing - 1}
              textShadowColor="rgba(0,0,0,0.3)"
              textShadowOffset={{ width: 0, height: 4 }}
              textShadowRadius={8}
            >
              Ntamgyinafoɔ
            </Text>

            {/* Tagline with Fade */}
            <Animated.View
              style={{
                opacity: fadeAnim.interpolate({
                  inputRange: [0, 0.7, 1],
                  outputRange: [0, 0, 1],
                }),
              }}
            >
              <YStack alignItems="center" space="$2">
                <Text
                  fontSize={Typography.bodyLarge.fontSize + 2}
                  fontWeight={Typography.bodyLarge.fontWeight}
                  color="rgba(255,255,255,0.95)"
                  letterSpacing={Typography.bodyLarge.letterSpacing + 3}
                  textTransform="uppercase"
                >
                  Find. Visit. Own.
                </Text>

                {/* Decorative Line */}
                <YStack
                  width={60}
                  height={2}
                  backgroundColor="rgba(255,255,255,0.6)"
                  borderRadius={1}
                  marginTop={8}
                />
              </YStack>
            </Animated.View>
          </YStack>
        </Animated.View>

        {/* Loading Indicator with Custom Design */}
        <Animated.View
          style={{
            opacity: fadeAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 0, 1],
            }),
            marginTop: 60,
          }}
        >
          <YStack alignItems="center" space="$3">
            {/* Custom Loading Dots with Sequential Animation */}
            <XStack space="$3" alignItems="center">
              {[
                { anim: dotAnim1, key: 0 },
                { anim: dotAnim2, key: 1 },
                { anim: dotAnim3, key: 2 },
              ].map(({ anim, key }) => (
                <Animated.View
                  key={key}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: "#FFFFFF",
                    opacity: anim,
                    transform: [
                      {
                        scale: anim.interpolate({
                          inputRange: [0.3, 1],
                          outputRange: [0.8, 1.3],
                        }),
                      },
                    ],
                  }}
                />
              ))}
            </XStack>
          </YStack>
        </Animated.View>
      </YStack>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 15,
  },
  outerRing: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
    borderStyle: "dashed",
  },
  middleRing: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
});
