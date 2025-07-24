// 🔹 REVIEWS
export const getAllOwnReviews = async (supabase) => {
  const { data, error } = await supabase.from("own_reviews").select("*");
  if (error) throw error;
  return data;
};

export const updateOwnReview = async (supabase, id, updates) => {
  const { data, error } = await supabase
    .from("own_reviews")
    .update(updates)
    .eq("id", id)
    .select();
  if (error) throw error;
  return data[0];
};

export const deleteOwnReview = async (supabase, id) => {
  const { error } = await supabase.from("own_reviews").delete().eq("id", id);
  if (error) throw error;
};
export const toggleOwnReviewLike = async (supabase, userId, reviewId) => {
  try {
    if (!userId || !reviewId) {
      throw new Error("Missing userId or reviewId");
    }

    // ✅ Check if the own_review exists
    const { data: existingReview, error: reviewError } = await supabase
      .from("own_reviews")
      .select("id")
      .eq("id", reviewId)
      .maybeSingle();

    if (reviewError) throw reviewError;
    if (!existingReview) {
      console.warn("Own review not found with id:", reviewId);
      return { liked: false, reason: "Own review does not exist" };
    }

    // 🔍 Check if already liked
    const { data, error } = await supabase
      .from("own_review_likes")
      .select("id")
      .match({ user_id: userId, own_review_id: reviewId });

    if (error) throw error;

    if (data.length === 0) {
      // ❤️ Like it
      const { data: likeData, error: likeError } = await supabase
        .from("own_review_likes")
        .insert([{ user_id: userId, own_review_id: reviewId }])
        .select();

      if (likeError) throw likeError;
      return { liked: true, data: likeData };
    } else {
      // 💔 Unlike it
      const { error: unlikeError } = await supabase
        .from("own_review_likes")
        .delete()
        .match({ user_id: userId, own_review_id: reviewId });

      if (unlikeError) throw unlikeError;
      return { liked: false };
    }
  } catch (error) {
    console.error("Error in toggleOwnReviewLike:", error);
    return { liked: false, error };
  }
};

export const getOwnReviewLikes = async (supabase, reviewId) => {
  const { data, error } = await supabase
    .from("own_review_likes")
    .select("user_id")
    .eq("own_review_id", reviewId);
  if (error) throw error;
  return data;
};

export const hasUserLiked = async (supabase, userId, reviewId) => {
  const { data, error } = await supabase
    .from("own_review_likes")
    .select("id")
    .match({ user_id: userId, own_review_id: reviewId });
  if (error) throw error;
  return data.length > 0;
};
