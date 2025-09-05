import { useDishesHandler } from "@/hooks/useSearch";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useGlobal } from "@/context/globalContext";

const shortenString = (str, maxLength = 20) => {
  if (typeof str !== "string" || str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
};

const ReviewsList = ({ limit = 20 }) => {
  const { posts, loading, error } = useDishesHandler();
  console.log(posts[0]?.post_tags);

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
            We couldn't load the reviews right now. Please try again later.
          </Text>
        </View>
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
          <Text className="text-5xl font-bold text-gray-900 mb-2">Reviews</Text>
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
          {posts.slice(0, limit).map((post, index) => (
            <TouchableOpacity
              key={`${post.uuid_id}-${index}`}
              className="my-2"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 8,
              }}
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
                          post?.post_dishes[0]?.image_urls[0] ||
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
                    <Text
                      className="text-gray-800 text-lg font-semibold capitalize"
                      numberOfLines={2}
                    >
                      {post.review}
                    </Text>

                    {post?.post_tags?.length > 0 ? (
                      <View className="flex-row flex-wrap">
                        {post.post_tags.slice(0, 2).map((tagObj, index) => (
                          <View key={index} className="py-1 mr-2 mb-2">
                            <Text className="text-gray-700 text-xs bg-slate-50 px-1 py-1 rounded-full">
                              {tagObj?.tags?.name || "?"}
                            </Text>
                          </View>
                        ))}

                        {post.post_tags.length > 2 && (
                          <View className="py-1 mr-2 mb-2">
                            <Text className="text-gray-700 text-xs bg-slate-50 px-2 py-1 rounded-full">
                              +{post.post_tags.length - 2}
                            </Text>
                          </View>
                        )}
                      </View>
                    ) : (
                      <View className="flex-row flex-wrap">
                        <View key={index} className="mb-2">
                          <Text className="text-gray-700 text-xs bg-slate-50 px-2 py-1 rounded-full">
                            No Tags
                          </Text>
                        </View>
                      </View>
                    )}

                    {!post.gatekeeping && post.restaurants?.location && (
                      <View className="flex-row items-center mb-2 mt-auto">
                        <Ionicons name="location" size={14} color="#ffd100" />
                        <Text
                          className="text-gray-600 ml-1 text-xs font-medium flex-1"
                          numberOfLines={1}
                        >
                          {shortenString(post.restaurants?.location, 20)}
                        </Text>
                      </View>
                    )}

                    {post.gatekeeping && (
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

                    <View className="flex-row items-center justify-between  ">
                      <View className="flex-row items-center">
                        <View className="flex-row items-center gap-4">
                          <View className="flex-row items-center  rounded-full">
                            <Ionicons name="star" size={14} color="#ffd100" />
                            <Text className="text-yellow-700 ml-1 text-xs font-semibold">
                              {(post.restaurants?.rating || 0).toFixed(1)}
                            </Text>
                          </View>
                          {post.people?.length > 0 && (
                            <View className="flex-row items-center   rounded-full ">
                              <Ionicons
                                name="people"
                                size={14}
                                color="#e73c3e"
                              />
                              <Text className="text-pink-700 ml-1 text-xs font-semibold">
                                +{post.people.length}
                              </Text>
                            </View>
                          )}
                          <Text className="text-gray-400 text-xs">
                            {formatDate(post.created_at)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View className="flex-row items-center mt-2">
                      <View className="relative">
                        <Image
                          source={{
                            uri:
                              post.users.image_url ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                post.users.full_name || "User"
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
                          {post.anonymous
                            ? "Anonymous Foodie"
                            : post.users.full_name || "User"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {(!posts || posts.length === 0) && (
          <View className="items-center py-16">
            <View className="bg-white rounded-2xl p-8 shadow-lg items-center">
              <View className="bg-orange-100 rounded-full p-6 mb-6">
                <Ionicons name="restaurant" size={48} color="#ffd100" />
              </View>
              <Text className="text-gray-900 text-2xl font-bold mb-2">
                No reviews found
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

export default ReviewsList;
