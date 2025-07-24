import React from "react";
import { View, Dimensions } from "react-native";
import { Skeleton } from "@/components/ui/skeleton";

const GRID_COLUMNS = 3;
const ITEM_WIDTH = Dimensions.get("window").width * 0.32;

export const FavoriteCardSkeleton = () => {
  return (
    <View
      style={{
        width: ITEM_WIDTH,
        height: ITEM_WIDTH,
        padding: 2,
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <Skeleton className="w-full h-full rounded-lg" />
    </View>
  );
};

export const GridFavoritesSkeleton = ({ count = 6 }) => {
  return (
    <View className="flex-1 bg-white">
      <View className="py-2">
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            padding: 2,
          }}
        >
          {Array(count)
            .fill(0)
            .map((_, index) => (
              <FavoriteCardSkeleton key={`favorite-skeleton-${index}`} />
            ))}
        </View>
      </View>
    </View>
  );
};
