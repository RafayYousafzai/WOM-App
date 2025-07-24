import {
  View,
  Text,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";

import { router } from "expo-router";
// import FacebookOAuth from "@/components/auth/facebookAuth";
import GoogleAuth from "@/components/auth/googleAuth";
import AppleOAuthButton from "@/components/auth/appleAuth";
import { useAuthContext } from "@/context/authContext";
import { useEffect } from "react";

export default function SignInScreen() {
  const { updateState } = useAuthContext();

  useEffect(() => {
    setTimeout(() => {
      updateState("phoneNumber", "");
    }, 100);
  }, []);

  const { height } = Dimensions.get("window");

  return (
    <View className="flex-1 bg-[#f9af1a]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            bounces={false}
          >
            <View className="flex-1 items-center">
              <View
                className="w-full items-center justify-center"
                style={{ height: height * 0.5 }}
              >
                <Image
                  source={require("../../assets/images/Icon.png")}
                  className="w-3/4"
                  style={{ maxHeight: height * 0.25 }}
                  resizeMode="contain"
                />
              </View>

              <View
                className="w-full bg-white/90 rounded-t-3xl px-5 pt-6 pb-8 shadow-lg"
                style={{ minHeight: Math.max(height * 0.65, 400) }}
              >
                <Text className="text-3xl font-extrabold text-black mb-1 text-left">
                  Sign up or log in
                </Text>
                <Text className="text-base font-bold  text-gray-500 mb-5 mt-1 text-left">
                  Select your preferred method to continue
                </Text>

                <GoogleAuth />
                <AppleOAuthButton />

                <View className="flex-row items-center my-3">
                  <View className="flex-1 h-px bg-gray-300" />
                  <Text className="mx-4 text-gray-500 font-medium">OR</Text>
                  <View className="flex-1 h-px bg-gray-300" />
                </View>

                <TouchableOpacity
                  className="flex-row items-center justify-center p-3 md:p-4 rounded-full bg-[#f39f1e]"
                  onPress={() => {
                    router.push("/(auth)/sign-in");
                  }}
                >
                  <Image
                    source={require("../../assets/icons/email.png")}
                    className="absolute left-6 h-6 w-6 md:h-7 md:w-7"
                  />
                  <Text className="text-white text-lg md:text-xl font-medium">
                    Continue with email or phone
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push("home")}
                  className="flex-row items-center mt-3 justify-center p-3 md:p-4 rounded-full border border-gray-400 bg-white"
                >
                  <Image
                    source={require("../../assets/icons/user.png")}
                    className="absolute left-6 h-5 w-5 md:h-6 md:w-6"
                  />
                  <Text className="text-gray-500 text-lg md:text-xl font-medium">
                    Continue with Guest
                  </Text>
                </TouchableOpacity>

                <Text className="text-center text-black text-xs md:text-sm px-3 mt-6">
                  By continuing, you agree to our{" "}
                  <Text
                    className="underline text-blue-600"
                    onPress={() => router.push("/eula")}
                  >
                    End User License Agreement (EULA)
                  </Text>{" "}
                  and{" "}
                  <Text
                    className="underline text-blue-600"
                    onPress={() => router.push("/term-policy")}
                  >
                    Privacy Policy
                  </Text>
                  . Objectionable or abusive content is not tolerated and may
                  result in a ban.
                </Text>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}
