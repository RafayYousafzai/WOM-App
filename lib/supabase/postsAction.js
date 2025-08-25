// 🔹 POSTS - New unified post system
export const getAllPosts = async (supabase, limit = 20, offset = 0) => {
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      id,
      review,
      user_id,
      is_review,
      anonymous,
      people,
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
      )
    `
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  // Transform data to match your frontend expectations
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
      user: post.users,
    })) || []
  );
};

export const getPostById = async (supabase, postId) => {
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      *,
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
    user: data.users,
  };
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
      `
      tags (
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
      `
      id,
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
      `
      id,
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
