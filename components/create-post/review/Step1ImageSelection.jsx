import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import GoogleTextInput from "@/components/common/GooglePlacesInput";
import { Textarea, TextareaInput } from "@/components/ui";
import { Switch } from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DishTypeModal } from "../shared-components/DishTypeModal";
import { DishTabs } from "../shared-components/DishTabs";
import { DishForm } from "../shared-components/DishForm";
import { useReview } from "@/context/reviewContext";
import { useGlobal } from "@/context/globalContext";
import { RatingStars } from "../shared-components/rating-stars";

export const Step1ImageSelection = () => {
  const {
    reviewData,
    handleChange,
    handleAddDishType,
    handleDishChange,
    getCurrentDish,
    showModal,
    setShowModal,
  } = useReview();
  const { postType } = useGlobal();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          className="flex-1 relative"
        >
          <Text className="text-4xl mt-4 font-bold text-gray-800 mb-4 px-4">
            Dish Information
          </Text>

          <DishTabs />

          <DishForm
            dishData={getCurrentDish()}
            onDishChange={handleDishChange}
          />
          <Text className="text-4xl mt-4 font-bold text-gray-800 mb-4 px-4">
            Restaurant Information
          </Text>

          <View className="px-4">
            <Text className="text-sm mt-3 text-gray-500 mb-1">Location</Text>
            <GoogleTextInput
              containerStyle={{
                backgroundColor: "white",
                shadowColor: "#ccc",
              }}
              handlePress={(val) => handleChange("location", val)}
              initialLocation={reviewData.location}
              textInputBackgroundColor="#f9fafb"
            />
          </View>

          <View className="px-4 mb-4">
            <Text className="text-sm mt-3 text-gray-500 mb-1">Your Review</Text>
            <Textarea size="lg" className="bg-gray-50 rounded-3xl">
              <TextareaInput
                value={reviewData.review}
                onChangeText={(text) => handleChange("review", text)}
                placeholder="Share your experience at this restaurant..."
                multiline
              />
            </Textarea>
          </View>

          {postType === "homemade" && (
            <RatingStars
              rating={reviewData.rating}
              setRating={(rating) => handleChange("rating", rating)}
            />
          )}

          <View className="px-4 mb-5">
            <View className="flex-row items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-white mb-6 rounded-2xl shadow-sm border border-yellow-200/50">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-800">
                  Post as anonymous?
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  {reviewData.anonymous
                    ? "Your identity will be hidden"
                    : "Your name will be shown"}
                </Text>
              </View>
              <Switch
                value={reviewData.anonymous}
                onValueChange={() =>
                  handleChange("anonymous", !reviewData.anonymous)
                }
                color="#f59e0b"
                style={{
                  transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
                  marginLeft: 8,
                }}
              />
            </View>
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
      <DishTypeModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSelectType={handleAddDishType}
      />
    </GestureHandlerRootView>
  );
};
