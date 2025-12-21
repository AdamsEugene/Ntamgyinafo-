import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Colors, Typography } from "@/constants/design";

export default function MessagesScreen() {
  return (
    <>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <Text style={styles.text}>Messages Screen</Text>
        <Text style={styles.subtext}>Coming soon...</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  text: {
    ...Typography.headlineMedium,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtext: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
});
