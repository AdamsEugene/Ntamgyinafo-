import { Input as TamaguiInput, InputProps, YStack, Text, XStack } from 'tamagui';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius } from '@/constants/design';

interface CustomInputProps extends InputProps {
  label?: string;
  helperText?: string;
  error?: boolean;
  errorText?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  inputType?: 'text' | 'password' | 'phone' | 'email';
}

export function Input({
  label,
  helperText,
  error = false,
  errorText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  inputType = 'text',
  ...props
}: CustomInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const getKeyboardType = () => {
    if (inputType === 'phone') return 'phone-pad';
    if (inputType === 'email') return 'email-address';
    return 'default';
  };

  return (
    <YStack space="$2" width="100%">
      {label && (
        <Text
          fontSize={14}
          fontWeight="500"
          color={error ? Colors.error : Colors.textPrimary}
        >
          {label}
        </Text>
      )}
      <XStack
        alignItems="center"
        backgroundColor={Colors.background}
        borderRadius={BorderRadius.medium}
        borderWidth={isFocused ? 2 : error ? 2 : 0}
        borderColor={
          isFocused
            ? Colors.primaryGreen
            : error
            ? Colors.error
            : Colors.divider
        }
        paddingHorizontal={16}
        minHeight={56}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={Colors.textSecondary}
            style={{ marginRight: 12 }}
          />
        )}
        <TamaguiInput
          flex={1}
          borderWidth={0}
          backgroundColor="transparent"
          fontSize={16}
          color={Colors.textPrimary}
          placeholderTextColor={Colors.textSecondary}
          keyboardType={getKeyboardType()}
          secureTextEntry={inputType === 'password' && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {inputType === 'password' && (
          <XStack marginLeft={8} onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            <Ionicons
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={20}
              color={Colors.textSecondary}
            />
          </XStack>
        )}
        {rightIcon && inputType !== 'password' && (
          <XStack marginLeft={8} onPress={onRightIconPress}>
            <Ionicons name={rightIcon} size={20} color={Colors.textSecondary} />
          </XStack>
        )}
      </XStack>
      {(helperText || errorText) && (
        <Text
          fontSize={12}
          color={error ? Colors.error : Colors.textSecondary}
        >
          {error ? errorText : helperText}
        </Text>
      )}
    </YStack>
  );
}

