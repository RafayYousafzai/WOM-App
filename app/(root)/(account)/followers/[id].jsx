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
import { ArrowLeft, Search, UserPlus, UserMinus } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  toggleFollowUser,
  getFollowers,
  isFollowing,
} from "@/lib/supabase/followActions";
import { useUser } from "@clerk/clerk-expo";
import { useSupabase } from "@/context/supabaseContext";

export default function FollowersPage() {
  const { user } = useUser();
  const { supabase } = useSupabase();
  const [refreshing, setRefreshing] = useState(false);
  const params = useLocalSearchParams();
  const targetUserId = params.id || user?.id;
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [followers, setFollowers] = useState([]);
  const [processingFollows, setProcessingFollows] = useState(new Set());

  const fetchData = useCallback(async () => {
    if (!targetUserId || !user?.id) return;
    setLoading(true);
    try {
      const followersData = await getFollowers(supabase, targetUserId);
      if (!followersData) return setFollowers([]);

      const transformed = await Promise.all(
        followersData.map(async (f) => ({
          id: f.id,
          following:
            f.follower_id === user.id
              ? false
              : await isFollowing(supabase, user.id, f.follower_id),
          username: f.user?.username || "",
          name: `${f.user?.first_name || ""} ${f.user?.last_name || ""}`.trim(),
          image_url: f.user?.image_url || "",
          follower_id: f.follower_id,
          unsafe_metadata: f.user?.unsafe_metadata || {},
        }))
      );

      setFollowers(transformed);
    } catch (error) {
      console.error("Error fetching followers:", error);
    } finally {
      setLoading(false);
    }
  }, [targetUserId, user?.id, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFollowAction = async (follower, action) => {
    const { follower_id } = follower;
    if (processingFollows.has(follower_id)) return;

    setProcessingFollows((prev) => new Set(prev).add(follower_id));
    try {
      const result = await toggleFollowUser(supabase, user?.id, follower_id);
      if (result.followed || result.unfollowed) {
        if (action === "remove") {
          setFollowers((prev) =>
            prev.filter((f) => f.follower_id !== follower_id)
          );
        } else {
          setFollowers((prev) =>
            prev.map((f) =>
              f.follower_id === follower_id
                ? { ...f, following: !f.following }
                : f
            )
          );
        }
      }
    } catch (error) {
      console.error(
        `Error ${action === "remove" ? "removing" : "toggling"} follower:`,
        error
      );
    } finally {
      setProcessingFollows((prev) => {
        const newSet = new Set(prev);
        newSet.delete(follower_id);
        return newSet;
      });
    }
  };

  const filteredFollowers = followers.filter(
    (f) =>
      f.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isOwnProfile = targetUserId === user?.id;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="bg-white border-b border-gray-100 pt-4 pb-4 shadow-sm">
        <View className="flex-row items-center justify-between px-6">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-4 p-2 rounded-full bg-gray-50"
            >
              <ArrowLeft size={20} color="#374151" />
            </TouchableOpacity>
            <View>
              <Text className="text-xl font-bold text-gray-900">Followers</Text>
              <Text className="text-sm text-gray-500 mt-0.5">
                {followers.length} followers
              </Text>
            </View>
          </View>
          <View className="flex-row bg-gray-100 rounded-lg p-1">
            <TouchableOpacity className="px-3 py-1.5 rounded-md bg-white shadow-sm">
              <Text className="text-sm font-medium text-gray-900">
                Followers
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                router.push(`/(account)/following/${targetUserId}`)
              }
              className="px-3 py-1.5 rounded-md"
            >
              <Text className="text-sm font-medium text-gray-500">
                Following
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 bg-white"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchData}
            colors={["#eab308"]}
          />
        }
      >
        <View className="bg-white px-6 py-4 border-b border-gray-100">
          <View className="relative">
            <View className="absolute left-4 top-5 z-10">
              <Search size={18} color="#9ca3af" />
            </View>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search followers..."
              placeholderTextColor="#9ca3af"
              className="bg-gray-50 rounded-xl pl-12 pr-4 py-3 text-gray-900 text-base border border-gray-200 focus:border-blue-500"
            />
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#eab308" className="py-10" />
        ) : filteredFollowers.length === 0 ? (
          <View className="py-20 items-center">
            <View className="bg-gray-100 rounded-full p-6 mb-4">
              <Search size={32} color="#9ca3af" />
            </View>
            <Text className="text-gray-500 text-base font-medium">
              {searchQuery ? "No matching followers" : "No followers yet"}
            </Text>
          </View>
        ) : (
          <View className="px-6 pt-4">
            {filteredFollowers.map((f) => {
              const isProcessing = processingFollows.has(f.follower_id);
              return (
                <View
                  key={f.id}
                  className="flex-row items-center justify-between py-4"
                >
                  <TouchableOpacity
                    className="flex-row items-center flex-1 mr-4"
                    onPress={() =>
                      router.push(`/(public)/profile/${f.follower_id}`)
                    }
                  >
                    <Image
                      source={{
                        uri:
                          f.image_url ||
                          `https://ui-avatars.com/api/?name=${f.username?.charAt(
                            0
                          )}&background=eab308&color=fff&size=128`,
                      }}
                      className="w-12 h-12 rounded-full"
                    />
                    <View className="ml-4 flex-1">
                      <Text className="font-semibold text-base text-gray-900 mb-0.5">
                        {f.name || f.username}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        @{f.username}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {f.follower_id !== user?.id && (
                    <View className="flex-row space-x-2">
                      <TouchableOpacity
                        onPress={() => handleFollowAction(f, "toggle")}
                        className={`px-4 py-2 rounded-full flex-row items-center ${
                          f.following ? "bg-red-50" : "bg-yellow-500"
                        }`}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <ActivityIndicator
                            size="small"
                            color={f.following ? "#dc2626" : "white"}
                          />
                        ) : f.following ? (
                          <UserMinus size={14} color="#dc2626" />
                        ) : (
                          <UserPlus size={14} color="white" />
                        )}
                        <Text
                          className={`ml-1.5 font-medium text-xs ${
                            f.following ? "text-red-600" : "text-white"
                          }`}
                        >
                          {f.following ? "Unfollow" : "Follow"}
                        </Text>
                      </TouchableOpacity>
                      {isOwnProfile && (
                        <TouchableOpacity
                          onPress={() => handleFollowAction(f, "remove")}
                          className="px-3 py-2 rounded-full bg-gray-50 border border-gray-200 flex-row items-center"
                          disabled={isProcessing}
                        >
                          <UserMinus size={14} color="#6b7280" />
                          <Text className="ml-1.5 font-medium text-xs text-gray-600">
                            Remove
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
