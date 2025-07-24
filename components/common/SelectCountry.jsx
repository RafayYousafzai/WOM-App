import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import CountryPicker from "react-native-country-picker-modal";
import { ChevronDown, AlertCircle } from "lucide-react-native";

export default function SelectCountry({
  onCountrySelect,
  selectedCountry,
  isRequired = false,
  isInvalid = false,
  errorText = null,
}) {
  const [countryCode, setCountryCode] = useState(null);
  const [country, setCountry] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Effect to set initial country from selectedCountry prop
  useEffect(() => {
    if (selectedCountry) {
      // Handle the case where selectedCountry has 'code' instead of 'cca2'
      const code = selectedCountry.cca2 || selectedCountry.code;
      setCountryCode(code);
      setCountry(selectedCountry);
    }
  }, [selectedCountry]);

  const onSelect = (selectedCountry) => {
    setCountryCode(selectedCountry.cca2);
    setCountry(selectedCountry);
    setIsVisible(false);
    setIsFocused(false);
    onCountrySelect?.(selectedCountry);
  };

  const handlePress = () => {
    setIsVisible(true);
    setIsFocused(true);
  };

  const handleClose = () => {
    setIsVisible(false);
    setIsFocused(false);
  };

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.label,
          isInvalid && styles.labelError,
          isFocused && !isInvalid && styles.labelFocused,
        ]}
      >
        Country
        {isRequired && <Text style={styles.required}> *</Text>}
      </Text>
      <TouchableOpacity
        style={[
          styles.inputContainer,
          isFocused && !isInvalid && styles.inputContainerFocused,
          isInvalid && styles.inputContainerError,
        ]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.inputContent}>
          <Text
            style={[
              styles.inputText,
              !country && styles.placeholderText,
              isInvalid && styles.inputTextError,
            ]}
          >
            {country ? country.name : "Select country"}
          </Text>
        </View>
        <View style={styles.iconContainer}>
          {isInvalid && (
            <AlertCircle size={16} color="#EF4444" style={styles.errorIcon} />
          )}
          <ChevronDown
            size={18}
            color={isInvalid ? "#EF4444" : isFocused ? "#3B82F6" : "#6b7280"}
          />
        </View>
      </TouchableOpacity>

      {/* Error message */}
      {isInvalid && errorText && (
        <Text style={styles.errorText}>{errorText}</Text>
      )}

      <CountryPicker
        countryCode={countryCode}
        withFilter
        withFlag
        withEmoji
        withCountryNameButton={false}
        withAlphaFilter
        withCallingCode={false}
        theme={{
          primaryColor: "#3B82F6",
          backgroundColor: "#f9fafb",
          onBackgroundTextColor: "#111827",
          filterPlaceholderTextColor: "#6b7280",
        }}
        onSelect={onSelect}
        onClose={handleClose}
        visible={isVisible}
        containerButtonStyle={styles.hiddenPicker}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginTop: 8,
    marginBottom: 8,
  },
  labelFocused: {
    color: "#3B82F6",
  },
  labelError: {
    color: "#EF4444",
  },
  required: {
    color: "#EF4444",
  },
  inputContainer: {
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    height: 40,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputContainerFocused: {
    borderColor: "#3B82F6",
    backgroundColor: "#FFFFFF",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainerError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  inputText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "500",
  },
  inputTextError: {
    color: "#EF4444",
  },
  placeholderText: {
    color: "#9CA3AF",
    fontWeight: "400",
    fontSize: 14,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  errorIcon: {
    marginRight: 2,
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 6,
    marginLeft: 4,
  },
  hiddenPicker: {
    display: "none",
  },
});
