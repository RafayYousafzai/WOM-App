"use client";

import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import { useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { useUpload } from "@/context/upload-context";

const RenderStep3 = ({ handleSubmit, submission }) => {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { startUpload, updateProgress, completeUpload, setError } = useUpload();

  // Safe default for submission
  const safeSubmission = submission || {
    title: "",
    image: null,
    location: { latitude: 0, longitude: 0, address: "No address provided" },
    allTags: [],
    review: "",
    caption: "",
  };

  // Handle submission with background upload
  const handleSubmitWithLoading = async () => {
    if (isSubmitting) return; // Prevent multiple submissions

    setIsSubmitting(true);

    // Start upload state and navigate immediately
    startUpload("Posting your content...");
    router.replace("/home");

    try {
      // Create a wrapper function that updates progress
      const handleSubmitWithProgress = async () => {
        updateProgress(10, "Validating data...");

        // Add a small delay to show progress
        await new Promise((resolve) => setTimeout(resolve, 500));

        updateProgress(30, "Uploading images...");

        // Call the original handleSubmit function
        await handleSubmit();

        updateProgress(90, "Finalizing post...");
        await new Promise((resolve) => setTimeout(resolve, 500));

        updateProgress(100, "Post published successfully!");
        completeUpload();
      };

      await handleSubmitWithProgress();
    } catch (error) {
      console.error("Submission error:", error);
      setError(error.message || "Failed to post content. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle opening maps app with coordinates
  const openMaps = () => {
    const { latitude, longitude } = safeSubmission.location || {};
    const title = safeSubmission.caption || "Location";
    const url = Platform.select({
      ios: `maps:${latitude},${longitude}?q=${title}`,
      android: `geo:${latitude},${longitude}?q=${title}`,
    });
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open maps:", err)
    );
  };

  // Check if user exists and has a username
  const getUserInitial = () => {
    if (!user || !user.username) return "U";
    return user.username.charAt(0).toUpperCase();
  };

  const getUserName = () => {
    return user?.username || "User";
  };

  // Generate star rating display
  const renderRating = (rating) => {
    const stars = [];
    const safeRating = Number(rating) || 0;
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= safeRating ? "star" : "star-outline"}
          size={22}
          color={i <= safeRating ? "#FFD700" : "#BBBBBB"}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

  // Format price with $ symbols
  const getPriceCategory = (price) => {
    const numPrice = Number.parseInt(price) || 0;
    if (numPrice <= 50) return "$";
    if (numPrice <= 150) return "$$";
    if (numPrice <= 300) return "$$$";
    return "$$$$";
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView className="flex-1 bg-white">
        {/* Hero Image Section */}
        <View className="relative">
          <Image
            source={
              safeSubmission.images && safeSubmission.images.length > 0
                ? { uri: safeSubmission.images[0] }
                : require("@/assets/display/image10.jpg")
            }
            className="w-full h-72"
            style={{ resizeMode: "cover" }}
          />
          <View className="absolute inset-0 bg-black opacity-30" />
          <View className="absolute bottom-0 left-0 right-0 p-5">
            <Text className="text-white text-3xl font-bold">
              {safeSubmission.caption || "Untitled Post"}
            </Text>
            <View className="flex-row items-center mt-1 mb-8">
              <View className="flex-row mr-4">
                {renderRating(safeSubmission.rating)}
              </View>
              <Text className="text-white text-lg font-semibold">
                {getPriceCategory(safeSubmission.price)}
              </Text>
            </View>
          </View>
        </View>

        {/* Content Card */}
        <View className="bg-white rounded-t-3xl -mt-6 px-5 pt-6 pb-10">
          {/* Tags Section */}
          {safeSubmission.allTags?.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-5"
            >
              {safeSubmission.allTags.map((tag, index) => (
                <View
                  key={index}
                  className="bg-yellow-50 px-4 py-2 rounded-full mr-2 flex-row items-center"
                >
                  <Text className="text-yellow-500 ml-1 font-medium">
                    @{tag}
                  </Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View className="mb-5 py-2">
              <View className="bg-gray-100 px-4 py-2 rounded-full mr-2 flex-row items-center self-start">
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color="#9ca3af"
                />
                <Text className="text-gray-500 ml-1 font-medium">
                  No tags added
                </Text>
              </View>
            </View>
          )}

          {/* Location Card */}
          <View className="bg-gray-50 rounded-xl p-4 mb-5">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="bg-yellow-100 p-2 rounded-lg mr-3">
                  <Ionicons name="location" size={22} color="#f39f1e" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 font-bold text-lg">
                    Location
                  </Text>
                  <Text className="text-gray-600 pr-4">
                    {safeSubmission.location?.address || "No address provided"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={openMaps}
                className="bg-yellow-500 p-2 rounded-lg"
              >
                <Text className="text-white font-semibold">Map</Text>
              </TouchableOpacity>
            </View>

            {/* Mini Map Preview */}
            {safeSubmission.location?.latitude &&
            safeSubmission.location?.longitude ? (
              <TouchableOpacity onPress={openMaps} className="mt-3">
                <View className="h-32 rounded-lg overflow-hidden">
                  <MapView
                    style={{ height: "100%", width: "100%" }}
                    initialRegion={{
                      latitude: safeSubmission.location.latitude,
                      longitude: safeSubmission.location.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    scrollEnabled={false}
                    zoomEnabled={false}
                  >
                    <Marker
                      coordinate={{
                        latitude: safeSubmission.location.latitude,
                        longitude: safeSubmission.location.longitude,
                      }}
                      title={safeSubmission.title || "Location"}
                    />
                  </MapView>
                  <View className="absolute inset-0 flex items-center justify-center">
                    <View className="bg-white/80 px-3 py-1 rounded-full">
                      <Text className="text-blue-500 font-semibold">
                        Tap to open in Maps
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ) : (
              <View className="h-32 bg-gray-100 rounded-lg items-center justify-center mt-3">
                <Text className="text-gray-500">
                  No location data available
                </Text>
              </View>
            )}
          </View>

          {/* Review Section */}
          <View className="mb-6">
            <Text className="text-gray-800 font-bold text-xl mb-3">Review</Text>
            {safeSubmission.review ? (
              <View className="bg-gray-50 rounded-xl p-4">
                <Text className="text-gray-700">{safeSubmission.review}</Text>
                <View className="flex-row items-center mt-3">
                  <View className="h-8 w-8 rounded-full bg-blue-100 items-center justify-center">
                    <Text className="text-blue-500 font-bold">
                      {getUserInitial()}
                    </Text>
                  </View>
                  <Text className="text-gray-500 ml-2 font-medium">
                    {getUserName()}
                  </Text>
                </View>
              </View>
            ) : (
              <View className="bg-gray-100 rounded-xl p-4">
                <View className="flex-row items-center">
                  <Feather name="message-square" size={18} color="#9ca3af" />
                  <Text className="text-gray-500 font-medium ml-2">
                    No review provided
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          {/* <View className="mt-2 mb-20">
            <TouchableOpacity
              onPress={handleSubmitWithLoading}
              disabled={isSubmitting}
              className={`py-4 rounded-xl items-center flex-row justify-center ${
                isSubmitting ? "bg-gray-400" : "bg-yellow-500"
              }`}
              style={[
                styles.shadowButton,
                isSubmitting ? { opacity: 0.6 } : {},
              ]}
            >
              {isSubmitting && (
                <View className="mr-2">
                  <Ionicons name="hourglass" size={20} color="white" />
                </View>
              )}
              <Text className="text-white font-bold text-lg">
                {isSubmitting ? "Posting..." : "Post"}
              </Text>
            </TouchableOpacity>
          </View> */}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  shadowButton: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default RenderStep3;
