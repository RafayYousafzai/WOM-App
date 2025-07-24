import React, { useState } from "react";
import { useOAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { TouchableOpacity, Text, Image, View, Modal } from "react-native";
import { useAuthContext } from "@/context/authContext";
import { createURL } from "expo-linking";
import { useEffect } from "react";
import { ArrowLeft, PhoneCallIcon } from "lucide-react-native";
import {
  VStack,
  Input,
  InputField,
  ButtonText,
  Button,
  Box,
  Heading,
  Icon,
} from "@/components/ui";
import VerificationCodeInput from "@/components/auth/verification";

export default function FacebookOAuth() {
  const {
    updateState,
    state,
    handleOAuthPhoneVerification,
    confirmOAuthPhone,
  } = useAuthContext();
  const { startOAuthFlow } = useOAuth({
    strategy: "oauth_facebook",
    debug: true,
  });

  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (
      state.status === "handleOAuthPhoneVerification" ||
      state.status === "confirmOAuthPhone"
    ) {
      setModalVisible(true);
    } else {
      setModalVisible(false);
    }
  }, [state.status]);

  const handleFacebookAuth = async () => {
    try {
      const { createdSessionId, signUp, setActive } = await startOAuthFlow({
        redirectUrl: createURL("/select-auth", { scheme: "wordofmouth" }),
      });

      if (createdSessionId) {
        await setActive({ session: createdSessionId });
        router.push("/home");
      } else if (signUp && signUp.missingFields.includes("phone_number")) {
        updateState("oauthSignUp", signUp);
        updateState("status", "handleOAuthPhoneVerification");
        updateState("emailAddress", signUp.emailAddress);
      }
    } catch (err) {
      handleOAuthErrors(err);
    }
  };

  const handleOAuthErrors = (err) => {
    console.error("OAuth Error:", err);
    alert(
      "Something went wrong with Facebook authentication. Please try again."
    );
  };

  const renderModalContent = () => {
    if (state.status === "handleOAuthPhoneVerification") {
      return (
        <View className="flex-1">
          <VStack className="w-full px-4 pt-12">
            <Button
              variant="link"
              onPress={() => {
                updateState("status", "");
                router.replace("select-auth");
              }}
              className="self-start mb-8 bg-gray-200 w-14 h-14 rounded-full"
            >
              <Icon as={ArrowLeft} size="sm" className="text-gray-600" />
            </Button>

            <Image
              source={require("@/assets/images/phone.png")}
              className="w-24 h-24 mt-20 "
            />

            <VStack className="space-y-2 mb-6">
              <Heading className="text-2xl font-bold text-gray-900">
                Add Phone Number
              </Heading>
              <Text className="text-gray-600">Email: {state.emailAddress}</Text>{" "}
              <Text className="text-gray-600">
                We'll send a verification code to your phone
              </Text>
            </VStack>

            <VStack className="space-y-6">
              <Box>
                <Text className="text-sm text-gray-600 mb-1">Phone Number</Text>
                <Input
                  size="lg"
                  className="bg-transparent border border-gray-200 rounded-xl"
                >
                  {/* <Icon
                    as={PhoneCallIcon}
                    size="sm"
                    className="text-gray-400 ml-3"
                  /> */}
                  <InputField
                    autoCapitalize="none"
                    value={state.phoneNumber}
                    placeholder="Enter your email"
                    onChangeText={(value) => updateState("phoneNumber", value)}
                    className="h-14 pl-2"
                    keyboardType="phone-pad"
                  />
                </Input>
              </Box>

              <Button
                onPress={handleOAuthPhoneVerification}
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
      const handlePhone = async (fullCode) => {
        await updateState("phoneCode", fullCode);

        if (fullCode.length === 6) {
          confirmOAuthPhone(fullCode);
        }
      };

      return (
        <View className="flex h-full items-center justify-between">
          <View className="w-full pt-16 px-6">
            <Image
              source={require("@/assets/images/verify.png")}
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

            <VerificationCodeInput length={6} onVerify={handlePhone} />
          </View>
        </View>
      );
    }
  };

  return (
    <View>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1   bg-white px-2">{renderModalContent()}</View>
      </Modal>

      <TouchableOpacity
        onPress={handleFacebookAuth}
        className="flex-row items-center justify-center p-4 mt-4 rounded-full bg-[#1877f2]"
      >
        <Image
          source={require("@/assets/icons/facebook.png")}
          className="absolute left-6 h-7 w-7"
        />
        <Text className="text-white text-xl ml-3 font-medium">
          Continue with Facebook
        </Text>
      </TouchableOpacity>
    </View>
  );
}
