import { useSupabase } from "@/context/supabaseContext";

export const useBookmarks = () => {
  const { supabase } = useSupabase();

  // Fetches all collections for a user
  const getUserCollections = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("post_bookmark_name")
        .select("id, name")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching collections:", error);
      throw error;
    }
  };

  // Creates a new bookmark collection for a user
  const createCollection = async (userId, name) => {
    try {
      const { data, error } = await supabase
        .from("post_bookmark_name")
        .insert([{ user_id: userId, name }])
        .select("id, name")
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating collection:", error);
      throw error;
    }
  };

  /**
   * Adds a post to a collection, creating the collection if it doesn't exist.
   * This is the new core function for the EngagementBar.
   * @param {string} userId - The user's ID.
   * @param {number} postId - The ID of the post.
   * @param {string} collectionName - The name of the collection (e.g., "Wishlist").
   * @returns {boolean} - True if added, false if removed.
   */
  const addPostToCollection = async ({ userId, postId, collectionName }) => {
    try {
      // 1. Check if the collection already exists
      let { data: collection, error: findError } = await supabase
        .from("post_bookmark_name")
        .select("id")
        .eq("user_id", userId)
        .eq("name", collectionName)
        .maybeSingle();

      if (findError) throw findError;

      // 2. If collection doesn't exist, create it
      if (!collection) {
        console.log(
          `Collection "${collectionName}" not found. Creating it now.`
        );
        collection = await createCollection(userId, collectionName);
      }

      // 3. Check if the post is already bookmarked in this collection
      const { data: existingBookmark, error: bookmarkError } = await supabase
        .from("post_bookmarks")
        .select("id")
        .eq("user_id", userId)
        .eq("post_id", postId)
        .eq("collection_id", collection.id)
        .maybeSingle();

      if (bookmarkError) throw bookmarkError;

      // 4. If bookmark exists, remove it. Otherwise, add it.
      if (existingBookmark) {
        await supabase
          .from("post_bookmarks")
          .delete()
          .eq("id", existingBookmark.id);
        return false; // Removed
      } else {
        await supabase
          .from("post_bookmarks")
          .insert([
            { post_id: postId, user_id: userId, collection_id: collection.id },
          ]);
        return true; // Added
      }
    } catch (error) {
      console.error("Error adding post to collection:", error);
      throw error;
    }
  };

  // Gets all bookmarked posts for a user, optionally filtered by collection name
  const getBookmarkedPosts = async (userId, collectionName = null) => {
    try {
      let query = supabase
        .from("post_bookmarks")
        .select(
          `
  post_id,
  posts(
    id,
     user_id,  
    review,
    is_review,
    created_at,
    post_dishes(
      id,
      dish_name,
      dish_price,
      dish_type,
      rating,
      image_urls,
      is_recommended
    ),
    user:user_id(
      username,
      first_name,
      last_name,
      image_url
    ),
    post_likes(user_id),
    restaurant:restaurant_id(
      id,
      location,
      rating
    )
  )
`
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (collectionName) {
        const { data: collection, error: findError } = await supabase
          .from("post_bookmark_name")
          .select("id")
          .eq("user_id", userId)
          .eq("name", collectionName)
          .maybeSingle();

        if (findError) throw findError;

        if (collection) {
          query = query.eq("collection_id", collection.id);
        } else {
          // If the collection doesn't exist, return an empty array
          return [];
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      const formattedPosts = data.map((item) => ({
        ...item.posts,
        user_id: item.posts.user_id ?? item.user_id,
        dishes: item.posts.post_dishes || [],
        images: item.posts.post_dishes?.flatMap((d) => d.image_urls) || [],
        likesCount: item.posts.post_likes?.length || 0,
        isLiked: item.posts.post_likes?.some((like) => like.user_id === userId),
      }));

      return formattedPosts;
    } catch (error) {
      console.error("Error fetching bookmarked posts:", error);
      throw error;
    }
  };

  // Checks if a post is bookmarked by a user (any collection)
  const isPostBookmarked = async ({ postId, userId }) => {
    try {
      const { data, error } = await supabase
        .from("post_bookmarks")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error("Error checking bookmark:", error);
      throw error;
    }
  };

  return {
    getUserCollections,
    createCollection,
    addPostToCollection, // New function for the EngagementBar
    getBookmarkedPosts,
    isPostBookmarked,
  };
};
