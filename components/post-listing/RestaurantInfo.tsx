import type React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";

interface RestaurantInfoProps {
  restaurantName: string;
  location: string;
  rating: number;
  price: number;
  cuisine: string;
  onRestaurantPress?: () => void;
  isInModal?: boolean; // Add this prop to detect modal context
}

export const RestaurantInfo: React.FC<RestaurantInfoProps> = ({
  restaurantName,
  location,
  rating,
  price,
  cuisine,
  onRestaurantPress,
  isInModal = false,
}) => {
  const renderPriceLevel = () => {
    return <Text className="text-gray-500 text-sm">${price}</Text>;
  };

  const renderRating = () => {
    return (
      <View className="flex-row items-center">
        <FontAwesome name="star" size={12} color="#FFD700" />
        <Text className="ml-1 text-sm text-gray-700">{rating.toFixed(1)}</Text>
      </View>
    );
  };

  const handleLocationPress = () => {
    router.push(`/restaurant-info/${encodeURIComponent(location)}`);
  };

  return (
    <TouchableOpacity
      className="py-3 px-1"
      onPress={handleLocationPress}
      activeOpacity={0.7}
    >
      {/* Info row */}
      <View className="flex-row items-center justify-between">
        {/* Left side: Location */}
        <View className="flex-row items-center flex-1 mr-4">
          {(() => {
            const [firstPart, ...rest] = location.split(",");
            return (
              <Text
                className="text-gray-800 text-sm ml-1 flex-1"
                numberOfLines={1}
              >
                <Text className="font-bold">{firstPart}</Text>
                {rest.length > 0 && `,${rest.join(",")}`}
              </Text>
            );
          })()}
        </View>

        {/* Right side: Rating, Price, Cuisine */}
        <View className="flex-row items-center">
          {renderRating()}
          <Text className="mx-2 text-gray-300">•</Text>
          {renderPriceLevel()}
          <Text className="mx-2 text-gray-300">•</Text>
          <Text className="text-gray-500 text-sm">{cuisine}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
