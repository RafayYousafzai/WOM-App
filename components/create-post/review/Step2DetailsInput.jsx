import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import TagPeopleInput from "../../common/TagPeopleInput";
import TagInputWithSuggestions from "@/components/common/TagInputWithSuggestions";
import { useReview } from "@/context/reviewContext";

export const Step2DetailsInput = () => {
  const { reviewData, setReviewData, setTagsWrapper, tags } = useReview();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView className="flex-1">
        <View className="p-4 ">
          <Text className="text-base font-medium mb-1">Tag People</Text>
          <TagPeopleInput
            tags={reviewData.peoplesTags}
            setTags={setTagsWrapper("peoplesTags")}
            title="Who's with you?"
          />
        </View>

        <View className="p-4 ">
          <Text className="text-base font-medium mb-1">Cuisine Types</Text>
          <TagInputWithSuggestions
            tags={reviewData.cuisineTags}
            setTags={setTagsWrapper("cuisineTags")}
            title="Add cuisine types (e.g., Italian, Mexican)..."
            sc="#"
            suggestions={tags.cuisine}
          />
        </View>

        <View className="p-4 ">
          <Text className="text-base font-medium mb-1">Amenities</Text>
          <TagInputWithSuggestions
            tags={reviewData.amenityTags}
            setTags={setTagsWrapper("amenityTags")}
            title="Add amenities (e.g., Outdoor, Wi-Fi)"
            sc="#"
            suggestions={tags.amenity}
          />
        </View>

        <View className="p-4 ">
          <Text className="text-base font-medium mb-1">Dietary Options</Text>
          <TagInputWithSuggestions
            tags={reviewData.dietaryTags}
            setTags={setTagsWrapper("dietaryTags")}
            title="Add dietary restrictions (e.g., gluten-free, vegan)"
            sc="#"
            suggestions={tags.dietary}
          />
        </View>

        <View className="h-32">
          <View className="h-32" />
          <View className="h-32" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
