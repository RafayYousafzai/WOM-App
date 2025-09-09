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
import { RatingStars } from "../shared-components/rating-stars";
import { useReview } from "@/context/reviewContext";
import { Switch, Title } from "react-native-paper";

export const Step2DetailsInput = () => {
  const { reviewData, setReviewData, setTagsWrapper, tags, handleChange } =
    useReview();

  // Helper function to handle rating changes
  const handleRatingChange = (field, value) => {
    handleChange(field, value);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-50"
    >
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header Section */}
        <View className="bg-white px-6 pb-8 shadow-sm">
          <Title
            style={{
              fontSize: 28,
              fontWeight: "700",
              color: "#1f2937",
              marginBottom: 4,
              letterSpacing: -0.5,
            }}
          >
            Additional Information
          </Title>
          <Text className="text-gray-600 text-base">
            Help others discover this place by adding more details
          </Text>
        </View>

        {/* Social Section */}
        <View className="bg-white mx-4 mb-4 rounded-xl shadow-sm">
          <View className="p-2">
            <View className="flex-row items-center mb-4">
              <View className="w-1 h-6 bg-yellow-500 rounded-full mr-3" />
              <Text className="text-lg font-semibold text-gray-900">
                Social Information
              </Text>
            </View>
            <TagPeopleInput
              tags={reviewData.peoplesTags}
              setTags={setTagsWrapper("peoplesTags")}
              title="Who's with you?"
            />
          </View>
        </View>

        {/* Restaurant Details Section */}
        {reviewData.is_review === "restaurant" && (
          <View className="bg-white mx-4 mb-4 rounded-xl shadow-sm">
            <View className="p-3">
              <View className="flex-row items-center mb-6">
                <View className="w-1 h-6 bg-yellow-500 rounded-full mr-3" />
                <Text className="text-lg font-semibold text-gray-900">
                  Restaurant Details
                </Text>
              </View>

              <View className="space-y-6">
                <TagInputWithSuggestions
                  tags={reviewData.cuisineTags}
                  setTags={setTagsWrapper("cuisineTags")}
                  title="Cuisine types (e.g., Italian, Mexican)"
                  sc="#"
                  suggestions={tags.cuisine}
                />

                <TagInputWithSuggestions
                  tags={reviewData.amenityTags}
                  setTags={setTagsWrapper("amenityTags")}
                  title="Amenities (e.g., Outdoor seating, Wi-Fi)"
                  sc="#"
                  suggestions={tags.amenity}
                />

                <TagInputWithSuggestions
                  tags={reviewData.dietaryTags}
                  setTags={setTagsWrapper("dietaryTags")}
                  title="Dietary options (e.g., Gluten-free, Vegan)"
                  sc="#"
                  suggestions={tags.dietary}
                />
              </View>
            </View>
          </View>
        )}
        {/* Rating Section - Only for restaurants */}
        {reviewData.is_review === "restaurant" && (
          <View className="bg-white mx-4 mb-4 rounded-xl shadow-sm">
            <View className="p-6">
              <View className="flex-row items-center mb-6">
                <View className="w-1 h-6 bg-yellow-500 rounded-full mr-3" />
                <Text className="text-lg font-semibold text-gray-900">
                  Detailed Ratings
                </Text>
              </View>

              <View className="space-y-6">
                <RatingStars
                  rating={reviewData.staffRating || 0}
                  setRating={(value) =>
                    handleRatingChange("staffRating", value)
                  }
                  title="Staff Service (Optional)"
                />

                <RatingStars
                  rating={reviewData.cleanliness || 0}
                  setRating={(value) =>
                    handleRatingChange("cleanliness", value)
                  }
                  title="Cleanliness (Optional)"
                />

                <RatingStars
                  rating={reviewData.ambiance || 0}
                  setRating={(value) => handleRatingChange("ambiance", value)}
                  title="Ambiance (Optional)"
                />
              </View>
            </View>
          </View>
        )}

        {/* Privacy Section */}
        <View className="bg-white mx-4 mb-4 rounded-xl shadow-sm">
          <View className="p-6">
            <View className="flex-row items-center mb-4">
              <View className="w-1 h-6 bg-purple-500 rounded-full mr-3" />
              <Text className="text-lg font-semibold text-gray-900">
                Privacy Settings
              </Text>
            </View>

            <View className="bg-gray-50 mb-4 rounded-lg p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-4">
                  <Text className="text-xl font-medium text-gray-900 mb-1">
                    Post anonymously
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Your profile won't be visible on this review
                  </Text>
                </View>
                <Switch
                  value={reviewData.anonymous}
                  onValueChange={() =>
                    handleChange("anonymous", !reviewData.anonymous)
                  }
                  trackColor={{ false: "#e5e7eb", true: "#fbbf24" }}
                  thumbColor={reviewData.anonymous ? "#f59e0b" : "#9ca3af"}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Help Text */}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
