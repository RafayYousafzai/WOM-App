"use client";

import { useEffect, useState, useRef } from "react";
import { FlatList, Text, View } from "react-native";
import { PostCard } from "./PostCard";
import { PostListingSkeleton } from "../PageSkeletons/PostCardSkeleton";
import { useSupabase } from "@/context/supabaseContext";
import { useUser } from "@clerk/clerk-expo";
import { toggleOwnReviewLike } from "../../lib/supabase/ownreviewsActions";
import { toggleReviewLike } from "@/lib/supabase/reviewsActions";
import { useBookmarks } from "@/lib/supabase/bookmarkActions";
import { EditPostHeader } from "./EditPost/EditPostHeader";
import { useRoute, useNavigation } from "@react-navigation/native";
import { dummyPost } from "./PostCard";

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export default function PostListing({
  ListHeaderComponent,
  posts,
  handleEndReached,
  loading,
  isLoadingMore,
  handleRefresh = () => console.warn("Refresh fn not found"),
}) {
  const { supabase } = useSupabase();
  const { user } = useUser();
  const { isPostBookmarked } = useBookmarks();
  const [enrichedPosts, setEnrichedPosts] = useState([]);
  const route = useRoute();
  const navigation = useNavigation(); // Added navigation hook
  const flatListRef = useRef(null);

  useEffect(() => {
    if (route.params?.scrollToTop) {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });

      navigation.setParams({ scrollToTop: false });
    }
  }, [route.params?.scrollToTop, navigation]);

  useEffect(() => {
    const enrichPosts = async () => {
      if (!posts || !user?.id) return;
      const enriched = await Promise.all(
        posts.map(async (post) => {
          const postType = post.caption ? "own_review" : "review";
          const isFavorited = await isPostBookmarked({
            postId: post.id,
            postType,
            userId: user.id,
          });
          return { ...post, isFavorited };
        })
      );
      setEnrichedPosts(enriched);
    };
    enrichPosts();
  }, [posts, user]);

  const handleLike = (item) => {
    if (item.caption) {
      toggleOwnReviewLike(supabase, user?.id, item.id);
    } else {
      toggleReviewLike(supabase, user?.id, item.id);
    }
  };

  const renderItem = ({ item }) => {
    const isLiked =
      item.review_likes?.some((like) => like.user_id === user?.id) ||
      item.own_review_likes?.some((like) => like.user_id === user?.id);

    const likesCount = item?.likeCount?.[0]?.count || item.likesCount || 0;
    const fullName = item.user
      ? `${item.user.first_name} ${item.user.last_name}`
      : "Anonymous";

    const description = item.recommend_dsh
      ? `Recommendation: ${item.recommend_dsh}`
      : "";
    const amenities = [...(item.cuisines || []), ...(item.amenities || [])];
    const cuisine = item.cuisines?.join(", ");
    const postType = item.caption ? "own_review" : "review";

    return (
      <View className="mb-4">
        {/* Header section */}
        <View className="mx-3 mb-2">
          <EditPostHeader
            username={fullName}
            location={item.location?.address}
            userAvatar={item.user.image_url}
            user_id={item.user_id}
            postTimeAgo={formatDate(item.created_at)}
            post_id={item.id.toString()}
            post_type={postType}
            anonymous={item.anonymous}
            post={item}
            onDelete={(postId) => {
              console.log("Post deleted:", postId);
              handleRefresh();
            }}
          />
        </View>

        {/* Post content */}
        <PostCard
          post={item}
          username={fullName}
          userAvatar={item.user.image_url}
          anonymous={item.anonymous}
          postTimeAgo={formatDate(item.created_at)}
          title={item.review || item.caption || ""}
          user_id={item.user_id}
          restaurantName={item.restaurant_name}
          location={item.location?.address}
          description={description}
          rating={item.rating}
          price={item.price}
          cuisine={cuisine}
          images={item.images}
          likesCount={likesCount}
          commentsCount={item?.commentsCount || 0}
          isFavorited={item.isFavorited || false}
          amenities={amenities}
          isLiked={isLiked}
          post_id={item.id.toString()}
          post_type={postType}
          onLike={() => handleLike(item)}
          onComment={() => console.log("Comment")}
          onFavorite={() => console.log("Favorite")}
          onShare={() => console.log("Share")}
          onRestaurantPress={() => console.log("Restaurant")}
        />
      </View>
    );
  };

  const renderContent = (ListHeaderComponent) => {
    if (loading && (!posts || posts.length === 0)) {
      return <PostListingSkeleton count={5} />;
    }

    return (
      // <FlatList
      //   ref={flatListRef}
      //   data={posts}
      //   renderItem={renderItem}
      //   keyExtractor={(item) => item.id.toString()}
      //   ItemSeparatorComponent={() => <View className="h-2" />}
      //   showsVerticalScrollIndicator={false}
      //   ListFooterComponent={
      //     <View className="flex-1">
      //       {isLoadingMore && posts && posts.length > 0 && (
      //         <PostListingSkeleton count={1} />
      //       )}
      //       <View className="h-14 mb-14" />
      //     </View>
      //   }
      //   ListHeaderComponent={ListHeaderComponent}
      //   stickyHeaderHiddenOnScroll={true}
      //   onEndReached={handleEndReached}
      //   onEndReachedThreshold={0.5}
      //   onRefresh={handleRefresh}
      //   refreshing={loading}
      //   ListEmptyComponent={
      //     <View className="mt-36 items-center justify-center">
      //       {loading && (
      //         <Text className="text-gray-500">No posts available</Text>
      //       )}
      //     </View>
      //   }
      // />
      // Dummy FlatList below:
      <FlatList
        ref={flatListRef}
        // Force showing dummy data instead of DB posts
        data={[dummyPost]}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.post_id || index.toString()}
        ItemSeparatorComponent={() => <View className="h-2" />}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeaderComponent}
      />
    );
  };

  return <View className="flex-1">{renderContent(ListHeaderComponent)}</View>;
}
