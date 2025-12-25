import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Theme mode options
export type ThemeMode = "light" | "dark" | "system";

// Complete color palette for each theme
export interface ThemeColors {
  // Primary brand colors
  primary: string;
  primaryLight: string;
  primaryDark: string;

  // Secondary/accent colors
  accent: string;
  accentOrange: string;

  // Background colors
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceElevated: string;

  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // Border/Divider
  border: string;
  divider: string;

  // Semantic colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // UI elements
  inputBackground: string;
  inputBorder: string;
  cardBackground: string;
  tabBar: string;
  headerBackground: string;

  // Overlay
  overlay: string;
  overlayLight: string;

  // Status bar
  statusBar: "light" | "dark";
}

// Light theme colors
const lightColors: ThemeColors = {
  // Primary brand colors
  primary: "#1B5E20",
  primaryLight: "#4CAF50",
  primaryDark: "#0D3311",

  // Secondary/accent colors
  accent: "#FFB300",
  accentOrange: "#FF6D00",

  // Background colors
  background: "#FAFAFA",
  backgroundSecondary: "#F5F5F5",
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",

  // Text colors
  text: "#212121",
  textSecondary: "#757575",
  textTertiary: "#9E9E9E",
  textInverse: "#FFFFFF",

  // Border/Divider
  border: "#E0E0E0",
  divider: "#EEEEEE",

  // Semantic colors
  success: "#4CAF50",
  warning: "#FFC107",
  error: "#F44336",
  info: "#2196F3",

  // UI elements
  inputBackground: "#F5F5F5",
  inputBorder: "#E0E0E0",
  cardBackground: "#FFFFFF",
  tabBar: "rgba(255, 255, 255, 0.95)",
  headerBackground: "rgba(255, 255, 255, 0.85)",

  // Overlay
  overlay: "rgba(0, 0, 0, 0.5)",
  overlayLight: "rgba(0, 0, 0, 0.3)",

  // Status bar
  statusBar: "dark",
};

// Dark theme colors - carefully designed for readability and aesthetics
const darkColors: ThemeColors = {
  // Primary brand colors (slightly lighter for dark mode visibility)
  primary: "#4CAF50",
  primaryLight: "#81C784",
  primaryDark: "#1B5E20",

  // Secondary/accent colors
  accent: "#FFD54F",
  accentOrange: "#FF8A65",

  // Background colors - using subtle grays, not pure black
  background: "#121212",
  backgroundSecondary: "#1E1E1E",
  surface: "#1E1E1E",
  surfaceElevated: "#2C2C2C",

  // Text colors
  text: "#FFFFFF",
  textSecondary: "#B0B0B0",
  textTertiary: "#757575",
  textInverse: "#121212",

  // Border/Divider
  border: "#3D3D3D",
  divider: "#2C2C2C",

  // Semantic colors (adjusted for dark mode)
  success: "#66BB6A",
  warning: "#FFD54F",
  error: "#EF5350",
  info: "#42A5F5",

  // UI elements
  inputBackground: "#2C2C2C",
  inputBorder: "#3D3D3D",
  cardBackground: "#1E1E1E",
  tabBar: "rgba(18, 18, 18, 0.95)",
  headerBackground: "rgba(18, 18, 18, 0.85)",

  // Overlay
  overlay: "rgba(0, 0, 0, 0.7)",
  overlayLight: "rgba(0, 0, 0, 0.5)",

  // Status bar
  statusBar: "light",
};

// Theme context type
interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "@ntamgyinafoo_theme_mode";

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [isLoaded, setIsLoaded] = useState(false);

  // Determine if dark mode is active
  const isDark =
    mode === "dark" || (mode === "system" && systemColorScheme === "dark");

  // Get current colors based on theme
  const colors = isDark ? darkColors : lightColors;

  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedMode && ["light", "dark", "system"].includes(savedMode)) {
          setModeState(savedMode as ThemeMode);
        }
      } catch (error) {
        console.log("Error loading theme:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadTheme();
  }, []);

  // Save theme preference
  const setMode = async (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
    } catch (error) {
      console.log("Error saving theme:", error);
    }
  };

  // Don't render children until theme is loaded
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ mode, isDark, colors, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use theme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Export colors for static use (backwards compatibility)
export { lightColors, darkColors };
