import React from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import TagPeopleInput from "../../common/TagPeopleInput";
import TagInputWithSuggestions from "@/components/common/TagInputWithSuggestions";
import {
  extractSuggestionsByCategory,
  FILTER_CATEGORIES,
} from "@/constants/SearchFilters";
import ImageEditor from "../ImageEditor";

export const Step2DetailsInput = ({
  restaurantData,
  cuisineTags,
  setCuisineTags,
  amenityTags,
  setAmenityTags,
  dietaryTags,
  setDietaryTags,
  peoplesTags,
  setPeoplesTags,
  setRestaurantData,
}) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView className="flex-1">
        {/* Restaurant Preview */}
        <ImageEditor data={restaurantData} setData={setRestaurantData} />

        {/* Peoples Types */}
        <View className="p-4 ">
          <Text className="text-base font-medium mb-1">Tag People</Text>
          <TagPeopleInput
            tags={peoplesTags}
            setTags={setPeoplesTags}
            title="Who's with you?"
          />
        </View>

        {/* Cuisine Types */}
        <View className="p-4 ">
          <Text className="text-base font-medium mb-1">Cuisine Types</Text>
          <TagInputWithSuggestions
            tags={cuisineTags}
            setTags={setCuisineTags}
            title="Add cuisine types (e.g., Italian, Mexican)..."
            sc="#"
            suggestions={
              extractSuggestionsByCategory(FILTER_CATEGORIES).cuisine
            }
          />
        </View>
        {/* Amenities */}
        <View className="p-4 ">
          <Text className="text-base font-medium mb-1">Amenities</Text>
          <TagInputWithSuggestions
            tags={amenityTags}
            setTags={setAmenityTags}
            title="Add amenities (e.g., Outdoor, Wi-Fi)"
            sc="#"
            suggestions={
              extractSuggestionsByCategory(FILTER_CATEGORIES).amenities
            }
          />
        </View>
        {/* Dietary  */}
        <View className="p-4 ">
          <Text className="text-base font-medium mb-1">Dietary Options</Text>
          <TagInputWithSuggestions
            tags={dietaryTags}
            setTags={setDietaryTags}
            title="Add dietary restrictions (e.g., gluten-free, vegan)"
            sc="#"
            suggestions={extractSuggestionsByCategory(FILTER_CATEGORIES).food}
          />
        </View>
        {/* Extra  */}
        {/* <View className="p-4 ">
          <Text className="text-base font-medium mb-1">Extras Information</Text>
          <TagInputWithSuggestions
            tags={extraTags}
            setTags={setExtraTags}
            title="Extra Info (e.g., cleanliness, ambiance etc.)"
            sc="#"
            suggestions={extractSuggestionsByCategory(FILTER_CATEGORIES).extras}
          />
        </View> */}

        <View className="h-32">
          <View className="h-32" />
          <View className="h-32" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
