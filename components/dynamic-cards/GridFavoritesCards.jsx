import { useCallback } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Text,
} from "react-native";
import { useGlobal } from "@/context/globalContext";
import { useBookmarks } from "@/lib/supabase/bookmarkActions";
import { router } from "expo-router";
import { GridFavoritesSkeleton } from "../PageSkeletons/GridFavoritesSkeleton";

const GRID_COLUMNS = 3;
const ITEM_WIDTH = Dimensions.get("window").width * 0.33;

export default function GridFavoritesCards({
  posts,
  scroll = true,
  onRefresh,
  isLoading,
}) {
  const { setRenderPosts } = useGlobal();

  const renderGridItem = ({ item, index }) => {
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
              borderRadius: 8,
            }}
          />

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

          <View
            style={{
              position: "absolute",
              bottom: 10,
              left: 10,
              right: 10,
              flexDirection: "row",
              alignItems: "center",
            }}
          ></View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className="flex-1">
      {/* {isLoading ? (
        <GridFavoritesSkeleton count={6} /> // Render skeleton while loading
      ) : ( */}
      <FlatList
        data={posts}
        numColumns={GRID_COLUMNS}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={scroll}
        renderItem={renderGridItem}
        onRefresh={onRefresh}
        refreshing={isLoading}
        contentContainerStyle={{
          flex: 1,
          height: "100%",
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
      {/* )} */}
    </View>
  );
}
