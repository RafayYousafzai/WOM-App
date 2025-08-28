// 🙋 USER HELPERS
export const getUserById = async (supabase, userId) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
};

export const updateUserMetadata = async (supabase, userId, updates) => {
  const { data, error } = await supabase
    .from("users")
    .update({ unsafe_metadata: updates })
    .eq("id", userId)
    .select();
  if (error) throw error;
  return data[0];
};

export const getTotalPostsCount = async (supabase, userId) => {
  try {
    const [reviewResult] = await Promise.all([
      supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
      // .eq("is_review", true),
    ]);

    return {
      reviewCount: reviewResult.count || 0,
    };
  } catch (error) {
    console.error("Error fetching total posts count:", error.message || error);
    throw error;
  }
};
