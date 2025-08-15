import React, { useState, useCallback, useEffect } from "react";
import { View, TextInput, StyleSheet, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  runOnJS,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { PanGestureHandler } from "react-native-gesture-handler";

interface RatingStarsProps {
  rating: number;
  setRating: (rating: number) => void;
}

const SLIDER_WIDTH = 250;
const SLIDER_HEIGHT = 8;
const HANDLE_SIZE = 24;
const MAX_RATING = 10;

export function RatingStars({ rating, setRating }: RatingStarsProps) {
  const [inputValue, setInputValue] = useState(rating.toString());
  const translateX = useSharedValue((rating / MAX_RATING) * SLIDER_WIDTH);
  const isActive = useSharedValue(false);
  const isDragging = useSharedValue(false);

  useEffect(() => {
    if (!isDragging.value) {
      translateX.value = withSpring((rating / MAX_RATING) * SLIDER_WIDTH, {
        damping: 20,
        stiffness: 300,
      });
      setInputValue(rating.toString());
    }
  }, [rating]);

  // Only update JS rating when gesture ends
  const updateRatingOnEnd = useCallback(
    (newRating: number) => {
      const rounded = Math.round(newRating * 10) / 10;
      setRating(rounded);
      setInputValue(rounded.toString());
    },
    [setRating]
  );

  // Smoother gesture handler with optimized updates
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (event) => {
      isActive.value = true;
      isDragging.value = true;

      // Directly update position without intermediate state
      const tappedX = Math.max(0, Math.min(SLIDER_WIDTH, event.x));
      translateX.value = withSpring(tappedX, {
        damping: 18,
        stiffness: 250,
      });
    },
    onActive: (event) => {
      // Direct manipulation without JS callbacks
      const posX = Math.max(0, Math.min(SLIDER_WIDTH, event.x));
      translateX.value = posX;
    },
    onEnd: () => {
      isActive.value = false;
      isDragging.value = false;

      const finalRating = (translateX.value / SLIDER_WIDTH) * MAX_RATING;
      const rounded = Math.round(finalRating * 10) / 10;
      const finalX = (rounded / MAX_RATING) * SLIDER_WIDTH;

      translateX.value = withSpring(finalX, {
        damping: 18,
        stiffness: 250,
      });
      runOnJS(updateRatingOnEnd)(rounded);
    },
  });

  const handleStyle = useAnimatedStyle(() => {
    const scale = isActive.value
      ? withSpring(1.25, { damping: 12, stiffness: 400 })
      : withSpring(1, { damping: 12, stiffness: 400 });

    return {
      transform: [
        { translateX: translateX.value - HANDLE_SIZE / 2 },
        { scale },
      ],
    };
  });

  // Fill style - pure native animation
  const fillStyle = useAnimatedStyle(() => {
    return {
      width: Math.max(0, translateX.value),
    };
  });

  // Glow effect
  const glowStyle = useAnimatedStyle(() => {
    const opacity = isActive.value
      ? withTiming(0.4, { duration: 100 })
      : withTiming(0, { duration: 200 });

    return {
      opacity,
      width: Math.max(0, translateX.value),
    };
  });

  // Handle input changes
  const onInputChange = useCallback(
    (text: string) => {
      setInputValue(text);
      const value = parseFloat(text);
      if (!isNaN(value) && value >= 0 && value <= MAX_RATING) {
        const newX = (value / MAX_RATING) * SLIDER_WIDTH;
        translateX.value = withSpring(newX, {
          damping: 20,
          stiffness: 300,
        });
        setRating(value);
      }
    },
    [setRating, translateX]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rate this dish (0-10)</Text>
      <View style={styles.ratingContainer}>
        <View style={styles.sliderContainer}>
          <PanGestureHandler
            onGestureEvent={gestureHandler}
            // Critical: Use native events only
            shouldCancelWhenOutside={false}
          >
            <Animated.View style={styles.sliderContainer}>
              <View style={styles.sliderTrack}>
                <Animated.View style={[styles.sliderGlow, glowStyle]} />
                <Animated.View style={[styles.sliderFill, fillStyle]} />
              </View>
              <Animated.View style={[styles.handle, handleStyle]}>
                <View style={styles.handleInner} />
              </Animated.View>
            </Animated.View>
          </PanGestureHandler>
        </View>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={inputValue}
          onChangeText={onInputChange}
          selectTextOnFocus
          placeholder="0.0"
          placeholderTextColor="#94a3b8"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#ffffff",
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
  },

  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  sliderContainer: {
    width: SLIDER_WIDTH,
    height: HANDLE_SIZE + 10,
    justifyContent: "center",
  },

  sliderTrack: {
    width: SLIDER_WIDTH,
    height: SLIDER_HEIGHT,
    backgroundColor: "#f8fafc",
    borderRadius: SLIDER_HEIGHT / 2,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "visible",
  },

  sliderGlow: {
    height: SLIDER_HEIGHT + 6,
    backgroundColor: "#f39f1e",
    borderRadius: (SLIDER_HEIGHT + 6) / 2,
    position: "absolute",
    top: -3,
    shadowColor: "#f39f1e",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },

  sliderFill: {
    height: "100%",
    backgroundColor: "#f39f1e",
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: "#f39f1e",
    justifyContent: "center",
    alignItems: "center",
  },

  handleInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#f39f1e",
  },

  input: {
    width: 60,
    height: 36,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 100,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
    backgroundColor: "#ffffff",
    color: "#374151",
  },
});
