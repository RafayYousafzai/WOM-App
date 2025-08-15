import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { save, getValueFor, remove } from "@/lib/SecureStore/SecureStore";

const ReviewContext = createContext();

export const useReview = () => useContext(ReviewContext);

const initialRestaurantData = {
  isReview: false,
  images: [],
  restaurantName: "",
  location: "",
  price: 0,
  rating: 3,
  recommendDish: false,
  review: "",
  website: "",
  phoneNumber: "",
  dishName: "",
  quote: false,
};

const CURRENT_REVIEW_DRAFT_KEY = "current_review_draft";
const ALL_REVIEW_DRAFTS_KEY = "all_review_drafts";
const DEBOUNCE_TIME = 2000;
const MAX_DRAFTS = 10;

export const ReviewProvider = ({ children }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [peoplesTags, setPeoplesTags] = useState([]);
  const [cuisineTags, setCuisineTags] = useState([]);
  const [amenityTags, setAmenityTags] = useState([]);
  const [dietaryTags, setDietaryTags] = useState([]);
  const [extraTags, setExtraTags] = useState([]);
  const [restaurantData, setRestaurantData] = useState(initialRestaurantData);
  const [drafts, setDrafts] = useState([]);
  const [lastChangeTime, setLastChangeTime] = useState(null);
  const [saveTimeout, setSaveTimeout] = useState(null);
  const [currentDraftId, setCurrentDraftId] = useState(null);

  // Load drafts and current draft on initial mount
  useEffect(() => {
    const loadDrafts = async () => {
      const savedDrafts = await getValueFor(ALL_REVIEW_DRAFTS_KEY);
      setDrafts(savedDrafts || []);

      const currentDraft = await getValueFor(CURRENT_REVIEW_DRAFT_KEY);
      if (currentDraft) {
        setCurrentDraftId(currentDraft.id);
      }
    };
    loadDrafts();
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (lastChangeTime) {
      if (saveTimeout) clearTimeout(saveTimeout);

      const timeout = setTimeout(() => {
        saveCurrentDraft();
      }, DEBOUNCE_TIME);

      setSaveTimeout(timeout);
    }

    return () => {
      if (saveTimeout) clearTimeout(saveTimeout);
    };
  }, [lastChangeTime]);

  // Track changes in all relevant state
  useEffect(() => {
    if (step !== 1) {
      setLastChangeTime(Date.now());
    }
  }, [
    step,
    peoplesTags,
    cuisineTags,
    amenityTags,
    dietaryTags,
    extraTags,
    restaurantData,
    uploadProgress,
  ]);

  const saveCurrentDraft = async () => {
    const draftId = currentDraftId || Date.now().toString();
    const draftData = {
      id: draftId,
      _version: 1,
      _timestamp: new Date().toISOString(),
      step,
      peoplesTags,
      cuisineTags,
      amenityTags,
      dietaryTags,
      extraTags,
      restaurantData,
      uploadProgress,
    };

    try {
      if (JSON.stringify(draftData).length > 100000) {
        console.warn("Draft too large, not saving");
        return;
      }

      // Save as current draft
      await save(CURRENT_REVIEW_DRAFT_KEY, draftData);

      // Update existing draft or add new one
      const existingIndex = drafts.findIndex((d) => d.id === draftId);
      let updatedDrafts;

      if (existingIndex !== -1) {
        updatedDrafts = [...drafts];
        updatedDrafts[existingIndex] = draftData;
      } else {
        updatedDrafts = [draftData, ...drafts.slice(0, MAX_DRAFTS - 1)];
      }

      await save(ALL_REVIEW_DRAFTS_KEY, updatedDrafts);
      setDrafts(updatedDrafts);
      setCurrentDraftId(draftId);
    } catch (error) {
      console.error("Review auto-save failed:", error);
    }
  };

  const saveAsDraft = async (draftName = "") => {
    const draftId = currentDraftId || Date.now().toString();
    const draftData = {
      id: draftId,
      _version: 1,
      _timestamp: new Date().toISOString(),
      name: draftName,
      step,
      peoplesTags,
      cuisineTags,
      amenityTags,
      dietaryTags,
      extraTags,
      restaurantData,
      uploadProgress,
    };

    try {
      if (JSON.stringify(draftData).length > 100000) {
        console.warn("Draft too large, not saving");
        return false;
      }

      // Update existing draft or add new one
      const existingIndex = drafts.findIndex((d) => d.id === draftId);
      let updatedDrafts;

      if (existingIndex !== -1) {
        updatedDrafts = [...drafts];
        updatedDrafts[existingIndex] = draftData;
      } else {
        updatedDrafts = [draftData, ...drafts.slice(0, MAX_DRAFTS - 1)];
      }

      await save(ALL_REVIEW_DRAFTS_KEY, updatedDrafts);
      setDrafts(updatedDrafts);
      setCurrentDraftId(draftId);
      return true;
    } catch (error) {
      console.error("Failed to save review draft:", error);
      return false;
    }
  };

  const loadDraft = async (draftId) => {
    try {
      const draft = drafts.find((d) => d.id === draftId);
      if (!draft) return false;

      setStep(draft.step);
      setPeoplesTags(draft.peoplesTags || []);
      setCuisineTags(draft.cuisineTags || []);
      setAmenityTags(draft.amenityTags || []);
      setDietaryTags(draft.dietaryTags || []);
      setExtraTags(draft.extraTags || []);

      setRestaurantData({
        ...initialRestaurantData,
        ...draft.restaurantData,
        images: Array.isArray(draft.restaurantData.images)
          ? draft.restaurantData.images
          : [],
        rating:
          typeof draft.restaurantData.rating === "number"
            ? Math.min(Math.max(draft.restaurantData.rating, 0), 5)
            : 3,
      });

      setUploadProgress(
        typeof draft.uploadProgress === "number"
          ? Math.min(Math.max(draft.uploadProgress, 0), 100)
          : 0
      );

      setCurrentDraftId(draftId);
      return true;
    } catch (error) {
      console.error("Failed to load review draft:", error);
      return false;
    }
  };

  const deleteDraft = async (draftId) => {
    try {
      const updatedDrafts = drafts.filter((d) => d.id !== draftId);
      await save(ALL_REVIEW_DRAFTS_KEY, updatedDrafts);
      setDrafts(updatedDrafts);

      if (draftId === currentDraftId) {
        await remove(CURRENT_REVIEW_DRAFT_KEY);
        setCurrentDraftId(null);
      }

      return true;
    } catch (error) {
      console.error("Failed to delete review draft:", error);
      return false;
    }
  };

  const clearCurrentDraft = async () => {
    await remove(CURRENT_REVIEW_DRAFT_KEY);
    setCurrentDraftId(null);
  };

  const getDraftDetails = (draftId) => {
    const draft = drafts.find((d) => d.id === draftId);
    if (!draft) return null;

    const restaurantData = draft.restaurantData || {};
    return {
      id: draft.id,
      name: draft.name || restaurantData.restaurantName || "Unnamed review",
      createdAt: draft._timestamp,
      step: draft.step,
      hasImages:
        Array.isArray(restaurantData.images) &&
        restaurantData.images.length > 0,
      rating: restaurantData.rating || 0,
      isValid: true,
    };
  };

  const getAllDraftDetails = () => {
    return drafts.map((draft) => {
      const restaurantData = draft.restaurantData || {};
      return {
        id: draft.id,
        name: draft.name || restaurantData.restaurantName || "Unnamed review",
        createdAt: draft._timestamp,
        step: draft.step,
        hasImages:
          Array.isArray(restaurantData.images) &&
          restaurantData.images.length > 0,
        rating: restaurantData.rating || 0,
        isValid: true,
      };
    });
  };

  const resetReviewState = async () => {
    setStep(1);
    setLoading(false);
    setUploadProgress(0);
    setPeoplesTags([]);
    setCuisineTags([]);
    setAmenityTags([]);
    setDietaryTags([]);
    setExtraTags([]);
    setRestaurantData({ ...initialRestaurantData });
    await clearCurrentDraft();
  };

  // Wrapped setters
  const wrappedSetStep = useCallback((value) => {
    setStep(value);
    setLastChangeTime(Date.now());
  }, []);

  const wrappedSetPeoplesTags = useCallback((value) => {
    setPeoplesTags(value);
    setLastChangeTime(Date.now());
  }, []);

  const wrappedSetCuisineTags = useCallback((value) => {
    setCuisineTags(value);
    setLastChangeTime(Date.now());
  }, []);

  const wrappedSetAmenityTags = useCallback((value) => {
    setAmenityTags(value);
    setLastChangeTime(Date.now());
  }, []);

  const wrappedSetDietaryTags = useCallback((value) => {
    setDietaryTags(value);
    setLastChangeTime(Date.now());
  }, []);

  const wrappedSetExtraTags = useCallback((value) => {
    setExtraTags(value);
    setLastChangeTime(Date.now());
  }, []);

  const wrappedSetRestaurantData = useCallback((value) => {
    setRestaurantData(value);
    setLastChangeTime(Date.now());
  }, []);

  const wrappedSetUploadProgress = useCallback((value) => {
    setUploadProgress(value);
    setLastChangeTime(Date.now());
  }, []);

  return (
    <ReviewContext.Provider
      value={{
        step,
        loading,
        peoplesTags,
        cuisineTags,
        amenityTags,
        dietaryTags,
        extraTags,
        restaurantData,
        uploadProgress,
        drafts,
        setStep: wrappedSetStep,
        setLoading,
        setPeoplesTags: wrappedSetPeoplesTags,
        setCuisineTags: wrappedSetCuisineTags,
        setAmenityTags: wrappedSetAmenityTags,
        setDietaryTags: wrappedSetDietaryTags,
        setExtraTags: wrappedSetExtraTags,
        setRestaurantData: wrappedSetRestaurantData,
        setUploadProgress: wrappedSetUploadProgress,
        resetReviewState,
        saveAsDraft,
        loadDraft,
        deleteDraft,
        clearCurrentDraft,
        getDraftDetails,
        getAllDraftDetails,
        currentDraftId,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
};
