import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { ArrowLeft, Search, UserPlus, UserCheck } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { toggleFollowUser, getFollowers } from "@/lib/supabase/followActions";
import { useUser } from "@clerk/clerk-expo";
import { useSupabase } from "@/context/supabaseContext";
// import { sendPushNotification } from "@/lib/notifications/sendPushNotification";

export default function FollowersPage() {
  const { user } = useUser();
  const { supabase } = useSupabase();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData(); // reuse your existing fetch logic
    setRefreshing(false);
  };

  const params = useLocalSearchParams();
  const targetUserId = params.id || user?.id;

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [followers, setFollowers] = useState([]);
  const [followingStatus, setFollowingStatus] = useState({});

  const fetchData = useCallback(async () => {
    if (!targetUserId) return;
    setLoading(true);

    try {
      const followersData = await getFollowers(supabase, targetUserId);
      console.log("Fetched followers data:", followersData);

      if (!followersData || followersData.length === 0) {
        setFollowers([]);
        setFollowingStatus({});
        return;
      }

      const transformed = followersData.map((f) => ({
        id: f.id,
        following: true, // or derive it
        username: f.user?.username || "",
        name: `${f.user?.first_name || ""} ${f.user?.last_name || ""}`,
        image_url: f.user?.image_url || "",
        follower_id: f.follower_id,
        followed_id: f.followed_id,
        unsafe_metadata: f.user?.unsafe_metadata || {},
      }));

      setFollowers(transformed);

      setFollowingStatus(statusMap);
    } catch (error) {
      console.error("Error fetching followers:", error);
    } finally {
      setLoading(false);
    }
  }, [targetUserId, user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRemoveFollower = async (follower) => {
    const followerId = follower.follower_id;
    const notifications_tokens =
      follower?.unsafe_metadata?.notifications_tokens;

    try {
      const { unfollowed } = await toggleFollowUser(
        supabase,
        followerId, // person who follows you
        user?.id // you (being followed)
      );

      if (!unfollowed) {
        console.warn(`User ${followerId} was not removed as a follower.`);
        return;
      }

      console.info(`User ${followerId} has been removed as a follower.`);

      // if (notifications_tokens) {
      //   await sendPushNotification(
      //     notifications_tokens,
      //     `${user.firstName} ${user.lastName} unfollowed you.`,
      //     ""
      //   );
      // }

      setFollowers((prev) => prev.filter((f) => f.follower_id !== followerId));

      // Optionally: remove from followingStatus too
      setFollowingStatus((prev) => {
        const newStatus = { ...prev };
        delete newStatus[followerId];
        return newStatus;
      });
    } catch (error) {
      console.error("Error removing follower:", error);
      // Optional: show toast/alert to user
    }
  };

  const filteredFollowers = followers.filter(
    (f) =>
      f.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-white">

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
              <Text className="text-xl font-bold text-gray-900">Followers</Text>
              <Text className="text-sm text-gray-500 mt-0.5">
                {followers?.length || 0} followers
              </Text>
            </View>
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
          <View className="py-10">
            <ActivityIndicator size="large" color="#eab308" />
          </View>
        ) : filteredFollowers.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <View className="bg-gray-100 rounded-full p-6 mb-4">
              <Search size={32} color="#9ca3af" />
            </View>
            <Text className="text-gray-500 text-base font-medium">
              {searchQuery ? "No matching followers found" : "No followers yet"}
            </Text>
            <Text className="text-gray-400 text-sm mt-1">
              {searchQuery
                ? "Try a different search"
                : "Be the first to follow"}
            </Text>
          </View>
        ) : (
          <View className="px-6 pt-4">
            {followers.map((f) => (
              <View
                key={f.id}
                className="flex-row items-center justify-between py-4"
              >
                <TouchableOpacity
                  className="flex-row items-center flex-1 mr-4"
                  onPress={() => router.push(`/(public)/profile/${f.follower_id}`)}
                  activeOpacity={0.7}
                >
                  <View className="relative">
                    <Image
                      source={{
                        uri: `https://ui-avatars.com/api/?name=${f.username
                          ?.charAt(0)
                          .toUpperCase()}&background=eab308&color=fff&size=128`,
                      }}
                      className="w-12 h-12 rounded-full"
                    />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="font-semibold text-base text-gray-900 mb-0.5">
                      {f.name}
                    </Text>
                    <Text className="text-sm text-gray-500 leading-tight">
                      {f.username}
                    </Text>
                  </View>
                </TouchableOpacity>

                {f.id !== user?.id && (
                  <TouchableOpacity
                    onPress={() => handleRemoveFollower(f)}
                    className={`w-36 px-6 py-2.5 rounded-full flex-row items-center ${
                      f.following
                        ? "bg-gray-100 border border-gray-200"
                        : "bg-yellow-500 shadow-sm"
                    }`}
                    activeOpacity={0.8}
                    disabled={loading}
                  >
                    {f.following ? (
                      <UserCheck size={16} color="#374151" />
                    ) : (
                      <UserPlus size={16} color="white" />
                    )}
                    <Text
                      className={`ml-2 font-medium text-sm ${
                        f.following ? "text-gray-700" : "text-white"
                      }`}
                    >
                      {f.following ? "Following" : "Follow"}
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
