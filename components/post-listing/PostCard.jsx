import { View } from "react-native";
import { PostHeader } from "./PostHeader";
import { RestaurantInfo } from "./RestaurantInfo";
import { ImageCarousel } from "./ImageCarousel";
import { PostContent } from "./PostContent";
import { AmenitiesSection } from "./AmenitiesSection";
import { PeoplesSection } from "./PeoplesSection";
import { EngagementBar } from "./EngagementBar";

export const PostCard = ({
  post,
  username,
  anonymous,
  userAvatar,
  postTimeAgo,
  title,
  restaurantName,
  location,
  description,
  rating,
  price,
  user_id,
  cuisine,
  images,
  likesCount,
  isLiked,
  commentsCount,
  isFavorited,
  amenities = [],
  onLike,
  post_id,
  post_type,
  onComment,
  onFavorite,
  onFollow,
  onShare,
  onDelete,
  onRestaurantPress,
  isInModal = false, // Add this prop
}) => {
  return (
    <View className="mb-4">
      <View className="mx-3 mb-2">
        <PostHeader
          username={anonymous ? "Anonymous" : username}
          userAvatar={
            anonymous
              ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAXKkELt_XuteDLQY_HKcilbvgT3LDOm5WkQ&s"
              : userAvatar
          }
          anonymous={anonymous}
          postTimeAgo={postTimeAgo}
          user_id={user_id}
          post_id={post_id}
          post_type={post_type}
          onDelete={onDelete}
        />

        {restaurantName && (
          <RestaurantInfo
            restaurantName={restaurantName}
            location={location}
            rating={rating}
            price={price}
            cuisine={cuisine}
            onRestaurantPress={onRestaurantPress}
            isInModal={isInModal} // Pass the modal context
          />
        )}
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
