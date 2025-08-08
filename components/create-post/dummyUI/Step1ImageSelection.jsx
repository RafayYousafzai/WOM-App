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
import { useGlobal } from "@/context/globalContext";
import { Switch } from "react-native-paper";
import ImageEditor from "../ImageEditor";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Plus } from "lucide-react-native";
import { DishTypeModal } from "./DishTypeModal";
import { DishTabs } from "./DishTabs";
import { DishForm } from "./DishForm";

export const Step1ImageSelection = ({
  restaurantData,
  setRestaurantData,
  handleChange,
}) => {
  const { selectedImages } = useGlobal();
  const [showModal, setShowModal] = useState(false);
  const [dishTypes, setDishTypes] = useState([
    {
      id: "main-course",
      name: "Main Course",

      dishName: "",
      recommendDish: false,
      price: "",
      rating: 0,
    },
  ]);
  const [activeTab, setActiveTab] = useState("main-course");

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

  const handleAddDishType = (type) => {
    const newDish = {
      ...type,
      dishName: "",
      recommendDish: false,
      price: "",
      rating: 0,
    };

    setDishTypes((prev) => [...prev, newDish]);
    setActiveTab(type.id);
    setShowModal(false);
  };

  const handleRemoveTab = (tabId) => {
    setDishTypes((prev) => prev.filter((dish) => dish.id !== tabId));
    if (activeTab === tabId) {
      setActiveTab("main-course");
    }
  };

  const handleDishChange = (field, value) => {
    setDishTypes((prev) =>
      prev.map((dish) =>
        dish.id === activeTab ? { ...dish, [field]: value } : dish
      )
    );
  };

  const getCurrentDish = () => {
    return dishTypes.find((dish) => dish.id === activeTab) || dishTypes[0];
  };

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
          <View className="relative">
            <ImageEditor data={restaurantData} setData={setRestaurantData} />
          </View>

          {/* Dish Tabs - Show after first dish type is selected */}
          <View className="absolute top-8 right-4 bg-white/90 backdrop-blur-lg rounded-full p-3  border-slate-200/50">
            <DishTabs
              dishTypes={dishTypes}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onAddDish={() => setShowModal(true)}
              onRemoveTab={handleRemoveTab}
            />
          </View>
          {/* Anonymous Switch */}

          {/* Dish Form */}
          <DishForm
            dishData={getCurrentDish()}
            onDishChange={handleDishChange}
          />

          {/* Restaurant Name */}
          <View className="px-4">
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
          </View>

          {/* Location */}
          <View className="px-4">
            <Text className="text-sm mt-3 text-gray-500 mb-1">Location*</Text>
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

      {/* Dish Type Selection Modal */}
      <DishTypeModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSelectType={handleAddDishType}
      />
    </GestureHandlerRootView>
  );
};
