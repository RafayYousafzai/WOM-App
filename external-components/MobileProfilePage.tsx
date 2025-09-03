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
  Eye,
  EyeOff,
  Bell,
  Lock,
  HelpCircle,
  Phone,
  Mail,
  Calendar,
  Edit3,
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
import { Switch } from "react-native-paper";
import { router } from "expo-router";

import { EditProfileScreen } from "@/components/profile-view/ProfileEdit";

import { useUser, useAuth } from "@clerk/clerk-expo";
import { useSupabase } from "@/context/supabaseContext";
import {
  toggleGlobalGatekeeping,
  getUserGatekeepingStatus,
} from "@/lib/supabase/postsAction";

const { height: screenHeight } = Dimensions.get("window");

const MobileProfilePage = ({ isActive }: any) => {
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  return (
    <>
      <ScrollView
        style={{ display: isActive ? "flex" : "none" }}
        showsVerticalScrollIndicator={false}
        className="bg-gray-50"
      >
        <VStack className="flex-1" space="lg">
          {/* Header Section */}
          <Box className="px-6 pt-6 pb-4 bg-white border-b border-gray-100">
            <HStack className="items-center justify-between">
              <Button
                variant="link"
                onPress={() => router.back()}
                className="self-start bg-gray-100 w-10 h-10 rounded-full"
                accessibilityLabel="Go back"
              >
                <Icon as={ArrowLeft} size="md" className="text-gray-600" />
              </Button>

              <Heading size="2xl" className="font-semibold text-gray-900">
                Settings
              </Heading>
              <View style={{ width: 40 }} />
            </HStack>
          </Box>

          {/* Profile Section */}
          <Box className="mx-6">
            <ProfileCard onEdit={() => setShowEditProfile(true)} />
          </Box>

          {/* Account & Privacy Section */}
          <VStack className="px-6" space="md">
            <SectionHeader
              title="Account & Privacy"
              subtitle="Manage your account and privacy settings"
            />
            <AccountPrivacySection
              onShowAccountModal={() => setShowAccountModal(true)}
            />
          </VStack>

          {/* Help & Support Section */}
          <VStack className="px-6" space="md">
            <SectionHeader
              title="Help & Support"
              subtitle="Get help and provide feedback"
            />
            <HelpSupportSection />
          </VStack>

          {/* Sign Out */}
          <Box className="px-6 pb-8 pt-4">
            <LogoutButton />
          </Box>
        </VStack>
      </ScrollView>
      {showEditProfile && (
        <Modal
          visible={showEditProfile}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setShowEditProfile(false)}
        >
          <EditProfileScreen setIsEditing={setShowEditProfile} />
        </Modal>
      )}
      {/* Account Modal */}
      <AccountModal
        visible={showAccountModal}
        onClose={() => setShowAccountModal(false)}
      />
    </>
  );
};

const SectionHeader = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <VStack space="xs" className="mb-2">
    <Heading size="lg" className="font-semibold text-gray-900">
      {title}
    </Heading>
    <Text size="sm" className="text-gray-500">
      {subtitle}
    </Text>
  </VStack>
);

const ProfileCard = ({ onEdit }: { onEdit: () => void }) => {
  const { user: clerkUser, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <Box className="bg-white rounded-2xl p-6 border border-gray-200">
        <View className="h-20 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </Box>
    );
  }

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onEdit}>
      <Box className="bg-white rounded-2xl p-6 border border-gray-200">
        <HStack className="items-center" space="lg">
          <Avatar size="2xl" className="bg-blue-500 border-2 border-white">
            <AvatarFallbackText className="text-xl font-semibold text-white">
              {clerkUser?.firstName} {clerkUser?.lastName}
            </AvatarFallbackText>
            {clerkUser?.imageUrl ? (
              <AvatarImage source={{ uri: clerkUser.imageUrl }} />
            ) : null}
          </Avatar>

          <VStack className="flex-1" space="xs">
            <Text size="xl" className="font-semibold text-gray-900">
              {clerkUser?.firstName} {clerkUser?.lastName}
            </Text>
            <Text size="sm" className="text-gray-500">
              {clerkUser?.emailAddresses?.[0]?.emailAddress}
            </Text>
            <Text size="xs" className="text-blue-600 font-medium">
              Tap to edit profile
            </Text>
          </VStack>

          <Box className="bg-gray-100 rounded-full p-2">
            <Icon as={Edit3} size="md" className="text-gray-600" />
          </Box>
        </HStack>
      </Box>
    </TouchableOpacity>
  );
};

