import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInput,
  Dimensions,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
} from "react-native-reanimated";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Colors, Typography, Spacing } from "@/constants/design";
import { useTheme } from "@/contexts/ThemeContext";
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

const PROPERTY_TYPES = ["House", "Apartment", "Land", "Commercial", "All"];
const BEDROOM_OPTIONS = [null, 1, 2, 3, 4, 5]; // null = Any
const AMENITIES = [
  "Water",
  "Electricity",
  "Security",
  "Parking",
  "Internet",
  "Pool",
];

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PRICE_MIN = 0;
const PRICE_MAX = 5000000; // 5M max

// Dual Range Slider Component
const DualRangeSlider: React.FC<{
  minValue: number;
  maxValue: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  min: number;
  max: number;
}> = ({ minValue, maxValue, onMinChange, onMaxChange, min, max }) => {
  const sliderWidth = SCREEN_WIDTH - Spacing.xl * 4; // Account for padding
  const minPos = useSharedValue(0);
  const maxPos = useSharedValue(sliderWidth);
  const minStartPos = useSharedValue(0);
  const maxStartPos = useSharedValue(0);

  useEffect(() => {
    const minPercent = ((minValue - min) / (max - min)) * 100;
    const maxPercent = ((maxValue - min) / (max - min)) * 100;
    minPos.value = (minPercent / 100) * sliderWidth;
    maxPos.value = (maxPercent / 100) * sliderWidth;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minValue, maxValue, min, max, sliderWidth]);

  const getValueFromPosition = (x: number) => {
    "worklet";
    const percent = Math.max(0, Math.min(100, (x / sliderWidth) * 100));
    return Math.round(min + (percent / 100) * (max - min));
  };

  const updateMinValue = useCallback(
    (value: number) => {
      onMinChange(value);
    },
    [onMinChange]
  );

  const updateMaxValue = useCallback(
    (value: number) => {
      onMaxChange(value);
    },
    [onMaxChange]
  );

  // Update counter for throttling
  const updateCounter = useSharedValue(0);

  const minGesture = Gesture.Pan()
    .minDistance(5)
    .activeOffsetX([-5, 5])
    .failOffsetY([-20, 20])
    .onStart(() => {
      "worklet";
      minStartPos.value = minPos.value;
    })
    .onUpdate((event) => {
      "worklet";
      const newPos = Math.max(
        0,
        Math.min(maxPos.value - 20, minStartPos.value + event.translationX)
      );
      minPos.value = newPos;
      // Throttle JS updates - only update every 5th frame
      updateCounter.value += 1;
      if (updateCounter.value % 5 === 0) {
        const value = getValueFromPosition(newPos);
        if (value <= maxValue) {
          runOnJS(updateMinValue)(value);
        }
      }
    })
    .onEnd(() => {
      "worklet";
      const value = getValueFromPosition(minPos.value);
      if (value <= maxValue) {
        runOnJS(updateMinValue)(value);
      }
      updateCounter.value = 0;
    });

  const maxGesture = Gesture.Pan()
    .minDistance(5)
    .activeOffsetX([-5, 5])
    .failOffsetY([-20, 20])
    .onStart(() => {
      "worklet";
      maxStartPos.value = maxPos.value;
    })
    .onUpdate((event) => {
      "worklet";
      const newPos = Math.min(
        sliderWidth,
        Math.max(minPos.value + 20, maxStartPos.value + event.translationX)
      );
      maxPos.value = newPos;
      // Throttle JS updates - only update every 5th frame
      updateCounter.value += 1;
      if (updateCounter.value % 5 === 0) {
        const value = getValueFromPosition(newPos);
        if (value >= minValue) {
          runOnJS(updateMaxValue)(value);
        }
      }
    })
    .onEnd(() => {
      "worklet";
      const value = getValueFromPosition(maxPos.value);
      if (value >= minValue) {
        runOnJS(updateMaxValue)(value);
      }
      updateCounter.value = 0;
    });

  const minThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: minPos.value - 12 }],
  }));

  const maxThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: maxPos.value - 12 }],
  }));

  const activeTrackStyle = useAnimatedStyle(() => ({
    left: minPos.value,
    width: maxPos.value - minPos.value,
  }));

  return (
    <View
      style={styles.sliderContainer}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
    >
      <View style={styles.sliderTrack}>
        <Animated.View style={[styles.sliderActiveTrack, activeTrackStyle]} />
        <GestureDetector gesture={minGesture}>
          <Animated.View
            style={[styles.sliderThumb, minThumbStyle]}
            collapsable={false}
          />
        </GestureDetector>
        <GestureDetector gesture={maxGesture}>
          <Animated.View
            style={[styles.sliderThumb, maxThumbStyle]}
            collapsable={false}
          />
        </GestureDetector>
      </View>
    </View>
  );
};

