import { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import GoogleTextInput from "@/components/common/GooglePlacesInput";
import { RatingStars } from "../shared-components/rating-stars";
import { Input, InputField, Textarea, TextareaInput } from "@/components/ui";
import { useGlobal } from "@/context/globalContext";
import { Switch } from "react-native-paper";
import ImageEditor from "../ImageEditor";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export const Step1ImageSelection = ({
  restaurantData,
  setRestaurantData,
  handleChange,
}) => {
  const { selectedImages } = useGlobal();

  useEffect(() => {
    if (
      restaurantData.images.length === 0 &&
      selectedImages &&
      Array.isArray(selectedImages) &&
      selectedImages.length > 0
    ) {
      handleChange("images", selectedImages);
    }
  }, [restaurantData.images, selectedImages, handleChange]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView keyboardShouldPersistTaps="handled" className="flex-1 px-4">
          <ImageEditor data={restaurantData} setData={setRestaurantData} />

          <View className="mb-5">
            <View className="flex-row items-center justify-between p-4 bg-yellow-50 mb-6 rounded-lg shadow-sm">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-800">
                  Post as anonymous?
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  {restaurantData.anonymous
                    ? "Your identity will be hidden"
                    : "Your name will be shown"}
                </Text>
              </View>

              <Switch
                value={restaurantData.anonymous}
                onValueChange={() =>
                  handleChange("anonymous", !restaurantData.anonymous)
                }
                color="#f59e0b"
                style={{
                  transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
                  marginLeft: 8,
                }}
              />
            </View>

            <RatingStars
              rating={restaurantData.rating}
              setRating={(rating) => handleChange("rating", rating)}
            />
          </View>

          <Text className="text-sm text-gray-500 mb-1">Dish Name*</Text>
          <Input variant="rounded" size="md">
            <InputField
              value={restaurantData.dishName}
              onChangeText={(text) => handleChange("dishName", text)}
              placeholder="Enter dish name"
            />
          </Input>

          {/* Recommended Dishes */}
          <View className="mt-0">
            <View className="bg-[#f9fafb] mt-3 rounded-2xl border-2 border-gray-300 p-4 shadow-sm">
              <View className="flex-row justify-between items-center">
                <View className="flex-1 pr-3 pl-2">
                  <Text className="text-base font-medium text-gray-400">
                    Recommend this dish
                  </Text>
                  <Text className="text-sm text-gray-400 mt-1">
                    Help others discover great food
                  </Text>
                </View>
                <Switch
                  value={restaurantData.recommendDish}
                  onValueChange={(value) =>
                    handleChange("recommendDish", value)
                  }
                  color="#f59e0b"
                  style={{
                    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
                  }}
                />
              </View>
            </View>
          </View>

          <Text className="text-sm mt-3 text-gray-500 mb-1">
            Restaurant Name*
          </Text>
          <Input variant="rounded" size="md">
            <InputField
              value={restaurantData.restaurantName}
              onChangeText={(text) => handleChange("restaurantName", text)}
              placeholder="Enter restaurant name"
            />
          </Input>

          <View className="mb-2">
            <Text className="text-sm text-gray-500 mb-1">Price</Text>
            <Input variant="rounded" size="md">
              <InputField
                value={restaurantData.price}
                onChangeText={(text) => handleChange("price", text)}
                placeholder="Enter price"
                keyboardType="decimal-pad"
              />
            </Input>
          </View>

          <View>
            <Text className="text-sm text-gray-500 mb-1">Location*</Text>
            <GoogleTextInput
              containerStyle={{
                backgroundColor: "white",
                shadowColor: "#ccc",
              }}
              handlePress={(val) => handleChange("location", val)}
              initialLocation={restaurantData.location}
              textInputBackgroundColor="#f9fafb"
            />
          </View>

          {/* Review */}
          <View className="mb-4">
            <Text className="text-sm mt-3 text-gray-500 mb-1">Your Review</Text>
            <Textarea size="lg" className="bg-gray-50 rounded-3xl">
              <TextareaInput
                value={restaurantData.review}
                onChangeText={(text) => handleChange("review", text)}
                placeholder="Share your experience at this restaurant..."
                multiline
              />
            </Textarea>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
};
