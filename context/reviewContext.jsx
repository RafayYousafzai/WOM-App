import React, { createContext, useContext, useState, useEffect } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";

// Contexts & Hooks
import { useSupabase } from "@/context/supabaseContext";
import { useUpload } from "@/context/upload-context";
import { useUser } from "@clerk/clerk-expo";

// Utils & Libs
import { handleReviewSubmit } from "@/lib/supabase/post";
import { uploadDishImages } from "@/lib/supabase/imageUploads";
import { postSchema } from "@/lib/yup/reviewValidationSchema";
import notifyFollowers from "@/utils/notification/notify_followers";
import notifyPeoples from "@/utils/notification/notify_peoples";

// -------------------- Context Setup -------------------- //
const ReviewContext = createContext();
export const useReview = () => useContext(ReviewContext);

// -------------------- Constants -------------------- //
const ALL_REVIEW_DRAFTS_KEY = "all_review_drafts";

const dishTypesInit = [
  {
    id: "main-course",
    name: "Main Course",
    dishName: "",
    recommendDish: false,
    price: "",
    rating: 0,
    images: [],
  },
];

const postStateInit = {
  dishTypes: dishTypesInit,
  id: null,
  location: null,
  rating: 0,
  review: "",
  images: [],
  is_review: null,
  anonymous: false,
  cuisineTags: [],
  amenityTags: [],
  dietaryTags: [],
  peoplesTags: [],
  drafts: [],
};

const initialTags = { cuisine: [], amenity: [], dietary: [] };

// -------------------- Provider -------------------- //
export const ReviewProvider = ({ children }) => {
  const { supabase } = useSupabase();
  const { user } = useUser();
  const {
    startUpload,
    updateProgress,
    completeUpload,
    setError,
    uploadProgress,
    isUploading,
  } = useUpload();

  // UI States
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("main-course");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Review States
  const [reviewData, setReviewData] = useState(postStateInit);
  const [tags, setTags] = useState(initialTags);
  const [currentDraftId, setCurrentDraftId] = useState(null);

  // -------------------- Data Fetch -------------------- //
  async function fetchAllTags() {
    let { data: tags, error } = await supabase
      .from("tags")
      .select("id, name, type");

    if (error) {
      console.error("Error fetching tags:", error);
      throw error;
    }

    setTags({
      cuisine: tags.filter((tag) => tag.type === "cuisine"),
      amenity: tags.filter((tag) => tag.type === "amenity"),
      dietary: tags.filter((tag) => tag.type === "dietary"),
    });

    return tags;
  }

  useEffect(() => {
    fetchAllTags();
  }, []);

  // -------------------- Step Controls -------------------- //
  const nextStep = () => step < 3 && setStep(step + 1);
  const prevStep = () => {
    if (step > 1) setStep(step - 1);
    else setReviewData((prev) => ({ ...prev, is_review: null }));
  };

  // -------------------- Handlers -------------------- //
  const handleChange = (field, value) => {
    setReviewData((prev) => ({ ...prev, [field]: value }));
  };

  const setTagsWrapper = (key) => (data) =>
    setReviewData((prev) => ({ ...prev, [key]: data }));

  const handleAddDishType = (type) => {
    const newDish = { ...dishTypesInit[0], ...type };
    handleChange("dishTypes", [...reviewData.dishTypes, newDish]);
    setActiveTab(type.id);
    setShowModal(false);
  };

  const handleRemoveTab = (tabId) => {
    handleChange(
      "dishTypes",
      reviewData.dishTypes.filter((dish) => dish.id !== tabId)
    );
    if (activeTab === tabId) setActiveTab("main-course");
  };

  const handleDishChange = (field, value) => {
    handleChange(
      "dishTypes",
      reviewData.dishTypes.map((dish) =>
        dish.id === activeTab ? { ...dish, [field]: value } : dish
      )
    );
  };

  const handleDishImagesChange = (images) => {
    const safeImages = Array.isArray(images)
      ? images
      : [images].filter(Boolean);
    handleChange(
      "dishTypes",
      reviewData.dishTypes.map((dish) =>
        dish.id === activeTab ? { ...dish, images: safeImages } : dish
      )
    );
  };

  const getCurrentDish = () => {
    const dish =
      reviewData.dishTypes.find((dish) => dish.id === activeTab) ||
      dishTypesInit[0];
    return { ...dish, images: Array.isArray(dish.images) ? dish.images : [] };
  };

  // main component file
  const handleShare = async () => {
    console.log("Preparing to share review...");
    startUpload("Submitting review...");

    const peoplesFullDetails = reviewData?.peoplesTags || [];

    // --- 1. Prepare and Validate Data ---
    let postData = {
      ...reviewData,
      is_review: reviewData.is_review === "restaurant" ? true : false,
      cuisineTags: reviewData.cuisineTags.map((tag) => tag.id),
      amenityTags: reviewData.amenityTags.map((tag) => tag.id),
      dietaryTags: reviewData.dietaryTags.map((tag) => tag.id),
      peoplesTags: reviewData.peoplesTags.map((tag) => tag.username),
    };

    try {
      await postSchema.validate(postData, { abortEarly: false });
      console.log("Validation passed ✅");
    } catch (err) {
      Alert.alert("Validation Error", (err.errors || []).join("\n"));
      setError("Validation failed");
      completeUpload();
      return;
    }

    // --- 2. Upload Dish Images ---
    let updatedDishTypes = [];
    try {
      if (postData.dishTypes?.length > 0) {
        updatedDishTypes = await uploadDishImages(
          postData.dishTypes,
          user,
          supabase,
          updateProgress
        );
      }
    } catch (err) {
      console.error("Dish image upload failed ❌", err);
      Alert.alert("Upload Error", err.message);
      setError("Image upload failed");
      completeUpload();
      return;
    }

    // --- 3. Submit Review ---
    try {
      const finalPostData = { ...postData, dishTypes: updatedDishTypes };
      await handleReviewSubmit({
        reviewData: finalPostData,
        user,
        supabase,
        setLoading,
        onSuccess: () => {
          completeUpload();
          setReviewData(postStateInit);
          setStep(1);
          router.push("/(root)/posts");
        },
        onError: (error) => {
          setError("Failed to submit review");
          console.error("❌ Failed to submit review:", error);
        },
      });
    } catch (err) {
      console.error("Unexpected error while sharing review:", err);
      setError(err.message || "Unexpected error");
      completeUpload();
    }

    // --- 4. Notify ---
    try {
      await notifyFollowers(supabase, user);
      await notifyPeoples(user, peoplesFullDetails);
      updateProgress(100, "Completed");
    } catch (error) {
      console.error("Notification error:", error);
    }
  };
  // -------------------- Context Value -------------------- //
  return (
    <ReviewContext.Provider
      value={{
        // States
        step,
        loading,
        reviewData,
        currentDraftId,
        uploadProgress,
        isUploading,
        activeTab,
        showModal,
        tags,

        // State setters
        setStep,
        setLoading,
        setReviewData,
        setCurrentDraftId,
        setActiveTab,
        setShowModal,

        // Controls
        nextStep,
        prevStep,

        // Review Handlers
        handleChange,
        handleShare,
        setTagsWrapper,

        // Dish Handlers
        handleAddDishType,
        handleRemoveTab,
        handleDishChange,
        handleDishImagesChange,
        getCurrentDish,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
};
