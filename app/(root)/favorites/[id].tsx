import React, { useEffect, useState } from "react";
import { View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { PostCard } from "@/components/post-listing/PostCard";
import { posts } from "@/constants/mockPosts";

export default function FavoriteDetails() {
  const handleLike = (postId: string) => {
    console.log(`Liked post ${postId}`);
  };

  const handleComment = (postId: string) => {
    console.log(`Comment on post ${postId}`);
  };

  const handleFavorite = (postId: string) => {
    console.log(`Favorited post ${postId}`);
  };

  const handleFollow = (username: string) => {
    console.log(`Following ${username}`);
  };

  const handleShare = (postId: string) => {
    console.log(`Sharing post ${postId}`);
  };

  const handleRestaurantPress = (restaurantName: string) => {
    console.log(`Viewing restaurant: ${restaurantName}`);
  };

  const exampleUserData = {
    id: "user123",
    name: posts[0].username,
    bio: "Food enthusiast and travel lover. Always looking for the next great meal!",
    postsCount: 48,
    followersCount: 1254,
    followingCount: 342,
    isFollowing: false,
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-2 pt-0">
        {posts.map((post, index) => (
          <PostCard
            key={post.id}
            username={post.username}
            userAvatar={post.userAvatar}
            postTimeAgo={post.postTimeAgo}
            title={post.title}
            restaurantName={post.restaurantName}
            location={post.location.label}
            description={post.description}
            rating={post.rating}
            price={post.price}
            cuisine={post.cuisine}
            images={post.images}
            likesCount={post.likesCount}
            commentsCount={post.commentsCount}
            isFavorited={post.isFavorited}
            amenities={post.amenities}
            onLike={() => handleLike(post.id)}
            onComment={() => handleComment(post.id)}
            onFavorite={() => handleFavorite(post.id)}
            onFollow={() => handleFollow(post.username)}
            onShare={() => handleShare(post.id)}
            onRestaurantPress={() => handleRestaurantPress(post.restaurantName)}
            userData={index === 0 ? exampleUserData : undefined}
            userPosts={index === 0 ? posts.slice(0, 9) : []}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}
