"use client";
import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
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
import { blockUser } from "@/lib/supabase/user_blocks";
import { useAuth } from "@clerk/clerk-expo";
import { Image } from "react-native";
import { deletePost, togglePostGatekeeping } from "@/lib/supabase/postsAction";
import { DropdownMenu } from "./DropdownMenu";
import { BottomModal } from "./BottomModal";

const { width, height } = Dimensions.get("window");

export const EditPostHeader = ({
  username,
  userAvatar,
  user_id,
  postTimeAgo,
  post_id,
  anonymous,
  onDelete,
  location,
  onRestaurantPress,
  post,
  onGatekeepingUpdate,
}) => {
  const { supabase } = useSupabase();
  const { user } = useUser();
  const [following, setFollowing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isSignedIn } = useAuth();

  const [bottomModalVisible, setBottomModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const [gatekeepingEnabled, setGatekeepingEnabled] = useState(() => {
    const initial = post?.gatekeeping === true;
    console.log(
      `Initial gatekeeping for post ${post_id}: ${post?.gatekeeping} -> ${initial}`
    );
    return initial;
  });

  const [gatekeepingLoading, setGatekeepingLoading] = useState(false);
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

  // Set initial gatekeeping state from post data
  useEffect(() => {
    if (post && post.gatekeeping !== undefined) {
      const newGatekeeping = post.gatekeeping === true;
      console.log(
        `Post ${post_id} gatekeeping changed from props: ${post.gatekeeping} -> ${newGatekeeping}`
      );

      // Only update if different to avoid unnecessary re-renders
      if (newGatekeeping !== gatekeepingEnabled) {
        setGatekeepingEnabled(newGatekeeping);
      }
    }
  }, [post?.gatekeeping, post_id]); // Remove gatekeepingEnabled from deps to avoid loops

  // FIX: Add effect to sync with database after operations
  useEffect(() => {
    const syncGatekeeping = async () => {
      if (post_id && user?.id === user_id) {
        try {
          const { data, error } = await supabase
            .from("posts")
            .select("gatekeeping")
            .eq("id", post_id)
            .single();

          if (!error && data) {
            const dbGatekeeping = data.gatekeeping === true;
            console.log(
              `Database sync for post ${post_id}: ${data.gatekeeping} -> ${dbGatekeeping}`
            );

            if (dbGatekeeping !== gatekeepingEnabled) {
              console.log(
                `Syncing gatekeeping state: ${gatekeepingEnabled} -> ${dbGatekeeping}`
              );
              setGatekeepingEnabled(dbGatekeeping);
            }
          }
        } catch (error) {
          console.error("Error syncing gatekeeping:", error);
        }
      }
    };

    // Sync periodically or when component mounts
    syncGatekeeping();

    // Optional: Set up an interval to check periodically
    const interval = setInterval(syncGatekeeping, 5000); // Every 5 seconds

    return () => clearInterval(interval);
  }, [post_id, user_id, user?.id, supabase]); // Removed gatekeepingEnabled to avoid loops

  const handleGatekeeping = async () => {
    hideMenu();
    setGatekeepingLoading(true);

    const currentState = gatekeepingEnabled;
    console.log(`Toggling gatekeeping from: ${currentState}`);

    try {
      const result = await togglePostGatekeeping(supabase, post_id, user?.id);

      if (result.success) {
        const newState = result.gatekeeping;
        console.log(`Toggle successful: ${currentState} -> ${newState}`);

        // Update local state immediately
        setGatekeepingEnabled(newState);

        // Notify parent component
        if (onGatekeepingUpdate) {
          onGatekeepingUpdate(post_id, newState);
        }

        Alert.alert("Success", result.message, [{ text: "OK" }]);

        // Force a database sync after a short delay
        setTimeout(async () => {
          try {
            const { data } = await supabase
              .from("posts")
              .select("gatekeeping")
              .eq("id", post_id)
              .single();

            if (data) {
              const dbState = data.gatekeeping === true;
              console.log(`Post-toggle sync: ${newState} vs DB: ${dbState}`);
              if (dbState !== newState) {
                setGatekeepingEnabled(dbState);
              }
            }
          } catch (err) {
            console.error("Post-toggle sync error:", err);
          }
        }, 1000);
      } else {
        console.error("Gatekeeping toggle failed:", result.error);
        Alert.alert(
          "Error",
          result.error || "Failed to update gatekeeping setting",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Gatekeeping error:", error);
      Alert.alert("Error", "Something went wrong while updating gatekeeping", [
        { text: "OK" },
      ]);
    } finally {
      setGatekeepingLoading(false);
    }
  };

  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 16 });

  const threeDotRef = useRef(null);

  // Bottom Modal Functions
  const showBottomModal = () => {
    setBottomModalVisible(true);

    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
    ]).start();
  };

  const hideBottomModal = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setBottomModalVisible(false);
    });
  };

  const showMenu = () => {
    if (threeDotRef.current) {
      threeDotRef.current.measure((fx, fy, width, height, px, py) => {
        setMenuPosition({ top: py + height + 5, right: 16 });
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

  // Modified handlers for profile and location
  const handleProfileOrLocationPress = (e) => {
    e.stopPropagation();
    if (anonymous) {
      console.warn("Anonymous user profile cannot be accessed");
      return;
    }
    showBottomModal();
  };

  const navigateToProfile = () => {
    hideBottomModal();
    router.push(`/(public)/profile/${user_id}`);
  };

  const navigateToLocation = () => {
    hideBottomModal();
    router.push(`/restaurant-info/${encodeURIComponent(location)}`);
  };

  const handleEdit = () => {
    hideMenu();
    // Navigate to edit screen with post data
    router.push({
      pathname: "/edit-post",
      params: {
        postId: post_id,
        postData: JSON.stringify(post),
      },
    });
  };

  const handleDelete = async () => {
    hideMenu();
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (user?.id === user_id) {
                await deletePost(supabase, post_id);
                if (onDelete) onDelete(post_id);
                Alert.alert("Success", "Post deleted successfully.");
              } else {
                Alert.alert("Error", "You can only delete your own posts.");
              }
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Error", "Failed to delete post. Please try again.");
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
      icon: gatekeepingEnabled ? "shield-off" : "shield",
      label: gatekeepingEnabled ? "Disable Gatekeeping" : "Enable Gatekeeping",
      onPress: handleGatekeeping,
      color: gatekeepingEnabled ? "#F97316" : "#2563EB",
      backgroundColor: gatekeepingEnabled ? "#FFF7ED" : "#E0F2FE",
      loading: gatekeepingLoading,
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
  const shouldShowLocation = !gatekeepingEnabled && location;
  return (
    <>
      <View className="flex-row justify-between items-center px-1 pt-3">
        <TouchableOpacity
          className="flex-row items-center flex-1"
          onPress={handleProfileOrLocationPress}
          activeOpacity={0.7}
        >
          <Avatar.Image
            size={36}
            source={{ uri: userAvatar }}
            className="bg-gray-100"
          />
          <View className="ml-3 flex-1">
            <Text className="font-medium text-gray-900">{username}</Text>
            <View className="flex-row ml-0.5 items-center">
              {(() => {
                const shouldShow = !gatekeepingEnabled && location;
                console.log(
                  `Post ${post_id} location display: gatekeeping=${gatekeepingEnabled}, location=${location}, shouldShow=${shouldShow}`
                );
                return shouldShow;
              })() && (
                <View className="text-gray-600 text-sm flex-row align-middle justify-center">
                  <Image
                    source={require("../../../assets/icons/marker.png")}
                    className="w-3.5 h-4 mr-1 mt-0.5"
                  />
                  <Text className="text-gray-500 font-semibold">
                    {location.split(",")[0]}
                  </Text>
                </View>
              )}
            </View>
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

      <DropdownMenu
        menuOpen={menuOpen}
        hideMenu={hideMenu}
        menuPosition={menuPosition}
        scaleValue={scaleValue}
        opacityValue={opacityValue}
        menuItems={menuItems}
      />
      <BottomModal
        bottomModalVisible={bottomModalVisible}
        hideBottomModal={hideBottomModal}
        overlayOpacity={overlayOpacity}
        slideAnim={slideAnim}
        navigateToProfile={navigateToProfile}
        navigateToLocation={navigateToLocation}
        userAvatar={userAvatar}
        username={username}
        gatekeepingEnabled={gatekeepingEnabled}
        location={location}
      />
    </>
  );
};
