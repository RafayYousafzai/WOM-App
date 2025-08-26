import React from "react";
import { View, Text, Animated } from "react-native";
import { TextInput, Switch, Divider } from "react-native-paper";
import { RatingStars } from "./rating-stars";
import ImageEditor from "../ImageEditor";

export const DishForm = ({ dishData, onDishChange }) => {
  return (
    <Animated.View
      style={{ paddingHorizontal: 20, marginBottom: 24 }}
      className="y-4 flex-1"
    >
      <View className="mb-6  ">
        <View className="">
          <View className="relative mb-6">
            <ImageEditor />
          </View>

          {/* <Divider className="mb-6" /> */}

          <View className="mb-6">
            <TextInput
              label="Dish Name"
              value={dishData.dishName}
              onChangeText={(text) => onDishChange("dishName", text)}
              placeholder="Enter dish name"
              mode="outlined"
              outlineColor="#e5e7eb"
              activeOutlineColor="#6366f1"
              style={{
                backgroundColor: "#f8fafc",
                fontSize: 18,
              }}
              contentStyle={{
                fontSize: 18,
                paddingVertical: 8,
              }}
              outlineStyle={{
                borderRadius: 16,
                borderWidth: 0,
              }}
              required
            />
          </View>

          <View className="mb-6">
            <TextInput
              label="Price"
              value={dishData.price}
              onChangeText={(text) => onDishChange("price", text)}
              placeholder="Enter price"
              keyboardType="decimal-pad"
              mode="outlined"
              outlineColor="#e5e7eb"
              activeOutlineColor="#6366f1"
              style={{
                backgroundColor: "#f8fafc",
                fontSize: 18,
              }}
              contentStyle={{
                fontSize: 18,
                paddingVertical: 8,
              }}
              outlineStyle={{
                borderRadius: 16,
                borderWidth: 0,
              }}
            />
          </View>

          {/* <Divider className="mb-6" /> */}

          <View className="mb-6 bg-[#f9fafb] rounded-2xl elevation-2">
            <View className="p-5">
              <View className="flex-row justify-between items-center">
                <View className="flex-1 pr-4">
                  <Text className="text-xl text-gray-800">
                    Recommend this dish?
                  </Text>
                </View>
                <Switch
                  value={dishData.recommendDish}
                  onValueChange={(value) =>
                    onDishChange("recommendDish", value)
                  }
                  color="#f59e0b"
                  style={{
                    transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }],
                  }}
                />
              </View>
            </View>
          </View>

          <RatingStars
            rating={dishData.rating}
            setRating={(rating) => onDishChange("rating", rating)}
          />
        </View>
      </View>
    </Animated.View>
  );
};
