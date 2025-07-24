import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import { router } from "expo-router";
import { useDish } from "@/context/dishContext";
import { useReview } from "@/context/reviewContext";
import { useGlobal } from "@/context/globalContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { Trash } from "lucide-react-native";
import { useLayoutEffect } from "react";
import { useNavigation } from "expo-router";

const DraftsScreen = () => {
  const { setPostType, setSelectedImages } = useGlobal();
  const {
    drafts: dishDrafts,
    loadDraft: loadDishDraft,
    deleteDraft: deleteDishDraft,
    resetDishState,
    clearCurrentDraft: clearCurrentDishDraft,
  } = useDish();
  const {
    drafts: reviewDrafts,
    loadDraft: loadReviewDraft,
    deleteDraft: deleteReviewDraft,
    resetReviewState,
    clearCurrentDraft: clearCurrentReviewDraft,
  } = useReview();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({
      tabBarStyle: { display: "none" },
    });
  }, [navigation]);
  // Combine and sort all drafts
  const getAllDrafts = () => {
    // Helper function to validate draft content
    const isValidDraft = (draft) => {
      if (!draft) return false;

      // Common required fields for all drafts
      if (!draft.id || !draft._timestamp) return false;

      // Type-specific validation
      if (draft.type === "homemade") {
        return (
          draft.postData?.dishName ||
          draft.postData?.caption ||
          draft.postData?.images?.length > 0 ||
          draft.hashtags?.length > 0
        );
      } else if (draft.type === "restaurant") {
        return (
          draft.restaurantData?.restaurantName ||
          draft.restaurantData?.dishName ||
          draft.restaurantData?.images?.length > 0 ||
          draft.cuisineTags?.length > 0
        );
      }

      return true;
    };

    // Process and filter drafts
    const processedDrafts = [
      ...(dishDrafts ?? [])
        .filter((draft) => isValidDraft({ ...draft, type: "homemade" }))
        .map((draft) => ({
          ...draft,
          type: "homemade",
          displayName:
            draft.postData?.dishName ||
            draft.postData?.caption ||
            "Untitled Dish",
          load: async () => {
            await clearCurrentDishDraft();
            return loadDishDraft(draft.id);
          },
          clear: () => deleteDishDraft(draft.id),
          isEmpty: !(
            draft.postData?.dishName ||
            draft.postData?.caption ||
            draft.postData?.images.length > 0
          ),
        })),

      ...(reviewDrafts ?? [])
        .filter((draft) => isValidDraft({ ...draft, type: "restaurant" }))
        .map((draft) => ({
          ...draft,
          type: "restaurant",
          displayName:
            draft.restaurantData?.restaurantName ||
            draft.restaurantData?.dishName ||
            "Untitled Review",
          load: async () => {
            await clearCurrentReviewDraft();
            return loadReviewDraft(draft.id);
          },
          clear: () => deleteReviewDraft(draft.id),
          isEmpty: !(
            draft.restaurantData?.restaurantName ||
            draft.restaurantData?.dishName ||
            draft.restaurantData?.images.length > 0
          ),
        })),
    ].sort(
      (a, b) =>
        new Date(b._timestamp).getTime() - new Date(a._timestamp).getTime()
    );

    // Optional: Auto-clean empty drafts
    const emptyDrafts = processedDrafts.filter((d) => d.isEmpty);
    if (emptyDrafts.length > 0) {
      console.log(`Found ${emptyDrafts.length} empty drafts, cleaning...`);
      emptyDrafts.forEach((draft) => {
        draft
          .clear()
          .catch((e) => console.error("Error cleaning empty draft:", e));
      });
    }

    return processedDrafts.filter((d) => !d.isEmpty);
  };

  const [allDrafts, setAllDrafts] = useState(getAllDrafts());

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setAllDrafts(getAllDrafts());
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [dishDrafts, reviewDrafts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setAllDrafts(getAllDrafts());
      setRefreshing(false);
    }, 500);
  };

  const handleLoadDraft = async (draft) => {
    try {
      setLoading(true);
      const loaded = await draft.load();
      if (loaded) {
        setPostType(draft.type);
        setSelectedImages(
          draft.postData?.images || draft.restaurantData?.images || []
        );
        router.push("create-review");
      } else {
        Alert.alert("Error", "Failed to load draft");
      }
    } catch (error) {
      console.error("Error loading draft:", error);
      Alert.alert("Error", "An error occurred while loading the draft");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDraft = async (draft) => {
    Alert.alert(
      "Delete Draft",
      `Are you sure you want to delete this ${
        draft.type === "homemade" ? "dish" : "review"
      } draft?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await draft.clear();
              setAllDrafts(getAllDrafts());
            } catch (error) {
              console.error("Error deleting draft:", error);
              Alert.alert("Error", "Failed to delete draft");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return (
        "Today at " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    }
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: diffDays >= 365 ? "numeric" : undefined,
    });
  };

  const renderDraftItem = ({ item, index }) => {
    return (
      <View style={[styles.draftCard, { marginTop: index === 0 ? 0 : 16 }]}>
        <View style={styles.draftHeader}>
          <View style={styles.draftIconContainer}>
            <Text style={styles.draftIcon}>
              {item.type === "homemade" ? "🍳" : "🍽️"}
            </Text>
          </View>
          <View style={styles.draftHeaderText}>
            <Text style={styles.draftType}>
              {item.type === "homemade" ? "Dish Post" : "Restaurant Review"}
            </Text>
            <Text style={styles.draftDate}>{formatDate(item._timestamp)}</Text>
          </View>
          <View style={styles.draftBadge}>
            <Text style={styles.draftBadgeText}>DRAFT</Text>
          </View>
        </View>

        {item.restaurantData?.dishName && (
          <Text style={styles.draftDescription} numberOfLines={2}>
            {item.restaurantData.dishName}
          </Text>
        )}

        {item.postData?.caption && (
          <Text style={styles.draftDescription} numberOfLines={2}>
            {item.postData?.caption}
          </Text>
        )}

        <View style={styles.draftActions}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => handleLoadDraft(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteDraft(item)}
            activeOpacity={0.8}
          >
            <Trash width={20} height={20} color="red" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // if (loading) {
  //   return (
  //     <SafeAreaView style={styles.loadingContainer}>
  //       <ActivityIndicator size="large" color="#FF6D6D" />
  //     </SafeAreaView>
  //   );
  // }

  return (
    <SafeAreaView style={styles.container}>
      <View className="px-5 pt-8">
        <Text className="text-6xl font-extrabold text-slate-900">
          My Drafts
        </Text>
        <Text className="text-sm text-slate-500 mt-2 font-medium">
          {allDrafts.length} {allDrafts.length === 1 ? "draft" : "drafts"}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.newPostButton}
        onPress={() => {
          setPostType(null);
          resetDishState();
          resetReviewState();
          setSelectedImages([]);
          router.push("create-review");
        }}
        activeOpacity={0.9}
      >
        <View style={styles.newPostButtonContent}>
          <Text style={styles.newPostIcon}>✨</Text>
          <Text style={styles.newPostButtonText}>Create New Post</Text>
        </View>{" "}
      </TouchableOpacity>

      {allDrafts.length === 0 ? (
        <View style={styles.emptyState}>
          <Image
            source={require("@/assets/images/draft.png")}
            style={{ width: 310, height: 310, marginTop: -40 }}
          />
        </View>
      ) : (
        <FlatList
          data={allDrafts}
          renderItem={renderDraftItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing || loading}
          onRefresh={handleRefresh}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748B",
    fontWeight: "500",
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  header: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 4,
  },
  subHeader: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "500",
  },
  newPostButton: {
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: "#f39f1e",
    borderRadius: 16,
    shadowColor: "#f39f1e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  newPostButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  newPostIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  newPostButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 18,
  },
  draftCard: {
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  draftHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  draftIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  draftIcon: {
    fontSize: 24,
  },
  draftHeaderText: {
    flex: 1,
  },
  draftType: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 2,
  },
  draftDate: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  draftBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  draftBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#D97706",
  },
  draftDescription: {
    fontSize: 16,
    color: "#475569",
    lineHeight: 24,
    marginBottom: 16,
    fontWeight: "500",
  },
  draftActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  continueButton: {
    flex: 1,
    backgroundColor: "#10B981",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  continueButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
  },
  deleteButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  deleteButtonText: {
    fontSize: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    marginTop: -30,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "500",
  },
  listContent: {
    paddingBottom: 40,
  },
});

export default DraftsScreen;
