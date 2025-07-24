import React from "react";
import { View } from "react-native";
import { Skeleton } from "@/components/ui/skeleton";

export const SearchResultSkeleton = ({ type = "user" }) => {
  return (
    <View className="flex-row items-center my-2 mx-3 p-4 bg-white rounded-xl">
      {/* Avatar/Image Placeholder */}
      <Skeleton
        className={`${
          type === "user" ? "w-14 h-14 rounded-full" : "w-16 h-16 rounded-xl"
        } mr-4`}
      />
      <View className="flex-1">
        {/* Title/Name Placeholder */}
        <Skeleton className="h-5 w-40 rounded mb-1" />
        {/* Username/Description Placeholder */}
        <Skeleton className="h-4 w-24 rounded mt-1" />
        {type !== "user" && (
          <View className="flex-row items-center mt-1">
            <Skeleton className="h-4 w-12 rounded" />
          </View>
        )}
      </View>
      {/* Chevron Placeholder */}
      <Skeleton className="h-5 w-5 rounded-full" />
    </View>
  );
};

export const SearchResultsSkeleton = ({ count = 4 }) => {
  return (
    <View className="flex-1">
      {Array(count)
        .fill(0)
        .map((_, index) => (
          <SearchResultSkeleton
            key={`search-skeleton-${index}`}
            type={index % 2 === 0 ? "user" : "review"} // Alternate between user and review skeletons
          />
        ))}
    </View>
  );
};
