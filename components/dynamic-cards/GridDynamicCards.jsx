// DynamicCards.jsx
"use client";

import { useCallback } from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useGlobal } from "@/context/globalContext";
import { Feather } from "@expo/vector-icons";

const GRID_COLUMNS = 3;
const ITEM_WIDTH = Dimensions.get("window").width * 0.33;

export default function DynamicCards({ posts, scroll = true, loading }) {
  const { setRenderPosts } = useGlobal();

  const renderGridItem = useCallback(
    ({ item, index }) => {
      const firstImage =
        item.images && item.images.length > 0 ? item.images[0] : null;

      return (
        <TouchableOpacity
          className="relative"
          style={{ width: ITEM_WIDTH, height: ITEM_WIDTH, padding: 1 }}
          onPress={() => {
            const allPosts = [...(posts || [])];

            setRenderPosts({
              posts: allPosts,
              loading: false,
              initialScrollIndex: index,
            });

            const route = `/posts`;
            router.push(route);
          }}
        >
          {firstImage ? (
            <Image
              source={{ uri: firstImage }}
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          ) : (
            <View className="w-full h-full bg-gray-100 items-center justify-center rounded-xl">
              <Feather name="image" size={24} color="#ccc" />
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [posts]
  );

  if (loading) {
    return (
      <View className="flex-1 items-center mt-10 justify-center">
        <ActivityIndicator size="small" color="#f39f1e" />
      </View>
    );
  }

  return (
    <View>
      <FlatList
        data={posts || []}
        numColumns={GRID_COLUMNS}
        keyExtractor={(item, idx) => item?.id?.toString() || `idx-${idx}`}
        scrollEnabled={scroll}
        renderItem={renderGridItem}
      />
    </View>
  );
}
