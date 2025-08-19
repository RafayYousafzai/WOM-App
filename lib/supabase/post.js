import { useReview } from "@/context/reviewContext";
import { useSupabase } from "@/context/supabaseContext";
import { useUser } from "@clerk/clerk-expo";
import { Alert } from "react-native";

// Helper function to handle Supabase errors
const handleSupabaseError = (error, stage) => {
  if (error) {
    console.error(`Error during ${stage}:`, error);
    throw new Error(`Database error at ${stage}: ${error.message}`);
  }
};

/**
 * Handles sharing a review by performing all database operations directly
 * from the client-side. This function creates a new restaurant for each review.
 *
 * @param {object} options - The options for the function.
 * @param {object} options.reviewData - The state object from your component.
 * @param {object} options.user - The authenticated user object.
 * @param {object} options.supabase - The Supabase client instance.
 * @param {function} options.setLoading - State setter for loading indicator.
 */
const handleSubmit = async () => {
  const { supabase } = useSupabase();
  const { user } = useUser();
  const { reviewData, setLoading } = useReview();

  if (!user) {
    Alert.alert(
      "Authentication Error",
      "You must be logged in to post a review."
    );
    return;
  }

  setLoading(true);

  try {
    // Step 1: Create a new Restaurant for this review
    const { data: newRestaurant, error: restaurantError } = await supabase
      .from("restaurants")
      .insert({
        restaurant_name: reviewData.location?.name,
        location: reviewData.location,
        user_id: user.id, // The restaurant is associated with the reviewer
        rating: 0, // Initial rating, will be updated later
      })
      .select()
      .single();
    handleSupabaseError(restaurantError, "restaurant creation");

    const newRestaurantId = newRestaurant.id;

    // Step 2: Create the main Review entry
    const { data: newReview, error: reviewError } = await supabase
      .from("reviews")
      .insert({
        user_id: user.id,
        restaurant_id: newRestaurantId,
        review: reviewData.review,
        anonymous: reviewData.anonymous,
        people: reviewData.peoplesTags,
      })
      .select()
      .single();
    handleSupabaseError(reviewError, "review creation");

    const newReviewId = newReview.id;

    // Step 3: Insert all Tags (Cuisine, Amenity, Dietary)
    const allTagIds = [
      ...reviewData.cuisineTags,
      ...reviewData.amenityTags,
      ...reviewData.dietaryTags,
    ];

    if (allTagIds.length > 0) {
      const reviewTags = allTagIds.map((tagId) => ({
        review_id: newReviewId,
        tag_id: tagId,
      }));
      const { error: tagsError } = await supabase
        .from("review_tags")
        .insert(reviewTags);
      handleSupabaseError(tagsError, "tag insertion");
    }

    // Step 4: Create Dishes and link them to the Review
    let totalRating = 0;
    let ratedDishesCount = 0;

    for (const dish of reviewData.dishTypes) {
      // Create the dish entry
      const { data: newDish, error: dishError } = await supabase
        .from("dishes")
        .insert({
          restaurant_id: newRestaurantId,
          dish_name: dish.dishName,
          dish_price: parseFloat(dish.price) || 0,
        })
        .select()
        .single();
      handleSupabaseError(dishError, "dish creation");

      // Link the dish to the review
      const { error: reviewDishError } = await supabase
        .from("review_dishes")
        .insert({
          review_id: newReviewId,
          dish_id: newDish.id,
          rating: dish.rating,
          is_recommended: dish.recommendDish,
          image_urls: dish.images,
        });
      handleSupabaseError(reviewDishError, "review-dish link creation");

      if (dish.rating > 0) {
        totalRating += dish.rating;
        ratedDishesCount++;
      }
    }

    // Step 5: Calculate and Update the Restaurant's average rating
    const averageRating =
      ratedDishesCount > 0 ? totalRating / ratedDishesCount : 0;

    const { error: ratingUpdateError } = await supabase
      .from("restaurants")
      .update({ rating: averageRating })
      .eq("id", newRestaurantId);
    handleSupabaseError(ratingUpdateError, "restaurant rating update");

    // Final Success message
    Alert.alert("Success", "Review shared successfully!");
  } catch (error) {
    Alert.alert(
      "Error",
      `Failed to share the review. Please try again.\n${error.message}`
    );
  } finally {
    setLoading(false);
  }
};

export default handleSubmit;
