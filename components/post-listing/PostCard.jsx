import { View } from "react-native";
import { RestaurantInfo } from "./RestaurantInfo";
import { ImageCarousel } from "./ImageCarousel";
import { PostContent } from "./PostContent";
import { AmenitiesSection } from "./AmenitiesSection";
import { PeoplesSection } from "./PeoplesSection";
import { EngagementBar } from "./EngagementBar";
import { useState, useCallback } from "react";

export const PostCard = ({
  post,
  title,
  postTimeAgo,
  restaurantName,
  location,
  description,
  rating,
  price,
  user_id,
  cuisine,
  images = [],
  likesCount = 0,
  isLiked = false,
  isFavorited = false,
  post_id,
  post_type = "post",
  onFavorite,
  onShare,
  onRestaurantPress,
  isInModal = false,
}) => {
  const [currentDishIndex, setCurrentDishIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const dishes = post?.dishes || [];

  const formattedDishes = dishes.map((dish) => ({
    id: dish.id,
    name: dish.dish_name,
    price: dish.dish_price,
    category: dish.dish_type || "Main Course",
    rating: dish.rating || rating,
    review: description || post?.review,
    dishType: dish.dish_type?.toLowerCase() || "main",
    is_recommended: dish.is_recommended,
    image_urls: dish.image_urls || [],
  }));

  const fallbackDishes =
    formattedDishes.length > 0
      ? formattedDishes
      : [
          {
            id: 1,
            name: title || post?.review || "Post",
            price: price,
            category: "Main Course",
            rating: rating || 4.0,
            review: description || post?.review,
            dishType: "main",
            is_recommended: false,
            image_urls: images,
          },
        ];

  const currentDish = fallbackDishes[currentDishIndex] || fallbackDishes[0];

  const allImages =
    images.length > 0
      ? images
      : fallbackDishes.reduce((allImgs, dish) => {
          return [...allImgs, ...(dish.image_urls || [])];
        }, []);

  const handleImageChange = useCallback(
    (imageIndex) => {
      setCurrentImageIndex(imageIndex);

      // Map imageIndex back to the dish it belongs to
      let total = 0;
      for (let i = 0; i < fallbackDishes.length; i++) {
        total += fallbackDishes[i].image_urls?.length || 0;
        if (imageIndex < total) {
          setCurrentDishIndex(i);
          break;
        }
      }
    },
    [fallbackDishes]
  );

  // Handle dish selection from RestaurantInfo sidebar
  const handleDishSelect = useCallback(
    (dishId) => {
      const dishIndex = fallbackDishes.findIndex((dish) => dish.id === dishId);
      if (dishIndex !== -1) {
        setCurrentDishIndex(dishIndex);

        // Calculate the starting image index for this dish
        let imageIndex = 0;
        for (let i = 0; i < dishIndex; i++) {
          const dishImages = fallbackDishes[i].image_urls || [];
          imageIndex += dishImages.length;
        }

        setCurrentImageIndex(imageIndex);
        return imageIndex;
      }
      return 0;
    },
    [fallbackDishes]
  );

  return (
    <View className="mb-4">
      <View className="mx-3 mb-2">
        <RestaurantInfo
          restaurantName={restaurantName}
          location={location}
          rating={currentDish?.rating || rating}
          title={currentDish?.name}
          price={currentDish?.price || price}
          cuisine={cuisine}
          onRestaurantPress={onRestaurantPress}
          isInModal={isInModal}
          restaurantDishes={fallbackDishes}
          currentDishId={currentDish?.id}
          onDishSelect={handleDishSelect}
        />
      </View>

      {(allImages.length > 0 || fallbackDishes.length > 0) && (
        <ImageCarousel
          images={allImages}
          dishes={fallbackDishes}
          onImageChange={handleImageChange}
          currentIndex={currentImageIndex}
        />
      )}

      <View className="mx-3">
        <EngagementBar
          likesCount={likesCount}
          isLiked={isLiked}
          isFavorited={isFavorited}
          post_type={post_type}
          onFavorite={onFavorite}
          onShare={onShare}
          post_id={post_id}
          user_id={user_id}
          title={currentDish?.name || title}
          description={currentDish?.review || description}
        />

        <PeoplesSection people={post?.people} />

        {post?.all_tags?.length > 0 && (
          <AmenitiesSection
            amenities={post.all_tags}
            post_type={post_type}
            showDiff={true}
            recommend_dsh={fallbackDishes.find((d) => d.is_recommended)?.name}
          />
        )}

        <PostContent
          location={location}
          title={currentDish?.name || title}
          description={post?.review}
          post_type={post_type}
          postTimeAgo={postTimeAgo}
        />
      </View>
      <View className="border-b-gray-100 border-b mx-2 py-1" />
    </View>
  );
};
