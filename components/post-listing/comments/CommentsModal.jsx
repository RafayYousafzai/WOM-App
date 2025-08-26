import { View, Image, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";

export default function CommentsModal({
  post_id,
  user_id: post_owner_id,
  commentCount,
}) {
  return (
    <View className="flex-row items-center justify-center">
      <TouchableOpacity
        onPress={() =>
          router.push(
            `/comments?post_id=${post_id}&post_owner_id=${post_owner_id}`
          )
        }
        className="mr-4 relative flex-row items-center justify-center"
      >
        <Image
          source={require("@/assets/icons/comment.png")}
          className="w-7 h-7"
        />

        {commentCount > 0 && (
          <Text className="text-gray-600 text-md font-semibold text-center ml-2">
            {commentCount}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
