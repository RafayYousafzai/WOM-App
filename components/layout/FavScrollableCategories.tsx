import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import FilterOptions from "../search-feed/FilterOptions";

interface Category {
  id: string;
  name: string;
  icon: string;
  isDeletable?: boolean;
}

interface ScrollableCategoriesProps {
  categories?: Category[];
  selectedCategory?: string;
  onSelect?: (categoryName: string) => void;
  onLongPress?: (categoryName: string) => void;
  theme?: { colors?: { primary?: string } };
}

const ScrollableCategories: React.FC<ScrollableCategoriesProps> = ({
  categories = [{ id: 1, name: "All", icon: "view-grid" }],
  selectedCategory,
  onSelect,
  onLongPress,
  theme,
}) => {
  const [internalSelected, setInternalSelected] = useState(
    selectedCategory || categories[0]?.name
  );

  const handleSelect = (categoryName: string) => {
    // Handle "Add Collection" specially - pass "Add" to match Favorites component logic
    if (categoryName === "Add Collection") {
      if (onSelect) onSelect("Add");
      return;
    }

    setInternalSelected(categoryName);
    if (onSelect) onSelect(categoryName);
  };

  const handleLongPress = (category: Category) => {
    // Check if it's a protected collection
    const protectedCollections = ["Wishlist", "Recipe", "All"];

    if (protectedCollections.includes(category.name)) {
      Alert.alert(
        "Cannot Delete",
        `The "${category.name}" collection cannot be deleted as it's a default collection.`
      );
      return;
    }

    // Check if it's the "Add Collection" button
    if (category.name === "Add Collection") {
      return;
    }

    // For user-created collections, trigger the delete handler
    if (onLongPress && category.isDeletable) {
      onLongPress(category.name);
    }
  };

  const primaryColor = theme?.colors?.primary || "#f39f1e";

  return (
    <View className="my-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 8,
          paddingVertical: 8,
        }}
      >
        {/* <FilterOptions /> */}
        {categories.map((category) => {
          const isSelected =
            (selectedCategory ?? internalSelected) === category.name;

          return (
            <TouchableOpacity
              key={category.id}
              onPress={() => handleSelect(category.name)}
              onLongPress={() => handleLongPress(category)}
              delayLongPress={500} // 500ms long press delay
              style={{
                backgroundColor: isSelected ? primaryColor : "#F5F5F5",
                borderRadius: 20,
                paddingHorizontal: 17.3,
                paddingVertical: 10,
                marginHorizontal: 3,
                flexDirection: "row",
                alignItems: "center",
                height: 36,
                shadowColor: isSelected ? primaryColor : "transparent",
                elevation: isSelected ? 4 : 0,
                // Add visual indication for deletable collections
                borderWidth: category.isDeletable ? 1 : 0,
                borderColor: category.isDeletable ? "#e5e7eb" : "transparent",
              }}
            >
              {category.icon && (
                <MaterialCommunityIcons
                  name={category.icon}
                  size={16}
                  color={isSelected ? "white" : "#666"}
                  style={{ marginRight: 6 }}
                />
              )}
              <Text
                style={{
                  color: isSelected ? "white" : "#2A2D34",
                  fontWeight: isSelected ? "600" : "500",
                  fontSize: 14,
                }}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default ScrollableCategories;
