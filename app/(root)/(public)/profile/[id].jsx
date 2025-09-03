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
import { blockUser } from "@/lib/supabase/user_blocks";
import { Share } from "react-native";

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

  const handleShare = async (id, username) => {
    try {
      const universalUrl = `https://wordofmouth.vercel.app/profile/${id}`;
      const shareMessage = `Check out ${
        username || "this user's"
      } profile on Word of Mouth!\n${universalUrl}`;

      const shareOptions = await Share.share({
        title: "Share this profile",
        message: shareMessage, // Android
        url: universalUrl, // iOS
      });

      await Share.open(shareOptions);
    } catch (error) {
      console.error("Error sharing profile:", error.message);
    }
  };

  const [counts, setCounts] = useState({
    posts: 0,
    followers: 0,
    following: 0,
  });
  console.log("total posts:", counts.posts);
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const fetchUser = async () => {
    setLoading(true);
    try {
      const fetchedUser = await getUserById(supabase, user_id);

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
        posts: allPosts.reviewCount,
        followers: totalFollowersCount,
        following: totalFollowingCount,
      });
      setUser(fetchedUser);
    } catch (error) {
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
    } else {
      setIsFollowing(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data: postsData, error: postError } = await supabase
        .from("posts")
        .select(
          `
        *,
        user:user_id (
          username,
          first_name,
          last_name,
          updated_at,
          image_url
        ),
        restaurant:restaurant_id (*),
        post_dishes (*),
        post_likes (user_id)
      `
        )
        .eq("user_id", user_id)
        .eq("anonymous", false)
        .order("created_at", { ascending: false });

      if (postError) throw postError;

      const postsWithImages = postsData.map((post) => {
        const images =
          post.post_dishes
            ?.flatMap((dish) => dish.image_urls || [])
            .filter((url) => url) || [];

        return {
          ...post,
          images,
          dishes: post.post_dishes || [],
          isLiked:
            post.post_likes?.some((like) => like.user_id === authUser?.id) ||
            false,
        };
      });

      setPosts({
        reviews: postsWithImages.filter((p) => p.is_review),
        ownReviews: postsWithImages.filter((p) => !p.is_review),
      });
    } catch (err) {
      console.error("[fetchPosts] error:", err.message);
    }
  };
  const fetchData = async () => {
    if (!user_id) {
      router.replace("/");
      return;
    }
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
    if (isSignedIn && user_id) {
      fetchData();
    }
  }, [user_id, isSignedIn]);

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
      "Are you sure you want to block this user? They won't be able to interact with you.",
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
              const { error } = await blockUser(
                supabase,
                authUser?.id,
                user_id
              );
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
                // Optional: Navigate away from the blocked user's profile
                router.replace("/home");
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
          <View className="flex-row mt-4 gap-2">
            {user_id !== authUser?.id && (
              <>
                <TouchableOpacity
                  onPress={handleFollowToggle}
                  disabled={followLoading}
                  className="flex-1 flex-row py-2.5 rounded-xl border bg-gray-200 border-gray-200 mt-8 items-center justify-center"
                >
                  {followLoading && (
                    <ActivityIndicator size="small" color="#000" />
                  )}
                  <Text className="ml-3 text-center font-medium">
                    {isFollowing ? "Unfollow" : "Follow"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleShare(user_id, user.username)}
                  className="flex-1 flex-row py-2.5 rounded-xl border bg-gray-200 border-gray-200 mt-8 items-center justify-center"
                >
                  <Text className="font-semibold">Share Profile</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
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
              <Text className="text-xs mt-1">
                {activeTab === "reviews" ? "Reviews" : ""}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("own_reviews")}
              className={`flex-1 py-3 items-center ${
                activeTab === "own_reviews" ? "border-b-2 border-[#f39f1e]" : ""
              }`}
            >
              <Feather
                name="home"
                size={22}
                color={activeTab === "own_reviews" ? "#f39f1e" : "#888"}
              />
              <Text className="text-xs mt-1">
                {activeTab === "own_reviews" ? "Homemade" : ""}
              </Text>
            </TouchableOpacity>
          </View>

          <GridDynamicCards
            posts={
              activeTab === "reviews"
                ? posts.reviews || [] // 👈 fallback to []
                : posts.ownReviews || [] // 👈 fallback to []
            }
            scroll={false}
          />
        </View>
      </ScrollView>
    </View>
  );
}
