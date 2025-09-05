"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useSupabase } from "@/context/supabaseContext";

import { useUser } from "@clerk/clerk-expo";

import { useToast } from "react-native-toast-notifications";

import { getBlockedUserIds } from "@/lib/supabase/user_blocks";

import { Alert } from "react-native";

import * as Location from "expo-location";

import { useNetwork } from "./useNetwork";

const PAGE_SIZE = 7;

// Post interface remains the same

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

  const { hasInternet, checkConnectivity } = useNetwork();

  const [activeTab, setActiveTab] = useState<TabType>("forYou");

  const [posts, setPosts] = useState<Post[]>([]);

  const [loading, setLoading] = useState(true);

  const [hasMore, setHasMore] = useState(true);

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [countryFilterActive, setCountryFilterActive] = useState(false); // Can repurpose for location active

  const [networkError, setNetworkError] = useState(false);

  const [userLocation, setUserLocation] = useState<{
    latitude: number;

    longitude: number;
  } | null>(null);

  

  const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error: any) {
      if (
        !error?.message?.includes("connect error") && 
        !error?.message?.includes("timeout")
      ) {
        throw error; // Rethrow non-retryable errors
      }
      attempt++;
      const delay = baseDelay * Math.pow(2, attempt); // Exponential: 1s, 2s, 4s
      console.warn(`Retry ${attempt}/${maxRetries} after ${delay}ms: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Max retries exceeded");
  };
  
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        console.log("Permission to access location was denied");

        toast.show(
          "Location permission denied. Feed won't prioritize nearby posts.",

          { type: "warning" }
        );

        return;
      }

      let location = await Location.getCurrentPositionAsync({});

      setUserLocation({
        latitude: location.coords.latitude,

        longitude: location.coords.longitude,

        // Remove latitudeDelta/longitudeDelta unless using maps; assume region is defined elsewhere if needed
      });

      setCountryFilterActive(true); // Activate if location available
    })();
  }, []);

  // Use page for "For You" and timestamp for "Following"

  const pageRef = useRef(1);

  const lastTimestampRef = useRef(new Date().toISOString());

  const fetchIdRef = useRef(0);

  const buildPostsQuery = useCallback(() => {
    // This function remains the same, it builds the main select query

    return supabase.from("posts").select(`

id, review, user_id, is_review, anonymous, gatekeeping, people, created_at, updated_at,

restaurants (id, location, rating),

users (id, username, first_name, last_name, image_url, updated_at),

post_dishes (id, dish_name, dish_price, dish_type, rating, is_recommended, image_urls),

post_tags (tags (id, name, type)),

post_likes (user_id),

post_comments (id)

`);
  }, [supabase]);

  const transformPostData = useCallback((rawPosts: any[]): Post[] => {
    // This utility function remains the same

    return rawPosts.map((post) => ({
      ...post,

      restaurant_name: post.restaurants?.location || "Unknown Restaurant",

      location: { address: post.restaurants?.location },

      rating: post.restaurants?.rating,

      dishes: post.post_dishes || [],

      all_tags: post.post_tags?.map((pt: any) => pt.tags).filter(Boolean) || [],

      likesCount: post.post_likes?.length || 0,

      commentsCount: post.post_comments?.length || 0,

      user: post.users,
    }));
  }, []);

  function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      // Pick a random index from 0 to i
      const j = Math.floor(Math.random() * (i + 1));

      // Swap elements at i and j
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Example usage

  const fetchPosts = useCallback(
    async (tab: TabType, loadMore = false) => {
      const currentFetchId = ++fetchIdRef.current;

      // Check network connectivity first

      if (!hasInternet) {
        setNetworkError(true);

        if (loadMore) {
          setIsLoadingMore(false);
        }

        return { data: [], fetchId: currentFetchId };
      }

      setNetworkError(false);

      if (loadMore) {
        setIsLoadingMore(true);
      } else {
        // Reset pagination cursors on a fresh load/tab switch

        pageRef.current = 1;

        lastTimestampRef.current = new Date().toISOString();
      }

      try {
        let finalPosts: Post[] = [];

        if (tab === "forYou") {
          // Ensure we have valid coordinates, default to a safe location if not

          const safeLatitude = userLocation?.latitude ?? 3.139; // Kuala Lumpur default since you're in Malaysia

          const safeLongitude = userLocation?.longitude ?? 101.6869;

          const safeUserId = user?.id ?? "anonymous";

          console.log("Calling RPC with:", {
            page_limit: PAGE_SIZE,

            page_offset: (pageRef.current - 1) * PAGE_SIZE,

            requesting_user_id: safeUserId,

            user_latitude: safeLatitude,

            user_longitude: safeLongitude,
          });

        const { data: rankedPosts, error: rpcError } = await retryWithBackoff(() =>
  supabase.rpc("get_for_you_feed", {
    page_limit: PAGE_SIZE,
    page_offset: (pageRef.current - 1) * PAGE_SIZE,
    requesting_user_id: safeUserId,
    user_latitude: safeLatitude,
    user_longitude: safeLongitude,
  })
) as { data: any[]; error: any };

          if (rpcError) {
            console.error("RPC Error:", rpcError);

            throw rpcError;
          }

          console.log("RPC Response:", rankedPosts);

          if (!rankedPosts || rankedPosts.length === 0) {
            console.log("No posts returned from RPC");

            return { data: [], fetchId: currentFetchId };
          }

          // Convert bigint IDs to strings for consistency

          const postIds = rankedPosts.map((p: any) => p.id.toString());

          console.log("Post IDs to fetch:", postIds);

         const { data: postsData, error: postsError } = await retryWithBackoff(() =>
  buildPostsQuery().in("id", postIds)
) as { data: any[]; error: any };

          if (postsError) {
            console.error("Posts fetch error:", postsError);

            throw postsError;
          }

          console.log("Fetched posts data:", postsData?.length);

          // Re-order the fetched posts to match the ranked order from the RPC

          const postsById = new Map(
            postsData?.map((p: any) => [p.id.toString(), p]) || []
          );

          const orderedPosts = postIds

            .map((id: string) => postsById.get(id))

            .filter(Boolean);

          console.log("Ordered posts count:", orderedPosts.length);

          finalPosts = shuffleArray(transformPostData(orderedPosts as any[]));

          pageRef.current += 1; // Increment page for next fetch
        } else {
          // Existing "Following" logic remains the same

          if (!user) {
            toast.show(
              "You need to be logged in to view your following feed.",

              { type: "info" }
            );

            return { data: [], fetchId: currentFetchId };
          }

          const { data: follows, error: followError } = await supabase

            .from("user_follows")

            .select("followed_id")

            .eq("follower_id", user.id);

          if (followError) throw followError;

          const followedUserIds = follows?.map((f: any) => f.followed_id) || [];

          if (followedUserIds.length === 0) {
            return { data: [], fetchId: currentFetchId };
          }

          let postsQuery = buildPostsQuery().in("user_id", followedUserIds);

          if (loadMore) {
            postsQuery = postsQuery.lt("created_at", lastTimestampRef.current);
          }

          const { data: postsData, error: postsError } = await postsQuery

            .order("created_at", { ascending: false })

            .limit(PAGE_SIZE);

          if (postsError) throw postsError;

          const transformed = transformPostData(postsData || []);

          if (transformed.length > 0) {
            const lastPost = transformed[transformed.length - 1];

            lastTimestampRef.current = lastPost.created_at;
          }

          finalPosts = transformed;
        }

        console.log("Final posts count:", finalPosts.length);

        return { data: finalPosts, fetchId: currentFetchId };
      } catch (error: any) {
        console.error("Error fetching posts:", error);

        // Check if it's a network-related error

        if (
          error?.message?.includes("fetch") ||
          error?.code === "NetworkError" ||
          !hasInternet
        ) {
          setNetworkError(true);

          toast.show("Network error. Please check your connection.", {
            type: "danger",
          });
        } else {
          toast.show("Failed to load posts. Please try again later.", {
            type: "danger",
          });
        }

        return { data: [], fetchId: currentFetchId };
      } finally {
        if (loadMore) {
          setIsLoadingMore(false);
        }
      }
    },

    [
      buildPostsQuery,

      user,

      supabase,

      toast,

      transformPostData,

      userLocation,

      hasInternet,
    ]
  );

  const loadPosts = useCallback(
    async (isLoadMore = false) => {
      if (!isLoadMore) {
        setLoading(true);
      }

      const { data: newPosts, fetchId } = await fetchPosts(
        activeTab,

        isLoadMore
      );

      // Prevent race conditions from old fetches

      if (fetchId === fetchIdRef.current) {
        setPosts((prev) => (isLoadMore ? [...prev, ...newPosts] : newPosts));

        setHasMore(newPosts.length === PAGE_SIZE);

        setCountryFilterActive(!!user);
      }

      if (!isLoadMore) {
        setLoading(false);
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

      setLoading(true);

      fetchIdRef.current += 1;

      await loadPosts(false);
    },

    [user, loadPosts]
  );

  const handleEndReached = useCallback(() => {
    if (!isLoadingMore && hasMore && !loading) {
      loadPosts(true);
    }
  }, [isLoadingMore, hasMore, loading, loadPosts]);

  const handleRefresh = useCallback(() => {
    loadPosts(false);
  }, [loadPosts]);

const handleNetworkRetry = useCallback(async () => {
  const networkState = await checkConnectivity();
  if (networkState.isConnected && networkState.isInternetReachable !== false) {
    setNetworkError(false);
    loadPosts(false); // Auto-retry once
  } else {
    toast.show("Still no internet. Trying again in 5s...", { type: "warning" });
    setTimeout(() => handleNetworkRetry(), 5000); // Auto-retry loop
  }
}, [checkConnectivity, loadPosts, toast]);

  return {
    activeTab,
    posts,
    loading,
    hasMore,
    isLoadingMore,
    countryFilterActive,
    networkError,
    handleTabChange,
    handleEndReached,
    handleRefresh,
    handleNetworkRetry,
    loadPosts,
  };
};
