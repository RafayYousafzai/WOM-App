import { View } from "react-native";
import { RestaurantInfo } from "./RestaurantInfo";
import { ImageCarousel } from "./ImageCarousel";
import { PostContent } from "./PostContent";
import { AmenitiesSection } from "./AmenitiesSection";
import { PeoplesSection } from "./PeoplesSection";
import { EngagementBar } from "./EngagementBar";

// Dummy data for a single post to demonstrate the new feature
const dummyPost = {
  restaurantName: "The Fancy Fork",
  location: "New York, NY",
  rating: 4.5,
  price: 25,
  dish_name: "Signature Truffle Pasta",
  review: "Amazing truffle flavor, perfectly al dente pasta. A must-try!",
  cuisine: "Italian",
  images: ["https://example.com/pasta1.jpg", "https://example.com/pasta2.jpg"],
  likesCount: 125,
  isLiked: true,
  isFavorited: false,
  post_id: "post123",
  post_type: "food",
  user_id: "user456",
  all_tags: ["Vegetarian", "Romantic", "Good for groups"],
  people: ["John", "Jane"],
  recommend_dsh: "Truffle Pasta",
};

// Dummy data for other dishes at the same restaurant
const otherDishes = [
  {
    dish_name: "Seared Scallops",
    price: 32,
    rating: 4.8,
    review: "Perfectly seared, melt-in-your-mouth goodness.",
  },
  {
    dish_name: "Classic Margherita Pizza",
    price: 18,
    rating: 4.2,
    review: "Simple yet delicious, great crust.",
  },
  {
    dish_name: "Chocolate Lava Cake",
    price: 12,
    rating: 4.9,
    review: "Rich and decadent, a perfect ending to the meal.",
  },
];

export const PostCard = ({
  post = dummyPost,
  title,
  restaurantName = dummyPost.restaurantName,
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
  // To simulate the 'no other dishes' case, you can set dishes to an empty array or null
  const dishes = otherDishes; // Use `otherDishes` to show the sidebar, or `[]` to hide it

  return (
    <View className="mb-4">
      <View className="mx-3 mb-2">
        <RestaurantInfo
          restaurantName={restaurantName}
          location={location}
          rating={rating}
          title={post?.caption || post?.dish_name}
          price={price}
          cuisine={cuisine}
          onRestaurantPress={onRestaurantPress}
          isInModal={isInModal}
          hasOtherDishes={dishes.length > 0}
          dishes={dishes}
        />
      </View>
      <ImageCarousel images={images} />
      <View className="mx-3">
        <PostContent
          title={post?.caption || post?.dish_name}
          description={post?.review}
          post_type={post_type}
        />
        {post?.all_tags.length > 0 && (
          <AmenitiesSection
            amenities={post?.all_tags}
            post_type={post_type}
            showDiff={true}
            recommend_dsh={post?.recommend_dsh}
          />
        )}
        <PeoplesSection people={post?.people} />
        <EngagementBar
          likesCount={likesCount}
          isLiked={isLiked}
          isFavorited={isFavorited}
          post_type={post_type}
          onFavorite={onFavorite}
          onShare={onShare}
          post_id={post_id}
          user_id={user_id}
          title={title}
          description={description}
        />
      </View>
      <View className="border-b-gray-100 border-b mx-2 py-1" />
    </View>
  );
};
