import { useDishesHandler } from "@/hooks/useSearch";
import { useSearch } from "@/context/searchContext";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const shortenString = (str, maxLength = 20) => {
  if (typeof str !== "string" || str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
};

const DishList = ({ limit = 20 }) => {
  const { posts, loading, error, reviewStatus } = useDishesHandler();
  const { selectedFilters, searchQuery } = useSearch();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating / 2);
    const hasHalfStar = rating % 2 >= 1;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={14} color="#FFD700" />);
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={14} color="#FFD700" />
      );
    }

    return stars;
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <View className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <Text className="text-gray-600 text-base">Loading reviews...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text className="text-red-600 text-base mt-2">
          Error loading reviews
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      showsVerticalScrollIndicator={false}
    >
      <View className="px-4 py-2">
        <Text className="text-2xl font-bold text-gray-900 mb-6 mt-2">
          Reviews
        </Text>

        {posts?.map((post) => {
          return (
            <View
              key={post.id}
              className="bg-white rounded-xl mb-6 border border-gray-100 shadow-sm"
            >
              <View className="flex-row">
                {/* Left side - Dish Images */}
                <View style={{ width: "40%" }} className="p-3">
                  <View className="mb-3">
                    <Image
                      source={{
                        uri: post?.post_dishes[0]?.image_urls[0] || "",
                      }}
                      style={{
                        width: "100%",
                        aspectRatio: 1,
                        borderRadius: 12,
                      }}
                      resizeMode="cover"
                    />
                  </View>
                </View>

                {/* Right side - Main Content */}
                <View className="flex-1 p-4" style={{ minWidth: 0 }}>
                  <View className="flex-row items-center mb-3">
                    <Image
                      source={{
                        uri:
                          post.users?.image_url ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            post.users?.full_name || "User"
                          )}&background=3B82F6&color=fff&size=80`,
                      }}
                      style={{ width: 40, height: 40, borderRadius: 20 }}
                      className="mr-3"
                    />
                    <View className="flex-1" style={{ minWidth: 0 }}>
                      <Text
                        className="font-semibold text-gray-900 text-base"
                        numberOfLines={1}
                      >
                        {post.anonymous
                          ? "Anonymous"
                          : post.users?.full_name || "User"}
                      </Text>

                      {post.gatekeeping !== true &&
                        post.restaurants?.location && (
                          <View className="flex-row items-center mb-2">
                            <Ionicons
                              name="location-outline"
                              size={14}
                              color="#6B7280"
                            />
                            <Text
                              className="text-gray-600 ml-1 text-sm flex-1"
                              numberOfLines={2}
                            >
                              {shortenString(post.restaurants?.location, 18)}
                            </Text>
                          </View>
                        )}
                    </View>
                  </View>

                  <View className="mb-3 flex-row items-center justify-between">
                    {/* Star rating */}
                    <View className="flex-row items-center">
                      {renderStars(post.restaurants?.rating || 0)}
                      <Text className="text-gray-500 ml-2 text-sm">
                        ({post.restaurants?.rating || 0})
                      </Text>
                    </View>
                    {post.people && post.people.length > 0 && (
                      <View className="flex-row items-center mr-4">
                        <Ionicons
                          name="people-outline"
                          size={14}
                          color="#6B7280"
                        />
                        <Text className="text-gray-600 ml-1 text-sm">
                          +{post.people.length}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text className="text-gray-800 text-base leading-relaxed mb-4 font-medium">
                    {post.review}
                  </Text>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      {post.gatekeeping === true && (
                        <View className="flex-row items-center">
                          <Ionicons
                            name="lock-closed"
                            size={16}
                            color="#F59E0B"
                          />
                          <Text className="text-amber-600 ml-1 text-sm font-medium">
                            Private
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </View>
          );
        })}

        {(!posts || posts.length === 0) && (
          <View className="items-center py-12">
            <Ionicons name="restaurant-outline" size={48} color="#D1D5DB" />
            <Text className="text-gray-500 text-lg font-medium mt-4">
              No reviews yet
            </Text>
            <Text className="text-gray-400 text-center mt-1">
              Be the first to share your experience!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default DishList;
