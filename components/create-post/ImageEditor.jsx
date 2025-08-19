import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, TouchableOpacity } from "react-native";
import { View, Text } from "react-native";
import { useEffect, useState } from "react";

export default function ImageEditor({
  getCurrentDish,
  handleDishImagesChange,
  activeTab,
}) {
  const dish = getCurrentDish();
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    setSelectedIndex(null);
  }, [activeTab]);

  const removeImage = (imageToRemove) => {
    handleDishImagesChange(
      (dish.images || []).filter((img) => img !== imageToRemove)
    );
  };

  const moveImage = (fromIndex, toIndex) => {
    const newImages = [...(dish.images || [])];
    const [movedItem] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedItem);
    handleDishImagesChange(newImages);
    setSelectedIndex(null);
  };

  const handleImagePress = (index) => {
    if (selectedIndex === null) {
      setSelectedIndex(index);
    } else if (selectedIndex === index) {
      setSelectedIndex(null);
    } else {
      moveImage(selectedIndex, index);
    }
  };

  const images = Array.isArray(dish?.images) ? dish.images : [];

  return (
    <View>
      <View className="mb-6 mx-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-lg font-bold text-gray-800">
            {dish.dishName ? `${dish.dishName} Photos` : "Your Photos"}
          </Text>
          {images.length > 0 && (
            <View className="bg-blue-100 px-3 py-1 rounded-full">
              <Text className="text-blue-800 text-sm font-medium">
                {images.length} photo{images.length !== 1 ? "s" : ""}
              </Text>
            </View>
          )}
        </View>
        <Text className="text-sm text-gray-500 mb-4">
          Add photos of this specific dish. Tap to reorder.
        </Text>

        <View className="flex-row flex-wrap">
          {images.map((img, index) => (
            <View key={`${img}-${index}`} className="relative mr-3 mb-3">
              <TouchableOpacity
                onPress={() => handleImagePress(index)}
                style={{
                  opacity: selectedIndex === index ? 0.7 : 1,
                  transform: [{ scale: selectedIndex === index ? 0.95 : 1 }],
                }}
              >
                <Image
                  source={{ uri: img }}
                  className="w-28 h-28 rounded-xl"
                  style={{ backgroundColor: "#f3f4f6" }}
                />
                {selectedIndex === index && (
                  <View className="absolute inset-0 bg-blue-500 bg-opacity-30 rounded-xl items-center justify-center">
                    <View className="bg-blue-500 rounded-full p-2">
                      <Ionicons name="checkmark" size={20} color="white" />
                    </View>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm"
                onPress={() => removeImage(img)}
                style={{ elevation: 2 }}
              >
                <Ionicons name="trash" size={15} color="#dc2626" />
              </TouchableOpacity>

              <View className="absolute bottom-1 left-1 bg-black/50 rounded-full px-2 py-1">
                <Text className="text-white text-xs font-bold">
                  {index + 1}
                </Text>
              </View>
            </View>
          ))}

          {/* Add Photo Button */}
          <TouchableOpacity
            onPress={() => router.replace("/camera")}
            className="w-28 h-28 bg-gray-100 aspect-square rounded-xl items-center justify-center border-2 border-dashed border-gray-300 mr-3 mb-3"
            style={{ minHeight: 112 }}
          >
            <Ionicons name="camera" size={32} color="#6B7280" />
            <Text className="text-xs text-gray-500 mt-1 text-center">
              {images.length > 0 ? "Add More" : "Take Photos"}
            </Text>
          </TouchableOpacity>
        </View>

        {selectedIndex !== null && (
          <TouchableOpacity
            className="mt-4 p-3 bg-gray-200 rounded-lg"
            onPress={() => setSelectedIndex(null)}
          >
            <Text className="text-center text-gray-700 font-medium">
              Cancel Reordering
            </Text>
          </TouchableOpacity>
        )}

        {dish.dishName && (
          <View className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-sm text-blue-800 font-medium">
                  Currently editing: {dish.dishName}
                </Text>
                <Text className="text-xs text-blue-600 mt-1">
                  {images.length} photo{images.length !== 1 ? "s" : ""} added
                  for this dish
                </Text>
              </View>
              <Ionicons name="restaurant" size={20} color="#3b82f6" />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
