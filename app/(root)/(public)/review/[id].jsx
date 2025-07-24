import { useEffect, useState } from "react";
import { useLocalSearchParams, usePathname } from "expo-router";
import { View, ActivityIndicator, Text } from "react-native";
import { PostCard } from "@/components/post-listing/PostCard";
import { useSupabase } from "@/context/supabaseContext";
import { useUser } from "@clerk/clerk-expo";

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export default function ViewPost() {
  const pathname = usePathname();
  const { id, postType } = useLocalSearchParams();
  const { supabase } = useSupabase();
  const { user } = useUser();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !postType) return;

    const table = postType === "review" ? "reviews" : "own_reviews";

    const fetchPost = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from(table)
        .select(
          `
          *,
          user:user_id (
            username,
            first_name,
            last_name,
            image_url
          ),
          ${
            postType === "review"
              ? "review_likes(user_id)"
              : "own_review_likes(user_id)"
          }
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching post:", error.message);
        setPost(null);
      } else {
        setPost(data);
      }
      setLoading(false);
    };

    fetchPost();
  }, [id, postType]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!post) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text>Post not found</Text>
      </View>
    );
  }

  const isLiked = (post?.review_likes || post?.own_review_likes || []).some(
    (like) => like.user_id === user.id
  );

  const likesCount =
    post?.review_likes?.length || post?.own_review_likes?.length || 0;
  const fullName = `${post.user?.first_name || ""} ${
    post.user?.last_name || ""
  }`;
  const description = post.recommend_dsh
    ? `Recommendation: ${post.recommend_dsh}`
    : "";
  const amenities = [...(post.cuisines || []), ...(post.amenities || [])];
  const cuisine = post.cuisines?.join(", ");

  return (
    <View className="flex-1 bg-white">
      <PostCard
        post={post}
        username={fullName}
        userAvatar={post.user?.image_url}
        anonymous={post.anonymous}
        postTimeAgo={formatDate(post.created_at)}
        title={post.review || post.caption || ""}
        user_id={post.user_id}
        restaurantName={post.restaurant_name}
        location={post.location?.address}
        description={description}
        rating={post.rating}
        price={post.price}
        cuisine={cuisine}
        images={post.images}
        likesCount={likesCount}
        commentsCount={post?.commentsCount || 0}
        isFavorited={post?.isFavorited || false}
        amenities={amenities}
        isLiked={isLiked}
        post_id={post.id.toString()}
        post_type={postType}
        onLike={() => console.log("Like")}
        onComment={() => console.log("Comment")}
        onFavorite={() => console.log("Favorite")}
        onShare={() => console.log("Share")}
        onRestaurantPress={() => console.log("Restaurant")}
      />
    </View>
  );
}
