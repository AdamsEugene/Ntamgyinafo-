import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Typography, Spacing } from "@/constants/design";

const PROPERTY_TYPES = [
  {
    id: "house",
    label: "House",
    icon: "home-outline" as const,
    description: "Single family home, villa, mansion",
  },
  {
    id: "apartment",
    label: "Apartment",
    icon: "business-outline" as const,
    description: "Flat, condo, studio",
  },
  {
    id: "land",
    label: "Land",
    icon: "map-outline" as const,
    description: "Plot, farmland, commercial land",
  },
  {
    id: "commercial",
    label: "Commercial",
    icon: "storefront-outline" as const,
    description: "Office, shop, warehouse",
  },
];

export default function AddListingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedType, setSelectedType] = React.useState<string | null>(null);

  return (
    <>
      <StatusBar style="dark" />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Listing</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Step 1 of 10</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "10%" }]} />
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>What type of property?</Text>
          <Text style={styles.subtitle}>
            Select the category that best describes your property
          </Text>

          <View style={styles.typesContainer}>
            {PROPERTY_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeCard,
                  selectedType === type.id && styles.typeCardSelected,
                ]}
                onPress={() => setSelectedType(type.id)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.typeIconContainer,
                    selectedType === type.id &&
                      styles.typeIconContainerSelected,
                  ]}
                >
                  <Ionicons
                    name={type.icon}
                    size={32}
                    color={
                      selectedType === type.id ? "#FFFFFF" : Colors.primaryGreen
                    }
                  />
                </View>
                <View style={styles.typeContent}>
                  <Text
                    style={[
                      styles.typeLabel,
                      selectedType === type.id && styles.typeLabelSelected,
                    ]}
                  >
                    {type.label}
                  </Text>
                  <Text style={styles.typeDescription}>{type.description}</Text>
                </View>
                <View
                  style={[
                    styles.radioOuter,
                    selectedType === type.id && styles.radioOuterSelected,
                  ]}
                >
                  {selectedType === type.id && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View
          style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}
        >
          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedType && styles.continueButtonDisabled,
            ]}
            onPress={() => {
              // TODO: Navigate to next step
              console.log("Continue with:", selectedType);
            }}
            activeOpacity={0.8}
            disabled={!selectedType}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    ...Typography.titleLarge,
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  progressText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.divider,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primaryGreen,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  title: {
    ...Typography.headlineLarge,
    fontSize: 28,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.bodyMedium,
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  typesContainer: {
    gap: Spacing.md,
  },
  typeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.divider,
  },
  typeCardSelected: {
    borderColor: Colors.primaryGreen,
    backgroundColor: `${Colors.primaryGreen}08`,
  },
  typeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: `${Colors.primaryGreen}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  typeIconContainerSelected: {
    backgroundColor: Colors.primaryGreen,
  },
  typeContent: {
    flex: 1,
  },
  typeLabel: {
    ...Typography.titleMedium,
    fontSize: 17,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  typeLabelSelected: {
    color: Colors.primaryGreen,
  },
  typeDescription: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.divider,
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterSelected: {
    borderColor: Colors.primaryGreen,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primaryGreen,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primaryGreen,
    paddingVertical: Spacing.lg,
    borderRadius: 16,
    gap: Spacing.sm,
  },
  continueButtonDisabled: {
    backgroundColor: Colors.divider,
  },
  continueButtonText: {
    ...Typography.labelLarge,
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