const AccountPrivacySection = ({
  onShowAccountModal,
}: {
  onShowAccountModal: () => void;
}) => {
  const { supabase } = useSupabase();
  const { user } = useUser();
  const [globalGatekeeping, setGlobalGatekeeping] = useState(false);
  const [gatekeepingLoading, setGatekeepingLoading] = useState(false);
  const [userStats, setUserStats] = useState({
    totalPosts: 0,
    gatekeepingPosts: 0,
  });

  // Load initial gatekeeping status
  useEffect(() => {
    const loadGatekeepingStatus = async () => {
      if (!user?.id) return;

      try {
        const status = await getUserGatekeepingStatus(supabase, user.id);
        if (status.success) {
          setGlobalGatekeeping(status.hasGlobalGatekeeping);
          setUserStats({
            totalPosts: status.totalPosts,
            gatekeepingPosts: status.gatekeepingPosts,
          });
        }
      } catch (error) {
        console.error("Error loading gatekeeping status:", error);
      }
    };

    loadGatekeepingStatus();
  }, [user?.id, supabase]);

  const handleGlobalGatekeepingToggle = async (value: boolean) => {
    if (!user?.id) return;

    const actionText = value ? "enable" : "disable";
    const effectText = value ? "hide" : "show";

    Alert.alert(
      "Global Privacy Setting",
      `Are you sure you want to ${actionText} location privacy for all your posts?\n\n${
        value
          ? "This will hide location information from ALL your posts."
          : "This will show location information on ALL your posts."
      }\n\nPosts affected: ${userStats.totalPosts}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: value ? "Hide Locations" : "Show Locations",
          style: value ? "default" : "destructive",
          onPress: async () => {
            setGatekeepingLoading(true);
            try {
              const result = await toggleGlobalGatekeeping(
                supabase,
                user.id,
                value
              );
              if (result.success) {
                setGlobalGatekeeping(value);
                setUserStats((prev) => ({
                  ...prev,
                  gatekeepingPosts: value ? prev.totalPosts : 0,
                }));
                Alert.alert(
                  "Success",
                  `Location privacy ${
                    effectText === "hide" ? "enabled" : "disabled"
                  } for all posts.`
                );
              } else {
                Alert.alert(
                  "Error",
                  result.error || "Failed to update privacy settings"
                );
              }
            } catch (error) {
              Alert.alert(
                "Error",
                "Something went wrong while updating your privacy settings"
              );
            } finally {
              setGatekeepingLoading(false);
            }
          },
        },
      ]
    );
  };

  const accountItems = [
    {
      icon: User,
      title: "Account Details",
      subtitle: "Update your personal information",
      onPress: onShowAccountModal,
      rightComponent: <ChevronRight size={20} color="#6b7280" />,
    },
    {
      icon: globalGatekeeping ? EyeOff : Eye,
      title: "Location Privacy",
      subtitle: `${userStats.gatekeepingPosts}/${userStats.totalPosts} posts with privacy enabled`,
      onPress: () => {},
      rightComponent: (
        <Switch
          value={globalGatekeeping}
          onValueChange={handleGlobalGatekeepingToggle}
          disabled={gatekeepingLoading}
          thumbColor={globalGatekeeping ? "#3b82f6" : "#f4f3f4"}
          trackColor={{ false: "#e5e7eb", true: "#dbeafe" }}
        />
      ),
    },
  ];

  return (
    <VStack space="xs">
      {accountItems.map((item, index) => (
        <SettingsItem
          key={index}
          icon={item.icon}
          title={item.title}
          subtitle={item.subtitle}
          onPress={item.onPress}
          rightComponent={item.rightComponent}
          isLast={index === accountItems.length - 1}
        />
      ))}
    </VStack>
  );
};

const HelpSupportSection = () => {
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
      icon: Bug,
      title: "Report a Bug",
      subtitle: "Found an issue? Help us fix it",
      onPress: () =>
        handleNavigation("https://wordofmouth.vercel.app/report-bug"),
    },
    {
      icon: Lightbulb,
      title: "Suggest Improvement",
      subtitle: "Share ideas to make the app better",
      onPress: () =>
        handleNavigation("https://wordofmouth.vercel.app/suggest-improvement"),
    },
    {
      icon: MessageSquare,
      title: "Submit Complaint",
      subtitle: "Have a concern? Let us know",
      onPress: () => {
        const userId = clerkUser?.id;
        if (userId) {
          handleNavigation(
            `https://wordofmouth.vercel.app/new-complain/${userId}`
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
      subtitle: "Review our policies",
      onPress: () => router.push("/term-policy"),
    },
  ];

  return (
    <VStack space="xs">
      {supportItems.map((item, index) => (
        <SettingsItem
          key={index}
          icon={item.icon}
          title={item.title}
          subtitle={item.subtitle}
          onPress={item.onPress}
          isLast={index === supportItems.length - 1}
        />
      ))}
    </VStack>
  );
};

