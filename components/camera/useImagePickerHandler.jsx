import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useCallback } from "react";

export const useImagePickerHandler = () => {
  const pickImages = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "We need permission to access your gallery to share photos."
      );
      return [];
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 10,
      });

      if (!result.canceled && result.assets) {
        return result.assets.map((asset) => asset.uri); // Return array of URIs
      }
    } catch (error) {
      console.error("Failed to pick images:", error);
    }

    return [];
  }, []);

  return { pickImages };
};
