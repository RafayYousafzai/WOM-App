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
import { restaurantSchema } from "@/lib/joi/restaurantSchema";
import notifyFollowers from "@/utils/notification/notify_followers";
import notifyPeoples from "@/utils/notification/notify_peoples";
import { Alert } from "react-native";
import { router } from "expo-router";

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

  console.log(reviewData);

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
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
    setLoading(true);

    const finalData = {
      ...reviewData,
      allTags: [
        ...(reviewData.cuisineTags || []),
        ...(reviewData.dietaryTags || []),
        ...(reviewData.amenityTags || []),
      ].filter(Boolean),
    };

    console.log("Submitting data:", JSON.stringify(finalData, null, 2));

    const { error } = restaurantSchema.validate(finalData);
    if (error) {
      Alert.alert("Validation Error", error.details[0].message);
      setLoading(false);
      return;
    }

    try {
      // const imageUrls = await startUpload(reviewData.images, {
      //   onProgress: (progress) => {},
      // });

      // await notifyFollowers(user.id, newReview[0].id, "new_review");
      // await notifyPeoples(peoplesTags, newReview[0].id, "tagged_in_review");

      // router.push(`/post/${newReview[0].id}`);
      Alert.alert("Success", "Review shared successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to share the review. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReviewContext.Provider
      value={{
        step,
        loading,
        reviewData,
        currentDraftId,
        uploadProgress,
        isUploading,
        setStep,
        setLoading,
        setReviewData,
        setCurrentDraftId,
        nextStep,
        prevStep,
        handleChange,
        handleShare,
        setTagsWrapper,
        handleAddDishType,
        handleRemoveTab,
        handleDishChange,
        handleDishImagesChange,
        getCurrentDish,
        activeTab,
        setActiveTab,
        showModal,
        setShowModal,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
};
