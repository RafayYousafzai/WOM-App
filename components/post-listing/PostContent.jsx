import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

export const PostContent = ({
  title,
  description,
  recommendDish,
  post_type,
  location,
  postTimeAgo,
}) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  return (
    <View className="px-1 pt-2">
      <TouchableOpacity onPress={toggleDescription}>
        <Text
          className="text-gray-800 text-lg leading-5 font-semibold"
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

      {/* Location at bottom with nice styling */}
      <View className=" border-t border-gray-100">
        <View className="flex-row items-center">
          <Text className="text-gray-600 text-sm flex-1" numberOfLines={1}>
            <Text className="font-semibold text-gray-500">{postTimeAgo}</Text>
          </Text>
        </View>
        {/* <View className="flex-row items-center">
          {(() => {
            const [firstPart, ...rest] = (location || "").split(",");
            return (
              <Text className="text-gray-600 text-sm flex-1" numberOfLines={1}>
                <Text className="font-semibold text-gray-800">{firstPart}</Text>
                {rest.length > 0 && (
                  <Text className="text-gray-500">{`, ${rest.join(",")}`}</Text>
                )}
              </Text>
            );
          })()}
        </View> */}
      </View>
    </View>
  );
};
