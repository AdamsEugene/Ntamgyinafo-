import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Colors, Typography, Spacing } from "@/constants/design";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";

export interface FilterOptions {
  propertyTypes?: string[];
  transactionType?: "buy" | "rent" | null;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number | null;
  amenities?: string[];
}

interface FilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
  resultsCount?: number;
}

const PROPERTY_TYPES = ["House", "Apartment", "Land", "Commercial"];
const BEDROOM_OPTIONS = [null, 1, 2, 3, 4, 5]; // null = Any
const AMENITIES = [
  "Water",
  "Electricity",
  "Security",
  "Parking",
  "Internet",
  "Pool",
];

export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  visible,
  onClose,
  onApply,
  initialFilters = {},
  resultsCount,
}) => {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => ["90%"], []);

  // Update filters when initialFilters change
  useEffect(() => {
    if (visible) {
      setFilters(initialFilters);
    }
  }, [initialFilters, visible]);

  // Control bottom sheet visibility
  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  // Handle sheet dismiss
  const handleDismiss = useCallback(() => {
    onClose();
  }, [onClose]);

  // Backdrop component
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        onPress={onClose}
      />
    ),
    [onClose]
  );

  const togglePropertyType = (type: string) => {
    setFilters((prev) => {
      const types = prev.propertyTypes || [];
      if (types.includes(type)) {
        return { ...prev, propertyTypes: types.filter((t) => t !== type) };
      }
      return { ...prev, propertyTypes: [...types, type] };
    });
  };

  const toggleAmenity = (amenity: string) => {
    setFilters((prev) => {
      const amenities = prev.amenities || [];
      if (amenities.includes(amenity)) {
        return { ...prev, amenities: amenities.filter((a) => a !== amenity) };
      }
      return { ...prev, amenities: [...amenities, amenity] };
    });
  };

  const handleReset = () => {
    setFilters({});
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const getFilterCount = () => {
    let count = 0;
    if (filters.propertyTypes && filters.propertyTypes.length > 0) count++;
    if (filters.transactionType) count++;
    if (filters.minPrice !== undefined) count++;
    if (filters.maxPrice !== undefined) count++;
    if (filters.bedrooms !== null && filters.bedrooms !== undefined) count++;
    if (filters.amenities && filters.amenities.length > 0) count++;
    return count;
  };

  const formatPrice = (price: number): string => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    }
    if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K`;
    }
    return price.toString();
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      onDismiss={handleDismiss}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.bottomSheet}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetScrollView
        style={styles.bottomSheetContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Filters</Text>
          <TouchableOpacity onPress={handleReset} activeOpacity={0.7}>
            <Text style={styles.resetButton}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Property Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Property Type</Text>
            <View style={styles.chipsContainer}>
              {PROPERTY_TYPES.map((type) => {
                const isSelected =
                  filters.propertyTypes?.includes(type) || false;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => togglePropertyType(type)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Transaction Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transaction Type</Text>
            <View style={styles.chipsContainer}>
              {(["buy", "rent"] as const).map((type) => {
                const isSelected = filters.transactionType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() =>
                      setFilters((prev) => ({
                        ...prev,
                        transactionType: isSelected ? null : type,
                      }))
                    }
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                      ]}
                    >
                      {type === "buy" ? "Buy" : "Rent"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Price Range */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Range (GHS)</Text>
            <View style={styles.priceRangeContainer}>
              <View style={styles.priceInputRow}>
                <View style={styles.priceInput}>
                  <Text style={styles.priceLabel}>Min</Text>
                  <View style={styles.priceInputWrapper}>
                    <Text style={styles.currencySymbol}>GHS</Text>
                    <Text style={styles.priceDisplay}>
                      {filters.minPrice ? formatPrice(filters.minPrice) : "0"}
                    </Text>
                  </View>
                </View>
                <View style={styles.priceInput}>
                  <Text style={styles.priceLabel}>Max</Text>
                  <View style={styles.priceInputWrapper}>
                    <Text style={styles.currencySymbol}>GHS</Text>
                    <Text style={styles.priceDisplay}>
                      {filters.maxPrice
                        ? formatPrice(filters.maxPrice)
                        : "No limit"}
                    </Text>
                  </View>
                </View>
              </View>
              {/* Price Presets */}
              <View style={styles.pricePresets}>
                {[
                  { label: "Under 100K", min: 0, max: 100000 },
                  { label: "100K - 500K", min: 100000, max: 500000 },
                  { label: "500K - 1M", min: 500000, max: 1000000 },
                  { label: "1M+", min: 1000000, max: undefined },
                ].map((preset, index) => {
                  const isSelected =
                    filters.minPrice === preset.min &&
                    filters.maxPrice === preset.max;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.pricePresetChip,
                        isSelected && styles.pricePresetChipSelected,
                      ]}
                      onPress={() =>
                        setFilters({
                          ...filters,
                          minPrice: preset.min,
                          maxPrice: preset.max,
                        })
                      }
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.pricePresetText,
                          isSelected && styles.pricePresetTextSelected,
                        ]}
                      >
                        {preset.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Bedrooms */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bedrooms</Text>
            <View style={styles.chipsContainer}>
              {BEDROOM_OPTIONS.map((beds) => {
                const isSelected = filters.bedrooms === beds;
                const label =
                  beds === null ? "Any" : beds === 5 ? "5+" : beds.toString();
                return (
                  <TouchableOpacity
                    key={beds === null ? "any" : beds}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() =>
                      setFilters((prev) => ({
                        ...prev,
                        bedrooms: isSelected ? null : beds || null,
                      }))
                    }
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Amenities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesContainer}>
              {AMENITIES.map((amenity) => {
                const isSelected =
                  filters.amenities?.includes(amenity) || false;
                return (
                  <Checkbox
                    key={amenity}
                    label={amenity}
                    checked={isSelected}
                    onPress={() => toggleAmenity(amenity)}
                  />
                );
              })}
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            title={
              resultsCount !== undefined
                ? `Show ${resultsCount} Properties`
                : `Show ${getFilterCount()} Properties`
            }
            onPress={handleApply}
            variant="primary"
            style={styles.applyButton}
          />
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  handleIndicator: {
    backgroundColor: Colors.divider,
    width: 40,
    height: 4,
  },
  bottomSheetContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: Spacing["2xl"],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  headerTitle: {
    ...Typography.headlineMedium,
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  resetButton: {
    ...Typography.labelLarge,
    fontSize: 14,
    color: Colors.primaryGreen,
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: Spacing.xl,
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    ...Typography.labelLarge,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  chip: {
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
  chipSelected: {
    backgroundColor: Colors.primaryGreen,
    borderColor: Colors.primaryGreen,
  },
  chipText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  chipTextSelected: {
    color: "#FFFFFF",
  },
  priceRangeContainer: {
    gap: Spacing.md,
  },
  priceInputRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  priceInput: {
    flex: 1,
  },
  priceLabel: {
    ...Typography.labelMedium,
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  priceInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.divider,
    gap: Spacing.xs,
  },
  currencySymbol: {
    ...Typography.labelLarge,
    fontSize: 14,
    color: Colors.primaryGreen,
    fontWeight: "700",
  },
  priceDisplay: {
    ...Typography.bodyMedium,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  pricePresets: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  pricePresetChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.divider,
  },
  pricePresetChipSelected: {
    backgroundColor: Colors.primaryGreen,
    borderColor: Colors.primaryGreen,
  },
  pricePresetText: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  pricePresetTextSelected: {
    color: "#FFFFFF",
  },
  amenitiesContainer: {
    gap: Spacing.md,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  applyButton: {
    width: "100%",
  },
});
