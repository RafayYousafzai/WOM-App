import { View, Text, TouchableOpacity, Pressable, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useReview } from "@/context/reviewContext";
import { useFocusEffect } from "expo-router";
import { useGlobal } from "@/context/globalContext";

import LoadingAnimation from "@/components/common/LoadingAnimation";
import UnloggedState from "@/components/auth/unlogged-state";
import { Step1ImageSelection } from "./Step1ImageSelection";
import { Step2DetailsInput } from "./Step2DetailsInput";
import { Step3Summary } from "./Step3Summary";
import { useState } from "react";

export default function RestaurantCreation() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  const {
    step,
    loading,
    uploadProgress,
    nextStep,
    prevStep,
    handleShare,
    handleDishImagesChange,
    getCurrentDish,
  } = useReview();

  const { selectedImages, setSelectedImages } = useGlobal();

  // Handle images passed from global context
  useFocusEffect(() => {
    if (selectedImages.length > 0) {
      const currentDish = getCurrentDish();
      handleDishImagesChange([...currentDish.images, ...selectedImages]);
      setSelectedImages([]);
    }
  });

  if (!isSignedIn) return <UnloggedState />;

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500">Loading user data...</Text>
      </View>
    );
  }

  // Helpers
  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Add Images";
      case 2:
        return "Add Details";
      default:
        return "Share";
    }
  };

  const getActionLabel = () => {
    if (step < 3) return "Next";
    return loading ? "Posting..." : "Share";
  };

  const handleNextOrShare = () => {
    step < 3 ? nextStep() : handleShare();
  };

  // UI blocks
  const renderProgressBar = () => {
    if (!loading || uploadProgress <= 0) return null;
    return (
      <View className="mt-3">
        <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <View
            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </View>
        <Text className="text-xs text-gray-600 mt-1 text-center">
          Processing and uploading... {Math.round(uploadProgress)}%
        </Text>
      </View>
    );
  };

  const renderLoadingOverlay = () => {
    if (!(loading && !uploadProgress)) return null;
    return (
      <View className="absolute inset-0 bg-white bg-opacity-80 items-center justify-center">
        <LoadingAnimation size={170} />
        <Text className="mt-4 text-gray-600 font-medium">
          Processing your review...
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="pb-4 px-6 mt-4 bg-white">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={prevStep}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>

          <Text
            className="text-gray-800 text-xl font-bold "
            style={{ marginLeft: 40 }}
          >
            {getStepTitle()}
          </Text>

          <View className="flex-row items-center">
            <Pressable
              onPress={handleNextOrShare}
              className={`px-4 py-2 rounded-full ${
                step === 3 && loading ? "bg-gray-400" : "bg-yellow-400"
              }`}
              disabled={step === 3 && loading}
            >
              <View className="flex-row items-center">
                {loading && (
                  <Ionicons
                    name="hourglass"
                    size={16}
                    color="white"
                    style={{ marginRight: 4 }}
                  />
                )}
                <Text className="font-semibold text-white">
                  {getActionLabel()}
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        {renderProgressBar()}
      </View>

      {/* Content */}
      <View className="flex-1">
        {step === 1 ? (
          <Step1ImageSelection />
        ) : step === 2 ? (
          <Step2DetailsInput />
        ) : (
          <Step3Summary />
        )}
      </View>

      {renderLoadingOverlay()}
    </SafeAreaView>
  );
}
