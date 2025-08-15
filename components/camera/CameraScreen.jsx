import React, { useState, useCallback } from "react";
import { View } from "react-native";
import { CameraView } from "expo-camera";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGlobal } from "@/context/globalContext";
import { useCameraHandler } from "./useCameraHandler";
import { useImagePickerHandler } from "./useImagePickerHandler";
import CameraUI from "./CameraUI";
import PermissionNotice from "./PermissionNotice";
import { styles } from "./styles";

export default function CameraScreen() {
  const {
    selectedImages,
    setSelectedImages,
    currentDishId,
    setCurrentDishImages,
    getDishImages,
  } = useGlobal();

  const [isExpanded, setExpanded] = useState(true);

  // Custom hook for camera-related logic
  const {
    cameraRef,
    facing,
    permission,
    requestPermission,
    toggleFacing,
    takePicture,
  } = useCameraHandler();

  // Custom hook for image picker logic
  const { pickImages } = useImagePickerHandler();

  // Get current images (dish-specific if available, otherwise global)
  const getCurrentImages = () => {
    if (currentDishId) {
      return getDishImages(currentDishId);
    }
    return selectedImages;
  };

  const handleAddImages = useCallback(
    (uris) => {
      if (uris && uris.length > 0) {
        if (currentDishId) {
          // Add to specific dish
          setCurrentDishImages(currentDishId, uris);
        } else {
          // Fallback to global selectedImages
          setSelectedImages((prev) => [...prev, ...uris]);
        }
      }
    },
    [setSelectedImages, currentDishId, setCurrentDishImages]
  );

  const handleTakePicture = useCallback(async () => {
    const newImageUris = await takePicture();
    handleAddImages(newImageUris);
  }, [takePicture, handleAddImages]);

  const handlePickImages = useCallback(async () => {
    const newImageUris = await pickImages();
    handleAddImages(newImageUris);
  }, [pickImages, handleAddImages]);

  const handleRemoveImage = useCallback(
    (uriToRemove) => {
      if (currentDishId) {
        // Remove from specific dish
        setCurrentDishImages(currentDishId, (prev) =>
          prev.filter((uri) => uri !== uriToRemove)
        );
      } else {
        // Fallback to global selectedImages
        setSelectedImages((prev) => prev.filter((uri) => uri !== uriToRemove));
      }
    },
    [setSelectedImages, currentDishId, setCurrentDishImages]
  );

  const handleBack = useCallback(() => {
    router.replace("/(root)/(tabs)/create-review");
  }, []);

  const handleNext = useCallback(() => {
    router.replace("/(root)/(tabs)/create-review");
  }, []);

  const toggleExpand = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <PermissionNotice requestPermission={requestPermission} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CameraView
        style={styles.camera}
        ref={cameraRef}
        facing={facing}
        responsiveOrientationWhenOrientationLocked
      />
      <CameraUI
        images={getCurrentImages()}
        isExpanded={isExpanded}
        onBack={handleBack}
        onNext={handleNext}
        onTakePicture={handleTakePicture}
        onPickImages={handlePickImages}
        onToggleFacing={toggleFacing}
        onRemoveImage={handleRemoveImage}
        onToggleExpand={toggleExpand}
      />
    </SafeAreaView>
  );
}
