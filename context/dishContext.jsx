import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { save, getValueFor, remove } from "@/lib/SecureStore/SecureStore";

const DishContext = createContext();

export const useDish = () => useContext(DishContext);

const initialPostData = {
  rating: 3,
  caption: "",
  review: "",
  dishName: "",
  images: [],
  quote: false,
  location: null,
};

const ALL_DISH_DRAFTS_KEY = "all_dish_drafts";
const CURRENT_DRAFT_KEY = "current_dish_draft";
const DEBOUNCE_TIME = 2000;
const MAX_DRAFTS = 10;

export const DishProvider = ({ children }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [peopleTags, setPeopleTags] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [cuisineTags, setCuisineTags] = useState([]);
  const [dietaryTags, setDietaryTags] = useState([]);
  const [extraTags, setExtraTags] = useState([]);
  const [postData, setPostData] = useState(initialPostData);
  const [drafts, setDrafts] = useState([]);
  const [lastChangeTime, setLastChangeTime] = useState(null);
  const [saveTimeout, setSaveTimeout] = useState(null);
  const [currentDraftId, setCurrentDraftId] = useState(null);

  // Load drafts and current draft on initial mount
  useEffect(() => {
    const loadDrafts = async () => {
      const savedDrafts = await getValueFor(ALL_DISH_DRAFTS_KEY);
      setDrafts(savedDrafts || []);

      const currentDraft = await getValueFor(CURRENT_DRAFT_KEY);
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
    peopleTags,
    hashtags,
    cuisineTags,
    dietaryTags,
    extraTags,
    postData,
  ]);

  const saveCurrentDraft = async () => {
    const draftId = currentDraftId || Date.now().toString();
    const draftData = {
      id: draftId,
      _version: 1,
      _timestamp: new Date().toISOString(),
      step,
      peopleTags,
      hashtags,
      cuisineTags,
      dietaryTags,
      extraTags,
      postData,
    };

    try {
      // Save as current draft
      await save(CURRENT_DRAFT_KEY, draftData);

      // Update existing draft or add new one
      const existingIndex = drafts.findIndex((d) => d.id === draftId);
      let updatedDrafts;

      if (existingIndex !== -1) {
        updatedDrafts = [...drafts];
        updatedDrafts[existingIndex] = draftData;
      } else {
        updatedDrafts = [draftData, ...drafts.slice(0, MAX_DRAFTS - 1)];
      }

      await save(ALL_DISH_DRAFTS_KEY, updatedDrafts);
      setDrafts(updatedDrafts);
      setCurrentDraftId(draftId);
    } catch (error) {
      console.error("Auto-save failed:", error);
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
      peopleTags,
      hashtags,
      cuisineTags,
      dietaryTags,
      extraTags,
      postData,
    };

    try {
      // Update existing draft or add new one
      const existingIndex = drafts.findIndex((d) => d.id === draftId);
      let updatedDrafts;

      if (existingIndex !== -1) {
        updatedDrafts = [...drafts];
        updatedDrafts[existingIndex] = draftData;
      } else {
        updatedDrafts = [draftData, ...drafts.slice(0, MAX_DRAFTS - 1)];
      }

      await save(ALL_DISH_DRAFTS_KEY, updatedDrafts);
      setDrafts(updatedDrafts);
      setCurrentDraftId(draftId);
      return true;
    } catch (error) {
      console.error("Failed to save draft:", error);
      return false;
    }
  };

  const loadDraft = async (draftId) => {
    try {
      const draft = drafts.find((d) => d.id === draftId);
      if (!draft) return false;

      setStep(draft.step);
      setPeopleTags(draft.peopleTags || []);
      setHashtags(draft.hashtags || []);
      setCuisineTags(draft.cuisineTags || []);
      setDietaryTags(draft.dietaryTags || []);
      setExtraTags(draft.extraTags || []);
      setPostData({
        ...initialPostData,
        ...draft.postData,
        images: Array.isArray(draft.postData.images)
          ? draft.postData.images
          : [],
      });

      setCurrentDraftId(draftId);
      return true;
    } catch (error) {
      console.error("Failed to load draft:", error);
      return false;
    }
  };

  const deleteDraft = async (draftId) => {
    try {
      const updatedDrafts = drafts.filter((d) => d.id !== draftId);
      await save(ALL_DISH_DRAFTS_KEY, updatedDrafts);
      setDrafts(updatedDrafts);

      if (draftId === currentDraftId) {
        await remove(CURRENT_DRAFT_KEY);
        setCurrentDraftId(null);
      }

      return true;
    } catch (error) {
      console.error("Failed to delete draft:", error);
      return false;
    }
  };

  const clearCurrentDraft = async () => {
    await remove(CURRENT_DRAFT_KEY);
    setCurrentDraftId(null);
  };

  const resetDishState = async () => {
    setStep(1);
    setLoading(false);
    setPeopleTags([]);
    setHashtags([]);
    setCuisineTags([]);
    setDietaryTags([]);
    setExtraTags([]);
    setPostData({ ...initialPostData });
    await clearCurrentDraft();
  };

  // Wrapped setters to ensure change tracking
  const wrappedSetStep = useCallback((value) => {
    setStep(value);
    setLastChangeTime(Date.now());
  }, []);

  const wrappedSetPeopleTags = useCallback((value) => {
    setPeopleTags(value);
    setLastChangeTime(Date.now());
  }, []);

  const wrappedSetHashtags = useCallback((value) => {
    setHashtags(value);
    setLastChangeTime(Date.now());
  }, []);

  const wrappedSetCuisineTags = useCallback((value) => {
    setCuisineTags(value);
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

  const wrappedSetPostData = useCallback((value) => {
    setPostData(value);
    setLastChangeTime(Date.now());
  }, []);

  const wrappedSetTags = useCallback((tags) => {
    setPeopleTags(tags);
    setLastChangeTime(Date.now());
  }, []);

  return (
    <DishContext.Provider
      value={{
        step,
        loading,
        peopleTags,
        hashtags,
        cuisineTags,
        postData,
        dietaryTags,
        extraTags,
        drafts,
        setStep: wrappedSetStep,
        setLoading,
        setPeopleTags: wrappedSetPeopleTags,
        setHashtags: wrappedSetHashtags,
        setCuisineTags: wrappedSetCuisineTags,
        setPostData: wrappedSetPostData,
        setTags: wrappedSetTags,
        setDietaryTags: wrappedSetDietaryTags,
        setExtraTags: wrappedSetExtraTags,
        resetDishState,
        saveAsDraft,
        loadDraft,
        deleteDraft,
        clearCurrentDraft,
        currentDraftId,
      }}
    >
      {children}
    </DishContext.Provider>
  );
};
