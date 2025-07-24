import { Image } from "expo-image";
import React, { useState, useRef } from "react";
import { View, FlatList, StyleSheet, useWindowDimensions } from "react-native";

const PaginationDots = ({ data, currentIndex }) => {
  if (data.length <= 1) return null;

  return (
    <View style={styles.paginationContainer}>
      {data.map((_, index) => (
        <View
          key={`dot-${index}`}
          style={[
            styles.dot,
            index === currentIndex ? styles.dotActive : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );
};

export const ImageCarousel = ({ images }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { width, height } = useWindowDimensions();
  const flatListRef = useRef(null);
  const maxHeight = height - height * 0.5;
  // console.log({ width, height, maxHeight });

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentImageIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const normalizedImages = images.map((img, index) => ({
    uri: typeof img === "string" ? img : img.uri,
    key: `image-${index}`,
  }));

  const renderItem = ({ item }) => (
    <View style={{ width, maxHeight: width }}>
      <Image
        source={{ uri: item.uri }}
        style={[styles.image, { width }]}
        onError={(e) => console.warn("Image error:", e.nativeEvent.error)}
      />
    </View>
  );

  return (
    <View style={{ width, maxHeight: width }}>
      <FlatList
        ref={flatListRef}
        data={normalizedImages}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
      <PaginationDots
        data={normalizedImages}
        currentIndex={currentImageIndex}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  carouselContainer: {
    height: 388,
  },
  image: {
    height: "100%",
  },
  paginationContainer: {
    position: "absolute",
    bottom: 16,
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: "white",
  },
  dotInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
});
