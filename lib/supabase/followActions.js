// 👥 FOLLOWS TOGGLE
export const toggleFollowUser = async (supabase, followerId, followedId) => {
  try {
    if (followerId === followedId) {
      throw new Error("You cannot follow yourself.");
    }

    const { data: existingFollow, error: selectError } = await supabase
      .from("user_follows")
      .select("id")
      .match({ follower_id: followerId, followed_id: followedId });

    if (selectError) throw selectError;

    if (existingFollow && existingFollow.length > 0) {
      // Already following → unfollow
      const { error: deleteError } = await supabase
        .from("user_follows")
        .delete()
        .match({ follower_id: followerId, followed_id: followedId });

      if (deleteError) throw deleteError;

      return { unfollowed: true };
    } else {
      // Not following → follow
      const { data: newFollow, error: insertError } = await supabase
        .from("user_follows")
        .insert([{ follower_id: followerId, followed_id: followedId }])
        .select();

      if (insertError) throw insertError;

      return { followed: true, data: newFollow };
    }
  } catch (error) {
    console.error("Error in toggleFollowUser:", error.message || error);
    throw error;
  }
};

export const getFollowers = async (supabase, userId) => {
  const { data, error } = await supabase
    .from("user_follows")
    .select(
      `*,
        user:follower_id (
          username,
          first_name,
          last_name,
          updated_at,
          image_url,
          unsafe_metadata
        )`
    )
    .eq("followed_id", userId); // Who follows this user
  if (error) throw error;
  return data;
};

export const getFollowing = async (supabase, userId) => {
  const { data, error } = await supabase
    .from("user_follows")
    .select(
      `*,
        user:followed_id (
          username,
          first_name,
          last_name,
          updated_at,
          image_url,
          unsafe_metadata
        )`
    )
    .eq("follower_id", userId); // Who this user is following
  if (error) throw error;
  return data;
};

export const getFollowersIdAndNotificationToken = async (supabase, userId) => {
  const { data, error } = await supabase
    .from("user_follows")
    .select(
      `follower_id,
        user:follower_id (
          id,
          username,
          unsafe_metadata,
          full_name
        )`
    )
    .eq("followed_id", userId); // Who is following this user

  if (error) throw error;

  // Map relevant info
  return data.map((entry) => ({
    id: entry.user?.id,
    username: entry.user?.username,
    fullName: entry.user?.full_name,
    token: entry.user?.unsafe_metadata?.notifications_tokens,
  }));
};

export const isFollowing = async (supabase, followerId, followedId) => {
  const { data, error } = await supabase
    .from("user_follows")
    .select("id")
    .match({ follower_id: followerId, followed_id: followedId });
  if (error) throw error;
  return data.length > 0;
};

export const getTotalFollowersCount = async (supabase, userId) => {
  try {
    const { count, error } = await supabase
      .from("user_follows")
      .select("id", { count: "exact", head: true })
      .eq("followed_id", userId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error("Error fetching followers count:", error.message || error);
    throw error;
  }
};

export const getTotalFollowingCount = async (supabase, userId) => {
  try {
    const { count, error } = await supabase
      .from("user_follows")
      .select("id", { count: "exact", head: true })
      .eq("follower_id", userId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error("Error fetching following count:", error.message || error);
    throw error;
  }
};
