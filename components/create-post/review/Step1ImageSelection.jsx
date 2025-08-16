import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import GoogleTextInput from "@/components/common/GooglePlacesInput";
import { Input, InputField, Textarea, TextareaInput } from "@/components/ui";
import { Switch } from "react-native-paper";
import ImageEditor from "../ImageEditor";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Plus } from "lucide-react-native";
import { DishTypeModal } from "../shared-components/DishTypeModal";
import { DishTabs } from "../shared-components/DishTabs";
import { DishForm } from "../shared-components/DishForm";
import { useReview } from "@/context/reviewContext";

export const Step1ImageSelection = () => {
  const {
    restaurantData,
    handleChange,
    removeImage,
  } = useReview();
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("main-course");

  const handleAddDishType = (type) => {
    const newDish = {
      ...type,
      dishName: "",
      recommendDish: false,
      price: "",
      rating: 0,
      images: [],
    };

    const newDishTypes = [...restaurantData.dishTypes, newDish];
    handleChange("dishTypes", newDishTypes);
    setActiveTab(type.id);
    setShowModal(false);
  };

  const handleRemoveTab = (tabId) => {
    const newDishTypes = restaurantData.dishTypes.filter(
      (dish) => dish.id !== tabId
    );
    handleChange("dishTypes", newDishTypes);
    if (activeTab === tabId) {
      setActiveTab("main-course");
    }
  };

  const handleDishChange = (field, value) => {
    const newDishTypes = restaurantData.dishTypes.map((dish) =>
      dish.id === activeTab ? { ...dish, [field]: value } : dish
    );
    handleChange("dishTypes", newDishTypes);
  };

  const handleDishImagesChange = (images) => {
    const newDishTypes = restaurantData.dishTypes.map((dish) =>
      dish.id === activeTab ? { ...dish, images } : dish
    );
    handleChange("dishTypes", newDishTypes);
  };

  const getCurrentDish = () => {
    return (
      restaurantData.dishTypes.find((dish) => dish.id === activeTab) || {
        id: "main-course",
        name: "Main Course",
        dishName: "",
        recommendDish: false,
        price: "",
        rating: 0,
        images: [],
      }
    );
  };

  useEffect(() => {
    const allImages = restaurantData.dishTypes.flatMap((dish) => dish.images);
    handleChange("images", allImages);
  }, [restaurantData.dishTypes]);

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
          <DishTabs
            dishTypes={restaurantData.dishTypes}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onAddDish={() => setShowModal(true)}
            onRemoveTab={handleRemoveTab}
          />
          <View className="relative">
            <ImageEditor
              data={getCurrentDish()}
              setData={(updater) => {
                if (typeof updater === "function") {
                  const currentDish = getCurrentDish();
                  const updatedDish = updater(currentDish);
                  handleDishImagesChange(updatedDish.images);
                } else {
                  handleDishImagesChange(updater.images);
                }
              }}
            />
          </View>

          <DishForm
            dishData={getCurrentDish()}
            onDishChange={handleDishChange}
          />

          <View className="px-4">
            <Text className="text-sm mt-3 text-gray-500 mb-1">Location</Text>
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

          <View className="px-4 mb-4">
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
          <View className="px-4 mb-5">
            <View className="flex-row items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-white mb-6 rounded-2xl shadow-sm border border-yellow-200/50">
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
