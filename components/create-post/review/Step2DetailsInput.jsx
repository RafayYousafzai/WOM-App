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
import { Switch, Title } from "react-native-paper";

export const Step2DetailsInput = () => {
  const { reviewData, setReviewData, setTagsWrapper, tags, handleChange } =
    useReview();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView className="flex-1">
        <Title
          style={{
            fontSize: 32,
            fontWeight: "bold",
            color: "#1f2937",
            marginVertical: 16,
            letterSpacing: -0.5,
            marginLeft: 16,
          }}
        >
          More Information
        </Title>

        <View className="px-4 ">
          <TagPeopleInput
            tags={reviewData.peoplesTags}
            setTags={setTagsWrapper("peoplesTags")}
            title="Who's with you?"
          />
        </View>

        <View className="px-4 ">
          <TagInputWithSuggestions
            tags={reviewData.cuisineTags}
            setTags={setTagsWrapper("cuisineTags")}
            title="Add cuisine types (e.g., Italian, Mexican)..."
            sc="#"
            suggestions={tags.cuisine}
          />
        </View>

        <View className="px-4 ">
          <TagInputWithSuggestions
            tags={reviewData.amenityTags}
            setTags={setTagsWrapper("amenityTags")}
            title="Add amenities (e.g., Outdoor, Wi-Fi)"
            sc="#"
            suggestions={tags.amenity}
          />
        </View>

        <View className="px-4 ">
          <TagInputWithSuggestions
            tags={reviewData.dietaryTags}
            setTags={setTagsWrapper("dietaryTags")}
            title="Add dietary restrictions (e.g., gluten-free, vegan)"
            sc="#"
            suggestions={tags.dietary}
          />
        </View>

        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View
            style={{
              elevation: 6,
              borderRadius: 20,
              backgroundColor: "#f9fafb",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 20,
              }}
            >
              <View style={{ flex: 1, marginRight: 16 }}>
                <Text className="text-xl text-gray-400">
                  Post as anonymous?
                </Text>
              </View>
              <Switch
                value={reviewData.anonymous}
                onValueChange={() =>
                  handleChange("anonymous", !reviewData.anonymous)
                }
                color="#f59e0b"
                style={{
                  transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }],
                }}
              />
            </View>
          </View>
        </View>

        <View className="h-32">
          <View className="h-32" />
          <View className="h-32" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
