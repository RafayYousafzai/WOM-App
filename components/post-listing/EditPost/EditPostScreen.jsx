"use client";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSupabase } from "@/context/supabaseContext";
import { useUser } from "@clerk/clerk-expo";
import { Input, InputField, Textarea, TextareaInput } from "@/components/ui";
import GoogleTextInput from "@/components/common/GooglePlacesInput";
import { RatingStars } from "@/components/create-post/shared-components/rating-stars";
import LoadingAnimation from "@/components/common/LoadingAnimation";

export default function EditPostScreen() {
  const { supabase } = useSupabase();
  const { user } = useUser();
  const params = useLocalSearchParams();

  const [loading, setLoading] = useState(false);
  const [postData, setPostData] = useState({
    location: null,

    description: "",
  });

  const postId = params.postId;

  useEffect(() => {
    if (params.postData) {
      try {
        const originalPostData = JSON.parse(params.postData);
        setPostData({
          location: originalPostData.location,
          description: originalPostData.review || "",
        });
      } catch (error) {
        console.error("Error parsing post data:", error);
        Alert.alert("Error", "Failed to load post data");
      }
    }
  }, []);
  // Empty dependency array - only run once on mount

  const handleChange = (field, value) => {
    setPostData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!user?.id || !postId) {
      Alert.alert("Error", "Missing required information");
      return;
    }

    if (!postData.description.trim()) {
      Alert.alert("Error", "Description is required");
      return;
    }

    if (!postData.location) {
      Alert.alert("Error", "Location is required");
      return;
    }

    setLoading(true);
    try {
      // 1. Update post description
      const { error: postError } = await supabase
        .from("posts")
        .update({
          review: postData.description,
          updated_at: new Date().toISOString(),
        })
        .eq("id", postId)
        .eq("user_id", user.id);

      if (postError) throw postError;

      // 2. Update restaurant location
      if (params.postData) {
        const originalPostData = JSON.parse(params.postData);
        if (originalPostData.restaurant_id) {
          const { error: restaurantError } = await supabase
            .from("restaurants")
            .update({ location: postData.location })
            .eq("id", originalPostData.restaurant_id)
            .eq("user_id", user.id);

          if (restaurantError) throw restaurantError;
        }
      }

      Alert.alert("Success", "Post updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Failed to update post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      "Discard Changes",
      "Are you sure you want to discard your changes?",
      [
        {
          text: "Keep Editing",
          style: "cancel",
        },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => router.back(),
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <LoadingAnimation size={170} />
        <Text className="mt-4 text-gray-600">Updating post...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="pb-4 px-6 mt-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={handleCancel}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>

          <Text className="text-gray-800 text-xl font-bold">Edit Post</Text>

          <TouchableOpacity
            onPress={handleSave}
            className="px-4 py-2 rounded-full bg-blue-500"
            disabled={loading}
          >
            <Text className="font-semibold text-white">Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-4" keyboardShouldPersistTaps="handled">
          {/* Location */}
          <View className="mb-6">
            <Text className="text-base font-medium mb-2 text-gray-700">
              Location
            </Text>
            <GoogleTextInput
              containerStyle={{
                backgroundColor: "white",
                shadowColor: "#ccc",
              }}
              handlePress={(val) => handleChange("location", val)}
              initialLocation={postData.location}
              textInputBackgroundColor="#f9fafb"
            />
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-base font-medium mb-2 text-gray-700">
              Description
            </Text>
            <Textarea size="lg" className="bg-gray-50 rounded-3xl">
              <TextareaInput
                value={postData.description}
                onChangeText={(text) => handleChange("description", text)}
                placeholder="Share your experience..."
                multiline
                numberOfLines={4}
              />
            </Textarea>
          </View>

          {/* Info Note */}
          <View className="mb-8 p-4 bg-blue-50 rounded-xl">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#3b82f6" />
              <View className="ml-2 flex-1">
                <Text className="text-blue-800 font-medium">
                  Note about editing
                </Text>
                <Text className="text-blue-700 text-sm mt-1">
                  You can only edit the location, description, and other details
                  like images and tags cannot be modified.
                </Text>
              </View>
            </View>
          </View>

          <View className="h-20" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
