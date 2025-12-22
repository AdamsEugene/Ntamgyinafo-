import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
  TextInput,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Typography, Spacing } from "@/constants/design";
import {
  FloatingHeaderStyles,
  HEADER_ICON_SIZE,
} from "@/components/FloatingHeader.styles";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface ContactOption {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: "1",
    question: "How do I list a property?",
    answer:
      "To list a property, tap on the 'Add Listing' button from the Owner Dashboard. Follow the 10-step process to add photos, videos, location, and property details. Once submitted, your listing will be reviewed within 24-48 hours.",
  },
  {
    id: "2",
    question: "How do I contact a property owner?",
    answer:
      "After finding a property you're interested in, tap on the 'Chat' or 'Call' button on the property detail page. You'll need an active subscription to contact property owners.",
  },
  {
    id: "3",
    question: "What payment methods are accepted?",
    answer:
      "We accept Mobile Money (MTN, Vodafone, AirtelTigo) and Debit/Credit Cards (Visa, Mastercard) through our secure Paystack payment gateway.",
  },
  {
    id: "4",
    question: "How do I upgrade my subscription?",
    answer:
      "Go to your Profile, tap on 'Subscription', and choose a plan that suits your needs. You can upgrade or downgrade at any time.",
  },
  {
    id: "5",
    question: "Is my data secure?",
    answer:
      "Yes! We use industry-standard encryption to protect your data. Your payment information is securely processed through Paystack, and we never store your card details.",
  },
  {
    id: "6",
    question: "How do I report a fake listing?",
    answer:
      "If you suspect a listing is fraudulent, tap the menu icon (⋮) on the property detail page and select 'Report Listing'. Our team will review it within 24 hours.",
  },
  {
    id: "7",
    question: "Can I cancel my subscription?",
    answer:
      "Yes, you can cancel your subscription anytime from your Profile > Subscription. Your access will continue until the end of your billing period.",
  },
];

