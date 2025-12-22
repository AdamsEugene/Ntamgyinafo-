import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
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

type Tab = "terms" | "privacy";

interface Section {
  title: string;
  content: string;
}

const TERMS_SECTIONS: Section[] = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By accessing or using Ntamgyinafoɔ, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. We reserve the right to modify these terms at any time, and your continued use of the app constitutes acceptance of any changes.",
  },
  {
    title: "2. User Accounts",
    content:
      "To access certain features, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must provide accurate information and update it as necessary. We reserve the right to suspend or terminate accounts that violate these terms.",
  },
  {
    title: "3. Property Listings",
    content:
      "Property owners are solely responsible for the accuracy of their listings. All listings are subject to review and approval. We do not guarantee the accuracy, completeness, or availability of any listing. We reserve the right to remove listings that violate our policies or contain misleading information.",
  },
  {
    title: "4. User Conduct",
    content:
      "Users agree not to: post false or misleading information; harass or threaten other users; use the platform for fraudulent activities; attempt to gain unauthorized access to our systems; violate any applicable laws or regulations. Violation of these rules may result in account termination.",
  },
  {
    title: "5. Payments & Subscriptions",
    content:
      "Subscription fees are charged in advance and are non-refundable except as required by law. Prices may change with notice. You authorize us to charge your selected payment method. Subscriptions auto-renew unless cancelled before the renewal date.",
  },
  {
    title: "6. Intellectual Property",
    content:
      "All content on Ntamgyinafoɔ, including logos, text, graphics, and software, is our property or licensed to us. Users retain rights to their uploaded content but grant us a license to use, display, and distribute such content on our platform.",
  },
  {
    title: "7. Limitation of Liability",
    content:
      "Ntamgyinafoɔ is provided 'as is' without warranties. We are not liable for any direct, indirect, incidental, or consequential damages arising from your use of the service. We do not guarantee that properties listed are available, accurate, or suitable for your needs.",
  },
  {
    title: "8. Dispute Resolution",
    content:
      "Any disputes arising from these terms shall be governed by the laws of Ghana. Users agree to first attempt to resolve disputes through our support team before pursuing legal action.",
  },
];

const PRIVACY_SECTIONS: Section[] = [
  {
    title: "1. Information We Collect",
    content:
      "We collect: personal information (name, phone number, email); account data; property listings and preferences; usage data and analytics; device information; location data (with your permission). We collect this information when you register, use our services, or contact us.",
  },
  {
    title: "2. How We Use Your Information",
    content:
      "We use your information to: provide and improve our services; process transactions; send notifications and updates; personalize your experience; ensure platform security; comply with legal obligations; analyze usage patterns to improve our platform.",
  },
  {
    title: "3. Information Sharing",
    content:
      "We may share your information with: other users (as needed for transactions); service providers (payment processors, analytics); legal authorities (when required by law); business partners (with your consent). We do not sell your personal information to third parties.",
  },
  {
    title: "4. Data Security",
    content:
      "We implement industry-standard security measures including encryption, secure servers, and access controls. However, no method of transmission over the internet is 100% secure. We encourage you to use strong passwords and protect your account credentials.",
  },
  {
    title: "5. Your Rights",
    content:
      "You have the right to: access your personal data; correct inaccurate information; delete your account and data; opt-out of marketing communications; restrict certain data processing; data portability. Contact us at privacy@ntamgyinafo.com to exercise these rights.",
  },
  {
    title: "6. Cookies & Tracking",
    content:
      "We use cookies and similar technologies to improve functionality, analyze usage, and personalize content. You can control cookie settings through your device or browser, though some features may not function properly without cookies.",
  },
  {
    title: "7. Children's Privacy",
    content:
      "Our services are not intended for users under 18 years old. We do not knowingly collect information from children. If we learn that we have collected information from a child, we will delete it promptly.",
  },
  {
    title: "8. Changes to Privacy Policy",
    content:
      "We may update this policy periodically. We will notify you of significant changes through the app or email. Your continued use after changes constitutes acceptance of the updated policy.",
  },
  {
    title: "9. Contact Us",
    content:
      "For privacy-related questions or concerns, contact us at:\n\nEmail: privacy@ntamgyinafo.com\nPhone: +233 30 123 4567\nAddress: 123 Independence Ave, Accra, Ghana",
  },
];

