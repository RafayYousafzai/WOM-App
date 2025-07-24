"use client";

import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSupabase } from "@/context/supabaseContext";
import { toggleFollowUser } from "@/lib/supabase/followActions";
import { useAuth, useUser } from "@clerk/clerk-expo";
import GridDynamicCards from "@/components/dynamic-cards/GridDynamicCards";
import UnloggedState from "@/components/auth/unlogged-state";
import { getUserById } from "@/lib/supabase/userActions";
import { getTotalPostsCount } from "@/lib/supabase/userActions";
import { getTotalFollowersCount } from "@/lib/supabase/followActions";
import { getTotalFollowingCount } from "@/lib/supabase/followActions";
import { ProfileContentSkeleton } from "@/components/profile-view/ProfileSkeleton";
import { sendPushNotification } from "@/lib/notifications/sendPushNotification";
import {
  blockUser,
  unblockUser,
  isUserBlocked,
} from "@/lib/supabase/user_blocks";

export default function VisitProfileScreen() {
  const { supabase } = useSupabase();
  const { user: authUser } = useUser();
  const { isSignedIn } = useAuth();
  const { id: user_id } = useLocalSearchParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("reviews");
  const [refreshing, setRefreshing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [posts, setPosts] = useState({
    reviews: null,
    ownReviews: null,
  });

  console.log(posts);

  const [counts, setCounts] = useState({
    posts: 0,
    followers: 0,
    following: 0,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const fetchUser = async () => {
    setLoading(true);
    try {
      const user = await getUserById(supabase, user_id);
      const allPosts = await getTotalPostsCount(supabase, user_id);
      const totalFollowersCount = await getTotalFollowersCount(
        supabase,
        user_id
      );
      const totalFollowingCount = await getTotalFollowingCount(
        supabase,
        user_id
      );

      setCounts({
        posts: allPosts.all,
        followers: totalFollowersCount,
        following: totalFollowingCount,
      });

      setUser(user);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    const { data, error } = await supabase
      .from("user_follows")
      .select("id")
      .match({ follower_id: authUser?.id, followed_id: user_id });

    if (!error && data && data.length > 0) {
      setIsFollowing(true);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data: reviews, error: reviewError } = await supabase
        .from("reviews")
        .select(
          `*,
        user:user_id (
          username,
          first_name,
          last_name,
          updated_at,
          image_url
        ),
        review_likes (
          user_id
        )`
        )
        .eq("user_id", user_id)
        .eq("anonymous", false);

      if (reviewError) throw reviewError;

      const { data: ownReviews, error: ownReviewError } = await supabase
        .from("own_reviews")
        .select(
          `*,
        user:user_id (
          username,
          first_name,
          last_name,
          updated_at,
          image_url
        ),
        own_review_likes (
          user_id
        )`
        )
        .eq("user_id", user_id)
        .eq("anonymous", false);

      if (ownReviewError) throw ownReviewError;

      setPosts({
        reviews: reviews,
        ownReviews: ownReviews,
      });
    } catch (err) {
      console.error("Error fetching posts:", err.message);
    }
  };

  const fetchData = async () => {
    if (!user_id) router.replace("/");
    setLoading(true);
    try {
      await fetchUser();
      await fetchPosts();
      await checkFollowStatus();
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn) handleRefresh();
  }, [user_id]);

  const handleFollowToggle = async () => {
    try {
      setFollowLoading(true);
      const result = await toggleFollowUser(supabase, authUser?.id, user_id);
      const notifications_tokens = user?.unsafe_metadata?.notifications_tokens;

      if (result.followed) {
        setIsFollowing(true);
        if (notifications_tokens) {
          await sendPushNotification(
            notifications_tokens,
            `${authUser.fullName} is now following you.`,
            ""
          );
        }
      } else if (result.unfollowed) {
        setIsFollowing(false);
      }
    } catch (err) {
      console.error("Error toggling follow:", err.message);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleBlockUser = async () => {
    Alert.alert(
      "Block User",
      "Are you sure you want to unblock this user? They won't be able to interact with you.",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setMenuOpen(false),
        },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await blockUser(supabase, user?.id, user_id);
              if (error) {
                if (error.code === "23505") {
                  Alert.alert(
                    "Already Blocked",
                    "You have already blocked this user.",
                    [{ text: "OK" }]
                  );
                } else {
                  throw error;
                }
              } else {
                Alert.alert(
                  "User Blocked",
                  "The user has been successfully blocked.",
                  [{ text: "OK" }]
                );
              }
            } catch (err) {
              console.error("Block error:", err);
              Alert.alert(
                "Error",
                "Something went wrong while blocking the user.",
                [{ text: "OK" }]
              );
            } finally {
              setMenuOpen(false);
            }
          },
        },
      ]
    );
  };

  const handleUnBlockUser = async () => {
    Alert.alert("Unblock User", "Are you sure you want to unblock this user?", [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => setMenuOpen(false),
      },
      {
        text: "Unblock",
        style: "destructive",
        onPress: async () => {
          try {
            const { error, count } = await unblockUser(
              supabase,
              user?.id,
              user_id
            );

            if (error) throw error;

            console.log("Rows deleted:", count);

            if (count === 0) {
              throw new Error(
                "No records were deleted - user might not have been blocked"
              );
            }

            Alert.alert(
              "User Unblocked",
              "The user has been successl;fully unblocked.",
              [{ text: "OK" }]
            );
          } catch (err) {
            console.error("Unblock error:", err);
            Alert.alert("Error", err.message || "Failed to unblock user", [
              { text: "OK" },
            ]);
          } finally {
            setMenuOpen(false);
          }
        },
      },
    ]);
  };

  if (!isSignedIn) {
    return <UnloggedState />;
  }

  if (loading) {
    return <ProfileContentSkeleton />;
  }

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">User not found.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#eab308"]}
            tintColor="#eab308"
          />
        }
      >
        <View className="p-5">
          <View className="flex-row justify-between items-center">
            <View className="flex-row">
              <TouchableOpacity className="relative">
                <Image
                  source={{ uri: user.image_url }}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                />
              </TouchableOpacity>
              <View className="mt-2 ml-2">
                <Text className="text-2xl font-semibold text-gray-800">
                  {user.first_name} {user.last_name}
                </Text>
                <Text className="text-xs font-semibold text-gray-500">
                  @{user.username}
                </Text>
                <Text style={{ width: 260 }}>{user?.unsafe_metadata?.bio}</Text>
              </View>
            </View>

            {/* Menu Button with Modal */}
            <View className="relative">
              <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)}>
                <Feather name="more-vertical" size={20} color="#666" />
              </TouchableOpacity>

              {/* Modal for Menu */}
              <Modal
                visible={menuOpen}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setMenuOpen(false)}
              >
                <Pressable
                  className="flex-1"
                  onPress={() => setMenuOpen(false)}
                >
                  <View className="flex-1 justify-start items-end pt-20 pr-5">
                    <View className="bg-white rounded-xl shadow-lg min-w-[150px] overflow-hidden">
                      {user_id !== authUser?.id && (
                        <>
                          <TouchableOpacity
                            onPress={handleBlockUser}
                            className="flex-row items-center px-4 py-3 bg-red-500"
                            activeOpacity={0.7}
                          >
                            <Feather name="user-x" size={16} color="#fff" />
                            <Text className="ml-2 text-base text-white font-medium">
                              Block User
                            </Text>
                          </TouchableOpacity>
                          {/* <TouchableOpacity
                            onPress={handleUnBlockUser}
                            className="flex-row items-center px-4 py-3 bg-yellow-500"
                            activeOpacity={0.7}
                          >
                            <Feather name="user-x" size={16} color="#fff" />
                            <Text className="ml-2 text-base text-white font-medium">
                              UnBlock User
                            </Text>
                          </TouchableOpacity> */}
                        </>
                      )}
                    </View>
                  </View>
                </Pressable>
              </Modal>
            </View>
          </View>

          <View className="flex-row justify-between mt-4 px-4">
            <View className="items-center">
              <Text className="text-xl font-bold text-gray-800">
                {counts.posts}
              </Text>
              <Text className="text-gray-600">Posts</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push(`/followers/${user_id}`)}
              className="items-center"
            >
              <Text className="text-xl font-bold text-gray-800">
                {counts.followers}
              </Text>
              <Text className="text-gray-600">Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push(`/following/${user_id}`)}
              className="items-center"
            >
              <Text className="text-xl font-bold text-gray-800">
                {counts.following}
              </Text>
              <Text className="text-gray-600">Following</Text>
            </TouchableOpacity>
          </View>

          {user_id !== authUser?.id && (
            <TouchableOpacity
              onPress={handleFollowToggle}
              disabled={followLoading}
              className="flex flex-row justify-center w-full px-4 py-2 mt-8 mb-2 bg-[#f39f1e] rounded-full self-start"
            >
              {followLoading && <ActivityIndicator size="small" color="#fff" />}
              <Text className="ml-3 text-white text-center font-medium">
                {isFollowing ? "Unfollow" : "Follow"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="border-gray-200">
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => setActiveTab("reviews")}
              className={`flex-1 py-3 items-center ${
                activeTab === "reviews" ? "border-b-2 border-[#f39f1e]" : ""
              }`}
            >
              <Feather
                name="star"
                size={22}
                color={activeTab === "reviews" ? "#f39f1e" : "#888"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("posts")}
              className={`flex-1 py-3 items-center ${
                activeTab === "posts" ? "border-b-2 border-[#f39f1e]" : ""
              }`}
            >
              <Feather
                name="grid"
                size={22}
                color={activeTab === "posts" ? "#f39f1e" : "#888"}
              />
            </TouchableOpacity>
          </View>

          <GridDynamicCards
            posts={activeTab === "posts" ? posts.ownReviews : posts.reviews}
            scroll={false}
            key={posts?.reviews?.length + activeTab}
          />
        </View>
      </ScrollView>
    </View>
  );
}
