import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  TextInput as RNTextInput,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors, Typography, Spacing } from "@/constants/design";
import { Button } from "@/components/ui/Button";
import { LocationSelector } from "@/components/LocationSelector";

const PROPERTY_TYPES = [
  { name: "House", icon: "home-outline" as const },
  { name: "Apartment", icon: "business-outline" as const },
  { name: "Land", icon: "map-outline" as const },
  { name: "Commercial", icon: "storefront-outline" as const },
];

const BUYER_STEPS = [
  { id: 1, title: "Preferred Locations" },
  { id: 2, title: "Budget Range" },
  { id: 3, title: "Property Type" },
  { id: 4, title: "Profile Photo" },
];

export default function RoleSelectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    phone?: string;
    fullName?: string;
    role?: string;
  }>();
  const insets = useSafeAreaInsets();

  const role = (params.role as "buyer" | "owner") || "buyer";
  // const fullName = params.fullName || ""; // Available if needed for display

  // Buyer step state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>(
    []
  );
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  // Owner state
  const [idDocument, setIdDocument] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [ownerProfilePhoto, setOwnerProfilePhoto] = useState<string | null>(
    null
  );

  const togglePropertyType = (type: string) => {
    setSelectedPropertyTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const isPropertyTypeSelected = (typeName: string) => {
    return selectedPropertyTypes.includes(typeName);
  };

  const handleNext = () => {
    if (currentStep < BUYER_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return selectedLocations.length > 0;
      case 2:
        return true; // Budget is optional
      case 3:
        return selectedPropertyTypes.length > 0;
      case 4:
        return profilePhoto !== null; // Profile photo is required
      default:
        return false;
    }
  };

  const handleCreateAccount = () => {
    // TODO: Create buyer account
    console.log("Creating buyer account:", {
      preferredLocations: selectedLocations,
      budgetRange: {
        min: minBudget ? parseFloat(minBudget) : null,
        max: maxBudget ? parseFloat(maxBudget) : null,
      },
      propertyTypes: selectedPropertyTypes,
      profilePhoto,
    });
    router.replace("/(tabs)");
  };

  const handleSubmitVerification = () => {
    if (!idDocument || !selfie) {
      // Show error - both required
      return;
    }
    // TODO: Submit owner verification
    console.log("Submitting owner verification:", {
      idDocument,
      selfie,
      profilePhoto: ownerProfilePhoto,
    });
    router.push("/(auth)/pending-verification");
  };

  const isBuyer = role === "buyer";

  return (
    <>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Decorative Background Elements */}
        <View style={styles.decorativeBackground}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
        </View>

        <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
          {isBuyer && currentStep > 1 ? (
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={styles.backButtonCircle}>
                <Ionicons
                  name="arrow-back"
                  size={20}
                  color={Colors.textPrimary}
                />
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={styles.backButtonCircle}>
                <Ionicons
                  name="arrow-back"
                  size={20}
                  color={Colors.textPrimary}
                />
              </View>
            </TouchableOpacity>
          )}
          {isBuyer && (
            <TouchableOpacity
              onPress={
                currentStep === BUYER_STEPS.length
                  ? handleCreateAccount
                  : handleNext
              }
              disabled={!canProceedToNext()}
              style={[
                styles.nextButtonHeader,
                !canProceedToNext() && styles.nextButtonHeaderDisabled,
              ]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text
                style={[
                  styles.nextButtonHeaderText,
                  !canProceedToNext() && styles.nextButtonHeaderTextDisabled,
                ]}
              >
                {currentStep === BUYER_STEPS.length ? "Create Account" : "Next"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>Complete Your Profile</Text>
              <Text style={styles.roleBadge}>
                {isBuyer ? "Buyer/Tenant" : "Property Owner"}
              </Text>
            </View>

            {isBuyer ? (
              /* Buyer Step-Based Form */
              <View style={styles.formCard}>
                {/* Progress Indicator */}
                <View style={styles.progressContainer}>
                  <Text style={styles.progressText}>
                    Step {currentStep} of {BUYER_STEPS.length}
                  </Text>
                  <View style={styles.progressBar}>
                    {BUYER_STEPS.map((step) => (
                      <View
                        key={step.id}
                        style={[
                          styles.progressStep,
                          currentStep >= step.id && styles.progressStepActive,
                        ]}
                      />
                    ))}
                  </View>
                </View>

                {/* Step Content */}
                <View style={styles.stepContent}>
                  {currentStep === 1 && (
                    <View style={styles.stepView}>
                      <Text style={styles.stepTitle}>
                        Select Preferred Locations
                      </Text>
                      <Text style={styles.stepDescription}>
                        Choose locations where you&apos;d like to find
                        properties
                      </Text>
                      <View style={styles.locationSelectorContainer}>
                        <LocationSelector
                          selectedLocations={selectedLocations}
                          onLocationsChange={setSelectedLocations}
                        />
                      </View>
                    </View>
                  )}

                  {currentStep === 2 && (
                    <View style={styles.stepView}>
                      <Text style={styles.stepTitle}>Set Your Budget</Text>
                      <Text style={styles.stepDescription}>
                        Enter your budget range (optional)
                      </Text>

                      {/* Budget Presets */}
                      <View style={styles.budgetPresetsContainer}>
                        <Text style={styles.budgetPresetsTitle}>
                          Quick Select
                        </Text>
                        <View style={styles.budgetPresets}>
                          {[
                            { label: "Under 100K", min: "0", max: "100000" },
                            {
                              label: "100K - 500K",
                              min: "100000",
                              max: "500000",
                            },
                            {
                              label: "500K - 1M",
                              min: "500000",
                              max: "1000000",
                            },
                            { label: "1M+", min: "1000000", max: "" },
                          ].map((preset, index) => {
                            const isSelected =
                              minBudget === preset.min &&
                              maxBudget === preset.max;
                            return (
                              <TouchableOpacity
                                key={index}
                                style={[
                                  styles.budgetPresetButton,
                                  isSelected &&
                                    styles.budgetPresetButtonSelected,
                                ]}
                                onPress={() => {
                                  setMinBudget(preset.min);
                                  setMaxBudget(preset.max);
                                }}
                              >
                                <Text
                                  style={[
                                    styles.budgetPresetText,
                                    isSelected &&
                                      styles.budgetPresetTextSelected,
                                  ]}
                                >
                                  {preset.label}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>

                      {/* Budget Input Card */}
                      <View style={styles.budgetCard}>
                        <View style={styles.budgetCardHeader}>
                          <Ionicons
                            name="wallet-outline"
                            size={24}
                            color={Colors.primaryGreen}
                          />
                          <Text style={styles.budgetCardTitle}>
                            Custom Range
                          </Text>
                        </View>
                        <View style={styles.budgetInputsContainer}>
                          <View style={styles.budgetInput}>
                            <View style={styles.budgetInputLabel}>
                              <Ionicons
                                name="arrow-down-circle-outline"
                                size={16}
                                color={Colors.textSecondary}
                              />
                              <Text style={styles.budgetInputLabelText}>
                                Minimum
                              </Text>
                            </View>
                            <View style={styles.budgetInputWrapper}>
                              <Text style={styles.currencySymbol}>GHS</Text>
                              <RNTextInput
                                placeholder="0"
                                value={minBudget}
                                onChangeText={setMinBudget}
                                keyboardType="numeric"
                                style={styles.budgetInputField}
                                placeholderTextColor={Colors.textSecondary}
                              />
                            </View>
                          </View>
                          <View style={styles.budgetInput}>
                            <View style={styles.budgetInputLabel}>
                              <Ionicons
                                name="arrow-up-circle-outline"
                                size={16}
                                color={Colors.textSecondary}
                              />
                              <Text style={styles.budgetInputLabelText}>
                                Maximum
                              </Text>
                            </View>
                            <View style={styles.budgetInputWrapper}>
                              <Text style={styles.currencySymbol}>GHS</Text>
                              <RNTextInput
                                placeholder="No limit"
                                value={maxBudget}
                                onChangeText={setMaxBudget}
                                keyboardType="numeric"
                                style={styles.budgetInputField}
                                placeholderTextColor={Colors.textSecondary}
                              />
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  )}

                  {currentStep === 3 && (
                    <View style={styles.stepView}>
                      <Text style={styles.stepTitle}>
                        Property Type Interest
                      </Text>
                      <Text style={styles.stepDescription}>
                        Select the types of properties you&apos;re interested in
                      </Text>
                      <View style={styles.propertyTypesGrid}>
                        {PROPERTY_TYPES.map((propertyType) => {
                          const isSelected = isPropertyTypeSelected(
                            propertyType.name
                          );
                          return (
                            <TouchableOpacity
                              key={propertyType.name}
                              style={[
                                styles.propertyTypeCard,
                                isSelected && styles.propertyTypeCardSelected,
                              ]}
                              onPress={() =>
                                togglePropertyType(propertyType.name)
                              }
                              activeOpacity={0.7}
                            >
                              <View
                                style={[
                                  styles.propertyTypeIconContainer,
                                  isSelected &&
                                    styles.propertyTypeIconContainerSelected,
                                ]}
                              >
                                <Ionicons
                                  name={propertyType.icon}
                                  size={32}
                                  color={
                                    isSelected
                                      ? Colors.primaryGreen
                                      : Colors.textSecondary
                                  }
                                />
                              </View>
                              <Text
                                style={[
                                  styles.propertyTypeLabel,
                                  isSelected &&
                                    styles.propertyTypeLabelSelected,
                                ]}
                              >
                                {propertyType.name}
                              </Text>
                              {isSelected && (
                                <View style={styles.propertyTypeCheckmark}>
                                  <Ionicons
                                    name="checkmark-circle"
                                    size={24}
                                    color={Colors.primaryGreen}
                                  />
                                </View>
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  {currentStep === 4 && (
                    <View style={styles.stepView}>
                      <Text style={styles.stepTitle}>
                        Profile Photo <Text style={styles.required}>*</Text>
                      </Text>
                      <Text style={styles.stepDescription}>
                        Add a profile photo to help others recognize you
                      </Text>

                      {/* Photo Upload Card */}
                      <View style={styles.photoUploadCard}>
                        {profilePhoto ? (
                          <View style={styles.photoPreviewContainer}>
                            <Image
                              source={{ uri: profilePhoto }}
                              style={styles.photoPreviewImage}
                            />
                            <TouchableOpacity
                              style={styles.photoChangeButton}
                              onPress={() => {
                                // TODO: Open image picker
                                console.log("Change photo");
                                setProfilePhoto(null);
                              }}
                            >
                              <Ionicons
                                name="camera"
                                size={20}
                                color="#FFFFFF"
                              />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.photoRemoveButton}
                              onPress={() => {
                                setProfilePhoto(null);
                              }}
                            >
                              <Ionicons
                                name="close-circle"
                                size={24}
                                color={Colors.textSecondary}
                              />
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={styles.photoUploadArea}
                            onPress={() => {
                              // TODO: Open image picker
                              console.log("Open image picker");
                              setProfilePhoto("demo-photo");
                            }}
                            activeOpacity={0.7}
                          >
                            <View style={styles.photoUploadIconContainer}>
                              <Ionicons
                                name="camera-outline"
                                size={56}
                                color={Colors.primaryGreen}
                              />
                              <View style={styles.photoUploadIconBadge}>
                                <Ionicons
                                  name="add"
                                  size={20}
                                  color="#FFFFFF"
                                />
                              </View>
                            </View>
                            <Text style={styles.photoUploadText}>
                              Tap to add photo
                            </Text>
                            <Text style={styles.photoUploadHint}>
                              Use camera or choose from gallery
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>

                      {/* Upload Options */}
                      {!profilePhoto && (
                        <View style={styles.photoOptionsContainer}>
                          <TouchableOpacity
                            style={styles.photoOptionButton}
                            onPress={() => {
                              // TODO: Open camera
                              console.log("Open camera");
                              setProfilePhoto("demo-photo");
                            }}
                            activeOpacity={0.7}
                          >
                            <View style={styles.photoOptionIcon}>
                              <Ionicons
                                name="camera"
                                size={24}
                                color={Colors.primaryGreen}
                              />
                            </View>
                            <Text style={styles.photoOptionText}>
                              Take Photo
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.photoOptionButton}
                            onPress={() => {
                              // TODO: Open gallery
                              console.log("Open gallery");
                              setProfilePhoto("demo-photo");
                            }}
                            activeOpacity={0.7}
                          >
                            <View style={styles.photoOptionIcon}>
                              <Ionicons
                                name="images-outline"
                                size={24}
                                color={Colors.primaryGreen}
                              />
                            </View>
                            <Text style={styles.photoOptionText}>
                              Choose from Gallery
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      {/* Tips */}
                      <View style={styles.photoTipsContainer}>
                        <View style={styles.photoTipsHeader}>
                          <Ionicons
                            name="information-circle-outline"
                            size={18}
                            color={Colors.primaryGreen}
                          />
                          <Text style={styles.photoTipsTitle}>Tips</Text>
                        </View>
                        <Text style={styles.photoTipsText}>
                          • Use a clear, recent photo{"\n"}• Face the camera
                          directly{"\n"}• Good lighting works best
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            ) : (
              /* Owner Form */
              <View style={styles.formCard}>
                {/* Upload ID Document */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    Upload ID Document <Text style={styles.required}>*</Text>
                  </Text>
                  <Text style={styles.sectionDescription}>
                    Upload Ghana Card or Voter ID for verification
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.ownerUploadCard,
                      idDocument && styles.ownerUploadCardFilled,
                    ]}
                    onPress={() => {
                      // TODO: Open document picker
                      console.log("Open document picker");
                      setIdDocument("demo-id-document");
                    }}
                    activeOpacity={0.7}
                  >
                    {idDocument ? (
                      <View style={styles.ownerUploadPreviewContainer}>
                        <Image
                          source={{ uri: idDocument }}
                          style={styles.ownerDocumentPreview}
                        />
                        <TouchableOpacity
                          style={styles.ownerUploadChangeButton}
                          onPress={() => {
                            setIdDocument(null);
                          }}
                        >
                          <Ionicons
                            name="close-circle"
                            size={24}
                            color={Colors.textSecondary}
                          />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.ownerUploadArea}>
                        <View style={styles.ownerUploadIconContainer}>
                          <Ionicons
                            name="document-text-outline"
                            size={48}
                            color={Colors.primaryGreen}
                          />
                          <View style={styles.ownerUploadIconBadge}>
                            <Ionicons name="add" size={20} color="#FFFFFF" />
                          </View>
                        </View>
                        <Text style={styles.ownerUploadText}>
                          Tap to upload document
                        </Text>
                        <Text style={styles.ownerUploadHint}>
                          Ghana Card or Voter ID
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Take Selfie */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    Take Selfie for Verification{" "}
                    <Text style={styles.required}>*</Text>
                  </Text>
                  <Text style={styles.sectionDescription}>
                    Take a clear selfie for identity verification
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.ownerUploadCard,
                      selfie && styles.ownerUploadCardFilled,
                    ]}
                    onPress={() => {
                      // TODO: Open camera
                      console.log("Open camera");
                      setSelfie("demo-selfie");
                    }}
                    activeOpacity={0.7}
                  >
                    {selfie ? (
                      <View style={styles.ownerUploadPreviewContainer}>
                        <Image
                          source={{ uri: selfie }}
                          style={styles.ownerSelfiePreview}
                        />
                        <TouchableOpacity
                          style={styles.ownerUploadChangeButton}
                          onPress={() => {
                            setSelfie(null);
                          }}
                        >
                          <Ionicons
                            name="close-circle"
                            size={24}
                            color={Colors.textSecondary}
                          />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.ownerUploadArea}>
                        <View style={styles.ownerUploadIconContainer}>
                          <Ionicons
                            name="camera-outline"
                            size={48}
                            color={Colors.primaryGreen}
                          />
                          <View style={styles.ownerUploadIconBadge}>
                            <Ionicons name="camera" size={20} color="#FFFFFF" />
                          </View>
                        </View>
                        <Text style={styles.ownerUploadText}>
                          Tap to take selfie
                        </Text>
                        <Text style={styles.ownerUploadHint}>
                          Face the camera directly
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Profile Photo */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    Profile Photo (Optional)
                  </Text>
                  <Text style={styles.sectionDescription}>
                    Add a profile photo to help others recognize you
                  </Text>
                  <View style={styles.photoUploadCard}>
                    {ownerProfilePhoto ? (
                      <View style={styles.photoPreviewContainer}>
                        <Image
                          source={{ uri: ownerProfilePhoto }}
                          style={styles.photoPreviewImage}
                        />
                        <TouchableOpacity
                          style={styles.photoChangeButton}
                          onPress={() => {
                            // TODO: Open image picker
                            console.log("Change photo");
                            setOwnerProfilePhoto(null);
                          }}
                        >
                          <Ionicons name="camera" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.photoRemoveButton}
                          onPress={() => {
                            setOwnerProfilePhoto(null);
                          }}
                        >
                          <Ionicons
                            name="close-circle"
                            size={24}
                            color={Colors.textSecondary}
                          />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.photoUploadArea}
                        onPress={() => {
                          // TODO: Open image picker
                          console.log("Open image picker");
                          setOwnerProfilePhoto("demo-photo");
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={styles.photoUploadIconContainer}>
                          <Ionicons
                            name="camera-outline"
                            size={56}
                            color={Colors.primaryGreen}
                          />
                          <View style={styles.photoUploadIconBadge}>
                            <Ionicons name="add" size={20} color="#FFFFFF" />
                          </View>
                        </View>
                        <Text style={styles.photoUploadText}>
                          Tap to add photo
                        </Text>
                        <Text style={styles.photoUploadHint}>
                          Use camera or choose from gallery
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <Button
                  title="Submit for Verification"
                  onPress={handleSubmitVerification}
                  variant="primary"
                  disabled={!idDocument || !selfie}
                  style={styles.submitButton}
                />
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  decorativeBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  circle1: {
    position: "absolute",
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.primaryLight,
    opacity: 0.08,
  },
  circle2: {
    position: "absolute",
    bottom: -150,
    left: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: Colors.primaryGreen,
    opacity: 0.05,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  backButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  nextButtonHeader: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.primaryGreen,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  nextButtonHeaderDisabled: {
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
  nextButtonHeaderText: {
    ...Typography.labelLarge,
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  nextButtonHeaderTextDisabled: {
    color: "#9E9E9E",
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing["3xl"],
    zIndex: 1,
  },
  content: {
    flex: 1,
    paddingTop: Spacing.lg,
  },
  titleSection: {
    marginBottom: Spacing.xl,
    alignItems: "center",
  },
  title: {
    ...Typography.headlineMedium,
    fontSize: 28,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  roleBadge: {
    ...Typography.labelLarge,
    fontSize: 14,
    color: Colors.primaryGreen,
    backgroundColor: "#F1F8F4",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    fontWeight: "600",
  },
  formCard: {
    width: "100%",
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: Spacing.xl,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  progressContainer: {
    marginBottom: Spacing.xl,
  },
  progressText: {
    ...Typography.labelMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  progressBar: {
    flexDirection: "row",
    gap: Spacing.xs,
    justifyContent: "center",
  },
  progressStep: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.divider,
  },
  progressStepActive: {
    backgroundColor: Colors.primaryGreen,
  },
  stepContent: {
    marginBottom: Spacing.xl,
  },
  stepView: {
    width: "100%",
  },
  stepTitle: {
    ...Typography.headlineMedium,
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  stepDescription: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  locationSelectorContainer: {
    height: 500,
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
  },
  propertyTypesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  propertyTypeCard: {
    width: "47%",
    aspectRatio: 1.1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.divider,
    position: "relative",
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
  propertyTypeCardSelected: {
    borderColor: Colors.primaryGreen,
    backgroundColor: "#F1F8F4",
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  propertyTypeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  propertyTypeIconContainerSelected: {
    backgroundColor: "#E8F5E9",
  },
  propertyTypeLabel: {
    ...Typography.labelLarge,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  propertyTypeLabelSelected: {
    color: Colors.primaryGreen,
  },
  propertyTypeCheckmark: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.labelLarge,
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  sectionDescription: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  required: {
    color: "#D32F2F",
  },
  budgetPresetsContainer: {
    marginBottom: Spacing.xl,
  },
  budgetPresetsTitle: {
    ...Typography.labelMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    fontWeight: "600",
  },
  budgetPresets: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  budgetPresetButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.divider,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  budgetPresetButtonSelected: {
    backgroundColor: Colors.primaryGreen,
    borderColor: Colors.primaryGreen,
  },
  budgetPresetText: {
    ...Typography.labelMedium,
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  budgetPresetTextSelected: {
    color: "#FFFFFF",
  },
  budgetCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: Spacing.xl,
    borderWidth: 1.5,
    borderColor: Colors.divider,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  budgetCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  budgetCardTitle: {
    ...Typography.labelLarge,
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: "700",
  },
  budgetInputsContainer: {
    gap: Spacing.lg,
  },
  budgetInput: {
    width: "100%",
  },
  budgetInputLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  budgetInputLabelText: {
    ...Typography.labelMedium,
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  budgetInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.divider,
    paddingHorizontal: Spacing.md,
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
  currencySymbol: {
    ...Typography.labelLarge,
    fontSize: 14,
    color: Colors.primaryGreen,
    fontWeight: "700",
    marginRight: Spacing.xs,
  },
  budgetInputField: {
    flex: 1,
    ...Typography.headlineMedium,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    paddingVertical: Spacing.md,
    ...Platform.select({
      android: {
        includeFontPadding: false,
        textAlignVertical: "center",
      },
    }),
  },
  photoUploadCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.divider,
    borderStyle: "dashed",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  photoUploadArea: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["2xl"],
  },
  photoUploadIconContainer: {
    position: "relative",
    marginBottom: Spacing.lg,
  },
  photoUploadIconBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryGreen,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.surface,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  photoUploadText: {
    ...Typography.labelLarge,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  photoUploadHint: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  photoPreviewContainer: {
    position: "relative",
    width: 200,
    height: 200,
  },
  photoPreviewImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: Colors.primaryGreen,
  },
  photoChangeButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryGreen,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: Colors.surface,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  photoRemoveButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  photoOptionsContainer: {
    flexDirection: "column",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  photoOptionButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.divider,
    gap: Spacing.sm,
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
  photoOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  photoOptionText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  photoTipsContainer: {
    backgroundColor: "#F1F8F4",
    borderRadius: 12,
    padding: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primaryGreen,
  },
  photoTipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  photoTipsTitle: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "700",
    color: Colors.primaryGreen,
  },
  photoTipsText: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  ownerUploadCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.divider,
    borderStyle: "dashed",
    minHeight: 180,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  ownerUploadCardFilled: {
    borderStyle: "solid",
    borderColor: Colors.primaryGreen,
    backgroundColor: "#F1F8F4",
  },
  ownerUploadArea: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
  },
  ownerUploadIconContainer: {
    position: "relative",
    marginBottom: Spacing.lg,
  },
  ownerUploadIconBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryGreen,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.surface,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  ownerUploadText: {
    ...Typography.labelLarge,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  ownerUploadHint: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  ownerUploadPreviewContainer: {
    position: "relative",
    width: "100%",
  },
  ownerDocumentPreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    resizeMode: "cover",
    borderWidth: 2,
    borderColor: Colors.primaryGreen,
  },
  ownerSelfiePreview: {
    width: 200,
    height: 200,
    borderRadius: 100,
    resizeMode: "cover",
    borderWidth: 4,
    borderColor: Colors.primaryGreen,
    alignSelf: "center",
  },
  ownerUploadChangeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  submitButton: {
    width: "100%",
    marginTop: Spacing.md,
  },
});
