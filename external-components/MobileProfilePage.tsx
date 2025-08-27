"use client";

import type React from "react";

import { useState, useEffect } from "react";

import {
  HStack,
  Text,
  Heading,
  Avatar,
  VStack,
  Icon,
  Button,
  AvatarFallbackText,
  AvatarImage,
  Box,
} from "../components/ui";

import {
  ChevronRight,
  LogOut,
  ArrowLeft,
  Bug,
  Lightbulb,
  MessageSquare,
  Shield,
  User,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react-native";

import {
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  View,
  Alert,
  Linking,
  Modal,
  Dimensions,
} from "react-native";

import { router } from "expo-router";

import { useUser, useAuth } from "@clerk/clerk-expo";

const { height: screenHeight } = Dimensions.get("window");

const MobileProfilePage = ({ isActive }: any) => {
  const [showAccountModal, setShowAccountModal] = useState(false);

  return (
    <>
      <ScrollView
        style={{ display: isActive ? "flex" : "none" }}
        showsVerticalScrollIndicator={false}
        className="bg-background-0"
      >
        <VStack className="flex-1" space="lg">
          {/* Header Section */}
          <Box className="px-6 pt-6 pb-4 bg-gradient-to-b from-primary-50 to-background-0">
            <View className="flex-row justify-between items-center">
              <Button
                variant="link"
                onPress={() => router.back()}
                className="self-start bg-gray-200 w-12 h-12 mt-2 rounded-full shadow-sm"
                accessibilityLabel="Go back"
              >
                <Icon as={ArrowLeft} size="md" className="text-gray-700" />
              </Button>

              <Heading
                size="3xl"
                className="font-bold mt-4 text-typography-900"
              >
                Settings
              </Heading>
              <View />
            </View>
          </Box>

          {/* Profile Card */}
          <Box className="mx-6 -mt-4">
            <ProfileCard />
          </Box>

          {/* Support Section */}
          <VStack className="px-6" space="lg">
            <Box>
              <Heading size="xl" className="font-bold text-typography-900 mb-1">
                Help & Support
              </Heading>
              <Text size="sm" className="text-typography-500 mb-4">
                We're here to help you have the best experience
              </Text>
              <SupportSection
                onShowAccountModal={() => setShowAccountModal(true)}
              />
            </Box>
          </VStack>

          {/* Logout Section */}
          <Box className="px-6 pb-8 pt-4">
            <LogoutButton />
          </Box>
        </VStack>
      </ScrollView>

      {/* Account Modal */}
      <AccountModal
        visible={showAccountModal}
        onClose={() => setShowAccountModal(false)}
      />
    </>
  );
};

const ProfileCard = () => {
  const { user: clerkUser, isLoaded } = useUser();
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    imageUrl: null as string | null,
    phoneNumber: "",
  });

  useEffect(() => {
    if (isLoaded && clerkUser) {
      setUserData({
        firstName: clerkUser.firstName || "",
        lastName: clerkUser.lastName || "",
        imageUrl: clerkUser.imageUrl || null,
        phoneNumber: clerkUser.phoneNumbers?.[0]?.phoneNumber || "",
      });
    }
  }, [clerkUser, isLoaded]);

  if (!isLoaded) {
    return (
      <Box className="bg-white rounded-3xl p-6 shadow-lg border border-outline-100">
        <View className="h-20 justify-center items-center">
          <ActivityIndicator size="large" color="#f39f1e" />
        </View>
      </Box>
    );
  }

  return (
    <TouchableOpacity activeOpacity={0.7}>
      <Box className="bg-white rounded-3xl p-6 shadow-lg border border-outline-100">
        <HStack className="items-center" space="lg">
          <Avatar
            size="2xl"
            className="bg-primary-500 shadow-lg border-4 border-white"
          >
            <AvatarFallbackText className="text-xl font-bold text-white">
              {userData.firstName} {userData.lastName}
            </AvatarFallbackText>
            {userData.imageUrl ? (
              <AvatarImage
                source={{
                  uri: userData.imageUrl,
                }}
              />
            ) : null}
          </Avatar>
          <VStack className="flex-1" space="sm">
            <Text size="2xl" className="font-bold text-typography-900">
              {userData.firstName} {userData.lastName}
            </Text>
            <Text size="md" className="text-typography-500 font-medium">
              {clerkUser?.emailAddresses?.[0]?.emailAddress || "No email"}
            </Text>
            <Text size="md" className="text-typography-500 font-medium">
              {clerkUser?.phoneNumbers?.[0]?.phoneNumber || "No phone number"}
            </Text>
          </VStack>
        </HStack>
      </Box>
    </TouchableOpacity>
  );
};

