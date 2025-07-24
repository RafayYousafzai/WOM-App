import { useEffect, useState, useCallback } from "react"; // Added useCallback
import ListDynamicCard from "../dynamic-cards/ListReviewCard"; // Assuming ListReviewCard is suitable for "own_reviews"
import { useSearch } from "@/context/searchContext";
import { useSupabase } from "@/context/supabaseContext";
import { useUser } from "@clerk/clerk-expo";
import { ActivityIndicator, Text, View } from "react-native";
import { getBlockedUserIds } from "@/lib/supabase/user_blocks"; // Import the function to get blocked user IDs

const PostList = ({ limit = 20 }) => {
  // Destructure hooks and contexts
  const { user } = useUser(); // Get the current user from Clerk
  const { supabase } = useSupabase();
  const { searchQuery, filterCategories } = useSearch(); // Get search query and filters from context

  // State variables for managing posts, loading status, and errors
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get the priority country from user metadata, if available
  const priority_country = user?.unsafeMetadata?.country?.name;

  // Memoized function to extract all selected filter tags (excluding 'rating')
  const extractAllFilters = useCallback(() => {
    return filterCategories
      .filter((category) => category.id !== "rating") // Exclude the rating category
      .flatMap((category) => category.options) // Flatten options from all categories
      .filter((opt) => opt.selected) // Only include selected options
      .map((opt) => opt.id); // Map to their IDs (e.g., 'vegan', 'halal')
  }, [filterCategories]); // Recreate if filterCategories changes

  // Memoized function to extract selected rating filters
  const ratingFilters = useCallback(() => {
    return (
      filterCategories
        .find((f) => f.id === "rating") // Find the rating category
        ?.options.filter((opt) => opt.selected) // Filter for selected rating options
        .map((opt) => parseInt(opt.id[0])) || [] // Parse the first character as an integer (e.g., '4-star' becomes 4)
    );
  }, [filterCategories]); // Recreate if filterCategories changes

  // Asynchronous function to fetch posts from Supabase (own_reviews)
  // `attemptCountryFilter` is a flag to try filtering by country first, then fallback
  const fetchReviews = async (attemptCountryFilter = false) => {
    setLoading(true); // Set loading to true at the start of the fetch operation
    setError(null); // Clear any previous errors

    try {
      // Get the current user's ID to fetch their blocked users
      const currentUserId = user?.id;
      // Fetch the list of user IDs that the current user has blocked
      // Fallback to an empty array if no blocked users are found or an error occurs
      const blockedUserIds =
        (await getBlockedUserIds(supabase, currentUserId)) || [];

      // Log the blocked user IDs for debugging purposes
      console.log("PostList - Blocked User IDs:", blockedUserIds);

      // Initialize the Supabase query for the 'own_reviews' table
      let query = supabase
        .from("own_reviews") // Changed from 'reviews' to 'own_reviews'
        .select(
          `*, 
           user:user_id (first_name, last_name, image_url),
           own_review_likes (user_id), 
           likeCount:own_review_likes(count)` // Changed to 'own_review_likes'
        )
        .order("created_at", { ascending: false }) // Order reviews by creation date, newest first
        .limit(limit); // Limit the number of reviews fetched to 20

      // --- Start: Apply User Blocking Filter ---
      // If there are blocked users, apply the appropriate filter
      if (blockedUserIds.length > 0) {
        if (blockedUserIds.length === 1) {
          // If only one user is blocked, use 'not.eq' (not equal) for efficiency and clarity
          const blockedId = blockedUserIds[0];
          query = query.not("user_id", "eq", blockedId);
        } else {
          // If multiple users are blocked, use 'not.in' (not in a list)
          // Explicitly format the array as a comma-separated string within parentheses
          // This ensures correct parsing by PostgREST and avoids potential errors with single-element arrays
          query = query.not("user_id", "in", `(${blockedUserIds.join(",")})`);
        }
      }
      // --- End: Apply User Blocking Filter ---

      // --- Start: Apply Country Filter ---
      // If a priority country is available and the function is attempting to filter by country
      if (priority_country && attemptCountryFilter) {
        // Filter reviews where the location address contains the priority country (case-insensitive)
        query = query.ilike("location->>address", `%${priority_country}%`);
      }
      // --- End: Apply Country Filter ---

      // Trim the search query
      const trimmedQuery = searchQuery?.trim();

      // --- Start: Apply Search Filter ---
      // If there's a trimmed search query, apply it to multiple text fields
      if (trimmedQuery) {
        // Use an 'OR' condition to search across location address, caption, review text, and dish name
        // '%${trimmedQuery}%' creates a case-insensitive partial match
        query = query.or(
          `location->>address.ilike.%${trimmedQuery}%,` + // Note: 'restaurant_name' removed, 'caption' added
            `caption.ilike.%${trimmedQuery}%,` +
            `review.ilike.%${trimmedQuery}%,` +
            `dish_name.ilike.%${trimmedQuery}%`
        );
      }
      // --- End: Apply Search Filter ---

      // --- Start: Apply Tag Filters ---
      const all_tags = extractAllFilters(); // Get all selected tags
      if (all_tags && all_tags.length) {
        // If there are selected tags, filter reviews that overlap with any of these tags
        // 'overlaps' checks if the array column 'all_tags' contains any of the provided tags
        query = query.overlaps("all_tags", all_tags);
      }
      // --- End: Apply Tag Filters ---

      // --- Start: Apply Rating Filters ---
      const currentRatingFilters = ratingFilters(); // Get selected rating filters (e.g., [4, 5])
      if (currentRatingFilters.length) {
        // If there are selected ratings, filter reviews where the 'rating' is one of the selected values
        query = query.in("rating", currentRatingFilters);
      }
      // --- End: Apply Rating Filters ---

      // Execute the constructed Supabase query
      const { data, error: queryError } = await query;

      // If there's an error from the Supabase query, throw it to be caught by the main catch block
      if (queryError) {
        throw queryError;
      }

      // --- Start: Fallback Logic for Country Filter ---
      // If no data is returned with the country filter, and a country filter was attempted,
      // recursively call fetchReviews again without the country filter
      if (!data?.length && attemptCountryFilter && priority_country) {
        return fetchReviews(false); // Important: return the promise from the recursive call
      }
      // --- End: Fallback Logic for Country Filter ---

      // Set the fetched posts to state
      setPosts(data || []);

      // Optional: More granular error/no data messages based on filter application
      if (
        !data?.length &&
        !priority_country &&
        !trimmedQuery &&
        !all_tags.length &&
        !currentRatingFilters.length // Added currentRatingFilters to condition
      ) {
        // If no filters were applied and still no data, optionally set a specific message
        // setError("No reviews found.");
      } else if (!data?.length) {
        // If filters were applied and no data, optionally set a specific message
        // setError("No reviews match your current filters. Try broadening your search.");
      }
    } catch (err) {
      // Catch any errors that occurred during the fetch operation
      console.error("Fetch reviews error:", err); // Log the full error for debugging

      // Default user-friendly error message
      let userFriendlyMessage =
        "Sorry, we couldn't load the posts at the moment. Please try again later."; // Changed 'reviews' to 'posts'

      // Customize error message based on common error types
      if (err.message) {
        if (
          err.message.includes(" relación «reviews» no existe") || // Spanish error message (might need to update to 'own_reviews' if different)
          err.message
            .toLowerCase()
            .includes('relation "own_reviews" does not exist') // Adjusted to 'own_reviews'
        ) {
          userFriendlyMessage =
            "Error: The posts data source seems to be missing. Please contact support.";
        } else if (err.message.includes("permission denied")) {
          userFriendlyMessage =
            "Error: We don't have permission to access the posts. Please contact support.";
        } else if (
          err.message.toLowerCase().includes("network error") ||
          err.message.toLowerCase().includes("failed to fetch")
        ) {
          userFriendlyMessage =
            "A network error occurred. Please check your internet connection and try again.";
        }
        // Add more specific error checks here if needed for other Supabase/Postgres errors
      }

      setError(userFriendlyMessage); // Set the user-friendly error message
      setPosts([]); // Clear posts on error to prevent displaying stale data
    } finally {
      setLoading(false); // Set loading to false once the fetch operation completes (success or error)
    }
  };

  // useEffect hook to trigger `fetchReviews` when dependencies change
  useEffect(() => {
    // Call fetchReviews, initially attempting to filter by country
    fetchReviews(true);
  }, [
    searchQuery, // Re-fetch when search query changes
    filterCategories, // Re-fetch when filter categories (selected tags/ratings) change
    priority_country, // Re-fetch if the user's priority country changes
    user?.id, // Re-fetch if the user ID changes (e.g., user logs in/out), crucial for blocked users
    supabase, // Include supabase in dependencies if its instance could change (though typically stable)
  ]);

  // Conditional rendering based on loading, error, and posts data
  if (loading) {
    return (
      <View className="flex justify-center items-center h-full">
        <ActivityIndicator size="large" color="#f39f1e" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex justify-center items-center h-full">
        <Text className="text-red-500 text-center">
          Error loading posts: {error} {/* Changed 'reviews' to 'posts' */}
        </Text>
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View className="flex justify-center items-center h-full">
        <Text className="text-gray-500 text-center">No posts found.</Text>{" "}
        {/* Changed 'reviews' to 'posts' */}
      </View>
    );
  }

  // Render the ListDynamicCard component with fetched posts
  return <ListDynamicCard posts={posts} loading={loading} />;
};

export default PostList;
