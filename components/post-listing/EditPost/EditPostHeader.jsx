"use client";
import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
  Animated,
  Dimensions,
} from "react-native";
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

const { width } = Dimensions.get("window");

export const EditPostHeader = ({
  username,
  userAvatar,
  user_id,
  postTimeAgo,
  post_id,
  post_type,
  anonymous,
  onDelete,
  post, // Add the full post object for editing
}) => {
  const { supabase } = useSupabase();
  const { user } = useUser();
  const [following, setFollowing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isSignedIn } = useAuth();

  // Animation values
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

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
  }, [user_id, user, supabase]);

  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 16 });

  const threeDotRef = useRef(null);
  DropdownMenu;
  const showMenu = () => {
    if (threeDotRef.current) {
      threeDotRef.current.measure((fx, fy, width, height, px, py) => {
        setMenuPosition({ top: py + height + 5, right: 16 }); // position menu below button
        setMenuOpen(true);

        Animated.parallel([
          Animated.spring(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
          Animated.timing(opacityValue, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  };

  const hideMenu = () => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(opacityValue, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setMenuOpen(false);
    });
  };

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
      }
    } catch (err) {
      console.error("Error in Post Header: handleFollow:", err.message || err);
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

  const handleEdit = () => {
    hideMenu();
    // Navigate to edit screen with post data
    router.push({
      pathname: "/edit-post",
      params: {
        postId: post_id,
        postType: post_type,
        postData: JSON.stringify(post),
      },
    });
  };

  const handleDelete = async () => {
    const isReview = post_type === "review";
    hideMenu();
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (isReview) {
                await deleteReview(supabase, post_id);
              } else {
                await deleteOwnReview(supabase, post_id);
              }
              if (onDelete) {
                onDelete(post_id);
              }
              Alert.alert(
                "Success",
                "Post deleted successfully. Refresh page to see changes.",
                [{ text: "OK" }]
              );
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Error", "Failed to delete post. Please try again.", [
                { text: "OK" },
              ]);
            }
          },
        },
      ]
    );
  };

  const handleBlockUser = async () => {
    hideMenu();
    Alert.alert(
      "Block User",
      "Are you sure you want to block this user? They won't be able to interact with you.",
      [
        {
          text: "Cancel",
          style: "cancel",
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
            }
          },
        },
      ]
    );
  };

  const handleReport = async () => {
    hideMenu();
    Alert.alert(
      "Report Post",
      "Are you sure you want to report this post? It will be reviewed by our team.",
      [
        {
          text: "Cancel",
          style: "cancel",
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
            }
          },
        },
      ]
    );
  };

  const ownPostMenuItems = [
    {
      icon: "shield",
      label: "Enable Gatekeeping",
      onPress: handleEdit,
      color: "#2563EB",
      backgroundColor: "#E0F2FE",
    },
    {
      icon: "edit-2",
      label: "Edit Post",
      onPress: handleEdit,
      color: "#3B82F6",
      backgroundColor: "#EFF6FF",
    },
    {
      icon: "trash-2",
      label: "Delete Post",
      onPress: handleDelete,
      color: "#EF4444",
      backgroundColor: "#FEF2F2",
      destructive: true,
    },
  ];

  // Menu items for other users' posts
  const otherPostMenuItems = [
    {
      icon: "flag",
      label: "Report Post",
      onPress: handleReport,
      color: "#F97316",
      backgroundColor: "#FFF7ED",
    },
    {
      icon: "user-x",
      label: "Block User",
      onPress: handleBlockUser,
      color: "#EF4444",
      backgroundColor: "#FEF2F2",
      destructive: true,
    },
  ];

  const menuItems =
    user_id === user?.id ? ownPostMenuItems : otherPostMenuItems;

  const DropdownMenu = () => (
    <Modal
      transparent
      visible={menuOpen}
      animationType="none"
      onRequestClose={hideMenu}
    >
      <Pressable style={{ flex: 1 }} onPress={hideMenu} className="flex-1">
        <View className="flex-1 relative">
          <Animated.View
            style={{
              position: "absolute",
              top: menuPosition.top,
              right: menuPosition.right,
              transform: [{ scale: scaleValue }],
              opacity: opacityValue,
            }}
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
          >
            {/* Dropdown Arrow */}
            <View className="absolute -top-2 right-4 w-4 h-4 bg-white border-l border-t border-gray-100 transform rotate-45" />

            <View className="py-2 min-w-[200px]">
              {menuItems.map((item, index) => (
                <Pressable
                  key={index}
                  onPress={item.onPress}
                  className="flex-row items-center px-2 py-2 mx-2 rounded-xl active:scale-95"
                  style={({ pressed }) => ({
                    backgroundColor: pressed
                      ? item.backgroundColor
                      : "transparent",
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  })}
                >
                  <View
                    className="w-4 h-4 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: item.backgroundColor }}
                  >
                    <Feather name={item.icon} size={16} color={item.color} />
                  </View>
                  <Text
                    className="text-sm font-medium flex-1"
                    style={{ color: item.destructive ? item.color : "#1F2937" }}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        </View>
      </Pressable>
    </Modal>
  );

  return (
    <>
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
          <View className="flex-row items-center mr-2">
            <TouchableOpacity
              onPress={handleFollow}
              className={`px-3 py-1.5 rounded-full ${
                following ? "bg-gray-300" : "border border-gray-300"
              }`}
              activeOpacity={0.8}
              style={{
                shadowColor: following ? "transparent" : "#3B82F6",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
                elevation: 2,
              }}
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
          <TouchableOpacity
            ref={threeDotRef}
            onPress={showMenu}
            className="w-8 h-8 items-center justify-center rounded-full active:bg-gray-100"
            activeOpacity={0.7}
          >
            <Feather name="more-vertical" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <DropdownMenu />
    </>
  );
};
