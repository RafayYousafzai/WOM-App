import { useCallback } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
} from "react-native";
import { useGlobal } from "@/context/globalContext";
import { useBookmarks } from "@/lib/supabase/bookmarkActions";
import { router } from "expo-router";
import { GridFavoritesSkeleton } from "../PageSkeletons/GridFavoritesSkeleton";
import { Feather } from "@expo/vector-icons";

const GRID_COLUMNS = 3;
const ITEM_WIDTH = Dimensions.get("window").width * 0.33;

export default function GridFavoritesCards({
  posts,
  scroll = true,
  onRefresh,
  isLoading,
}) {
  const { setRenderPosts } = useGlobal();

  const renderGridItem = useCallback(
    ({ item, index }) => {
      // ✅ check image safely here
      const firstImage =
        item.images && item.images.length > 0 ? item.images[0] : null;

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
          <TouchableOpacity
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 8,
              overflow: "hidden",
            }}
            activeOpacity={0.9}
            onPress={() => {
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
                  borderRadius: 8,
                }}
              />
            ) : (
              <View
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 8,
                  backgroundColor: "#f0f0f0",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Feather name="image" size={24} color="#ccc" />
              </View>
            )}

            {/* Overlay at bottom */}
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 50,
                borderBottomLeftRadius: 8,
                borderBottomRightRadius: 8,
              }}
            />
          </TouchableOpacity>
        </View>
      );
    },
    [posts, setRenderPosts]
  );

  return (
    <View className="flex-1">
      {isLoading ? (
        <View className="flex-1 justify-center items-center ml-2">
          <GridFavoritesSkeleton count={6} />
        </View>
      ) : (
        <FlatList
          data={posts}
          numColumns={GRID_COLUMNS}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={scroll}
          renderItem={renderGridItem}
          onRefresh={onRefresh}
          refreshing={isLoading}
          contentContainerStyle={{
            flexGrow: 1,
          }}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-28">
              <Image
                source={require("@/assets/images/favorites.png")}
                style={{ width: 310, height: 310, marginBottom: 20 }}
              />
            </View>
          }
        />
      )}
    </View>
  );
}
