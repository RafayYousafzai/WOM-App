import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
} from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// Enhanced RestaurantInfo component with dish sidebar
export const RestaurantInfo = ({
  restaurantName,
  location,
  rating,
  title,
  price,
  cuisine,
  onRestaurantPress,
  isInModal = false,
  // New props for multiple dishes
  restaurantDishes = [],
  currentDishId = null,
  onDishSelect, // New callback for dish selection
}) => {
  const [showDishSidebar, setShowDishSidebar] = useState(false);
  const [slideAnim] = useState(new Animated.Value(300));

  const currentDish = restaurantDishes.find(
    (dish) => dish.id === currentDishId
  ) ||
    restaurantDishes[0] || { name: title, category: "Main", rating, price };

  const otherDishes = restaurantDishes.filter(
    (dish) => dish.id !== currentDishId
  );

  console.log(
    "RestaurantInfo currentDish:",
    currentDish,
    "dishes:",
    restaurantDishes
  );

  const renderRating = (dishRating = rating) => {
    const stars = [];
    const fullStars = Math.floor(dishRating);
    const hasHalfStar = dishRating % 1 !== 0;

    for (let i = 0; i < 10; i++) {
      if (i < fullStars) {
        stars.push(
          <FontAwesome key={i} name="star" size={12} color="#FFD700" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <FontAwesome key={i} name="star-half-o" size={12} color="#FFD700" />
        );
      } else {
        stars.push(
          <FontAwesome key={i} name="star-o" size={12} color="#FFD700" />
        );
      }
    }

    return (
      <View className="flex-row items-center">
        {stars}
        <Text className="ml-1 text-sm text-gray-700">
          {dishRating.toFixed(1)}
        </Text>
      </View>
    );
  };

  const handleLocationPress = () => {
    if (onRestaurantPress) {
      onRestaurantPress();
    } else {
      router.push(`/restaurant-info/${encodeURIComponent(location)}`);
    }
  };

  const openDishSidebar = () => {
    setShowDishSidebar(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDishSidebar = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowDishSidebar(false);
    });
  };

  const handleDishPress = (dish) => {
    // Get the new index from parent component
    const newIndex = onDishSelect ? onDishSelect(dish.id) : 0;

    // Close sidebar with a slight delay to allow image transition
    setTimeout(() => {
      closeDishSidebar();
    }, 100);
  };

  const getDishTypeColor = (dishType) => {
    switch (dishType) {
      case "appetizer":
        return "bg-green-100 text-green-800";
      case "main":
        return "bg-yellow-100 text-yellow-800";
      case "dessert":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <TouchableOpacity
        className="pt-2 px-1"
        onPress={handleLocationPress}
        activeOpacity={0.7}
      >
        {/* Restaurant Info Row */}

        {/* Dish Info Row */}
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="font-bold ml-1 text-lg text-gray-900">
              {currentDish.name}
            </Text>
          </View>

          {/* Show dish options button if there are other dishes */}
          <TouchableOpacity
            onPress={openDishSidebar}
            className=" px-3 py-2 rounded-lg flex-row items-center"
            activeOpacity={0.7}
          >
            <Text className="ml-1 text-slate-600 text-sm font-medium">
              {currentDish.category}
            </Text>
            {otherDishes.length > 0 && (
              <>
                <Text className="ml-1 text-slate-600 text-sm font-medium">
                  +{otherDishes.length}
                </Text>
              </>
            )}

            <FontAwesome
              name="chevron-right"
              size={11}
              color="#475569"
              className="ml-1 mt-[1px]"
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Dish Sidebar Modal */}
      <Modal
        visible={showDishSidebar}
        transparent={true}
        animationType="none"
        onRequestClose={closeDishSidebar}
      >
        <View className="flex-1 bg-black/50">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={closeDishSidebar}
          />

          <Animated.View
            style={{
              transform: [{ translateX: slideAnim }],
            }}
            className="absolute right-0 top-0 bottom-0 w-96 bg-white shadow-lg"
          >
            <View className="flex-1 mt-10">
              {/* Header */}
              <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
                <View>
                  <Text className="text-lg font-bold text-gray-900">
                    {restaurantName || "Restaurant Dishes"}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {restaurantDishes.length} dishes available
                  </Text>
                </View>
                <TouchableOpacity onPress={closeDishSidebar} className="p-2">
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Dishes List */}
              <ScrollView className="flex-1 px-4 py-2">
                {restaurantDishes.map((dish, index) => (
                  <TouchableOpacity
                    key={dish.id}
                    className={`p-4 mb-3 rounded-lg border ${
                      dish.id === currentDishId
                        ? "border-yellow-500 bg-yellow-50"
                        : "border-gray-200 bg-white"
                    }`}
                    activeOpacity={0.7}
                    onPress={() => handleDishPress(dish)}
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1 mr-3">
                        <Text className="font-bold text-gray-900 text-base mb-1">
                          {dish.name}
                        </Text>
                        <View
                          className={`self-start px-2 py-1 rounded-full ${getDishTypeColor(
                            dish.dishType
                          )} mb-2`}
                        >
                          <Text className="text-xs font-medium">
                            {dish.category}
                          </Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                          {renderRating(dish.rating)}
                          <Text className="font-bold text-yellow-600">
                            ${dish.price}
                          </Text>
                        </View>
                      </View>

                      {dish.id === currentDishId && (
                        <View className="bg-yellow-500 rounded-full absolute right-1 w-6 h-6 items-center justify-center">
                          <FontAwesome name="check" size={12} color="white" />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};
