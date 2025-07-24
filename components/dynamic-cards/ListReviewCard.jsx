import { useCallback } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { Heart, MapPin, Star } from "lucide-react-native";
import { ImageCarousel } from "./ImageCarousal";
import { useGlobal } from "@/context/globalContext";
import { router } from "expo-router";

export default function ListDynamicCard({ posts, scroll = true }) {
  const { setRenderPosts } = useGlobal();

  const renderListItem = useCallback(
    ({ item, index }) => (
      <View className="flex-row p-4 border-b border-gray-200 bg-white">
        <ImageCarousel images={item.images || []} />
        <TouchableOpacity
          onPress={async () => {
            const allPosts = [...posts];
            setRenderPosts({
              posts: allPosts,
              loading: false,
              initialScrollIndex: index,
            });
            router.push("/posts");
          }}
          activeOpacity={0.7}
          className="flex-1 ml-3 justify-between"
        >
          <View>
            <Text className="font-semibold text-base" numberOfLines={1}>
              {item.restaurant_name || item.caption}
            </Text>

            <View className="flex-row items-center mt-1">
              <Text className="text-gray-600 text-sm" numberOfLines={1}>
                by{" "}
                {item.user?.first_name + " " + item.user?.last_name ||
                  "Anonymous"}
              </Text>
            </View>

            <View className="flex-row items-center mt-1">
              <MapPin size={14} color="#666" />
              <Text className="text-gray-500 text-xs ml-1" numberOfLines={1}>
                {item.location?.address || "Unknown Location"}
              </Text>
            </View>
          </View>
          <View className="flex-row justify-between items-center mt-2">
            <View className="flex-row items-center">
              <Star size={14} color="#FFD700" />
              <Text className="text-gray-700 text-xs ml-1">
                {item.rating?.toFixed(1) || "N/A"}
              </Text>
              {item.price && (
                <Text className="text-gray-500 text-xs ml-3">
                  ${item.price}
                </Text>
              )}
            </View>

            <View className="flex-row items-center">
              <Heart size={14} color="#FF6B6B" />
              <Text className="text-gray-600 text-xs ml-1">
                {item.likeCount?.[0]?.count || 0}
              </Text>
            </View>
          </View>
          <View className="flex-row flex-wrap mt-2">
            {item.amenities?.slice(0, 2).map((amenity, idx) => (
              <View
                key={idx}
                className="bg-gray-100 rounded-full px-2 py-1 mr-1 mb-1"
              >
                <Text className="text-gray-600 text-xs">{amenity}</Text>
              </View>
            ))}
            {item.amenities && item.amenities.length > 3 && (
              <View className="bg-gray-100 rounded-full px-2 py-1 mr-1 mb-1">
                <Text className="text-gray-600 text-xs">
                  +{item.amenities.length - 3}
                </Text>
              </View>
            )}
            {item.cuisines?.slice(0, 2).map((cuisine, idx) => (
              <View
                key={idx}
                className="bg-gray-100 rounded-full px-2 py-1 mr-1 mb-1"
              >
                <Text className="text-gray-600 text-xs">{cuisine}</Text>
              </View>
            ))}
            {item.cuisines && item.cuisines.length > 3 && (
              <View className="bg-gray-100 rounded-full px-2 py-1 mr-1 mb-1">
                <Text className="text-gray-600 text-xs">
                  +{item.cuisines.length - 3}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    ),
    []
  );

  return (
    <View className="flex-1">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={scroll}
        renderItem={renderListItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}
