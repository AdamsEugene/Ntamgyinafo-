/**
 * Ntamgyinafoɔ Design System Constants
 * Based on UI/UX Design Specifications
 */

export const Colors = {
  // Primary Colors
  primaryGreen: "#1B5E20",
  primaryLight: "#4CAF50",
  primaryDark: "#0D3311",

  // Secondary Colors
  accentGold: "#FFB300",
  accentOrange: "#FF6D00",

  // Neutral Colors
  background: "#FAFAFA",
  surface: "#FFFFFF",
  textPrimary: "#212121",
  textSecondary: "#757575",
  divider: "#E0E0E0",

  // Semantic Colors
  success: "#4CAF50",
  warning: "#FFC107",
  error: "#F44336",
  info: "#2196F3",

  // Dark Mode
  backgroundDark: "#121212",
  surfaceDark: "#1E1E1E",
  textDark: "#FFFFFF",
  textSecondaryDark: "#B0B0B0",
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
};

export const BorderRadius = {
  small: 4,
  medium: 8,
  large: 12,
  xlarge: 16,
  full: 9999,
};

export const Shadows = {
  elevation1: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  elevation2: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  elevation3: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  elevation4: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  elevation5: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 5,
  },
};

export const Typography = {
  displayLarge: {
    fontSize: 32,
    fontWeight: "700" as const,
    letterSpacing: -0.5,
  },
  displayMedium: {
    fontSize: 28,
    fontWeight: "700" as const,
    letterSpacing: -0.25,
  },
  headlineLarge: {
    fontSize: 24,
    fontWeight: "600" as const,
    letterSpacing: 0,
  },
  headlineMedium: {
    fontSize: 20,
    fontWeight: "600" as const,
    letterSpacing: 0,
  },
  titleLarge: {
    fontSize: 18,
    fontWeight: "500" as const,
    letterSpacing: 0,
  },
  titleMedium: {
    fontSize: 16,
    fontWeight: "500" as const,
    letterSpacing: 0.15,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: "400" as const,
    letterSpacing: 0.5,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: "400" as const,
    letterSpacing: 0.25,
  },
  labelLarge: {
    fontSize: 14,
    fontWeight: "500" as const,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontSize: 12,
    fontWeight: "500" as const,
    letterSpacing: 0.5,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
    letterSpacing: 0.4,
  },
};
