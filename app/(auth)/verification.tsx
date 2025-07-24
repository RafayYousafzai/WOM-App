import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function VerificationScreen() {
  const [verificationCode, setVerificationCode] = useState(["", "", "", ""]);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...verificationCode];
    newCode[index] = text;
    setVerificationCode(newCode);

    if (text.length === 1 && index < verificationCode.length - 1) {
      // Move to the next input
      inputRefs.current[index + 1]?.focus();
    } else if (text.length === 0 && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const fullCode = verificationCode.join("");
    console.log("Verification code:", fullCode);
  };

  return (
    <SafeAreaView className="flex h-full items-center justify-between">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 ">
          <View className="w-full pt-16 px-6">
            <TouchableOpacity className="absolute top-10 left-5 z-10">
              <Feather name="arrow-left" size={24} color="black" />
            </TouchableOpacity>

            <Image
              source={require("../../assets/images/verify.png")}
              className="w-28 h-36"
            />

            <Text className="text-3xl font-bold text-black mb-1">
              Help us verify your login
            </Text>
            <Text className="text-lg font-semibold text-gray-500 mb-5 mt-1">
              We've send a verification code to +1 (555) 123-4567
            </Text>

            <Text className="text-lg font-semibold text-gray-500 mt-1 mb-2">
              Please enter the code below:
            </Text>
            <View className="flex-row justify-center mb-8">
              {verificationCode.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  value={digit}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  placeholder="-"
                  placeholderTextColor={"grey"}
                  keyboardType="numeric"
                  autoFocus={index === 0}
                  maxLength={1}
                  style={{
                    textAlign: "center",
                    fontSize: 24,
                    backgroundColor: "white",
                  }}
                  className="rounded-xl border border-gray-300 text-center p-5 w-[6rem] mx-1"
                />
              ))}
            </View>

            <TouchableOpacity
              className="flex-row items-center justify-center p-4 rounded-full bg-[#f39f1e]"
              onPress={handleVerify}
            >
              <Text className="text-white text-xl font-medium">Verify</Text>
            </TouchableOpacity>

            <View className="flex-row justify-center mt-5">
              <Text className="text-gray-600 mr-2">
                Didn't receive the code?
              </Text>
              <TouchableOpacity>
                <Text className="text-[#f39f1e] font-bold">Resend</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
