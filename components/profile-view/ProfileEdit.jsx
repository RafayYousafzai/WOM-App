import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  SafeAreaView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useUser } from "@clerk/clerk-expo";
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import * as yup from "yup";
import { profileSchema } from "./profile-validation";
import { router } from "expo-router";
import { Button, Icon } from "@/components/ui";
import { ArrowLeft, LogOut, AlertCircle } from "lucide-react-native";
import SelectCountry from "@/components/common/SelectCountry";
import { Input, InputField } from "@/components/ui";
import DietaryTagInput from "@/components/common/DietaryOptionTag";
import {
  extractSuggestionsByCategory,
  FILTER_CATEGORIES,
} from "@/constants/SearchFilters";

export const EditProfileScreen = ({ setIsEditing }) => {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut } = useAuth();
  const [showDateModal, setShowDateModal] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [incomplete, setIncomplete] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field error states
  const [fieldErrors, setFieldErrors] = useState({
    username: null,
    firstName: null,
    lastName: null,
    bio: null,
    dietaryRestrictions: [],
  });

  const [user, setUser] = useState({
    username: "",
    firstName: "",
    lastName: "",
    bio: "",
    dietaryRestrictions: [], // Changed to array
    country: null,
  });

  useEffect(() => {
    if (isLoaded && clerkUser) {
      const metadata = clerkUser.unsafeMetadata || {};

      // Handle dietary restrictions properly
      let dietaryRestrictions = [];
      if (Array.isArray(metadata.dietaryRestrictions)) {
        dietaryRestrictions = metadata.dietaryRestrictions;
      }

      console.log("Loading user data:", {
        dietaryRestrictions,
        metadata: metadata.dietaryRestrictions,
      });

      setUser({
        username: clerkUser.username || "",
        firstName: clerkUser.firstName || "",
        lastName: clerkUser.lastName || "",
        bio: metadata.bio || "",
        dietaryRestrictions: dietaryRestrictions,
        country: metadata.country || null,
      });
    }
    if (isLoaded && isSignedIn) {
      if (!clerkUser?.firstName || !clerkUser?.username) {
        setIncomplete(true);
      } else {
        setIncomplete(false);
      }
    }
  }, [clerkUser, isLoaded, isSignedIn]);

  // Clear field error when user starts typing
  const clearFieldError = (fieldName) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => ({
        ...prev,
        [fieldName]: null,
      }));
    }
  };

  // Enhanced input handlers with validation
  const handleInputChange = (field, value) => {
    setUser((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field);
  };

  const handleCountrySelect = (country) => {
    console.log("Selected country:", country);
    setUser((prev) => ({ ...prev, country }));
    clearFieldError("country");
  };

  // Handle dietary restrictions change
  const handleDietaryRestrictionsChange = (tags) => {
    console.log("Dietary restrictions changed:", tags);
    setUser((prev) => ({
      ...prev,
      dietaryRestrictions: tags,
    }));
    clearFieldError("dietaryRestrictions");
  };

  // Validate all required fields
  const validateAllFields = () => {
    let hasErrors = false;
    const errors = {};

    // Check required fields - dietaryRestrictions is now optional
    const requiredFields = {
      username: user.username?.trim(),
      firstName: user.firstName?.trim(),
      lastName: user.lastName?.trim(),
    };

    // Validate each required field
    Object.entries(requiredFields).forEach(([field, value]) => {
      if (!value) {
        const fieldLabels = {
          username: "Username",
          firstName: "First Name",
          lastName: "Last Name",
        };
        errors[field] = `${fieldLabels[field]} is required`;
        hasErrors = true;
      }
    });

    // Additional validation for bio length
    if (user.bio && user.bio.trim().length < 10) {
      errors.bio = "Bio must be at least 10 characters long";
      hasErrors = true;
    }

    setFieldErrors(errors);
    return !hasErrors;
  };

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
      });

      // Prepare the metadata object
      const metadata = {
        bio: user.bio,
        dietaryRestrictions: user.dietaryRestrictions, // Keep as array
        country: user.country,
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
            <View className="space-y-4">
              <Input
                variant="filled"
                size="sm"
                label="Username"
                isRequired
                isInvalid={!!fieldErrors.username}
                errorText={fieldErrors.username}
              >
                <InputField
                  value={user.username}
                  onChangeText={(text) => handleInputChange("username", text)}
                  placeholder="Choose a unique username"
                  autoCapitalize="none"
                  testID="username-input"
                />
              </Input>

              <Input
                variant="filled"
                size="sm"
                label="First Name"
                isRequired
                isInvalid={!!fieldErrors.firstName}
                errorText={fieldErrors.firstName}
              >
                <InputField
                  value={user.firstName}
                  onChangeText={(text) => handleInputChange("firstName", text)}
                  placeholder="Enter your first name"
                  autoCapitalize="words"
                  testID="firstname-input"
                />
              </Input>

              <Input
                variant="filled"
                size="sm"
                label="Last Name"
                isRequired
                isInvalid={!!fieldErrors.lastName}
                errorText={fieldErrors.lastName}
              >
                <InputField
                  value={user.lastName}
                  onChangeText={(text) => handleInputChange("lastName", text)}
                  placeholder="Enter your last name"
                  autoCapitalize="words"
                  testID="lastname-input"
                />
              </Input>

              <View>
                <Input
                  variant="filled"
                  size="sm"
                  label="Bio"
                  isInvalid={!!fieldErrors.bio}
                  errorText={fieldErrors.bio}
                >
                  <InputField
                    value={user.bio}
                    onChangeText={(text) => handleInputChange("bio", text)}
                    placeholder="Tell us about yourself and your food preferences"
                    maxLength={150}
                    textAlignVertical="top"
                    testID="bio-input"
                  />
                </Input>
              </View>
              <View>
                <SelectCountry
                  onCountrySelect={handleCountrySelect}
                  selectedCountry={user.country}
                />
              </View>
              <View className="p-2">
                <Text className="text-gray-600 font-medium text-sm mb-2">
                  Dietary Options
                </Text>
                <DietaryTagInput
                  tags={user.dietaryRestrictions}
                  setTags={handleDietaryRestrictionsChange}
                  title="Add dietary restrictions (e.g., gluten-free, vegan)"
                  sc="#"
                  suggestions={
                    extractSuggestionsByCategory(FILTER_CATEGORIES).food || [
                      "vegetarian",
                      "vegan",
                      "gluten-free",
                      "dairy-free",
                      "nut-free",
                    ]
                  }
                />
              </View>

              <TouchableOpacity
                className={`bg-[#f39f1e] py-4 px-6 rounded-full mt-6 shadow-md ${
                  isSubmitting ? "opacity-70" : ""
                }`}
                onPress={saveChanges}
                disabled={isSubmitting}
                activeOpacity={0.8}
                testID="save-button"
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-center text-lg">
                    {incomplete ? "Complete Account Details" : "Save Changes"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
