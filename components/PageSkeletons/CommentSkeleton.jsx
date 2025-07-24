import React from "react";
import { View } from "react-native";
import { Skeleton } from "@/components/ui/skeleton";

export const CommentSkeleton = () => {
  return (
    <View className="mb-5 border-b border-gray-100 pb-4">
      <View className="flex-row">
        <Skeleton className="w-10 h-10 rounded-full" />
        <View className="flex-1 ml-3">
          <View className="flex-row items-center justify-between">
            <Skeleton className="h-4 w-32 rounded" />
          </View>
          <Skeleton className="h-20 w-full rounded-lg mt-2" />
          <View className="flex-row mt-2">
            <Skeleton className="h-3 w-16 rounded" />
          </View>
        </View>
      </View>
    </View>
  );
};

export const CommentListSkeleton = ({ count = 3 }) => {
  return (
    <View className="px-4 pt-2">
      {Array(count)
        .fill(0)
        .map((_, index) => (
          <CommentSkeleton key={`comment-skeleton-${index}`} />
        ))}
    </View>
  );
};
