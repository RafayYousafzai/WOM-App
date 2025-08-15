import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import * as yup from "yup";
import { router } from "expo-router";
import { Button, Icon } from "@/components/ui";
import { ArrowLeft, LogOut } from "lucide-react-native";

import { useEditProfile } from "./useEditProfile";
import { ProfileForm, DatePickerModal } from "./ProfileForm";

export const EditProfileScreen = ({ setIsEditing }) => {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut } = useAuth();
  const [incomplete, setIncomplete] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    user,
    fieldErrors,
    showDateModal,
    tempDate,
    setShowDateModal,
    setTempDate,
    handleInputChange,
    handleCountrySelect,
    handleDietaryRestrictionsChange,
    onDateChange,
    confirmDate,
    cancelDateSelection,
    clearFieldError,
    validateAllFields,
    initializeUserData,
  } = useEditProfile(clerkUser, isLoaded);

  useEffect(() => {
    if (isLoaded && clerkUser) {
      initializeUserData();
    }
    if (isLoaded && isSignedIn) {
      if (!clerkUser?.firstName || !clerkUser?.username) {
        setIncomplete(true);
      } else {
        setIncomplete(false);
      }
    }
  }, [clerkUser, isLoaded, isSignedIn, initializeUserData]);

  const saveChanges = async () => {
    try {
      // First validate all fields
      const isValid = validateAllFields();
      if (!isValid) {
        Alert.alert(
          "Validation Error",
          "Please fill in all required fields correctly."
        );
        return;
      }

      setIsSubmitting(true);

      console.log("Saving user data:", {
        dietaryRestrictions: user.dietaryRestrictions,
        type: typeof user.dietaryRestrictions,
        isArray: Array.isArray(user.dietaryRestrictions),
        birthday: user.birthday,
      });

      // Prepare the metadata object
      const metadata = {
        bio: user.bio,
        dietaryRestrictions: user.dietaryRestrictions,
        country: user.country,
        birthday: user.birthday ? user.birthday.toISOString() : null,
      };

      console.log("Metadata to save:", metadata);

      await clerkUser.update({
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        unsafeMetadata: metadata,
      });

      await clerkUser?.reload();

      // Verify the save
      console.log("After save - metadata:", clerkUser.unsafeMetadata);

      Alert.alert("Success", "Profile updated successfully!");
      if (incomplete) router.replace("home");
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating user:", err);
      if (err instanceof yup.ValidationError) {
        // Map yup validation errors to field errors
        const validationErrors = {};
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
        setFieldErrors(validationErrors);
        Alert.alert("Validation Error", "Please check the highlighted fields.");
        return;
      }
      if (err?.errors) {
        const errorMessages = err.errors.map((e) => e.message).join("\n");
        Alert.alert("Update Failed", errorMessages);
        return;
      }
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/welcome");
        },
        style: "destructive",
      },
    ]);
  };

  if (!isLoaded) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#f39f1e" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-4 py-6">
            <View className="flex-row mb-6">
              {incomplete ? (
                <Button
                  onPress={handleLogout}
                  className="self-start bg-gray-200 w-10 h-10 rounded-full"
                  accessibilityLabel="Logout"
                >
                  <Icon as={LogOut} size="sm" className="text-gray-600" />
                </Button>
              ) : (
                <Button
                  variant="link"
                  onPress={() => setIsEditing(false)}
                  className="self-start bg-gray-200 w-10 h-10 mt-2 rounded-full"
                  accessibilityLabel="Go back"
                >
                  <Icon as={ArrowLeft} size="sm" className="text-gray-600" />
                </Button>
              )}
              {incomplete ? (
                <Text className="text-4xl text-center md:text-6xl mt-0 ml-2 font-extrabold text-slate-900">
                  Complete Profile
                </Text>
              ) : (
                <Text className="text-4xl text-center md:text-6xl mt-2 ml-2 font-extrabold text-slate-900">
                  Edit Profile
                </Text>
              )}
            </View>

            <ProfileForm
              user={user}
              fieldErrors={fieldErrors}
              handleInputChange={handleInputChange}
              handleCountrySelect={handleCountrySelect}
              handleDietaryRestrictionsChange={handleDietaryRestrictionsChange}
              setShowDateModal={setShowDateModal}
              saveChanges={saveChanges}
              isSubmitting={isSubmitting}
              incomplete={incomplete}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <DatePickerModal
        showDateModal={showDateModal}
        tempDate={tempDate}
        onDateChange={onDateChange}
        confirmDate={confirmDate}
        cancelDateSelection={cancelDateSelection}
        setShowDateModal={setShowDateModal}
      />
    </SafeAreaView>
  );
};
