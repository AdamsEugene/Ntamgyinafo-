import { XStack, Text } from 'tamagui';
import { Colors, BorderRadius } from '@/constants/design';

interface BadgeProps {
  count: number;
  color?: string;
}

export function Badge({ count, color = Colors.error }: BadgeProps) {
  if (count === 0) return null;

  return (
    <XStack
      backgroundColor={color}
      borderRadius={BorderRadius.full}
      minWidth={18}
      height={18}
      paddingHorizontal={6}
      alignItems="center"
      justifyContent="center"
    >
      <Text fontSize={10} fontWeight="700" color="#FFFFFF">
        {count > 99 ? '99+' : count}
      </Text>
    </XStack>
  );
}

