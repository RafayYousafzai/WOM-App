import React from "react";
import { View } from "react-native";
import { Skeleton } from "@/components/ui/skeleton";

export const ProfileSkeleton = () => {
  return (
    <View className="pt-6 pb-4 px-5 bg-white">
      {/* Profile Header Skeleton */}
      <View className="flex-row justify-between items-start">
        <Skeleton className="w-24 h-24 rounded-full" />
        <View className="flex-1 ml-4">
          <Skeleton className="h-6 w-40 rounded mb-2" />
          <Skeleton className="h-4 w-20 rounded mb-2" />
          <Skeleton className="h-4 w-60 rounded mb-2" />
          <Skeleton className="h-6 w-32 rounded" />
        </View>
      </View>
      {/* Stats Row Skeleton */}
      <View className="flex-row justify-between mt-6 bg-white rounded-2xl p-4 border border-gray-100">
        <View className="items-center flex-1">
          <Skeleton className="h-6 w-12 rounded" />
          <Skeleton className="h-4 w-16 rounded mt-1" />
        </View>
        <View className="h-full w-px bg-gray-200" />
        <View className="items-center flex-1">
          <Skeleton className="h-6 w-12 rounded" />
          <Skeleton className="h-4 w-16 rounded mt-1" />
        </View>
        <View className="h-full w-px bg-gray-200" />
        <View className="items-center flex-1">
          <Skeleton className="h-6 w-12 rounded" />
          <Skeleton className="h-4 w-16 rounded mt-1" />
        </View>
      </View>
      {/* Buttons Skeleton */}
      <View className="flex-row mt-4 gap-2">
        <Skeleton className="flex-1 h-10 rounded-xl" />
        <Skeleton className="h-10 w-16 rounded-xl" />
      </View>
    </View>
  );
};

export const ProfileContentSkeleton = () => {
  return (
    <View className="bg-white">
      <ProfileSkeleton />
      {/* Optional: Add skeleton for filters or posts if needed */}
      <View className="px-5">
        <Skeleton className="h-10 w-full rounded-xl mt-4" />
      </View>
    </View>
  );
};
