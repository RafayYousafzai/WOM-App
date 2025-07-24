import {
  View,
  Text,
  Image,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React from "react";

import GoogleTextInput from "@/components/common/GooglePlacesInput";
import LoadingAnimation from "@/components/common/LoadingAnimation";
import TagPeopleInput from "../../common/TagPeopleInput";
import { RatingStars } from "../review/rating-stars";
import TagInputWithSuggestions from "@/components/common/TagInputWithSuggestions";
import { Input, InputField, Textarea, TextareaInput } from "@/components/ui";
import { Switch } from "react-native-paper";
import {
  extractSuggestionsByCategory,
  FILTER_CATEGORIES,
} from "@/constants/SearchFilters";
import ImageEditor from "../ImageEditor";

const RenderStep2 = ({
  postData,
  setPostData,
  handleChange,
  peopleTags,
  setPeopleTags,
  hashtags,
  setHashtags,
  cuisineTags,
  setCuisineTags,
  dietaryTags,
  setDietaryTags,
  extraTags,
  setExtraTags,
  loading,
}) => {
  return (
    <View
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView keyboardShouldPersistTaps="handled" className="flex-1   ">
        <View className="flex-1">
          <ImageEditor data={postData} setData={setPostData} />
          <View className="flex-row items-center justify-between p-4 bg-yellow-50 mb-6 rounded-lg shadow-sm mx-2">
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-800">
                Post as anonymous
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                {postData.anonymous
                  ? "Your identity will be hidden"
                  : "Your name will be shown"}
              </Text>
            </View>

            <Switch
              value={postData.anonymous}
              onValueChange={() =>
                handleChange("anonymous", !postData.anonymous)
              }
              color="#f59e0b" // Indigo-600
              style={{
                transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
                marginLeft: 8,
              }}
            />
          </View>
          <View className="p-4">
            <RatingStars
              rating={postData.rating}
              setRating={(rating) => handleChange("rating", rating)}
            />
          </View>
          <View className="p-4 -mt-6">
            <Text className="text-base font-medium mb-1">Dish Name</Text>
            <Input variant="rounded" size="md" className="bg-gray-50">
              <InputField
                value={postData.caption}
                onChangeText={(text) => handleChange("caption", text)}
                placeholder="Write a caption..."
              />
            </Input>
          </View>
          <View className=" 3 px-4  h-36">
            <Text className="text-base  font-medium mb-1">Review</Text>
            <Textarea size="lg" className="bg-gray-50 rounded-3xl">
              <TextareaInput
                value={postData.review}
                onChangeText={(text) => handleChange("review", text)}
                placeholder="Write a review..."
              />
            </Textarea>
          </View>
          {/* Location Input */}
          <View className="px-4 mt-10 ">
            <Text className="text-base  font-medium mb-1 ">Add Location</Text>
            <GoogleTextInput
              containerStyle={{ backgroundColor: "white", shadowColor: "#ccc" }}
              handlePress={(val) => handleChange("location", val)}
              initialLocation={postData.location}
              textInputBackgroundColor="#f9fafb"
            />
          </View>
          {/* Tag People */}
          <View className="px-4 ">
            <Text className="text-base  font-medium mb-1">Tag People</Text>
            <TagPeopleInput
              tags={peopleTags}
              setTags={setPeopleTags}
              title="Who's with you?"
            />{" "}
          </View>
          {/* Cuisine Types */}
          <View className="px-4 ">
            <Text className="text-base font-medium mb-1 ">Cuisine Types</Text>
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
          {/* Hashtags */}
          <View className="px-4 ">
            <Text className="text-base font-medium mb-1">Hashtags</Text>
            <TagInputWithSuggestions
              tags={hashtags}
              setTags={setHashtags}
              title="Add hashtags (e.g., delicious, family-friendly)..."
              sc="#"
            />
          </View>
          {/* Dietary */}
          <View className="px-4 ">
            <Text className="text-base font-medium mb-1">Dietary</Text>
            <TagInputWithSuggestions
              tags={dietaryTags}
              setTags={setDietaryTags}
              title="Add dietary restrictions (e.g., gluten-free, vegan)"
              sc="#"
              suggestions={extractSuggestionsByCategory(FILTER_CATEGORIES).food}
            />
          </View>
          {/* Information */}
          <View className="px-4 ">
            <Text className="text-base font-medium mb-1">More Information</Text>
            <TagInputWithSuggestions
              tags={extraTags}
              setTags={setExtraTags}
              title="Add hashtags (e.g., delicious, family-friendly)..."
              sc="#"
              suggestions={
                extractSuggestionsByCategory(FILTER_CATEGORIES).extras
              }
            />
          </View>
        </View>

        <View style={{ height: 100 }}></View>

        {/* Loading Overlay */}
        {loading && (
          <View className="absolute inset-0 bg-white bg-opacity-20 items-center justify-center">
            <LoadingAnimation size={170} />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default RenderStep2;
