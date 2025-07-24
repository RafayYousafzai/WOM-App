// 🔹 REVIEWS
export const getAllReviews = async (supabase) => {
  const { data, error } = await supabase.from("reviews").select("*");
  if (error) throw error;
  return data;
};

export const updateReview = async (supabase, id, updates) => {
  const { data, error } = await supabase
    .from("reviews")
    .update(updates)
    .eq("id", id)
    .select();
  if (error) throw error;
  return data[0];
};

export const deleteReview = async (supabase, id) => {
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw error;
};

export const getReviewLikes = async (supabase, reviewId) => {
  const { data, error } = await supabase
    .from("review_likes")
    .select("user_id")
    .eq("review_id", reviewId);
  if (error) throw error;
  return data;
};

export const hasUserLiked = async (supabase, userId, reviewId) => {
  const { data, error } = await supabase
    .from("review_likes")
    .select("id")
    .match({ user_id: userId, review_id: reviewId });
  if (error) throw error;
  return data.length > 0;
};

export const toggleLike = async (
  supabase,
  userId,
  targetId,
  table,
  targetColumn,
  targetTable
) => {
  try {
    if (!userId || !targetId) throw new Error("Missing userId or targetId");

    // Check if target (review or own_review) exists
    const { data: targetData, error: targetError } = await supabase
      .from(targetTable)
      .select("id")
      .eq("id", targetId)
      .maybeSingle();

    if (targetError) throw targetError;
    if (!targetData) {
      console.warn(`Target not found in ${targetTable} with id:`, targetId);
      return { liked: false, reason: "Target does not exist" };
    }

    // Check if already liked
    const { data, error } = await supabase
      .from(table)
      .select("id")
      .match({ user_id: userId, [targetColumn]: targetId });

    if (error) throw error;

    if (data.length === 0) {
      // Like it
      const { data: likeData, error: likeError } = await supabase
        .from(table)
        .insert([{ user_id: userId, [targetColumn]: targetId }])
        .select();

      if (likeError) throw likeError;
      return { liked: true, data: likeData };
    } else {
      // Unlike it
      const { error: unlikeError } = await supabase
        .from(table)
        .delete()
        .match({ user_id: userId, [targetColumn]: targetId });

      if (unlikeError) throw unlikeError;
      return { liked: false };
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return { liked: false, error };
  }
};
