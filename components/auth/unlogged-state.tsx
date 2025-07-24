import React, { useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import LottieView from "lottie-react-native";
import { router } from "expo-router";
export default function VideoScreen({
  message = "Please log in to enjoy a personalized food experience and full access",
}) {
  const animation = useRef(null);

  return (
    <View style={styles.contentContainer}>
      <LottieView
        autoPlay
        ref={animation}
        style={{
          width: 380,
          height: 300,
          backgroundColor: "#fff",
        }}
        source={require("@/assets/lottie/FoodChoose.json")}
      />
        <TouchableOpacity onPress={()=>router.push("/(auth)/select-auth")}>
          <Text className="text-yellow-500 text-lg capitalize">Log In Now</Text>
        </TouchableOpacity>
      <Text className="text-center text-gray-900 text-3xl mt-4">{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 50,
    backgroundColor: "#fff",
  },
  video: {
    width: 350,
    height: 275,
  },
  controlsContainer: {
    padding: 10,
  },
});
