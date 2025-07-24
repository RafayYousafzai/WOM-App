import * as React from "react";
import { useAuthContext } from "@/context/authContext";
import { router } from "expo-router";
import {
  Animated,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  VStack,
  HStack,
  Input,
  InputField,
  Button,
  ButtonText,
  Text,
  Box,
  Heading,
  Link,
  LinkText,
  Icon,
} from "@/components/ui";
import { Lock, ArrowLeft, PhoneCall, PhoneCallIcon } from "lucide-react-native";
import VerificationCodeInput from "@/components/auth/verification";
import { useToast } from "react-native-toast-notifications";
import PhoneInput from "react-native-phone-input"; // Import the phone input library

export default function SignUpScreen() {
  const {
    state,
    updateState,
    signUpWithEmail,
    confirmEmail,
    connectPhoneToAccount,
    confirmPhone,
    resetState,
  } = useAuthContext();
  const toast = useToast();
  const phoneInputRef = React.useRef(null); // Ref for PhoneInput component

  const [isLoading, setIsLoading] = React.useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const [canResend, setCanResend] = React.useState(true);
  const [countdown, setCountdown] = React.useState(0);

  const startCountdown = () => {
    setCanResend(false);
    setCountdown(60);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [state.status]);

  const handleSignUp = async () => {
    setIsLoading(true);

    try {
      await signUpWithEmail();
    } catch (error) {
      // Handle specific error cases
      if (
        error?.message?.includes("email") &&
        error?.message?.includes("taken")
      ) {
        toast.show("Email is already registered.", {
          type: "warning",
        });
      } else {
        toast.show(error?.message || "Sign up failed", {
          type: "danger",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Watch for state changes and show errors
  React.useEffect(() => {
    if (state.errorMessage) {
      toast.show(state.errorMessage, {
        type: "warning",
      });
      // Clear the error after showing it
      setTimeout(() => {
        updateState("errorMessage", "");
      }, 100);
    }
  }, [state.errorMessage, state.status, state]);

  // Watch for console errors and show snackbar
  React.useEffect(() => {
    const originalConsoleError = console.error;

    console.error = (...args) => {
      // Call original console.error
      originalConsoleError.apply(console, args);

      // Convert args to a string for easier checking
      const errorString = args.join(" ");

      // Check for various error patterns
      if (
        errorString.includes("Error during email sign-up") ||
        errorString.includes("email address is taken") ||
        errorString.includes("already registered") ||
        (errorString.includes("auth") && errorString.includes("error"))
      ) {
        // Extract the actual error message
        const match =
          errorString.match(/\[Error: (.+?)\]/) ||
          errorString.match(/Error: (.+?)$/);
        if (match && match[1]) {
          const errorMsg = match[1];

          let displayMessage = errorMsg;
          if (
            errorMsg.includes("email address is taken") ||
            errorMsg.includes("already registered") ||
            errorMsg.includes("already exists")
          ) {
            displayMessage = "Email is already registered";
          }

          toast.show(displayMessage, {
            type: "normal",
          });
        } else {
          // If we couldn't extract a specific message but know it's an auth error
          if (errorString.includes("email") && errorString.includes("taken")) {
            toast.show("Email is already registered", {
              type: "warning",
            });
          } else if (
            errorString.includes("auth") ||
            errorString.includes("sign")
          ) {
            toast.show("Authentication error. Please try again.", {
              type: "success",
            });
          }
        }
      }
    };

    // Cleanup
    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  const renderMainForm = () => (
    <Animated.View style={{ opacity: fadeAnim, width: "100%" }}>
      <VStack className="w-full px-4 pt-12">
        <Button
          variant="link"
          onPress={() => router.replace("/(auth)/select-auth")}
          className="self-start mb-8 bg-gray-200 w-14 h-14 rounded-full"
        >
          <Icon as={ArrowLeft} size="sm" className="text-gray-600" />
        </Button>

        <Image
          source={require("../../assets/images/InboxEmail.png")}
          className="w-24 h-32 mt-20"
        />

        <VStack className="space-y-2 mb-6">
          <Heading className="text-2xl font-bold text-gray-900">
            Create your account
          </Heading>
          <Text className="text-gray-600">
            Get started with your email and password
          </Text>
        </VStack>

        <VStack className="space-y-6">
          <Box>
            <Text className="text-sm text-gray-600 mb-1">Email Address</Text>
            <Input
              size="sm"
              leftIcon={
                <Icon as={PhoneCall} size="sm" className="text-gray-400" />
              }
            >
              <InputField
                autoCapitalize="none"
                value={state.emailAddress}
                placeholder="Enter your email"
                onChangeText={(value) => updateState("emailAddress", value)}
                keyboardType="email-address"
              />
            </Input>
          </Box>

          <Box>
            <Text className="text-sm text-gray-600 mb-1">Password</Text>
            <Input
              size="sm"
              leftIcon={<Icon as={Lock} size="sm" className="text-gray-400" />}
            >
              <InputField
                value={state.password}
                placeholder="Create a password"
                onChangeText={(value) => updateState("password", value)}
                secureTextEntry={true}
              />
            </Input>
          </Box>

          <Button
            onPress={handleSignUp}
            size="lg"
            className="bg-[#f39f1e] mt-3 text-white h-12 rounded-full"
            disabled={isLoading}
          >
            <ButtonText className="text-white">
              {isLoading ? "Loading..." : "Continue"}
            </ButtonText>
          </Button>

          <HStack className="justify-center space-x-1 mt-6">
            <Text className="text-gray-600">Already have an account?</Text>
            <Link onPress={() => router.push("/sign-in")}>
              <LinkText className="text-blue-600 ml-1 no-underline">
                Sign in
              </LinkText>
            </Link>
          </HStack>
        </VStack>
      </VStack>
    </Animated.View>
  );

  const renderEmailVerification = () => {
    const handleEmailCode = async (fullCode) => {
      await updateState("emailCode", fullCode);

      if (fullCode.length === 6) {
        try {
          await confirmEmail(fullCode);
        } catch (error) {
          toast.show("Invalid verification code", {
            type: "warning",
          });
        }
      }
    };

    return (
      <View className="flex h-full items-center justify-between">
        <View className="w-full pt-16 px-6">
          <Button
            variant="link"
            onPress={() => updateState("status", "")}
            className="self-start mb-8 bg-gray-200 w-14 h-14 rounded-full"
          >
            <Icon as={ArrowLeft} size="sm" className="text-gray-600" />
          </Button>

          <Image
            source={require("../../assets/images/verify.png")}
            className="w-28 h-36"
          />

          <Text className="text-3xl font-bold text-black mb-1">
            Verify Your Email
          </Text>
          <Text className="text-lg font-semibold text-gray-500 mb-5 mt-1">
            We've sent a verification code to {state.emailAddress}
          </Text>

          <Text className="text-lg font-semibold text-gray-500 mt-1 mb-2">
            Please enter the code below:
          </Text>

          <VerificationCodeInput length={6} onVerify={handleEmailCode} />

          <View className="flex-row justify-center mt-5">
            <Text className="text-gray-600 mr-2">Didn't receive the code?</Text>
            <TouchableOpacity onPress={handleEmailCode} disabled={!canResend}>
              <Text
                className={`font-bold ${
                  canResend ? "text-[#f39f1e]" : "text-gray-400"
                }`}
              >
                {canResend ? "Resend" : `Resend in ${countdown}s`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderPhoneForm = () => (
    <Animated.View style={{ opacity: fadeAnim, width: "100%" }}>
      <VStack className="w-full pt-16 px-6">
        <Button
          variant="link"
          onPress={() => updateState("status", "")}
          className="self-start mb-8 bg-gray-200 w-14 h-14 rounded-full"
        >
          <Icon as={ArrowLeft} size="sm" className="text-gray-600" />
        </Button>

        <Image
          source={require("../../assets/images/phone.png")}
          className="w-24 h-24 mt-20"
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
            onPress={async () => {
              try {
                await connectPhoneToAccount();
              } catch (error) {
                // Handle specific phone number errors
                if (
                  error?.message?.includes("phone number is taken") ||
                  (error?.message?.includes("phone") &&
                    error?.message?.includes("taken"))
                ) {
                  toast.show(
                    "This phone number is already registered. Please use a different number.",
                    {
                      type: "warning",
                    }
                  );
                } else {
                  toast.show(
                    error?.message || "Failed to send verification code",
                    {
                      type: "danger",
                    }
                  );
                }
              }
            }}
            size="lg"
            className="bg-[#f39f1e] mt-3 text-white rounded-xl h-12"
          >
            <ButtonText className="text-white">Continue</ButtonText>
          </Button>

          <HStack className="justify-center space-x-1 mt-6">
            <Text className="text-gray-600">Want to change your email?</Text>
            <TouchableOpacity
              onPress={() => {
                updateState("status", "");
              }}
            >
              <Text className="text-blue-600 ml-1 no-underline">Change</Text>
            </TouchableOpacity>
          </HStack>
        </VStack>
      </VStack>
    </Animated.View>
  );

  const renderPhoneVerification = () => {
    const handlePhoneCode = async (currentCode) => {
      await updateState("phoneCode", currentCode);

      if (currentCode.length === 6) {
        try {
          await confirmPhone(currentCode);
        } catch (error) {
          toast.show("Invalid verification code", {
            type: "danger",
          });
        }
      }
    };

    return (
      <View className="flex h-full items-center justify-between">
        <View className="w-full pt-16 px-6">
          <Button
            variant="link"
            onPress={() => updateState("status", "connectPhoneToAccount")}
            className="self-start mb-8 bg-gray-200 w-14 h-14 rounded-full"
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

          <VerificationCodeInput length={6} onVerify={handlePhoneCode} />

          <View className="flex-row justify-center mt-5">
            <Text className="text-gray-600 mr-2">Didn't receive the code?</Text>
            <TouchableOpacity onPress={connectPhoneToAccount}>
              <Text className="text-[#f39f1e] font-bold">Resend</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Box className="flex-1 bg-white">
      {state.status === "confirmEmail"
        ? renderEmailVerification()
        : state.status === "connectPhoneToAccount"
        ? renderPhoneForm()
        : state.status === "confirmPhone"
        ? renderPhoneVerification()
        : renderMainForm()}
    </Box>
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
