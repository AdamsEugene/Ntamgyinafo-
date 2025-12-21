import React, { useState } from "react";
import {
  View,
  Text,
  TextInput as RNTextInput,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, Typography } from "@/constants/design";

export interface TextInputComponentProps extends TextInputProps {
  label?: string;
  error?: string;
  showPasswordToggle?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
}

export const TextInput: React.FC<TextInputComponentProps> = ({
  label,
  error,
  showPasswordToggle = false,
  leftIcon,
  style,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={18}
              color={Colors.textPrimary}
              style={styles.labelIcon}
            />
          )}
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        <RNTextInput
          style={[styles.input, style]}
          secureTextEntry={showPasswordToggle && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={Colors.textSecondary}
          {...props}
        />
        {showPasswordToggle && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.eyeIcon}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
              size={22}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  labelIcon: {
    marginRight: Spacing.xs,
  },
  label: {
    ...Typography.labelLarge,
    color: Colors.textPrimary,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.divider,
    paddingHorizontal: Spacing.lg,
    minHeight: 56,
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
  inputContainerFocused: {
    borderColor: Colors.primaryGreen,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: "#D32F2F",
  },
  input: {
    flex: 1,
    ...Typography.bodyMedium,
    fontSize: 16,
    color: Colors.textPrimary,
    paddingVertical: Spacing.md,
    ...Platform.select({
      android: {
        includeFontPadding: false,
        textAlignVertical: "center",
      },
    }),
  },
  eyeIcon: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    ...Typography.caption,
    color: "#D32F2F",
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});
