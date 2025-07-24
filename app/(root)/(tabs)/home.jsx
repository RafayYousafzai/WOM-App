"use client";

import { useEffect } from "react";
import { AppState, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@clerk/clerk-expo";

import PostListing from "@/components/post-listing/PostListing";
import { TogglePosts } from "@/components/post-listing/ShowPosts/TogglePosts";
import { UploadBanner } from "@/components/create-post/upload-banner";
import { usePosts } from "@/hooks/use-posts";

export default function ProfileScreen() {
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

  // Load initial posts
  useEffect(() => {
    loadPosts(false);
  }, [activeTab]); // Only depend on activeTab to avoid infinite loops

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        handleRefresh();
      }
    });

    return () => subscription?.remove();
  }, [handleRefresh]);

  // Filter posts based on active tab
  const filteredPosts =
    activeTab === "forYou" ? posts : posts.filter((post) => !post.anonymous);

  const headerComponent = (
    <TogglePosts
      activeTab={activeTab}
      onTabChange={handleTabChange}
      isLoggedIn={!!user}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        <TogglePosts
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isLoggedIn={!!user}
        />
        <UploadBanner />
        <PostListing
          ListHeaderComponent={null}
          posts={filteredPosts}
          handleEndReached={handleEndReached}
          loading={loading}
          isLoadingMore={isLoadingMore}
          countryFilterActive={countryFilterActive}
          handleRefresh={handleRefresh}
        />
      </View>
    </SafeAreaView>
  );
}
