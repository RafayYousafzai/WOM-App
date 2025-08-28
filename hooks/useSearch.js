import { useSearch } from "@/context/searchContext";
import { useEffect, useState, useCallback } from "react";
import { useSupabase } from "@/context/supabaseContext";

/**
 * Custom hook to handle fetching and filtering of posts.
 */
export const useDishesHandler = () => {
  const { supabase } = useSupabase();
  const { selectedFilters, searchQuery, setSearchQuery, setSelectedFilters } =
    useSearch();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. ADD NEW STATE for the review filter. 'all', true, or false.
  const [reviewStatus, setReviewStatus] = useState("all");

  const fetchPosts = useCallback(async () => {
    // 2. UPDATE BAIL-OUT CONDITION to include the new filter.
    if (selectedFilters.size === 0 && !searchQuery && reviewStatus === "all") {
      setPosts([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let postIdsFromTags = null;
      let postIdsFromSearch = null;

      // Step 1: Get post IDs based on selected tags (no changes here).
      if (selectedFilters.size > 0) {
        // ... (this logic remains the same)
        const tagIds = Array.from(selectedFilters);
        const { data: postTagsData, error: postTagsError } = await supabase
          .from("post_tags")
          .select("post_id")
          .in("tag_id", tagIds);

        if (postTagsError) throw postTagsError;
        if (!postTagsData || postTagsData.length === 0) {
          setPosts([]);
          setLoading(false);
          return;
        }
        postIdsFromTags = new Set(postTagsData.map((pt) => pt.post_id));
      }

      // 3. REFACTOR RPC CALL to handle search query OR review status.
      // We run the search if a query exists OR if a review filter is active.
      if (searchQuery || reviewStatus !== "all") {
        // Prepare parameters for the RPC call
        const rpcParams = {
          search_term: searchQuery || "", // Pass empty string if no query
          is_review_filter: reviewStatus === "all" ? null : reviewStatus,
        };

        const { data: searchData, error: rpcError } = await supabase.rpc(
          "search_posts",
          rpcParams
        );

        if (rpcError) throw rpcError;
        if (!searchData || searchData.length === 0) {
          setPosts([]);
          setLoading(false);
          return;
        }
        postIdsFromSearch = new Set(searchData.map((p) => p.id));
      }

      // Step 3: Determine the final set of post IDs (logic updated slightly)
      let finalPostIds;
      // If ONLY one filter type is active
      if (postIdsFromTags && !postIdsFromSearch) {
        finalPostIds = [...postIdsFromTags];
      } else if (!postIdsFromTags && postIdsFromSearch) {
        finalPostIds = [...postIdsFromSearch];
      } else if (postIdsFromTags && postIdsFromSearch) {
        // If BOTH are active, find the intersection
        finalPostIds = [...postIdsFromTags].filter((id) =>
          postIdsFromSearch.has(id)
        );
      } else {
        // This case handles when filters were active but yielded no results
        setPosts([]);
        setLoading(false);
        return;
      }

      if (finalPostIds.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      // Step 4: Fetch the full post data (no changes here).
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

      // Final client-side filter for ALL tags (no changes here).
      if (data && selectedFilters.size > 0) {
        // ... (this logic remains the same)
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
  }, [searchQuery, selectedFilters, supabase, reviewStatus]); // 4. ADD reviewStatus to dependencies.

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
    // 5. EXPOSE the new state and setter.
    reviewStatus,
    setReviewStatus,
  };
};
