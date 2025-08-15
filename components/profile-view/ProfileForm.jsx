import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Button, Icon } from "@/components/ui";
import { AlertCircle } from "lucide-react-native";
import SelectCountry from "@/components/common/SelectCountry";
import { Input, InputField } from "@/components/ui";
import DietaryTagInput from "@/components/common/DietaryOptionTag";
import {
  extractSuggestionsByCategory,
  FILTER_CATEGORIES,
} from "@/constants/SearchFilters";

export const ProfileForm = ({
  user,
  fieldErrors,
  handleInputChange,
  handleCountrySelect,
  handleDietaryRestrictionsChange,
  setShowDateModal,
  saveChanges,
  isSubmitting,
  incomplete,
}) => {
  // Helper to format date for display
  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
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

      {/* Birthday Input Field */}
      <View>
        <Text className="text-gray-600 font-medium text-sm mb-2">Birthday</Text>
        <TouchableOpacity
          onPress={() => setShowDateModal(true)}
          className="bg-gray-100 rounded-lg px-3 py-3"
        >
          <Text
            className={`text-base ${
              user.birthday ? "text-gray-800" : "text-gray-400"
            }`}
          >
            {user.birthday ? formatDate(user.birthday) : "Select your birthday"}
          </Text>
        </TouchableOpacity>
        {!!fieldErrors.birthday && (
          <View className="flex-row items-center mt-1">
            <Icon as={AlertCircle} size="xs" className="text-red-500 mr-1" />
            <Text className="text-red-500 text-xs">{fieldErrors.birthday}</Text>
          </View>
        )}
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
  );
};

export const DatePickerModal = ({
  showDateModal,
  tempDate,
  onDateChange,
  confirmDate,
  cancelDateSelection,
  setShowDateModal,
}) => {
  return (
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
              <TouchableOpacity
                onPress={confirmDate}
                style={styles.modalButton}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          )}
          <DateTimePicker
            value={tempDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onDateChange}
            maximumDate={new Date()}
          />
          {Platform.OS === "android" && (
            <Button
              onPress={confirmDate}
              className="bg-[#f39f1e] py-3 mt-4 rounded-full mx-4"
            >
              <Text className="text-white font-bold text-center text-lg">
                Confirm Date
              </Text>
            </Button>
          )}
        </View>
      </View>
    </Modal>
  );
};

// Add styles for the modal
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    width: "100%",
    paddingBottom: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalButton: {
    padding: 10,
  },
  cancelButtonText: {
    color: "#e74c3c",
    fontSize: 16,
    fontWeight: "500",
  },
  confirmButtonText: {
    color: "#2ecc71",
    fontSize: 16,
    fontWeight: "500",
  },
});
