"use client";

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from "react-native";
import { useReview } from "@/context/reviewContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef } from "react";

export default function DraftManager() {
  const { allDrafts, selectDraft, deleteDraft, clearCurrentDraft } =
    useReview();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const draftFadeAnims = useRef(
    allDrafts.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    draftFadeAnims.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const handleSelect = (draftId) => {
    selectDraft(draftId);
    router.push("create-review");
  };

  const handleDelete = (draftId) => {
    deleteDraft(draftId);
  };

  const handleNewPost = () => {
    clearCurrentDraft();
    router.push("create-review");
  };

  const renderDraftItem = ({ item, index }) => {
    const itemFadeAnim = draftFadeAnims[index];

    return (
      <Animated.View
        style={{
          opacity: itemFadeAnim,
          transform: [
            {
              translateY: itemFadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        }}
      >
        <View className="bg-gray-50 rounded-2xl p-6 mb-4 border border-gray-100">
          <View className="flex-row justify-between items-center">
            <View className="flex-1 mr-4">
              <Text className="text-xl font-bold text-gray-900 mb-2">
                {item?.location ||
                  item?.dishTypes[0]?.dishName ||
                  "Untitled Draft"}
              </Text>
              <Text className="text-base text-gray-500">
                {new Date(item.saved_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
            <View className="flex-row space-x-4">
              <TouchableOpacity
                onPress={() => handleSelect(item.id)}
                className="bg-blue-500 rounded-full p-3"
                activeOpacity={0.7}
              >
                <Ionicons name="create-outline" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                className="bg-red-500 rounded-full p-3"
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Animated.View style={{ opacity: fadeAnim }} className="flex-1 px-6 py-4">
        <View className="mb-8">
          <Text className="text-5xl font-bold text-gray-900 mb-3">Drafts</Text>
          <Text className="text-xl text-gray-500">
            {allDrafts.length} {allDrafts.length === 1 ? "draft" : "drafts"}{" "}
            saved
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleNewPost}
          activeOpacity={0.8}
          style={styles.newPostButton}
        >
          <View style={styles.newPostButtonContent}>
            <Text style={styles.newPostIcon}>✨</Text>
            <Text style={styles.newPostButtonText}>Create New Post</Text>
          </View>
        </TouchableOpacity>

        <FlatList
          data={allDrafts}
          keyExtractor={(item) => item.id}
          renderItem={renderDraftItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={() => (
            <View className="items-center justify-center py-20">
              <View className="bg-gray-100 rounded-full p-8 mb-6">
                <Ionicons name="document-outline" size={64} color="#9CA3AF" />
              </View>
              <Text className="text-2xl font-semibold text-gray-400 mb-3">
                No drafts yet
              </Text>
              <Text className="text-lg text-gray-400 text-center px-8">
                Your saved drafts will appear here when you create them
              </Text>
            </View>
          )}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  newPostButton: {
    backgroundColor: "#f39f1e",
    borderRadius: 20,
    marginBottom: 24,
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  newPostButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  newPostIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  newPostButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
