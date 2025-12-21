import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Platform,
} from "react-native";
import { Colors, Spacing, Typography } from "@/constants/design";

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "text";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const buttonStyles = [
    styles.button,
    styles[variant],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.textStyle,
    styles[`${variant}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  const buttonContent = (
    <>
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? "#FFFFFF" : Colors.primaryGreen}
          size="small"
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </>
  );

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {buttonContent}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
    overflow: "visible",
    position: "relative",
  },
  primary: {
    backgroundColor: Colors.primaryGreen,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
        shadowColor: "#000",
      },
    }),
  },
  secondary: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: Colors.primaryGreen,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  text: {
    backgroundColor: "transparent",
    height: 40,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  disabled: {
    backgroundColor: Colors.divider,
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  textStyle: {
    ...Typography.labelLarge,
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.5,
    lineHeight: 22,
    ...Platform.select({
      android: {
        includeFontPadding: false,
        textAlignVertical: "center",
      },
    }),
  },
  primaryText: {
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  secondaryText: {
    color: Colors.primaryGreen,
    fontWeight: "700",
  },
  textText: {
    color: Colors.primaryGreen,
  },
  disabledText: {
    color: "#9E9E9E",
  },
});
