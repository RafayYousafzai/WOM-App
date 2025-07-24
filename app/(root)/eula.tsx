"use client";
import { ScrollView, TouchableOpacity } from "react-native";
import { VStack, HStack, Text, Heading, Icon, Box } from "@/components/ui";
import {
  ArrowLeft,
  Shield,
  Slash,
  ThumbsDown,
  AlertTriangle,
  UserMinus,
  CheckCircle,
} from "lucide-react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EulaPage() {
  const sections = [
    {
      icon: Slash,
      title: "No Tolerance for Abusive Content",
      content: [
        "We do not allow any objectionable, hateful, violent, pornographic, or illegal content in this app.",
        "Any user who posts or engages in such content will be removed or banned without warning.",
      ],
    },
    {
      icon: AlertTriangle,
      title: "Prohibited Behavior",
      content: [
        "• Harassment, threats, or abuse toward others",
        "• Use of hate speech, discrimination, or slurs",
        "• Spamming or posting malicious content",
        "• Impersonating others or misusing identity",
      ],
    },
    {
      icon: ThumbsDown,
      title: "User Responsibility",
      content: [
        "You are responsible for the content you share within the app, including text, images, or comments.",
        "Do not post anything you wouldn’t be comfortable sharing in public.",
      ],
    },
    {
      icon: UserMinus,
      title: "Content Moderation and Enforcement",
      content: [
        "We use automated tools and manual reviews to filter and remove objectionable content.",
        "Flagged content will be reviewed, and necessary actions such as warnings or bans will be taken.",
      ],
    },
    {
      icon: Shield,
      title: "Safety & Reporting Tools",
      content: [
        "Our app includes tools for users to report offensive or harmful content.",
        "We encourage users to report violations so we can maintain a safe and respectful community.",
      ],
    },
    {
      icon: CheckCircle,
      title: "Agreement to Terms",
      content: [
        "By using this app, you agree to follow the above rules and understand that violations may result in a loss of access or other enforcement.",
      ],
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack className="flex-1" space="lg">
          {/* Header */}
          <Box className="px-6 pt-4 pb-6 bg-gradient-to-b from-primary-50 to-background-0">
            <HStack className="items-center mb-4" space="md">
              <TouchableOpacity
                onPress={() => router.back()}
                className="bg-white/80 w-12 h-12 rounded-full shadow-sm items-center justify-center"
              >
                <Icon as={ArrowLeft} size="md" className="text-gray-700" />
              </TouchableOpacity>
              <VStack className="flex-1">
                <Heading size="3xl" className="font-bold text-typography-900">
                  End User License Agreement
                </Heading>
                {/* <Text size="sm" className="text-typography-600 mt-1">
                  Effective Date: 4 July 2025
                </Text> */}
              </VStack>
            </HStack>

            <Box className="bg-primary-100 rounded-2xl p-4 border border-primary-200">
              <Text size="md" className="text-primary-800 leading-relaxed">
                📘 This agreement outlines acceptable behavior for users of Word
                of Mouth. Our goal is to keep the app safe, respectful, and free
                of harmful content.
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
              title="Changes to This Agreement"
              content={[
                "We may update this agreement from time to time. Any significant changes will be communicated through the app or by other reasonable means.",
              ]}
              index={sections.length + 1}
            />
          </VStack>

          {/* Footer */}
          <Box className="px-6 py-8">
            <Box className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <VStack space="md" className="items-center">
                <Icon as={Shield} size="xl" className="text-primary-600" />
                <Text
                  size="lg"
                  className="font-bold text-typography-900 text-center"
                >
                  We Protect Our Users
                </Text>
                <Text
                  size="sm"
                  className="text-typography-600 text-center leading-relaxed"
                >
                  Violating these terms may result in removal of content,
                  account suspension, or permanent bans.
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
    <Box className="bg-white rounded-2xl p-6 shadow-sm border border-outline-100">
      <HStack className="items-start mb-4" space="md">
        <Box className="bg-primary-100 rounded-xl p-3">
          <Icon as={IconComponent} size="lg" className="text-primary-600" />
        </Box>
        <VStack className="flex-1" space="xs">
          <Text size="xs" className="text-primary-600 font-bold">
            {index}.
          </Text>
          <Heading size="lg" className="font-bold text-typography-900">
            📄 {title}
          </Heading>
        </VStack>
      </HStack>

      <VStack space="xs">
        {content.map((line, lineIndex) => (
          <Text
            key={lineIndex}
            size="md"
            className={`text-typography-700 leading-relaxed ${
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
