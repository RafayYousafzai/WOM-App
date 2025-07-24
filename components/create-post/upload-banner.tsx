"use client";

import type React from "react";
import { useEffect } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUpload } from "@/context/upload-context";

export const UploadBanner: React.FC = () => {
  const { uploadState, clearError } = useUpload();
  const slideAnim = new Animated.Value(-100);

  useEffect(() => {
    if (
      uploadState.isUploading ||
      uploadState.error ||
      uploadState.uploadMessage
    ) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [uploadState.isUploading, uploadState.error, uploadState.uploadMessage]);

  if (
    !uploadState.isUploading &&
    !uploadState.error &&
    !uploadState.uploadMessage
  ) {
    return null;
  }

  const getBannerColor = () => {
    if (uploadState.error) return "bg-red-500";
    if (uploadState.uploadProgress === 100) return "bg-green-500";
    return "bg-gray-400";
  };

  const getIcon = () => {
    if (uploadState.error) return "alert-circle";
    if (uploadState.uploadProgress === 100) return "checkmark-circle";
    return "cloud-upload";
  };

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
      }}
      className={`absolute top-0 left-0 right-0 z-50 ${getBannerColor()} px-4 py-2 rounded-full shadow-lg`}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <Ionicons name={getIcon()} size={18} color="white" />
          <View className="ml-3 flex-1">
            <Text className="text-white  font-semibold text-xs">
              {uploadState.error || uploadState.uploadMessage}
            </Text>
            {uploadState.isUploading && (
              <View className="mt-1">
                <View className="h-1 bg-white/30 rounded-full">
                  <View
                    className="h-full bg-white rounded-full"
                    style={{ width: `${uploadState.uploadProgress}%` }}
                  />
                </View>
                <Text className="text-white/80 text-xs mt-1">
                  {uploadState.uploadProgress}% complete
                </Text>
              </View>
            )}
          </View>
        </View>
        {uploadState.error && (
          <TouchableOpacity onPress={clearError} className="ml-2">
            <Ionicons name="close" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};
