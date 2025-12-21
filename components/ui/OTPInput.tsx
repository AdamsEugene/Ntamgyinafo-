import React, { useRef, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Platform,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from "react-native";
import { Colors, Spacing, Typography } from "@/constants/design";

export interface OTPInputProps {
  length?: number;
  value: string;
  onChangeText: (text: string) => void;
  onComplete?: (otp: string) => void;
  error?: boolean;
}

const DEFAULT_OTP_LENGTH = 4;

export const OTPInput: React.FC<OTPInputProps> = ({
  length = DEFAULT_OTP_LENGTH,
  value,
  onChangeText,
  onComplete,
  error = false,
}) => {
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    // Auto-submit when all digits are entered
    if (value.length === length && onComplete) {
      onComplete(value);
    }
  }, [value, length, onComplete]);

  const handleChangeText = (text: string, index: number) => {
    // Only allow digits
    const digit = text.replace(/[^0-9]/g, "");

    if (digit.length > 1) {
      // Handle paste - take first digit
      const newValue = value.split("");
      newValue[index] = digit[0];
      onChangeText(newValue.join(""));
      // Focus next input
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
      return;
    }

    // Update value
    const newValue = value.split("");
    newValue[index] = digit;
    const updatedValue = newValue.join("").substring(0, length);
    onChangeText(updatedValue);

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    // Handle backspace
    if (e.nativeEvent.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    // Select all text when focused
    inputRefs.current[index]?.setNativeProps({
      selection: { start: 0, end: 1 },
    });
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputRefs.current[index] = ref;
          }}
          style={[
            styles.input,
            value[index] && styles.inputFilled,
            error && styles.inputError,
          ]}
          value={value[index] || ""}
          onChangeText={(text) => handleChangeText(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          onFocus={() => handleFocus(index)}
          keyboardType="number-pad"
          maxLength={1}
          selectTextOnFocus
          textAlign="center"
          autoComplete="off"
          autoCorrect={false}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: Spacing.lg,
  },
  input: {
    width: 70,
    height: 70,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.divider,
    backgroundColor: Colors.surface,
    ...Typography.headlineMedium,
    fontSize: 28,
    fontWeight: "700",
    color: Colors.textPrimary,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputFilled: {
    borderColor: Colors.primaryGreen,
    backgroundColor: "#F1F8F4",
  },
  inputError: {
    borderColor: "#D32F2F",
  },
});