export default function TermsPrivacyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>("terms");

  const sections = activeTab === "terms" ? TERMS_SECTIONS : PRIVACY_SECTIONS;

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
            <Text style={styles.headerTitleText}>Terms & Privacy</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={[styles.tabsContainer, { top: 70 + insets.top }]}>
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "terms" && styles.tabActive]}
              onPress={() => setActiveTab("terms")}
              activeOpacity={0.7}
            >
              <Ionicons
                name="document-text"
                size={18}
                color={activeTab === "terms" ? "#FFFFFF" : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "terms" && styles.tabTextActive,
                ]}
              >
                Terms of Service
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "privacy" && styles.tabActive]}
              onPress={() => setActiveTab("privacy")}
              activeOpacity={0.7}
            >
              <Ionicons
                name="shield-checkmark"
                size={18}
                color={
                  activeTab === "privacy" ? "#FFFFFF" : Colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "privacy" && styles.tabTextActive,
                ]}
              >
                Privacy Policy
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: 130 + insets.top,
              paddingBottom: 40 + insets.bottom,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Last Updated */}
          <View style={styles.lastUpdated}>
            <Ionicons
              name="time-outline"
              size={14}
              color={Colors.textSecondary}
            />
            <Text style={styles.lastUpdatedText}>
              Last updated: December 2024
            </Text>
          </View>

          {/* Intro */}
          <View style={styles.introCard}>
            <Ionicons
              name={
                activeTab === "terms" ? "document-text" : "shield-checkmark"
              }
              size={28}
              color={Colors.primaryGreen}
            />
            <Text style={styles.introTitle}>
              {activeTab === "terms" ? "Terms of Service" : "Privacy Policy"}
            </Text>
            <Text style={styles.introText}>
              {activeTab === "terms"
                ? "Please read these terms carefully before using Ntamgyinafoɔ. By using our app, you agree to these terms."
                : "Your privacy is important to us. This policy explains how we collect, use, and protect your information."}
            </Text>
          </View>

          {/* Sections */}
          {sections.map((section, index) => (
            <View key={index} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionContent}>{section.content}</Text>
            </View>
          ))}

          {/* Contact CTA */}
          <View style={styles.contactCard}>
            <Ionicons
              name="help-circle"
              size={32}
              color={Colors.primaryGreen}
            />
            <Text style={styles.contactTitle}>Have Questions?</Text>
            <Text style={styles.contactText}>
              If you have any questions about our{" "}
              {activeTab === "terms" ? "Terms of Service" : "Privacy Policy"},
              please contact us.
            </Text>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => router.push("/help-support")}
              activeOpacity={0.8}
            >
              <Ionicons name="chatbubble-ellipses" size={18} color="#FFFFFF" />
              <Text style={styles.contactButtonText}>Contact Support</Text>
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
  // Tabs
  tabsContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 9,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: Spacing.sm,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: Colors.primaryGreen,
  },
  tabText: {
    ...Typography.labelMedium,
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  // Last Updated
  lastUpdated: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: Spacing.lg,
  },
  lastUpdatedText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  // Intro Card
  introCard: {
    backgroundColor: `${Colors.primaryGreen}10`,
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: `${Colors.primaryGreen}20`,
  },
  introTitle: {
    ...Typography.titleMedium,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  introText: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  // Sections
  section: {
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
  sectionTitle: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  sectionContent: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  // Contact Card
  contactCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.xl,
    alignItems: "center",
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  contactTitle: {
    ...Typography.titleMedium,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  contactText: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primaryGreen,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 12,
  },
  contactButtonText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
