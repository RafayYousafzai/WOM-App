import { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { PostCard } from "@/components/post-listing/PostCard";
import { useSupabase } from "@/context/supabaseContext";
import { useUser } from "@clerk/clerk-expo";
import { ChevronLeft } from "lucide-react-native";
import { EditPostHeader } from "../../../components/post-listing/EditPost/EditPostHeader";

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

// 🔧 normalize Supabase result to what PostCard expects
const transformPost = (post, userId) => ({
  ...post,
  restaurant_name: post.restaurants?.location || "Unknown Restaurant",
  location: { address: post.restaurants?.location },
  rating: post.restaurants?.rating,
  dishes: post.post_dishes || [],
  all_tags: post.post_tags?.map((pt) => pt.tags).filter(Boolean) || [],
  likesCount: post.post_likes?.length || 0,
  commentsCount: post.post_comments?.length || 0,
  isLiked: post.post_likes?.some((like) => like.user_id === userId) || false,
  user: post.users,
});

export default function ViewPost() {
  const params = useLocalSearchParams();
  const id = Number(params.id);

  const { supabase } = useSupabase();
  const { user } = useUser();
  const router = useRouter();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError("Missing post ID");
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        setLoading(true);

        const { data, error: supabaseError } = await supabase
          .from("posts")
          .select(
            `
              id,
              review,
              user_id,
              is_review,
              anonymous,
              people,
              created_at,
              updated_at,
              restaurants (
                id,
                location,
                rating
              ),
              users (
                id,
                first_name,
                last_name,
                image_url
              ),
              post_dishes (
                id,
                dish_name,
                dish_price,
                dish_type,
                rating,
                is_recommended,
                image_urls
              ),
              post_tags (
                tags (
                  id,
                  name,
                  type
                )
              ),
              post_likes (
                user_id
              ),
              post_comments (
                id
              )
            `
          )
          .eq("id", id)
          .single();

        if (supabaseError) {
          setError(supabaseError.message);
          setPost(null);
        } else if (!data) {
          setError("Post not found");
          setPost(null);
        } else {
          const transformed = transformPost(data, user?.id);
          setPost(transformed);
          setError(null);
        }
      } catch (err) {
        setError(err.message);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, supabase, user?.id]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" />
        <Text className="mt-4">Loading post...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-red-500 mb-2">Error: {error}</Text>
        <TouchableOpacity
          className="bg-blue-500 px-4 py-2 rounded"
          onPress={() => router.push("/home")}
        >
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!post) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="mb-2">Post not found</Text>
        <TouchableOpacity
          className="bg-blue-500 px-4 py-2 rounded"
          onPress={() => router.push("/home")}
        >
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const fullName = `${post.user?.first_name || ""} ${
    post.user?.last_name || ""
  }`;
  const description = post.dishes?.length
    ? `Recommendation: ${post.dishes.map((d) => d.dish_name).join(", ")}`
    : "";
  const amenities = [...(post.cuisines || []), ...(post.amenities || [])];
  const cuisine = post.cuisines?.join(", ");

  return (
    <ScrollView className="flex-1 bg-white pt-12">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <TouchableOpacity className="p-2" onPress={() => router.push("/home")}>
          <ChevronLeft size={28} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-center flex-1 pr-10">
          Word of Mouth
        </Text>
      </View>

      <View className="mx-3 mb-2">
        <EditPostHeader
          username={fullName}
          location={post.location?.address}
          userAvatar={post.user?.image_url}
          user_id={post.user_id}
          postTimeAgo={formatDate(post.created_at)}
          post_id={post.id.toString()}
          post_type="post"
          anonymous={post.anonymous}
          post={post}
          onDelete={(postId) => {
            console.log("Post deleted:", postId);
            handleRefresh();
          }}
        />
      </View>
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
        images={post.dishes?.flatMap((d) => d.image_urls) || []}
        likesCount={post.likesCount}
        commentsCount={post.commentsCount}
        isFavorited={post?.isFavorited || false}
        amenities={amenities}
        isLiked={post.isLiked}
        post_id={post.id.toString()}
        onLike={() => console.log("Like")}
        onComment={() => console.log("Comment")}
        onFavorite={() => console.log("Favorite")}
        onShare={() => console.log("Share")}
        onRestaurantPress={() => console.log("Restaurant")}
      />
    </ScrollView>
  );
}
