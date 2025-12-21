import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#FAFAFA" },
      }}
    >
      <Stack.Screen name="splash" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="otp-verification" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-otp" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="role-selection" />
      <Stack.Screen name="pending-verification" />
    </Stack>
  );
}
