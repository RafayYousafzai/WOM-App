import React, { useState, useRef, useEffect } from "react";
import { useOAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import {
  TouchableOpacity,
  Text,
  Image,
  View,
  Modal,
  StyleSheet,
} from "react-native";
import { useAuthContext } from "@/context/authContext";
import { createURL } from "expo-linking";
import { ArrowLeft } from "lucide-react-native";
import PhoneInput from "react-native-phone-input"; // Import the phone input library
import {
  VStack,
  Input, // Keeping Input for other potential uses, though not directly used for phone here
  InputField,
  ButtonText,
  Button,
  Box,
  Heading,
  Icon,
} from "@/components/ui";
import VerificationCodeInput from "@/components/auth/verification";
import { useToast } from "react-native-toast-notifications"; // Import useToast

export default function AppleOAuthButton() {
  // Renamed component to AppleOAuthButton
  const {
    updateState,
    state,
    handleOAuthPhoneVerification: originalHandleOAuthPhoneVerification,
    confirmOAuthPhone,
  } = useAuthContext();

  const { startOAuthFlow } = useOAuth({
    strategy: "oauth_apple", // Changed OAuth strategy to 'oauth_apple'
    debug: true,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [isInitiatingOAuth, setIsInitiatingOAuth] = useState(false); // New state to track if this component initiated the flow
  const phoneInputRef = useRef(null); // Ref for PhoneInput component
  const toast = useToast(); // Initialize useToast

  useEffect(() => {
    // This effect controls the visibility of the modal based on auth state
    // and whether this specific component initiated the OAuth flow.
    const shouldShowModal =
      (state.status === "handleOAuthPhoneVerification" ||
        state.status === "confirmOAuthPhone") &&
      isInitiatingOAuth; // Only show modal if this component initiated the flow

    setModalVisible(shouldShowModal);

    // We will rely solely on explicit resets in handleAppleAuth,
    // modal onRequestClose, and the back button press.
  }, [state.status, isInitiatingOAuth]); // Add isInitiatingOAuth to dependency array

  /**
   * Handles the Apple OAuth authentication flow.
   * Initiates the OAuth process and manages redirection or phone verification.
   */
  const handleAppleAuth = async () => {
    // Renamed handler to handleAppleAuth
    setIsInitiatingOAuth(true); // Set this component as the initiator
    try {
      const { createdSessionId, signUp, setActive } = await startOAuthFlow({
        redirectUrl: createURL("/select-auth", { scheme: "wordofmouth" }),
      });

      if (createdSessionId) {
        // If a session is created, activate it and navigate to home
        await setActive({ session: createdSessionId });
        router.push("/home");
        toast.show("Successfully logged in with Apple!", { type: "success" }); // Updated toast message
        setIsInitiatingOAuth(false); // Reset initiator flag on successful login
      } else if (signUp && signUp.missingFields.includes("phone_number")) {
        // If phone number is missing, update state for phone verification
        updateState("oauthSignUp", signUp);
        updateState("status", "handleOAuthPhoneVerification");
        updateState("emailAddress", signUp.emailAddress);
        toast.show("Please add your phone number to complete signup.", {
          type: "info",
        });
        // isInitiatingOAuth remains true here to keep the modal open
      }
    } catch (err) {
      // Handle any errors during the OAuth process
      handleOAuthErrors(err);
      setIsInitiatingOAuth(false); // Reset initiator flag on error
    }
  };

  /**
   * Handles errors occurring during the OAuth process.
   * Displays a toast notification to the user.
   * @param {Error} err - The error object.
   */
  const handleOAuthErrors = (err) => {
    console.error("OAuth Error (Apple):", err); // Updated error message
    toast.show(
      "Something went wrong with Apple authentication. Please try again.",
      {
        type: "danger",
        placement: "top",
        duration: 4000,
        animationType: "slide-in",
      }
    );
  };

  /**
   * Custom handler for phone number verification.
   * Retrieves the phone number from the PhoneInput ref and calls the original handler.
   */
  const handlePhoneVerification = () => {
    if (phoneInputRef.current) {
      // Get the full phone number including country code
      const fullPhoneNumber = phoneInputRef.current.getValue();
      if (fullPhoneNumber) {
        // Update the state with the full phone number
        updateState("phoneNumber", fullPhoneNumber);
        // Call the original handler from authContext
        originalHandleOAuthPhoneVerification();
      } else {
        toast.show("Please enter a valid phone number.", { type: "warning" });
      }
    }
  };

  /**
   * Renders the content of the modal based on the current authentication status.
   * Displays either the phone number input screen or the verification code input screen.
   */
  const renderModalContent = () => {
    if (state.status === "handleOAuthPhoneVerification") {
      return (
        <View className="flex-1">
          <VStack className="w-full px-4 pt-12">
            <Button
              variant="link"
              onPress={() => {
                updateState("status", ""); // Reset status in context
                router.replace("select-auth"); // Navigate back
                setIsInitiatingOAuth(false); // Also reset initiator flag when going back
              }}
              className="self-start mb-8 bg-gray-200 w-14 h-14 rounded-full"
            >
              <Icon as={ArrowLeft} size="sm" className="text-gray-600" />
            </Button>

            <Image
              source={require("@/assets/images/phone.png")} // Ensure this path is correct
              className="w-24 h-24 mt-20 "
            />

            <VStack className="space-y-2 mb-6">
              <Heading className="text-2xl font-bold text-gray-900">
                Add Phone Number
              </Heading>
              <Text className="text-gray-600">Email: {state.emailAddress}</Text>
              <Text className="text-gray-600">
                We'll send a verification code to your phone
              </Text>
            </VStack>

            <VStack className="space-y-6">
              <Box>
                <Text className="text-sm text-gray-600 mb-1">Phone Number</Text>
                {/* PhoneInput component integration */}
                <PhoneInput
                  ref={phoneInputRef}
                  initialCountry="us" // Set a default initial country
                  // You might want to pre-fill if state.phoneNumber exists
                  // value={state.phoneNumber} // This might need careful handling with PhoneInput's internal state
                  onChangePhoneNumber={(number) => {
                    // This callback provides the raw number without country code
                    // For full number, use ref.current.getValue()
                    updateState("phoneNumber", number);
                  }}
                  textProps={{
                    placeholder: "Enter your phone number",
                    style: styles.phoneInputText, // Apply custom styles
                  }}
                  style={styles.phoneInputContainer} // Apply custom styles to the container
                  textInputStyle={styles.phoneTextInput} // Styles for the text input itself
                  flagButtonStyle={styles.phoneFlagButton} // Styles for the flag button
                />
              </Box>

              <Button
                onPress={handlePhoneVerification} // Use the new handler
                size="lg"
                className="bg-[#f39f1e] mt-3 text-white rounded-xl h-14"
              >
                <ButtonText className="text-white">Continue</ButtonText>
              </Button>
            </VStack>
          </VStack>
        </View>
      );
    } else if (state.status === "confirmOAuthPhone") {
      const handlePhoneCodeVerification = async (fullCode) => {
        await updateState("phoneCode", fullCode);

        if (fullCode.length === 6) {
          confirmOAuthPhone(fullCode);
        }
      };

      return (
        <View className="flex h-full items-center justify-between">
          <View className="w-full pt-16 px-6">
            <Image
              source={require("@/assets/images/verify.png")} // Ensure this path is correct
              className="w-28 h-36"
              accessibilityLabel="Verification image"
            />

            <Text className="text-3xl font-bold text-black mb-1">
              Help us verify your login
            </Text>
            <Text className="text-lg font-semibold text-gray-500 mb-5 mt-1">
              We've sent a verification code to {state.phoneNumber}
            </Text>

            <Text className="text-lg font-semibold text-gray-500 mt-1 mb-2">
              Please enter the code below:
            </Text>

            <VerificationCodeInput
              length={6}
              onVerify={handlePhoneCodeVerification}
            />
          </View>
        </View>
      );
    }
    return null; // Return null if status doesn't match
  };

  return (
    <View>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setModalVisible(false);
          setIsInitiatingOAuth(false); // Reset initiator flag when modal is closed manually
        }}
      >
        <View className="flex-1 bg-white px-2">{renderModalContent()}</View>
      </Modal>

      <TouchableOpacity
        onPress={handleAppleAuth} // Changed onPress handler
        className="flex-row items-center justify-center p-4 mt-4 rounded-full bg-white"
      >
        <Image
          source={require("@/assets/icons/apple.png")} // Assuming you have an Apple icon
          className="absolute left-6 h-7 w-7"
        />
        <Text className="text-gray-800 text-xl ml-3 font-medium">
          Continue with Apple
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// Basic styling for PhoneInput, you might need to adjust these to match your UI library's look
const styles = StyleSheet.create({
  phoneInputContainer: {
    height: 56, // Match the height of your Input component
    width: "100%",
    borderWidth: 1,
    borderColor: "#E5E7EB", // Tailwind's gray-200
    borderRadius: 12, // Tailwind's rounded-xl
    backgroundColor: "transparent",
    flexDirection: "row", // Ensure flag and input are in a row
    alignItems: "center",
    paddingHorizontal: 8,
  },
  phoneTextInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#1F2937", // Tailwind's gray-900
    paddingLeft: 8,
  },
  phoneFlagButton: {
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
    paddingRight: 8,
    marginRight: 8,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  phoneInputText: {
    // This style is passed to the internal TextInput of PhoneInput
    fontSize: 16,
    color: "#1F2937",
  },
});
