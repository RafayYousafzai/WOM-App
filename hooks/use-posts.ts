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
  created_at: string;
  review: string;
  is_review: boolean;
  anonymous?: boolean;
  people?: string[];
  restaurants: {
    id: number;
    location: string;
    rating: number;
  };
  users: {
    username: string;
    first_name: string;
    last_name: string;
    updated_at: string;
    image_url: string;
  };
  post_dishes: Array<{
    id: number;
    dish_name: string;
    dish_price: number;
    dish_type: string;
    rating: number;
    is_recommended: boolean;
    image_urls: string[];
  }>;
  post_tags: Array<{
    tags: {
      id: number;
      name: string;
      type: string;
    };
  }>;
  post_likes: { user_id: string }[];
  post_comments: { id: number }[];
  // Computed fields
  restaurant_name?: string;
  location?: { address: string };
  dishes?: any[];
  all_tags?: any[];
  likesCount?: number;
  commentsCount?: number;
  user?: any;
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

  const buildPostsQuery = useCallback(() => {
    return supabase.from("posts").select(`
      id,
      review,
      user_id,
      is_review,
      anonymous,
      people,
      created_at,
      updated_at,
      restaurants (
        id,
        location,
        rating
      ),
      users (
        id,
        username,
        first_name,
        last_name,
        image_url,
        updated_at
      ),
      post_dishes (
        id,
        dish_name,
        dish_price,
        dish_type,
        rating,
        is_recommended,
        image_urls
      ),
      post_tags (
        tags (
          id,
          name,
          type
        )
      ),
      post_likes (
        user_id
      ),
      post_comments (
        id
      )
    `);
  }, [supabase]);

  const transformPostData = useCallback((rawPosts: any[]): Post[] => {
    return rawPosts.map(post => ({
      ...post,
      restaurant_name: post.restaurants?.location || "Unknown Restaurant",
      location: { address: post.restaurants?.location },
      rating: post.restaurants?.rating,
      dishes: post.post_dishes || [],
      all_tags: post.post_tags?.map((pt: any) => pt.tags).filter(Boolean) || [],
      likesCount: post.post_likes?.length || 0,
      commentsCount: post.post_comments?.length || 0,
      user: post.users
    }));
  }, []);

  const fetchPosts = useCallback(
    async (tab: TabType, loadMore = false) => {
      const currentFetchId = ++fetchIdRef.current;

      if (loadMore) {
        setIsLoadingMore(true);
      }

      try {
        let postsQuery = buildPostsQuery();

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

          postsQuery = postsQuery.in("user_id", followedUserIds);
        }

        // Handle pagination
        if (loadMore) {
          postsQuery = postsQuery.lt("updated_at", lastTimestampRef.current);
        }

        // Apply ordering and limits
        postsQuery = postsQuery
          .order("updated_at", { ascending: false })
          .limit(PAGE_SIZE);

        const { data: postsData, error: postsError } = await postsQuery;

        if (postsError) throw postsError;

        let posts = postsData || [];

        // Filter blocked users
        if (user) {
          const blockedUserIds = await getBlockedUserIds(supabase, user.id);
          posts = posts.filter(
            (post) => !blockedUserIds.includes(post.user_id)
          );
        }

        // Transform data to match frontend expectations
        posts = transformPostData(posts);

        // Update timestamp for pagination
        if (posts.length > 0) {
          const timestamps = posts.map((post) =>
            new Date(post.updated_at).getTime()
          );
          const minTimestamp = new Date(Math.min(...timestamps)).toISOString();
          lastTimestampRef.current = minTimestamp;
        }

        // Shuffle for initial "For You" load
        if (tab === "forYou" && !loadMore) {
          posts = shuffleArray(posts);
        }

        // Remove duplicates (shouldn't be needed with single table, but keeping for safety)
        const uniqueIds = new Set<string>();
        const uniquePosts = posts.filter((post) => {
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
    [buildPostsQuery, user, supabase, toast, shuffleArray, transformPostData]
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