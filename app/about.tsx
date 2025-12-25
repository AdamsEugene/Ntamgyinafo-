import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Typography, Spacing } from "@/constants/design";
import { useTheme } from "@/contexts/ThemeContext";
import { FloatingHeader } from "@/components/FloatingHeader";

interface SocialLink {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  name: string;
  url: string;
  color: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

const SOCIAL_LINKS: SocialLink[] = [
  {
    id: "twitter",
    icon: "logo-twitter",
    name: "Twitter",
    url: "https://twitter.com/ntamgyinafo",
    color: "#1DA1F2",
  },
  {
    id: "instagram",
    icon: "logo-instagram",
    name: "Instagram",
    url: "https://instagram.com/ntamgyinafo",
    color: "#E4405F",
  },
  {
    id: "facebook",
    icon: "logo-facebook",
    name: "Facebook",
    url: "https://facebook.com/ntamgyinafo",
    color: "#1877F2",
  },
  {
    id: "linkedin",
    icon: "logo-linkedin",
    name: "LinkedIn",
    url: "https://linkedin.com/company/ntamgyinafo",
    color: "#0A66C2",
  },
];

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "1",
    name: "Kofi Asante",
    role: "Founder & CEO",
    avatar: "https://i.pravatar.cc/150?img=11",
  },
  {
    id: "2",
    name: "Ama Mensah",
    role: "Head of Operations",
    avatar: "https://i.pravatar.cc/150?img=5",
  },
  {
    id: "3",
    name: "Kwame Boateng",
    role: "Lead Developer",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
];

const STATS = [
  { label: "Properties Listed", value: "10,000+" },
  { label: "Active Users", value: "50,000+" },
  { label: "Cities Covered", value: "16" },
  { label: "Happy Customers", value: "25,000+" },
];

