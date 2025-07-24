import React from "react";
import { View, FlatList } from "react-native";
import { Skeleton } from "@/components/ui/skeleton";

const PostCardSkeleton = () => {
  return (
    <View className="mb-4">
      <View className="mx-3 mb-2">
        {/* Post Header Skeleton */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <Skeleton className="h-10 w-10 rounded-full" />
            <View className="ml-2">
              <Skeleton className="h-4 w-30 rounded" />
              <Skeleton className="h-3 w-20 rounded mt-1" />
            </View>
          </View>
          <Skeleton className="h-8 w-20 rounded-full" />
        </View>

        {/* Restaurant Info Skeleton */}
        <View className="mt-2">
          <Skeleton className="h-5 w-44 rounded" />
          <View className="flex-row items-center mt-1">
            <Skeleton className="h-3.5 w-36 rounded" />
            <Skeleton className="h-3.5 w-16 rounded ml-2" />
          </View>
          <View className="flex-row items-center mt-1">
            <Skeleton className="h-3.5 w-10 rounded" />
            <Skeleton className="h-3.5 w-24 rounded ml-2" />
          </View>
        </View>
      </View>

      {/* Image Carousel Skeleton */}
      <Skeleton className="h-60 w-full" />

      {/* Post Content Skeleton */}
      <View className="mx-3 mt-2">
        <Skeleton className="h-4 w-11/12 rounded" />
        <Skeleton className="h-4 w-4/5 rounded mt-1" />
        <Skeleton className="h-4 w-3/5 rounded mt-1" />

        {/* Amenities Skeleton */}
        <View className="flex-row mt-3">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full ml-2" />
          <Skeleton className="h-6 w-20 rounded-full ml-2" />
        </View>

        {/* Engagement Bar Skeleton */}
        <View className="flex-row justify-between mt-3">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </View>
      </View>
      <View className="border-b-gray-100 border-b mx-2 py-1 mt-2" />
    </View>
  );
};

// This component is used to create multiple skeleton cards
export const PostListingSkeleton = ({ count = 3 }) => {
  return (
    <FlatList
      data={Array(count).fill(0)}
      renderItem={() => <PostCardSkeleton />}
      keyExtractor={(_, index) => `skeleton-${index}`}
      showsVerticalScrollIndicator={false}
    />
  );
};
