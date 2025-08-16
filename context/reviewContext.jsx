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

const restaurantStateInit = {
  id: null,
  images: [],
  dishTypes: [],
  location: null,
  review: "",
  anonymous: false,
};

export const ReviewProvider = ({ children }) => {
  const { supabase } = useSupabase();
  const { user } = useUser();
  const { uploadProgress, isUploading, startUpload } = useUpload();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [restaurantData, setRestaurantData] = useState(restaurantStateInit);
  const [cuisineTags, setCuisineTags] = useState([]);
  const [amenityTags, setAmenityTags] = useState([]);
  const [dietaryTags, setDietaryTags] = useState([]);
  const [extraTags, setExtraTags] = useState([]);
  const [peoplesTags, setPeoplesTags] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [currentDraftId, setCurrentDraftId] = useState(null);

  useEffect(() => {
    const loadDrafts = async () => {
      const storedDrafts = await getValueFor(ALL_REVIEW_DRAFTS_KEY);
      if (storedDrafts) {
        setDrafts(JSON.parse(storedDrafts));
      }
    };
    loadDrafts();
  }, []);

  const saveDrafts = async (newDrafts) => {
    await save(ALL_REVIEW_DRAFTS_KEY, JSON.stringify(newDrafts));
    setDrafts(newDrafts);
  };

  const addDraft = (draft) => {
    const newDrafts = [...drafts, draft];
    saveDrafts(newDrafts);
  };

  const updateDraft = (draftId, updatedDraft) => {
    const newDrafts = drafts.map((draft) =>
      draft.id === draftId ? updatedDraft : draft
    );
    saveDrafts(newDrafts);
  };

  const deleteDraft = (draftId) => {
    const newDrafts = drafts.filter((draft) => draft.id !== draftId);
    saveDrafts(newDrafts);
  };

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
    setRestaurantData((prev) => ({ ...prev, [field]: value }));
  };

  const handleShare = async () => {
    setLoading(true);
    setIsSharing(true);

    const finalData = {
      ...restaurantData,
      allTags: [
        ...cuisineTags,
        ...dietaryTags,
        ...amenityTags,
        ...extraTags,
      ].filter(Boolean),
      peoplesTags,
    };

    const { error } = restaurantSchema.validate(finalData);
    if (error) {
      Alert.alert("Validation Error", error.details[0].message);
      setLoading(false);
      setIsSharing(false);
      return;
    }

    try {
      const imageUrls = await startUpload(restaurantData.images, {
        onProgress: (progress) => {},
      });

      const reviewData = {
        ...finalData,
        images: imageUrls,
        user_id: user.id,
      };

      const { data: newReview, error: reviewError } = await supabase
        .from("reviews")
        .insert([reviewData])
        .select();

      if (reviewError) {
        throw new Error(reviewError.message);
      }

      if (currentDraftId) {
        deleteDraft(currentDraftId);
      }
      await notifyFollowers(user.id, newReview[0].id, "new_review");
      await notifyPeoples(peoplesTags, newReview[0].id, "tagged_in_review");

      router.push(`/post/${newReview[0].id}`);
    } catch (error) {
      Alert.alert("Error", "Failed to share the review. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
      setIsSharing(false);
    }
  };

  const handleSaveDraft = () => {
    const draftData = {
      id: currentDraftId || Date.now().toString(),
      restaurantData,
      cuisineTags,
      amenityTags,
      dietaryTags,
      extraTags,
      peoplesTags,
      step,
    };

    if (currentDraftId) {
      updateDraft(currentDraftId, draftData);
    } else {
      addDraft(draftData);
      setCurrentDraftId(draftData.id);
    }

    Alert.alert("Draft Saved", "Your review has been saved as a draft.");
  };

  const removeImage = (index) => {
    const newImages = [...restaurantData.images];
    newImages.splice(index, 1);
    setRestaurantData((prev) => ({ ...prev, images: newImages }));
  };

  return (
    <ReviewContext.Provider
      value={{
        step,
        loading,
        isSharing,
        restaurantData,
        cuisineTags,
        amenityTags,
        dietaryTags,
        extraTags,
        peoplesTags,
        drafts,
        currentDraftId,
        uploadProgress,
        isUploading,
        setStep,
        setLoading,
        setIsSharing,
        setRestaurantData,
        setCuisineTags,
        setAmenityTags,
        setDietaryTags,
        setExtraTags,
        setPeoplesTags,
        setCurrentDraftId,
        nextStep,
        prevStep,
        handleChange,
        handleShare,
        handleSaveDraft,
        removeImage,
        addDraft,
        updateDraft,
        deleteDraft,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
};
