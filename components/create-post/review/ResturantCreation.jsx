"use client";
import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native-safe-area-context";
import UnloggedState from "@/components/auth/unlogged-state";
import LoadingAnimation from "@/components/common/LoadingAnimation";
import { router } from "expo-router";
import { useSupabase } from "@/context/supabaseContext";
import { useReview } from "@/context/reviewContext";
import { useGlobal } from "@/context/globalContext";
import { Step1ImageSelection } from "../dummyUI/Step1ImageSelection";
import { Step2DetailsInput } from "./Step2DetailsInput";
import { Step3 } from "./Step3";
import { restaurantSchema } from "@/lib/joi/restaurantSchema";
import notifyFollowers from "@/utils/notification/notify_followers";
import { useUpload } from "@/context/upload-context";
import { uploadImages } from "@/utils/image-upload-compressed";
import notifyPeoples from "@/utils/notification/notify_peoples";

export default function RestaurantCreation({ setPostType }) {
  const { supabase } = useSupabase();
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  const [isSharing, setIsSharing] = useState(false);
  const { selectedImages, setSelectedImages } = useGlobal();
  const { startUpload, updateProgress, completeUpload, setError } = useUpload();

  const {
    step,
    loading,
    uploadProgress,
    peoplesTags,
    cuisineTags,
    amenityTags,
    restaurantData,
    setStep,
    setLoading,
    setUploadProgress,
    setPeoplesTags,
    setCuisineTags,
    setAmenityTags,
    setRestaurantData,
    dietaryTags,
    setDietaryTags,
    resetReviewState,
    extraTags,
    setExtraTags,
    deleteDraft,
    currentDraftId,
    clearCurrentDraft,
  } = useReview();

  useEffect(() => {
    console.log("Handle Camera Images focus effect triggered.");
    try {
      const uniqueImages = [
        ...selectedImages,
        ...restaurantData.images.filter(
          (img) => !selectedImages.some((selImg) => selImg === img)
        ),
      ];
      setRestaurantData({
        ...restaurantData,
        images: uniqueImages,
      });
      setSelectedImages([]);
    } catch (error) {
      console.error("Error updating images in useEffect:", error);
    }
  }, []);

  const handleChange = (field, value) => {
    setRestaurantData({ ...restaurantData, [field]: value });
  };

  const removeImage = (index) => {
    const updatedImages = [...restaurantData.images];
    updatedImages.splice(index, 1);
    handleChange("images", updatedImages);
  };

  const handleSubmit = async () => {
    if (!supabase || !user?.id) {
      Alert.alert("Error", "Authentication or database service not available");
      return;
    }

    try {
      setLoading(true);

      // Prepare submission data
      const submission = {
        ...restaurantData,
        cuisines: cuisineTags,
        amenities: amenityTags,
        peoples: peoplesTags,
        dietary: dietaryTags,
        extra: extraTags,
        user_id: user.id,
        created_at: new Date().toISOString(),
      };

      // Validate data
      const { error: validationError } = restaurantSchema.validate(submission, {
        abortEarly: false,
        allowUnknown: true,
      });

      if (validationError) {
        Alert.alert(
          "Validation Error",
          validationError.details.map((err) => err.message).join("\n")
        );
        return;
      }

      let imageUrls = [];
      if (restaurantData.images.length > 0) {
        imageUrls = await uploadImages(
          supabase,
          restaurantData.images,
          user.id,
          (progress, message) => {
            updateProgress(progress * 0.8, message);
          }
        );

        if (imageUrls.length !== restaurantData.images.length) {
          Alert.alert(
            "Partial Upload",
            `${imageUrls.length} of ${restaurantData.images.length} images were uploaded. Continue?`,
            [
              {
                text: "Cancel",
                style: "cancel",
                onPress: () => {
                  throw new Error("Upload cancelled by user.");
                },
              },
              { text: "Continue", style: "default" },
            ]
          );
        }
      }

      setUploadProgress(85);
      updateProgress(85, "Saving restaurant review...");

      // Prepare database payload
      const reviewPayload = {
        dish_name: submission.dishName,
        restaurant_name: submission.restaurantName,
        review: submission.review,
        recommend_dsh: submission.recommendDish,
        price: Number(submission.price),
        rating: Number(submission.rating),
        images: imageUrls,
        location: submission.location,
        user_id: user.id,
        quote: submission.quote,
        anonymous: submission.anonymous || false,
        amenities: submission.amenities,
        cuisines: submission.cuisines,
        people: submission.peoples,
        info_tags: submission.extra,
        dietary_tags: submission.dietary,
        all_tags: [
          ...(submission.cuisines || []),
          ...(submission.amenities || []),
          ...(submission.extra || []),
          ...(submission.dietary || []),
        ],
      };

      setUploadProgress(90);
      updateProgress(90, "Inserting review data...");

      // Insert review
      const { error: insertError, data: insertedReview } = await supabase
        .from("reviews")
        .insert([reviewPayload])
        .select()
        .single();

      if (insertError) throw insertError;

      setUploadProgress(95);
      updateProgress(95, "Notifying followers...");

      // Notify followers
      await notifyFollowers(supabase, user, insertedReview.id);
      await notifyPeoples(user, submission.peoples);

      setUploadProgress(98);
      updateProgress(98, "Cleaning up...");

      // Clean up drafts
      await Promise.all([
        clearCurrentDraft(),
        currentDraftId ? deleteDraft(currentDraftId) : Promise.resolve(),
      ]);

      setUploadProgress(100);
      updateProgress(100, "Restaurant review posted successfully!");

      // Success flow
      Alert.alert("Success", "Restaurant review posted successfully!");
      resetReviewState();
      setPostType(null);
      router.replace("/home");
    } catch (error) {
      console.error("Submission error:", error);
      setError(error.message || "Failed to submit review. Please try again.");
      Alert.alert(
        "Error",
        error.message || "Failed to submit review. Please try again."
      );
    } finally {
      setTimeout(() => {
        setLoading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const handleShareWithLoading = async () => {
    if (isSharing || loading) return;

    setIsSharing(true);
    startUpload("Preparing to share your restaurant review...");

    // Navigate immediately for better UX
    router.replace("/home");

    try {
      const handleShareWithProgress = async () => {
        updateProgress(5, "Preparing restaurant review...");
        await new Promise((resolve) => setTimeout(resolve, 300));

        updateProgress(10, "Processing images and content...");
        await handleSubmit();

        updateProgress(100, "Restaurant review shared successfully!");
        completeUpload();
      };

      await handleShareWithProgress();
    } catch (error) {
      console.error("Share error:", error);
      setError(
        error.message || "Failed to share restaurant review. Please try again."
      );
    } finally {
      setIsSharing(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && restaurantData.images.length === 0) {
      Alert.alert("Images required", "Please add at least one image");
      return;
    }
    if (step === 2) {
      // Validate Step 2 fields
      if (!restaurantData.review || restaurantData.review.trim() === "") {
        Alert.alert(
          "Review required",
          "Please provide a review for the restaurant"
        );
        return;
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    } else if (restaurantData.quote) {
      resetReviewState();
      setPostType(null);
      router.push("/favorites");
    } else {
      resetReviewState();
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
            onPress: () => {},
          },
        ],
        { cancelable: false }
      );
      router.push("/create-review");
    }
  };

  if (!isSignedIn) return <UnloggedState />;

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500">Loading user data...</Text>
      </View>
    );
  }

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

        {/* Enhanced Progress Bar */}
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
          <Step1ImageSelection
            restaurantData={restaurantData}
            setRestaurantData={setRestaurantData}
            handleChange={handleChange}
            removeImage={removeImage}
          />
        ) : step === 2 ? (
          <Step2DetailsInput
            restaurantData={restaurantData}
            setRestaurantData={setRestaurantData}
            handleChange={handleChange}
            cuisineTags={cuisineTags}
            setCuisineTags={setCuisineTags}
            amenityTags={amenityTags}
            setAmenityTags={setAmenityTags}
            dietaryTags={dietaryTags}
            setDietaryTags={setDietaryTags}
            extraTags={extraTags}
            setExtraTags={setExtraTags}
            peoplesTags={peoplesTags}
            setPeoplesTags={setPeoplesTags}
          />
        ) : (
          <Step3
            handleSubmit={handleSubmit}
            submission={{
              ...restaurantData,
              allTags: [
                ...(cuisineTags || []),
                ...(dietaryTags || []),
                ...(amenityTags || []),
                ...(extraTags || []),
              ].filter(Boolean),
            }}
            handleChange={handleChange}
          />
        )}
      </View>

      {/* Loading Overlay */}
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
    </SafeAreaView>
  );
}
