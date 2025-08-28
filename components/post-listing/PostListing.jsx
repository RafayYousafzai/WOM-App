"use client";

import { useEffect, useRef, useState, useCallback } from "react"; // Added useCallback for debounce
import { FlatList, Text, View } from "react-native";
import { PostCard } from "./PostCard";
import { PostListingSkeleton } from "../PageSkeletons/PostCardSkeleton";
import { useSupabase } from "@/context/supabaseContext";
import { useUser } from "@clerk/clerk-expo";
import { togglePostLike } from "../../lib/supabase/postsAction";

import { useBookmarks } from "@/lib/supabase/bookmarkActions";
import { EditPostHeader } from "./EditPost/EditPostHeader";
import { useRoute, useNavigation } from "@react-navigation/native";
import _ from "lodash"; // Assume lodash for debounce; install if needed: expo install lodash

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
  const route = useRoute();
  const navigation = useNavigation();
  const flatListRef = useRef(null);

  const viewedPostsRef = useRef(new Set()); // Track viewed posts to avoid duplicates

  // Debounced function to upsert views in batch
  const debouncedTrackViews = useCallback(
    _.debounce(async (postIds) => {
      if (!user || postIds.length === 0) return;
      const views = postIds.map((id) => ({ user_id: user.id, post_id: id }));
      const { error } = await supabase
        .from("viewed_posts")
        .upsert(views, { onConflict: "user_id, post_id" });
      if (error) console.error("Error tracking views:", error);
      postIds.forEach((id) => viewedPostsRef.current.delete(id)); // Clear after send
    }, 1000), // Debounce 1s
    [user, supabase]
  );

  // Handle viewable items
  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }) => {
      const newViewedIds = viewableItems
        .map((item) => item.item.id)
        .filter((id) => !viewedPostsRef.current.has(id));
      newViewedIds.forEach((id) => viewedPostsRef.current.add(id));
      if (newViewedIds.length > 0) {
        debouncedTrackViews(newViewedIds);
      }
    },
    [debouncedTrackViews]
  );

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 500,
  };

  const handleGatekeepingUpdate = (postId, newGatekeepingValue) => {
    console.log(
      `PostListing: Gatekeeping updated for post ${postId}: ${newGatekeepingValue}`
    );

    handleRefresh();
  };

  useEffect(() => {
    if (route.params?.scrollToTop) {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      navigation.setParams({ scrollToTop: false });
    }
  }, [route.params?.scrollToTop, navigation]);

  const handleLike = async (postId, newIsLiked, newLikesCount) => {
    const updatedPosts = posts.map((post) => {
      if (post.id.toString() === postId) {
        return {
          ...post,
          isLiked: newIsLiked,
          likesCount: newLikesCount,
          // Also update the post_likes array
          post_likes: newIsLiked
            ? [...(post.post_likes || []), { user_id: user.id }]
            : post.post_likes.filter((like) => like.user_id !== user.id),
        };
      }
      return post;
    });
    setTimeout(() => {
      handleRefresh();
    }, 500);
  };

  const renderItem = ({ item }) => {
    const isLiked = user
      ? item.post_likes?.some((like) => like.user_id === user.id)
      : false;
    const likesCount = item.likesCount ?? 0;
    const commentsCount = item.commentsCount ?? 0;

    const fullName = item.user
      ? `${item.user.first_name} ${item.user.last_name}`
      : "Anonymous";

    const primaryDish = item.dishes?.[0];
    const dishName = primaryDish?.dish_name || item.review || "Post";
    const dishPrice = primaryDish?.dish_price ?? 0;
    const dishRating = primaryDish?.rating ?? item.rating ?? 0;

    const allImages =
      item.dishes?.reduce((images, dish) => {
        if (dish.image_urls && Array.isArray(dish.image_urls)) {
          const validUrls = dish.image_urls.filter(
            (url) => url && typeof url === "string" && url.trim().length > 0
          );
          return [...images, ...validUrls];
        }
        return images;
      }, []) || [];

    // Get recommended dish
    const recommendedDish = item.dishes?.find((dish) => dish.is_recommended);
    const description = recommendedDish
      ? `Recommended: ${recommendedDish.dish_name}`
      : "";

    // Get tags by type
    const cuisineTags =
      item.all_tags?.filter((tag) => tag.type === "cuisine") || [];
    const amenityTags =
      item.all_tags?.filter((tag) => tag.type === "amenity") || [];
    const cuisine = cuisineTags.map((tag) => tag.name).join(", ");
    const amenities = amenityTags.map((tag) => tag.name);

    return (
      <View className="mb-4">
        {/* Header section */}
        <View className="mx-3 mb-2">
          <EditPostHeader
            username={fullName}
            location={
              item.gatekeeping
                ? null
                : item.restaurant?.location || item.location?.address
            }
            userAvatar={item.user?.image_url}
            user_id={item.user_id}
            postTimeAgo={formatDate(item.created_at)}
            post_id={item.id.toString()}
            post_type="post"
            anonymous={item.anonymous}
            post={item}
            onDelete={(postId) => {
              console.log("Post deleted:", postId);
              handleRefresh();
            }}
            onGatekeepingUpdate={handleGatekeepingUpdate}
          />
        </View>

        {/* Post content */}
        <PostCard
          post={item}
          username={fullName}
          userAvatar={item.user?.image_url}
          anonymous={item.anonymous}
          postTimeAgo={formatDate(item.created_at)}
          title={dishName}
          user_id={item.user_id}
          restaurantName={item.restaurant_name}
          location={item.location?.address}
          description={description}
          rating={dishRating}
          price={dishPrice}
          cuisine={cuisine}
          images={allImages}
          likesCount={likesCount}
          commentsCount={commentsCount}
          isFavorited={false} // Will be updated dynamically
          amenities={amenities}
          isLiked={isLiked}
          post_id={item.id.toString()}
          post_type="post"
          onLike={handleLike}
          onComment={() => console.log("Comment on post:", item.id)}
          onFavorite={() => console.log("Favorite post:", item.id)}
          onShare={() => console.log("Share post:", item.id)}
          onRestaurantPress={() =>
            console.log("Restaurant press:", item.restaurant_name)
          }
        />
      </View>
    );
  };

  const renderContent = (ListHeaderComponent) => {
    if (loading && (!posts || posts.length === 0)) {
      return <PostListingSkeleton count={5} />;
    }

    return (
      <FlatList
        ref={flatListRef}
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ItemSeparatorComponent={() => <View className="h-2" />}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <View className="flex-1">
            {isLoadingMore && posts && posts.length > 0 && (
              <PostListingSkeleton count={1} />
            )}
            <View className="h-14 mb-14" />
          </View>
        }
        ListHeaderComponent={ListHeaderComponent}
        stickyHeaderHiddenOnScroll={true}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        onRefresh={handleRefresh}
        refreshing={loading}
        ListEmptyComponent={
          <View className="mt-36 items-center justify-center">
            {!loading && (
              <Text className="text-gray-500">No posts available</Text>
            )}
          </View>
        }
        onViewableItemsChanged={handleViewableItemsChanged} // ADDED: For view tracking
        viewabilityConfig={viewabilityConfig} // ADDED
      />
    );
  };

  return <View className="flex-1">{renderContent(ListHeaderComponent)}</View>;
}
