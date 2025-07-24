import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSupabase } from "@/context/supabaseContext";
import { useUser } from "@clerk/clerk-expo";
import { getBlockedUserIds } from "@/lib/supabase/user_blocks";

export const useUnifiedSearch = (filterCategories: any[]) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState({
    users: [],
    reviews: [],
    own_reviews: [],
  });
  
  const { supabase } = useSupabase();
  const { user } = useUser();
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();

  const priority_country =
    typeof user?.unsafeMetadata?.country === "object" &&
    user?.unsafeMetadata?.country !== null
      ? (user.unsafeMetadata.country as { name?: string }).name
      : undefined;

  // Extract filters
  const extractAllFilters = useCallback(() => {
    return filterCategories
      .filter((category) => category.id !== "rating")
      .flatMap((category) => category.options)
      .filter((opt) => opt.selected)
      .map((opt) => opt.id);
  }, [filterCategories]);

  const ratingFilters = useMemo(() => {
    return filterCategories
      .find((f) => f.id === "rating")
      ?.options.filter((opt: any) => opt.selected)
      .map((opt: any) => parseInt(opt.id[0])) || [];
  }, [filterCategories]);

  // Unified search function
  const performSearch = useCallback(async (searchQuery: string, attemptCountryFilter = false) => {
    if (!searchQuery.trim()) {
      setSearchResults({ users: [], reviews: [], own_reviews: [] });
      return;
    }

    setIsSearching(true);

    try {
      const currentUserId = user?.id;
      const blockedUserIds = await getBlockedUserIds(supabase, currentUserId) || [];
      const all_tags_filter = extractAllFilters();
      const currentRatingFilters = ratingFilters;
      const keyword = `%${searchQuery.trim()}%`;

      // Build base queries
      let reviewsQuery = supabase
        .from("reviews")
        .select(`
          *,
          user:user_id (first_name, last_name, image_url),
          review_likes (user_id),
          likeCount:review_likes(count)
        `)
        .or(`restaurant_name.ilike.${keyword},review.ilike.${keyword},location->>address.ilike.${keyword},dish_name.ilike.${keyword}`)
        .order("created_at", { ascending: false })
        .limit(10);

      let ownReviewsQuery = supabase
        .from("own_reviews")
        .select(`
          *,
          user:user_id (first_name, last_name, image_url),
          own_review_likes (user_id),
          likeCount:own_review_likes(count)
        `)
        .or(`caption.ilike.${keyword},review.ilike.${keyword},location->>address.ilike.${keyword},dish_name.ilike.${keyword}`)
        .order("created_at", { ascending: false })
        .limit(10);

      let usersQuery = supabase
        .from("users")
        .select("id, first_name, last_name, username, image_url")
        .or(`first_name.ilike.${keyword},last_name.ilike.${keyword},username.ilike.${keyword}`)
        .limit(5);

      // Apply blocked user filtering
      if (blockedUserIds.length > 0) {
        const blockedFilter = blockedUserIds.length === 1 
          ? blockedUserIds[0] 
          : `(${blockedUserIds.join(',')})`;
        
        if (blockedUserIds.length === 1) {
          reviewsQuery = reviewsQuery.not("user_id", "eq", blockedFilter);
          ownReviewsQuery = ownReviewsQuery.not("user_id", "eq", blockedFilter);
          usersQuery = usersQuery.not("id", "eq", blockedFilter);
        } else {
          reviewsQuery = reviewsQuery.not("user_id", "in", blockedFilter);
          ownReviewsQuery = ownReviewsQuery.not("user_id", "in", blockedFilter);
          usersQuery = usersQuery.not("id", "in", blockedFilter);
        }
      }

      // Apply country filter if specified
      if (priority_country && attemptCountryFilter) {
        reviewsQuery = reviewsQuery.ilike("location->>address", `%${priority_country}%`);
        ownReviewsQuery = ownReviewsQuery.ilike("location->>address", `%${priority_country}%`);
      }

      // Apply tag filters
      if (all_tags_filter.length) {
        reviewsQuery = reviewsQuery.overlaps("all_tags", all_tags_filter);
        ownReviewsQuery = ownReviewsQuery.overlaps("all_tags", all_tags_filter);
      }

      // Apply rating filters
      if (currentRatingFilters.length) {
        reviewsQuery = reviewsQuery.in("rating", currentRatingFilters);
        ownReviewsQuery = ownReviewsQuery.in("rating", currentRatingFilters);
      }

      const [usersRes, reviewsRes, ownReviewsRes] = await Promise.all([
        usersQuery,
        reviewsQuery,
        ownReviewsQuery,
      ]);

      // Handle errors
      if (usersRes.error) throw usersRes.error;
      if (reviewsRes.error) throw reviewsRes.error;
      if (ownReviewsRes.error) throw ownReviewsRes.error;

      const results = {
        users: usersRes.data || [],
        reviews: reviewsRes.data || [],
        own_reviews: ownReviewsRes.data || [],
      };

      // If no results and we tried country filter, retry without it
      const totalResults = results.users.length + results.reviews.length + results.own_reviews.length;
      if (totalResults === 0 && attemptCountryFilter && priority_country) {
        return performSearch(searchQuery, false);
      }

      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults({ users: [], reviews: [], own_reviews: [] });
    } finally {
      setIsSearching(false);
    }
  }, [supabase, user, extractAllFilters, ratingFilters, priority_country]);

  // Debounced search
  const debouncedSearch = useCallback((searchQuery: string) => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      performSearch(searchQuery, true);
    }, 300); // Reduced debounce time for better UX
  }, [performSearch]);

  // Cleanup
  useEffect(() => {
    return () => clearTimeout(debounceTimer.current);
  }, []);

  return {
    searchResults,
    isSearching,
    performSearch,
    debouncedSearch,
    setSearchResults,
  };
};