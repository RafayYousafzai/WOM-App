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
  profileUserId,
}) {
  const { supabase } = useSupabase();
  const { user } = useUser();
  const { user: authUser } = useUser();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    console.log(`Fetching posts for filter: ${activeFilter}`);

    try {
      setLoading(true);
      setPosts([]);
      setError(null);

      let postsData;

      if (activeFilter === "tags") {
        // Get the profile user's username first
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("username")
          .eq("id", profileUserId)
          .single();

        if (userError) throw userError;

        if (!userData?.username) {
          // If user doesn't have a username, return empty array
          setPosts([]);
          setLoading(false);
          return;
        }

        // Find posts where the profile user's username is in the 'people' array
        const { data: taggedPosts, error: postsError } = await supabase
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
          .contains("people", [userData.username]) // Check if username is in the people array
          .neq("user_id", profileUserId) // Exclude posts by the profile user themselves
          .order("created_at", { ascending: false });

        if (postsError) throw postsError;
        postsData = taggedPosts || [];
      } else {
        // Original logic for reviews and own_reviews
        const isReview = activeFilter === "reviews" ? true : false;

        const { data: fetchedPosts, error: postsError } = await supabase
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
          .eq("user_id", profileUserId)
          .eq("is_review", isReview)
          .order("created_at", { ascending: false });

        if (postsError) throw postsError;
        postsData = fetchedPosts;
      }

      // Process posts to extract images from dishes
      const postsWithImages = postsData.map((post) => {
        const images = post.post_dishes
          .flatMap((dish) => dish.image_urls || [])
          .filter((url) => url);

        return {
          ...post,
          images,
          dishes: post.post_dishes || [],
          isLiked:
            post.post_likes?.some((like) => like.user_id === user.id) || false,
          likesCount: post.post_likes?.length || 0,
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
          <Text className="text-gray-400 mt-4 text-center">
            {activeFilter === "tags"
              ? "No tagged posts found"
              : "No posts found"}
          </Text>
        </View>
      )}
    </View>
  );
}