export const FilterBottomSheet = React.forwardRef<
  BottomSheetModal,
  FilterBottomSheetProps
>(({ visible, onClose, onApply, initialFilters = {}, resultsCount }, ref) => {
  const { colors } = useTheme();
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // Forward ref to internal ref
  React.useImperativeHandle(ref, () => bottomSheetRef.current!);

  // Snap points for the bottom sheet
  // const snapPoints = useMemo(() => ["90%"], []);

  // Update filters when initialFilters change
  useEffect(() => {
    if (visible) {
      setFilters(initialFilters);
      setMinPriceInput(initialFilters.minPrice?.toString() || "");
      setMaxPriceInput(initialFilters.maxPrice?.toString() || "");
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
      if (type === "All") {
        // If "All" is selected, clear all property types
        return { ...prev, propertyTypes: [] };
      }
      const types = prev.propertyTypes || [];
      if (types.includes(type)) {
        const newTypes = types.filter((t) => t !== type);
        // If no types selected, it means "All" is effectively selected
        return { ...prev, propertyTypes: newTypes };
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

  const formatPriceRange = (): string => {
    const min = filters.minPrice || 0;
    const max = filters.maxPrice;
    const minStr = formatPrice(min);
    const maxStr = max ? formatPrice(max) : "2M+";
    return `${minStr} - ${maxStr}`;
  };

  const handleMinPriceChange = (text: string) => {
    setMinPriceInput(text);
    const value = parseInt(text.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(value)) {
      setFilters((prev) => ({
        ...prev,
        minPrice: Math.max(PRICE_MIN, Math.min(value, PRICE_MAX)),
      }));
    } else if (text === "") {
      setFilters((prev) => ({
        ...prev,
        minPrice: undefined,
      }));
    }
  };

  const handleMaxPriceChange = (text: string) => {
    setMaxPriceInput(text);
    const value = parseInt(text.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(value)) {
      setFilters((prev) => ({
        ...prev,
        maxPrice: Math.max(PRICE_MIN, Math.min(value, PRICE_MAX)),
      }));
    } else if (text === "") {
      setFilters((prev) => ({
        ...prev,
        maxPrice: undefined,
      }));
    }
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={["60%"]}
      onDismiss={handleDismiss}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={[
        styles.bottomSheet,
        { backgroundColor: colors.surface },
      ]}
      handleIndicatorStyle={[
        styles.handleIndicator,
        { backgroundColor: colors.textSecondary },
      ]}
    >
      <BottomSheetScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Filters
          </Text>
          <TouchableOpacity onPress={handleReset} activeOpacity={0.7}>
            <Text style={[styles.resetButton, { color: colors.primary }]}>
              Reset
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Property Type */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Property Type
            </Text>
            <View style={styles.chipsContainer}>
              {PROPERTY_TYPES.map((type) => {
                const isSelected =
                  filters.propertyTypes?.includes(type) || false;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.divider,
                      },
                      isSelected && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
                    onPress={() => togglePropertyType(type)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: colors.text },
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
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Transaction Type
            </Text>
            <View style={styles.chipsContainer}>
              {(["buy", "rent"] as const).map((type) => {
                const isSelected = filters.transactionType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.divider,
                      },
                      isSelected && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
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
                        { color: colors.text },
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
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Price Range (GHS)
            </Text>
            {/* Combined Display */}
            <View
              style={[
                styles.priceRangeDisplay,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text style={styles.priceRangeDisplayText}>
                {formatPriceRange()}
              </Text>
            </View>
            {/* Dual Range Slider */}
            <View style={styles.sliderWrapper}>
              <DualRangeSlider
                minValue={filters.minPrice || PRICE_MIN}
                maxValue={filters.maxPrice || PRICE_MAX}
                onMinChange={(value) => {
                  setFilters((prev) => ({ ...prev, minPrice: value }));
                  setMinPriceInput(value.toString());
                }}
                onMaxChange={(value) => {
                  setFilters((prev) => ({ ...prev, maxPrice: value }));
                  setMaxPriceInput(value.toString());
                }}
                min={PRICE_MIN}
                max={PRICE_MAX}
              />
            </View>
            {/* Min/Max Inputs */}
            <View style={styles.priceInputRow}>
              <View style={styles.priceInput}>
                <Text
                  style={[styles.priceLabel, { color: colors.textSecondary }]}
                >
                  Min
                </Text>
                <View
                  style={[
                    styles.priceInputWrapper,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.divider,
                    },
                  ]}
                >
                  <Text
                    style={[styles.currencySymbol, { color: colors.primary }]}
                  >
                    GHS
                  </Text>
                  <TextInput
                    style={[styles.priceInputField, { color: colors.text }]}
                    value={minPriceInput}
                    onChangeText={handleMinPriceChange}
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>
              <View style={styles.priceInput}>
                <Text
                  style={[styles.priceLabel, { color: colors.textSecondary }]}
                >
                  Max
                </Text>
                <View
                  style={[
                    styles.priceInputWrapper,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.divider,
                    },
                  ]}
                >
                  <Text
                    style={[styles.currencySymbol, { color: colors.primary }]}
                  >
                    GHS
                  </Text>
                  <TextInput
                    style={[styles.priceInputField, { color: colors.text }]}
                    value={maxPriceInput}
                    onChangeText={handleMaxPriceChange}
                    placeholder="No limit"
                    keyboardType="numeric"
                    placeholderTextColor={colors.textSecondary}
                  />
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
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.divider,
                      },
                      isSelected && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
                    onPress={() => {
                      setFilters({
                        ...filters,
                        minPrice: preset.min,
                        maxPrice: preset.max,
                      });
                      setMinPriceInput(preset.min.toString());
                      setMaxPriceInput(preset.max?.toString() || "");
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.pricePresetText,
                        { color: colors.text },
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

          {/* Bedrooms */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Bedrooms
            </Text>
            <View style={styles.chipsContainer}>
              {BEDROOM_OPTIONS.map((beds) => {
                const isSelected = filters.bedrooms === beds;
                const label =
                  beds === null ? "Any" : beds === 5 ? "5+" : beds.toString();
                return (
                  <TouchableOpacity
                    key={beds === null ? "any" : beds}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.divider,
                      },
                      isSelected && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
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
                        { color: colors.text },
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
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Amenities
            </Text>
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

        {/* Apply Button */}
        <View style={styles.buttonContainer}>
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
});

FilterBottomSheet.displayName = "FilterBottomSheet";

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
  scrollView: {
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
  priceRangeDisplay: {
    backgroundColor: Colors.primaryGreen,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderRadius: 16,
    marginBottom: Spacing.xl,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  priceRangeDisplayText: {
    ...Typography.headlineMedium,
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  sliderWrapper: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xs,
  },
  sliderContainer: {
    height: 50,
    justifyContent: "center",
    paddingVertical: Spacing.md,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: Colors.divider,
    borderRadius: 3,
    position: "relative",
  },
  sliderActiveTrack: {
    height: 6,
    backgroundColor: Colors.primaryGreen,
    borderRadius: 3,
    position: "absolute",
  },
  sliderThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primaryGreen,
    position: "absolute",
    top: -9,
    borderWidth: 4,
    borderColor: Colors.surface,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  priceInputRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
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
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.divider,
    gap: Spacing.xs,
    minHeight: 48,
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
  priceInputField: {
    ...Typography.bodyMedium,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    flex: 1,
    padding: 0,
    ...Platform.select({
      android: {
        includeFontPadding: false,
        textAlignVertical: "center",
      },
    }),
  },
  pricePresets: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.md,
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
  buttonContainer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    marginTop: Spacing.lg,
  },
  applyButton: {
    width: "100%",
  },
});
