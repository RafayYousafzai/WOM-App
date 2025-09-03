"use client";

import { useEffect } from "react";
import { AppState, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search } from "lucide-react-native";
import { useUser } from "@clerk/clerk-expo";

import PostListing from "@/components/post-listing/PostListing";
import { TogglePosts } from "@/components/post-listing/ShowPosts/TogglePosts";
import { UploadBanner } from "@/components/create-post/upload-banner";
import { usePosts } from "@/hooks/use-posts";

export default function Home() {
  const { user } = useUser();
  const {
    activeTab,
    posts,
    loading,
    hasMore,
    isLoadingMore,
    countryFilterActive,
    handleTabChange,
    handleEndReached,
    handleRefresh,
    loadPosts,
  } = usePosts();

  useEffect(() => {
    loadPosts(false);
  }, [activeTab]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        handleRefresh();
      }
    });
    return () => subscription?.remove();
  }, [handleRefresh]);

  const filteredPosts =
    activeTab === "forYou" ? posts : posts.filter((post) => !post.anonymous);

  const showEmptyFollowingState =
    activeTab === "following" && filteredPosts.length === 0 && !loading;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        <TogglePosts
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isLoggedIn={!!user}
        />
        <UploadBanner />

        {showEmptyFollowingState ? (
          <View className="flex-1 items-center justify-center py-20">
            <View className="bg-gray-100 rounded-full p-6 mb-4">
              <Search size={32} color="#9ca3af" />
            </View>
            <Text className="text-gray-500 text-base font-medium">
              Not following anyone yet
            </Text>
            <Text className="text-gray-400 text-sm mt-1">
              Start following people
            </Text>
          </View>
        ) : (
          <PostListing
            ListHeaderComponent={null}
            posts={filteredPosts}
            handleEndReached={handleEndReached}
            loading={loading}
            isLoadingMore={isLoadingMore}
            countryFilterActive={countryFilterActive}
            handleRefresh={handleRefresh}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
