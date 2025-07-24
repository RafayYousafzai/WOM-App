import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface ScrollableCategoriesProps {
  categories?: Category[];
  selectedCategory?: number;
  onSelect?: (categoryId: number) => void;
  theme?: { colors?: { primary?: string } };
}

const ScrollableCategories: React.FC<ScrollableCategoriesProps> = ({
  categories = [{ id: 1, name: "All", icon: "view-grid" }],
  selectedCategory,
  onSelect,
  theme,
}) => {
  const [internalSelected, setInternalSelected] = useState(
    selectedCategory || categories[0]?.id
  );

  const handleSelect = (categoryId: number) => {
    setInternalSelected(categoryId);
    if (onSelect) onSelect(categoryId);
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
        {categories.map((category) => {
          const isSelected =
            (selectedCategory ?? internalSelected) === category.id;

          return (
            <TouchableOpacity
              key={category.id}
              onPress={() => handleSelect(category.id)}
              style={{
                backgroundColor: isSelected ? primaryColor : "#F5F5F5",
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 10,
                marginHorizontal: 3,
                flexDirection: "row",
                alignItems: "center",
                shadowColor: isSelected ? primaryColor : "transparent",

                elevation: isSelected ? 4 : 0,
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
