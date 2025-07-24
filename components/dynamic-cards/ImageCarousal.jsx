"use client";

import { useState } from "react";
import { View, Image, ScrollView, StyleSheet } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import ImageWithSkeleton from "../PageSkeletons/ImageWithSkeleton";

export const ImageCarousel = ({ images }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const ITEM_WIDTH = 110; // Consistent width for all elements
  const ITEM_HEIGHT = 110;

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    scrollX.value = offsetX;
    const index = Math.round(offsetX / ITEM_WIDTH);
    setCurrentImageIndex(index);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {images.map((image, index) => (
          <View key={index} style={styles.imageContainer}>
            <ImageWithSkeleton
              source={{ uri: image }}
              style={styles.image}
              resizeMode="cover"
            />
            {/* Image overlay gradient - using a semi-transparent View instead of gradient */}
            <View style={styles.overlay} />
          </View>
        ))}
      </ScrollView>

      {/* Dots indicator */}
      {images.length > 1 && (
        <View style={styles.dotsContainer}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentImageIndex
                  ? styles.activeDot
                  : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 110,
    width: 110,
    position: "relative",
  },
  imageContainer: {
    width: 110,
    height: 110,
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    width: 110,
    height: 110,
    borderRadius: 8,
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  dotsContainer: {
    position: "absolute",
    bottom: 8,
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  dot: {
    height: 6,
    width: 6,
    borderRadius: 3,
    marginHorizontal: 2,
  },
  activeDot: {
    backgroundColor: "white",
  },
  inactiveDot: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
});
