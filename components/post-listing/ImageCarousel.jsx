import { Image } from "expo-image";
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";

const PaginationDots = ({ data, currentIndex, onDotPress }) => {
  if (data.length <= 1) return null;

  return (
    <View style={styles.paginationContainer}>
      {data.map((_, index) => (
        <TouchableOpacity
          key={`dot-${index}`}
          onPress={() => onDotPress(index)}
          activeOpacity={0.7}
          style={styles.dotTouchable}
        >
          <View
            style={[
              styles.dot,
              index === currentIndex ? styles.dotActive : styles.dotInactive,
            ]}
          />
        </TouchableOpacity>
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
  }, [currentIndex, images.length]); // ✅ Removed currentImageIndex from deps to avoid loops

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // ✅ FIXED: Use useCallback with proper deps to avoid stale closure
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }) => {
      if (viewableItems.length > 0) {
        const newIndex = viewableItems[0].index ?? 0;
        setCurrentImageIndex((prevIndex) => {
          // Only update if actually changed
          if (newIndex !== prevIndex) {
            // Notify parent component about the image change
            if (onImageChange) {
              onImageChange(newIndex);
            }
            return newIndex;
          }
          return prevIndex;
        });
      }
    },
    [onImageChange],
  ); // ✅ Added onImageChange as dependency

  // Handle scroll to index errors gracefully
  const onScrollToIndexFailed = useCallback((info) => {
    const wait = new Promise((resolve) => setTimeout(resolve, 500));
    wait.then(() => {
      flatListRef.current?.scrollToIndex({
        index: info.index,
        animated: true,
      });
    });
  }, []);

  // ✅ NEW: Handle dot press
  const handleDotPress = useCallback(
    (index) => {
      if (flatListRef.current && index >= 0 && index < images.length) {
        flatListRef.current.scrollToIndex({
          index: index,
          animated: true,
        });
        // The onViewableItemsChanged will handle updating the state
      }
    },
    [images.length],
  );

  const normalizedImages = images.map((img, index) => ({
    uri: typeof img === "string" ? img : img.uri,
    key: `image-${index}`,
  }));

  const renderItem = useCallback(
    ({ item }) => (
      <View style={{ width, maxHeight: width }}>
        <Image
          source={{ uri: item.uri }}
          style={[styles.image, { width }]}
          onError={(e) => console.warn("Image error:", e.nativeEvent.error)}
        />
      </View>
    ),
    [width],
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
        // ✅ Add maintainVisibleContentPosition to help with scroll position tracking
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
      />
      <PaginationDots
        data={normalizedImages}
        currentIndex={currentImageIndex}
        onDotPress={handleDotPress} // ✅ Pass the handler
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
  dotTouchable: {
    padding: 4, // Larger touch target
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
