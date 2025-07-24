import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Dimensions,
  Keyboard,
  Pressable,
  TextInput,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  fetchCommentsByPost,
  createComment,
  fetchReplies,
} from "@/lib/supabase/commentsActions";
import { useUser } from "@clerk/clerk-expo";
import { useSupabase } from "@/context/supabaseContext";
import { sendPushNotification } from "@/lib/notifications/sendPushNotification";
import { SafeAreaView } from "react-native-safe-area-context";
import { CommentListSkeleton } from "@/components/PageSkeletons/CommentSkeleton";

export const CommentSectionForAndroid = ({
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
  const [loading, setLoading] = useState(true); // Add loading state

  // Modal height animation setup
  const windowHeight = Dimensions.get("window").height;
  const swipeHandleRef = useRef(null);

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
      setLoading(true); // Set loading to true when fetching starts
      fetchCommentsByPost(supabase, post_id, post_type)
        .then(enrichWithReplies)
        .then((enrichedComments) => {
          setComments(enrichedComments);
          setLoading(false); // Set loading to false when fetching is complete
        })
        .catch((error) => {
          console.error("Error fetching comments:", error);
          setLoading(false); // Ensure loading is false even on error
        });
    }
  }, [isVisible, post_id, post_type, user]);

  if (!isVisible || !user) return null;

  const handleAddComment = async () => {
    if (newComment.trim() === "") return;

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
  };

  const handleAddReply = async (commentId) => {
    if (replyText.trim() === "") return;

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
                <View className="flex-row items-center">
                  <Text className="font-bold text-xs">
                    {reply.user?.first_name} {reply.user?.last_name}
                  </Text>
                </View>
                <View className="bg-gray-50 rounded-lg p-2 mt-1">
                  <Text className="text-gray-800 text-xs">{reply.content}</Text>
                </View>
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
            </View>
            <View className="bg-gray-50 rounded-lg p-3 mt-2">
              <Text className="text-gray-800">{comment.content}</Text>
            </View>
            <View className="flex-row mt-2 justify-between">
              <TouchableOpacity
                onPress={() => {
                  setReplyingTo(comment.id);
                  setReplyText("");
                }}
                className="flex-row items-center"
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
    <View style={{ flex: 1, width: "100%" }} onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1 }}>
        {isVisible && (
          <Pressable
            onPress={onClose}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: windowHeight * 0.5, // or whatever the height of the modal is
            }}
          />
        )}

        <KeyboardAvoidingView behavior={"height"} style={{ flex: 1 }}>
          <View className="flex-1">
            <View
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
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>

            {replyingTo ? (
              <View className="flex-1">
                {replyingToComment && (
                  <View className="p-4 border-b border-gray-100 bg-gray-50">
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
                        <View className="bg-white rounded-lg p-3 mt-2 border border-gray-100">
                          <Text className="text-gray-800">
                            {replyingToComment.content}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}
                <View className="p-4 border-t border-gray-200 bg-white">
                  <View className="flex-row items-center">
                    <Image
                      source={
                        user?.imageUrl ? { uri: user.imageUrl } : undefined
                      }
                      className="w-10 h-10 rounded-full"
                    />
                    <View className="flex-1 ml-3">
                      <TextInput
                        placeholder={`Reply to ${replyingToComment?.user.first_name}...`}
                        value={replyText}
                        onChangeText={setReplyText}
                        style={{
                          backgroundColor: "#F9FAFB", // equivalent to bg-gray-50
                          borderRadius: 9999, // equivalent to rounded-full
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          fontSize: 16,
                        }}
                      />
                    </View>
                    <TouchableOpacity
                      onPress={() => handleAddReply(replyingTo)}
                      disabled={replyText.trim() === ""}
                      className={`ml-3 ${
                        replyText.trim() === "" ? "bg-gray-300" : "bg-blue-500"
                      } rounded-full p-2.5`}
                    >
                      <MaterialCommunityIcons
                        name="send"
                        size={18}
                        color="white"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : (
              <View className="flex-1">
                <ScrollView
                  className="flex-1 px-4 pt-2"
                  showsVerticalScrollIndicator={false}
                >
                  {loading ? (
                    <CommentListSkeleton count={3} /> // Render skeleton while loading
                  ) : comments.length > 0 ? (
                    comments.map(renderComment)
                  ) : (
                    <View className="flex-1 items-center justify-center py-10">
                      <MaterialCommunityIcons
                        name="comment-outline"
                        size={40}
                        color="#D1D5DB"
                      />
                      <Text className="text-gray-400 mt-2">
                        No comments yet
                      </Text>
                      <Text className="text-gray-400 text-xs">
                        Be the first to comment
                      </Text>
                    </View>
                  )}
                </ScrollView>
                <View className="p-4 border-t border-gray-200 bg-white">
                  <View className="flex-row items-center">
                    <Image
                      source={
                        user?.imageUrl ? { uri: user.imageUrl } : undefined
                      }
                      className="w-10 h-10 rounded-full"
                    />
                    <View className="flex-1 ml-3">
                      <TextInput
                        placeholder="Add a comment..."
                        value={newComment}
                        onChangeText={setNewComment}
                        style={{
                          backgroundColor: "#F9FAFB", // Tailwind's bg-gray-50
                          borderRadius: 9999, // Tailwind's rounded-full
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          fontSize: 16,
                          marginBottom: 4, // Tailwind's mb-1
                        }}
                      />
                    </View>
                    <TouchableOpacity
                      onPress={handleAddComment}
                      disabled={newComment.trim() === ""}
                      className={`ml-3 ${
                        newComment.trim() === "" ? "bg-gray-300" : "bg-blue-500"
                      } rounded-full p-2.5`}
                    >
                      <MaterialCommunityIcons
                        name="send"
                        size={18}
                        color="white"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};
