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

  // Sample data for demonstration (remove when you have real data)
  const sampleDishes =
    restaurantDishes.length > 0
      ? restaurantDishes
      : [
          {
            id: 1,
            name: title || "Signature Pasta",
            price: price || 25,
            category: "Main Course",
            rating: rating || 4.5,
            review: "Absolutely delicious! The flavors blend perfectly.",
            dishType: "main",
          },
          {
            id: 2,
            name: "Truffle Risotto",
            price: 32,
            category: "Main Course",
            rating: 4.8,
            review: "Rich and creamy with authentic truffle flavor.",
            dishType: "main",
          },
        ];

  const currentDish =
    sampleDishes.find((dish) => dish.id === currentDishId) || sampleDishes[0];
  const otherDishes = sampleDishes.filter((dish) => dish.id !== currentDishId);

  const renderPriceLevel = (dishPrice = price) => {
    return <Text className="text-gray-500 text-sm">${dishPrice}</Text>;
  };

  const renderRating = (dishRating = rating) => {
    const stars = [];
    const fullStars = Math.floor(dishRating);
    const hasHalfStar = dishRating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
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
        return "bg-blue-100 text-blue-800";
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
            <Text className="font-bold ml-1 text-xl text-gray-900">
              {currentDish.name}
            </Text>
          </View>

          {/* Show dish options button if there are other dishes */}
          {otherDishes.length > 0 && (
            <>
              <View className={`bg-slate-200 px-3 py-2 rounded-lg mr-3 `}>
                <Text className="text-slate-600 text-sm font-medium">
                  {currentDish.category}
                </Text>
              </View>
              <TouchableOpacity
                onPress={openDishSidebar}
                className="bg-slate-200 px-3 py-2 rounded-lg flex-row items-center"
                activeOpacity={0.7}
              >
                {/* <FontAwesome name="cutlery" size={14} color="#475569" /> */}
                <Text className="ml-1 text-slate-600 text-sm font-medium">
                  +{otherDishes.length} dishes
                </Text>

                <FontAwesome
                  name="chevron-right"
                  size={12}
                  color="#475569"
                  className="ml-1"
                />
              </TouchableOpacity>
            </>
          )}
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
                    {sampleDishes.length} dishes available
                  </Text>
                </View>
                <TouchableOpacity onPress={closeDishSidebar} className="p-2">
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Dishes List */}
              <ScrollView className="flex-1 px-4 py-2">
                {sampleDishes.map((dish, index) => (
                  <TouchableOpacity
                    key={dish.id}
                    className={`p-4 mb-3 rounded-lg border ${
                      dish.id === currentDishId
                        ? "border-blue-500 bg-blue-50"
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
                        <Text
                          className="text-gray-600 text-sm mb-2"
                          numberOfLines={2}
                        >
                          {dish.review}
                        </Text>
                        <View className="flex-row items-center justify-between">
                          {renderRating(dish.rating)}
                          <Text className="font-bold text-blue-600">
                            ${dish.price}
                          </Text>
                        </View>
                      </View>

                      {dish.id === currentDishId && (
                        <View className="bg-blue-500 rounded-full w-6 h-6 items-center justify-center">
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
