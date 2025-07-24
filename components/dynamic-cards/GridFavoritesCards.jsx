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
import { useDish } from "@/context/dishContext";
import { useReview } from "@/context/reviewContext";
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
  const { setSelectedImages, setPostType } = useGlobal();
  const { updateBookmarkCollectionByPostId } = useBookmarks();
  const { setRenderPosts } = useGlobal();

  const {
    setStep: setDishStep,
    setPeopleTags,
    setPostData: setDishPostData,
    setHashtags,
    setCuisineTags,
    setCurrentDraftId: setDishCurrentDraftId,
  } = useDish();

  const {
    setStep: setReviewStep,
    setPeoplesTags,
    setCuisineTags: setReviewCuisineTags,
    setAmenityTags,
    setDietaryTags,
    setExtraTags,
    setRestaurantData,
    setCurrentDraftId: setReviewCurrentDraftId,
  } = useReview();

  const handleBookmark = async (item) => {
    try {
      const options = {
        postId: item.id,
        newCollectionName: "History",
      };
      await updateBookmarkCollectionByPostId(options);
    } catch (error) {
      console.error("Error toggling bookmark:", error.message);
    }
  };

  const renderGridItem = ({ item, index }) => {
    const handleButtonPress = async () => {
      setSelectedImages([]);

      if (item.isReview) {
        try {
          setPostType("restaurant");

          // Create draft ID using post ID
          const draftId = `review_${item.id}`;
          setReviewCurrentDraftId(draftId);

          // Initialize review state
          setReviewStep(1);
          setPeoplesTags(item.people || []);
          setReviewCuisineTags(item.cuisines || []);
          setAmenityTags(item.amenities || []);
          setDietaryTags(item.dietary_tags || []);
          setExtraTags(item.info_tags || []);

          setRestaurantData({
            quote: true,
            quoteId: item.id,
            price: item.price || 0,
            rating: item.rating || 0,
            images: item.images || [],
            review: item.review || "",
            website: item.website || "",
            dishName: item.dish_name || "",
            location: item.location || null,
            phoneNumber: item.phone_number || "",
            restaurantName: item.restaurant_name || "",
            recommendDish: item.recommend_dsh || "",
            id: item.id || "",
          });
        } catch (error) {
          console.error("Error in handleButtonPress (review):", error);
        } finally {
          router.push("/create-review");
        }
      } else {
        try {
          setPostType("homemade");

          // Create draft ID using post ID
          const draftId = `dish_${item.id}`;
          setDishCurrentDraftId(draftId);

          // Initialize dish state
          setDishStep(1);
          setPeopleTags(item.tags || []);
          setHashtags(item.hashtags || []);
          setCuisineTags(item.cuisines || []);

          setDishPostData({
            quote: true,
            quoteId: item.id,
            rating: item.rating || 0,
            review: item.review || "",
            images: item.images || [],
            caption: item.caption || item.dish_name || "",
            location: item.location || null,
            dishName: item.dish_name || item.caption || "",
            anonymous: item.anonymous || false,
            id: item.id || "",
          });
        } catch (error) {
          console.error("Error in handleButtonPress (dish):", error);
        } finally {
          router.push("/create-review");
        }
      }

      handleBookmark(item);
    };
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
      {isLoading ? (
        <GridFavoritesSkeleton count={6} /> // Render skeleton while loading
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
      )}
    </View>
  );
}
