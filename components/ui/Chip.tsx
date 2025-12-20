import { XStack, Text } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing } from '@/constants/design';

interface ChipProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  selected?: boolean;
  onPress?: () => void;
}

export function Chip({ label, icon, selected = false, onPress }: ChipProps) {
  return (
    <XStack
      alignItems="center"
      backgroundColor={selected ? Colors.primaryGreen + '20' : '#E8F5E9'}
      paddingHorizontal={Spacing.md}
      paddingVertical={Spacing.sm}
      borderRadius={BorderRadius.full}
      space="$1"
      onPress={onPress}
      pressStyle={{ opacity: 0.7 }}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={16}
          color={selected ? Colors.primaryGreen : Colors.textSecondary}
        />
      )}
      <Text
        fontSize={12}
        fontWeight="500"
        color={selected ? Colors.primaryGreen : Colors.textPrimary}
      >
        {label}
      </Text>
    </XStack>
  );
}

