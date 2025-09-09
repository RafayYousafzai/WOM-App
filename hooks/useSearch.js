import { useSearch } from "@/context/searchContext";
import { useEffect, useState, useCallback } from "react";
import { useSupabase } from "@/context/supabaseContext";

/**
 * Custom hook to handle fetching and filtering of posts.
 * Includes filtering by tags, search query, review status, price range, and minimum rating.
 */
export const useDishesHandler = () => {
  const { supabase } = useSupabase();
  const {
    selectedFilters,
    searchQuery,
    setSearchQuery,
    setSelectedFilters,
    moreFilters = {
      priceRange: { min: null, max: null },
      rating: null,
    },
  } = useSearch();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reviewStatus, setReviewStatus] = useState("all");

  const fetchPosts = useCallback(async () => {
    const { priceRange, rating } = moreFilters;

    // 1. UPDATE BAIL-OUT CONDITION to include price and rating filters.
    if (
      selectedFilters.size === 0 &&
      !searchQuery &&
      reviewStatus === "all" &&
      !rating &&
      !priceRange.min &&
      !priceRange.max
    ) {
      setPosts([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const activeIdSets = [];

      // Step 1: Get post IDs based on selected tags (no changes here).
      if (selectedFilters.size > 0) {
        const tagIds = Array.from(selectedFilters);
        const { data: postTagsData, error: postTagsError } = await supabase
          .from("post_tags")
          .select("post_id")
          .in("tag_id", tagIds);

        if (postTagsError) throw postTagsError;
        const postIdsFromTags = new Set(postTagsData.map((pt) => pt.post_id));
        activeIdSets.push(postIdsFromTags);
      }

      // Step 2: Get post IDs from search query OR review status filter.
      if (searchQuery || reviewStatus !== "all") {
        const rpcParams = {
          search_term: searchQuery || "",
          is_review_filter: reviewStatus === "all" ? null : reviewStatus,
        };

        const { data: searchData, error: rpcError } = await supabase.rpc(
          "search_posts",
          rpcParams
        );

        if (rpcError) throw rpcError;
        const postIdsFromSearch = new Set(searchData.map((p) => p.id));
        activeIdSets.push(postIdsFromSearch);
      }

      // 3. NEW: Get post IDs based on price range filter.
      if (priceRange.min || priceRange.max) {
        let priceQuery = supabase.from("post_dishes").select("post_id");
        if (priceRange.min) {
          priceQuery = priceQuery.gte("dish_price", priceRange.min);
        }
        if (priceRange.max) {
          priceQuery = priceQuery.lte("dish_price", priceRange.max);
        }
        const { data: priceData, error: priceError } = await priceQuery;

        if (priceError) throw priceError;
        const postIdsFromPrice = new Set(priceData.map((pd) => pd.post_id));
        activeIdSets.push(postIdsFromPrice);
      }

      // 4. NEW: Get post IDs based on minimum restaurant rating filter.
      if (rating) {
        // First, find restaurants that meet the rating criteria.
        const { data: restaurantData, error: restaurantError } = await supabase
          .from("restaurants")
          .select("id")
          .gte("rating", rating);

        if (restaurantError) throw restaurantError;

        let postIdsFromRating;
        if (restaurantData && restaurantData.length > 0) {
          const restaurantIds = restaurantData.map((r) => r.id);
          // Then, find all posts associated with those restaurants.
          const { data: postsData, error: postsError } = await supabase
            .from("posts")
            .select("id")
            .in("restaurant_id", restaurantIds);

          if (postsError) throw postsError;
          postIdsFromRating = new Set(postsData.map((p) => p.id));
        } else {
          // If no restaurants match the rating, no posts can match.
          postIdsFromRating = new Set();
        }
        activeIdSets.push(postIdsFromRating);
      }

      // 5. REVISED: Determine the final set of post IDs by finding the intersection of all active filters.
      if (activeIdSets.length === 0) {
        // This case is hit if filters are selected, but they yield no results individually.
        setPosts([]);
        setLoading(false);
        return;
      }

      // Start with the first set of results and intersect with the rest.
      let finalIds = new Set(activeIdSets[0]);
      for (let i = 1; i < activeIdSets.length; i++) {
        const currentSet = activeIdSets[i];
        finalIds = new Set([...finalIds].filter((id) => currentSet.has(id)));
        // If the intersection is ever empty, we can stop early.
        if (finalIds.size === 0) {
          break;
        }
      }

      const finalPostIds = Array.from(finalIds);

      if (finalPostIds.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      // Step 6: Fetch the full post data for the final IDs (no changes here).
      const { data, error: fetchError } = await supabase
        .from("posts")
        .select(
          `
          *,
          post_dishes (*),
          restaurants (*),
          post_tags(tags(*)),
          users (id, username, full_name, image_url)
        `
        )
        .in("id", finalPostIds);

      if (fetchError) throw fetchError;

      // Final client-side filter to ensure posts have ALL selected tags.
      if (data && selectedFilters.size > 0) {
        const filteredData = data.filter((post) => {
          const postTagIds = new Set(post.post_tags.map((pt) => pt.tags.id));
          return Array.from(selectedFilters).every((filterId) =>
            postTagIds.has(filterId)
          );
        });
        setPosts(filteredData);
      } else {
        setPosts(data || []);
      }
    } catch (e) {
      console.error("Error fetching posts:", e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedFilters, supabase, reviewStatus, moreFilters]); // 6. ADD moreFilters to dependencies.

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    loading,
    error,
    setSearchQuery,
    setSelectedFilters,
    fetchPosts,
    reviewStatus,
    setReviewStatus,
  };
};
