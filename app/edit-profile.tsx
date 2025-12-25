import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Colors, Typography, Spacing } from "@/constants/design";
import { useTheme } from "@/contexts/ThemeContext";

// Mock user data
const INITIAL_USER = {
  name: "Kofi Mensah",
  phone: "+233 24 123 4567",
  email: "kofi.mensah@email.com",
  bio: "Property enthusiast looking for my dream home in Accra.",
  avatar: "https://i.pravatar.cc/150?img=12",
};

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const [name, setName] = useState(INITIAL_USER.name);
  const [email, setEmail] = useState(INITIAL_USER.email);
  const [bio, setBio] = useState(INITIAL_USER.bio);
  const [avatar, setAvatar] = useState(INITIAL_USER.avatar);
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges =
    name !== INITIAL_USER.name ||
    email !== INITIAL_USER.email ||
    bio !== INITIAL_USER.bio ||
    avatar !== INITIAL_USER.avatar;

  const handlePickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Required",
        "Please grant camera roll permission to change your photo."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Required",
        "Please grant camera permission to take a photo."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleChangePhoto = () => {
    Alert.alert("Change Photo", "How would you like to update your photo?", [
      { text: "Take Photo", onPress: handleTakePhoto },
      { text: "Choose from Library", onPress: handlePickImage },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name.");
      return;
    }

    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      Alert.alert("Success", "Your profile has been updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }, 1000);
  };

  const handleBack = () => {
    if (hasChanges) {
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. Are you sure you want to leave?",
        [
          { text: "Stay", style: "cancel" },
          { text: "Leave", style: "destructive", onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top + Spacing.md,
              backgroundColor: colors.background,
            },
          ]}
        >
          <TouchableOpacity
            onPress={handleBack}
            style={[
              styles.backButton,
              { backgroundColor: colors.surface, borderColor: colors.divider },
            ]}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Edit Profile
          </Text>

          <TouchableOpacity
            onPress={handleSave}
            style={[
              styles.saveButton,
              { backgroundColor: colors.primary },
              !hasChanges && { backgroundColor: colors.divider },
            ]}
            activeOpacity={0.7}
            disabled={!hasChanges || isSaving}
          >
            <Text
              style={[
                styles.saveButtonText,
                !hasChanges && { color: colors.textSecondary },
              ]}
            >
              {isSaving ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.content,
              {
                paddingBottom: 100 + insets.bottom,
              },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: avatar }}
                  style={[styles.avatar, { borderColor: colors.primary }]}
                />
                <TouchableOpacity
                  style={[
                    styles.cameraButton,
                    {
                      backgroundColor: colors.primary,
                      borderColor: colors.background,
                    },
                  ]}
                  onPress={handleChangePhoto}
                  activeOpacity={0.8}
                >
                  <Ionicons name="camera" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={handleChangePhoto}
                style={styles.changePhotoButton}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.changePhotoText, { color: colors.primary }]}
                >
                  Change Photo
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View
              style={[
                styles.formContainer,
                { backgroundColor: colors.surface, borderColor: colors.divider },
              ]}
            >
              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Full Name
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.divider,
                    },
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your full name"
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Phone Number (Read-only) */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Phone Number
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    styles.inputReadOnly,
                    {
                      backgroundColor: `${colors.divider}50`,
                      borderColor: colors.divider,
                    },
                  ]}
                >
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[styles.readOnlyText, { color: colors.textSecondary }]}
                  >
                    {INITIAL_USER.phone}
                  </Text>
                  <View
                    style={[
                      styles.verifiedTag,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    <Text style={styles.verifiedTagText}>Verified</Text>
                  </View>
                </View>
                <Text
                  style={[styles.helperText, { color: colors.textSecondary }]}
                >
                  Phone number cannot be changed
                </Text>
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Email{" "}
                  <Text
                    style={[styles.optionalText, { color: colors.textSecondary }]}
                  >
                    (Optional)
                  </Text>
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.divider,
                    },
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Bio */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Bio{" "}
                  <Text
                    style={[styles.optionalText, { color: colors.textSecondary }]}
                  >
                    (Optional)
                  </Text>
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    styles.textAreaWrapper,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.divider,
                    },
                  ]}
                >
                  <TextInput
                    style={[styles.textInput, styles.textArea, { color: colors.text }]}
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Tell us a bit about yourself..."
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    numberOfLines={4}
                    maxLength={200}
                    textAlignVertical="top"
                  />
                </View>
                <Text style={[styles.charCount, { color: colors.textSecondary }]}>
                  {bio.length}/200
                </Text>
              </View>
            </View>

            {/* Save Changes Button */}
            <TouchableOpacity
              style={[
                styles.saveChangesButton,
                { backgroundColor: colors.primary },
                !hasChanges && { backgroundColor: colors.divider },
              ]}
              onPress={handleSave}
              activeOpacity={0.8}
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? (
                <Text style={styles.saveChangesButtonText}>Saving...</Text>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
                  <Text style={styles.saveChangesButtonText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: "transparent",
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  headerTitle: {
    ...Typography.titleLarge,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  saveButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.primaryGreen,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.divider,
  },
  saveButtonText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  saveButtonTextDisabled: {
    color: Colors.textSecondary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  // Avatar Section
  avatarSection: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.primaryGreen,
  },
  cameraButton: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryGreen,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.background,
  },
  changePhotoButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  changePhotoText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
  // Form
  formContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.divider,
    marginBottom: Spacing.xl,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  optionalText: {
    fontWeight: "400",
    color: Colors.textSecondary,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === "ios" ? Spacing.md : Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.divider,
    gap: Spacing.sm,
  },
  inputReadOnly: {
    backgroundColor: `${Colors.divider}50`,
  },
  textInput: {
    flex: 1,
    ...Typography.bodyMedium,
    fontSize: 15,
    color: Colors.textPrimary,
    padding: 0,
  },
  textAreaWrapper: {
    alignItems: "flex-start",
    paddingVertical: Spacing.md,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  readOnlyText: {
    flex: 1,
    ...Typography.bodyMedium,
    fontSize: 15,
    color: Colors.textSecondary,
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.primaryGreen,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedTagText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  helperText: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    marginLeft: 4,
  },
  charCount: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: "right",
    marginTop: Spacing.xs,
  },
  // Save Button
  saveChangesButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primaryGreen,
    paddingVertical: Spacing.lg,
    borderRadius: 16,
    marginBottom: Spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  saveChangesButtonDisabled: {
    backgroundColor: Colors.divider,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveChangesButtonText: {
    ...Typography.labelLarge,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
