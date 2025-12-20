import { YStack, Text } from "tamagui";
import { Colors, Typography, Spacing } from "@/constants/design";
import { Button } from "@/components/ui/Button";

export default function RegisterScreen() {
  return (
    <YStack
      flex={1}
      backgroundColor={Colors.surface}
      padding={Spacing["2xl"]}
      alignItems="center"
      justifyContent="center"
    >
      <Text
        fontSize={Typography.headlineLarge.fontSize}
        fontWeight="600"
        color={Colors.textPrimary}
      >
        Register Screen
      </Text>
      <Text
        fontSize={Typography.bodyMedium.fontSize}
        color={Colors.textSecondary}
        marginTop="$4"
      >
        Coming soon...
      </Text>
    </YStack>
  );
}
