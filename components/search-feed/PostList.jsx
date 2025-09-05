import { useDishesHandler } from "@/hooks/useSearch";
import { useSearch } from "@/context/searchContext";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useGlobal } from "@/context/globalContext";

const shortenString = (str, maxLength = 20) => {
  if (typeof str !== "string" || str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
};

const DishList = ({ limit = 20 }) => {
  const { posts, loading, error, reviewStatus } = useDishesHandler();

  // Transform posts into dishes array
  const dishes = transformPostsToDishes(posts || []);

  console.log(dishes[3]?.dish?.post_tags);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };
  const { setRenderPosts } = useGlobal();
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center h-screen">
        <ActivityIndicator size="large" color="#fb923c" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center px-6">
        <View className="bg-white rounded-2xl p-8 shadow-lg items-center">
          <View className="bg-red-100 rounded-full p-4 mb-4">
            <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
          </View>
          <Text className="text-gray-900 text-xl font-bold mb-2">
            Oops! Something went wrong
          </Text>
          <Text className="text-gray-600 text-center text-base">
            We couldn't load the dishes right now. Please try again later.
          </Text>
        </View>
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-600">No dishes found.</Text>
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-slate-50"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View className="px-4 py-6 mt-3">
        <View className="mb-8">
          <Text className="text-5xl font-bold text-gray-900 mb-2">Dishes</Text>
        </View>

        <View
          className="bg-white rounded-2xl mb-6 shadow-md gap-4 p-4"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          {dishes.slice(0, limit).map((dishEntry, index) => (
            <TouchableOpacity
              key={`${dishEntry.dish.uuid_id}-${index}`}
              className="my-2"
              onPress={() => {
                // normalize shape so Posts screen can use it
                const normalizedPosts = posts.map((p) => {
                  const images =
                    p.post_dishes
                      ?.flatMap((dish) => dish.image_urls || [])
                      .filter((url) => url) || [];

                  return {
                    ...p,
                    images,
                    dishes: p.post_dishes || [],
                    isLiked: false, // or add your like logic
                    user: p.users
                      ? {
                          id: p.users.id,
                          // Fix: Include both name formats for compatibility
                          name: p.users.full_name || "Unknown",
                          first_name:
                            p.users.full_name?.split(" ")[0] || "Unknown",
                          last_name:
                            p.users.full_name?.split(" ").slice(1).join(" ") ||
                            "",
                          image_url: p.users.image_url ?? null,
                        }
                      : null,
                    restaurant: p.restaurants, // rename for consistency
                  };
                });

                setRenderPosts({
                  posts: normalizedPosts,
                  loading: false,
                  initialScrollIndex: index,
                });

                router.push("/posts");
              }}
            >
              <View className="overflow-hidden rounded-2xl">
                <View className="flex-row">
                  <View style={{ width: "42%" }} className="relative flex">
                    <Image
                      source={{
                        uri:
                          dishEntry.dish.image_urls?.[0] ||
                          "https://via.placeholder.com/150",
                      }}
                      style={{
                        width: "100%",
                        flex: 1,
                        borderRadius: 16,
                        minHeight: 140,
                      }}
                      resizeMode="cover"
                    />
                  </View>

                  <View className="flex-1 px-3 py-1">
                    {/* Dish and User Info Section */}
                    <Text
                      className="text-gray-800 text-lg font-semibold capitalize"
                      numberOfLines={1}
                    >
                      {dishEntry.dish.dish_name || "Unnamed Dish"}
                    </Text>
                    {/* Review and Tags */}
                    {dishEntry.dish.review && (
                      <Text
                        className="text-gray-800 text-base leading-relaxed font-normal"
                        numberOfLines={1}
                      >
                        {dishEntry.dish.review}
                      </Text>
                    )}
                    {dishEntry?.dish?.post_tags &&
                      dishEntry.dish.post_tags.length > 0 && (
                        <View className="flex-row flex-wrap">
                          {dishEntry.dish.post_tags
                            .slice(0, 2)
                            .map((tag, index) => (
                              <View key={index} className="py-1 mr-2">
                                <Text className="text-gray-700 text-xs bg-slate-50 px-1 py-1 rounded-full">
                                  {tag?.tags?.name || "?"}
                                </Text>
                              </View>
                            ))}

                          {dishEntry.dish.post_tags.length > 2 && (
                            <View className="py-1 mr-2 mb-2">
                              <Text className="text-gray-700 text-xs bg-slate-50 px-2 py-1 rounded-full">
                                +{dishEntry.dish.post_tags.length - 2}
                              </Text>
                            </View>
                          )}
                        </View>
                      )}

                    {/* Restaurant and Rating */}
                    {!dishEntry.dish.gatekeeping &&
                      dishEntry.restaurant?.location && (
                        <View className="flex-row items-center mb-2 mt-auto">
                          <Ionicons name="location" size={14} color="#ffd100" />
                          <Text
                            className="text-gray-600 ml-1 text-xs font-medium flex-1"
                            numberOfLines={1}
                          >
                            {shortenString(dishEntry.restaurant?.location, 20)}
                          </Text>
                        </View>
                      )}
                    {dishEntry.dish.gatekeeping && (
                      <View className="flex-row items-center mb-2 mt-auto">
                        <Ionicons
                          name="lock-closed"
                          size={14}
                          color="#ffd100"
                        />
                        <Text
                          className="text-gray-600 ml-1 text-xs font-medium flex-1"
                          numberOfLines={1}
                        >
                          Private
                        </Text>
                      </View>
                    )}
                    {/* Footer */}
                    <View className="flex-row items-center justify-between  ">
                      <View className="flex-row items-center">
                        <View className="flex-row items-center gap-4">
                          <View className="flex-row items-center  rounded-full">
                            <Ionicons name="star" size={14} color="#ffd100" />
                            <Text className="text-yellow-700 ml-1 text-xs font-semibold">
                              {(dishEntry.dish.rating || 0).toFixed(1)}
                            </Text>
                          </View>
                          {dishEntry.dish.people?.length > 0 && (
                            <View className="flex-row items-center   rounded-full ">
                              <Ionicons
                                name="people"
                                size={14}
                                color="#e73c3e"
                              />
                              <Text className="text-pink-700 ml-1 text-xs font-semibold">
                                +{dishEntry.dish.people.length}
                              </Text>
                            </View>
                          )}
                          <Text className="text-gray-400 text-xs">
                            {formatDate(dishEntry.dish.created_at)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View className="flex-row items-center mt-2">
                      <View className="relative">
                        <Image
                          source={{
                            uri:
                              dishEntry.user?.image_url ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                dishEntry.user?.full_name || "User"
                              )}&background=ffd100&color=fff&size=80`,
                          }}
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 22,
                            borderWidth: 2,
                            borderColor: "#ffd100",
                          }}
                          className="mr-3"
                        />
                      </View>
                      <View className="flex-1 " style={{ minWidth: 0 }}>
                        <Text
                          className=" text-gray-700 text-base"
                          numberOfLines={1}
                        >
                          {dishEntry.dish.anonymous
                            ? "Anonymous Foodie"
                            : dishEntry.user?.full_name || "User"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {(!dishes || dishes.length === 0) && (
          <View className="items-center py-16">
            <View className="bg-white rounded-2xl p-8 shadow-lg items-center">
              <View className="bg-orange-100 rounded-full p-6 mb-6">
                <Ionicons name="restaurant" size={48} color="#ffd100" />
              </View>
              <Text className="text-gray-900 text-2xl font-bold mb-2">
                No dishes found
              </Text>
              <Text className="text-gray-600 text-center text-base leading-relaxed max-w-xs">
                Be the first to share your amazing dining experience with our
                community!
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default DishList;

function transformPostsToDishes(posts) {
  const dishArray = [];

  posts.forEach((post) => {
    // Check if post exists and has required properties
    if (!post || !post.id) {
      return;
    }

    // Check if post_dishes exists and is an array
    if (!post.post_dishes || !Array.isArray(post.post_dishes)) {
      return;
    }

    post.post_dishes.forEach((dish) => {
      const dishEntry = {
        dish: {
          ...dish,
          post_id: post.id,
          created_at: post.created_at,
          updated_at: post.updated_at,
          review: post.review,
          is_review: post.is_review,
          anonymous: post.anonymous,
          gatekeeping: post.gatekeeping,
          uuid_id: post.uuid_id,
          people: post.people || [],
          post_tags: post.post_tags || [],
        },
        restaurant: post.restaurants
          ? {
              id: post.restaurants.id,
              location: post.restaurants.location,
              rating: post.restaurants.rating,
              created_at: post.restaurants.created_at,
              updated_at: post.restaurants.updated_at,
              latitude: post.restaurants.latitude,
              longitude: post.restaurants.longitude,
            }
          : null,
        user: post.users
          ? {
              id: post.users.id,
              full_name: post.users.full_name,
              username: post.users.username,
              image_url: post.users.image_url,
            }
          : null,
      };
      dishArray.push(dishEntry);
    });
  });

  return dishArray;
}
