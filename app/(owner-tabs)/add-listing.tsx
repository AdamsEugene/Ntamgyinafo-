import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  Switch,
  KeyboardAvoidingView,
  Animated,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { Colors, Typography, Spacing } from "@/constants/design";
import { FloatingHeader } from "@/components/FloatingHeader";
import {
  VirtualTourCreator,
  PanoramaViewer,
  Scene,
} from "@/components/VirtualTour";

// Constants
const TOTAL_STEPS = 10;

const PROPERTY_TYPES = [
  {
    id: "house",
    label: "House",
    icon: "home" as const,
    description: "Single family home, villa, mansion",
  },
  {
    id: "apartment",
    label: "Apartment",
    icon: "business" as const,
    description: "Flat, condo, studio",
  },
  {
    id: "land",
    label: "Land",
    icon: "map" as const,
    description: "Plot, farmland, commercial land",
  },
  {
    id: "commercial",
    label: "Commercial",
    icon: "storefront" as const,
    description: "Office, shop, warehouse",
  },
];

const TRANSACTION_TYPES = [
  { id: "sale", label: "For Sale", icon: "pricetag" as const },
  { id: "rent", label: "For Rent", icon: "key" as const },
];

const AMENITIES = [
  { id: "water", label: "Water", icon: "water" as const },
  { id: "electricity", label: "Electricity", icon: "flash" as const },
  { id: "security", label: "Security", icon: "shield-checkmark" as const },
  { id: "parking", label: "Parking", icon: "car" as const },
  { id: "internet", label: "Internet", icon: "wifi" as const },
  { id: "pool", label: "Pool", icon: "water" as const },
  { id: "garden", label: "Garden", icon: "leaf" as const },
  { id: "gym", label: "Gym", icon: "barbell" as const },
  { id: "ac", label: "Air Conditioning", icon: "snow" as const },
  { id: "furnished", label: "Furnished", icon: "bed" as const },
];

// Form state interface
interface ListingFormData {
  propertyType: string | null;
  transactionType: string | null;
  title: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  plotSize: string;
  plotUnit: string;
  price: string;
  negotiable: boolean;
  amenities: string[];
  photos: string[];
  videos: string[];
  has360: boolean;
  virtualTourScenes: Scene[];
  latitude: number | null;
  longitude: number | null;
  address: string;
}

