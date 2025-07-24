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
import { PostCard } from "../post-listing/PostCard";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomHeader from "../common/CustomHeader";
import { useSupabase } from "@/context/supabaseContext";
import { toggleOwnReviewLike } from "@/lib/supabase/ownreviewsActions";
import { toggleReviewLike } from "@/lib/supabase/reviewsActions";
import { useUser } from "@clerk/clerk-expo";
import { useToast, Toast, ToastTitle } from "@/components/ui/toast";
import { XIcon } from "lucide-react-native";
import { Image } from "expo-image";
import { router } from "expo-router";

import { useGlobal } from "@/context/globalContext";

const GRID_COLUMNS = 3;
const ITEM_WIDTH = Dimensions.get("window").width * 0.33;

export default function DynamicCards({ posts, scroll = true }) {
  const { setRenderPosts } = useGlobal();

  const renderGridItem = useCallback(
    ({ item, index }) => (
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
        <Image
          source={{ uri: item.images[0] }}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 14,
          }}
        />
      </TouchableOpacity>
    ),
    []
  );
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
