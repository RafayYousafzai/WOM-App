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

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export default function ViewPost() {
  const params = useLocalSearchParams();
  // Convert id to number if your database uses numeric IDs
  const id = Number(params.id);
  const postType = params.postType || "review";

  console.log("ViewPost params:", { id, postType, allParams: params });

  const { supabase } = useSupabase();
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("ViewPost component mounted with params:", params);

  useEffect(() => {
    console.log("useEffect triggered with id:", id, "postType:", postType);

    if (!id || !postType) {
      console.log("Missing id or postType, returning early");
      setError("Missing post ID or type");
      setLoading(false);
      return;
    }

    const table = postType === "review" ? "reviews" : "own_reviews";
    console.log("Using table:", table);

    const fetchPost = async () => {
      try {
        setLoading(true);
        console.log("Starting to fetch post...");

        const { data, error: supabaseError } = await supabase
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

        console.log("Supabase query completed", { data, error: supabaseError });

        if (supabaseError) {
          console.error("Error fetching post:", supabaseError);
          setError(supabaseError.message);
          setPost(null);
        } else if (!data) {
          console.log("No data returned from query");
          setError("Post not found");
          setPost(null);
        } else {
          console.log("Post fetched successfully:", data);
          setPost(data);
          setError(null);
        }
      } catch (err) {
        console.error("Unexpected error in fetchPost:", err);
        setError(err.message);
        setPost(null);
      } finally {
        console.log("Setting loading to false");
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, postType, supabase]);

  console.log("Current state:", { loading, post, error });

  if (loading) {
    console.log("Rendering loading state");
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" />
        <Text className="mt-4">Loading post...</Text>
      </View>
    );
  }

  if (error) {
    console.log("Rendering error state:", error);
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
    console.log("Rendering post not found state");
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

  console.log("Rendering post:", post);

  const isLiked = (post?.review_likes || post?.own_review_likes || []).some(
    (like) => like.user_id === user?.id
  );

  const likesCount =
    post?.review_likes?.length || post?.own_review_likes?.length || 0;

  const fullName = `${post.user?.first_name || ""} ${
    post.user?.last_name || ""
  }`;
  const description = post.recommended_dishes
    ? `Recommendation: ${post.recommended_dishes}`
    : "";
  const amenities = [...(post.cuisines || []), ...(post.amenities || [])];
  const cuisine = post.cuisines?.join(", ");

  return (
    <ScrollView className="flex-1 bg-white pt-12">
      {/* Header with Back Button and Title */}
      <View className="flex-row items-center justify-between mb-4">
        <TouchableOpacity className="p-2" onPress={() => router.push("/home")}>
          <ChevronLeft size={28} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-center flex-1 pr-10">
          Word of Mouth
        </Text>
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
    </ScrollView>
  );
}
