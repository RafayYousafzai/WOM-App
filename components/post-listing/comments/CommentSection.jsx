"use client";
import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
  PanResponder,
  Animated,
  Keyboard,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  fetchCommentsByPost,
  createComment,
  fetchReplies,
  deleteComment,
} from "@/lib/supabase/commentsActions";
import { useUser } from "@clerk/clerk-expo";
import { useSupabase } from "@/context/supabaseContext";
import { Box, Pressable, Input, InputField } from "@/components/ui";
import { sendPushNotification } from "@/lib/notifications/sendPushNotification";
import { SafeAreaView } from "react-native-safe-area-context";
import { CommentListSkeleton } from "../../PageSkeletons/CommentSkeleton";

export const CommentSection = ({
  isVisible,
  onClose,
  post_id,
  post_type = "review",
  user_id: post_owner_id,
}) => {
  const { user } = useUser();
  const { supabase } = useSupabase();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isScrolling, setIsScrolling] = useState(false);
  const [loading, setLoading] = useState(true);

  // Separate loading states for comment and reply submissions
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Delete loading states
  const [deletingComments, setDeletingComments] = useState(new Set());
  const [deletingReplies, setDeletingReplies] = useState(new Set());

  const scrollViewRef = useRef(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Modal height animation setup
  const windowHeight = Dimensions.get("window").height;
  const halfHeight = windowHeight * 0.5;
  const fullHeight = windowHeight * 0.9;
  const panY = useRef(new Animated.Value(halfHeight)).current;
  const swipeHandleRef = useRef(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isScrolling,
      onPanResponderMove: (_, gestureState) => {
        const newValue = Math.max(
          0,
          Math.min(fullHeight, halfHeight + gestureState.dy)
        );
        panY.setValue(newValue);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          Animated.spring(panY, {
            toValue: fullHeight,
            useNativeDriver: false,
          }).start(() => onClose());
        } else if (gestureState.dy < -100) {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        } else {
          Animated.spring(panY, {
            toValue: halfHeight,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  // Keyboard handling
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        Animated.spring(panY, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  const enrichWithReplies = async (comments) => {
    const withReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await fetchReplies(supabase, comment.id);
        return { ...comment, replies: replies || [] };
      })
    );
    return withReplies;
  };

  useEffect(() => {
    if (isVisible && user) {
      setLoading(true);
      fetchCommentsByPost(supabase, post_id, post_type)
        .then(enrichWithReplies)
        .then((enrichedComments) => {
          setComments(enrichedComments);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching comments:", error);
          setLoading(false);
        });
    }
  }, [isVisible, post_id, post_type, user]);

  if (!isVisible || !user) return null;

  const handleDeleteComment = async (commentId) => {
    Alert.alert(
      "Delete Comment",
      "Are you sure you want to delete this comment? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeletingComments((prev) => new Set([...prev, commentId]));

            try {
              const success = await deleteComment(supabase, commentId);

              if (success) {
                setComments((prev) =>
                  prev.filter((comment) => comment.id !== commentId)
                );
              } else {
                Alert.alert(
                  "Error",
                  "Failed to delete comment. Please try again."
                );
              }
            } catch (error) {
              console.error("Error deleting comment:", error);
              Alert.alert(
                "Error",
                "Failed to delete comment. Please try again."
              );
            } finally {
              setDeletingComments((prev) => {
                const newSet = new Set(prev);
                newSet.delete(commentId);
                return newSet;
              });
            }
          },
        },
      ]
    );
  };

  const handleDeleteReply = async (commentId, replyId) => {
    Alert.alert(
      "Delete Reply",
      "Are you sure you want to delete this reply? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeletingReplies((prev) => new Set([...prev, replyId]));

            try {
              const success = await deleteComment(supabase, replyId);

              if (success) {
                setComments((prev) =>
                  prev.map((comment) =>
                    comment.id === commentId
                      ? {
                          ...comment,
                          replies:
                            comment.replies?.filter(
                              (reply) => reply.id !== replyId
                            ) || [],
                        }
                      : comment
                  )
                );
              } else {
                Alert.alert(
                  "Error",
                  "Failed to delete reply. Please try again."
                );
              }
            } catch (error) {
              console.error("Error deleting reply:", error);
              Alert.alert("Error", "Failed to delete reply. Please try again.");
            } finally {
              setDeletingReplies((prev) => {
                const newSet = new Set(prev);
                newSet.delete(replyId);
                return newSet;
              });
            }
          },
        },
      ]
    );
  };

  const handleAddComment = async () => {
    // Prevent multiple submissions
    if (isSubmittingComment || newComment.trim() === "") return;

    setIsSubmittingComment(true);
    try {
      const created = await createComment({
        supabase,
        postId: post_id,
        postType: post_type,
        userId: user.id,
        content: newComment,
      });

      if (created) {
        setComments([
          {
            ...created,
            replies: [],
            user: {
              id: user?.id,
              first_name: user?.firstName,
              last_name: user?.lastName,
              image_url: user?.imageUrl,
            },
          },
          ...comments,
        ]);
        setNewComment("");
        Keyboard.dismiss();

        // Send push notification
        try {
          const { data, error } = await supabase
            .from("user_notifications_tokens")
            .select("token")
            .eq("id", post_owner_id)
            .single();

          if (error) {
            console.error("Error fetching token:", error);
            return;
          }

          if (user?.id === post_owner_id) return;

          if (data?.token) {
            await sendPushNotification(
              data.token,
              `${user.firstName} ${user.lastName} commented on your post 💬`,
              `${newComment}`
            );
          } else {
            console.warn("No push token found for post owner.");
          }
        } catch (e) {
          console.error("Error sending push notification after comment:", e);
        }
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleAddReply = async (commentId) => {
    // Prevent multiple submissions
    if (isSubmittingReply || replyText.trim() === "") return;

    setIsSubmittingReply(true);
    try {
      const created = await createComment({
        supabase,
        postId: post_id,
        postType: post_type,
        userId: user.id,
        content: replyText,
        parentId: commentId,
      });

      if (created) {
        const replyWithUser = {
          ...created,
          user: {
            id: user?.id,
            first_name: user?.firstName,
            last_name: user?.lastName,
            image_url: user?.imageUrl,
          },
        };

        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  replies: [...(comment.replies || []), replyWithUser],
                }
              : comment
          )
        );
        setReplyingTo(null);
        setReplyText("");
        Keyboard.dismiss();
      }
    } catch (error) {
      console.error("Error adding reply:", error);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const renderReplies = (comment) =>
    comment.replies?.length > 0 && (
      <View className="mt-3 pl-4 border-l-2 border-gray-100">
        {comment.replies.map((reply) => (
          <View key={reply.id} className="mt-3 mb-2">
            <View className="flex-row">
              <Image
                source={{ uri: reply.user?.image_url }}
                className="w-8 h-8 rounded-full"
              />
              <View className="flex-1 ml-2">
                <View className="flex-row items-center justify-between">
                  <Text className="font-bold text-xs">
                    {reply.user?.first_name} {reply.user?.last_name}
                  </Text>
                  {post_owner_id === user?.id && (
                    <TouchableOpacity
                      onPress={() => handleDeleteReply(comment.id, reply.id)}
                      disabled={deletingReplies.has(reply.id)}
                      className="p-1"
                    >
                      {deletingReplies.has(reply.id) ? (
                        <ActivityIndicator size="small" color="#EF4444" />
                      ) : (
                        <MaterialCommunityIcons
                          name="delete-outline"
                          size={16}
                          color="#EF4444"
                        />
                      )}
                    </TouchableOpacity>
                  )}
                </View>
                <Box className="bg-gray-50 rounded-lg p-2 mt-1">
                  <Text className="text-gray-800 text-xs">{reply.content}</Text>
                </Box>
              </View>
            </View>
          </View>
        ))}
      </View>
    );

  const renderComment = (comment) => {
    if (!comment || !comment.user) return null;

    return (
      <View key={comment.id} className="mb-5 border-b border-gray-100 pb-4">
        <View className="flex-row">
          <Image
            source={{
              uri: comment.user.image_url,
            }}
            className="w-10 h-10 rounded-full"
          />
          <View className="flex-1 ml-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Text className="font-bold text-sm">
                  {comment.user.first_name} {comment.user.last_name}
                </Text>
              </View>
              {comment.user.id === user?.id && (
                <TouchableOpacity
                  onPress={() => handleDeleteComment(comment.id)}
                  disabled={deletingComments.has(comment.id)}
                  className="p-1"
                >
                  {deletingComments.has(comment.id) ? (
                    <ActivityIndicator size="small" color="#EF4444" />
                  ) : (
                    <MaterialCommunityIcons
                      name="delete-outline"
                      size={18}
                      color="#EF4444"
                    />
                  )}
                </TouchableOpacity>
              )}
            </View>
            <Box className="bg-gray-50 rounded-lg p-3 mt-2">
              <Text className="text-gray-800">{comment.content}</Text>
            </Box>
            <View className="flex-row mt-2 justify-between">
              <TouchableOpacity
                onPress={() => {
                  setReplyingTo(comment.id);
                  setReplyText("");
                }}
                className="flex-row items-center"
                disabled={isSubmittingReply}
              >
                <MaterialCommunityIcons
                  name="reply"
                  size={14}
                  color="#6B7280"
                />
                <Text className="text-xs text-gray-500 ml-1 font-medium">
                  Reply
                </Text>
              </TouchableOpacity>
            </View>
            {renderReplies(comment)}
          </View>
        </View>
      </View>
    );
  };

  const replyingToComment = replyingTo
    ? comments.find((comment) => comment.id === replyingTo)
    : null;

  return (
    <SafeAreaView className="flex-1">
      <Pressable
        onPress={onClose}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
      >
        <View className="flex-1 w-screen">
          <Box
            {...panResponder.panHandlers}
            ref={swipeHandleRef}
            className="flex-column items-center justify-between p-4 border-b border-gray-200 bg-white"
          >
            <View className="border-2 border-gray-400 w-12" />
            <Text className="font-semibold text-xl mt-2">
              {replyingTo ? "Reply to Comment" : "Comments"}
            </Text>
            {replyingTo && (
              <TouchableOpacity
                onPress={() => setReplyingTo(null)}
                className="absolute right-4 top-4"
                disabled={isSubmittingReply}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color="#6B7280"
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={onClose}
              className="absolute right-4 top-4"
            >
              <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </Box>

          {replyingTo ? (
            <View className="flex-1">
              {replyingToComment && (
                <Box className="p-4 border-b border-gray-100 bg-gray-50">
                  <View className="flex-row">
                    <Image
                      source={{
                        uri: replyingToComment.user.image_url,
                      }}
                      className="w-10 h-10 rounded-full"
                    />
                    <View className="flex-1 ml-3">
                      <View className="flex-row items-center">
                        <Text className="font-bold text-sm">
                          {replyingToComment.user.first_name}{" "}
                          {replyingToComment.user.last_name}
                        </Text>
                      </View>
                      <Box className="bg-white rounded-lg p-3 mt-2 border border-gray-100">
                        <Text className="text-gray-800">
                          {replyingToComment.content}
                        </Text>
                      </Box>
                    </View>
                  </View>
                </Box>
              )}
              <View className="p-4 border-t border-gray-200 bg-white">
                <View className="flex-row items-center">
                  <Image
                    source={user?.imageUrl ? { uri: user.imageUrl } : undefined}
                    className="w-10 h-10 rounded-full"
                  />
                  <Box className="flex-1 ml-3">
                    <Input
                      variant="rounded"
                      className="bg-gray-50 rounded-full"
                      size="sm"
                    >
                      <InputField
                        placeholder={`Reply to ${replyingToComment?.user.first_name}...`}
                        value={replyText}
                        onChangeText={setReplyText}
                        editable={!isSubmittingReply}
                      />
                    </Input>
                  </Box>
                  <TouchableOpacity
                    onPress={() => handleAddReply(replyingTo)}
                    disabled={replyText.trim() === "" || isSubmittingReply}
                    className={`ml-3 ${
                      replyText.trim() === "" || isSubmittingReply
                        ? "bg-gray-300"
                        : "bg-blue-500"
                    } rounded-full p-2.5 min-w-[44px] min-h-[44px] items-center justify-center`}
                  >
                    {isSubmittingReply ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <MaterialCommunityIcons
                        name="send"
                        size={18}
                        color="white"
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <View className="flex-1">
              <ScrollView
                className="flex-1 px-4 pt-2"
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                onTouchStart={() => setIsScrolling(true)}
                onTouchEnd={() => setIsScrolling(false)}
              >
                {loading ? (
                  <CommentListSkeleton count={3} />
                ) : comments.length > 0 ? (
                  comments.map(renderComment)
                ) : (
                  <View className="flex-1 items-center justify-center py-10">
                    <MaterialCommunityIcons
                      name="comment-outline"
                      size={40}
                      color="#D1D5DB"
                    />
                    <Text className="text-gray-400 mt-2">No comments yet</Text>
                    <Text className="text-gray-400 text-xs">
                      Be the first to comment
                    </Text>
                  </View>
                )}
                <View style={{ height: keyboardHeight > 0 ? 120 : 20 }} />
              </ScrollView>

              <Box className="p-4 border-t border-gray-200 bg-white">
                <View className="flex-row items-center">
                  <Image
                    source={user?.imageUrl ? { uri: user.imageUrl } : undefined}
                    className="w-10 h-10 rounded-full"
                  />
                  <View className="flex-1 ml-3">
                    <Input
                      variant="rounded"
                      className="bg-gray-50 rounded-full"
                      size="sm"
                    >
                      <InputField
                        placeholder="Add a comment..."
                        value={newComment}
                        className="mb-1"
                        onChangeText={setNewComment}
                        editable={!isSubmittingComment}
                      />
                    </Input>
                  </View>
                  <TouchableOpacity
                    onPress={handleAddComment}
                    disabled={newComment.trim() === "" || isSubmittingComment}
                    className={`ml-3 ${
                      newComment.trim() === "" || isSubmittingComment
                        ? "bg-gray-300"
                        : "bg-blue-500"
                    } rounded-full p-2.5 min-w-[44px] min-h-[44px] items-center justify-center`}
                  >
                    {isSubmittingComment ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <MaterialCommunityIcons
                        name="send"
                        size={18}
                        color="white"
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </Box>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
