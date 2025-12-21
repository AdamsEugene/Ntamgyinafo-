import { StyleSheet, Platform } from "react-native";
import { Colors, Spacing, Typography } from "@/constants/design";

/**
 * Shared styles for floating headers used across the app
 * Ensures consistent icon sizes (22px) and button styles matching the dashboard
 */
export const FloatingHeaderStyles = StyleSheet.create({
  floatingHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    zIndex: 100,
  },
  backButton: {
    justifyContent: "center",
    alignItems: "center",
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
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    marginHorizontal: Spacing.md,
  },
  headerActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonBackground: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
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
  filterBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: Colors.primaryGreen,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  filterBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

/**
 * Standard icon size for header buttons (matches dashboard)
 */
export const HEADER_ICON_SIZE = 22;
