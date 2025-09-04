import { View, Text, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import GridDynamicCards from "../dynamic-cards/GridDynamicCards";
import { Feather } from "@expo/vector-icons";
import { useSupabase } from "@/context/supabaseContext";
import { useUser } from "@clerk/clerk-expo";

export default function RenderFilteredPosts({
  activeFilter,
  title,
  refreshCount,
  setRefreshCount,
}) {
  const { supabase } = useSupabase();
  const { user } = useUser();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    console.log(`Fetching posts for filter: ${activeFilter}`);

    try {
      setLoading(true);
      setPosts([]);
      setError(null);

      const isReview = activeFilter === "reviews" ? true : false;

      // Fetch posts with their related dishes
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(
          `*,
          user:user_id (
            username,
            first_name,
            last_name,
            image_url
          ),
          restaurant:restaurant_id (*),
          post_dishes (*),
            post_likes(user_id)
        `
        )
        .eq("user_id", user.id)
        .eq("is_review", isReview)
        .order("created_at", { ascending: false });

      if (postsError) {
        throw postsError;
      }

      // Process posts to extract images from dishes
      const postsWithImages = postsData.map((post) => {
        // Extract all images from all dishes in this post
        const images = post.post_dishes
          .flatMap((dish) => dish.image_urls || [])
          .filter((url) => url); // Remove any empty/null URLs

        return {
          ...post,
          images, // Add images array to the post object
          dishes: post.post_dishes || [],
          isLiked:
            post.post_likes?.some((like) => like.user_id === user.id) || false,
        };
      });

      console.log(
        `Fetched ${postsWithImages.length} posts for filter: ${activeFilter}`
      );
      setPosts(postsWithImages || []);
    } catch (err) {
      console.error("Error fetching posts:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeFilter, refreshCount]);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Feather name="alert-circle" size={50} color="#ff4444" />
        <Text className="mt-4 text-red-500">Error loading posts</Text>
        <Text className="text-gray-500">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {posts.length > 0 ? (
        <GridDynamicCards posts={posts} scroll={false} loading={loading} />
      ) : (
        <View className="items-center justify-center py-10">
          <Feather name="image" size={50} color="#ccc" />
          <Text className="text-gray-400 mt-4 text-center">No posts found</Text>
        </View>
      )}
    </View>
  );
}
