import { useSearch } from "@/context/searchContext";
import { useEffect, useState, useCallback } from "react";
import { useSupabase } from "@/context/supabaseContext";

/**
 * Custom hook to handle fetching and filtering of posts based on
 * selected tags and a search query from the search context.
 */
export const useDishesHandler = () => {
  const { supabase } = useSupabase();

  // Destructure values from the search context
  const { selectedFilters, searchQuery, setSearchQuery, setSelectedFilters } =
    useSearch();

  // State to store the fetched posts
  const [posts, setPosts] = useState([]);
  // State to manage loading status
  const [loading, setLoading] = useState(false);
  // State for any potential errors during fetch
  const [error, setError] = useState(null);

  /**
   * Fetches posts from the database using a more robust two-step query process.
   */
  const fetchPosts = useCallback(async () => {
    // Reset state if there are no active filters or search query.
    if (selectedFilters.size === 0 && !searchQuery) {
      setPosts([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let postIdsFromTags = null;
      let postIdsFromSearch = null;

      // Step 1: Get post IDs based on selected tags.
      if (selectedFilters.size > 0) {
        const tagIds = Array.from(selectedFilters);
        const { data: postTagsData, error: postTagsError } = await supabase
          .from("post_tags")
          .select("post_id")
          .in("tag_id", tagIds);

        if (postTagsError) throw postTagsError;

        if (!postTagsData || postTagsData.length === 0) {
          setPosts([]); // No posts match the tags, so we can stop.
          setLoading(false);
          return;
        }
        postIdsFromTags = new Set(postTagsData.map((pt) => pt.post_id));
      }

      // Step 2: Get post IDs based on search query using RPC.
      if (searchQuery) {
        const { data: searchData, error: rpcError } = await supabase.rpc(
          "search_posts",
          { search_term: searchQuery } // Pass the search query to the function
        );

        if (rpcError) throw rpcError;

        if (!searchData || searchData.length === 0) {
          setPosts([]); // No posts match the search, so we can stop.
          setLoading(false);
          return;
        }
        postIdsFromSearch = new Set(searchData.map((p) => p.id));
      }

      // Step 3: Determine the final set of post IDs to fetch.
      // We need the intersection of IDs if both filters are active.
      let finalPostIds;
      if (postIdsFromTags && postIdsFromSearch) {
        finalPostIds = [...postIdsFromTags].filter((id) =>
          postIdsFromSearch.has(id)
        );
      } else {
        finalPostIds = [...(postIdsFromTags || postIdsFromSearch)];
      }

      // If after all filtering there are no IDs, stop.
      if (finalPostIds.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      // Step 4: Fetch the full post data for the final IDs.
      const { data, error: fetchError } = await supabase
        .from("posts")
        .select(
          `
          *,
          post_dishes (*),
          restaurants (*),
          post_tags!inner(tags(*))
        `
        )
        .in("id", finalPostIds);

      if (fetchError) throw fetchError;

      // Final client-side filter: Ensure posts have ALL selected tags.
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
  }, [searchQuery, selectedFilters, supabase]);

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
  };
};
