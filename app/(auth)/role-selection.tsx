import React, { useState, useEffect, useRef } from "react";
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
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors, Typography, Spacing } from "@/constants/design";
import { LocationSelector } from "@/components/LocationSelector";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

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

  // Animation values
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(30)).current;
  const stepContentOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Header fade in
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Title entrance
    Animated.sequence([
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(titleTranslateY, {
          toValue: 0,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Form entrance
    Animated.sequence([
      Animated.delay(250),
      Animated.parallel([
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(formTranslateY, {
          toValue: 0,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    return () => {
      headerOpacity.stopAnimation();
      titleOpacity.stopAnimation();
      titleTranslateY.stopAnimation();
      formOpacity.stopAnimation();
      formTranslateY.stopAnimation();
      stepContentOpacity.stopAnimation();
    };
  }, [
    headerOpacity,
    titleOpacity,
    titleTranslateY,
    formOpacity,
    formTranslateY,
    stepContentOpacity,
  ]);

  // Animate step content when step changes
  const animateStepChange = (callback: () => void) => {
    Animated.sequence([
      Animated.timing(stepContentOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(stepContentOpacity, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
      Animated.timing(stepContentOpacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    });
  };

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
      animateStepChange(() => setCurrentStep(currentStep + 1));
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      animateStepChange(() => setCurrentStep(currentStep - 1));
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
    router.replace("/(tabs)");
  };

  const handleSubmitVerification = () => {
    if (!idDocument || !selfie) {
      return;
    }
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
          <View style={styles.circle3} />
        </View>

        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            { paddingTop: insets.top + Spacing.md, opacity: headerOpacity },
          ]}
        >
          {isBuyer && currentStep > 1 ? (
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.8}
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
              activeOpacity={0.8}
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
              activeOpacity={0.9}
            >
              <Text
                style={[
                  styles.nextButtonHeaderText,
                  !canProceedToNext() && styles.nextButtonHeaderTextDisabled,
                ]}
              >
                {currentStep === BUYER_STEPS.length ? "Finish" : "Next"}
              </Text>
              <Ionicons
                name={
                  currentStep === BUYER_STEPS.length
                    ? "checkmark"
                    : "arrow-forward"
                }
                size={16}
                color={canProceedToNext() ? "#FFFFFF" : "#9E9E9E"}
              />
            </TouchableOpacity>
          )}
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Title Section */}
            <Animated.View
              style={[
                styles.titleSection,
                {
                  opacity: titleOpacity,
                  transform: [{ translateY: titleTranslateY }],
                },
              ]}
            >
              <View style={styles.titleIconContainer}>
                <View style={styles.titleIconInner}>
                  <Ionicons
                    name={isBuyer ? "person-outline" : "briefcase-outline"}
                    size={28}
                    color={Colors.primaryGreen}
                  />
                </View>
              </View>
              <Text style={styles.title}>Complete Your Profile</Text>
              <View style={styles.roleBadgeContainer}>
                <Ionicons
                  name={isBuyer ? "search-outline" : "home-outline"}
                  size={14}
                  color={Colors.primaryGreen}
                />
                <Text style={styles.roleBadge}>
                  {isBuyer ? "Buyer/Tenant" : "Property Owner"}
                </Text>
              </View>
            </Animated.View>

            {isBuyer ? (
              /* Buyer Step-Based Form */
              <Animated.View
                style={[
                  styles.formCard,
                  {
                    opacity: formOpacity,
                    transform: [{ translateY: formTranslateY }],
                  },
                ]}
              >
                {/* Progress Indicator */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressText}>
                      Step {currentStep} of {BUYER_STEPS.length}
                    </Text>
                    <Text style={styles.progressLabel}>
                      {BUYER_STEPS[currentStep - 1].title}
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    {BUYER_STEPS.map((step) => (
                      <View
                        key={step.id}
                        style={[
                          styles.progressStep,
                          currentStep >= step.id && styles.progressStepActive,
                          currentStep === step.id && styles.progressStepCurrent,
                        ]}
                      />
                    ))}
                  </View>
                </View>

                {/* Step Content */}
                <Animated.View
                  style={[styles.stepContent, { opacity: stepContentOpacity }]}
                >
                  {currentStep === 1 && (
                    <View style={styles.stepView}>
                      <View style={styles.stepHeader}>
                        <View style={styles.stepIconContainer}>
                          <Ionicons
                            name="location"
                            size={24}
                            color={Colors.primaryGreen}
                          />
                        </View>
                        <View style={styles.stepHeaderText}>
                          <Text style={styles.stepTitle}>
                            Select Preferred Locations
                          </Text>
                          <Text style={styles.stepDescription}>
                            Choose locations where you&apos;d like to find
                            properties
                          </Text>
                        </View>
                      </View>
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
                      <View style={styles.stepHeader}>
                        <View style={styles.stepIconContainer}>
                          <Ionicons
                            name="wallet"
                            size={24}
                            color={Colors.primaryGreen}
                          />
                        </View>
                        <View style={styles.stepHeaderText}>
                          <Text style={styles.stepTitle}>Set Your Budget</Text>
                          <Text style={styles.stepDescription}>
                            Enter your budget range (optional)
                          </Text>
                        </View>
                      </View>

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
                                activeOpacity={0.8}
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
                            name="options-outline"
                            size={20}
                            color={Colors.primaryGreen}
                          />
                          <Text style={styles.budgetCardTitle}>
                            Custom Range
                          </Text>
                        </View>
                        <View style={styles.budgetInputsContainer}>
                          <View style={styles.budgetInput}>
                            <Text style={styles.budgetInputLabelText}>
                              Minimum
                            </Text>
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
                          <View style={styles.budgetDivider}>
                            <Text style={styles.budgetDividerText}>to</Text>
                          </View>
                          <View style={styles.budgetInput}>
                            <Text style={styles.budgetInputLabelText}>
                              Maximum
                            </Text>
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
                      <View style={styles.stepHeader}>
                        <View style={styles.stepIconContainer}>
                          <Ionicons
                            name="grid"
                            size={24}
                            color={Colors.primaryGreen}
                          />
                        </View>
                        <View style={styles.stepHeaderText}>
                          <Text style={styles.stepTitle}>
                            Property Type Interest
                          </Text>
                          <Text style={styles.stepDescription}>
                            Select the types of properties you&apos;re
                            interested in
                          </Text>
                        </View>
                      </View>
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
                      <View style={styles.stepHeader}>
                        <View style={styles.stepIconContainer}>
                          <Ionicons
                            name="camera"
                            size={24}
                            color={Colors.primaryGreen}
                          />
                        </View>
                        <View style={styles.stepHeaderText}>
                          <Text style={styles.stepTitle}>
                            Profile Photo <Text style={styles.required}>*</Text>
                          </Text>
                          <Text style={styles.stepDescription}>
                            Add a profile photo to help others recognize you
                          </Text>
                        </View>
                      </View>

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
                            name="bulb-outline"
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
                </Animated.View>
              </Animated.View>
            ) : (
              /* Owner Form */
              <Animated.View
                style={[
                  styles.formCard,
                  {
                    opacity: formOpacity,
                    transform: [{ translateY: formTranslateY }],
                  },
                ]}
              >
                {/* Upload ID Document */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionIconContainer}>
                      <Ionicons
                        name="document-text"
                        size={20}
                        color={Colors.primaryGreen}
                      />
                    </View>
                    <View>
                      <Text style={styles.sectionTitle}>
                        Upload ID Document{" "}
                        <Text style={styles.required}>*</Text>
                      </Text>
                      <Text style={styles.sectionDescription}>
                        Ghana Card or Voter ID for verification
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.ownerUploadCard,
                      idDocument && styles.ownerUploadCardFilled,
                    ]}
                    onPress={() => {
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
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionIconContainer}>
                      <Ionicons
                        name="person-circle"
                        size={20}
                        color={Colors.primaryGreen}
                      />
                    </View>
                    <View>
                      <Text style={styles.sectionTitle}>
                        Take Selfie for Verification{" "}
                        <Text style={styles.required}>*</Text>
                      </Text>
                      <Text style={styles.sectionDescription}>
                        Take a clear selfie for identity verification
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.ownerUploadCard,
                      selfie && styles.ownerUploadCardFilled,
                    ]}
                    onPress={() => {
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
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionIconContainer}>
                      <Ionicons
                        name="image"
                        size={20}
                        color={Colors.primaryGreen}
                      />
                    </View>
                    <View>
                      <Text style={styles.sectionTitle}>
                        Profile Photo (Optional)
                      </Text>
                      <Text style={styles.sectionDescription}>
                        Add a profile photo to help others recognize you
                      </Text>
                    </View>
                  </View>
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

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (!idDocument || !selfie) && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmitVerification}
                  activeOpacity={0.9}
                  disabled={!idDocument || !selfie}
                >
                  <Text style={styles.submitButtonText}>
                    Submit for Verification
                  </Text>
                  <View style={styles.submitButtonIcon}>
                    <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
              </Animated.View>
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
    top: -120,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: Colors.primaryLight,
    opacity: 0.08,
  },
  circle2: {
    position: "absolute",
    bottom: -180,
    left: -120,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: Colors.primaryGreen,
    opacity: 0.05,
  },
  circle3: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.45,
    right: -60,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Colors.primaryGreen,
    opacity: 0.03,
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 24,
    backgroundColor: Colors.primaryGreen,
    gap: Spacing.xs,
    shadowColor: Colors.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonHeaderDisabled: {
    backgroundColor: Colors.divider,
    shadowOpacity: 0,
    elevation: 0,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing["3xl"],
    zIndex: 1,
  },
  content: {
    flex: 1,
    paddingTop: Spacing.md,
  },
  titleSection: {
    marginBottom: Spacing.xl,
    alignItems: "center",
  },
  titleIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
    shadowColor: Colors.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  titleIconInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    ...Typography.headlineMedium,
    fontSize: 26,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  roleBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.2)",
  },
  roleBadge: {
    ...Typography.labelMedium,
    fontSize: 13,
    color: Colors.primaryGreen,
    fontWeight: "600",
  },
  formCard: {
    width: "100%",
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: Spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.03)",
  },
  progressContainer: {
    marginBottom: Spacing.xl,
  },
  progressHeader: {
    marginBottom: Spacing.md,
  },
  progressText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  progressLabel: {
    ...Typography.labelLarge,
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  progressBar: {
    flexDirection: "row",
    gap: Spacing.xs,
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
  progressStepCurrent: {
    backgroundColor: Colors.primaryGreen,
  },
  stepContent: {
    marginBottom: Spacing.md,
  },
  stepView: {
    width: "100%",
  },
  stepHeader: {
    flexDirection: "row",
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  stepIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  stepHeaderText: {
    flex: 1,
    justifyContent: "center",
  },
  stepTitle: {
    ...Typography.titleLarge,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  stepDescription: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  locationSelectorContainer: {
    height: 450,
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
  },
  propertyTypesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  propertyTypeCard: {
    width: "47%",
    aspectRatio: 1.1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.divider,
    position: "relative",
  },
  propertyTypeCardSelected: {
    borderColor: Colors.primaryGreen,
    backgroundColor: "rgba(34, 197, 94, 0.05)",
  },
  propertyTypeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  propertyTypeIconContainerSelected: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
  },
  propertyTypeLabel: {
    ...Typography.labelMedium,
    fontSize: 14,
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
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    ...Typography.labelLarge,
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: "600",
    marginBottom: 2,
  },
  sectionDescription: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  required: {
    color: "#EF4444",
  },
  budgetPresetsContainer: {
    marginBottom: Spacing.lg,
  },
  budgetPresetsTitle: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  budgetPresets: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  budgetPresetButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.divider,
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
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  budgetCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  budgetCardTitle: {
    ...Typography.labelMedium,
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  budgetInputsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.sm,
  },
  budgetInput: {
    flex: 1,
  },
  budgetInputLabelText: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: "600",
    marginBottom: Spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  budgetInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.divider,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  budgetDivider: {
    paddingBottom: Spacing.md,
  },
  budgetDividerText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  currencySymbol: {
    ...Typography.labelMedium,
    fontSize: 13,
    color: Colors.primaryGreen,
    fontWeight: "700",
    marginRight: Spacing.xs,
  },
  budgetInputField: {
    flex: 1,
    ...Typography.bodyMedium,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
    paddingVertical: Spacing.sm,
  },
  photoUploadCard: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.divider,
    borderStyle: "dashed",
  },
  photoUploadArea: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl,
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
    borderColor: Colors.background,
  },
  photoUploadText: {
    ...Typography.labelLarge,
    fontSize: 15,
    fontWeight: "600",
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
    width: 160,
    height: 160,
  },
  photoPreviewImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: Colors.primaryGreen,
  },
  photoChangeButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryGreen,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.background,
  },
  photoRemoveButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
  },
  photoOptionsContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  photoOptionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.divider,
    gap: Spacing.sm,
  },
  photoOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  photoOptionText: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  photoTipsContainer: {
    backgroundColor: "rgba(34, 197, 94, 0.05)",
    borderRadius: 14,
    padding: Spacing.lg,
    borderLeftWidth: 3,
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
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primaryGreen,
  },
  photoTipsText: {
    ...Typography.bodyMedium,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  ownerUploadCard: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.divider,
    borderStyle: "dashed",
    minHeight: 160,
  },
  ownerUploadCardFilled: {
    borderStyle: "solid",
    borderColor: Colors.primaryGreen,
    backgroundColor: "rgba(34, 197, 94, 0.05)",
  },
  ownerUploadArea: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
  },
  ownerUploadIconContainer: {
    position: "relative",
    marginBottom: Spacing.md,
  },
  ownerUploadIconBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryGreen,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.background,
  },
  ownerUploadText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  ownerUploadHint: {
    ...Typography.bodyMedium,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  ownerUploadPreviewContainer: {
    position: "relative",
    width: "100%",
  },
  ownerDocumentPreview: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    resizeMode: "cover",
    borderWidth: 2,
    borderColor: Colors.primaryGreen,
  },
  ownerSelfiePreview: {
    width: 140,
    height: 140,
    borderRadius: 70,
    resizeMode: "cover",
    borderWidth: 3,
    borderColor: Colors.primaryGreen,
    alignSelf: "center",
  },
  ownerUploadChangeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primaryGreen,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: 16,
    gap: Spacing.md,
    shadowColor: Colors.primaryGreen,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    marginTop: Spacing.md,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.divider,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    ...Typography.labelLarge,
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  submitButtonIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
});
