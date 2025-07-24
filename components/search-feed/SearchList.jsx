"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Image,
} from "react-native";
import FoodMap from "./FoodMap";
import PostList from "./PostList";
import UsersList from "./UserItem";
import ReviewsList from "./ReviewItem";
import AllResultsList from "./AllResultsList";
import ScrollableCategories from "@/components/layout/ScrollableCategories";
import { useSearch } from "@/context/searchContext";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Input, InputField } from "@/components/ui";
import FilterOptions from "./FilterOptions";

const FILTER_OPTIONS = [
  { id: 1, name: "All", icon: "" },
  { id: 2, name: "Reviews", icon: "star" },
  { id: 3, name: "Dish", icon: "store" },
  { id: 4, name: "Users", icon: "account-circle" },
  { id: 5, name: "Reviews (Map)", icon: "map" },
];

const DEBOUNCE_DELAY = 500; // milliseconds

export default function SearchList() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [displaySearchQuery, setDisplaySearchQuery] = useState(""); // State for the input field
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(""); // Debounced state for actual search
  const [isLoading, setIsLoading] = useState(false);

  const { searchQuery, setSearchQuery: setSearchContextQuery } = useSearch(); // Renamed to avoid conflict

  const debounceTimeoutRef = useRef(null);

  // Effect to update the displaySearchQuery when searchQuery from context changes (e.g., initial load)
  useEffect(() => {
    setDisplaySearchQuery(searchQuery);
  }, [searchQuery]);

  // Debounce logic for search query
  useEffect(() => {
    setIsLoading(true); // Start loading when query changes
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(displaySearchQuery);
      setSearchContextQuery(displaySearchQuery); // Update context after debounce
      setIsLoading(false); // Stop loading after debounce completes
    }, DEBOUNCE_DELAY);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [displaySearchQuery, setSearchContextQuery]); // Dependency on displaySearchQuery

  const handleSearchChange = (text) => {
    setDisplaySearchQuery(text); // Update the input field immediately
  };

  const handleBack = () => {
    router.back();
  };

  const clearSearch = () => {
    setDisplaySearchQuery(""); // Clear input field
    setDebouncedSearchQuery(""); // Clear debounced query
    setSearchContextQuery(""); // Clear context query
    setIsLoading(false);
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  };

  const handleFilterChange = (id) => {
    const selectedFilter = FILTER_OPTIONS.find((filter) => filter.id === id);
    if (selectedFilter) {
      setActiveFilter(selectedFilter.name);
      // If a filter is changed and there's a search query, show loading
      if (debouncedSearchQuery.trim() !== "") {
        setIsLoading(true); // Indicate loading while filter changes
        // A small delay here can be added if filter change causes a significant re-fetch
        // For simplicity, we'll let the child components handle their loading states.
      }
    }
  };

  const SearchHeader = () => (
    <View className="px-4 pt-4 mt-10 pb-2">
      <Text className="text-6xl font-extrabold text-slate-900">Search</Text>
      <Text className="text-sm text-slate-500 mt-2 font-medium">
        Discover trending restaurants and find what you're looking for
      </Text>
    </View>
  );

  const renderContent = useCallback(() => {
    if (debouncedSearchQuery.trim() === "") {
      return (
        <View className="flex-1 justify-center items-center px-12">
          <Image
            source={require("@/assets/images/search-food.png")}
            style={{ width: 350, height: 350, marginBottom: 20 }}
          />
        </View>
      );
    }

    // Pass the debouncedSearchQuery to child components for data fetching
    switch (activeFilter) {
      case "Users":
        return <UsersList searchQuery={debouncedSearchQuery} />;
      case "Reviews":
        return <ReviewsList searchQuery={debouncedSearchQuery} />;
      case "Reviews (Map)":
        return <FoodMap searchQuery={debouncedSearchQuery} />;
      case "Dish":
        return <PostList searchQuery={debouncedSearchQuery} />;
      case "All":
        return <AllResultsList searchQuery={debouncedSearchQuery} />;
      default:
        return <AllResultsList searchQuery={debouncedSearchQuery} />;
    }
  }, [activeFilter, debouncedSearchQuery, isLoading]);

  return (
    <View className="flex-1 bg-white">
      {/* <SearchHeader /> */}

      {/* Search Input with Back Button */}
      <View className="px-3 pt-3 flex-row items-center">
        <View className="flex-1">
          <Input
            variant="rounded"
            leftIcon={<Ionicons name="search" size={20} color="#666" />}
            size="md"
            rightIcon={
              displaySearchQuery ? ( // Use displaySearchQuery here for immediate clear button visibility
                <TouchableOpacity onPress={clearSearch}>
                  <Ionicons name="close-circle" size={20} color="#666" />
                </TouchableOpacity>
              ) : null
            }
          >
            <InputField
              // ref={inputRef} // inputRef is not strictly needed here unless you plan to focus it programmatically
              placeholder="Search for restaurants, dishes, or reviews"
              value={displaySearchQuery} // Bind input value to displaySearchQuery
              onChangeText={handleSearchChange}
              autoCapitalize="none"
              returnKeyType="search"
            />
          </Input>
        </View>
      </View>
      <View className="flex-1">
        <View className="px-3">
          <FilterOptions />
        </View>
        <View className="-mt-3">
          {debouncedSearchQuery.trim() !== "" && (
            <ScrollableCategories
              categories={FILTER_OPTIONS}
              activeCategory={activeFilter}
              onSelect={handleFilterChange}
            />
          )}
        </View>
        {renderContent()}
      </View>
    </View>
  );
}
