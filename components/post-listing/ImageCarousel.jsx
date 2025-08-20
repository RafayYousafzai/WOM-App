import { Image } from "expo-image";
import React, { useState, useRef, useEffect } from "react";
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

export const ImageCarousel = ({ images, onImageChange, currentIndex = 0 }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(currentIndex);
  const { width, height } = useWindowDimensions();
  const flatListRef = useRef(null);
  const maxHeight = height - height * 0.5;

  // Handle external index changes (from dish selection)
  useEffect(() => {
    if (currentIndex !== currentImageIndex) {
      setCurrentImageIndex(currentIndex);
      // Smoothly scroll to the new index
      if (
        flatListRef.current &&
        currentIndex >= 0 &&
        currentIndex < images.length
      ) {
        flatListRef.current.scrollToIndex({
          index: currentIndex,
          animated: true,
        });
      }
    }
  }, [currentIndex, currentImageIndex, images.length]);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index ?? 0;
      if (newIndex !== currentImageIndex) {
        setCurrentImageIndex(newIndex);
        // Notify parent component about the image change
        if (onImageChange) {
          onImageChange(newIndex);
        }
      }
    }
  }).current;

  // Handle scroll to index errors gracefully
  const onScrollToIndexFailed = (info) => {
    const wait = new Promise((resolve) => setTimeout(resolve, 500));
    wait.then(() => {
      flatListRef.current?.scrollToIndex({
        index: info.index,
        animated: true,
      });
    });
  };

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
        onScrollToIndexFailed={onScrollToIndexFailed}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
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
