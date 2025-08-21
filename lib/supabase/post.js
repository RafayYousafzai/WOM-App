import { Alert } from "react-native";

// Helper function to handle Supabase errors
const handleSupabaseError = (error, stage) => {
  if (error) {
    console.error(`Error during ${stage}:`, error);
    throw new Error(`Database error at ${stage}: ${error.message}`);
  }
};

/**
 * Handles sharing a review by validating data and then performing all
 * database operations from the client-side.
 */
export const handleReviewSubmit = async ({
  reviewData,
  user,
  supabase,
  setLoading,
  onSuccess,
  onError,
}) => {
  if (!user) {
    const authError = "You must be logged in to post a review.";
    Alert.alert("Authentication Error", authError);
    onError?.(new Error(authError));
    return { success: false, error: authError };
  }

  setLoading?.(true);

  try {
    /**
     * Step 1: Create Restaurant
     */
    const restaurantPayload = {
      rating: reviewData.rating,
      location: reviewData.location,
      user_id: user.id,
    };

    const { data: newRestaurant, error: restaurantError } = await supabase
      .from("restaurants")
      .insert([restaurantPayload])
      .select()
      .single();

    handleSupabaseError(restaurantError, "restaurant creation");

    const newRestaurantId = newRestaurant?.id;
    if (!newRestaurantId) throw new Error("Failed to create restaurant");

    /**
     * Step 2: Create Post (Review entry)
     */
    const postPayload = {
      user_id: user.id,
      restaurant_id: newRestaurantId,
      review: reviewData.review,
      anonymous: reviewData.anonymous,
      people: reviewData.peoplesTags || [],
      is_review: reviewData.is_review === "restaurant" ? true : false,
    };

    const { data: newPost, error: postError } = await supabase
      .from("posts")
      .insert([postPayload])
      .select()
      .single();

    handleSupabaseError(postError, "post creation");

    const newPostId = newPost?.id;
    if (!newPostId) throw new Error("Failed to create post");

    /**
     * Step 3: Insert Tags
     */
    const allTagIds = [
      ...(reviewData.cuisineTags || []),
      ...(reviewData.amenityTags || []),
      ...(reviewData.dietaryTags || []),
    ];

    if (allTagIds.length > 0) {
      const postTags = allTagIds.map((tagId) => ({
        post_id: newPostId,
        tag_id: tagId,
      }));

      const { error: tagsError } = await supabase
        .from("post_tags")
        .insert(postTags);

      handleSupabaseError(tagsError, "tag insertion");
    }

    /**
     * Step 4: Insert Dishes + Review Dishes
     */
    let totalRating = 0;
    let ratedDishesCount = 0;

    for (const dish of reviewData.dishTypes || []) {
      const reviewDishPayload = {
        post_id: newPostId,
        rating: dish.rating,
        is_recommended: dish.recommendDish,
        image_urls: dish.images,
        restaurant_id: newRestaurantId,
        dish_name: dish.dishName,
        dish_price: parseFloat(dish.price) || 0,
        dish_type: dish.name,
      };

      await supabase.from("post_dishes").insert(reviewDishPayload);

      if (dish.rating > 0) {
        totalRating += dish.rating;
        ratedDishesCount++;
      }
    }

    /**
     * Step 5: Update Restaurant Rating
     */
    const averageRating =
      ratedDishesCount > 0 ? totalRating / ratedDishesCount : 0;
    const ratingUpdatePayload = {
      rating: averageRating,
    };

    const { error: ratingUpdateError } = await supabase
      .from("restaurants")
      .update(ratingUpdatePayload)
      .eq("id", newRestaurantId);

    handleSupabaseError(ratingUpdateError, "restaurant rating update");

    /**
     * Success
     */
    const result = { success: true, reviewId: newPostId };
    Alert.alert("Success", "Review shared successfully!");
    onSuccess?.(result);
    return result;
  } catch (error) {
    Alert.alert(
      "Error",
      `Failed to share the review. Please try again.\n${error.message}`
    );
    onError?.(error);
    return { success: false, error: error.message };
  } finally {
    setLoading?.(false);
  }
};
