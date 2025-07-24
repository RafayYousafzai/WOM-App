import React, { useEffect, useState } from "react";
import {
  Text,
  Image,
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useAuthContext } from "@/context/authContext";
import { ArrowLeft } from "lucide-react-native";
import {
  Input,
  InputField,
  ButtonText,
  Button,
  Box,
  Heading,
  Icon,
} from "@/components/ui";
import VerificationCodeInput from "@/components/auth/verification";
import { SafeAreaView } from "react-native-safe-area-context";
import { useToast } from "react-native-toast-notifications";

const { height: screenHeight } = Dimensions.get("window");

export default function ResetPassword() {
  const {
    updateState,
    state,
    sendEmailPasswordResetCode,
    confirmEmailPasswordResetCode,
  } = useAuthContext();
  const toast = useToast();

  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (state.status === "confirmEmailPasswordResetCode") {
      setModalVisible(true);
    } else {
      setModalVisible(false);
    }
  }, [state.status]);

  if (modalVisible) {
    const handleConfirmResetCode = async (code) => {
      try {
        await updateState("resetPasswordCode", code);
        await confirmEmailPasswordResetCode(code);
      } catch (err) {
        console.error("Failed to confirm reset code:", err);
        toast.show("Failed to confirm reset code. Please try again.", {
          type: "warning",
        });
      }
    };

    const handlePhone = async (fullCode) => {
      await updateState("resetPasswordCode", fullCode);

      if (state.resetPasswordCode.length === 6) {
        handleConfirmResetCode();
      }
    };

    return (
      <View style={styles.fullScreenContainer}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            style={styles.scrollView}
          >
            <View style={styles.contentContainer}>
              <Button
                variant="link"
                onPress={() => setModalVisible(false)}
                className="self-start mb-8 bg-white w-14 h-14 rounded-full"
              >
                <Icon as={ArrowLeft} size="sm" className="text-gray-600" />
              </Button>

              <Image
                source={require("../../assets/images/phone.png")}
                className="w-24 h-24 mt-20"
              />

              <View className="space-y-2 mb-6">
                <Heading className="text-2xl font-bold text-gray-900">
                  Reset Password
                </Heading>
                <Text className="text-gray-600">
                  We've sent a verification code to your email.
                </Text>
              </View>
              {/* New Password Field */}
              <Box>
                <Text className="text-sm text-gray-600 mb-1">New Password</Text>
                <Input
                  size="lg"
                  className="bg-transparent border border-gray-200 rounded-full"
                >
                  <InputField
                    autoCapitalize="none"
                    value={state.password}
                    placeholder="Enter your new password"
                    onChangeText={(value) => updateState("password", value)}
                    secureTextEntry={true}
                    className="h-14 text-black"
                  />
                </Input>
                <Text className="text-sm text-gray-600 mb-1">
                  Confirm Password
                </Text>
                <Input
                  size="lg"
                  className="bg-transparent border border-gray-200 rounded-full my-2"
                >
                  <InputField
                    autoCapitalize="none"
                    value={state.confirmPassword}
                    placeholder="Confirm password"
                    onChangeText={(value) =>
                      updateState("confirmPassword", value)
                    }
                    secureTextEntry={true}
                    className="h-14 text-black"
                  />
                </Input>
              </Box>
              <View className="space-y-6">
                <View className="">
                  <Text className="text-sm text-gray-600 mb-1">
                    Verification Code
                  </Text>
                  <VerificationCodeInput length={6} onVerify={handlePhone} />
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 justify-center items-center p-4 bg-white">
      <View className="w-full px-4">
        <Heading className="text-2xl font-bold text-gray-900 mb-4">
          Reset Password
        </Heading>
        <Text className="text-gray-600 mb-6">
          Enter your email to receive a password reset code.
        </Text>

        <Box>
          <Text className="text-sm text-gray-600 mb-1">Email Address</Text>
          <Input
            size="lg"
            className="bg-transparent border border-gray-200 rounded-full"
          >
            <InputField
              autoCapitalize="none"
              value={state.emailAddress}
              placeholder="Enter your email"
              onChangeText={(value) => updateState("emailAddress", value)}
              className="h-14 text-black"
              keyboardType="email-address"
            />
          </Input>
        </Box>

        <Button
          onPress={sendEmailPasswordResetCode}
          size="lg"
          className="bg-[#f39f1e] mt-6 text-white rounded-full h-14"
        >
          <ButtonText className="text-white">Send Reset Code</ButtonText>
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    height: screenHeight,
    backgroundColor: "#fff", // bg-red-700 equivalent
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: screenHeight,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 48,
  },
});