const SettingsItem = ({
  icon: IconComponent,
  title,
  subtitle,
  onPress,
  rightComponent,
  isLast = false,
}: {
  icon: any;
  title: string;
  subtitle?: string;
  onPress: () => void;
  rightComponent?: React.ReactNode;
  isLast?: boolean;
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.6}>
      <Box
        className={`bg-white px-4 py-4 ${
          !isLast ? "border-b border-gray-100" : ""
        }`}
      >
        <HStack className="items-center" space="md">
          <Box className="bg-gray-100 rounded-xl p-2">
            <Icon as={IconComponent} size="md" className="text-gray-700" />
          </Box>

          <VStack className="flex-1" space="xs">
            <Text size="md" className="font-medium text-gray-900">
              {title}
            </Text>
            {subtitle && (
              <Text size="sm" className="text-gray-500">
                {subtitle}
              </Text>
            )}
          </VStack>

          {rightComponent || (
            <Icon as={ChevronRight} size="md" className="text-gray-400" />
          )}
        </HStack>
      </Box>
    </TouchableOpacity>
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
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Final Confirmation",
              "This will permanently delete:\n\n• All your posts and data\n• Your account and profile\n• Any active subscriptions\n\nThis action cannot be undone.",
              [
                { text: "Cancel", style: "cancel" },
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
        "Your account has been successfully deleted.",
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

  if (!isLoaded) {
    return (
      <Modal visible={visible} animationType="slide">
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f8f9fa",
          }}
        >
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </Modal>
    );
  }

  const accountDetails = [
    {
      icon: Mail,
      label: "Email",
      value: clerkUser?.emailAddresses?.[0]?.emailAddress || "Not provided",
    },
    {
      icon: Phone,
      label: "Phone",
      value: clerkUser?.phoneNumbers?.[0]?.phoneNumber || "Not provided",
    },
    {
      icon: Calendar,
      label: "Member since",
      value: new Date(clerkUser?.createdAt!).toLocaleDateString(),
    },
  ];

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
          <Box className="px-6 pt-12 pb-6 bg-white border-b border-gray-100">
            <HStack className="items-center justify-between">
              <TouchableOpacity onPress={onClose} activeOpacity={0.6}>
                <Box className="bg-gray-100 rounded-full p-2">
                  <Icon as={X} size="lg" className="text-gray-600" />
                </Box>
              </TouchableOpacity>
              <Heading size="xl" className="font-semibold text-gray-900">
                Account Details
              </Heading>
              <View style={{ width: 40 }} />
            </HStack>
          </Box>

          <VStack className="flex-1 px-6 py-6" space="lg">
            {/* Profile Info */}
            <Box className="bg-white rounded-2xl p-6 border border-gray-200">
              <VStack space="lg">
                <HStack className="items-center justify-center">
                  <Avatar
                    size="2xl"
                    className="bg-blue-500 border-4 border-white shadow-md"
                  >
                    <AvatarFallbackText className="text-2xl font-semibold text-white">
                      {clerkUser?.firstName} {clerkUser?.lastName}
                    </AvatarFallbackText>
                    {clerkUser?.imageUrl ? (
                      <AvatarImage source={{ uri: clerkUser.imageUrl }} />
                    ) : null}
                  </Avatar>
                </HStack>

                <VStack space="xs" className="items-center">
                  <Text
                    size="2xl"
                    className="font-semibold text-gray-900 text-center"
                  >
                    {clerkUser?.firstName} {clerkUser?.lastName}
                  </Text>
                  <Text size="md" className="text-gray-500 text-center">
                    {clerkUser?.emailAddresses?.[0]?.emailAddress}
                  </Text>
                </VStack>
              </VStack>
            </Box>

            {/* Account Information */}
            <Box className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <VStack space="xs">
                <Box className="p-4 bg-gray-50 border-b border-gray-100">
                  <Text size="lg" className="font-semibold text-gray-900">
                    Account Information
                  </Text>
                </Box>

                {accountDetails.map((detail, index) => (
                  <Box
                    key={index}
                    className={`px-4 py-4 ${
                      index !== accountDetails.length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }`}
                  >
                    <HStack className="items-center" space="md">
                      <Icon
                        as={detail.icon}
                        size="md"
                        className="text-gray-600"
                      />
                      <VStack className="flex-1" space="xs">
                        <Text size="sm" className="text-gray-500 font-medium">
                          {detail.label}
                        </Text>
                        <Text size="md" className="text-gray-900">
                          {detail.value}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </Box>

            {/* Danger Zone */}
            <Box className="bg-white rounded-2xl border-2 border-red-200 overflow-hidden">
              <Box className="p-4 bg-red-50 border-b border-red-100">
                <HStack className="items-center" space="md">
                  <Icon as={AlertTriangle} size="md" className="text-red-600" />
                  <Text size="lg" className="font-semibold text-red-700">
                    Danger Zone
                  </Text>
                </HStack>
              </Box>

              <Box className="p-4">
                <VStack space="md">
                  <Text size="md" className="text-gray-600">
                    Once you delete your account, there is no going back. Please
                    be certain.
                  </Text>

                  <TouchableOpacity
                    onPress={handleDeleteAccount}
                    activeOpacity={0.7}
                    disabled={isDeleting}
                  >
                    <Box className="bg-red-50 rounded-xl p-4 border border-red-200">
                      <HStack
                        className="items-center justify-center"
                        space="md"
                      >
                        <Icon as={Trash2} size="md" className="text-red-600" />
                        <Text size="md" className="font-semibold text-red-600">
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
            </Box>
          </VStack>
        </ScrollView>
      </View>
    </Modal>
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
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              await signOut();
              router.replace("/(auth)/welcome");
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Error", "Failed to sign out. Please try again.");
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity onPress={handleLogout} activeOpacity={0.7}>
      <Box className="bg-white rounded-2xl p-4 border border-gray-200">
        <HStack className="items-center justify-center" space="md">
          <Icon as={LogOut} size="md" className="text-red-600" />
          <Text size="md" className="font-semibold text-red-600">
            {isLoading ? "Signing Out..." : "Sign Out"}
          </Text>
          {isLoading && <ActivityIndicator size="small" color="#dc2626" />}
        </HStack>
      </Box>
    </TouchableOpacity>
  );
};

export default MobileProfilePage;
