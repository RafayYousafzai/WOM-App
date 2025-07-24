import React from "react";
import { View, ScrollView, TouchableOpacity, Text } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles";

const ImagePreview = ({ images, onRemove, isExpanded, onToggleExpand }) => {
  if (images.length === 0) {
    return null;
  }

  return (
    <View style={styles.previewContainer}>
      {isExpanded && (
        <ScrollView horizontal style={styles.imagesList}>
          {images.map((uri) => (
            <View key={uri} style={styles.thumbnailContainer}>
              <Image
                source={{ uri }}
                style={styles.thumbnail}
                contentFit="cover"
              />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => onRemove(uri)}
              >
                <Ionicons name="trash-outline" size={16} color="black" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
      <TouchableOpacity style={styles.expandButton} onPress={onToggleExpand}>
        <Text style={styles.expandButtonText}>{images.length}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ImagePreview;
