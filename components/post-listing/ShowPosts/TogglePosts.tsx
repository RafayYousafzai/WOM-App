"use client";

import type React from "react";
import { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";

interface TogglePostsProps {
  activeTab: "following" | "forYou";
  onTabChange: (tab: "following" | "forYou") => void;
}

export const TogglePosts: React.FC<TogglePostsProps> = ({
  activeTab,
  onTabChange,
}) => {
  const slideAnimation = useRef(
    new Animated.Value(activeTab === "following" ? 0 : 1)
  ).current;

  useEffect(() => {
    Animated.spring(slideAnimation, {
      toValue: activeTab === "following" ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, [activeTab, slideAnimation]);

  const translateX = slideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Dimensions.get("window").width / 2 - 10], // Account for padding
  });

  return (
    <View className="px-4 py-2">
      <View className="relative flex-row bg-gray-100 rounded-full h-14 p-1">
        {/* Animated slider */}
        <Animated.View
          className="absolute bg-[#f39f1e] rounded-full h-12 shadow-sm"
          style={{
            width: "48%",
            transform: [{ translateX }],
            top: 4,
            left: 4,
          }}
        />

        {/* Following Tab */}
        <TouchableOpacity
          className="flex-1 justify-center items-center z-10"
          onPress={() => onTabChange("following")}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <Text
              className={`ml-2 font-semibold ${
                activeTab === "following" ? "text-white" : "text-gray-500"
              }`}
            >
              Following
            </Text>
          </View>
        </TouchableOpacity>

        {/* For You Tab */}
        <TouchableOpacity
          className="flex-1 justify-center items-center z-10"
          onPress={() => onTabChange("forYou")}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <Text
              className={`ml-2 font-semibold ${
                activeTab === "forYou" ? "text-white" : "text-gray-500"
              }`}
            >
              For You
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};
