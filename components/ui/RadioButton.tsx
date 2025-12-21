import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors, Spacing, Typography } from "@/constants/design";

export interface RadioButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  value: string;
}

export const RadioButton: React.FC<RadioButtonProps> = ({
  label,
  selected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.radioContainer}>
        <View style={[styles.radio, selected && styles.radioSelected]}>
          {selected && <View style={styles.radioInner} />}
        </View>
        <Text style={[styles.label, selected && styles.labelSelected]}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.divider,
    marginRight: Spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    borderColor: Colors.primaryGreen,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primaryGreen,
  },
  label: {
    ...Typography.bodyMedium,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  labelSelected: {
    color: Colors.primaryGreen,
    fontWeight: "600",
  },
});
