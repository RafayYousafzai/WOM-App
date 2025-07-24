import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, TouchableOpacity } from "react-native";
import { View, Text } from "react-native";

export default function ImageEditor({ data, setData }) {
  console.log(data);

  const removeImage = (imageToRemove) => {
    setData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img !== imageToRemove),
    }));
  };

  return (
    <View>
      <View className="mb-6 mx-4">
        <Text className="text-lg font-bold mb-2 text-gray-800">
          Your Photos
        </Text>
        <Text className="text-sm text-gray-500 mb-4">
          Add photos of the restaurant, food, or atmosphere
        </Text>
        <View className="flex-row flex-wrap">
          {data.images.map((img, index) => (
            <View key={index} className="relative mr-3 mb-3">
              <Image source={{ uri: img }} className="w-28 h-28 rounded-xl" />
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
      </View>
    </View>
  );
}
