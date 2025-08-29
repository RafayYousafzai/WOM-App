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

const shortenString = (str, maxLength = 20) => {
  if (typeof str !== "string" || str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
};

const ReviewsList = ({ limit = 20 }) => {
  const { posts, loading, error } = useDishesHandler();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

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
    <ScrollView
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
                      }}
                      resizeMode="cover"
                    />
                  </View>

                  <View className="flex-1 px-3 py-1">
                    <Text
                      className="text-gray-800 text-lg font-semibold capitalize"
                      numberOfLines={1}
                    >
                      {post.gatekeeping
                        ? post.restaurants?.location || "Unnamed Restaurant"
                        : "Private."}
                    </Text>

                    {post.review && (
                      <Text
                        className="text-gray-800 text-base leading-relaxed font-normal"
                        numberOfLines={2}
                      >
                        {post.review}
                      </Text>
                    )}

                    <View className="flex-row flex-wrap">
                      {post?.post_dishes?.map((dish, index) => (
                        <View key={index} className="mr-2 mb-2">
                          <Text className="text-xs capitalize font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full tracking-wide">
                            {dish.dish_name || "?"}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {!post.gatekeeping && post.restaurants.location && (
                      <View className="flex-row items-center mb-2 mt-auto">
                        <Ionicons name="location" size={14} color="#ffd100" />
                        <Text
                          className="text-gray-600 ml-1 text-xs font-medium flex-1"
                          numberOfLines={1}
                        >
                          {shortenString(post.restaurants.location, 20)}
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

                        {post.gatekeeping && (
                          <View className="flex-row items-center bg-amber-100 px-3 py-1 rounded-full">
                            <Ionicons
                              name="lock-closed"
                              size={14}
                              color="#ffd100"
                            />
                            <Text className="text-amber-700 ml-1 text-xs font-bold uppercase tracking-wide">
                              Private
                            </Text>
                          </View>
                        )}
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
    </ScrollView>
  );
};

export default ReviewsList;
