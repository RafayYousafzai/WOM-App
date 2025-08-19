import { createContext, useContext, useEffect, useState } from "react";

const GlobalContext = createContext();

export const useGlobal = () => useContext(GlobalContext);

export const GlobalProvider = ({ children }) => {
  const [postType, setPostType] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [renderPosts, setRenderPosts] = useState({
    posts: [],
    loading: true,
    initialScrollIndex: 0,
  });

  const [currentDishId, setCurrentDishId] = useState(null);
  const [dishImages, setDishImages] = useState({});

  const setCurrentDishImages = (dishId, imagesOrUpdater) => {
    setDishImages((prev) => {
      if (typeof imagesOrUpdater === "function") {
        return {
          ...prev,
          [dishId]: imagesOrUpdater(prev[dishId] || []),
        };
      }
      if (Array.isArray(imagesOrUpdater)) {
        return {
          ...prev,
          [dishId]: [...(prev[dishId] || []), ...imagesOrUpdater],
        };
      }
      return {
        ...prev,
        [dishId]: [...(prev[dishId] || []), imagesOrUpdater],
      };
    });
  };

  const getDishImages = (dishId) => {
    return dishImages[dishId] || [];
  };

  const replaceDishImages = (dishId, images) => {
    setDishImages((prev) => ({
      ...prev,
      [dishId]: images,
    }));
  };

  const removeDishImage = (dishId, imageUri) => {
    setDishImages((prev) => ({
      ...prev,
      [dishId]: (prev[dishId] || []).filter((uri) => uri !== imageUri),
    }));
  };

  const clearAllDishImages = () => {
    setDishImages({});
  };

  const removeDishImages = (dishId) => {
    setDishImages((prev) => {
      const newImages = { ...prev };
      delete newImages[dishId];
      return newImages;
    });
  };

  const getAllDishImages = () => {
    return Object.values(dishImages).flat();
  };

  return (
    <GlobalContext.Provider
      value={{
        postType,
        setPostType,
        selectedImages,
        setSelectedImages,
        renderPosts,
        setRenderPosts,
        currentDishId,
        setCurrentDishId,
        dishImages,
        setDishImages,
        setCurrentDishImages,
        getDishImages,
        replaceDishImages,
        removeDishImage,
        clearAllDishImages,
        removeDishImages,
        getAllDishImages,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
