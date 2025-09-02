import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScrollableCategories from "@/components/layout/ScrollableCategories";
import GridFavoritesCards from "@/components/dynamic-cards/GridFavoritesCards";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useBookmarks } from "@/lib/supabase/bookmarkActions";
import UnloggedState from "@/components/auth/unlogged-state";
import { Button, ButtonText } from "@/components/ui";
import { TextInput } from "react-native-paper";

export default function Favorites() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");

  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const {
    getUserCollections,
    getBookmarkedPosts,
    createCollection,
    deleteCollection,
  } = useBookmarks();

  // Protected collections that cannot be deleted
  const PROTECTED_COLLECTIONS = ["Wishlist", "Recipe"];

  // --- Fetch Data Functions ---
  const fetchCollections = useCallback(async () => {
    if (!user?.id) return;
    try {
      const fetchedCollections = await getUserCollections(user.id);
      setCollections(fetchedCollections);
    } catch (err) {
      console.error("Failed to fetch collections:", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const fetchBookmarks = useCallback(async () => {
    if (!user?.id) {
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const fetchedPosts = await getBookmarkedPosts(
        user.id,
        activeCategory === "All" ? null : activeCategory
      );
      const filteredPosts = fetchedPosts.filter(
        (post) => post !== null && post !== undefined
      );

      setPosts(filteredPosts);
    } catch (err) {
      console.error("Failed to fetch bookmarks:", err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, activeCategory]);

  // --- useEffect Hooks ---
  useEffect(() => {
    if (isSignedIn) {
      fetchCollections();
    }
  }, [isSignedIn, fetchCollections]);

  useEffect(() => {
    if (isSignedIn) {
      fetchBookmarks();
    }
  }, [isSignedIn, fetchBookmarks]);

  // --- Handlers ---
  const handleAddCollection = async () => {
    if (!newCollectionName.trim()) {
      Alert.alert("Error", "Collection name cannot be empty.");
      return;
    }
    setLoading(true);
    try {
      await createCollection(user.id, newCollectionName);
      setNewCollectionName("");
      setIsModalVisible(false);
      await fetchCollections();
      await fetchBookmarks();
    } catch (error) {
      console.error("Failed to create collection:", error);
      Alert.alert("Error", "Failed to create collection. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCollection = (collectionName) => {
    // Check if it's a protected collection
    if (PROTECTED_COLLECTIONS.includes(collectionName)) {
      Alert.alert(
        "Cannot Delete",
        `The "${collectionName}" collection cannot be deleted as it's a default collection.`
      );
      return;
    }

    Alert.alert(
      "Delete Collection",
      `Are you sure you want to delete the "${collectionName}" collection? This will remove all bookmarks in this collection.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await deleteCollection(user.id, collectionName);

              // If we're currently viewing the deleted collection, switch to "All"
              if (activeCategory === collectionName) {
                setActiveCategory("All");
              }

              await fetchCollections();
              await fetchBookmarks();

              Alert.alert(
                "Success",
                `Collection "${collectionName}" has been deleted.`
              );
            } catch (error) {
              console.error("Failed to delete collection:", error);
              Alert.alert(
                "Error",
                "Failed to delete collection. Please try again."
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchCollections();
      await fetchBookmarks();
    } catch (error) {
      console.error("Error refreshing favorites:", error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchCollections, fetchBookmarks]);

  const handleCategorySelect = (categoryName) => {
    if (categoryName === "Add") {
      setIsModalVisible(true);
    } else {
      setActiveCategory(categoryName);
    }
  };

  if (!isSignedIn) {
    return <UnloggedState />;
  }

  const dynamicCategories = [
    { id: "All", name: "All" },
    { id: "Wishlist", name: "Wishlist" },
    { id: "Recipe", name: "Recipe" },
    ...collections.map((col) => ({
      id: col.name,
      name: col.name,
      // Mark user-created collections as deletable
      isDeletable: !PROTECTED_COLLECTIONS.includes(col.name),
    })),
    { id: "Add", name: "Add Collection", icon: "plus" },
  ];

  const uniqueCategories = dynamicCategories.filter(
    (cat, index, self) => index === self.findIndex((t) => t.name === cat.name)
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#f39f1e"]}
            tintColor="#f39f1e"
            title="Pull to refresh"
            titleColor="#f39f1e"
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
            categories={uniqueCategories}
            selectedCategory={activeCategory}
            onSelect={handleCategorySelect}
            onLongPress={handleDeleteCollection} // Pass the delete handler
          />

          <GridFavoritesCards
            posts={posts}
            scroll={false}
            onRefresh={fetchBookmarks}
            isLoading={loading}
          />
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setIsModalVisible(false)}
        >
          <View
            className="bg-white rounded-2xl p-6 w-[80%] shadow-lg"
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="text-lg font-bold text-gray-900 mb-4 text-center">
              Create New Collection
            </Text>

            <TextInput
              label="Create New Collection"
              value={newCollectionName}
              onChangeText={setNewCollectionName}
              placeholder="Enter collection name"
              mode="outlined"
              outlineColor="#e5e7eb"
              activeOutlineColor="#6366f1"
              style={{
                backgroundColor: "#f8fafc",
                fontSize: 14,
                color: "#000",
              }}
              contentStyle={{
                fontSize: 14,
                paddingVertical: 6,
                color: "#000",
              }}
              outlineStyle={{
                borderRadius: 16,
                borderWidth: 3,
              }}
              required
            />
            <Button
              onPress={handleAddCollection}
              className="bg-blue-500 rounded-xl my-2"
              disabled={loading}
            >
              <ButtonText className="text-white font-semibold">
                Create
              </ButtonText>
            </Button>
            <Button
              onPress={() => setIsModalVisible(false)}
              className="bg-red-50 rounded-xl"
            >
              <ButtonText className="text-red-600 font-semibold">
                Cancel
              </ButtonText>
            </Button>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
