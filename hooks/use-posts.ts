"use client";

import { useCallback, useRef, useState } from "react";
import { useSupabase } from "@/context/supabaseContext";
import { useUser } from "@clerk/clerk-expo";
import { useToast } from "react-native-toast-notifications";
import { getBlockedUserIds } from "@/lib/supabase/user_blocks";
import { Alert } from "react-native";

const PAGE_SIZE = 10;

interface Post {
  id: string;
  user_id: string;
  updated_at: string;
  anonymous?: boolean;
  user: {
    username: string;
    first_name: string;
    last_name: string;
    updated_at: string;
    image_url: string;
  };
  review_likes?: { user_id: string }[];
  own_review_likes?: { user_id: string }[];
  likeCount: { count: number }[];
}

type TabType = "forYou" | "following";

export const usePosts = () => {
  const { supabase } = useSupabase();
  const { user } = useUser();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<TabType>("forYou");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [countryFilterActive, setCountryFilterActive] = useState(false);

  const fetchIdRef = useRef(0);
  const lastTimestampRef = useRef(new Date().toISOString());
  const randomSeedRef = useRef(Math.random());

  const shuffleArray = useCallback((array: Post[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(randomSeedRef.current * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }, []);

  const buildBaseQuery = useCallback(
    (table: string) => {
      return supabase.from(`${table}s`).select(`
      *,
      user:user_id (
        username,
        first_name,
        last_name,
        updated_at,
        image_url
      ),
      ${table}_likes (
        user_id
      ),
      likeCount:${table}_likes(count)
    `);
    },
    [supabase]
  );

  const fetchPosts = useCallback(
    async (tab: TabType, loadMore = false) => {
      const currentFetchId = ++fetchIdRef.current;

      if (loadMore) {
        setIsLoadingMore(true);
      }

      try {
        let reviewsQuery = buildBaseQuery("review");
        let ownReviewsQuery = buildBaseQuery("own_review");

        // Handle following tab
        if (tab === "following" && user) {
          const { data: follows, error: followError } = await supabase
            .from("user_follows")
            .select("followed_id")
            .eq("follower_id", user.id);

          if (followError) throw followError;

          const followedUserIds = follows?.map((f) => f.followed_id) || [];

          if (followedUserIds.length === 0) {
            toast.show("You are not following anyone yet.", { type: "info" });
            return { data: [], fetchId: currentFetchId };
          }

          reviewsQuery = reviewsQuery.in("user_id", followedUserIds);
          ownReviewsQuery = ownReviewsQuery.in("user_id", followedUserIds);
        }

        // Handle pagination
        if (loadMore) {
          reviewsQuery = reviewsQuery.lt(
            "updated_at",
            lastTimestampRef.current
          );
          ownReviewsQuery = ownReviewsQuery.lt(
            "updated_at",
            lastTimestampRef.current
          );
        }

        // Apply ordering and limits
        reviewsQuery = reviewsQuery
          .order("updated_at", { ascending: false })
          .limit(PAGE_SIZE);

        ownReviewsQuery = ownReviewsQuery
          .order("updated_at", { ascending: false })
          .limit(PAGE_SIZE);

        const [reviewsResult, ownReviewsResult] = await Promise.all([
          reviewsQuery,
          ownReviewsQuery,
        ]);

        if (reviewsResult.error) throw reviewsResult.error;
        if (ownReviewsResult.error) throw ownReviewsResult.error;

        let combined = [
          ...(reviewsResult.data || []),
          ...(ownReviewsResult.data || []),
        ];

        // Filter blocked users
        if (user) {
          const blockedUserIds = await getBlockedUserIds(supabase, user.id);
          combined = combined.filter(
            (post) => !blockedUserIds.includes(post.user_id)
          );
        }

        // Update timestamp for pagination
        if (combined.length > 0) {
          const timestamps = combined.map((post) =>
            new Date(post.updated_at).getTime()
          );
          const minTimestamp = new Date(Math.min(...timestamps)).toISOString();
          lastTimestampRef.current = minTimestamp;
        }

        // Shuffle for initial "For You" load
        if (tab === "forYou" && !loadMore) {
          combined = shuffleArray(combined);
        }

        // Remove duplicates
        const uniqueIds = new Set<string>();
        const uniquePosts = combined.filter((post) => {
          if (uniqueIds.has(post.id)) return false;
          uniqueIds.add(post.id);
          return true;
        });

        return { data: uniquePosts, fetchId: currentFetchId };
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast.show("Failed to load posts. Please try again later.", {
          type: "danger",
        });
        return { data: [], fetchId: currentFetchId };
      } finally {
        if (loadMore) {
          setIsLoadingMore(false);
        }
      }
    },
    [buildBaseQuery, user, supabase, toast, shuffleArray]
  );

  const loadPosts = useCallback(
    async (loadMore = false) => {
      try {
        if (!loadMore) {
          setLoading(true);
        }

        const { data: newPosts, fetchId } = await fetchPosts(
          activeTab,
          loadMore
        );

        // Prevent race conditions
        if (fetchId === fetchIdRef.current) {
          setPosts((prev) => (loadMore ? [...prev, ...newPosts] : newPosts));
          setHasMore(newPosts.length >= PAGE_SIZE);
          setCountryFilterActive(!!user);
        }
      } finally {
        if (!loadMore) {
          setLoading(false);
        }
      }
    },
    [activeTab, fetchPosts, user]
  );

  const handleTabChange = useCallback(
    async (tab: TabType) => {
      if (tab === "following" && !user) {
        Alert.alert(
          "Not Logged In",
          "You need to be logged in to view posts from users you follow.",
          [{ text: "OK" }]
        );
        return;
      }

      setActiveTab(tab);
      setPosts([]);
      setHasMore(true);
      setCountryFilterActive(false);
      setLoading(true);
      lastTimestampRef.current = new Date().toISOString();
      randomSeedRef.current = Math.random();

      // Reset fetch ID to prevent race conditions
      fetchIdRef.current = 0;
    },
    [user]
  );

  const handleEndReached = useCallback(() => {
    if (!isLoadingMore && hasMore && !loading) {
      loadPosts(true);
    }
  }, [isLoadingMore, hasMore, loading, loadPosts]);

  const handleRefresh = useCallback(() => {
    randomSeedRef.current = Math.random();
    lastTimestampRef.current = new Date().toISOString();
    fetchIdRef.current = 0;
    loadPosts(false);
  }, [loadPosts]);

  return {
    activeTab,
    posts,
    loading,
    hasMore,
    isLoadingMore,
    countryFilterActive,
    handleTabChange,
    handleEndReached,
    handleRefresh,
    loadPosts,
  };
};