export default function HelpSupportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showContactForm, setShowContactForm] = useState(false);
  const [formSubject, setFormSubject] = useState("");
  const [formMessage, setFormMessage] = useState("");

  const contactOptions: ContactOption[] = [
    {
      id: "call",
      icon: "call",
      title: "Call Us",
      subtitle: "+233 30 123 4567",
      color: Colors.primaryGreen,
      onPress: () => Linking.openURL("tel:+233301234567"),
    },
    {
      id: "whatsapp",
      icon: "logo-whatsapp",
      title: "WhatsApp",
      subtitle: "Chat with us",
      color: "#25D366",
      onPress: () => Linking.openURL("https://wa.me/233301234567"),
    },
    {
      id: "email",
      icon: "mail",
      title: "Email",
      subtitle: "support@ntamgyinafo.com",
      color: "#EA4335",
      onPress: () => Linking.openURL("mailto:support@ntamgyinafo.com"),
    },
  ];

  const filteredFAQs = FAQ_ITEMS.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitForm = () => {
    if (!formSubject.trim() || !formMessage.trim()) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    Alert.alert(
      "Message Sent",
      "Thank you for contacting us. We'll get back to you within 24 hours.",
      [
        {
          text: "OK",
          onPress: () => {
            setFormSubject("");
            setFormMessage("");
            setShowContactForm(false);
          },
        },
      ]
    );
  };

  const renderFAQItem = (item: FAQItem) => {
    const isExpanded = expandedFAQ === item.id;

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.faqItem, isExpanded && styles.faqItemExpanded]}
        onPress={() => setExpandedFAQ(isExpanded ? null : item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.faqHeader}>
          <Text style={styles.faqQuestion}>{item.question}</Text>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={Colors.textSecondary}
          />
        </View>
        {isExpanded && <Text style={styles.faqAnswer}>{item.answer}</Text>}
      </TouchableOpacity>
    );
  };

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
            <Text style={styles.headerTitleText}>Help & Support</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: 80 + insets.top,
              paddingBottom: 40 + insets.bottom,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Search */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for help..."
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Contact Options */}
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactOptions}>
            {contactOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.contactOption}
                onPress={option.onPress}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.contactIcon,
                    { backgroundColor: `${option.color}15` },
                  ]}
                >
                  <Ionicons name={option.icon} size={24} color={option.color} />
                </View>
                <Text style={styles.contactTitle}>{option.title}</Text>
                <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Contact Form Toggle */}
          <TouchableOpacity
            style={styles.contactFormToggle}
            onPress={() => setShowContactForm(!showContactForm)}
            activeOpacity={0.7}
          >
            <View style={styles.contactFormToggleLeft}>
              <Ionicons
                name="chatbox-ellipses"
                size={22}
                color={Colors.primaryGreen}
              />
              <Text style={styles.contactFormToggleText}>
                Send us a message
              </Text>
            </View>
            <Ionicons
              name={showContactForm ? "chevron-up" : "chevron-down"}
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Contact Form */}
          {showContactForm && (
            <View style={styles.contactForm}>
              <Text style={styles.inputLabel}>Subject</Text>
              <TextInput
                style={styles.textInput}
                placeholder="What's this about?"
                placeholderTextColor={Colors.textSecondary}
                value={formSubject}
                onChangeText={setFormSubject}
              />

              <Text style={styles.inputLabel}>Message</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Describe your issue or question..."
                placeholderTextColor={Colors.textSecondary}
                value={formMessage}
                onChangeText={setFormMessage}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmitForm}
                activeOpacity={0.8}
              >
                <Ionicons name="send" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Send Message</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* FAQ Section */}
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqContainer}>
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map(renderFAQItem)
            ) : (
              <View style={styles.noResults}>
                <Ionicons
                  name="search"
                  size={40}
                  color={Colors.textSecondary}
                />
                <Text style={styles.noResultsText}>No results found</Text>
                <Text style={styles.noResultsSubtext}>
                  Try a different search or contact us directly
                </Text>
              </View>
            )}
          </View>

          {/* Still Need Help */}
          <View style={styles.needHelpCard}>
            <Ionicons name="help-buoy" size={40} color={Colors.primaryGreen} />
            <Text style={styles.needHelpTitle}>Still need help?</Text>
            <Text style={styles.needHelpText}>
              Our support team is available Monday to Friday, 9 AM - 6 PM GMT.
            </Text>
            <TouchableOpacity
              style={styles.needHelpButton}
              onPress={() => Linking.openURL("mailto:support@ntamgyinafo.com")}
              activeOpacity={0.8}
            >
              <Ionicons name="mail" size={20} color="#FFFFFF" />
              <Text style={styles.needHelpButtonText}>Email Support</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.divider,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.bodyMedium,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  sectionTitle: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  // Contact Options
  contactOptions: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  contactOption: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    alignItems: "center",
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
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  contactTitle: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  contactSubtitle: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  // Contact Form Toggle
  contactFormToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  contactFormToggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  contactFormToggleText: {
    ...Typography.labelMedium,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  // Contact Form
  contactForm: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  inputLabel: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  textInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
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
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primaryGreen,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    marginTop: Spacing.sm,
  },
  submitButtonText: {
    ...Typography.labelMedium,
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // FAQ
  faqContainer: {
    marginBottom: Spacing.xl,
  },
  faqItem: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  faqItemExpanded: {
    borderColor: Colors.primaryGreen,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  faqQuestion: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    flex: 1,
  },
  faqAnswer: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  noResults: {
    alignItems: "center",
    paddingVertical: Spacing.xl * 2,
  },
  noResultsText: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  noResultsSubtext: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  // Need Help Card
  needHelpCard: {
    backgroundColor: `${Colors.primaryGreen}10`,
    borderRadius: 20,
    padding: Spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: `${Colors.primaryGreen}20`,
    marginBottom: Spacing.xl,
  },
  needHelpTitle: {
    ...Typography.titleMedium,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  needHelpText: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  needHelpButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primaryGreen,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 12,
  },
  needHelpButtonText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
