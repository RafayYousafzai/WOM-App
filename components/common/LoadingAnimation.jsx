import { View, Text, ActivityIndicator } from "react-native";
import React from "react";
import LottieView from "lottie-react-native";

export default function LoadingAnimation({ size = 300, msg = "Loading" }) {
  return (
    <View className="flex items-center justify-center">
      <LottieView
        autoPlay
        loop
        style={{
          width: size,
          height: size,
          backgroundColor: "transparent",
        }}
        source={require("../../assets/lottie/BurgerFolding.json")}
      />
      <ActivityIndicator style={{ marginLeft: 20 }} color={"#000"} />
    </View>
  );
}
