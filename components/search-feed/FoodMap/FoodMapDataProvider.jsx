import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
  useRef,
} from "react";
import { useSupabase } from "@/context/supabaseContext";
import { useUser } from "@clerk/clerk-expo";
import { useSearch } from "@/context/searchContext";

// Create context for the map data
const FoodMapContext = createContext();

// Default region constant
const defaultRegion = {
  latitude: 30.3753,
  longitude: 69.3451,
  latitudeDelta: 15,
  longitudeDelta: 15,
};

export const FoodMapDataProvider = ({ children }) => {
  const { supabase } = useSupabase();
  const { searchQuery, filterCategories } = useSearch(); // Added filterCategories
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [region, setRegion] = useState(defaultRegion);

  const debounceTimer = useRef(null);
  const didMountRef = useRef(false);

  // Memoize helper functions
  const formatTimeAgo = useCallback((dateString) => {
    // ... (same as before)
  }, []);

  // Memoize extractAllFilters
  const extractAllFilters = useCallback(() => {
    return filterCategories
      .filter((category) => category.id !== "rating")
      .flatMap((category) => category.options)
      .filter((opt) => opt.selected)
      .map((opt) => opt.id);
  }, [filterCategories]);

  const calculateRegion = useCallback((coords) => {
    // ... (same as before)
  }, []);

  // Main fetch function
  const performFetch = useCallback(async () => {
    try {
      if (!user) {
        setLoading(false);
        setPosts([]);
        return;
      }

      setLoading(true);

      // Get filters
      const all_tags_filter = extractAllFilters();
      const queryKeywords = searchQuery
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);

      // Get rating filters
      const ratingFilters =
        filterCategories
          .find((f) => f.id === "rating")
          ?.options.filter((opt) => opt.selected)
          .map((opt) => parseInt(opt.id[0])) || [];

      // Prepare search term
      const keyword = searchQuery.trim() ? `%${searchQuery.trim()}%` : null;

      // Build reviews query
      let reviewsQuery = supabase
        .from("reviews")
        .select(
          `
          isReview,
          id, 
          location,
          user:user_id (id, full_name, username, image_url)
        `
        )
        .order("created_at", { ascending: false });

      // Add search conditions if keyword exists
      if (keyword) {
        reviewsQuery = reviewsQuery.or(
          `restaurant_name.ilike.${keyword},review.ilike.${keyword},location->>address.ilike.${keyword}`
        );
      }

      // Apply filters
      if (all_tags_filter.length) {
        reviewsQuery = reviewsQuery.contains("all_tags", all_tags_filter);
      }
      if (ratingFilters.length) {
        reviewsQuery = reviewsQuery.in("rating", ratingFilters);
      }

      // Build own_reviews query
      let ownReviewsQuery = supabase
        .from("own_reviews")
        .select(
          `
          id, 
          location,
          user:user_id (id, full_name, username, image_url)
        `
        )
        .order("created_at", { ascending: false });

      // Add search conditions if keyword exists
      if (keyword) {
        ownReviewsQuery = ownReviewsQuery.or(
          `caption.ilike.${keyword},review.ilike.${keyword},location->>address.ilike.${keyword}`
        );
      }

      // Apply filters
      if (all_tags_filter.length) {
        ownReviewsQuery = ownReviewsQuery.contains("all_tags", all_tags_filter);
      }
      if (ratingFilters.length) {
        ownReviewsQuery = ownReviewsQuery.in("rating", ratingFilters);
      }

      // Execute queries
      const [reviewsRes, ownReviewsRes] = await Promise.all([
        reviewsQuery,
        ownReviewsQuery,
      ]);

      // Handle errors
      if (reviewsRes.error) throw reviewsRes.error;
      if (ownReviewsRes.error) throw ownReviewsRes.error;

      // Combine and process results
      const allPosts = [
        ...(reviewsRes.data || []).map((item) => ({
          ...item,
          source_table: "reviews",
          restaurant_name: item.restaurant_name,
        })),
        ...(ownReviewsRes.data || []).map((item) => ({
          ...item,
          source_table: "own_reviews",
          restaurant_name: item.caption || "Personal Review",
        })),
      ];

      // Process posts for map
      const processedPosts = allPosts.map((post) => ({
        id: post.id,
        source_table: post.isReview ? "reviews" : "own_reviews",
        restaurant_name: post.restaurant_name,
        location: post.location
          ? {
              latitude: parseFloat(post.location.latitude),
              longitude: parseFloat(post.location.longitude),
              address: post.location.address || "Unknown location",
            }
          : null,
        username: post.user?.username || post.user?.full_name || "Anonymous",
      }));

      setPosts(processedPosts);

      // Calculate region
      const validCoords = processedPosts
        .filter((p) => p.location)
        .map((p) => p.location);

      setRegion(
        validCoords.length ? calculateRegion(validCoords) : defaultRegion
      );
    } catch (err) {
      console.error("Error fetching posts:", err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [
    user,
    supabase,
    searchQuery,
    formatTimeAgo,
    calculateRegion,
    extractAllFilters,
    filterCategories,
  ]);

  // Debounce wrapper
  const debouncedFetch = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      performFetch();
    }, 500);
  }, [performFetch]);

  // Effect for initial mount and user changes
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    performFetch();
  }, [user, performFetch]);

  // Effect for search queries and filters (debounced)
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    debouncedFetch();

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery, filterCategories, debouncedFetch]);

  return (
    <FoodMapContext.Provider value={{ loading, posts, region }}>
      {children}
    </FoodMapContext.Provider>
  );
};

export const useFoodMapData = () => useContext(FoodMapContext);
