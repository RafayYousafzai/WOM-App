import React from "react";
import { View, Text } from "react-native";
import { RatingStars } from "../review/rating-stars";
import { Input, InputField } from "@/components/ui";
import { Switch } from "react-native-paper";

export const DishForm = ({ dishData, onDishChange }) => {
  return (
    <View className="px-4">
      {/* Rating */}

      {/* Dish Name */}
      <Text className="text-sm text-gray-500 mb-1">Dish Name*</Text>
      <Input variant="rounded" size="md">
        <InputField
          value={dishData.dishName}
          onChangeText={(text) => onDishChange("dishName", text)}
          placeholder="Enter dish name"
        />
      </Input>

      {/* Recommended Dishes */}

      {/* Price */}
      <View className="mt-3 mb-2">
        <Text className="text-sm text-gray-500 mb-1">Price</Text>
        <Input variant="rounded" size="md">
          <InputField
            value={dishData.price}
            onChangeText={(text) => onDishChange("price", text)}
            placeholder="Enter price"
            keyboardType="decimal-pad"
          />
        </Input>
      </View>
      <View className="my-3">
        <View className="bg-[#f9fafb] rounded-full border-2 border-gray-300 p-2 shadow-sm">
          <View className="flex-row justify-between items-center">
            <View className="flex-1 pr-3 pl-2">
              <Text className="text-base font-medium text-gray-400">
                Recommend this dish?
              </Text>
            </View>
            <Switch
              value={dishData.recommendDish}
              onValueChange={(value) => onDishChange("recommendDish", value)}
              color="#f59e0b"
              style={{
                transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
              }}
            />
          </View>
        </View>
      </View>
      <View>
        <RatingStars
          rating={dishData.rating}
          setRating={(rating) => onDishChange("rating", rating)}
        />
      </View>
    </View>
  );
};
