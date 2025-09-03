export const getAllPosts = async (supabase, limit = 20, offset = 0, userId) => {
  const { data, error } = await supabase
    .from("posts")
    .select(
      `id,
      review,
      user_id,
      is_review,
      anonymous,
      people,
      gatekeeping,
      created_at,
      updated_at,
      restaurants (
        id,
        location,
        rating
      ),
      users (
        id,
        first_name,
        last_name,
        image_url
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
      )`
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return (
    data?.map((post) => {
      const normalizedGatekeeping = post.gatekeeping === true;

      return {
        ...post,
        restaurant_name: post.restaurants?.location || "Unknown Restaurant",
        location: { address: post.restaurants?.location },
        rating: post.restaurants?.rating,
        dishes: post.post_dishes || [],
        all_tags: post.post_tags?.map((pt) => pt.tags).filter(Boolean) || [],
        likesCount: post.post_likes?.length || 0,
        commentsCount: post.post_comments?.length || 0,
        isLiked:
          post.post_likes?.some((like) => like.user_id === userId) || false,
        user: post.users,
        // FIX: Always ensure gatekeeping is a proper boolean
        gatekeeping: normalizedGatekeeping,
      };
    }) || []
  );
};

export const getPostById = async (supabase, postId, userId) => {
  const { data, error } = await supabase
    .from("posts")
    .select(
      `*,
      restaurants (
        id,
        location,
        rating
      ),
      users (
        id,
        first_name,
        last_name,
        image_url
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
        id,
        content,
        created_at,
        users (
          first_name,
          last_name,
          image_url
        )
      )
    `
    )
    .eq("id", postId)
    .single();

  if (error) throw error;

  return {
    ...data,
    restaurant_name: data.restaurants?.location || "Unknown Restaurant",
    location: { address: data.restaurants?.location },
    rating: data.restaurants?.rating,
    dishes: data.post_dishes || [],
    all_tags: data.post_tags?.map((pt) => pt.tags).filter(Boolean) || [],
    likesCount: data.post_likes?.length || 0,
    commentsCount: data.post_comments?.length || 0,
    isLiked: data.post_likes?.some((like) => like.user_id === userId) || false,
    user: data.users,
    // Ensure gatekeeping is properly handled (null = false)
    gatekeeping: data.gatekeeping === true,
  };
};

// 🔹 NEW GATEKEEPING FUNCTIONS
export const togglePostGatekeeping = async (supabase, postId, userId) => {
  try {
    if (!userId || !postId) {
      throw new Error("Missing userId or postId");
    }

    // First, verify the user owns this post
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id, user_id, gatekeeping")
      .eq("id", postId)
      .single();

    if (postError) throw postError;

    if (!post) {
      throw new Error("Post not found");
    }

    if (post.user_id !== userId) {
      throw new Error("You can only modify gatekeeping for your own posts");
    }

    // FIX: More explicit boolean handling
    const currentGatekeeping = post.gatekeeping === true;
    const newGatekeepingValue = !currentGatekeeping;

    console.log(
      `Toggling gatekeeping: ${currentGatekeeping} -> ${newGatekeepingValue}`
    );

    const { data, error } = await supabase
      .from("posts")
      .update({
        gatekeeping: newGatekeepingValue,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId)
      .eq("user_id", userId)
      .select("id, gatekeeping")
      .single();

    if (error) throw error;

    // FIX: Ensure consistent return value
    const resultGatekeeping = data.gatekeeping === true;

    return {
      success: true,
      gatekeeping: resultGatekeeping,
      message: `Gatekeeping ${
        resultGatekeeping ? "enabled" : "disabled"
      } successfully`,
    };
  } catch (error) {
    console.error("Error in togglePostGatekeeping:", error);
    return {
      success: false,
      error: error.message,
      gatekeeping: false,
    };
  }
};

export const getPostGatekeepingStatus = async (supabase, postId) => {
  try {
    console.log("Checking gatekeeping status for post:", postId);

    const { data, error } = await supabase
      .from("posts")
      .select("id, gatekeeping")
      .eq("id", postId)
      .single();

    if (error) {
      console.error("Error fetching gatekeeping status:", error);
      throw error;
    }

    const result = {
      success: true,
      gatekeeping: data.gatekeeping === true, // Explicit boolean conversion
      postId: data.id,
    };

    console.log("Gatekeeping status result:", result);
    return result;
  } catch (error) {
    console.error("Error fetching gatekeeping status:", error);
    return {
      success: false,
      gatekeeping: false,
      error: error.message,
    };
  }
};
export const createPost = async (supabase, postData) => {
  const { data, error } = await supabase
    .from("posts")
    .insert([postData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updatePost = async (supabase, id, updates) => {
  const { data, error } = await supabase
    .from("posts")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) throw error;
  return data[0];
};

export const deletePost = async (supabase, id) => {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw error;
};

// 🔹 POST LIKES
export const togglePostLike = async (supabase, userId, postId) => {
  try {
    if (!userId || !postId) {
      throw new Error("Missing userId or postId");
    }

    // Check if the post exists
    const { data: existingPost, error: postError } = await supabase
      .from("posts")
      .select("id")
      .eq("id", postId)
      .maybeSingle();

    if (postError) throw postError;
    if (!existingPost) {
      console.warn("Post not found with id:", postId);
      return { liked: false, reason: "Post does not exist" };
    }

    // Check if already liked
    const { data, error } = await supabase
      .from("post_likes")
      .select("id")
      .match({ user_id: userId, post_id: postId });

    if (error) throw error;

    if (data.length === 0) {
      // Like it
      const { data: likeData, error: likeError } = await supabase
        .from("post_likes")
        .insert([{ user_id: userId, post_id: postId }])
        .select();

      if (likeError) throw likeError;
      return { liked: true, data: likeData };
    } else {
      // Unlike it
      const { error: unlikeError } = await supabase
        .from("post_likes")
        .delete()
        .match({ user_id: userId, post_id: postId });

      if (unlikeError) throw unlikeError;
      return { liked: false };
    }
  } catch (error) {
    console.error("Error in togglePostLike:", error);
    return { liked: false, error };
  }
};

export const getPostLikes = async (supabase, postId) => {
  const { data, error } = await supabase
    .from("post_likes")
    .select("user_id")
    .eq("post_id", postId);

  if (error) throw error;
  return data;
};

export const hasUserLikedPost = async (supabase, userId, postId) => {
  const { data, error } = await supabase
    .from("post_likes")
    .select("id")
    .match({ user_id: userId, post_id: postId });

  if (error) throw error;
  return data.length > 0;
};

// 🔹 POST DISHES
export const getPostDishes = async (supabase, postId) => {
  const { data, error } = await supabase
    .from("post_dishes")
    .select("*")
    .eq("post_id", postId)
    .order("id");

  if (error) throw error;
  return data || [];
};

export const addPostDish = async (supabase, dishData) => {
  const { data, error } = await supabase
    .from("post_dishes")
    .insert([dishData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updatePostDish = async (supabase, dishId, updates) => {
  const { data, error } = await supabase
    .from("post_dishes")
    .update(updates)
    .eq("id", dishId)
    .select();

  if (error) throw error;
  return data[0];
};

export const deletePostDish = async (supabase, dishId) => {
  const { error } = await supabase
    .from("post_dishes")
    .delete()
    .eq("id", dishId);

  if (error) throw error;
};

// 🔹 POST TAGS
export const getPostTags = async (supabase, postId) => {
  const { data, error } = await supabase
    .from("post_tags")
    .select(
      `tags (
        id,
        name,
        type
      )
    `
    )
    .eq("post_id", postId);

  if (error) throw error;
  return data?.map((pt) => pt.tags).filter(Boolean) || [];
};

export const addPostTag = async (supabase, postId, tagId) => {
  const { data, error } = await supabase
    .from("post_tags")
    .insert([{ post_id: postId, tag_id: tagId }])
    .select();

  if (error) throw error;
  return data[0];
};

export const removePostTag = async (supabase, postId, tagId) => {
  const { error } = await supabase
    .from("post_tags")
    .delete()
    .match({ post_id: postId, tag_id: tagId });

  if (error) throw error;
};

// 🔹 POST COMMENTS
export const getPostComments = async (supabase, postId) => {
  const { data, error } = await supabase
    .from("post_comments")
    .select(
      `id,
      content,
      created_at,
      updated_at,
      parent_id,
      users (
        id,
        first_name,
        last_name,
        image_url
      )
    `
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
};

export const addPostComment = async (supabase, commentData) => {
  const { data, error } = await supabase
    .from("post_comments")
    .insert([commentData])
    .select(
      `id,
      content,
      created_at,
      users (
        id,
        first_name,
        last_name,
        image_url
      )
    `
    )
    .single();

  if (error) throw error;
  return data;
};

export const updatePostComment = async (supabase, commentId, content) => {
  const { data, error } = await supabase
    .from("post_comments")
    .update({ content, updated_at: new Date().toISOString() })
    .eq("id", commentId)
    .select();

  if (error) throw error;
  return data[0];
};

export const deletePostComment = async (supabase, commentId) => {
  const { error } = await supabase
    .from("post_comments")
    .delete()
    .eq("id", commentId);

  if (error) throw error;
};

// 🔹 NEW FUNCTION - Get posts by restaurant location
export const getPostsByRestaurantLocation = async (
  supabase,
  restaurantLocation,
  limit = 20,
  offset = 0,
  userId
) => {
  const { data, error } = await supabase
    .from("posts")
    .select(
      `id,
      review,
      user_id,
      is_review,
      anonymous,
      people,
      gatekeeping,
      created_at,
      updated_at,
      restaurants!inner (
        id,
        location,
        rating
      ),
      users (
        id,
        first_name,
        last_name,
        image_url
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
    `
    )
    .eq("restaurants.location", restaurantLocation)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return (
    data?.map((post) => ({
      ...post,
      restaurant_name: post.restaurants?.location || "Unknown Restaurant",
      location: { address: post.restaurants?.location },
      rating: post.restaurants?.rating,
      dishes: post.post_dishes || [],
      all_tags: post.post_tags?.map((pt) => pt.tags).filter(Boolean) || [],
      likesCount: post.post_likes?.length || 0,
      commentsCount: post.post_comments?.length || 0,
      isLiked:
        post.post_likes?.some((like) => like.user_id === userId) || false,
      user: post.users,
      // Ensure gatekeeping is properly handled (null = false)
      gatekeeping: post.gatekeeping === true,
    })) || []
  );
};
// Add these functions to your postsAction.js file

export const toggleGlobalGatekeeping = async (supabase, userId, enableGatekeeping) => {
  try {
    if (!userId) {
      throw new Error("Missing userId");
    }

    console.log(`Setting global gatekeeping to ${enableGatekeeping} for user ${userId}`);

    // Update all posts for this user
    const { data, error } = await supabase
      .from("posts")
      .update({
        gatekeeping: enableGatekeeping,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select("id, gatekeeping");

    if (error) throw error;

    const updatedCount = data?.length || 0;

    return {
      success: true,
      gatekeeping: enableGatekeeping,
      updatedPostsCount: updatedCount,
      message: `${enableGatekeeping ? "Enabled" : "Disabled"} gatekeeping for ${updatedCount} posts`,
    };
  } catch (error) {
    console.error("Error in toggleGlobalGatekeeping:", error);
    return {
      success: false,
      error: error.message,
      gatekeeping: false,
      updatedPostsCount: 0,
    };
  }
};



export const getUserGatekeepingStatus = async (supabase, userId) => {
  try {
    if (!userId) {
      throw new Error("Missing userId");
    }

    // Check if user has any posts and their gatekeeping status
    const { data, error } = await supabase
      .from("posts")
      .select("id, gatekeeping")
      .eq("user_id", userId);

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        success: true,
        hasGlobalGatekeeping: false,
        totalPosts: 0,
        gatekeepingPosts: 0,
        allPostsHaveGatekeeping: false,
      };
    }

    const totalPosts = data.length;
    const gatekeepingPosts = data.filter(post => post.gatekeeping === true).length;
    const allPostsHaveGatekeeping = gatekeepingPosts === totalPosts;

    return {
      success: true,
      hasGlobalGatekeeping: allPostsHaveGatekeeping,
      totalPosts,
      gatekeepingPosts,
      allPostsHaveGatekeeping,
    };
  } catch (error) {
    console.error("Error in getUserGatekeepingStatus:", error);
    return {
      success: false,
      error: error.message,
      hasGlobalGatekeeping: false,
      totalPosts: 0,
      gatekeepingPosts: 0,
      allPostsHaveGatekeeping: false,
    };
  }
};