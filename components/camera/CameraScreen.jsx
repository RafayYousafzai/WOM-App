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
  const { selectedImages, setSelectedImages } = useGlobal();
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

  const handleAddImages = useCallback(
    (uris) => {
      if (uris && uris.length > 0) {
        setSelectedImages((prev) => [...prev, ...uris]);
      }
    },
    [setSelectedImages]
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
      setSelectedImages((prev) => prev.filter((uri) => uri !== uriToRemove));
    },
    [setSelectedImages]
  );

  const handleBack = useCallback(() => {
    setSelectedImages([]); // Clean up state
    router.replace("/(root)/(tabs)/create-review");
  }, [setSelectedImages]);

  const handleNext = useCallback(() => {
    router.replace("/(root)/(tabs)/create-review");
  }, []);

  const toggleExpand = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  if (!permission) {
    // Permissions are still loading
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    // Permissions are not granted
    return (
      <SafeAreaView style={styles.container}>
        <PermissionNotice requestPermission={requestPermission} />
      </SafeAreaView>
    );
  }

  // Permissions are granted, render the camera
  return (
    <SafeAreaView style={styles.container}>
      <CameraView
        style={styles.camera}
        ref={cameraRef}
        facing={facing}
        responsiveOrientationWhenOrientationLocked
      ></CameraView>
      <CameraUI
        images={selectedImages}
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
