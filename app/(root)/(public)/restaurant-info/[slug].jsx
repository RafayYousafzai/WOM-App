"use client";

import { useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  ScrollView,
  Linking,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { getPostsByRestaurantLocation } from "@/lib/supabase/postsAction";
import { useSupabase } from "@/context/supabaseContext"; // Adjust path as needed
import { router } from "expo-router";
import { useGlobal } from "@/context/globalContext";

// --- SECURITY WARNING ---
// It is NOT recommended to store your API key directly in your app's code.
// For a real application, you should fetch this from a secure backend server
// or use a service like Firebase Cloud Functions to make the API call.
// This example includes it for simplicity.
const Maps_API_KEY = "AIzaSyDLcdnqXezTGgGv_-ylE-CjywMLiP6-yUs"; // <-- PASTE YOUR KEY HERE

export default function VisitProfileScreen() {
  const { slug } = useLocalSearchParams();
  const location = decodeURIComponent(slug);
  const { setRenderPosts } = useGlobal();

  const [restaurantData, setRestaurantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("google");
  const [wordOfMouthPosts, setWordOfMouthPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const { supabase } = useSupabase();
  useEffect(() => {
    if (!location) return;

    const fetchRestaurantData = async () => {
      setLoading(true);
      setError(null);
      setRestaurantData(null);

      try {
        // --- Step 1: Text Search to find the Place ID ---
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
          location
        )}&key=${Maps_API_KEY}`;

        const searchResponse = await fetch(searchUrl);
        const searchResult = await searchResponse.json();

        if (searchResult.status !== "OK" || searchResult.results.length === 0) {
          throw new Error("Could not find a matching location.");
        }

        const placeId = searchResult.results[0].place_id;

        // --- Step 2: Place Details to get rich data ---
        const fields =
          "name,formatted_address,rating,reviews,photos,website,formatted_phone_number,opening_hours";
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${Maps_API_KEY}`;

        const detailsResponse = await fetch(detailsUrl);
        const detailsResult = await detailsResponse.json();

        if (detailsResult.status !== "OK") {
          throw new Error("Failed to fetch place details.");
        }

        setRestaurantData(detailsResult.result);

        await fetchWordOfMouthPosts(location);
      } catch (err) {
        setError(err.message);
        console.error("API Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [location]);
  const fetchWordOfMouthPosts = async (restaurantLocation) => {
    if (!supabase) {
      console.log("[v0] Supabase client not available yet");
      return;
    }

    setPostsLoading(true);
    try {
      console.log("[v0] Fetching posts for location:", restaurantLocation);
      const posts = await getPostsByRestaurantLocation(
        supabase,
        restaurantLocation
      );
      console.log("[v0] Fetched posts:", posts.length);
      setWordOfMouthPosts(posts);
    } catch (error) {
      console.error("Error fetching word of mouth posts:", error);
      setWordOfMouthPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  const convertGoogleRating = (googleRating) => {
    return (googleRating / 5) * 10;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={16} color="#fbbf24" />);
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={16} color="#fbbf24" />
      );
    }

    const emptyStars = 10 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons
          key={`empty-${i}`}
          name="star-outline"
          size={16}
          color="#d1d5db"
        />
      );
    }

    return stars;
  };

  const renderWordOfMouthPost = (post, index) => (
    <TouchableOpacity
      key={post.id}
      onPress={() => {
        // normalize posts like in DishList
        const normalizedPosts = wordOfMouthPosts.map((p) => ({
          ...p,
          images: p.images || [],
          dishes: p.dishes || [],
          isLiked: false,
          user: p.user
            ? {
                ...p.user,
                name: `${p.user.first_name || ""} ${
                  p.user.last_name || ""
                }`.trim(),
              }
            : null,
          restaurant: p.restaurant || null,
        }));

        setRenderPosts({
          posts: normalizedPosts,
          loading: false,
          initialScrollIndex: index, // start from clicked post
        });

        router.push("/posts");
      }}
    >
      <View className="bg-gray-50 rounded-xl p-4 mb-4">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1">
            <Text className="text-gray-900 font-semibold text-base">
              {post.anonymous
                ? "Anonymous"
                : `${post.user?.first_name} ${post.user?.last_name}`}
            </Text>
            <Text className="text-gray-500 text-sm">
              {new Date(post.created_at).toLocaleDateString()}
            </Text>
          </View>
          {post.rating && (
            <View className="flex-row">{renderStars(post.rating)}</View>
          )}
        </View>
        <Text className="text-gray-700 leading-relaxed mb-3">
          {post.review}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100">
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-white rounded-3xl p-8 shadow-lg items-center">
            <ActivityIndicator size="large" color="#6366f1" />
            <Text className="text-gray-700 text-lg font-medium mt-4 text-center">
              Discovering "{location}"...
            </Text>
            <Text className="text-gray-500 text-sm mt-2 text-center">
              Please wait while we load the details
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gradient-to-br from-red-50 to-pink-100">
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-white rounded-3xl p-8 shadow-lg items-center">
            <View className="bg-red-100 rounded-full p-4 mb-4">
              <Ionicons name="alert-circle" size={32} color="#ef4444" />
            </View>
            <Text className="text-red-600 text-lg font-semibold text-center mb-2">
              Oops! Something went wrong
            </Text>
            <Text className="text-gray-600 text-center">{error}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!restaurantData) {
    return (
      <SafeAreaView className="flex-1 bg-gradient-to-br from-gray-50 to-slate-100">
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-white rounded-3xl p-8 shadow-lg items-center">
            <View className="bg-gray-100 rounded-full p-4 mb-4">
              <Ionicons name="location-outline" size={32} color="#6b7280" />
            </View>
            <Text className="text-gray-700 text-lg font-medium text-center">
              No data available for this location
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        {restaurantData.photos && restaurantData.photos.length > 0 && (
          <View className="relative">
            <Image
              source={{
                uri: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${restaurantData.photos[0].photo_reference}&key=${Maps_API_KEY}`,
              }}
              className="w-full h-80"
              resizeMode="cover"
            />
            <View className="absolute inset-0 bg-black/20" />
            <View className="absolute bottom-6 left-6 right-6">
              <Text className="text-white text-3xl font-bold mb-2 drop-shadow-lg">
                {restaurantData.name}
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="location" size={16} color="white" />
                <Text className="text-white/90 text-base ml-1 flex-1">
                  {restaurantData.formatted_address}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Main Content */}
        <View className="px-6 py-6 space-y-6">
          {/* Rating Card */}
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-gray-600 text-sm font-medium mb-1">
                  Overall Rating
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-3xl font-bold text-gray-900 mr-2">
                    {convertGoogleRating(restaurantData.rating).toFixed(1)}
                  </Text>
                  <View className="flex-row">
                    {renderStars(convertGoogleRating(restaurantData.rating))}
                  </View>
                </View>
              </View>
              <View className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-4">
                <Ionicons name="star" size={24} color="white" />
              </View>
            </View>
          </View>

          {/* Contact Info */}
          {/* Contact Info */}
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Contact Information
            </Text>

            {/* Phone */}
            {restaurantData.formatted_phone_number && (
              <TouchableOpacity
                className="flex-row items-center py-3 border-b border-gray-100"
                onPress={() =>
                  Linking.openURL(
                    `tel:${restaurantData.formatted_phone_number}`
                  )
                }
              >
                <View className="bg-green-100 rounded-full p-2 mr-4">
                  <Ionicons name="call" size={20} color="#22c55e" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-600 text-sm">Phone</Text>
                  <Text className="text-gray-900 font-medium">
                    {restaurantData.formatted_phone_number}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            )}

            {/* Business Hours */}
            {restaurantData.opening_hours?.weekday_text && (
              <View className="flex-row items-start py-3 border-b border-gray-100">
                <View className="bg-yellow-100 rounded-full p-2 mr-4">
                  <Ionicons name="time" size={20} color="#f59e0b" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-600 text-sm">Business Hours</Text>
                  {restaurantData.opening_hours.weekday_text.map((day, idx) => (
                    <Text
                      key={idx}
                      className="text-gray-900 font-medium text-sm"
                    >
                      {day}
                    </Text>
                  ))}
                </View>
              </View>
            )}

            {/* Website */}
            {restaurantData.website && (
              <TouchableOpacity
                className="flex-row items-center py-3"
                onPress={() => Linking.openURL(restaurantData.website)}
              >
                <View className="bg-blue-100 rounded-full p-2 mr-4">
                  <Ionicons name="globe" size={20} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-600 text-sm">Website</Text>
                  <Text className="text-gray-900 font-medium">
                    Visit Menu & More
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>

          {/* Menu Button */}
          {restaurantData.website && (
            <TouchableOpacity
              className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 shadow-lg"
              onPress={() => Linking.openURL(restaurantData.website)}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="restaurant" size={24} color="white" />
                <Text className="text-white text-lg font-semibold ml-2">
                  View Menu & Website
                </Text>
              </View>
            </TouchableOpacity>
          )}

          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Tab Headers */}
            <View className="flex-row">
              <TouchableOpacity
                className={`flex-1 py-4 px-6 ${
                  activeTab === "google" ? "bg-yellow-500" : "bg-gray-50"
                }`}
                onPress={() => setActiveTab("google")}
              >
                <Text
                  className={`text-center font-semibold ${
                    activeTab === "google" ? "text-white" : "text-gray-600"
                  }`}
                >
                  Google Map Reviews
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-4 px-6 ${
                  activeTab === "wordOfMouth" ? "bg-yellow-500" : "bg-gray-50"
                }`}
                onPress={() => setActiveTab("wordOfMouth")}
              >
                <Text
                  className={`text-center font-semibold ${
                    activeTab === "wordOfMouth" ? "text-white" : "text-gray-600"
                  }`}
                >
                  Word of Mouth Reviews
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab Content */}
            <View className="p-6">
              {activeTab === "google" ? (
                // Google Reviews Content
                <View>
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-xl font-bold text-gray-900">
                      Google Reviews
                    </Text>
                    <View className="bg-gray-100 rounded-full px-3 py-1">
                      <Text className="text-gray-600 text-sm font-medium">
                        {restaurantData.reviews?.length || 0} reviews
                      </Text>
                    </View>
                  </View>

                  {restaurantData.reviews &&
                  restaurantData.reviews.length > 0 ? (
                    <View className="space-y-4">
                      {restaurantData.reviews
                        .slice(0, 3)
                        .map((review, index) => (
                          <View
                            key={index}
                            className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                          >
                            <View className="flex-row items-start justify-between mb-2">
                              <View className="flex-1">
                                <Text className="text-gray-900 font-semibold text-base">
                                  {review.author_name}
                                </Text>
                                <Text className="text-gray-500 text-sm">
                                  {review.relative_time_description}
                                </Text>
                              </View>
                              <View className="flex-row">
                                {renderStars(
                                  convertGoogleRating(review.rating)
                                )}
                              </View>
                            </View>
                            <Text className="text-gray-700 leading-relaxed">
                              {review.text}
                            </Text>
                          </View>
                        ))}
                    </View>
                  ) : (
                    <View className="items-center py-8">
                      <View className="bg-gray-100 rounded-full p-4 mb-3">
                        <Ionicons
                          name="chatbubble-outline"
                          size={32}
                          color="#9ca3af"
                        />
                      </View>
                      <Text className="text-gray-500 text-center">
                        No Google reviews available yet
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                // Word of Mouth Reviews Content
                <View>
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-xl font-bold text-gray-900">
                      Word of Mouth Reviews
                    </Text>
                    <View className="bg-gray-100 rounded-full px-3 py-1">
                      <Text className="text-gray-600 text-sm font-medium">
                        {wordOfMouthPosts.length} reviews
                      </Text>
                    </View>
                  </View>

                  {postsLoading ? (
                    <View className="items-center py-8">
                      <ActivityIndicator size="large" color="#6366f1" />
                      <Text className="text-gray-500 text-center mt-2">
                        Loading community reviews...
                      </Text>
                    </View>
                  ) : wordOfMouthPosts.length > 0 ? (
                    <View>{wordOfMouthPosts.map(renderWordOfMouthPost)}</View>
                  ) : (
                    <View className="items-center py-8">
                      <View className="bg-gray-100 rounded-full p-4 mb-3">
                        <Ionicons
                          name="people-outline"
                          size={32}
                          color="#9ca3af"
                        />
                      </View>
                      <Text className="text-gray-500 text-center">
                        No community reviews yet
                      </Text>
                      <Text className="text-gray-400 text-sm text-center mt-1">
                        Be the first to share your experience!
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
