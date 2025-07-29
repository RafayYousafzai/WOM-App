"use client";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { ArrowLeft, Search, UserMinus } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { toggleFollowUser, getFollowing } from "@/lib/supabase/followActions";
import { useUser } from "@clerk/clerk-expo";
import { useSupabase } from "@/context/supabaseContext";

export default function FollowingPage() {
  const { user } = useUser();
  const { supabase } = useSupabase();
  const [refreshing, setRefreshing] = useState(false);
  const params = useLocalSearchParams();
  const targetUserId = params.id || user?.id;
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [following, setFollowing] = useState([]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const fetchData = useCallback(async () => {
    if (!targetUserId) return;
    setLoading(true);
    try {
      const followingData = await getFollowing(supabase, targetUserId);
      console.log("Fetched following data:", followingData);

      if (!followingData || followingData.length === 0) {
        setFollowing([]);
        return;
      }

      const transformed = followingData.map((f) => ({
        id: f.id,
        following: true, // They are following these people
        username: f.user?.username || "",
        name: `${f.user?.first_name || ""} ${f.user?.last_name || ""}`.trim(),
        image_url: f.user?.image_url || "",
        follower_id: f.follower_id,
        followed_id: f.followed_id,
        unsafe_metadata: f.user?.unsafe_metadata || {},
      }));

      setFollowing(transformed);
    } catch (error) {
      console.error("Error fetching following:", error);
    } finally {
      setLoading(false);
    }
  }, [targetUserId, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUnfollow = async (followedUser) => {
    const followedId = followedUser.followed_id;

    try {
      const { unfollowed } = await toggleFollowUser(
        supabase,
        user?.id, // you
        followedId // person you're following
      );

      if (unfollowed) {
        console.log(`Unfollowed user ${followedId}`);
        setFollowing((prev) =>
          prev.filter((f) => f.followed_id !== followedId)
        );
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  const handleNavigateToFollowers = () => {
    try {
      router.push(`/(account)/followers/${targetUserId}`);
    } catch (error) {
      console.error("Navigation error:", error);
      // Fallback navigation
      router.back();
      setTimeout(() => {
        router.push(`/(account)/followers/${targetUserId}`);
      }, 100);
    }
  };

  const filteredFollowing = following.filter(
    (f) =>
      f.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isOwnProfile = targetUserId === user?.id;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white border-b border-gray-100 pt-4 pb-4 shadow-sm">
        <View className="flex-row items-center justify-between px-6">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-4 p-2 rounded-full bg-gray-50 active:bg-gray-100"
              activeOpacity={0.7}
            >
              <ArrowLeft size={20} color="#374151" />
            </TouchableOpacity>
            <View>
              <Text className="text-xl font-bold text-gray-900">Following</Text>
              <Text className="text-sm text-gray-500 mt-0.5">
                {following?.length || 0} following
              </Text>
            </View>
          </View>

          {/* Tab Navigation */}
          <View className="flex-row bg-gray-100 rounded-lg p-1">
            <TouchableOpacity
              onPress={handleNavigateToFollowers}
              className="px-3 py-1.5 rounded-md"
              activeOpacity={0.7}
            >
              <Text className="text-sm font-medium text-gray-500">
                Followers
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="px-3 py-1.5 rounded-md bg-white shadow-sm"
              activeOpacity={0.7}
            >
              <Text className="text-sm font-medium text-gray-900">
                Following
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 bg-white"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#eab308"]}
            tintColor="#eab308"
          />
        }
      >
        {/* Search Bar */}
        <View className="bg-white px-6 py-4 border-b border-gray-100">
          <View className="relative">
            <View className="absolute left-4 top-5 z-10">
              <Search size={18} color="#9ca3af" />
            </View>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search following..."
              placeholderTextColor="#9ca3af"
              className="bg-gray-50 rounded-xl pl-12 pr-4 py-3 text-gray-900 text-base border border-gray-200 focus:border-blue-500"
            />
          </View>
        </View>

        {loading ? (
          <View className="py-10">
            <ActivityIndicator size="large" color="#eab308" />
          </View>
        ) : filteredFollowing.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <View className="bg-gray-100 rounded-full p-6 mb-4">
              <Search size={32} color="#9ca3af" />
            </View>
            <Text className="text-gray-500 text-base font-medium">
              {searchQuery
                ? "No matching users found"
                : "Not following anyone yet"}
            </Text>
            <Text className="text-gray-400 text-sm mt-1">
              {searchQuery
                ? "Try a different search"
                : "Start following people"}
            </Text>
          </View>
        ) : (
          <View className="px-6 pt-4">
            {filteredFollowing.map((f) => (
              <View
                key={f.id}
                className="flex-row items-center justify-between py-4"
              >
                <TouchableOpacity
                  className="flex-row items-center flex-1 mr-4"
                  onPress={() =>
                    router.push(`/(public)/profile/${f.followed_id}`)
                  }
                  activeOpacity={0.7}
                >
                  <View className="relative">
                    <Image
                      source={{
                        uri:
                          f.image_url ||
                          `https://ui-avatars.com/api/?name=${f.username
                            ?.charAt(0)
                            .toUpperCase()}&background=eab308&color=fff&size=128`,
                      }}
                      className="w-12 h-12 rounded-full"
                    />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="font-semibold text-base text-gray-900 mb-0.5">
                      {f.name || f.username}
                    </Text>
                    <Text className="text-sm text-gray-500 leading-tight">
                      @{f.username}
                    </Text>
                  </View>
                </TouchableOpacity>

                {f.followed_id !== user?.id && isOwnProfile && (
                  <TouchableOpacity
                    onPress={() => handleUnfollow(f)}
                    className="px-4 py-2 rounded-full bg-red-50  flex-row items-center"
                    activeOpacity={0.8}
                    disabled={loading}
                  >
                    <UserMinus size={14} color="#dc2626" />
                    <Text className="ml-1.5 font-medium text-xs text-red-600">
                      Unfollow
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
