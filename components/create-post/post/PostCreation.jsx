"use client";
import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import RenderStep2 from "./RenderStep2";
import RenderStep3 from "./RenderStep3";
import { postSchema } from "@/lib/joi/postSchema";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import LoadingAnimation from "@/components/common/LoadingAnimation";
import { useSupabase } from "@/context/supabaseContext";
import { useUser } from "@clerk/clerk-expo";
import { useDish } from "@/context/dishContext";
import { useGlobal } from "@/context/globalContext";
import notifyFollowers from "@/utils/notification/notify_followers";
import { useUpload } from "@/context/upload-context";
import { uploadImages } from "@/utils/image-upload-compressed";

export default function PostCreation({ setPostType }) {
  const { supabase } = useSupabase();
  const { user } = useUser();

  const [isSharing, setIsSharing] = useState(false);
  const { selectedImages, setSelectedImages } = useGlobal();
  const { startUpload, updateProgress, completeUpload, setError } = useUpload();
  const [validationErrors, setValidationErrors] = useState({
    images: false,
    caption: false,
    location: false,
  });

  const {
    step,
    loading,
    peopleTags,
    hashtags,
    cuisineTags,
    postData,
    setStep,
    setLoading,
    setPeopleTags,
    setHashtags,
    setCuisineTags,
    setPostData,
    dietaryTags,
    setDietaryTags,
    extraTags,
    setExtraTags,
    resetDishState,
    clearCurrentDraft,
    deleteDraft,
    currentDraftId,
  } = useDish();

  const clearValidationError = (field) => {
    setValidationErrors((prev) => ({
      ...prev,
      [field]: false,
    }));
  };

  useEffect(() => {
    console.log("Handle Camera Images focus effect triggered.");
    try {
      const uniqueImages = [
        ...selectedImages,
        ...postData.images.filter(
          (img) => !selectedImages.some((selImg) => selImg === img)
        ),
      ];

      setPostData({
        ...postData,
        images: uniqueImages,
      });
      setSelectedImages([]);
    } catch (error) {
      console.error("Error updating images in useEffect:", error);
    }
  }, []);

  const handleSubmit = async () => {
    if (!supabase || !user?.id) {
      Alert.alert("Error", "Authentication or database service not available");
      return;
    }

    try {
      setLoading(true);

      const postPayload = {
        caption: postData.caption || "",
        dish_name: postData.caption || "",
        review: postData.review || "",
        images: postData.images || [],
        quote: postData.quote || false,
        location: postData.location || null,
        anonymous: postData.anonymous || false,
        people: peopleTags,
        hashtags: hashtags,
        cuisines: cuisineTags,
        dietary_tags: dietaryTags,
        info_tags: extraTags,
        rating: Number(postData.rating),
        user_id: user.id,
        amenities: postData.amenities || [],
        all_tags: [...hashtags, ...cuisineTags, ...dietaryTags, ...extraTags],
      };

      console.log("Post Payload:", postPayload);

      const { error: validationError } = postSchema.validate(postPayload, {
        abortEarly: false,
      });

      if (validationError) {
        Alert.alert(
          "Validation Error",
          validationError.details.map((err) => err.message).join("\n")
        );
        return;
      }

      // Upload images with compression and progress tracking
      let imageUrls = [];
      if (postData.images.length > 0) {
        imageUrls = await uploadImages(
          supabase,
          postData.images,
          user.id,
          (progress, message) => {
            updateProgress(progress * 0.8, message); // Use 80% for image upload
          }
        );

        if (imageUrls.length !== postData.images.length) {
          Alert.alert(
            "Partial Upload",
            `${imageUrls.length} of ${postData.images.length} images were uploaded. Continue?`,
            [
              { text: "Cancel", style: "cancel", onPress: () => { throw new Error("Upload cancelled by user."); } },
              { text: "Continue", style: "default" },
            ]
          );
        }
      }

      updateProgress(85, "Saving post data...");

      const finalPayload = {
        ...postPayload,
        images: imageUrls,
      };

      const { error: insertError } = await supabase
        .from("own_reviews")
        .insert([finalPayload]);

      if (insertError) throw insertError;

      updateProgress(95, "Notifying followers...");
      await notifyFollowers(supabase, user);

      updateProgress(98, "Cleaning up...");
      await clearCurrentDraft();
      await deleteDraft(currentDraftId);

      updateProgress(100, "Post created successfully!");

      Alert.alert("Success", "Post created successfully!");
      resetDishState();
      setPostType(null);
      router.push("/home");
    } catch (error) {
      console.error("Post creation failed:", error);
      setError(error.message || "Failed to create post");
      Alert.alert("Error", error.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const handleShareWithLoading = async () => {
    if (isSharing || loading) return;

    setIsSharing(true);
    startUpload("Preparing to share your post...");

    // Navigate immediately for better UX
    router.replace("/home");

    try {
      await handleSubmit();
      completeUpload();
    } catch (error) {
      console.error("Share error:", error);
      setError(error.message || "Failed to share. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

  const handleChange = (field, value) => {
    setPostData({ ...postData, [field]: value });
    if (field === "caption" && value && value.trim().length > 0) {
      clearValidationError("caption");
    }
    if (field === "location" && value && value.address) {
      clearValidationError("location");
    }
  };

  const nextStep = () => {
    setStep(2);
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    } else if (postData.quote) {
      resetDishState();
      setPostType(null);
      router.push("/favorites");
    } else {
      resetDishState();
      setPostType(null);
      Alert.alert(
        "Draft",
        "Do you want save this draft?",
        [
          {
            text: "Delete",
            onPress: async () => {
              await clearCurrentDraft();
              await deleteDraft(currentDraftId);
            },
            style: "cancel",
          },
          {
            text: "Save",
            onPress: () => {
              console.log("Permission granted");
            },
          },
        ],
        { cancelable: false }
      );
      router.push("/create-review");
    }
  };

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (loading) {
    return (
      <View className="absolute inset-0 bg-white bg-opacity-70 items-center justify-center">
        <LoadingAnimation size={170} />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="pb-4 px-6 mt-4 bg-white">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={prevStep}
            style={{
              padding: 8,
              borderRadius: 9999,
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>

          <Text className="text-gray-800 text-xl font-bold">
            {step === 1 ? "Add Details" : "Review & Share"}
          </Text>

          <Pressable
            onPress={step === 2 ? handleShareWithLoading : nextStep}
            disabled={step === 2 && (loading || isSharing)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 9999,
              backgroundColor:
                step === 2 && (loading || isSharing) ? "#9ca3af" : "#ff8d39",
              opacity: step === 2 && (loading || isSharing) ? 0.6 : 1,
            }}
          >
            <Text
              style={{
                fontWeight: "600",
                fontSize: 14,
                color: "#fff",
              }}
            >
              {step === 2
                ? loading
                  ? "Posting..."
                  : isSharing
                  ? "Sharing..."
                  : "Share"
                : "Next"}
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" className="flex-1">
        {step === 1 ? (
          <RenderStep2
            postData={postData}
            setPostData={setPostData}
            handleChange={handleChange}
            peopleTags={peopleTags}
            setPeopleTags={setPeopleTags}
            hashtags={hashtags}
            setHashtags={setHashtags}
            cuisineTags={cuisineTags}
            setCuisineTags={setCuisineTags}
            dietaryTags={dietaryTags}
            setDietaryTags={setDietaryTags}
            extraTags={extraTags}
            setExtraTags={setExtraTags}
            loading={loading}
            validationErrors={validationErrors}
          />
        ) : (
          <RenderStep3
            handleSubmit={handleSubmit}
            submission={{
              ...postData,
              allTags: [
                ...peopleTags,
                ...hashtags,
                ...cuisineTags,
                ...dietaryTags,
                ...extraTags,
              ],
            }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
