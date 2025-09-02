import { createContext, useContext, useEffect, useState } from "react";

const GlobalContext = createContext();

export const useGlobal = () => useContext(GlobalContext);

export const GlobalProvider = ({ children }) => {
  const [postType, setPostType] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [renderPosts, setRenderPosts] = useState({
    posts: [],
    loading: false,
    initialScrollIndex: 0,
  });

  return (
    <GlobalContext.Provider
      value={{
        postType,
        setPostType,
        selectedImages,
        setSelectedImages,
        renderPosts,
        setRenderPosts,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
