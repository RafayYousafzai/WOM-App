export const updateRestaurantPost = async (
  supabase,
  postId,
  userId,
  updateData
) => {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .update({
        dish_name: updateData.name,
        restaurant_name: updateData.restaurantName,
        review: updateData.description,
        location: updateData.location,
        rating: updateData.rating,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error updating restaurant post:", error);
    return { data: null, error };
  }
};

export const updatePersonalPost = async (
  supabase,
  postId,
  userId,
  updateData
) => {
  try {
    const { data, error } = await supabase
      .from("own_reviews")
      .update({
        caption: updateData.name,
        review: updateData.description,
        location: updateData.location,
        rating: updateData.rating,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error updating personal post:", error);
    return { data: null, error };
  }
};

export const getPostForEdit = async (supabase, postId, postType, userId) => {
  try {
    const tableName = postType === "review" ? "reviews" : "own_reviews";

    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .eq("id", postId)
      .eq("user_id", userId)
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error fetching post for edit:", error);
    return { data: null, error };
  }
};