export default function AboutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Decorative Background Elements */}
        <View style={styles.decorativeBackground}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
        </View>

        {/* Floating Header with Blur */}
        <FloatingHeader
          title="About"
          showBackButton
          onBackPress={() => router.back()}
        />

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
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View
              style={[
                styles.logoContainer,
                {
                  backgroundColor: `${colors.primary}15`,
                  borderColor: colors.primary,
                },
              ]}
            >
              <Ionicons name="home" size={48} color={colors.primary} />
            </View>
            <Text style={[styles.appName, { color: colors.primary }]}>
              Ntamgyinafoɔ
            </Text>
            <Text style={[styles.tagline, { color: colors.textSecondary }]}>
              Find. Visit. Own.
            </Text>
            <Text
              style={[
                styles.version,
                {
                  backgroundColor: colors.surface,
                  color: colors.textSecondary,
                },
              ]}
            >
              Version 1.0.0
            </Text>
          </View>

          {/* Mission Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Our Mission
            </Text>
            <View
              style={[
                styles.missionCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
            >
              <Text
                style={[styles.missionText, { color: colors.textSecondary }]}
              >
                To revolutionize the real estate market in Ghana by connecting
                property seekers with verified owners through a seamless,
                transparent, and trustworthy platform.
              </Text>
              <Text
                style={[styles.missionText, { color: colors.textSecondary }]}
              >
                We believe everyone deserves access to quality housing
                information. That&apos;s why we&apos;re building the most
                comprehensive property database in Ghana, complete with photos,
                videos, 360° views, and exact GPS locations.
              </Text>
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Our Impact
            </Text>
            <View style={styles.statsGrid}>
              {STATS.map((stat) => (
                <View
                  key={stat.label}
                  style={[
                    styles.statCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.divider,
                    },
                  ]}
                >
                  <Text style={[styles.statValue, { color: colors.primary }]}>
                    {stat.value}
                  </Text>
                  <Text
                    style={[styles.statLabel, { color: colors.textSecondary }]}
                  >
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Features Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              What Makes Us Different
            </Text>
            <View
              style={[
                styles.featuresContainer,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.divider,
                },
              ]}
            >
              <View
                style={[
                  styles.featureItem,
                  { borderBottomColor: colors.divider },
                ]}
              >
                <View
                  style={[styles.featureIcon, { backgroundColor: "#3B82F615" }]}
                >
                  <Ionicons name="shield-checkmark" size={24} color="#3B82F6" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={[styles.featureTitle, { color: colors.text }]}>
                    Verified Listings
                  </Text>
                  <Text
                    style={[
                      styles.featureDesc,
                      { color: colors.textSecondary },
                    ]}
                  >
                    All properties are reviewed before going live
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.featureItem,
                  { borderBottomColor: colors.divider },
                ]}
              >
                <View
                  style={[styles.featureIcon, { backgroundColor: "#8B5CF615" }]}
                >
                  <Ionicons name="cube" size={24} color="#8B5CF6" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={[styles.featureTitle, { color: colors.text }]}>
                    360° Virtual Tours
                  </Text>
                  <Text
                    style={[
                      styles.featureDesc,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Explore properties from anywhere
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.featureItem,
                  { borderBottomColor: colors.divider },
                ]}
              >
                <View
                  style={[styles.featureIcon, { backgroundColor: "#F59E0B15" }]}
                >
                  <Ionicons name="location" size={24} color="#F59E0B" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={[styles.featureTitle, { color: colors.text }]}>
                    Exact GPS Locations
                  </Text>
                  <Text
                    style={[
                      styles.featureDesc,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Navigate directly to properties
                  </Text>
                </View>
              </View>

              <View style={[styles.featureItem, { borderBottomWidth: 0 }]}>
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: `${colors.primary}15` },
                  ]}
                >
                  <Ionicons
                    name="chatbubbles"
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.featureContent}>
                  <Text style={[styles.featureTitle, { color: colors.text }]}>
                    Direct Communication
                  </Text>
                  <Text
                    style={[
                      styles.featureDesc,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Chat and call property owners directly
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Team Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Meet the Team
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.teamContainer}
            >
              {TEAM_MEMBERS.map((member) => (
                <View
                  key={member.id}
                  style={[
                    styles.teamCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.divider,
                    },
                  ]}
                >
                  <Image
                    source={{ uri: member.avatar }}
                    style={[styles.teamAvatar, { borderColor: colors.primary }]}
                  />
                  <Text style={[styles.teamName, { color: colors.text }]}>
                    {member.name}
                  </Text>
                  <Text
                    style={[styles.teamRole, { color: colors.textSecondary }]}
                  >
                    {member.role}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Social Links */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Follow Us
            </Text>
            <View style={styles.socialLinks}>
              {SOCIAL_LINKS.map((link) => (
                <TouchableOpacity
                  key={link.id}
                  style={[
                    styles.socialLink,
                    { backgroundColor: `${link.color}15` },
                  ]}
                  onPress={() => Linking.openURL(link.url)}
                  activeOpacity={0.7}
                >
                  <Ionicons name={link.icon} size={24} color={link.color} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.footerLink}
              onPress={() => router.push("/terms-privacy" as any)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="document-text-outline"
                size={18}
                color={colors.primary}
              />
              <Text style={[styles.footerLinkText, { color: colors.primary }]}>
                Terms & Privacy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.footerLink}
              onPress={() => Linking.openURL("https://ntamgyinafo.com")}
              activeOpacity={0.7}
            >
              <Ionicons name="globe-outline" size={18} color={colors.primary} />
              <Text style={[styles.footerLinkText, { color: colors.primary }]}>
                Visit Website
              </Text>
            </TouchableOpacity>
          </View>

          {/* Copyright */}
          <View style={styles.copyright}>
            <Text
              style={[styles.copyrightText, { color: colors.textSecondary }]}
            >
              Made with ❤️ in Ghana
            </Text>
            <Text
              style={[styles.copyrightText, { color: colors.textSecondary }]}
            >
              © 2024 Ntamgyinafoɔ. All rights reserved.
            </Text>
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
  // Hero Section
  heroSection: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: `${Colors.primaryGreen}15`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.primaryGreen,
  },
  appName: {
    ...Typography.headlineLarge,
    fontSize: 28,
    fontWeight: "800",
    color: Colors.primaryGreen,
    marginBottom: Spacing.xs,
  },
  tagline: {
    ...Typography.bodyMedium,
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  version: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
    overflow: "hidden",
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  // Mission Card
  missionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.divider,
    gap: Spacing.md,
  },
  missionText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  statCard: {
    width: "47%",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
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
  statValue: {
    ...Typography.headlineMedium,
    fontSize: 24,
    fontWeight: "800",
    color: Colors.primaryGreen,
    marginBottom: 4,
  },
  statLabel: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  // Features
  featuresContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  featureDesc: {
    ...Typography.bodyMedium,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  // Team
  teamContainer: {
    paddingRight: Spacing.lg,
    gap: Spacing.md,
  },
  teamCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    alignItems: "center",
    width: 140,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  teamAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.primaryGreen,
  },
  teamName: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: 2,
  },
  teamRole: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  // Social Links
  socialLinks: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.md,
  },
  socialLink: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  // Footer
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  footerLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  footerLinkText: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "500",
    color: Colors.primaryGreen,
  },
  // Copyright
  copyright: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  copyrightText: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
});
