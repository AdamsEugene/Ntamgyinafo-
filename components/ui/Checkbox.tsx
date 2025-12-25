import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, Typography } from "@/constants/design";
import { useTheme } from "@/contexts/ThemeContext";

export interface CheckboxProps {
  label: string;
  checked: boolean;
  onPress: () => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onPress,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.checkbox,
          { backgroundColor: colors.surface, borderColor: colors.divider },
          checked && {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
          },
        ]}
      >
        {checked && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
      </View>
      <Text
        style={[
          styles.label,
          { color: colors.text },
          checked && styles.labelChecked,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.divider,
    marginRight: Spacing.md,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.surface,
  },
  checkboxChecked: {
    backgroundColor: Colors.primaryGreen,
    borderColor: Colors.primaryGreen,
  },
  label: {
    ...Typography.bodyMedium,
    fontSize: 16,
    color: Colors.textPrimary,
    flex: 1,
  },
  labelChecked: {
    color: Colors.textPrimary,
    fontWeight: "500",
  },
});
