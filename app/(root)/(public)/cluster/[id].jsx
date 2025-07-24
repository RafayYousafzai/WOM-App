import { useLocalSearchParams } from "expo-router";
import { View, Text, ScrollView } from "react-native";
import { useMemo, useEffect, useState } from "react";
import { useSupabase } from "@/context/supabaseContext";
import { useUser } from "@clerk/clerk-expo";
import PostListing from "@/components/post-listing/PostListing";

export default function ViewPost() {
  const { cluster, id } = useLocalSearchParams();
  const { supabase } = useSupabase();
  const { user } = useUser();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const parsedCluster = useMemo(() => {
    if (!cluster) return null;
    try {
      return typeof cluster === "string" ? JSON.parse(cluster) : cluster;
    } catch (err) {
      console.error("Failed to parse cluster:", err);
      return null;
    }
  }, [cluster]);

  useEffect(() => {
    const fetchClusterPosts = async () => {
      if (!parsedCluster || parsedCluster.length === 0) return;

      setLoading(true);

      try {
        const reviewIds = parsedCluster
          .filter((p) => p.source_table === "reviews")
          .map((p) => p.id);

        const ownReviewIds = parsedCluster
          .filter((p) => p.source_table === "own_reviews")
          .map((p) => p.id);

        const [reviewsRes, ownReviewsRes] = await Promise.all([
          reviewIds.length
            ? supabase
                .from("reviews")
                .select(
                  `*,
                   user:user_id (
                     username,
                     first_name,
                     last_name,
                     updated_at,
                     image_url
                   ),
                   review_likes (
                     user_id
                   ),
                   likeCount:review_likes(count)`
                )
                .in("id", reviewIds)
            : { data: [] },
          ownReviewIds.length
            ? supabase
                .from("own_reviews")
                .select(
                  `*,
                   user:user_id (
                     username,
                     first_name,
                     last_name,
                     updated_at,
                     image_url
                   ),
                   own_review_likes (
                     user_id
                   ),
                   likeCount:own_review_likes(count)`
                )
                .in("id", ownReviewIds)
            : { data: [] },
        ]);

        const combined = [...(reviewsRes.data || []), ...(ownReviewsRes.data || [])];
        combined.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

        setPosts(combined);
      } catch (err) {
        console.error("Error fetching cluster posts:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClusterPosts();
  }, [parsedCluster]);

  return (
    <View className="flex-1 bg-white">
      <PostListing
        posts={posts}
        loading={!loading}
        handleEndReached={() => {}}
        handleRefresh={() => {}}
        countryFilterActive={false}
      />
    </View>
  );
}
