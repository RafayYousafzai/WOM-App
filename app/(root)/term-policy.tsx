"use client";
import { ScrollView, TouchableOpacity } from "react-native";
import { VStack, HStack, Text, Heading, Icon, Box } from "@/components/ui";
import {
  ArrowLeft,
  Shield,
  Mail,
  Globe,
  Users,
  Lock,
  Trash2,
  Eye,
  Database,
} from "lucide-react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TermsPrivacyPage() {
  const sections = [
    {
      icon: Database,
      title: "Information We Collect",
      content: [
        "• Name",
        "• Email address",
        "• Phone number",
        "• Profile photo",
        "• Location data (used to show content from your area)",
        "• Social login information (when using Google or Facebook via Clerk)",
        "",
        "We do not collect your device or usage data.",
      ],
    },
    {
      icon: Lock,
      title: "How We Use Your Information",
      content: [
        "We use the data collected to:",
        "• Create and manage your user account",
        "• Display local restaurant reviews, comments, and content",
        "• Enable user interaction (e.g., commenting, posting)",
        "• Improve user experience and functionality",
        "• Authenticate and secure access using Clerk",
        "",
        "We do not currently use your data for analytics, advertising, or marketing purposes.",
      ],
    },
    {
      icon: Globe,
      title: "Third-Party Services",
      content: [
        "We rely on the following third-party providers:",
        "• Clerk for authentication and user account management",
        "• Supabase for secure data storage and real-time database management",
        "",
        "These services may have access to limited personal data to perform their functions, under strict confidentiality and security obligations.",
      ],
    },
    {
      icon: Eye,
      title: "Public Content",
      content: [
        "All content you post (reviews, comments, restaurant photos, etc.) is publicly visible to other users. You are responsible for the information you choose to share.",
      ],
    },
    {
      icon: Shield,
      title: "Data Storage and Security",
      content: [
        "• All user data is securely stored via Supabase, which encrypts data at rest and in transit.",
        "• We follow best practices to protect your data and prevent unauthorized access.",
      ],
    },
    {
      icon: Trash2,
      title: "Account Deletion & Data Rights",
      content: [
        "You have the right to:",
        "• Access and update your profile information",
        "• Delete your account and all associated data directly through the app",
        "• Request data export (contact us for assistance)",
        "",
        "When you delete your account, all your personal data, reviews, and comments will be permanently removed from our systems.",
      ],
    },
    {
      icon: Users,
      title: "Children's Privacy",
      content: [
        "Word of Mouth is not specifically targeted toward children under 13. However, it is a general-purpose food review app and can be used by all age groups. We do not knowingly collect personal data from children without parental consent.",
      ],
    },
    {
      icon: Globe,
      title: "International Users",
      content: [
        "This app is operated from the United States. If you are accessing the app from outside the U.S., you acknowledge that your data will be transferred and stored in accordance with U.S. laws.",
      ],
    },
    {
      icon: Mail,
      title: "Contact Us",
      content: [
        "For any questions or concerns regarding this Privacy Policy, please contact us at:",
        "Email: [Insert Contact Email]",
        "App Name: Word of Mouth",
      ],
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack className="flex-1" space="lg">
          {/* Header */}
          <Box className="px-6 pt-4 pb-6 border-b border-gray-200">
            <HStack className="items-center mb-4" space="md">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full items-center justify-center border border-gray-300"
              >
                <Icon as={ArrowLeft} size="md" className="text-gray-700" />
              </TouchableOpacity>
              <VStack className="flex-1">
                <Heading size="2xl" className="font-bold text-gray-900">
                  Privacy Policy
                </Heading>
                <Text size="sm" className="text-gray-600 mt-1">
                  Effective Date: 14 Apr 2025
                </Text>
              </VStack>
            </HStack>

            <Box className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <Text size="md" className="text-gray-800 leading-relaxed">
                Welcome to Word of Mouth. Your privacy is important to us. This
                Privacy Policy explains how we collect, use, share, and protect
                your information when you use our mobile application and related
                services.
              </Text>
            </Box>
          </Box>

          {/* Content Sections */}
          <VStack className="px-6" space="lg">
            {sections.map((section, index) => (
              <PolicySection
                key={index}
                icon={section.icon}
                title={section.title}
                content={section.content}
                index={index + 1}
              />
            ))}

            {/* Changes to Policy Section */}
            <PolicySection
              icon={Shield}
              title="Changes to This Policy"
              content={[
                "We may update this Privacy Policy from time to time. If we make significant changes, we will notify you through the app or by other means.",
              ]}
              index={10}
            />
          </VStack>

          {/* Footer */}
          <Box className="px-6 py-8">
            <Box className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <VStack space="md" className="items-center">
                <Text size="lg" className="font-bold text-gray-900 text-center">
                  Your Privacy Matters
                </Text>
                <Text
                  size="sm"
                  className="text-gray-600 text-center leading-relaxed"
                >
                  We're committed to protecting your personal information and
                  being transparent about our practices.
                </Text>
              </VStack>
            </Box>
          </Box>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

const PolicySection = ({
  icon: IconComponent,
  title,
  content,
  index,
}: {
  icon: any;
  title: string;
  content: string[];
  index: number;
}) => {
  return (
    <Box className="bg-white rounded-lg p-6 border border-gray-200">
      <HStack className="items-start mb-4" space="md">
        <Box className="bg-gray-100 rounded-lg p-2">
          <Icon as={IconComponent} size="md" className="text-gray-600" />
        </Box>
        <VStack className="flex-1" space="xs">
          <Text size="xs" className="text-gray-500 font-medium">
            {index}.
          </Text>
          <Heading size="lg" className="font-bold text-gray-900">
            {title}
          </Heading>
        </VStack>
      </HStack>

      <VStack space="xs">
        {content.map((line, lineIndex) => (
          <Text
            key={lineIndex}
            size="md"
            className={`text-gray-700 leading-relaxed ${
              line === "" ? "mb-2" : ""
            }`}
          >
            {line}
          </Text>
        ))}
      </VStack>
    </Box>
  );
};
