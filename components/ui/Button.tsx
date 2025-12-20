import { Button as TamaguiButton, ButtonProps, Text } from 'tamagui';
import { ActivityIndicator } from 'react-native';
import { Colors, BorderRadius } from '@/constants/design';

interface CustomButtonProps extends Omit<ButtonProps, 'variant'> {
  buttonVariant?: 'primary' | 'secondary' | 'text' | 'icon';
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  buttonVariant = 'primary',
  loading = false,
  children,
  disabled,
  ...props
}: CustomButtonProps) {
  const getStyles = () => {
    switch (buttonVariant) {
      case 'primary':
        return {
          backgroundColor: Colors.primaryGreen,
          color: '#FFFFFF',
          borderWidth: 0,
          height: 48,
          paddingHorizontal: 24,
          paddingVertical: 16,
          borderRadius: BorderRadius.medium,
          pressStyle: { backgroundColor: Colors.primaryDark },
          disabledStyle: { backgroundColor: Colors.divider, opacity: 0.6 },
        };
      case 'secondary':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: Colors.primaryGreen,
          color: Colors.primaryGreen,
          height: 48,
          paddingHorizontal: 24,
          paddingVertical: 16,
          borderRadius: BorderRadius.medium,
          pressStyle: { backgroundColor: Colors.primaryGreen + '10' },
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
          color: Colors.primaryGreen,
          height: 40,
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 0,
          pressStyle: { opacity: 0.7 },
        };
      case 'icon':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
          width: 40,
          height: 40,
          borderRadius: BorderRadius.full,
          pressStyle: { backgroundColor: Colors.divider },
        };
      default:
        return {};
    }
  };

  const styles = getStyles();

  return (
    <TamaguiButton
      disabled={disabled || loading}
      {...styles}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={buttonVariant === 'primary' ? '#FFFFFF' : Colors.primaryGreen}
        />
      ) : (
        <Text
          fontSize={buttonVariant === 'text' ? 14 : 16}
          fontWeight={buttonVariant === 'text' ? '400' : '600'}
          color={styles.color}
        >
          {children}
        </Text>
      )}
    </TamaguiButton>
  );
}

