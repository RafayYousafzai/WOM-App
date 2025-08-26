"use client";

import { useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  type LayoutChangeEvent,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  withSpring,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

interface RatingStarsProps {
  rating: number;
  setRating: (rating: number) => void;
}

const SLIDER_WIDTH = 320;
const SLIDER_HEIGHT = 12;
const HANDLE_SIZE = 32;
const MAX_RATING = 10;

export function RatingStars({ rating, setRating }: RatingStarsProps) {
  const [inputValue, setInputValue] = useState(rating.toString());
  const [sliderWidth, setSliderWidth] = useState(SLIDER_WIDTH);
  const translateX = useSharedValue((rating / MAX_RATING) * sliderWidth);
  const isActive = useSharedValue(false);
  const isDragging = useSharedValue(false);

  useEffect(() => {
    if (!isDragging.value) {
      translateX.value = withSpring((rating / MAX_RATING) * sliderWidth, {
        damping: 20,
        stiffness: 300,
      });
      setInputValue(rating.toString());
    }
  }, [rating, sliderWidth]);

  const updateRatingOnEnd = useCallback(
    (newRating: number) => {
      const rounded = Math.round(newRating * 10) / 10;
      setRating(rounded);
      setInputValue(rounded.toString());
    },
    [setRating]
  );

  const panGesture = Gesture.Pan()
    .onStart((event) => {
      isActive.value = true;
      isDragging.value = true;

      const tappedX = Math.max(0, Math.min(sliderWidth, event.x));
      translateX.value = withSpring(tappedX, {
        damping: 15,
        stiffness: 200,
      });
    })
    .onUpdate((event) => {
      const posX = Math.max(0, Math.min(sliderWidth, event.x));
      translateX.value = posX;
    })
    .onEnd(() => {
      isActive.value = false;
      isDragging.value = false;

      const finalRating = (translateX.value / sliderWidth) * MAX_RATING;
      const rounded = Math.round(finalRating * 10) / 10;
      const finalX = (rounded / MAX_RATING) * sliderWidth;

      translateX.value = withSpring(finalX, {
        damping: 15,
        stiffness: 200,
      });
      runOnJS(updateRatingOnEnd)(rounded);
    });

  const handleStyle = useAnimatedStyle(() => {
    const scale = isActive.value
      ? withSpring(1.4, { damping: 10, stiffness: 300 })
      : withSpring(1, { damping: 10, stiffness: 300 });

    const shadowOpacity = isActive.value
      ? withTiming(0.25, { duration: 150 })
      : withTiming(0.15, { duration: 200 });

    return {
      transform: [
        { translateX: translateX.value - HANDLE_SIZE / 2 },
        { scale },
      ],
      shadowOpacity,
    };
  });

  const fillStyle = useAnimatedStyle(() => {
    return {
      width: Math.max(0, translateX.value),
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    const opacity = isActive.value
      ? withTiming(0.6, { duration: 100 })
      : withTiming(0.2, { duration: 200 });

    const glowColor = interpolateColor(
      translateX.value / sliderWidth,
      [0, 0.5, 1],
      ["#fbbf24", "#f59e0b", "#d97706"]
    );

    return {
      opacity,
      width: Math.max(0, translateX.value),
      backgroundColor: glowColor,
    };
  });

  const onInputChange = useCallback(
    (text: string) => {
      setInputValue(text);
      const value = Number.parseFloat(text);
      if (!isNaN(value) && value >= 0 && value <= MAX_RATING) {
        const newX = (value / MAX_RATING) * sliderWidth;
        translateX.value = withSpring(newX, {
          damping: 20,
          stiffness: 300,
        });
        setRating(value);
      }
    },
    [setRating, translateX, sliderWidth]
  );

  const onSliderLayout = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setSliderWidth(width - 40); // Account for padding
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.topRow}>
        <Text
          style={{
            fontSize: 18,
            color: "#374151",
            marginLeft: 8,
          }}
        >
          Rate this dish
        </Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={inputValue}
          onChangeText={onInputChange}
          selectTextOnFocus
          placeholder="0.0"
          placeholderTextColor="#9ca3af"
        />
      </View>

      <View style={styles.sliderContainer} onLayout={onSliderLayout}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={styles.sliderWrapper}>
            <View style={[styles.sliderTrack, { width: sliderWidth }]}>
              <Animated.View style={[styles.sliderGlow, glowStyle]} />
              <Animated.View style={[styles.sliderFill, fillStyle]} />
            </View>
            <Animated.View style={[styles.handle, handleStyle]}>
              <View style={styles.handleInner} />
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },

  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
  },

  sliderContainer: {
    width: "100%",
    height: HANDLE_SIZE + 16,
    justifyContent: "center",
    paddingBottom: 25,
    marginLeft: 12,
  },

  sliderWrapper: {
    width: "100%",
    height: HANDLE_SIZE + 16,
    justifyContent: "center",
  },

  sliderTrack: {
    height: SLIDER_HEIGHT,
    backgroundColor: "#f9fafb",
    borderRadius: SLIDER_HEIGHT / 2,
    borderWidth: 2,
    borderColor: "#fff",
    overflow: "visible",
  },

  sliderGlow: {
    height: SLIDER_HEIGHT + 8,
    borderRadius: (SLIDER_HEIGHT + 8) / 2,
    position: "absolute",
    top: -4,
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 12,
  },

  sliderFill: {
    height: "100%",
    backgroundColor: "#f59e0b",
    borderRadius: SLIDER_HEIGHT / 2,
    position: "absolute",
  },

  handle: {
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    backgroundColor: "#ffffff",
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 3,
    borderColor: "#f59e0b",
    justifyContent: "center",
    alignItems: "center",
  },

  handleInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#f59e0b",
  },

  input: {
    width: 80,
    height: 48,
    borderRadius: 20,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    backgroundColor: "#f9fafb",
    color: "#1f2937",
  },
});
