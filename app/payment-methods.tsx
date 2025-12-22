import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  TextInput,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Colors, Typography, Spacing } from "@/constants/design";
import {
  FloatingHeaderStyles,
  HEADER_ICON_SIZE,
} from "@/components/FloatingHeader.styles";

interface PaymentMethod {
  id: string;
  type: "momo" | "card";
  name: string;
  details: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  isDefault: boolean;
}

const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "1",
    type: "momo",
    name: "MTN Mobile Money",
    details: "024 **** 567",
    icon: "phone-portrait",
    color: "#FFCC00",
    isDefault: true,
  },
  {
    id: "2",
    type: "momo",
    name: "Vodafone Cash",
    details: "020 **** 890",
    icon: "phone-portrait",
    color: "#E60000",
    isDefault: false,
  },
  {
    id: "3",
    type: "card",
    name: "Visa Card",
    details: "**** **** **** 4242",
    icon: "card",
    color: "#1A1F71",
    isDefault: false,
  },
];

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [paymentMethods, setPaymentMethods] =
    useState<PaymentMethod[]>(MOCK_PAYMENT_METHODS);
  const addMethodSheetRef = useRef<BottomSheetModal>(null);
  const [selectedType, setSelectedType] = useState<"momo" | "card" | null>(
    null
  );

  // Form states
  const [momoPhone, setMomoPhone] = useState("");
  const [momoNetwork, setMomoNetwork] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const handleSetDefault = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((m) => ({ ...m, isDefault: m.id === id }))
    );
  };

  const handleDelete = (id: string) => {
    const method = paymentMethods.find((m) => m.id === id);
    if (method?.isDefault) {
      Alert.alert(
        "Cannot Delete",
        "You cannot delete your default payment method."
      );
      return;
    }

    Alert.alert(
      "Delete Payment Method",
      `Are you sure you want to remove ${method?.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setPaymentMethods((prev) => prev.filter((m) => m.id !== id));
          },
        },
      ]
    );
  };

  const handleAddMomo = () => {
    if (!momoPhone || !momoNetwork) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    const networkColors: Record<string, string> = {
      MTN: "#FFCC00",
      Vodafone: "#E60000",
      AirtelTigo: "#E40046",
    };

    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: "momo",
      name: `${momoNetwork} Mobile Money`,
      details: momoPhone.replace(/(\d{3})(\d{4})(\d{3})/, "$1 **** $3"),
      icon: "phone-portrait",
      color: networkColors[momoNetwork] || Colors.primaryGreen,
      isDefault: paymentMethods.length === 0,
    };

    setPaymentMethods((prev) => [...prev, newMethod]);
    setMomoPhone("");
    setMomoNetwork(null);
    setSelectedType(null);
    addMethodSheetRef.current?.dismiss();
    Alert.alert("Success", "Payment method added successfully!");
  };

  const handleAddCard = () => {
    if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: "card",
      name: cardNumber.startsWith("4") ? "Visa Card" : "Mastercard",
      details: `**** **** **** ${cardNumber.slice(-4)}`,
      icon: "card",
      color: cardNumber.startsWith("4") ? "#1A1F71" : "#EB001B",
      isDefault: paymentMethods.length === 0,
    };

    setPaymentMethods((prev) => [...prev, newMethod]);
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setCardName("");
    setSelectedType(null);
    addMethodSheetRef.current?.dismiss();
    Alert.alert("Success", "Payment method added successfully!");
  };

  const renderPaymentMethod = (method: PaymentMethod) => (
    <View key={method.id} style={styles.methodCard}>
      <View style={styles.methodCardHeader}>
        <View
          style={[styles.methodIcon, { backgroundColor: `${method.color}20` }]}
        >
          <Ionicons name={method.icon} size={24} color={method.color} />
        </View>
        <View style={styles.methodInfo}>
          <View style={styles.methodNameRow}>
            <Text style={styles.methodName}>{method.name}</Text>
            {method.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Default</Text>
              </View>
            )}
          </View>
          <Text style={styles.methodDetails}>{method.details}</Text>
        </View>
      </View>

      <View style={styles.methodActions}>
        {!method.isDefault && (
          <TouchableOpacity
            style={styles.methodAction}
            onPress={() => handleSetDefault(method.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color={Colors.primaryGreen}
            />
            <Text style={styles.methodActionText}>Set Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.methodAction}
          onPress={() => handleDelete(method.id)}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
          <Text style={[styles.methodActionText, { color: "#EF4444" }]}>
            Remove
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* Decorative Background Elements */}
        <View style={styles.decorativeBackground}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
        </View>

        {/* Floating Sticky Header */}
        <View
          style={[
            FloatingHeaderStyles.floatingHeader,
            { paddingTop: insets.top + Spacing.md },
          ]}
        >
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={FloatingHeaderStyles.actionButton}
              activeOpacity={0.7}
            >
              <View style={FloatingHeaderStyles.actionButtonBackground}>
                <Ionicons
                  name="arrow-back"
                  size={HEADER_ICON_SIZE}
                  color={Colors.textPrimary}
                />
              </View>
            </TouchableOpacity>
            <Text style={styles.headerTitleText}>Payment Methods</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: 80 + insets.top,
              paddingBottom: 120 + insets.bottom,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Ionicons
              name="shield-checkmark"
              size={24}
              color={Colors.primaryGreen}
            />
            <View style={styles.infoBannerContent}>
              <Text style={styles.infoBannerTitle}>Secure Payments</Text>
              <Text style={styles.infoBannerText}>
                Your payment info is encrypted and secure. Powered by Paystack.
              </Text>
            </View>
          </View>

          {/* Payment Methods */}
          <Text style={styles.sectionTitle}>Saved Payment Methods</Text>
          {paymentMethods.length > 0 ? (
            paymentMethods.map(renderPaymentMethod)
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons
                  name="card-outline"
                  size={48}
                  color={Colors.textSecondary}
                />
              </View>
              <Text style={styles.emptyTitle}>No Payment Methods</Text>
              <Text style={styles.emptyMessage}>
                Add a payment method to make transactions easier.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Add Payment Method Button */}
        <View
          style={[
            styles.addButtonContainer,
            { paddingBottom: insets.bottom + Spacing.lg },
          ]}
        >
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => addMethodSheetRef.current?.present()}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Payment Method</Text>
          </TouchableOpacity>
        </View>

        {/* Add Method Bottom Sheet */}
        <BottomSheetModal
          ref={addMethodSheetRef}
          index={0}
          snapPoints={selectedType ? ["70%"] : ["40%"]}
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={{ backgroundColor: Colors.textSecondary }}
        >
          <BottomSheetView style={styles.sheetContent}>
            {!selectedType ? (
              <>
                <Text style={styles.sheetTitle}>Add Payment Method</Text>
                <Text style={styles.sheetSubtitle}>
                  Choose how you&apos;d like to pay
                </Text>

                <TouchableOpacity
                  style={styles.methodOption}
                  onPress={() => setSelectedType("momo")}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.methodOptionIcon,
                      { backgroundColor: "#FFCC0020" },
                    ]}
                  >
                    <Ionicons name="phone-portrait" size={28} color="#FFCC00" />
                  </View>
                  <View style={styles.methodOptionInfo}>
                    <Text style={styles.methodOptionTitle}>Mobile Money</Text>
                    <Text style={styles.methodOptionDesc}>
                      MTN, Vodafone, AirtelTigo
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.methodOption}
                  onPress={() => setSelectedType("card")}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.methodOptionIcon,
                      { backgroundColor: "#1A1F7120" },
                    ]}
                  >
                    <Ionicons name="card" size={28} color="#1A1F71" />
                  </View>
                  <View style={styles.methodOptionInfo}>
                    <Text style={styles.methodOptionTitle}>
                      Debit/Credit Card
                    </Text>
                    <Text style={styles.methodOptionDesc}>
                      Visa, Mastercard
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>
              </>
            ) : selectedType === "momo" ? (
              <>
                <View style={styles.sheetHeader}>
                  <TouchableOpacity onPress={() => setSelectedType(null)}>
                    <Ionicons
                      name="arrow-back"
                      size={24}
                      color={Colors.textPrimary}
                    />
                  </TouchableOpacity>
                  <Text style={styles.sheetTitle}>Add Mobile Money</Text>
                  <View style={{ width: 24 }} />
                </View>

                <Text style={styles.inputLabel}>Select Network</Text>
                <View style={styles.networkOptions}>
                  {["MTN", "Vodafone", "AirtelTigo"].map((network) => (
                    <TouchableOpacity
                      key={network}
                      style={[
                        styles.networkOption,
                        momoNetwork === network && styles.networkOptionActive,
                      ]}
                      onPress={() => setMomoNetwork(network)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.networkOptionText,
                          momoNetwork === network &&
                            styles.networkOptionTextActive,
                        ]}
                      >
                        {network}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Phone Number</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="024 XXX XXXX"
                    placeholderTextColor={Colors.textSecondary}
                    value={momoPhone}
                    onChangeText={setMomoPhone}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleAddMomo}
                  activeOpacity={0.8}
                >
                  <Text style={styles.submitButtonText}>Add Mobile Money</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.sheetHeader}>
                  <TouchableOpacity onPress={() => setSelectedType(null)}>
                    <Ionicons
                      name="arrow-back"
                      size={24}
                      color={Colors.textPrimary}
                    />
                  </TouchableOpacity>
                  <Text style={styles.sheetTitle}>Add Card</Text>
                  <View style={{ width: 24 }} />
                </View>

                <Text style={styles.inputLabel}>Card Number</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="1234 5678 9012 3456"
                    placeholderTextColor={Colors.textSecondary}
                    value={cardNumber}
                    onChangeText={setCardNumber}
                    keyboardType="number-pad"
                    maxLength={16}
                  />
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputHalf}>
                    <Text style={styles.inputLabel}>Expiry</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="MM/YY"
                        placeholderTextColor={Colors.textSecondary}
                        value={cardExpiry}
                        onChangeText={setCardExpiry}
                        keyboardType="number-pad"
                        maxLength={5}
                      />
                    </View>
                  </View>
                  <View style={styles.inputHalf}>
                    <Text style={styles.inputLabel}>CVV</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="123"
                        placeholderTextColor={Colors.textSecondary}
                        value={cardCvv}
                        onChangeText={setCardCvv}
                        keyboardType="number-pad"
                        maxLength={4}
                        secureTextEntry
                      />
                    </View>
                  </View>
                </View>

                <Text style={styles.inputLabel}>Cardholder Name</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Name on card"
                    placeholderTextColor={Colors.textSecondary}
                    value={cardName}
                    onChangeText={setCardName}
                    autoCapitalize="words"
                  />
                </View>

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleAddCard}
                  activeOpacity={0.8}
                >
                  <Text style={styles.submitButtonText}>Add Card</Text>
                </TouchableOpacity>
              </>
            )}
          </BottomSheetView>
        </BottomSheetModal>
      </View>
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
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  // Info Banner
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${Colors.primaryGreen}10`,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: `${Colors.primaryGreen}20`,
  },
  infoBannerContent: {
    flex: 1,
  },
  infoBannerTitle: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primaryGreen,
    marginBottom: 2,
  },
  infoBannerText: {
    ...Typography.bodyMedium,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  // Method Card
  methodCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
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
  methodCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  methodInfo: {
    flex: 1,
  },
  methodNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  methodName: {
    ...Typography.labelMedium,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  defaultBadge: {
    backgroundColor: `${Colors.primaryGreen}15`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  defaultBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
  methodDetails: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  methodActions: {
    flexDirection: "row",
    gap: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  methodAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  methodActionText: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "500",
    color: Colors.primaryGreen,
  },
  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xl * 2,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  emptyTitle: {
    ...Typography.titleMedium,
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  emptyMessage: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  // Add Button
  addButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primaryGreen,
    paddingVertical: Spacing.lg,
    borderRadius: 16,
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
  addButtonText: {
    ...Typography.labelLarge,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  // Bottom Sheet
  sheetContent: {
    padding: Spacing.xl,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  sheetTitle: {
    ...Typography.headlineMedium,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  sheetSubtitle: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  methodOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: 16,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
    gap: Spacing.md,
  },
  methodOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  methodOptionInfo: {
    flex: 1,
  },
  methodOptionTitle: {
    ...Typography.labelMedium,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  methodOptionDesc: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  // Form
  inputLabel: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  inputWrapper: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === "ios" ? Spacing.md : Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  textInput: {
    ...Typography.bodyMedium,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  inputRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  inputHalf: {
    flex: 1,
  },
  networkOptions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  networkOption: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  networkOptionActive: {
    backgroundColor: `${Colors.primaryGreen}15`,
    borderColor: Colors.primaryGreen,
  },
  networkOptionText: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  networkOptionTextActive: {
    color: Colors.primaryGreen,
  },
  submitButton: {
    backgroundColor: Colors.primaryGreen,
    paddingVertical: Spacing.lg,
    borderRadius: 16,
    marginTop: Spacing.xl,
    alignItems: "center",
  },
  submitButtonText: {
    ...Typography.labelLarge,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
