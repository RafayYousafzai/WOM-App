import React from "react";
import { View, Text, TouchableOpacity, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ImagePreview from "./ImagePreview";
import { styles } from "./styles";

const CameraUI = ({
  images,
  isExpanded,
  onBack,
  onNext,
  onTakePicture,
  onPickImages,
  onToggleFacing,
  onRemoveImage,
  onToggleExpand,
}) => {
  return (
    <>
      <View style={styles.topControlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, styles.backButton]}
          onPress={onBack}
        >
          <Text style={styles.controlButtonText}>Back</Text>
        </TouchableOpacity>
        {images.length > 0 && (
          <TouchableOpacity
            style={[styles.controlButton, styles.nextButton]}
            onPress={onNext}
          >
            <Text style={styles.controlButtonText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>

      <ImagePreview
        images={images}
        onRemove={onRemoveImage}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
      />

      <View style={styles.bottomControlsContainer}>
        <TouchableOpacity onPress={onPickImages}>
          <Ionicons name="images" size={30} color="white" />
        </TouchableOpacity>
        <Pressable onPress={onTakePicture}>
          {({ pressed }) => (
            <View
              style={[styles.shutterButton, { opacity: pressed ? 0.7 : 1 }]}
            >
              <View style={styles.shutterButtonInner} />
            </View>
          )}
        </Pressable>
        <TouchableOpacity onPress={onToggleFacing}>
          <Ionicons name="camera-reverse-outline" size={40} color="white" />
        </TouchableOpacity>
      </View>
    </>
  );
};

export default CameraUI;
