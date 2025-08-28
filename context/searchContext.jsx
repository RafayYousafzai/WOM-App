import { FILTER_CATEGORIES } from "@/constants/SearchFilters";
import React, { createContext, useState, useContext } from "react";

const SearchContext = createContext();

export const useSearch = () => useContext(SearchContext);

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [filterCategories, setFilterCategories] = useState(FILTER_CATEGORIES);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState(new Set());

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        activeFilters,
        setActiveFilters,
        searchResults,
        setSearchResults,
        filterCategories,
        setFilterCategories,
        modalVisible,
        setModalVisible,
        selectedFilters,
        setSelectedFilters,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
