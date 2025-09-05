import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
  Dimensions,
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
  const [slideAnim] = useState(
    new Animated.Value(Dimensions.get("window").width)
  );

  const currentDish = restaurantDishes.find(
    (dish) => dish.id === currentDishId
  ) ||
    restaurantDishes[0] || { name: title, category: "Main", rating, price };

  const otherDishes = restaurantDishes.filter(
    (dish) => dish.id !== currentDishId
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
      toValue: Dimensions.get("window").width,
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
        <View className="flex-1 bg-black/40">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={closeDishSidebar}
          />

          <Animated.View
            style={{
              transform: [{ translateX: slideAnim }],
              width: Dimensions.get("window").width * 0.85,
            }}
            className="absolute right-0 top-0 bottom-0 bg-white rounded-l-2xl shadow-2xl max-w-[400px]"
          >
            <View className="flex-1 mt-10">
              {/* Header */}
              <View className="flex-row items-center justify-between p-6 border-b border-gray-100">
                <View className="w-[70%]">
                  <Text className="text-xl font-bold text-gray-900">
                    {restaurantName || "Restaurant Dishes"}
                  </Text>
                  <Text className="text-base text-gray-500 mt-1">
                    {restaurantDishes.length} dishes available
                  </Text>
                </View>
                <View className="w-[30%]">
                  <TouchableOpacity
                    onPress={closeDishSidebar}
                    className="p-3 bg-gray-100 rounded-full"
                  >
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Dishes List */}
              <ScrollView
                className="flex-1 px-6 py-4"
                showsVerticalScrollIndicator={false}
              >
                {restaurantDishes.map((dish, index) => (
                  <TouchableOpacity
                    key={dish.id}
                    className={`p-5 mb-4 rounded-2xl shadow-sm border ${
                      dish.id === currentDishId
                        ? "border-amber-300 bg-amber-50"
                        : "border-gray-200 bg-white"
                    }`}
                    activeOpacity={0.8}
                    onPress={() => handleDishPress(dish)}
                  >
                    <View className="relative">
                      {" "}
                      {/* Added relative for absolute positioning */}
                      <View className="flex-row items-start justify-between">
                        <View className="flex-1 mr-4">
                          <Text className="font-semibold text-xl text-gray-900 mb-2">
                            {" "}
                            {/* Bolder, larger name */}
                            {dish.name}
                          </Text>
                          <View className="flex-row items-center mb-3">
                            <View
                              className={`px-3 py-1.5 rounded-full ${getDishTypeColor(
                                dish.dishType
                              )}`}
                            >
                              <Text className="text-sm font-medium">
                                {dish.category}
                              </Text>
                            </View>
                            {dish.is_recommended && (
                              <View className="ml-3 bg-amber-500 rounded-full px-3 py-1.5 flex-row items-center">
                                <FontAwesome
                                  name="star"
                                  size={12}
                                  color="white"
                                  className="mr-1"
                                />
                                <Text className="text-white text-sm font-semibold">
                                  Recommended
                                </Text>
                              </View>
                            )}
                          </View>
                          <View className="flex-row items-center justify-between">
                            {renderRating(dish.rating)}
                            <Text className="font-bold text-amber-600 text-xl">
                              {" "}
                              {/* Larger price */}${dish.price}
                            </Text>
                          </View>
                        </View>

                        {dish.id === currentDishId && (
                          <View className="bg-amber-500 rounded-full absolute right-0 top-0 w-8 h-8 items-center justify-center">
                            <FontAwesome name="check" size={16} color="white" />
                          </View>
                        )}
                      </View>
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
