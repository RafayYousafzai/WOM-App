import { useState, useCallback } from "react";
import { Platform } from "react-native";

export const useEditProfile = (clerkUser, isLoaded) => {
  const [showDateModal, setShowDateModal] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  // Field error states
  const [fieldErrors, setFieldErrors] = useState({
    username: null,
    firstName: null,
    lastName: null,
    bio: null,
    dietaryRestrictions: [],
    birthday: null,
  });

  const [user, setUser] = useState({
    username: "",
    firstName: "",
    lastName: "",
    bio: "",
    dietaryRestrictions: [],
    country: null,
    birthday: null,
  });

  const initializeUserData = useCallback(() => {
    if (isLoaded && clerkUser) {
      const metadata = clerkUser.unsafeMetadata || {};

      // Handle dietary restrictions properly
      let dietaryRestrictions = [];
      if (Array.isArray(metadata.dietaryRestrictions)) {
        dietaryRestrictions = metadata.dietaryRestrictions;
      }

      // Initialize birthday from metadata
      const storedBirthday = metadata.birthday
        ? new Date(metadata.birthday)
        : null;

      console.log("Loading user data:", {
        dietaryRestrictions,
        metadata: metadata.dietaryRestrictions,
        birthday: storedBirthday,
      });

      setUser({
        username: clerkUser.username || "",
        firstName: clerkUser.firstName || "",
        lastName: clerkUser.lastName || "",
        bio: metadata.bio || "",
        dietaryRestrictions: dietaryRestrictions,
        country: metadata.country || null,
        birthday: storedBirthday,
      });
    }
  }, [clerkUser, isLoaded]);

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

  // Handle date picker changes
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || tempDate;
    // For Android, DateTimePicker automatically closes the modal.
    // For iOS, we manage it with "Done" button.
    if (Platform.OS === "android") {
      setShowDateModal(false);
      setUser((prev) => ({ ...prev, birthday: currentDate }));
      clearFieldError("birthday");
    }
    setTempDate(currentDate);
  };

  // Confirm date selection for iOS
  const confirmDate = () => {
    setUser((prev) => ({ ...prev, birthday: tempDate }));
    clearFieldError("birthday");
    setShowDateModal(false);
  };

  // Cancel date selection
  const cancelDateSelection = () => {
    setShowDateModal(false);
    // Reset tempDate to current user's birthday if it exists, or current date
    setTempDate(user.birthday || new Date());
  };

  // Helper to format date for display
  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  return {
    user,
    fieldErrors,
    showDateModal,
    tempDate,
    setShowDateModal,
    setTempDate,
    setFieldErrors,
    handleInputChange,
    handleCountrySelect,
    handleDietaryRestrictionsChange,
    onDateChange,
    confirmDate,
    cancelDateSelection,
    clearFieldError,
    validateAllFields,
    formatDate,
    initializeUserData,
  };
};
