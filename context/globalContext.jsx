import { createContext, useContext, useEffect, useState } from "react";

const GlobalContext = createContext();

export const useGlobal = () => useContext(GlobalContext);

export const GlobalProvider = ({ children }) => {
  const [postType, setPostType] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);

  return (
    <GlobalContext.Provider
      value={{
        postType,
        setPostType,
        selectedImages,
        setSelectedImages,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
