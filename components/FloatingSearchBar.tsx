import React, { useRef, useEffect, useState } from "react";
import {
  TextInput as RNTextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Keyboard,
  Animated,
  Dimensions,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography, Spacing } from "@/constants/design";
import { useTheme } from "@/contexts/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export interface FloatingSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  containerStyle?: ViewStyle;
  // Collapsed state dimensions
  collapsedWidth?: number;
  collapsedHeight?: number;
  // Expanded state dimensions
  expandedWidth?: number;
  expandedHeight?: number;
  // Bottom offset (for bottom nav, etc.)
  bottomOffset?: number;
}

export function FloatingSearchBar({
  value,
  onChangeText,
  placeholder = "Search...",
  autoFocus = false,
  containerStyle,
  collapsedWidth = 180,
  collapsedHeight = 42,
  expandedWidth = SCREEN_WIDTH - Spacing.lg * 2,
  expandedHeight = 52,
  bottomOffset = 70,
}: FloatingSearchBarProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const searchInputRef = useRef<RNTextInput>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Animated values for search bar
  const searchInputWidth = useRef(new Animated.Value(collapsedWidth)).current;
  const searchInputHeight = useRef(new Animated.Value(collapsedHeight)).current;
  const searchInputScale = useRef(new Animated.Value(1)).current;
  const searchInputOpacity = useRef(new Animated.Value(0.95)).current;

  // Auto-focus if requested
  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  // Handle keyboard show/hide with iOS-like animations
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setIsKeyboardVisible(true);
        // iOS-like spring animation
        Animated.parallel([
          Animated.spring(searchInputWidth, {
            toValue: expandedWidth,
            useNativeDriver: false,
            tension: 100,
            friction: 12,
          }),
          Animated.spring(searchInputHeight, {
            toValue: expandedHeight,
            useNativeDriver: false,
            tension: 100,
            friction: 12,
          }),
          Animated.spring(searchInputScale, {
            toValue: 1.02,
            useNativeDriver: true,
            tension: 100,
            friction: 12,
          }),
          Animated.timing(searchInputOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
        // iOS-like spring animation back to original
        Animated.parallel([
          Animated.spring(searchInputWidth, {
            toValue: collapsedWidth,
            useNativeDriver: false,
            tension: 80,
            friction: 12,
          }),
          Animated.spring(searchInputHeight, {
            toValue: collapsedHeight,
            useNativeDriver: false,
            tension: 80,
            friction: 12,
          }),
          Animated.spring(searchInputScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 80,
            friction: 12,
          }),
          Animated.timing(searchInputOpacity, {
            toValue: 0.95,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [
    searchInputWidth,
    searchInputHeight,
    searchInputScale,
    searchInputOpacity,
    collapsedWidth,
    collapsedHeight,
    expandedWidth,
    expandedHeight,
  ]);

  const handleClear = () => {
    onChangeText("");
    searchInputRef.current?.focus();
  };

  return (
    <Animated.View
      style={[
        styles.floatingSearchContainer,
        {
          bottom: isKeyboardVisible
            ? keyboardHeight + Spacing.md
            : Math.max(insets.bottom, Spacing.md) + bottomOffset,
          opacity: searchInputOpacity,
          transform: [{ scale: searchInputScale }],
        },
        containerStyle,
      ]}
    >
      <Animated.View
        style={[
          styles.floatingSearchInputContainer,
          {
            width: searchInputWidth,
            height: searchInputHeight,
            backgroundColor: colors.surface,
            borderColor: colors.divider,
          },
        ]}
      >
        <Ionicons
          name="search"
          size={isKeyboardVisible ? 18 : 16}
          color={colors.textSecondary}
          style={styles.floatingSearchIcon}
        />
        <RNTextInput
          ref={searchInputRef}
          style={[
            styles.floatingSearchInput,
            {
              fontSize: isKeyboardVisible ? 15 : 13,
              color: colors.text,
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          returnKeyType="search"
          autoCapitalize="none"
        />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.floatingClearButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name="close-circle"
              size={isKeyboardVisible ? 20 : 18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  floatingSearchContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 999,
    backgroundColor: "transparent",
  },
  floatingSearchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 22,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
    gap: Spacing.xs,
    alignSelf: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  floatingSearchIcon: {
    marginRight: Spacing.xs / 2,
  },
  floatingSearchInput: {
    flex: 1,
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textPrimary,
    padding: 0,
    minWidth: 100,
    ...Platform.select({
      android: {
        includeFontPadding: false,
        textAlignVertical: "center",
      },
    }),
  },
  floatingClearButton: {
    padding: Spacing.xs / 2,
  },
});

export default FloatingSearchBar;
