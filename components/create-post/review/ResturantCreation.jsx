"use client";
import { View, Text, TouchableOpacity, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useReview } from "@/context/reviewContext";
import LoadingAnimation from "@/components/common/LoadingAnimation";
import UnloggedState from "@/components/auth/unlogged-state";
import { Step1ImageSelection } from "./Step1ImageSelection";
import { Step2DetailsInput } from "./Step2DetailsInput";
import { Step3Summary } from "./Step3Summary";

export default function RestaurantCreation() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const {
    step,
    loading,
    isSharing,
    uploadProgress,
    nextStep,
    prevStep,
    handleShare,
    handleSaveDraft,
  } = useReview();

  if (!isSignedIn) return <UnloggedState />;

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500">Loading user data...</Text>
      </View>
    );
  }

  const handleShareWithLoading = () => {
    Alert.alert("Share Review", "Are you sure you want to share this review?", [
      { text: "Cancel", style: "cancel" },
      { text: "Share", onPress: handleShare },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="pb-4 px-6 mt-4 bg-white">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={prevStep}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-gray-800 text-xl font-bold">
            {step === 1
              ? "Add Images"
              : step === 2
              ? "Add Details"
              : "Review & Share"}
          </Text>
          <Pressable
            onPress={() => {
              step < 3 ? nextStep() : handleShareWithLoading();
            }}
            className={`px-4 py-2 rounded-full ${
              step === 3 && (loading || isSharing)
                ? "bg-gray-400"
                : "bg-yellow-400"
            }`}
            disabled={step === 3 && (loading || isSharing)}
          >
            <View className="flex-row items-center">
              {isSharing && (
                <Ionicons
                  name="hourglass"
                  size={16}
                  color="white"
                  style={{ marginRight: 4 }}
                />
              )}
              <Text className="font-semibold text-white">
                {step < 3
                  ? "Next"
                  : loading
                  ? "Posting..."
                  : isSharing
                  ? "Sharing..."
                  : "Share"}
              </Text>
            </View>
          </Pressable>
        </View>

        {(loading || isSharing) && uploadProgress > 0 && (
          <View className="mt-3">
            <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <View
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </View>
            <Text className="text-xs text-gray-600 mt-1 text-center">
              {isSharing
                ? "Sharing restaurant review..."
                : "Processing and uploading..."}{" "}
              {Math.round(uploadProgress)}%
            </Text>
          </View>
        )}
      </View>

      <View className="flex-1">
        {step === 1 ? (
          <Step1ImageSelection />
        ) : step === 2 ? (
          <Step2DetailsInput />
        ) : (
          <Step3Summary />
        )}
      </View>

      {(loading || isSharing) && !uploadProgress && (
        <View className="absolute inset-0 bg-white bg-opacity-80 items-center justify-center">
          <LoadingAnimation size={170} />
          <Text className="mt-4 text-gray-600 font-medium">
            {isSharing
              ? "Sharing your restaurant review..."
              : "Processing your review..."}
          </Text>
        </View>
      )}
      <TouchableOpacity
        onPress={handleSaveDraft}
        className="absolute bottom-32 right-10 bg-blue-500 p-4 rounded-full"
      >
        <Ionicons name="save" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
