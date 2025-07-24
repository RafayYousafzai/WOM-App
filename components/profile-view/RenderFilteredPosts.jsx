import { View, Text, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import GridDynamicCards from "../dynamic-cards/GridDynamicCards";
import { Feather } from "@expo/vector-icons";
import { useSupabase } from "@/context/supabaseContext";
import { useUser } from "@clerk/clerk-expo";

export default function RenderFilteredPosts({
  activeFilter: table_name,
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
    console.log(`Fetching posts for filter: ${table_name}`);

    try {
      setLoading(true);
      setPosts([]);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from(table_name)
        .select(
          `*,
          user:user_id (
            username,
            first_name,
            last_name,
            image_url
          ),
          ${table_name.slice(0, -1)}_likes (
            user_id
          ) 
        `
        )
        .eq("user_id", user.id);

      if (supabaseError) {
        throw supabaseError;
      }

      setPosts(data || []);
    } catch (err) {
      console.error("Error fetching posts:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPosts();
  }, [table_name, refreshCount]);

  if (loading) {
    return (
      <View className="flex-1 items-center mt-10 justify-center">
        <ActivityIndicator size="small" color="#f39f1e" />
      </View>
    );
  }

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
        <GridDynamicCards posts={posts} scroll={false} />
      ) : (
        <View className="items-center justify-center py-10">
          <Feather name="image" size={50} color="#ccc" />
          <Text className="text-gray-400 mt-4 text-center">No posts found</Text>
        </View>
      )}
    </View>
  );
}
