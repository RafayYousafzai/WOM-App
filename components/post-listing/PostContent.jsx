import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

export const PostContent = ({
  title,
  description,
  recommendDish,
  post_type,
}) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  return (
    <View className="px-1 py-3">
      {/* <Text className="font-bold text-xl text-gray-900 mb-1">{title}</Text> */}
      <TouchableOpacity onPress={toggleDescription}>
        <Text
          className="text-gray-800 text-lg leading-5 font-semibold mb-1"
          numberOfLines={isDescriptionExpanded ? undefined : 2}
        >
          {description}
        </Text>{" "}
        {description.length > 80 && (
          <Text className="text-gray-500 text-sm mt-1">
            {isDescriptionExpanded ? "Show less" : "Show more"}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
