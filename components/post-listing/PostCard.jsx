import { View } from "react-native";
import { RestaurantInfo } from "./RestaurantInfo";
import { ImageCarousel } from "./ImageCarousel";
import { PostContent } from "./PostContent";
import { AmenitiesSection } from "./AmenitiesSection";
import { PeoplesSection } from "./PeoplesSection";
import { EngagementBar } from "./EngagementBar";
import { useState, useCallback } from "react";

export const dummyPost = {
  id: "post123",
  user_id: "user456",
  user: {
    first_name: "John",
    last_name: "Doe",
    image_url:
      "https://sm.ign.com/ign_ap/cover/a/avatar-gen/avatar-generations_hugw.jpg",
  },
  created_at: new Date().toISOString(),
  restaurant_name: "The Fancy Fork",
  location: { address: "New York, NY" },
  rating: 4.5,
  price: 25,
  caption: "Signature Truffle Pasta",
  review: "Amazing truffle flavor, perfectly al dente pasta. A must-try!",
  cuisines: ["Italian"],
  images: [
    "https://thetruffle.co.uk/wp-content/uploads/2022/09/IMG_6730.jpg",
    "https://img.kidspot.com.au/IYMb6gix/w643-h428-cfill-q90/kk/2023/06/oonis-classic-margherita-pizza-608614-1.jpg",
    "https://www.billyparisi.com/wp-content/uploads/2022/02/lava-cake-1.jpg",
  ],
  // Multiple dishes corresponding to images
  dishes: [
    {
      id: 1,
      name: "Signature Truffle Pasta",
      price: 18,
      category: "Main Course",
      rating: 4.3,
      review: "Authentic wood-fired pizza with fresh mozzarella and basil.",
      dishType: "main",
    },
    {
      id: 2,
      name: "Classic Margherita Pizza",
      price: 25,
      category: "Pizza",
      rating: 4.5,
      review: "Amazing truffle flavor, perfectly al dente pasta. A must-try!",
      dishType: "main",
    },
    {
      id: 3,
      name: "Chocolate Lava Cake",
      price: 12,
      category: "Dessert",
      rating: 4.7,
      review: "Rich, decadent dessert with a molten chocolate center.",
      dishType: "dessert",
    },
  ],
  likeCount: [{ count: 125 }],
  review_likes: [{ user_id: "user456" }],
  own_review_likes: [],
  amenities: ["Vegetarian", "Romantic", "Good for groups"],
  recommend_dsh: "Truffle Pasta",
  commentsCount: 3,
  anonymous: false,
};

export const PostCard = ({
  post = dummyPost,
  title,
  postTimeAgo,
  restaurantName = dummyPost.restaurant_name,
  location = dummyPost.location,
  description,
  rating = dummyPost.rating,
  price = dummyPost.price,
  user_id = dummyPost.user_id,
  cuisine = dummyPost.cuisine,
  images = dummyPost.images,
  likesCount = dummyPost.likesCount,
  isLiked = dummyPost.isLiked,
  isFavorited = dummyPost.isFavorited,
  post_id = dummyPost.post_id,
  post_type = dummyPost.post_type,
  onFavorite,
  onShare,
  onRestaurantPress,
  isInModal = false,
}) => {
  // State to track current dish/image index
  const [currentDishIndex, setCurrentDishIndex] = useState(0);

  // Get dishes from post or use dummy data
  const dishes = post?.dishes || dummyPost.dishes;
  const currentDish = dishes[currentDishIndex];

  // Handle image swipe to change dish
  const handleImageChange = useCallback((imageIndex) => {
    setCurrentDishIndex(imageIndex);
  }, []);

  // Handle dish selection from sidebar
  const handleDishSelect = useCallback(
    (dishId) => {
      const dishIndex = dishes.findIndex((dish) => dish.id === dishId);
      if (dishIndex !== -1) {
        setCurrentDishIndex(dishIndex);
        // Return the index so RestaurantInfo can trigger image carousel change
        return dishIndex;
      }
      return currentDishIndex;
    },
    [dishes, currentDishIndex]
  );

  return (
    <View className="mb-4">
      <View className="mx-3 mb-2">
        <RestaurantInfo
          restaurantName={restaurantName}
          location={location?.address || location}
          rating={currentDish?.rating || rating}
          title={currentDish?.name || post?.caption || post?.dish_name}
          price={currentDish?.price || price}
          cuisine={cuisine}
          onRestaurantPress={onRestaurantPress}
          isInModal={isInModal}
          // Pass dishes data
          restaurantDishes={dishes}
          currentDishId={currentDish?.id}
          onDishSelect={handleDishSelect}
        />
      </View>
      <ImageCarousel
        images={images}
        onImageChange={handleImageChange}
        currentIndex={currentDishIndex}
      />
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
        <PostContent
          location={location?.address || location}
          title={currentDish?.name || post?.caption || post?.dish_name}
          description={post?.review}
          post_type={post_type}
          postTimeAgo={postTimeAgo}
        />
        {/* {post?.all_tags.length > 0 && (
          <AmenitiesSection
            amenities={post?.all_tags}
            post_type={post_type}
            showDiff={true}
            recommend_dsh={post?.recommend_dsh}
          />
        )} */}
        <PeoplesSection people={post?.people} />
      </View>
      <View className="border-b-gray-100 border-b mx-2 py-1" />
    </View>
  );
};