export default function AddListingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const mapRef = useRef<MapView>(null);

  // Current step - Start at 360° step for testing
  const [currentStep, setCurrentStep] = useState(8);

  // Loading states
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isPickingMedia, setIsPickingMedia] = useState(false);

  // Form data - Pre-filled for quick testing
  const [formData, setFormData] = useState<ListingFormData>({
    propertyType: "house",
    transactionType: "sale",
    title: "Beautiful 4 Bedroom House in East Legon",
    description:
      "A stunning 4 bedroom house with modern finishes, spacious living areas, and a beautiful garden. Located in the heart of East Legon with easy access to amenities.",
    bedrooms: 4,
    bathrooms: 3,
    plotSize: "2",
    plotUnit: "plots",
    price: "850000",
    negotiable: true,
    amenities: ["water", "electricity", "security", "parking"],
    photos: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
    ],
    videos: [],
    has360: false,
    virtualTourScenes: [],
    latitude: 5.6364,
    longitude: -0.1731,
    address: "East Legon, Accra, Ghana",
  });

  // Virtual Tour state
  const [showTourCreator, setShowTourCreator] = useState(false);
  const [showTourPreview, setShowTourPreview] = useState(false);

  // Default region for Ghana
  const defaultRegion = {
    latitude: formData.latitude || 5.6037,
    longitude: formData.longitude || -0.187,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  // Pick photos from gallery or camera
  const pickPhotos = async (useCamera: boolean = false) => {
    try {
      setIsPickingMedia(true);

      // Request permissions
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Camera permission is needed to take photos."
          );
          return;
        }
      } else {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Gallery permission is needed to select photos."
          );
          return;
        }
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsMultipleSelection: true,
            selectionLimit: 15 - formData.photos.length,
            quality: 0.8,
          });

      if (!result.canceled && result.assets) {
        const newPhotos = result.assets.map((asset) => asset.uri);
        setFormData({
          ...formData,
          photos: [...formData.photos, ...newPhotos].slice(0, 15),
        });
      }
    } catch {
      Alert.alert("Error", "Failed to pick photos. Please try again.");
    } finally {
      setIsPickingMedia(false);
    }
  };

  // Pick videos from gallery or camera
  const pickVideos = async (useCamera: boolean = false) => {
    try {
      setIsPickingMedia(true);

      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Camera permission is needed to record videos."
          );
          return;
        }
      } else {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Gallery permission is needed to select videos."
          );
          return;
        }
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ["videos"],
            allowsEditing: true,
            videoMaxDuration: 120,
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["videos"],
            allowsMultipleSelection: false,
            videoMaxDuration: 120,
            quality: 0.8,
          });

      if (!result.canceled && result.assets) {
        const newVideos = result.assets.map((asset) => asset.uri);
        setFormData({
          ...formData,
          videos: [...formData.videos, ...newVideos].slice(0, 3),
        });
      }
    } catch {
      Alert.alert("Error", "Failed to pick video. Please try again.");
    } finally {
      setIsPickingMedia(false);
    }
  };

  // Remove photo
  const removePhoto = (index: number) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    setFormData({ ...formData, photos: newPhotos });
  };

  // Remove video
  const removeVideo = (index: number) => {
    const newVideos = formData.videos.filter((_, i) => i !== index);
    setFormData({ ...formData, videos: newVideos });
  };

  // Get current location
  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Location permission is needed to get your current location."
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
      });

      setFormData({
        ...formData,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Center map on location
      mapRef.current?.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      // Try to get address
      try {
        const [address] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        if (address) {
          const addressString = [
            address.street,
            address.city,
            address.region,
            address.country,
          ]
            .filter(Boolean)
            .join(", ");
          setFormData((prev) => ({
            ...prev,
            address: addressString,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }));
        }
      } catch {
        // Address lookup failed, but we still have coordinates
      }
    } catch (error) {
      console.log("Location error:", error);
      Alert.alert(
        "Location Unavailable",
        "Unable to get your current location. Please make sure location services are enabled on your device, or set the location manually on the map."
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Handle map press to set location
  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setFormData({
      ...formData,
      latitude,
      longitude,
    });
  };

  // Show photo picker options
  const showPhotoOptions = () => {
    Alert.alert("Add Photos", "Choose how to add photos", [
      { text: "Camera", onPress: () => pickPhotos(true) },
      { text: "Gallery", onPress: () => pickPhotos(false) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  // Show video picker options
  const showVideoOptions = () => {
    Alert.alert("Add Video", "Choose how to add video", [
      { text: "Record Video", onPress: () => pickVideos(true) },
      { text: "Gallery", onPress: () => pickVideos(false) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  // Progress percentage
  const progressPercentage = (currentStep / TOTAL_STEPS) * 100;

  // Navigation
  const goToNextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      router.back();
    }
  };

  // Check if current step is valid
  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.propertyType !== null;
      case 2:
        return formData.transactionType !== null;
      case 3:
        return (
          formData.title.trim().length >= 5 &&
          formData.description.trim().length >= 20
        );
      case 4:
        return formData.price.trim().length > 0;
      case 5:
        return true; // Amenities are optional
      case 6:
        return formData.photos.length >= 3; // Minimum 3 photos required
      case 7:
        return true; // Videos are optional
      case 8:
        return true; // 360 is optional
      case 9:
        return formData.address.trim().length > 0 || true; // Location validation
      case 10:
        return true; // Preview step
      default:
        return false;
    }
  };

  // Handle submit
  const handleSubmit = () => {
    console.log("Submitting listing:", formData);
    // TODO: Submit to backend
    // Navigate to pending approval screen
    router.replace({
      pathname: "/(owner-tabs)/pending-approval",
      params: { listingTitle: formData.title || "New Property Listing" },
    });
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderPropertyTypeStep();
      case 2:
        return renderTransactionTypeStep();
      case 3:
        return renderBasicDetailsStep();
      case 4:
        return renderPriceStep();
      case 5:
        return renderAmenitiesStep();
      case 6:
        return renderPhotosStep();
      case 7:
        return renderVideosStep();
      case 8:
        return render360Step();
      case 9:
        return renderLocationStep();
      case 10:
        return renderPreviewStep();
      default:
        return null;
    }
  };

  // Step 1: Property Type
  const renderPropertyTypeStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>What type of property?</Text>
      <Text style={styles.stepSubtitle}>
        Select the category that best describes your property
      </Text>

      <View style={styles.optionsContainer}>
        {PROPERTY_TYPES.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.optionCard,
              formData.propertyType === type.id && styles.optionCardSelected,
            ]}
            onPress={() => setFormData({ ...formData, propertyType: type.id })}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.optionIconContainer,
                formData.propertyType === type.id &&
                  styles.optionIconContainerSelected,
              ]}
            >
              <Ionicons
                name={type.icon}
                size={28}
                color={
                  formData.propertyType === type.id
                    ? "#FFFFFF"
                    : Colors.primaryGreen
                }
              />
            </View>
            <View style={styles.optionContent}>
              <Text
                style={[
                  styles.optionLabel,
                  formData.propertyType === type.id &&
                    styles.optionLabelSelected,
                ]}
              >
                {type.label}
              </Text>
              <Text style={styles.optionDescription}>{type.description}</Text>
            </View>
            <View
              style={[
                styles.radioOuter,
                formData.propertyType === type.id && styles.radioOuterSelected,
              ]}
            >
              {formData.propertyType === type.id && (
                <View style={styles.radioInner} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Step 2: Transaction Type
  const renderTransactionTypeStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Transaction Type</Text>
      <Text style={styles.stepSubtitle}>
        Are you selling or renting out this property?
      </Text>

      <View style={styles.transactionCardsRow}>
        {TRANSACTION_TYPES.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.transactionCard,
              formData.transactionType === type.id &&
                styles.transactionCardSelected,
            ]}
            onPress={() =>
              setFormData({ ...formData, transactionType: type.id })
            }
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.transactionIconContainer,
                formData.transactionType === type.id &&
                  styles.transactionIconContainerSelected,
              ]}
            >
              <Ionicons
                name={type.icon}
                size={40}
                color={
                  formData.transactionType === type.id
                    ? "#FFFFFF"
                    : Colors.primaryGreen
                }
              />
            </View>
            <Text
              style={[
                styles.transactionLabel,
                formData.transactionType === type.id &&
                  styles.transactionLabelSelected,
              ]}
            >
              {type.label}
            </Text>
            {formData.transactionType === type.id && (
              <View style={styles.transactionCheckmark}>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={Colors.primaryGreen}
                />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Step 3: Basic Details
  const renderBasicDetailsStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Property Details</Text>
      <Text style={styles.stepSubtitle}>Tell us more about your property</Text>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Title *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g., 4 Bedroom House in East Legon"
          placeholderTextColor={Colors.textSecondary}
          value={formData.title}
          onChangeText={(text) => setFormData({ ...formData, title: text })}
        />
        <Text style={styles.inputHint}>Minimum 5 characters</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Description *</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="Describe your property in detail..."
          placeholderTextColor={Colors.textSecondary}
          value={formData.description}
          onChangeText={(text) =>
            setFormData({ ...formData, description: text })
          }
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
        <Text style={styles.inputHint}>
          {formData.description.length}/500 characters (min 20)
        </Text>
      </View>

      {formData.propertyType !== "land" && (
        <>
          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Bedrooms</Text>
              <View style={styles.counterContainer}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() =>
                    setFormData({
                      ...formData,
                      bedrooms: Math.max(0, formData.bedrooms - 1),
                    })
                  }
                >
                  <Ionicons
                    name="remove"
                    size={20}
                    color={Colors.textPrimary}
                  />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{formData.bedrooms}</Text>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() =>
                    setFormData({
                      ...formData,
                      bedrooms: formData.bedrooms + 1,
                    })
                  }
                >
                  <Ionicons name="add" size={20} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Bathrooms</Text>
              <View style={styles.counterContainer}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() =>
                    setFormData({
                      ...formData,
                      bathrooms: Math.max(0, formData.bathrooms - 1),
                    })
                  }
                >
                  <Ionicons
                    name="remove"
                    size={20}
                    color={Colors.textPrimary}
                  />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{formData.bathrooms}</Text>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() =>
                    setFormData({
                      ...formData,
                      bathrooms: formData.bathrooms + 1,
                    })
                  }
                >
                  <Ionicons name="add" size={20} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </>
      )}

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Plot Size</Text>
        <View style={styles.plotSizeRow}>
          <TextInput
            style={[styles.textInput, { flex: 1 }]}
            placeholder="e.g., 2"
            placeholderTextColor={Colors.textSecondary}
            value={formData.plotSize}
            onChangeText={(text) =>
              setFormData({ ...formData, plotSize: text })
            }
            keyboardType="numeric"
          />
          <View style={styles.unitSelector}>
            {["plots", "acres", "sqft"].map((unit) => (
              <TouchableOpacity
                key={unit}
                style={[
                  styles.unitButton,
                  formData.plotUnit === unit && styles.unitButtonSelected,
                ]}
                onPress={() => setFormData({ ...formData, plotUnit: unit })}
              >
                <Text
                  style={[
                    styles.unitButtonText,
                    formData.plotUnit === unit && styles.unitButtonTextSelected,
                  ]}
                >
                  {unit}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  // Step 4: Price
  const renderPriceStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Set Your Price</Text>
      <Text style={styles.stepSubtitle}>
        Enter the{" "}
        {formData.transactionType === "rent" ? "monthly rent" : "selling price"}
      </Text>

      <View style={styles.priceInputContainer}>
        <Text style={styles.currencyLabel}>GHS</Text>
        <TextInput
          style={styles.priceInput}
          placeholder="0"
          placeholderTextColor={Colors.textSecondary}
          value={formData.price}
          onChangeText={(text) =>
            setFormData({ ...formData, price: text.replace(/[^0-9]/g, "") })
          }
          keyboardType="numeric"
        />
      </View>

      {formData.transactionType === "rent" && (
        <Text style={styles.priceNote}>per month</Text>
      )}

      <TouchableOpacity
        style={styles.negotiableRow}
        activeOpacity={0.8}
        onPress={() =>
          setFormData({ ...formData, negotiable: !formData.negotiable })
        }
      >
        <View style={styles.negotiableInfo}>
          <View
            style={[
              styles.negotiableIcon,
              formData.negotiable && styles.negotiableIconActive,
            ]}
          >
            <Ionicons
              name="swap-horizontal"
              size={20}
              color={formData.negotiable ? "#FFFFFF" : Colors.primaryGreen}
            />
          </View>
          <View style={styles.negotiableText}>
            <Text style={styles.negotiableLabel}>Negotiable</Text>
            <Text style={styles.negotiableHint} numberOfLines={1}>
              {formData.negotiable
                ? "Buyers can make offers"
                : "Allow price negotiation"}
            </Text>
          </View>
        </View>
        <Switch
          value={formData.negotiable}
          onValueChange={(value) =>
            setFormData({ ...formData, negotiable: value })
          }
          trackColor={{
            false: Colors.divider,
            true: `${Colors.primaryGreen}50`,
          }}
          thumbColor={
            formData.negotiable ? Colors.primaryGreen : Colors.surface
          }
        />
      </TouchableOpacity>
    </View>
  );

  // Step 5: Amenities
  const renderAmenitiesStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Amenities</Text>
      <Text style={styles.stepSubtitle}>
        Select all the amenities available
      </Text>

      <View style={styles.amenitiesGrid}>
        {AMENITIES.map((amenity) => {
          const isSelected = formData.amenities.includes(amenity.id);
          return (
            <TouchableOpacity
              key={amenity.id}
              style={[
                styles.amenityCard,
                isSelected && styles.amenityCardSelected,
              ]}
              onPress={() => {
                const newAmenities = isSelected
                  ? formData.amenities.filter((a) => a !== amenity.id)
                  : [...formData.amenities, amenity.id];
                setFormData({ ...formData, amenities: newAmenities });
              }}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.amenityIcon,
                  isSelected && styles.amenityIconSelected,
                ]}
              >
                <Ionicons
                  name={amenity.icon}
                  size={24}
                  color={isSelected ? "#FFFFFF" : Colors.primaryGreen}
                />
              </View>
              <Text
                style={[
                  styles.amenityLabel,
                  isSelected && styles.amenityLabelSelected,
                ]}
              >
                {amenity.label}
              </Text>
              {isSelected && (
                <View style={styles.amenityCheck}>
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  // Step 6: Photos
  const renderPhotosStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Add Photos</Text>
      <Text style={styles.stepSubtitle}>
        Add at least 5 photos. First photo will be the cover.
      </Text>

      <View style={styles.photoCounter}>
        <Ionicons name="images" size={20} color={Colors.primaryGreen} />
        <Text style={styles.photoCounterText}>
          {formData.photos.length}/15 photos added
        </Text>
      </View>

      <View style={styles.photosGrid}>
        {formData.photos.map((photo, index) => (
          <View key={index} style={styles.photoWrapper}>
            <Image source={{ uri: photo }} style={styles.photoThumbnail} />
            {index === 0 && (
              <View style={styles.coverBadge}>
                <Text style={styles.coverBadgeText}>Cover</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.removePhotoButton}
              onPress={() => removePhoto(index)}
            >
              <Ionicons name="close" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ))}
        {formData.photos.length < 15 && (
          <TouchableOpacity
            style={styles.addPhotoButton}
            activeOpacity={0.8}
            onPress={showPhotoOptions}
            disabled={isPickingMedia}
          >
            {isPickingMedia ? (
              <ActivityIndicator color={Colors.primaryGreen} />
            ) : (
              <>
                <Ionicons name="add" size={32} color={Colors.primaryGreen} />
                <Text style={styles.addPhotoText}>Add Photo</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>💡 Tips for great photos:</Text>
        <Text style={styles.tipText}>
          • Use good lighting, preferably natural light
        </Text>
        <Text style={styles.tipText}>
          • Show all rooms from multiple angles
        </Text>
        <Text style={styles.tipText}>
          • Clean and declutter before taking photos
        </Text>
      </View>
    </View>
  );

  // Step 7: Videos
  const renderVideosStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Add Videos</Text>
      <Text style={styles.stepSubtitle}>
        Videos help buyers see your property better (Optional)
      </Text>

      <View style={styles.mediaLimitInfo}>
        <Ionicons name="videocam" size={24} color={Colors.primaryGreen} />
        <Text style={styles.mediaLimitText}>
          {formData.videos.length}/3 videos added (max 2 min each)
        </Text>
      </View>

      {/* Show added videos */}
      {formData.videos.length > 0 && (
        <View style={styles.videosGrid}>
          {formData.videos.map((video, index) => (
            <View key={index} style={styles.videoWrapper}>
              <View style={styles.videoThumbnail}>
                <Ionicons
                  name="videocam"
                  size={32}
                  color={Colors.textSecondary}
                />
                <Text style={styles.videoLabel}>Video {index + 1}</Text>
              </View>
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => removeVideo(index)}
              >
                <Ionicons name="close" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {formData.videos.length < 3 && (
        <TouchableOpacity
          style={styles.addMediaButton}
          activeOpacity={0.8}
          onPress={showVideoOptions}
          disabled={isPickingMedia}
        >
          <LinearGradient
            colors={[`${Colors.primaryGreen}15`, `${Colors.primaryGreen}05`]}
            style={styles.addMediaGradient}
          >
            {isPickingMedia ? (
              <ActivityIndicator size="large" color={Colors.primaryGreen} />
            ) : (
              <>
                <View style={styles.addMediaIconCircle}>
                  <Ionicons
                    name="videocam"
                    size={32}
                    color={Colors.primaryGreen}
                  />
                </View>
                <Text style={styles.addMediaTitle}>Add Video</Text>
                <Text style={styles.addMediaSubtitle}>
                  Record or upload from gallery
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.skipButton} onPress={goToNextStep}>
        <Text style={styles.skipButtonText}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );

  // Handle virtual tour creation
  const handleTourComplete = (scenes: Scene[]) => {
    setFormData((prev) => ({
      ...prev,
      virtualTourScenes: scenes,
      has360: scenes.length > 0,
    }));
    setShowTourCreator(false);
  };

  // Step 8: 360° View
  const render360Step = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>360° Virtual Tour</Text>
      <Text style={styles.stepSubtitle}>
        Add an immersive 360° view of your property (Optional)
      </Text>

      {/* Show existing tour or create button */}
      {formData.virtualTourScenes.length > 0 ? (
        <View style={styles.tourPreviewContainer}>
          {/* Tour Thumbnail Grid */}
          <View style={styles.tourThumbnailGrid}>
            {formData.virtualTourScenes.slice(0, 4).map((scene, index) => (
              <View key={scene.id} style={styles.tourThumbnail}>
                <Image
                  source={{ uri: scene.thumbnail || scene.imageUrl }}
                  style={styles.tourThumbnailImage}
                />
                {index === 3 && formData.virtualTourScenes.length > 4 && (
                  <View style={styles.tourThumbnailOverlay}>
                    <Text style={styles.tourThumbnailOverlayText}>
                      +{formData.virtualTourScenes.length - 4}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Tour Info */}
          <View style={styles.tourInfo}>
            <View style={styles.tourInfoHeader}>
              <Ionicons name="cube" size={20} color={Colors.primaryGreen} />
              <Text style={styles.tourInfoTitle}>Virtual Tour Created</Text>
            </View>
            <Text style={styles.tourInfoText}>
              {formData.virtualTourScenes.length} scenes •{" "}
              {formData.virtualTourScenes.reduce(
                (acc, s) => acc + s.hotspots.length,
                0
              )}{" "}
              hotspots
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.tourActions}>
            <TouchableOpacity
              style={styles.tourPreviewButton}
              onPress={() => setShowTourPreview(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="eye" size={18} color={Colors.primaryGreen} />
              <Text style={styles.tourPreviewButtonText}>Preview</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tourEditButton}
              onPress={() => setShowTourCreator(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="pencil" size={18} color="#FFFFFF" />
              <Text style={styles.tourEditButtonText}>Edit Tour</Text>
            </TouchableOpacity>
          </View>

          {/* Remove Tour */}
          <TouchableOpacity
            style={styles.removeTourButton}
            onPress={() =>
              setFormData((prev) => ({
                ...prev,
                virtualTourScenes: [],
                has360: false,
              }))
            }
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
            <Text style={styles.removeTourButtonText}>Remove Tour</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addMediaButton}
          activeOpacity={0.8}
          onPress={() => setShowTourCreator(true)}
        >
          <LinearGradient
            colors={[`${Colors.primaryGreen}15`, `${Colors.primaryGreen}05`]}
            style={styles.addMediaGradient}
          >
            <View style={styles.addMediaIconCircle}>
              <Ionicons name="cube" size={32} color={Colors.primaryGreen} />
            </View>
            <Text style={styles.addMediaTitle}>Create 360° Tour</Text>
            <Text style={styles.addMediaSubtitle}>
              Build an immersive virtual walkthrough
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>📷 How to capture 360° photos:</Text>
        <Text style={styles.tipText}>
          • Use a 360° camera (Insta360, Ricoh Theta)
        </Text>
        <Text style={styles.tipText}>
          • Or use Google Street View app for panoramas
        </Text>
        <Text style={styles.tipText}>• Wide angle photos also work well</Text>
        <Text style={styles.tipText}>
          • Consider hiring a professional photographer
        </Text>
      </View>

      <TouchableOpacity style={styles.skipButton} onPress={goToNextStep}>
        <Text style={styles.skipButtonText}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );

  // Step 9: Location
  const renderLocationStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Set Location</Text>
      <Text style={styles.stepSubtitle}>
        Tap on the map to pinpoint your property location
      </Text>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={defaultRegion}
          onPress={handleMapPress}
          mapType="standard"
        >
          {formData.latitude && formData.longitude && (
            <Marker
              coordinate={{
                latitude: formData.latitude,
                longitude: formData.longitude,
              }}
              title="Property Location"
            >
              <View style={styles.markerContainer}>
                <View style={styles.markerInner}>
                  <Ionicons name="home" size={16} color="#FFFFFF" />
                </View>
              </View>
            </Marker>
          )}
        </MapView>
        {formData.latitude && formData.longitude && (
          <View style={styles.mapLocationBadge}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={Colors.primaryGreen}
            />
            <Text style={styles.mapLocationBadgeText}>Location set</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.locationButton}
        activeOpacity={0.8}
        onPress={getCurrentLocation}
        disabled={isLoadingLocation}
      >
        {isLoadingLocation ? (
          <ActivityIndicator size="small" color={Colors.primaryGreen} />
        ) : (
          <Ionicons name="locate" size={20} color={Colors.primaryGreen} />
        )}
        <Text style={styles.locationButtonText}>
          {isLoadingLocation
            ? "Getting location..."
            : "Use My Current Location"}
        </Text>
      </TouchableOpacity>

      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Address</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter property address"
          placeholderTextColor={Colors.textSecondary}
          value={formData.address}
          onChangeText={(text) => setFormData({ ...formData, address: text })}
        />
      </View>

      <View style={styles.coordinatesRow}>
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.inputLabel}>Latitude</Text>
          <TextInput
            style={styles.textInput}
            placeholder="5.6037"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="numeric"
            value={formData.latitude?.toString() || ""}
            onChangeText={(text) =>
              setFormData({ ...formData, latitude: parseFloat(text) || null })
            }
          />
        </View>
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.inputLabel}>Longitude</Text>
          <TextInput
            style={styles.textInput}
            placeholder="-0.1870"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="numeric"
            value={formData.longitude?.toString() || ""}
            onChangeText={(text) =>
              setFormData({ ...formData, longitude: parseFloat(text) || null })
            }
          />
        </View>
      </View>
    </View>
  );

  // Step 10: Preview
  const renderPreviewStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Preview Listing</Text>
      <Text style={styles.stepSubtitle}>
        Review your listing before submitting
      </Text>

      <View style={styles.previewCard}>
        {formData.photos.length > 0 ? (
          <Image
            source={{ uri: formData.photos[0] }}
            style={styles.previewImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.previewImage, styles.previewImagePlaceholder]}>
            <Ionicons
              name="image-outline"
              size={48}
              color={Colors.textSecondary}
            />
            <Text style={styles.previewImagePlaceholderText}>
              No photos added
            </Text>
          </View>
        )}
        <View style={styles.previewContent}>
          <Text style={styles.previewTitle}>
            {formData.title || "4 Bedroom House in East Legon"}
          </Text>
          <View style={styles.previewLocationRow}>
            <Ionicons name="location" size={14} color={Colors.primaryGreen} />
            <Text style={styles.previewLocation}>
              {formData.address || "East Legon, Accra"}
            </Text>
          </View>
          <Text style={styles.previewPrice}>
            GHS{" "}
            {formData.price
              ? parseInt(formData.price).toLocaleString()
              : "850,000"}
            {formData.transactionType === "rent" && "/month"}
          </Text>
        </View>
      </View>

      <View style={styles.previewSections}>
        <View style={styles.previewSection}>
          <View style={styles.previewSectionHeader}>
            <Text style={styles.previewSectionTitle}>Property Type</Text>
            <TouchableOpacity onPress={() => setCurrentStep(1)}>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.previewSectionValue}>
            {PROPERTY_TYPES.find((t) => t.id === formData.propertyType)
              ?.label || "House"}{" "}
            •{" "}
            {TRANSACTION_TYPES.find((t) => t.id === formData.transactionType)
              ?.label || "For Sale"}
          </Text>
        </View>

        <View style={styles.previewSection}>
          <View style={styles.previewSectionHeader}>
            <Text style={styles.previewSectionTitle}>Details</Text>
            <TouchableOpacity onPress={() => setCurrentStep(3)}>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.previewSectionValue}>
            {formData.bedrooms} Beds • {formData.bathrooms} Baths •{" "}
            {formData.plotSize || "2"} {formData.plotUnit}
          </Text>
        </View>

        <View style={styles.previewSection}>
          <View style={styles.previewSectionHeader}>
            <Text style={styles.previewSectionTitle}>Amenities</Text>
            <TouchableOpacity onPress={() => setCurrentStep(5)}>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.previewSectionValue}>
            {formData.amenities.length > 0
              ? formData.amenities
                  .map((id) => AMENITIES.find((a) => a.id === id)?.label)
                  .join(", ")
              : "No amenities selected"}
          </Text>
        </View>

        <View style={styles.previewSection}>
          <View style={styles.previewSectionHeader}>
            <Text style={styles.previewSectionTitle}>Media</Text>
            <TouchableOpacity onPress={() => setCurrentStep(6)}>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.previewSectionValue}>
            {formData.photos.length} Photos • {formData.videos.length} Videos •{" "}
            {formData.has360 ? "360° View" : "No 360° View"}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Decorative Background Elements */}
        <View style={styles.decorativeBackground}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
        </View>

        {/* Floating Sticky Header */}
        {/* Floating Header with Blur */}
        <FloatingHeader
          title="New Listing"
          showBackButton
          onBackPress={goToPreviousStep}
          rightContent={
            <View style={styles.stepIndicator}>
              <Text style={styles.stepIndicatorText}>
                {currentStep}/{TOTAL_STEPS}
              </Text>
            </View>
          }
        />

        {/* Progress Bar */}
        <View
          style={[styles.progressContainer, { marginTop: 80 + insets.top }]}
        >
          <View style={styles.progressBar}>
            <Animated.View
              style={[styles.progressFill, { width: `${progressPercentage}%` }]}
            />
          </View>
        </View>

        {/* Content */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderStepContent()}
        </ScrollView>

        {/* Floating Continue Button */}
        <TouchableOpacity
          style={[
            styles.floatingContinueButton,
            { bottom: 100 + insets.bottom },
            !isStepValid() && styles.floatingContinueButtonDisabled,
          ]}
          onPress={currentStep === TOTAL_STEPS ? handleSubmit : goToNextStep}
          activeOpacity={0.8}
          disabled={!isStepValid()}
        >
          <LinearGradient
            colors={
              isStepValid()
                ? [Colors.primaryGreen, "#2E7D32"]
                : [Colors.divider, Colors.divider]
            }
            style={styles.floatingContinueButtonGradient}
          >
            <Text style={styles.floatingContinueButtonText}>
              {currentStep === TOTAL_STEPS ? "Submit for Review" : "Continue"}
            </Text>
            <Ionicons
              name={
                currentStep === TOTAL_STEPS
                  ? "checkmark-circle"
                  : "arrow-forward"
              }
              size={20}
              color="#FFFFFF"
            />
          </LinearGradient>
        </TouchableOpacity>
      </KeyboardAvoidingView>

      {/* Virtual Tour Creator Modal */}
      <Modal visible={showTourCreator} animationType="slide">
        <VirtualTourCreator
          existingScenes={formData.virtualTourScenes}
          onComplete={handleTourComplete}
          onCancel={() => setShowTourCreator(false)}
          maxScenes={10}
        />
      </Modal>

      {/* Virtual Tour Preview Modal */}
      <Modal visible={showTourPreview} animationType="fade">
        {formData.virtualTourScenes.length > 0 && (
          <PanoramaViewer
            scenes={formData.virtualTourScenes}
            onClose={() => setShowTourPreview(false)}
            showControls
            showThumbnails
          />
        )}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // Decorative Background
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
  // Header
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  headerTitleText: {
    ...Typography.titleLarge,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  stepIndicator: {
    backgroundColor: Colors.primaryGreen,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  stepIndicatorText: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  // Progress
  progressContainer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    zIndex: 10,
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
  // Scroll View
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 180, // Space for floating button and bottom nav
  },
  // Step Content
  stepContent: {
    paddingTop: Spacing.md,
  },
  stepTitle: {
    ...Typography.headlineLarge,
    fontSize: 26,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  stepSubtitle: {
    ...Typography.bodyMedium,
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  // Options (Property Type)
  optionsContainer: {
    gap: Spacing.md,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.divider,
  },
  optionCardSelected: {
    borderColor: Colors.primaryGreen,
    backgroundColor: `${Colors.primaryGreen}08`,
  },
  optionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: `${Colors.primaryGreen}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  optionIconContainerSelected: {
    backgroundColor: Colors.primaryGreen,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  optionLabelSelected: {
    color: Colors.primaryGreen,
  },
  optionDescription: {
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
  // Transaction Type
  transactionCardsRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  transactionCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.xl,
    borderWidth: 2,
    borderColor: Colors.divider,
  },
  transactionCardSelected: {
    borderColor: Colors.primaryGreen,
    backgroundColor: `${Colors.primaryGreen}08`,
  },
  transactionIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: `${Colors.primaryGreen}15`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  transactionIconContainerSelected: {
    backgroundColor: Colors.primaryGreen,
  },
  transactionLabel: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  transactionLabelSelected: {
    color: Colors.primaryGreen,
  },
  transactionCheckmark: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
  },
  // Form
  formGroup: {
    marginBottom: Spacing.lg,
  },
  formRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  inputLabel: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
    ...Typography.bodyMedium,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  inputHint: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  // Counter
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.divider,
    overflow: "hidden",
  },
  counterButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  counterValue: {
    flex: 1,
    textAlign: "center",
    ...Typography.titleMedium,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  // Plot Size
  plotSizeRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  unitSelector: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.divider,
    overflow: "hidden",
  },
  unitButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  unitButtonSelected: {
    backgroundColor: Colors.primaryGreen,
  },
  unitButtonText: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  unitButtonTextSelected: {
    color: "#FFFFFF",
  },
  // Price
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.primaryGreen,
    marginBottom: Spacing.md,
  },
  currencyLabel: {
    ...Typography.headlineMedium,
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primaryGreen,
    marginRight: Spacing.md,
  },
  priceInput: {
    flex: 1,
    ...Typography.headlineLarge,
    fontSize: 36,
    fontWeight: "700",
    color: Colors.textPrimary,
    padding: 0,
  },
  priceNote: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  negotiableRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  negotiableInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flex: 1,
    marginRight: Spacing.sm,
  },
  negotiableIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: `${Colors.primaryGreen}15`,
    justifyContent: "center",
    alignItems: "center",
  },
  negotiableIconActive: {
    backgroundColor: Colors.primaryGreen,
  },
  negotiableText: {
    flex: 1,
  },
  negotiableLabel: {
    ...Typography.titleMedium,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  negotiableHint: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  // Amenities
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  amenityCard: {
    width: "31%",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  amenityCardSelected: {
    borderColor: Colors.primaryGreen,
    backgroundColor: `${Colors.primaryGreen}08`,
  },
  amenityIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${Colors.primaryGreen}15`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  amenityIconSelected: {
    backgroundColor: Colors.primaryGreen,
  },
  amenityLabel: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  amenityLabelSelected: {
    color: Colors.primaryGreen,
  },
  amenityCheck: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primaryGreen,
    justifyContent: "center",
    alignItems: "center",
  },
  // Photos
  photoCounter: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  photoCounterText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  photoWrapper: {
    width: "31%",
    aspectRatio: 1,
    minHeight: 100,
    borderRadius: 12,
    overflow: "hidden",
  },
  photoThumbnail: {
    width: "100%",
    height: "100%",
  },
  coverBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    backgroundColor: Colors.primaryGreen,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  coverBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  removePhotoButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  addPhotoButton: {
    width: "31%",
    aspectRatio: 1,
    minHeight: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Colors.primaryGreen,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: `${Colors.primaryGreen}08`,
  },
  addPhotoText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "600",
    color: Colors.primaryGreen,
    marginTop: Spacing.xs,
  },
  tipsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  tipsTitle: {
    ...Typography.titleMedium,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  tipText: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  // Virtual Tour Styles
  tourPreviewContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  tourThumbnailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tourThumbnail: {
    width: "23%",
    aspectRatio: 1.3,
    borderRadius: 8,
    overflow: "hidden",
  },
  tourThumbnailImage: {
    width: "100%",
    height: "100%",
  },
  tourThumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  tourThumbnailOverlayText: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  tourInfo: {
    marginBottom: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  tourInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  tourInfoTitle: {
    ...Typography.titleMedium,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  tourInfoText: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  tourActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tourPreviewButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primaryGreen,
    backgroundColor: `${Colors.primaryGreen}10`,
  },
  tourPreviewButtonText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
  tourEditButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    backgroundColor: Colors.primaryGreen,
  },
  tourEditButtonText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  removeTourButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  removeTourButtonText: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: "#EF4444",
  },
  // Media (Videos, 360)
  mediaLimitInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  mediaLimitText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  videosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  videoWrapper: {
    width: "31%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  videoThumbnail: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  videoLabel: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  addMediaButton: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: Spacing.xl,
  },
  addMediaGradient: {
    alignItems: "center",
    padding: Spacing.xl,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Colors.primaryGreen,
    borderRadius: 20,
  },
  addMediaIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${Colors.primaryGreen}20`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  addMediaTitle: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primaryGreen,
    marginBottom: 4,
  },
  addMediaSubtitle: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  skipButton: {
    alignSelf: "center",
    paddingVertical: Spacing.md,
  },
  skipButtonText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  // Location
  mapContainer: {
    height: 220,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  markerContainer: {
    alignItems: "center",
  },
  markerInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryGreen,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
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
  mapLocationBadge: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
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
  mapLocationBadgeText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: `${Colors.primaryGreen}15`,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.xl,
  },
  locationButtonText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
  coordinatesRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  // Preview
  previewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.divider,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  previewImage: {
    width: "100%",
    height: 200,
  },
  previewImagePlaceholder: {
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  previewImagePlaceholderText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  previewContent: {
    padding: Spacing.lg,
  },
  previewTitle: {
    ...Typography.titleLarge,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  previewLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: Spacing.sm,
  },
  previewLocation: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  previewPrice: {
    ...Typography.headlineMedium,
    fontSize: 22,
    fontWeight: "700",
    color: Colors.primaryGreen,
  },
  previewSections: {
    gap: Spacing.md,
  },
  previewSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  previewSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  previewSectionTitle: {
    ...Typography.titleMedium,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  editLink: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
  previewSectionValue: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  // Footer
  // Floating Continue Button
  floatingContinueButton: {
    position: "absolute",
    left: Spacing.xl,
    right: Spacing.xl,
    borderRadius: 16,
    overflow: "hidden",
    zIndex: 100,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  floatingContinueButtonDisabled: {
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  floatingContinueButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  floatingContinueButtonText: {
    ...Typography.labelLarge,
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
