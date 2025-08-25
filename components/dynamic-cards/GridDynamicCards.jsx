"use client";

import { useCallback, useState } from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Modal,
  Alert,
} from "react-native";

import { Image } from "expo-image";
import { router } from "expo-router";

import { useGlobal } from "@/context/globalContext";

const GRID_COLUMNS = 3;
const ITEM_WIDTH = Dimensions.get("window").width * 0.33;

export default function DynamicCards({ posts, scroll = true }) {
  const { setRenderPosts } = useGlobal();

  const renderGridItem = useCallback(({ item, index }) => {
    // Get the first image from the post's images array
    const firstImage =
      item.images && item.images.length > 0 ? item.images[0] : null;

    return (
      <TouchableOpacity
        className="relative"
        style={{ width: ITEM_WIDTH, height: ITEM_WIDTH, padding: 1 }}
        onPress={async () => {
          const allPosts = [...posts];

          setRenderPosts({
            posts: allPosts,
            loading: false,
            initialScrollIndex: index,
          });
          router.push("/posts");
        }}
      >
        {firstImage ? (
          <Image
            source={{ uri: firstImage }}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 14,
            }}
          />
        ) : (
          <View className="w-full h-full bg-gray-100 items-center justify-center rounded-xl">
            <Feather name="image" size={24} color="#ccc" />
          </View>
        )}
      </TouchableOpacity>
    );
  }, []);

  return (
    <View>
      <FlatList
        data={posts}
        numColumns={GRID_COLUMNS}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={scroll}
        renderItem={renderGridItem}
      />
    </View>
  );
}
