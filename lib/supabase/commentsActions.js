export const createComment = async ({
  supabase,
  postId,
  postType,
  userId,
  content,
  parentId = null,
}) => {
  const { data, error } = await supabase
    .from("comments")
    .insert([
      {
        post_id: postId,
        post_type: postType,
        user_id: userId,
        content,
        parent_id: parentId,
      },
    ])
    .select("*")
    .single();

  if (error) throw error;
  return data;
};

export const fetchCommentsByPost = async (supabase, postId, postType) => {
  const { data, error } = await supabase
    .from("comments")
    .select(
      `
      *,
      user:users (
        id,
        first_name,
        last_name,
        image_url
      )
    `
    )
    .eq("post_id", postId)
    .eq("post_type", postType)
    .is("parent_id", null)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }

  return data;
};

export const fetchReplies = async (supabase, commentId) => {
  const { data, error } = await supabase
    .from("comments")
    .select(
      `
      *,
      user:user_id (
        id,
        first_name,
        last_name,
        image_url
      )
    `
    )
    .eq("parent_id", commentId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
};

export const updateComment = async (supabase, commentId, updatedContent) => {
  const { data, error } = await supabase
    .from("comments")
    .update({ content: updatedContent })
    .eq("id", commentId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
};

export const deleteComment = async (supabase, commentId) => {
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);
  if (error) throw error;
  return true;
};

export const fetchUserCommentCount = async (supabase, userId) => {
  const { data, count, error } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user comment count:", error);
    throw error;
  }

  return count || 0;
};

export const fetchCommentCountByPost = async (supabase, postId, postType) => {
  const { count, error } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId)
    .eq("post_type", postType);

  if (error) {
    console.error("Error fetching comment count:", error);
    return 0;
  }

  return count || 0;
};
