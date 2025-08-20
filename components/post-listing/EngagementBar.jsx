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
import { toggleLike } from "@/lib/supabase/reviewsActions";
import { fetchCommentCountByPost } from "@/lib/supabase/commentsActions";
import Share from "react-native-share";

export const EngagementBar = ({
  likesCount: initialLikesCount,
  isLiked: initialIsLiked,
  isFavorited: initialIsFavorited,
  title,
  description,
  post_id,
  post_type,
  onFavorite,
  onShare: onShareProp,
  user_id,
}) => {
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const { supabase } = useSupabase();
  const { toggleBookmark } = useBookmarks();

  const [isLiked, setIsLiked] = useState(initialIsLiked || false);
  const [likesCount, setLikesCount] = useState(initialLikesCount || 0);
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited || false);
  const [isBookmarkModalVisible, setIsBookmarkModalVisible] = useState(false);
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  // Update local state when props change
  useEffect(() => {
    setIsLiked(initialIsLiked || false);
    setLikesCount(initialLikesCount || 0);
    setIsFavorited(initialIsFavorited || false);
  }, [initialIsLiked, initialLikesCount, initialIsFavorited]);

  useEffect(() => {
    const getCommentCount = async () => {
      const count = await fetchCommentCountByPost(supabase, post_id, post_type);
      setCommentCount(count);
    };

    getCommentCount();
  }, [post_id, post_type, supabase]);

  const handleLike = async () => {
    // Prevent multiple rapid clicks
    if (isLikeProcessing) return;

    try {
      const userId = user?.id;
      const postId = post_id;
      const postOwnerId = user_id;
      const postType = post_type;

      if (!userId || !postId || !postOwnerId) {
        console.warn("⛔ Invalid or missing postId or userId, exiting...");
        return;
      }

      // OPTIMISTIC UPDATE - Update UI immediately
      const newIsLiked = !isLiked;
      const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;

      setIsLiked(newIsLiked);
      setLikesCount(newLikesCount);
      setIsLikeProcessing(true);

      console.log("👤 Current user ID:", userId);
      console.log("📝 Post ID (review or own_review):", postId);
      console.log("🧑‍💻 Post Owner ID:", postOwnerId);
      console.log("📘 Post Type:", postType);

      const isOwnReview = postType !== "review";
      console.log("📂 Decided like source table:");
      console.log(
        "➡️ Table:",
        isOwnReview ? "own_review_likes" : "review_likes"
      );

      // Perform database operation in background
      const likeResult = await toggleLike(
        supabase,
        userId,
        postId,
        isOwnReview ? "own_review_likes" : "review_likes",
        isOwnReview ? "own_review_id" : "review_id",
        isOwnReview ? "own_reviews" : "reviews"
      );

      console.log("✅ Like toggle result:", likeResult);

      // Verify the result matches our optimistic update
      if (likeResult?.liked !== undefined) {
        // If the server result differs from our optimistic update, correct it
        if (likeResult.liked !== newIsLiked) {
          console.warn(
            "🔄 Server result differs from optimistic update, correcting..."
          );
          setIsLiked(likeResult.liked);
          setLikesCount(likeResult.liked ? likesCount + 1 : likesCount - 1);
        }
      }

      // Handle push notification (only if actually liked and not own post)
      if (likeResult?.liked && userId !== postOwnerId) {
        console.log(
          "📨 Fetching token to send notification to user:",
          postOwnerId
        );

        // Run notification in background without blocking UI
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

      // REVERT OPTIMISTIC UPDATE on error
      setIsLiked(!isLiked); // Revert to original state
      setLikesCount(likesCount); // Revert to original count

      // Optional: Show error message to user
      // You could add a toast notification here
    } finally {
      setIsLikeProcessing(false);
    }
  };

  const handleBookmark = async (collection) => {
    try {
      // Optimistic update for bookmark too
      const newIsFavorited = !isFavorited;
      setIsFavorited(newIsFavorited);

      const added = await toggleBookmark({
        postId: post_id,
        postType: post_type,
        userId: user?.id,
        collection,
      });

      // Verify server result matches optimistic update
      if (added !== newIsFavorited) {
        setIsFavorited(added);
      }

      if (onFavorite) onFavorite();
    } catch (error) {
      console.error("Error toggling bookmark:", error.message);
      // Revert optimistic update on error
      setIsFavorited(!isFavorited);
    }
  };

  const handleShare = async () => {
    try {
      const universalUrl = `https://wom-panel.vercel.app/post/${post_id}?type=${post_type}`;
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

  return (
    <View>
      <View className="flex-row mt-3 justify-between">
        <View className="flex-row mx-2 items-center">
          {/* Like Button with optimistic feedback */}
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
            post_type={post_type}
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

      {/* Bookmark Category Modal */}
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
              {isFavorited ? "Manage Bookmark" : "Save Post"}
            </Text>
            <VStack space="sm">
              {!isFavorited && (
                <View>
                  {post_type === "review" ? (
                    <Button
                      onPress={() => {
                        handleBookmark("Wishlist");
                        setIsBookmarkModalVisible(false);
                      }}
                      className="bg-blue-50 rounded-xl"
                    >
                      <ButtonText className="text-blue-600 font-semibold">
                        Add to Wishlist
                      </ButtonText>
                    </Button>
                  ) : (
                    <Button
                      onPress={() => {
                        handleBookmark("Recipe");
                        setIsBookmarkModalVisible(false);
                      }}
                      className="bg-blue-50 rounded-xl"
                    >
                      <ButtonText className="text-blue-600 font-semibold">
                        Add to Recipes
                      </ButtonText>
                    </Button>
                  )}
                </View>
              )}
              <Button
                onPress={() => {
                  if (isFavorited) handleBookmark("");
                  setIsBookmarkModalVisible(false);
                }}
                className="bg-red-50 rounded-xl"
              >
                <ButtonText className="text-red-600 font-semibold">
                  {isFavorited ? "Remove Bookmark" : "Cancel"}
                </ButtonText>
              </Button>
            </VStack>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};
