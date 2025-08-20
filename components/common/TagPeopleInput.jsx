import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Make sure @expo/vector-icons is installed and configured
import { useSupabase } from "@/context/supabaseContext"; // Adjust path if necessary

const TagPeopleInput = ({ tags = [], setTags, title = "Tag people..." }) => {
  const { supabase } = useSupabase();

  const [inputValue, setInputValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const debounceTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Debounced search function
  const performSearch = useCallback(
    async (query) => {
      if (!supabase) {
        console.error("Supabase client not initialized in TagPeopleInput.");
        setIsSearching(false);
        setShowDropdown(false);
        return;
      }

      const trimmedQuery = query.trim();
      if (!trimmedQuery) {
        setSearchResults([]);
        setIsSearching(false);
        setShowDropdown(false);
        return;
      }

      setIsSearching(true);
      setShowDropdown(true); // Show dropdown when search starts

      try {
        const searchTerm = `%${trimmedQuery}%`;
        const { data, error } = await supabase
          .from("users")
          .select(
            `
            id, 
            first_name, 
            last_name, 
            username, 
            email,
            user_notifications_tokens (token)
            `
          )
          .or(
            `first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},username.ilike.${searchTerm},email.ilike.${searchTerm}`
          )
          .order("first_name", { ascending: true })
          .limit(6);

        if (error) throw error;

        setSearchResults(data || []);
      } catch (error) {
        console.error("Error searching users:", error.message);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [supabase, inputValue]
  ); // Added inputValue to re-evaluate setShowDropdown in finally correctly

  // Handles general input changes and triggers debounced search
  const handleInputChange = useCallback(
    (text) => {
      setInputValue(text);

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      if (text.trim()) {
        setShowDropdown(true); // Show dropdown as user types
        debounceTimeoutRef.current = setTimeout(() => {
          performSearch(text);
        }, 500); // 500ms debounce
      } else {
        setShowDropdown(false);
        setSearchResults([]);
        setIsSearching(false);
      }
    },
    [performSearch]
  );

  // Adds a tag to the list (stores raw tag text, without '@')
  const addTag = useCallback(
    (tagText) => {
      const trimmedTag = tagText.trim();
      // Ensure tag is not empty and not already included
      if (
        trimmedTag &&
        !tags.find((t) => t.toLowerCase() === trimmedTag.toLowerCase())
      ) {
        setTags((prevTags) => [...prevTags, trimmedTag]);
      }
      setInputValue("");
      setSearchResults([]);
      setShowDropdown(false);
      Keyboard.dismiss();
    },
    [tags, setTags]
  );

  const handleSelectUser = useCallback(
    (user) => {
      const username =
        user.username ||
        `${user.first_name || ""}${
          user.last_name ? `_${user.last_name}` : ""
        }`.toLowerCase();

      if (username) {
        // Create a tag object that includes all the information you need
        const userTag = {
          username,
          first_name: user.first_name,
          last_name: user.last_name,
          token: user.user_notifications_tokens?.token || null,
          id: user.id,
        };

        // Pass the full user object instead of just the username
        setTags((prevTags) => [...prevTags, userTag]);
      }

      setInputValue("");
      setSearchResults([]);
      setShowDropdown(false);
      Keyboard.dismiss();
    },
    [setTags]
  );

  const handleAddCustomTagFromInput = useCallback(() => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue) {
      addTag({
        username: trimmedValue,
        first_name: null,
        last_name: null,
        token: null,
      });
    }
  }, [inputValue, addTag]);

  // Custom onChangeText for TextInput to handle space-press for adding tags
  const onChangeTextInput = (text) => {
    // Check if the last character added is a space and there was content before it
    if (text.endsWith(" ") && inputValue.trim().length > 0) {
      const tagToAdd = inputValue.trim(); // Use inputValue (state before this change)
      addTag(tagToAdd);
      // setInputValue(""); // Cleared by addTag
    } else {
      handleInputChange(text); // Normal input handling
    }
  };

  const handleRemoveTag = useCallback(
    (tagIndex) => {
      setTags((prevTags) => prevTags.filter((_, index) => index !== tagIndex));
    },
    [setTags]
  );

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const renderTag = ({ item, index }) => (
    <View style={styles.tagItem}>
      <Text style={styles.tagText}>
        @{typeof item === "string" ? item : item.username}
      </Text>
      <TouchableOpacity onPress={() => handleRemoveTag(index)}>
        <Ionicons
          name="close-circle"
          size={16}
          color={styles.tagRemoveIcon.color}
        />
      </TouchableOpacity>
    </View>
  );

  // Renders a single search result item
  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => handleSelectUser(item)}
      key={item.id || item.username} // Ensure unique key
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {(
            item?.first_name?.charAt(0) ||
            item?.username?.charAt(0) ||
            "?"
          ).toUpperCase()}
        </Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.fullNameText}>
          {item.first_name || item.last_name
            ? `${item.first_name || ""} ${item.last_name || ""}`.trim()
            : item.username}
        </Text>
        {item.username && (
          <Text style={styles.usernameText}>@{item.username}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Input Field */}
      <View style={styles.inputOuterContainer}>
        <View style={styles.inputInnerContainer}>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            value={inputValue}
            onChangeText={onChangeTextInput}
            placeholder={title}
            onFocus={() => {
              if (inputValue.trim()) {
                setShowDropdown(true);
                if (searchResults.length === 0 && !isSearching) {
                  performSearch(inputValue.trim());
                }
              }
            }}
            onBlur={() => {
              // Delay hiding dropdown to allow clicks on items to register
              setTimeout(() => {
                // Check if an item was selected (which would clear inputValue) or if input is blurred without selection
                if (
                  inputRef.current &&
                  !inputRef.current.isFocused() &&
                  !inputValue.trim()
                ) {
                  setShowDropdown(false);
                } else if (
                  inputRef.current &&
                  !inputRef.current.isFocused() &&
                  inputValue.trim() &&
                  searchResults.length === 0 &&
                  !isSearching
                ) {
                  // If blurred, input has text, no results, not searching -> hide dropdown
                  setShowDropdown(false);
                }
              }, 200);
            }}
            placeholderTextColor={styles.placeholderText.color}
          />
        </View>
      </View>

      {/* Dropdown for search results */}
      {showDropdown && inputValue.trim().length > 0 && (
        <View style={styles.dropdown}>
          {isSearching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="small"
                color={styles.loadingIndicator.color}
              />
            </View>
          ) : searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => (item.id || item.username).toString()}
              keyboardShouldPersistTaps="handled" // Important for touch on items
              nestedScrollEnabled // If this component is inside another ScrollView
            />
          ) : (
            <Text style={styles.noResultsText}>
              No users found for "{inputValue.trim()}"
            </Text>
          )}
        </View>
      )}

      {/* Display Tags (Horizontally Scrollable) */}
      {tags.length > 0 && (
        <FlatList
          data={tags}
          renderItem={renderTag}
          keyExtractor={(item, index) => `${item}-${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tagsListContainer}
          contentContainerStyle={styles.tagsListContentContainer}
        />
      )}
      {/* Alternative: Wrapping Tags View
        {tags.length > 0 && (
            <View style={styles.tagsWrappingContainer}>
                {tags.map((tag, index) => renderTag({ item: tag, index }))}
            </View>
        )}
      */}
    </View>
  );
};

// Basic Styles (Customize as needed)
const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    width: "100%",
  },
  inputOuterContainer: {
    // Simulates the <Input variant="rounded" size="md">
    // This container can hold the border and rounded corners
  },
  inputInnerContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB", // gray-300
    borderRadius: 20, // "rounded"
    paddingLeft: 12, // Padding for text input
    // minHeight: 44, // "md" size approx
  },
  textInput: {
    flex: 1,
    paddingVertical: Platform.OS === "ios" ? 12 : 10, // Adjust for platform differences
    fontSize: 16,
    color: "#111827", // gray-900
  },
  placeholderText: {
    color: "#9CA3AF", // gray-400
  },
  addIconTouchable: {
    paddingHorizontal: 10, // Space around the icon
    paddingVertical: 8,
  },
  addIconEnabled: {
    color: "#f59e0b", // blue-500
  },
  addIconDisabled: {
    color: "#9CA3AF", // gray-400
  },
  dropdown: {
    position: "absolute", // Position dropdown absolutely below input
    top: Platform.OS === "ios" ? 60 : 65, // Adjust based on input height + margin. Fine-tune this.
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB", // gray-200
    maxHeight: 200,
    zIndex: 10, // Ensure dropdown is on top
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingContainer: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingIndicator: {
    color: "#f59e0b", // blue-500 (same as primary500 in original)
  },
  searchResultItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6", // gray-100
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    height: 32,
    width: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB", // gray-200
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#4B5563", // gray-600
    fontWeight: "600",
    fontSize: 14,
  },
  userInfo: {
    flex: 1,
  },
  fullNameText: {
    fontWeight: "500",
    color: "#1F2937", // gray-800
  },
  usernameText: {
    color: "#6B7280", // gray-500
    fontSize: 12,
  },
  noResultsText: {
    padding: 16,
    textAlign: "center",
    color: "#6B7280", // gray-500
  },
  tagsListContainer: {
    marginTop: 12,
  },
  tagsListContentContainer: {
    paddingVertical: 4, // Add some padding if tags have varying heights
  },
  // Use this for wrapping tags instead of FlatList horizontal
  // tagsWrappingContainer: {
  //   flexDirection: 'row',
  //   flexWrap: 'wrap',
  //   marginTop: 10,
  // },
  tagItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6", // gray-100
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16, // "rounded-full"
    marginRight: 8,
    // marginBottom: 8, // Add if using wrapping container
  },
  tagText: {
    marginRight: 6,
    fontSize: 13,
    color: "#1F2937", // gray-900
  },
  tagRemoveIcon: {
    color: "#6B7280", // gray-500
  },
});

export default TagPeopleInput;
