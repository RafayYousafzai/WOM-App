import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, TouchableOpacity, Alert } from "react-native";
import { View, Text } from "react-native";
import { useState } from "react";

export default function ImageEditor({ data, setData }) {
  console.log(data);
  const [selectedImage, setSelectedImage] = useState(null);

  const removeImage = (imageToRemove) => {
    setData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img !== imageToRemove),
    }));
  };

  const moveImage = (fromIndex, toIndex) => {
    setData((prev) => {
      const newImages = [...prev.images];
      const [movedItem] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedItem);
      return {
        ...prev,
        images: newImages,
      };
    });
    setSelectedImage(null);
  };

  const handleImagePress = (index) => {
    if (selectedImage === null) {
      setSelectedImage(index);
    } else if (selectedImage === index) {
      setSelectedImage(null);
    } else {
      moveImage(selectedImage, index);
    }
  };

  const showReorderInstructions = () => {
    Alert.alert(
      "Reorder Images",
      "Tap an image to select it, then tap another position to move it there. Tap the same image again to deselect.",
      [{ text: "Got it!" }]
    );
  };

  return (
    <View>
      <View className="mb-6 mx-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-lg font-bold text-gray-800">Your Photos</Text>
          <TouchableOpacity onPress={showReorderInstructions}>
            <Ionicons name="help-circle-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
        <Text className="text-sm text-gray-500 mb-4">
          Add photos of the restaurant, food, or atmosphere. Tap to reorder.
        </Text>
        <View className="flex-row flex-wrap">
          {data.images.map((img, index) => (
            <View key={index} className="relative mr-3 mb-3">
              <TouchableOpacity
                onPress={() => handleImagePress(index)}
                style={{
                  opacity: selectedImage === index ? 0.7 : 1,
                  transform: [{ scale: selectedImage === index ? 0.95 : 1 }],
                }}
              >
                <Image source={{ uri: img }} className="w-28 h-28 rounded-xl" />
                {selectedImage === index && (
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
              >
                <Ionicons name="trash" size={15} color="#000" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            onPress={() => router.replace("/camera")}
            className="w-28 h-28 bg-gray-100 rounded-xl items-center justify-center border-2 border-dashed border-gray-300 mr-3 mb-3"
          >
            <Ionicons name="camera" size={32} color="#6B7280" />
            <Text className="text-xs text-gray-500 mt-1">Take More</Text>
          </TouchableOpacity>
        </View>

        {selectedImage !== null && (
          <TouchableOpacity
            onPress={() => setSelectedImage(null)}
            className="mt-4 p-3 bg-gray-200 rounded-lg"
          >
            <Text className="text-center text-gray-700 font-medium">
              Cancel Reordering
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
