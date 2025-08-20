import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { save, getValueFor, remove } from "@/lib/SecureStore/SecureStore";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useSupabase } from "@/context/supabaseContext";
import { useUpload } from "@/context/upload-context";
import notifyFollowers from "@/utils/notification/notify_followers";
import notifyPeoples from "@/utils/notification/notify_peoples";
import { Alert } from "react-native";
import { router } from "expo-router";
import { reviewSchema } from "@/lib/yup/reviewValidationSchema";

import { handleReviewSubmit } from "@/lib/supabase/post";

const ReviewContext = createContext();

export const useReview = () => useContext(ReviewContext);

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

export const ReviewProvider = ({ children }) => {
  const { uploadProgress, isUploading, startUpload } = useUpload();
  const [showModal, setShowModal] = useState(false);

  const [activeTab, setActiveTab] = useState("main-course");
  const [reviewData, setReviewData] = useState(postStateInit);
  const [currentDraftId, setCurrentDraftId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { supabase } = useSupabase();
  const { user } = useUser();

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      setReviewData((prev) => ({ ...prev, is_review: null }));
    }
  };

  const handleChange = (field, value) => {
    setReviewData((prev) => ({ ...prev, [field]: value }));
  };

  const setTagsWrapper = (key) => (data) => {
    setReviewData((prev) => ({
      ...prev,
      [key]: data,
    }));
  };

  const handleAddDishType = (type) => {
    const newDish = {
      ...dishTypesInit[0],
      ...type,
    };

    const newDishTypes = [...reviewData.dishTypes, newDish];
    handleChange("dishTypes", newDishTypes);
    setActiveTab(type.id);
    setShowModal(false);
  };

  const handleRemoveTab = (tabId) => {
    const newDishTypes = reviewData.dishTypes.filter(
      (dish) => dish.id !== tabId
    );
    handleChange("dishTypes", newDishTypes);
    if (activeTab === tabId) {
      setActiveTab("main-course");
    }
  };

  const handleDishChange = (field, value) => {
    const newDishTypes = reviewData.dishTypes.map((dish) =>
      dish.id === activeTab ? { ...dish, [field]: value } : dish
    );
    handleChange("dishTypes", newDishTypes);
  };

  const handleDishImagesChange = (images) => {
    const safeImages = Array.isArray(images)
      ? images
      : [images].filter(Boolean);
    const newDishTypes = reviewData.dishTypes.map((dish) =>
      dish.id === activeTab ? { ...dish, images: safeImages } : dish
    );
    handleChange("dishTypes", newDishTypes);
  };

  const getCurrentDish = () => {
    const dish = reviewData.dishTypes.find((dish) => dish.id === activeTab) || {
      id: "main-course",
      name: "Main Course",
      dishName: "",
      recommendDish: false,
      price: "",
      rating: 0,
      images: [],
    };

    return {
      ...dish,
      images: Array.isArray(dish.images) ? dish.images : [],
    };
  };

  const handleShare = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to share a review.");
      return;
    }

    // await postSchema.validate(reviewData, { abortEarly: false });

    await handleReviewSubmit({
      reviewData,
      user,
      supabase,
      setLoading,
      onSuccess: () => {
        setReviewData(postStateInit);
        setStep(1);
        router.push("/(root)/posts");
      },
      onError: (error) => {
        console.error("Failed to submit review:", error);
      },
    });
  };

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

        // State setters
        setStep,
        setLoading,
        setReviewData,
        setCurrentDraftId,
        setActiveTab,
        setShowModal,

        // Step controls
        nextStep,
        prevStep,

        // Review handlers
        handleChange,
        handleShare,
        setTagsWrapper,

        // Dish type handlers
        handleAddDishType,
        handleRemoveTab,
        handleDishChange,
        handleDishImagesChange,
        getCurrentDish,

        handleShare,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
};
