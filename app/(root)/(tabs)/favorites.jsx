import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScrollableCategories from "@/components/layout/ScrollableCategories";
import GridFavoritesCards from "@/components/dynamic-cards/GridFavoritesCards";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useBookmarks } from "@/lib/supabase/bookmarkActions";
import UnloggedState from "@/components/auth/unlogged-state";

const categories = [
  { id: "All", name: "All", icon: "home" },
  { id: "Wishlist", name: "Wishlist", icon: "heart" },
  { id: "Recipe", name: "Recipe", icon: "food" },
  { id: "History", name: "History", icon: "history" },
];

export default function Favorites() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState([]);
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { getUserBookmarks, getBookmarksByCategory, getReviewById } =
    useBookmarks();

  useEffect(() => {
    fetchBookmarks();
  }, [user, activeCategory]);

  const fetchBookmarks = async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const collection = activeCategory === "All" ? null : activeCategory;
      let bookmarks = [];

      if (!collection) {
        bookmarks = await getUserBookmarks(user.id);
      } else {
        bookmarks = await getBookmarksByCategory(user.id, collection);
      }

      const postPromises = bookmarks.map(async (bookmark) => {
        try {
          const post = await getReviewById(
            bookmark.post_id,
            bookmark.post_type
          );
          return post;
        } catch (err) {
          console.warn("Failed to fetch post for bookmark:", bookmark, err);
          return null;
        }
      });

      const resolvedPosts = await Promise.all(postPromises);
      const filteredPosts = resolvedPosts.filter(Boolean);
      setPosts(filteredPosts);
    } catch (err) {
      console.error("Failed to fetch bookmarks:", err);
    } finally {
      setLoading(false);
    }
  };

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      // Reload user data
      await user?.reload();

      // Refresh bookmarks data
      await fetchBookmarks();
    } catch (error) {
      console.error("Error refreshing favorites:", error);
    } finally {
      setRefreshing(false);
    }
  }, [user, fetchBookmarks]);

  if (!isSignedIn) {
    return <UnloggedState />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#f39f1e"]} // Android
            tintColor="#f39f1e" // iOS
            title="Pull to refresh" // iOS
            titleColor="#f39f1e" // iOS
          />
        }
      >
        <View className="px-5 pt-8">
          <Text className="text-6xl font-extrabold text-slate-900">
            Favorites
          </Text>
          <Text className="text-sm text-slate-500 mt-2 font-medium">
            Discover and organize your favorite items
          </Text>
        </View>

        <View className="py-2 flex-1">
          <ScrollableCategories
            categories={categories}
            selectedCategory={activeCategory}
            onSelect={setActiveCategory}
          />

          <GridFavoritesCards
            posts={posts}
            scroll={false}
            onRefresh={fetchBookmarks}
            isLoading={loading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
