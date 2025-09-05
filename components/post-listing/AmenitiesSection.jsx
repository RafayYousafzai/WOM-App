import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import snakeCaseToSentence from "@/utils/snakeCaseToSentence";

export const AmenitiesSection = ({
  amenities,
  post_type,
  showDiff,
  recommend_dsh,
  spc,
}) => {
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  const toggleAmenities = () => {
    setShowAllAmenities(!showAllAmenities);
  };

  // Normalize amenities to always have { name, type }
  const normalizedAmenities = amenities.map((amenity) => {
    if (typeof amenity === "string") {
      return { name: amenity, type: "generic" };
    }
    if (amenity?.tags) {
      return { ...amenity.tags };
    }
    return amenity;
  });

  const displayedAmenities = showAllAmenities
    ? normalizedAmenities
    : normalizedAmenities.slice(0, 3);

  return (
    <View className="px-1 pb-0">
      <View className="flex-row flex-wrap">
        {showDiff && post_type === "own_review" && (
          <TouchableOpacity className="flex-row items-center justify-center px-2 py-1 rounded-full bg-[#f39f1e] mr-2 mb-2">
            <Text className="text-white text-xs">Home Dish</Text>
          </TouchableOpacity>
        )}

        {recommend_dsh && (
          <TouchableOpacity className="flex-row items-center justify-center px-2 py-1 rounded-full bg-[#f39f1e] mr-2 mb-2">
            <Text className="text-white text-xs">Recommended</Text>
          </TouchableOpacity>
        )}

        {displayedAmenities?.map((amenity, index) => (
          <TouchableOpacity
            key={`${amenity.id || amenity.name}-${index}`}
            className="flex-row items-center justify-center px-2 py-1 rounded-full bg-gray-100 mr-2 mb-2"
          >
            <Text className="text-gray-700 text-xs">
              {spc}
              {snakeCaseToSentence(amenity.name)}
            </Text>
          </TouchableOpacity>
        ))}

        {normalizedAmenities.length > 3 && (
          <TouchableOpacity
            onPress={toggleAmenities}
            className="flex-row items-center justify-center px-2 py-1 rounded-full bg-gray-100 mr-2 mb-2"
          >
            <Text className="text-gray-700 text-xs">
              {showAllAmenities
                ? "Show less"
                : `+${normalizedAmenities.length - 3} more`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