const SupportSection = ({
  onShowAccountModal,
}: {
  onShowAccountModal: () => void;
}) => {
  const { user: clerkUser } = useUser();

  const handleNavigation = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          "Error",
          "Unable to open the link. Please try again later."
        );
      }
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const supportItems = [
    {
      icon: User,
      title: "Account Settings",
      subtitle: "Manage your account details and preferences",
      color: "primary",
      onPress: onShowAccountModal,
    },
    {
      icon: Bug,
      title: "Report a Bug",
      subtitle: "Found an issue? Help us fix it quickly",
      color: "error",
      onPress: () =>
        handleNavigation("https://wom-panel.vercel.app/report-bug"),
    },
    {
      icon: Lightbulb,
      title: "Suggest Improvement",
      subtitle: "Share your ideas to make our app better",
      color: "warning",
      onPress: () =>
        handleNavigation("https://wom-panel.vercel.app/suggest-improvement"),
    },
    {
      icon: MessageSquare,
      title: "Submit a Complaint",
      subtitle: "Have a concern? Let us know and we'll help",
      color: "info",
      onPress: () => {
        const userId = clerkUser?.id;
        if (userId) {
          handleNavigation(
            `https://wom-panel.vercel.app/new-complain/${userId}`
          );
        } else {
          Alert.alert(
            "Error",
            "Unable to identify user. Please try logging out and back in."
          );
        }
      },
    },
    {
      icon: Shield,
      title: "Terms & Privacy",
      subtitle: "Review our policies and legal information",
      color: "secondary",
      onPress: () => {
        // Navigate to the Terms & Privacy page
        router.push("/term-policy");
      },
    },
  ];

  return (
    <VStack space="md">
      {supportItems.map((item, index) => (
        <MenuItemCard
          key={index}
          icon={item.icon}
          title={item.title}
          subtitle={item.subtitle}
          color={item.color}
          onPress={item.onPress}
        />
      ))}
    </VStack>
  );
};

const AccountModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently remove all your data.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "I'm Sure",
          style: "destructive",
          onPress: () => {
            // Second confirmation
            Alert.alert(
              "Final Confirmation",
              "This is your last chance. Deleting your account will:\n\n• Remove all your personal data\n• Cancel any active subscriptions\n• Delete your account permanently:",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "DELETE ACCOUNT",
                  style: "destructive",
                  onPress: performAccountDeletion,
                },
              ]
            );
          },
        },
      ]
    );
  };

  const performAccountDeletion = async () => {
    if (!clerkUser) return;

    setIsDeleting(true);
    try {
      await clerkUser.delete();
      Alert.alert(
        "Account Deleted",
        "Your account has been successfully deleted. You will now be signed out.",
        [
          {
            text: "OK",
            onPress: () => {
              onClose();
              router.replace("/(auth)/welcome");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Account deletion error:", error);
      Alert.alert(
        "Deletion Failed",
        "We couldn't delete your account at this time. Please try again later or contact support."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isLoaded || !clerkUser) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Box className="px-6 pt-12 pb-6 bg-white border-b border-outline-100">
            <HStack className="items-center justify-between">
              <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                <Box className="bg-gray-100 rounded-full p-2">
                  <Icon as={X} size="lg" className="text-typography-700" />
                </Box>
              </TouchableOpacity>
              <Heading size="2xl" className="font-bold text-typography-900">
                Account Settings
              </Heading>
              <View style={{ width: 40 }} />
            </HStack>
          </Box>

          <VStack className="flex-1 px-6 py-6" space="lg">
            {/* Profile Section */}
            <Box className="bg-white rounded-3xl p-6 shadow-sm border border-outline-100">
              <VStack space="lg">
                <HStack className="items-center" space="lg">
                  <Avatar
                    size="2xl"
                    className="bg-primary-500 shadow-lg border-4 border-white"
                  >
                    <AvatarFallbackText className="text-xl font-bold text-white">
                      {clerkUser.firstName} {clerkUser.lastName}
                    </AvatarFallbackText>
                    {clerkUser.imageUrl ? (
                      <AvatarImage
                        source={{
                          uri: clerkUser.imageUrl,
                        }}
                      />
                    ) : null}
                  </Avatar>
                  <VStack className="flex-1" space="sm">
                    <Text size="2xl" className="font-bold text-typography-900">
                      {clerkUser.firstName} {clerkUser.lastName}
                    </Text>
                    <Text size="md" className="text-typography-500">
                      Member since{" "}
                      {new Date(clerkUser.createdAt!).toLocaleDateString()}
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </Box>

            {/* Account Details */}
            <Box className="bg-white rounded-3xl p-6 shadow-sm border border-outline-100">
              <VStack space="lg">
                <Heading size="lg" className="font-bold text-typography-900">
                  Account Details
                </Heading>

                <VStack space="md">
                  <HStack className="justify-between items-center py-3 border-b border-outline-100">
                    <Text size="md" className="text-typography-600">
                      Email
                    </Text>
                    <Text size="md" className="font-medium text-typography-900">
                      {clerkUser.emailAddresses?.[0]?.emailAddress ||
                        "Not provided"}
                    </Text>
                  </HStack>

                  <HStack className="justify-between items-center py-3 border-b border-outline-100">
                    <Text size="md" className="text-typography-600">
                      Phone
                    </Text>
                    <Text size="md" className="font-medium text-typography-900">
                      {clerkUser.phoneNumbers?.[0]?.phoneNumber ||
                        "Not provided"}
                    </Text>
                  </HStack>

                  {/* <HStack className="justify-between items-center py-3">
                    <Text size="md" className="text-typography-600">
                      Account ID
                    </Text>
                    <Text size="sm" className="font-mono text-typography-500">
                      {clerkUser.id.substring(0, 8)}...
                    </Text>
                  </HStack> */}
                </VStack>
              </VStack>
            </Box>

            {/* Danger Zone */}
            <Box className="bg-white rounded-3xl p-6 shadow-sm border-2 border-error-200">
              <VStack space="lg">
                <HStack className="items-center" space="md">
                  <Icon
                    as={AlertTriangle}
                    size="lg"
                    className="text-error-600"
                  />
                  <Heading size="lg" className="font-bold text-error-600">
                    Danger Zone
                  </Heading>
                </HStack>

                <Text size="md" className="text-typography-600 leading-relaxed">
                  Once you delete your account, there is no going back. Please
                  be certain.
                </Text>

                <TouchableOpacity
                  onPress={handleDeleteAccount}
                  activeOpacity={0.8}
                  disabled={isDeleting}
                >
                  <Box className="bg-error-50 rounded-2xl p-4 border-2 border-error-300">
                    <HStack className="items-center justify-center" space="md">
                      <Icon as={Trash2} size="md" className="text-error-600" />
                      <Text size="lg" className="font-bold text-error-600">
                        {isDeleting
                          ? "Deleting Account..."
                          : "Delete My Account"}
                      </Text>
                      {isDeleting && (
                        <ActivityIndicator size="small" color="#dc2626" />
                      )}
                    </HStack>
                  </Box>
                </TouchableOpacity>
              </VStack>
            </Box>
          </VStack>
        </ScrollView>
      </View>
    </Modal>
  );
};

const MenuItemCard = ({
  icon: IconComponent,
  title,
  subtitle,
  color = "primary",
  onPress,
  rightComponent,
}: {
  icon: any;
  title: string;
  subtitle?: string;
  color?: string;
  onPress: () => void;
  rightComponent?: React.ReactNode;
}) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case "error":
        return {
          bg: "bg-error-50",
          iconBg: "bg-error-100",
          iconColor: "text-error-600",
          border: "border-error-200",
        };
      case "warning":
        return {
          bg: "bg-warning-50",
          iconBg: "bg-warning-100",
          iconColor: "text-warning-600",
          border: "border-warning-200",
        };
      case "info":
        return {
          bg: "bg-info-50",
          iconBg: "bg-info-100",
          iconColor: "text-info-600",
          border: "border-info-200",
        };
      case "secondary":
        return {
          bg: "bg-secondary-50",
          iconBg: "bg-secondary-100",
          iconColor: "text-secondary-600",
          border: "border-secondary-200",
        };
      default:
        return {
          bg: "bg-primary-50",
          iconBg: "bg-primary-100",
          iconColor: "text-primary-600",
          border: "border-primary-200",
        };
    }
  };

  const colorClasses = getColorClasses(color);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Box
        className={`bg-white rounded-2xl p-5 border ${colorClasses.border} shadow-sm`}
      >
        <HStack className="items-center" space="lg">
          <Box className={`${colorClasses.iconBg} rounded-xl p-3 shadow-sm`}>
            <Icon
              as={IconComponent}
              size="lg"
              className={colorClasses.iconColor}
            />
          </Box>
          <VStack className="flex-1" space="xs">
            <Text size="lg" className="font-bold text-typography-900">
              {title}
            </Text>
            {subtitle && (
              <Text size="sm" className="text-typography-600 leading-relaxed">
                {subtitle}
              </Text>
            )}
          </VStack>
          {rightComponent || (
            <Box className="bg-gray-100 rounded-full p-2">
              <Icon
                as={ChevronRight}
                size="md"
                className="text-typography-500"
              />
            </Box>
          )}
        </HStack>
      </Box>
    </TouchableOpacity>
  );
};

const LogoutButton = () => {
  const { signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out of your account?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          onPress: async () => {
            setIsLoading(true);
            try {
              await signOut();
              router.replace("/(auth)/welcome");
            } catch (error) {
              console.error("Logout error:", error);
            } finally {
              setIsLoading(false);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <TouchableOpacity onPress={handleLogout} activeOpacity={0.8}>
      <Box className="bg-error-50 rounded-2xl p-5 border-2 border-error-200 shadow-sm">
        <HStack className="items-center justify-center" space="md">
          <Icon as={LogOut} size="lg" className="text-error-600" />
          <Text size="lg" className="font-bold text-error-600">
            {isLoading ? "Signing Out..." : "Sign Out"}
          </Text>
          {isLoading && <ActivityIndicator size="small" color="#dc2626" />}
        </HStack>
      </Box>
    </TouchableOpacity>
  );
};

export default MobileProfilePage;
