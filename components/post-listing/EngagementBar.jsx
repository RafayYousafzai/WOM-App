"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  Pressable,
} from "react-native";
import CommentsModal from "./comments/CommentsModal";
import { useBookmarks } from "@/lib/supabase/bookmarkActions";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { VStack, Button, ButtonText } from "@/components/ui";
import { sendPushNotification } from "@/lib/notifications/sendPushNotification";
import { useSupabase } from "@/context/supabaseContext";
import { fetchCommentCountByPost } from "@/lib/supabase/commentsActions";
import { togglePostLike } from "@/lib/supabase/postsAction";

import Share from "react-native-share";

export const EngagementBar = ({
  likesCount: initialLikesCount,
  isLiked: initialIsLiked,
  isFavorited: initialIsFavorited,
  title,
  post_id,
  onFavorite,
  user_id,
  onLike,
}) => {
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const { supabase} = useSupabase();
  const { addPostToCollection, getUserCollections, isPostBookmarked, removeAllBookmarksForPost } = 
    useBookmarks();

  const [isLiked, setIsLiked] = useState(initialIsLiked || false);
  const [likesCount, setLikesCount] = useState(initialLikesCount || 0);
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited || false);
  const [isBookmarkModalVisible, setIsBookmarkModalVisible] = useState(false);
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [collections, setCollections] = useState([]);

  // Fetches collections and updates bookmark status
  useEffect(() => {
    const fetchAndCheck = async () => {
      if (!user?.id || !post_id) return;
      try {
        const fetchedCollections = await getUserCollections(user.id);
        setCollections(fetchedCollections);
        const isBookmarked = await isPostBookmarked({
          postId: post_id,
          userId: user.id,
        });
        setIsFavorited(isBookmarked);
      } catch (error) {
        console.error("Error fetching collections or bookmark status:", error);
      }
    };
    fetchAndCheck();
  }, [user, post_id, isPostBookmarked, getUserCollections]);

  // Syncs local state with props changes
  useEffect(() => {
    setIsLiked(initialIsLiked || false);
    setLikesCount(initialLikesCount || 0);
  }, [initialIsLiked, initialLikesCount]);

  // Fetches comment count
  useEffect(() => {
    const getCommentCount = async () => {
      const count = await fetchCommentCountByPost(supabase, post_id);
      setCommentCount(count);
    };
    getCommentCount();
  }, [post_id, supabase]);

  const handleLike = async (item) => {
    // Prevent multiple rapid clicks
    if (isLikeProcessing) return;

    try {
      const userId = user?.id;
      const postId = post_id;
      const postOwnerId = user_id;

      if (!userId || !postId || !postOwnerId) {
        console.warn("⛔ Invalid or missing postId or userId, exiting...");
        return;
      }

      const newIsLiked = !isLiked;
      const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;

      setIsLiked(newIsLiked);
      setLikesCount(newLikesCount);
      setIsLikeProcessing(true);

      const likeResult = await togglePostLike(supabase, userId, postId);

      console.log("✅ Like toggle result:", likeResult);
      if (onLike) {
        onLike(postId, newIsLiked, newLikesCount);
      }

      if (likeResult?.liked !== undefined) {
        if (likeResult.liked !== newIsLiked) {
          console.warn(
            "🔄 Server result differs from optimistic update, correcting..."
          );
          setIsLiked(likeResult.liked);
          setLikesCount(likeResult.liked ? likesCount + 1 : likesCount - 1);
        }
      }

      if (likeResult?.liked && userId !== postOwnerId) {
        console.log(
          "📨 Fetching token to send notification to user:",
          postOwnerId
        );

        setTimeout(async () => {
          try {
            const { data, error } = await supabase
              .from("user_notifications_tokens")
              .select("token")
              .eq("id", postOwnerId)
              .single();

            if (error) {
              console.error("❌ Error fetching token:", error);
            } else if (data?.token) {
              console.log("🚀 Sending push notification to token:", data.token);
              await sendPushNotification(
                data.token,
                `${user.firstName} ${user.lastName} liked your post ❤️`,
                ""
              );
            } else {
              console.warn("⚠️ No push token found for user:", postOwnerId);
            }
          } catch (notificationError) {
            console.error("🔥 Error sending notification:", notificationError);
          }
        }, 0);
      }
    } catch (error) {
      console.error("🔥 Error during like operation:", error);

      setIsLiked(!isLiked); // Revert to original state
      setLikesCount(likesCount); // Revert to original count
    } finally {
      setIsLikeProcessing(false);
    }
  };

  const handleBookmark = async (collectionName) => {
    try {
      if (collectionName) {
        await addPostToCollection({
          userId: user?.id,
          postId: post_id,
          collectionName: collectionName,
        });
        setIsFavorited(true);
      } else {
        await removeAllBookmarksForPost({
          userId: user?.id,
          postId: post_id,
        });
        setIsFavorited(false);
      }

      if (onFavorite) onFavorite();
    } catch (error) {
      console.error("Error toggling bookmark:", error.message);
    } finally {
      setIsBookmarkModalVisible(false);
    }
  };

  const handleShare = async () => {
    try {
      const universalUrl = `https://wordofmouth.vercel.app/post/${post_id}`;
      const shareMessage = `Check out this post: ${ 
        title || "Shared post"
      }\n${universalUrl}`;

      const shareOptions = {
        title: "Share this post",
        message: shareMessage,
        url: universalUrl,
        failOnCancel: false,
      };
      await Share.open(shareOptions);

      const result = await Share.share({
        message: shareMessage,
        title: title || "Share this post",
      });

      if (result.action === Share.sharedAction) {
        if (onShareProp) onShareProp();
      }
    } catch (error) {
      console.error("Error sharing:", error.message);
    }
  };

  if (!isSignedIn) return null;

  // Combine default and user-created collections for the modal
  const defaultCollections = [{ name: "Wishlist" }, { name: "Recipe" }];
  const uniqueCollections = [
    ...new Map(
      [...defaultCollections, ...collections].map((item) => [item.name, item])
    ).values(),
  ];

  return (
    <View>
      <View className="flex-row mt-3 justify-between">
        {/* Like, Comments, Share Buttons */}
        <View className="flex-row mx-2 items-center">
          <TouchableOpacity
            onPress={handleLike}
            className="mr-4 flex-row items-center"
            disabled={isLikeProcessing}
            activeOpacity={0.6}
          >
            <Image
              source={
                isLiked
                  ? require("@/assets/icons/heart-solid.png")
                  : require("@/assets/icons/heart.png")
              }
              className="w-6 h-6"
            />
            {likesCount > 0 && (
              <Text className="text-gray-600 text-md font-semibold text-center ml-3">
                {likesCount}
              </Text>
            )}
          </TouchableOpacity>
          <CommentsModal
            post_id={post_id}
            user_id={user_id}
            commentCount={commentCount}
          />
          <TouchableOpacity onPress={handleShare} className="mr-4">
            <Image
              source={require("@/assets/icons/upload.png")}
              className="w-8 h-8"
            />
          </TouchableOpacity>
        </View>

        {/* Bookmark Button */}
        <TouchableOpacity
          onPress={() => setIsBookmarkModalVisible(true)}
          className="mr-4"
        >
          <Image
            source={
              isFavorited
                ? require("@/assets/icons/bookmark-solid.png")
                : require("@/assets/icons/bookmark.png")
            }
            className="w-6 h-6"
          />
        </TouchableOpacity>
      </View>

      {/* Bookmark Collection Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isBookmarkModalVisible}
        onRequestClose={() => setIsBookmarkModalVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setIsBookmarkModalVisible(false)}
        >
          <View className="bg-white rounded-t-2xl p-4 shadow-lg">
            <Text className="text-lg font-bold text-gray-900 mb-4 text-center">
              {isFavorited ? "Manage Bookmark" : "Save to Collection"}
            </Text>
            <VStack space="sm">
              {!isFavorited ? (
                uniqueCollections.map((collection) => (
                  <Button
                    key={collection.name}
                    onPress={() => handleBookmark(collection.name)}
                    className="bg-blue-50 rounded-xl"
                  >
                    <ButtonText className="text-blue-600 font-semibold">
                      {`Add to ${collection.name}`}
                    </ButtonText>
                  </Button>
                ))
              ) : (
                <Button
                  onPress={() => handleBookmark("")}
                  className="bg-red-50 rounded-xl"
                >
                  <ButtonText className="text-red-600 font-semibold">
                    Remove Bookmark
                  </ButtonText>
                </Button>
              )}

              <Button
                onPress={() => setIsBookmarkModalVisible(false)}
                className="bg-gray-50 rounded-xl"
              >
                <ButtonText className="text-gray-600 font-semibold">
                  Cancel
                </ButtonText>
              </Button>
            </VStack>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};