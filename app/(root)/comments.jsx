import { router, useLocalSearchParams } from "expo-router";
import { CommentSection } from "../../components/post-listing/comments/CommentSection";
import { View } from "react-native";

export default function CommentsScreen() {
  const { post_id, post_owner_id } = useLocalSearchParams();

  return (
    <View className="flex-1">
      <CommentSection
        isVisible={true}
        onClose={() => router.back()}
        post_id={post_id}
        user_id={post_owner_id}
      />
    </View>
  );
}
