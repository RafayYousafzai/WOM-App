import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
  StyleSheet,
  TextInput,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import {
  ArrowLeft,
  LogOut,
  Calendar,
  ChevronDown,
  X,
} from "lucide-react-native";

import { useEditProfile } from "./useEditProfile";
import SelectCountry from "@/components/common/SelectCountry";

// Food-related emoji options
const FOOD_EMOJIS = [
  "🍕",
  "🥩",
  "🍔",
  "🥗",
  "🍜",
  "🥑",
  "🍰",
  "🍎",
  "🥐",
  "🍣",
  "🌮",
  "🍝",
  "🥘",
  "🍓",
  "🥞",
  "🍿",
  "🧀",
  "🍞",
  "🎂",
  "🍸",
];

const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Nut-Free",
  "Keto",
  "Paleo",
  "Halal",
  "Kosher",
  "Low-Carb",
];

export const EditProfileScreen = ({ setIsEditing }) => {
  const { signOut } = useAuth();
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const [incomplete, setIncomplete] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDietaryOptions, setSelectedDietaryOptions] = useState([]);
  const [showDietaryModal, setShowDietaryModal] = useState(false);

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

  useEffect(() => {
    setSelectedDietaryOptions(user.dietaryRestrictions || []);
  }, [user.dietaryRestrictions]);

  const saveChanges = async () => {
    try {
      const isValid = validateAllFields();
      if (!isValid) {
        Alert.alert(
          "Validation Error",
          "Please fill in all required fields correctly."
        );
        return;
      }

      setIsSubmitting(true);

      const metadata = {
        bio: user.bio,
        dietaryRestrictions: selectedDietaryOptions,
        country: user.country,
        birthday: user.birthday ? user.birthday.toISOString() : null,
        favoriteEmoji: user.favoriteEmoji || null,
      };

      await clerkUser.update({
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        unsafeMetadata: metadata,
      });

      await clerkUser?.reload();

      Alert.alert("Success", "Profile updated successfully!");
      if (incomplete) router.replace("home");
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating user:", err);
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

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const toggleDietaryOption = (option) => {
    const newOptions = selectedDietaryOptions.includes(option)
      ? selectedDietaryOptions.filter((item) => item !== option)
      : [...selectedDietaryOptions, option];

    setSelectedDietaryOptions(newOptions);
    handleDietaryRestrictionsChange(newOptions);
  };

  const removeDietaryOption = (option) => {
    const newOptions = selectedDietaryOptions.filter((item) => item !== option);
    setSelectedDietaryOptions(newOptions);
    handleDietaryRestrictionsChange(newOptions);
  };

  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f39f1e" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={incomplete ? handleLogout : () => setIsEditing(false)}
            style={styles.headerButton}
            activeOpacity={0.7}
          >
            {incomplete ? (
              <LogOut size={20} color="#6B7280" />
            ) : (
              <ArrowLeft size={20} color="#6B7280" />
            )}
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {incomplete ? "Complete Profile" : "Edit Profile"}
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Username */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username *</Text>
            <TextInput
              style={[
                styles.textInput,
                fieldErrors.username && styles.inputError,
              ]}
              value={user.username}
              onChangeText={(text) => handleInputChange("username", text)}
              placeholder="Choose a unique username"
              autoCapitalize="none"
              placeholderTextColor="#9CA3AF"
            />
            {fieldErrors.username && (
              <Text style={styles.errorText}>{fieldErrors.username}</Text>
            )}
          </View>

          {/* First Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={[
                styles.textInput,
                fieldErrors.firstName && styles.inputError,
              ]}
              value={user.firstName}
              onChangeText={(text) => handleInputChange("firstName", text)}
              placeholder="Enter your first name"
              autoCapitalize="words"
              placeholderTextColor="#9CA3AF"
            />
            {fieldErrors.firstName && (
              <Text style={styles.errorText}>{fieldErrors.firstName}</Text>
            )}
          </View>

          {/* Last Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Last Name *</Text>
            <TextInput
              style={[
                styles.textInput,
                fieldErrors.lastName && styles.inputError,
              ]}
              value={user.lastName}
              onChangeText={(text) => handleInputChange("lastName", text)}
              placeholder="Enter your last name"
              autoCapitalize="words"
              placeholderTextColor="#9CA3AF"
            />
            {fieldErrors.lastName && (
              <Text style={styles.errorText}>{fieldErrors.lastName}</Text>
            )}
          </View>

          {/* Bio */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[
                styles.textInput,
                styles.bioInput,
                fieldErrors.bio && styles.inputError,
              ]}
              value={user.bio}
              onChangeText={(text) => handleInputChange("bio", text)}
              placeholder="Tell us about yourself and your food preferences..."
              maxLength={150}
              multiline
              textAlignVertical="top"
              placeholderTextColor="#9CA3AF"
            />
            <Text style={styles.charCount}>{user.bio?.length || 0}/150</Text>
            {fieldErrors.bio && (
              <Text style={styles.errorText}>{fieldErrors.bio}</Text>
            )}
          </View>

          {/* Birthday */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Birthday</Text>
            <TouchableOpacity
              onPress={() => setShowDateModal(true)}
              style={[
                styles.textInput,
                styles.dateButton,
                fieldErrors.birthday && styles.inputError,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dateText,
                  !user.birthday && styles.placeholderText,
                ]}
              >
                {user.birthday
                  ? formatDate(user.birthday)
                  : "Select your birthday"}
              </Text>
              <Calendar size={20} color="#6B7280" />
            </TouchableOpacity>
            {fieldErrors.birthday && (
              <Text style={styles.errorText}>{fieldErrors.birthday}</Text>
            )}
          </View>

          {/* Favorite Emoji */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Favorite Food Emoji</Text>
            <View style={styles.emojiContainer}>
              {FOOD_EMOJIS.map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleInputChange("favoriteEmoji", emoji)}
                  style={[
                    styles.emojiButton,
                    user.favoriteEmoji === emoji && styles.emojiButtonSelected,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Country */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Country</Text>
            <SelectCountry
              onCountrySelect={handleCountrySelect}
              selectedCountry={user.country}
            />
          </View>

          {/* Dietary Restrictions */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Dietary Preferences</Text>

            {/* Selected Options */}
            {selectedDietaryOptions.length > 0 && (
              <View style={styles.selectedOptionsContainer}>
                {selectedDietaryOptions.map((option, index) => (
                  <View key={index} style={styles.selectedOption}>
                    <Text style={styles.selectedOptionText}>{option}</Text>
                    <TouchableOpacity
                      onPress={() => removeDietaryOption(option)}
                      style={styles.removeButton}
                    >
                      <X size={14} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Add Options Button */}
            <TouchableOpacity
              onPress={() => setShowDietaryModal(true)}
              style={styles.addOptionsButton}
              activeOpacity={0.7}
            >
              <Text style={styles.addOptionsText}>
                {selectedDietaryOptions.length > 0
                  ? "Edit Dietary Preferences"
                  : "Add Dietary Preferences"}
              </Text>
              <ChevronDown size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              isSubmitting && styles.saveButtonDisabled,
            ]}
            onPress={saveChanges}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>
                {incomplete ? "Complete Profile" : "Save Changes"}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      <Modal
        transparent={true}
        visible={showDateModal}
        animationType="slide"
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {Platform.OS === "ios" && (
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={cancelDateSelection}
                  style={styles.modalButton}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select Birthday</Text>
                <TouchableOpacity
                  onPress={confirmDate}
                  style={styles.modalButton}
                >
                  <Text style={styles.confirmButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
            <DateTimePicker
              value={tempDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onDateChange}
              maximumDate={new Date()}
              textColor="#1F2937"
            />
          </View>
        </View>
      </Modal>

      {/* Dietary Options Modal */}
      <Modal
        transparent={true}
        visible={showDietaryModal}
        animationType="slide"
        onRequestClose={() => setShowDietaryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dietaryModalContent}>
            <View style={styles.dietaryModalHeader}>
              <Text style={styles.dietaryModalTitle}>Dietary Preferences</Text>
              <TouchableOpacity
                onPress={() => setShowDietaryModal(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.dietaryOptionsScroll}>
              <View style={styles.dietaryOptionsGrid}>
                {DIETARY_OPTIONS.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => toggleDietaryOption(option)}
                    style={[
                      styles.dietaryOption,
                      selectedDietaryOptions.includes(option) &&
                        styles.dietaryOptionSelected,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dietaryOptionText,
                        selectedDietaryOptions.includes(option) &&
                          styles.dietaryOptionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowDietaryModal(false)}
              style={styles.dietaryDoneButton}
            >
              <Text style={styles.dietaryDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#FFFFFF",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "400",
  },
  bioInput: {
    height: 80,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
    marginTop: 4,
    fontWeight: "500",
  },
  charCount: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "right",
    marginTop: 4,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateText: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "400",
  },
  placeholderText: {
    color: "#9CA3AF",
  },
  emojiContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  emojiButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  emojiButtonSelected: {
    backgroundColor: "#f39f1e",
    borderColor: "#f39f1e",
    shadowColor: "#f39f1e",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  emojiText: {
    fontSize: 20,
  },
  selectedOptionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  selectedOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f39f1e",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  selectedOptionText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
    marginRight: 6,
  },
  removeButton: {
    padding: 2,
  },
  addOptionsButton: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addOptionsText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "400",
  },
  saveButton: {
    backgroundColor: "#f39f1e",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    shadowColor: "#f39f1e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelButtonText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "500",
  },
  confirmButtonText: {
    color: "#f39f1e",
    fontSize: 16,
    fontWeight: "600",
  },
  dietaryModalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  dietaryModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dietaryModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  closeButton: {
    padding: 4,
  },
  dietaryOptionsScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  dietaryOptionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  dietaryOption: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 8,
  },
  dietaryOptionSelected: {
    backgroundColor: "#ffff",
    borderColor: "#f39f1e",
  },
  dietaryOptionText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  dietaryOptionTextSelected: {
    color: "#f39f1e",
  },
  dietaryDoneButton: {
    backgroundColor: "#f39f1e",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  dietaryDoneText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
