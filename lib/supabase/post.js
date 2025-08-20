import { Alert } from "react-native";
import { validateAndSanitizeReviewData } from "@/lib/Joi/reviewDataSchema";
import { useSupabase } from "@/context/supabaseContext";

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
 * @param {function} options.onSuccess - Optional success callback.
 * @param {function} options.onError - Optional error callback.
 */
export const handleReviewSubmit = async ({
  reviewData,
  user,
  supabase,
  setLoading,
  onSuccess,
  onError,
}) => {
  console.log("Raw review data:", reviewData);

  // Step 1: Validate and sanitize the review data
  const validation = validateAndSanitizeReviewData(reviewData);

  if (!validation.isValid) {
    const errorMessage = validation.errors
      .map((err) => `${err.field}: ${err.message}`)
      .join("\n");
    console.error("Validation errors:", validation.errors);

    Alert.alert(
      "Validation Error",
      `Please fix the following issues:\n\n${errorMessage}`
    );

    if (onError && typeof onError === "function") {
      onError(new Error(`Validation failed: ${errorMessage}`));
    }

    return { success: false, errors: validation.errors };
  }

  const validatedData = validation.data;
  console.log("Validated data:", validatedData);

  // Step 2: Check authentication
  if (!user) {
    const errorMessage = "You must be logged in to post a review.";
    Alert.alert("Authentication Error", errorMessage);

    if (onError && typeof onError === "function") {
      onError(new Error(errorMessage));
    }

    return { success: false, error: errorMessage };
  }

  if (setLoading && typeof setLoading === "function") {
    setLoading(true);
  }

  try {
    console.log("Starting database operations...");

    // Step 4: Create a new Restaurant for this review
    console.log("Creating restaurant:", validatedData.location.name);
    const { data: newRestaurant, error: restaurantError } = await supabase
      .from("restaurants")
      .insert({
        restaurant_name: validatedData.location.name,
        location: validatedData.location,
        user_id: user.id,
        rating: 0, // Initial rating, will be updated later
      })
      .select()
      .single();

    handleSupabaseError(restaurantError, "restaurant creation");
    console.log("Restaurant created:", newRestaurant);

    const newRestaurantId = newRestaurant.id;

    // Step 5: Create the main Review entry
    console.log("Creating review...");
    const { data: newReview, error: reviewError } = await supabase
      .from("reviews")
      .insert({
        user_id: user.id,
        restaurant_id: newRestaurantId,
        review: validatedData.review,
        anonymous: validatedData.anonymous,
        people: validatedData.peoplesTags || [],
      })
      .select()
      .single();

    handleSupabaseError(reviewError, "review creation");
    console.log("Review created:", newReview);

    const newReviewId = newReview.id;

    // Step 6: Insert all Tags (Cuisine, Amenity, Dietary)
    const allTagIds = [
      ...(validatedData.cuisineTags || []),
      ...(validatedData.amenityTags || []),
      ...(validatedData.dietaryTags || []),
    ];

    console.log("Inserting tags:", allTagIds);
    if (allTagIds.length > 0) {
      const reviewTags = allTagIds.map((tagId) => ({
        review_id: newReviewId,
        tag_id: tagId,
      }));

      const { error: tagsError } = await supabase
        .from("review_tags")
        .insert(reviewTags);

      handleSupabaseError(tagsError, "tag insertion");
      console.log("Tags inserted successfully");
    }

    // Step 7: Create Dishes and link them to the Review
    let totalRating = 0;
    let ratedDishesCount = 0;

    console.log("Processing dishes:", validatedData.dishTypes);
    for (const dish of validatedData.dishTypes) {
      console.log("Creating dish:", dish.dishName);

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
      console.log("Dish created:", newDish);

      // Link the dish to the review
      const reviewDishData = {
        review_id: newReviewId,
        dish_id: newDish.id,
        rating: dish.rating || 0,
        is_recommended: dish.recommendDish || false,
      };

      // Only add image_urls if there are actual images
      if (dish.images && Array.isArray(dish.images) && dish.images.length > 0) {
        reviewDishData.image_urls = dish.images;
      }

      const { error: reviewDishError } = await supabase
        .from("review_dishes")
        .insert(reviewDishData);

      handleSupabaseError(reviewDishError, "review-dish link creation");
      console.log("Review-dish link created");

      if (dish.rating && dish.rating > 0) {
        totalRating += dish.rating;
        ratedDishesCount++;
      }
    }

    // Step 8: Calculate and Update the Restaurant's average rating
    const averageRating =
      ratedDishesCount > 0 ? totalRating / ratedDishesCount : 0;

    console.log("Updating restaurant rating:", averageRating);
    const { error: ratingUpdateError } = await supabase
      .from("restaurants")
      .update({ rating: averageRating })
      .eq("id", newRestaurantId);

    handleSupabaseError(ratingUpdateError, "restaurant rating update");
    console.log("Restaurant rating updated successfully");

    // Step 9: Success handling
    const result = {
      success: true,
      restaurantId: newRestaurantId,
      reviewId: newReviewId,
      averageRating,
      validatedData,
    };

    Alert.alert("Success", "Review shared successfully!");

    if (onSuccess && typeof onSuccess === "function") {
      onSuccess(result);
    }

    console.log("Review submission completed successfully:", result);
    return result;
  } catch (error) {
    console.error("Review submission error:", error);

    const errorMessage = `Failed to share the review. Please try again.\n${error.message}`;
    Alert.alert("Error", errorMessage);

    if (onError && typeof onError === "function") {
      onError(error);
    }

    return { success: false, error: error.message };
  } finally {
    if (setLoading && typeof setLoading === "function") {
      setLoading(false);
    }
  }
};

/**
 * Custom hook for using the review submission handler
 * This fixes the "cb is not a function" error by properly handling the hooks
 */
export const useReviewSubmit = () => {
  // Import hooks at the top level of the custom hook
  const { reviewData, setLoading } = useReview();
  const { supabase } = useSupabase();
  const { user } = useUser();

  const submitReview = async (options = {}) => {
    const { onSuccess, onError, customReviewData } = options;

    return await handleReviewSubmit({
      reviewData: customReviewData || reviewData,
      user,
      supabase,
      setLoading,
      onSuccess,
      onError,
    });
  };

  return {
    submitReview,
    reviewData,
    user,
    isLoggedIn: !!user,
  };
};

export default handleReviewSubmit;
