"use client";

import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Avatar } from "react-native-paper";
import { router } from "expo-router";
import {
  isFollowing as checkIfFollowing,
  toggleFollowUser,
} from "@/lib/supabase/followActions";
import { useUser } from "@clerk/clerk-expo";
import { useSupabase } from "@/context/supabaseContext";
import { Feather } from "@expo/vector-icons";
import { sendPushNotification } from "@/lib/notifications/sendPushNotification";
import { deleteReview } from "@/lib/supabase/reviewsActions";
import { deleteOwnReview } from "@/lib/supabase/ownreviewsActions";
import { blockUser } from "@/lib/supabase/user_blocks";
import { useAuth } from "@clerk/clerk-expo";

export const PostHeader = ({
  username,
  userAvatar,
  user_id,
  postTimeAgo,
  post_id,
  post_type,
  anonymous,
  onDelete,
}) => {
  const { supabase } = useSupabase();
  const { user } = useUser();
  const [following, setFollowing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (!user || !user_id) return;

    let isMounted = true;
    const fetchFollowStatus = async () => {
      const isUserFollowing = await checkIfFollowing(
        supabase,
        user.id,
        user_id
      );

      if (isMounted) setFollowing(isUserFollowing);
    };
    fetchFollowStatus();
    return () => {
      isMounted = false;
    };
  }, [user_id, user?.id, supabase]);

  const handleFollow = async (e) => {
    if (anonymous) {
      console.warn("Anonymous user cannot follow.");
      return;
    } else if (!user || !user_id) {
      console.warn("User not logged in or user_id is missing.", {
        user: user.id,
        user_id,
      });
      return;
    }

    if (user?.id === user_id) {
      console.warn("You cannot follow yourself.");
      return;
    }
    e.stopPropagation();

    try {
      const response = await toggleFollowUser(supabase, user?.id, user_id);

      if (response.followed) {
        console.log(`Post Header: You followed user ${user_id}`);

        // 🛜 Fetch the token from Supabase
        const { data, error } = await supabase
          .from("user_notifications_tokens")
          .select("token")
          .eq("id", user_id)
          .single();

        if (error) {
          console.error("Error fetching token:", error);
          return;
        }

        if (data?.token) {
          // 🚀 Send the push notification
          await sendPushNotification(
            data.token,
            `${user.firstName} ${user.lastName} is now following you.`,
            ""
          );

          console.log(`Push notification sent to user ${user_id}`);
        } else {
          console.warn("Post Header: No push token found for this user.");
        }
      } else if (response.unfollowed) {
        console.info(`Post Header: You unfollowed user ${user_id}`);
        // Optionally handle unfollow-specific UI updates here
      }
    } catch (err) {
      console.error("Error in Post Header: handleFollow:", err.message || err);
      // Optional: show error toast/alert
    }

    setFollowing(!following);
  };

  const handleProfilePress = (e) => {
    e.stopPropagation();
    if (anonymous) {
      console.warn("Anonymous user profile cannot be accessed");
      return;
    }
    router.push(`/(public)/profile/${user_id}`);
  };

  const handleDelete = async () => {
    const isReview = post_type === "review";

    // First confirmation alert
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setMenuOpen(false),
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Perform deletion
              if (isReview) {
                await deleteReview(supabase, post_id);
              } else {
                await deleteOwnReview(supabase, post_id);
              }
              if (onDelete) {
                onDelete(post_id);
              }
              // Success feedback
              Alert.alert(
                "Success",
                "Post deleted successfully. Refresh page to see changes.",
                [
                  {
                    text: "OK",
                  },
                ]
              );
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Error", "Failed to delete post. Please try again.", [
                {
                  text: "OK",
                  onPress: () => setMenuOpen(false),
                },
              ]);
            }
          },
        },
      ]
    );
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
              const { error } = await blockUser(supabase, user?.id, user_id);

              if (error) {
                // Unique violation (already blocked)
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

  const handleReport = async () => {
    Alert.alert(
      "Report Post",
      "Are you sure you want to report this post? It will be reviewed by our team.",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setMenuOpen(false),
        },
        {
          text: "Report",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase.from("reports").insert([
                {
                  post_id,
                  post_type,
                  user_id: user?.id,
                  reported_at: new Date().toISOString(),
                },
              ]);

              if (error) {
                // Unique violation: user has already reported this post
                if (error.code === "23505") {
                  Alert.alert(
                    "Already Reported",
                    "You have already reported this post.",
                    [{ text: "OK" }]
                  );
                } else {
                  throw error;
                }
              } else {
                Alert.alert(
                  "Reported",
                  "Post has been reported successfully.",
                  [{ text: "OK" }]
                );
              }
            } catch (error) {
              console.error("Report error:", error);
              Alert.alert(
                "Error",
                "Failed to report the post. Please try again.",
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

  return (
    <View className="flex-row justify-between items-center px-1 pt-3">
      <TouchableOpacity
        className="flex-row items-center flex-1"
        onPress={handleProfilePress}
        activeOpacity={0.7}
      >
        <Avatar.Image
          size={36}
          source={{ uri: userAvatar }}
          className="bg-gray-100"
        />
        <View className="ml-3 flex-1">
          <Text className="font-medium text-gray-900">{username}</Text>
          <Text className="text-xs text-gray-500">{postTimeAgo}</Text>
        </View>
      </TouchableOpacity>
      {isSignedIn && !anonymous && user?.id !== user_id && (
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={handleFollow}
            className={`px-3 py-1.5 rounded-full ${
              following ? "bg-gray-300" : "border border-gray-300"
            }`}
            activeOpacity={0.7}
          >
            <Text
              className={`text-xs font-medium ${
                following ? "text-gray-700" : "text-black"
              }`}
            >
              {following ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {isSignedIn && (
        <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)}>
          <Feather name="more-vertical" size={20} color="#666" />
        </TouchableOpacity>
      )}
      {menuOpen && (
        <View className="absolute top-12 right-2   z-50 w-48 py-2">
          {user_id === user?.id ? (
            <TouchableOpacity
              onPress={handleDelete}
              className="flex-row items-center px-4 py-3 bg-red-500 rounded-xl"
              activeOpacity={0.7}
            >
              <Feather name="trash-2" size={16} color="#fff" />
              <Text className="ml-2 text-base text-white font-medium">
                Delete Post
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                onPress={handleReport}
                className="flex-row items-center px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl"
                activeOpacity={0.7}
              >
                <Feather name="flag" size={16} color="#f97316" />
                <Text className="ml-2 text-base text-orange-500 font-medium">
                  Report Post
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleBlockUser}
                className="flex-row items-center px-4 py-3 bg-red-500 rounded-xl"
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
      )}
    </View>
  );
};
