import { useSupabase } from "@/context/supabaseContext";

export const useBookmarks = () => {
  const { supabase } = useSupabase();

  // Add a new bookmark
  const addBookmark = async ({ postId, postType, userId, collection }) => {
    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .insert([
          {
            post_id: postId,
            post_type: postType,
            user_id: userId,
            collection,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error adding bookmark:", error);
      throw error;
    }
  };

  // Remove a bookmark
  const removeBookmark = async (bookmarkId) => {
    try {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("id", bookmarkId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error removing bookmark:", error);
      throw error;
    }
  };

  // Get all bookmarks for a user
  const getUserBookmarks = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      throw error;
    }
  };

  // Check if a post is bookmarked by user
  const isPostBookmarked = async ({ postId, postType, userId }) => {
    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("id")
        .eq("post_id", postId)
        .eq("post_type", postType)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error("Error checking bookmark:", error);
      throw error;
    }
  };

  // Toggle bookmark status
 const toggleBookmark = async ({ postId, postType, userId, collection }) => {
  console.group("toggleBookmark Debug");
  try {
    console.log("Starting toggleBookmark with params:", {
      postId,
      postType,
      userId,
      collection
    });

    // 1. Check current bookmark status
    console.log("Checking if post is already bookmarked...");
    const isBookmarked = await isPostBookmarked({ postId, postType, userId });
    console.log("Current bookmark status:", isBookmarked);

    if (isBookmarked) {
      // 2. Get bookmark ID for deletion
      console.log("Preparing to remove bookmark...");
      console.log("Fetching bookmark record for deletion...");
      
      const { data, error, status } = await supabase
        .from("bookmarks")
        .select("id")
        .eq("post_id", postId)
        .eq("post_type", postType)
        .eq("user_id", userId)
        .single();

      console.log("Bookmark record fetch result:", {
        data,
        error,
        status,
        foundRecord: !!data
      });

      if (error) throw error;
      if (!data) throw new Error("No bookmark record found despite isBookmarked being true");

      // 3. Delete the bookmark
      console.log("Deleting bookmark with ID:", data.id);
      const deleteResult = await removeBookmark(data.id);
      console.log("Bookmark deletion result:", deleteResult);

      console.groupEnd();
      return false;
    } else {
      // 4. Add new bookmark
      console.log("Adding new bookmark...");
      const addResult = await addBookmark({
        postId,
        postType,
        userId,
        collection
      });
      console.log("Bookmark addition result:", addResult);

      console.groupEnd();
      return true;
    }
  } catch (error) {
    console.error("Error in toggleBookmark:", {
      error: error.message,
      stack: error.stack
    });
    console.groupEnd();
    throw error;
  }
};

  const updateBookmarkCollectionByPostId = async ({
    postId,
    newCollectionName,
  }) => {
    console.info(
      `Updating collection name to '${newCollectionName}' for bookmarks with postId: ${postId}`
    );
    try {
      // First, find the bookmarks with the given postId
      const { data: bookmarks, error: findError } = await supabase
        .from("bookmarks")
        .select("id") // We only need the IDs to update
        .eq("post_id", postId);

      if (findError) {
        console.error("Error finding bookmarks by postId:", findError);
        return { success: false, error: findError };
      }

      if (!bookmarks || bookmarks.length === 0) {
        console.warn(`No bookmarks found with postId: ${postId}.`);
        return { success: true, message: "No bookmarks found to update." };
      }

      // Extract the IDs of the found bookmarks
      const bookmarkIdsToUpdate = bookmarks.map((bookmark) => bookmark.id);

      // Update the collection name for all found bookmarks
      const { error: updateError } = await supabase
        .from("bookmarks")
        .update({ collection: newCollectionName })
        .in("id", bookmarkIdsToUpdate);

      if (updateError) {
        console.error("Error updating bookmark collections:", updateError);
        return { success: false, error: updateError };
      }

      console.info(
        `Successfully updated the collection name to '${newCollectionName}' for ${bookmarks.length} bookmarks with postId: ${postId}`
      );
      return { success: true, updatedCount: bookmarks.length };
    } catch (error) {
      console.error(
        "An unexpected error occurred while updating bookmark collections:",
        error
      );
      return { success: false, error };
    }
  };

  // Get bookmarks by collection
  const getBookmarksByCategory = async (userId, collection) => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .eq("collection", collection)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  };

  const getReviewById = async (postId, postType) => {
    const type = postType === "review" ? "review_likes" : "own_review_likes";

    try {
      const { data, error } = await supabase
        .from(`${postType}s`)
        .select(
          `
        *,
        user:user_id (
          username,
          first_name,
          last_name,
          updated_at,
          image_url
        ),
        ${type} (
          user_id
        ),
        likeCount:${type}(count)
      `
        )
        .eq("id", postId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching review by ID:", error);
    }
  };

  return {
    addBookmark,
    removeBookmark,
    getUserBookmarks,
    isPostBookmarked,
    toggleBookmark,
    getBookmarksByCategory,
    getReviewById,
    updateBookmarkCollectionByPostId,
  };
};
