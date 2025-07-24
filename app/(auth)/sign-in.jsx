import React, { useState, useRef, useEffect } from "react";
import { useAuthContext } from "@/context/authContext";
import { router } from "expo-router";
import {
  Animated,
  Image,
  TouchableOpacity,
  View,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView, // Import StyleSheet for PhoneInput styling
} from "react-native";
import {
  VStack,
  HStack,
  Input,
  InputField,
  Button,
  Text,
  Heading,
  Link,
  LinkText,
  Icon,
} from "@/components/ui";
import { ArrowLeft, MailIcon, PhoneCall } from "lucide-react-native";
import VerificationCodeInput from "@/components/auth/verification";
import { useToast } from "react-native-toast-notifications";
import PhoneInput from "react-native-phone-input"; // Import the phone input library
import { Platform } from "react-native";

export default function SignInScreen() {
  const {
    state,
    updateState,
    checkIdentifier,
    handleEmailSignIn,
    handlePhoneSignIn,
  } = useAuthContext();

  const toast = useToast();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // State to manage the selected input type (email or phone)
  const [selectedInputType, setSelectedInputType] = useState("email"); // Default to email

  // Ref for the PhoneInput component
  const phoneInputRef = useRef(null);

  // Loading states
  const [isCheckingIdentifier, setIsCheckingIdentifier] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);

  // Animation for screen transitions
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [state.status, selectedInputType]); // Re-run animation when input type changes

  /**
   * Handles the initial check of the identifier (email or phone number).
   * Determines the type of identifier based on `selectedInputType` and performs validation.
   */
  const handleCheckIdentifier = async () => {
    let identifierValue = "";
    let isValid = true;

    if (selectedInputType === "email") {
      identifierValue = state.identifier.trim();
      if (!identifierValue || !identifierValue.includes("@")) {
        // Basic email validation
        toast.show("Please enter a valid email address.", { type: "warning" });
        isValid = false;
      }
    } else {
      // phone case
      if (phoneInputRef.current) {
        identifierValue = phoneInputRef.current.getValue();

        // Basic phone validation - adjust as needed
        const digitsOnly = identifierValue.replace(/\D/g, "");
        if (digitsOnly.length < 8) {
          // Minimum 8 digits (adjust for your requirements)
          toast.show("Please enter a valid phone number with country code", {
            type: "warning",
          });
          isValid = false;
        }
      } else {
        toast.show("Phone input not ready.", { type: "danger" });
        isValid = false;
      }
    }

    if (!isValid) {
      return;
    }

    // Update the identifier in the context state with the validated value
    updateState("identifier", identifierValue);
    // IMPORTANT: If phone, also update state.phoneNumber for the verification step
    if (selectedInputType === "phone") {
      updateState("phoneNumber", identifierValue);
    }

    setIsCheckingIdentifier(true);
    try {
      const result = await checkIdentifier();
      if (result !== undefined && !state.errorMessage) {
        // Check if result is not undefined
        toast.show("Account found! Please continue.", { type: "success" });
      }
    } catch (error) {
      console.log("Check identifier error:", error);
      toast.show(
        error.message || "Failed to verify account. Please try again.",
        { type: "danger" }
      );
    } finally {
      setIsCheckingIdentifier(false);
    }
  };

  /**
   * Handles email-based sign-in.
   * Validates the password and attempts to sign in.
   */
  const handleEmailLogin = async () => {
    if (!state.password.trim()) {
      toast.show("Please enter your password.", { type: "warning" });
      return;
    }

    setIsSigningIn(true);
    try {
      console.log("Attempting email sign in...");
      await handleEmailSignIn();
      // Success toast will be handled by the context or router navigation
    } catch (error) {
      console.log("Email sign in error:", error);
      toast.show(error.message || "Invalid credentials. Please try again.", {
        type: "danger",
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  // Watch for error messages from the auth context and display toasts
  useEffect(() => {
    if (
      state.errorMessage &&
      (isSigningIn || isCheckingIdentifier || isVerifyingPhone)
    ) {
      toast.show(state.errorMessage, {
        type: "danger",
      });
      // Reset loading states when error occurs
      setIsSigningIn(false);
      setIsCheckingIdentifier(false);
      setIsVerifyingPhone(false);
    }
  }, [state.errorMessage, isSigningIn, isCheckingIdentifier, isVerifyingPhone]);

  /**
   * Renders the password input form for email sign-in.
   */
  const renderPasswordForm = () => (
    <Animated.View style={{ opacity: fadeAnim, width: "100%" }}>
      <VStack className="w-full px-4 pt-12">
        <Button
          variant="link"
          onPress={() => updateState("status", "")}
          className="self-start mb-8 bg-gray-200 w-14 h-14 rounded-full"
          disabled={isSigningIn}
        >
          <Icon as={ArrowLeft} size="sm" className="text-gray-600" />
        </Button>

        <Image
          source={require("../../assets/images/InboxEmail.png")}
          className="w-24 h-32 mt-20"
        />

        <VStack className="space-y-2 mb-6">
          <Heading className="text-2xl font-bold text-gray-900">
            Log in with your email
          </Heading>
          <Text className="text-gray-600">{state.emailAddress}</Text>
        </VStack>

        <VStack className="space-y-6">
          <View>
            <Text className="text-sm text-gray-600 mb-1">Password</Text>
            <Input
              leftIcon={
                <Icon as={MailIcon} size="sm" className="text-gray-400" />
              }
              size="sm"
            >
              <InputField
                autoCapitalize="none"
                value={state.password}
                placeholder="Enter your password"
                onChangeText={(value) => updateState("password", value)}
                secureTextEntry={true}
                editable={!isSigningIn}
              />
            </Input>
          </View>

          <TouchableOpacity
            onPress={handleEmailLogin}
            size="lg"
            className="bg-[#f39f1e] mt-3 text-white rounded-full h-12"
            disabled={isSigningIn}
          >
            {isSigningIn ? (
              <HStack className="items-center space-x-2">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white text-center mt-2">
                  Signing in...
                </Text>
              </HStack>
            ) : (
              <Text className="text-white text-center mt-2">Continue</Text>
            )}
          </TouchableOpacity>

          <HStack className="justify-center space-x-1 mt-6">
            <Text className="text-gray-600">Forgot password?</Text>
            <TouchableOpacity
              onPress={() => {
                router.push("reset-password");
              }}
              disabled={isSigningIn}
            >
              <Text className="text-blue-600 ml-1 no-underline">Change</Text>
            </TouchableOpacity>
          </HStack>
        </VStack>
      </VStack>
    </Animated.View>
  );

  /**
   * Renders the phone number verification code input form.
   */
  const renderPhoneVerification = () => {
    const handlePhoneCodeVerification = async (fullCode) => {
      if (!fullCode || fullCode.length < 6) {
        toast.show("Please enter the complete verification code", {
          type: "warning",
        });
        return;
      }

      setIsVerifyingPhone(true);
      try {
        const result = await handlePhoneSignIn(fullCode);

        if (result && result.success !== false && !state.errorMessage) {
          toast.show("Phone verified successfully!", {
            type: "success",
          });
        } else {
          throw new Error(state.errorMessage || "Phone verification failed");
        }
      } catch (error) {
        console.log("Phone verification error:", error);
        toast.show(
          error.message || "Invalid verification code. Please try again.",
          {
            type: "danger",
          }
        );
      } finally {
        setIsVerifyingPhone(false);
      }
    };

    return (
      <View className="flex h-full items-center justify-between">
        <View className="w-full pt-16 px-6">
          <Button
            variant="link"
            onPress={() => updateState("status", "")}
            className="self-start mb-8 bg-gray-200 w-14 h-14 rounded-full"
            disabled={isVerifyingPhone}
          >
            <Icon as={ArrowLeft} size="sm" className="text-gray-600" />
          </Button>

          <Image
            source={require("../../assets/images/verify.png")}
            className="w-28 h-36"
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
            disabled={isVerifyingPhone}
          />

          {isVerifyingPhone && (
            <HStack className="justify-center items-center mt-4">
              <ActivityIndicator size="small" color="#f39f1e" />
              <Text className="text-gray-600 ml-2">Verifying code...</Text>
            </HStack>
          )}

          <View className="flex-row justify-center mt-5">
            <Text className="text-gray-600 mr-2">Didn't receive the code?</Text>
            <TouchableOpacity disabled={isVerifyingPhone}>
              <Text className="text-[#f39f1e] font-bold">Resend</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  /**
   * Renders the main form for identifier input with email/phone tabs.
   */
  const renderMainForm = () => (
    <Animated.View style={{ opacity: fadeAnim, width: "100%" }}>
      <VStack className="w-full px-6 pt-12">
        <Button
          variant="link"
          onPress={() => router.replace("/(auth)/select-auth")}
          className="self-start mb-8 bg-gray-200 w-14 h-14 rounded-full"
          disabled={isCheckingIdentifier}
        >
          <Icon as={ArrowLeft} size="sm" className="text-gray-600" />
        </Button>
        <Image
          source={require("../../assets/images/InboxEmail.png")}
          className="w-24 h-32 mt-20"
        />

        <VStack className="space-y-2 mb-6">
          <Heading className="text-2xl font-bold text-gray-900">
            Please confirm your email or phone number.
          </Heading>
          <Text className="text-gray-600">
            We'll check if you have an account
          </Text>
        </VStack>

        {/* Tab selection for Email/Phone */}
        <HStack className="mb-6 justify-center">
          <Button
            variant="link"
            size="md"
            onPress={() => setSelectedInputType("email")}
            className={`flex-1 rounded-l-full ${
              selectedInputType === "email" ? "bg-[#f39f1e]" : "bg-gray-200"
            }`}
            disabled={isCheckingIdentifier}
          >
            <Text
              className={`${
                selectedInputType === "email" ? "text-white" : "text-gray-600"
              }`}
            >
              Email
            </Text>
          </Button>
          <Button
            variant="link"
            size="md"
            onPress={() => setSelectedInputType("phone")}
            className={`flex-1 rounded-r-full ${
              selectedInputType === "phone" ? "bg-[#f39f1e]" : "bg-gray-200"
            }`}
            disabled={isCheckingIdentifier}
          >
            <Text
              className={`${
                selectedInputType === "phone" ? "text-white" : "text-gray-600"
              }`}
            >
              Phone
            </Text>
          </Button>
        </HStack>

        <VStack className="space-y-6">
          <View>
            <Text className="text-sm text-gray-600 mb-1">
              {selectedInputType === "email" ? "Email Address" : "Phone Number"}
            </Text>
            {selectedInputType === "email" ? (
              <Input
                size="sm"
                className="bg-transparent border border-gray-200 rounded-xl"
                leftIcon={
                  <Icon as={MailIcon} size="sm" className="text-gray-400" />
                }
                variant="outlined"
              >
                <InputField
                  autoCapitalize="none"
                  value={state.identifier}
                  placeholder="Enter your email address"
                  onChangeText={(value) => updateState("identifier", value)}
                  keyboardType="email-address"
                  editable={!isCheckingIdentifier}
                />
              </Input>
            ) : (
              // PhoneInput component for phone number input
              <PhoneInput
                ref={phoneInputRef}
                initialCountry="us" // Set a default initial country
                // You might want to pre-fill if state.phoneNumber exists
                // value={state.phoneNumber} // This might need careful handling with PhoneInput's internal state
                onChangePhoneNumber={(fullNumber) => {
                  // PhoneInput's onChangePhoneNumber provides the full number including country code
                  // Update the identifier state directly with the full number
                  updateState("identifier", fullNumber);
                }}
                textProps={{
                  placeholder: "Enter your phone number",
                  style: styles.phoneInputText,
                }}
                style={styles.phoneInputContainer}
                textInputStyle={styles.phoneTextInput}
                flagButtonStyle={styles.phoneFlagButton}
                disabled={isCheckingIdentifier}
              />
            )}
          </View>

          <Button
            onPress={handleCheckIdentifier}
            size="lg"
            className="bg-[#f39f1e] mt-3 text-white h-12 rounded-full"
            disabled={isCheckingIdentifier}
          >
            {isCheckingIdentifier ? (
              <HStack className="items-center space-x-2">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white">Checking...</Text>
              </HStack>
            ) : (
              <Text className="text-white">Continue</Text>
            )}
          </Button>
        </VStack>

        <HStack className="justify-center space-x-1 mt-6">
          <Text className="text-gray-600">New here?</Text>
          <Link
            onPress={() => {
              updateState("status", "");
              router.push("/sign-up");
            }}
            disabled={isCheckingIdentifier}
          >
            <LinkText className="text-blue-500 ml-1 no-underline">
              Create account
            </LinkText>
          </Link>
        </HStack>
      </VStack>
    </Animated.View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} // adjust if you have headers
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1">
          {state.status === "needPassword"
            ? renderPasswordForm()
            : state.status === "phoneVerification"
            ? renderPhoneVerification()
            : renderMainForm()}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Basic styling for PhoneInput to match your UI library's look
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
    fontSize: 16,
    color: "#1F2937",
  },
});
