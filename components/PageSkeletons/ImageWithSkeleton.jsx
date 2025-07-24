import React, { useState, useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const ImageWithSkeleton = ({
  source,
  style,
  skeletonStyle = {},
  shimmerColors = ["#e5e7eb", "#f3f4f6", "#e5e7eb"],
  shimmerDuration = 1000,
  resizeMode = "cover",
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const shimmerProgress = useSharedValue(0);

  // Start shimmer animation
  useEffect(() => {
    if (isLoading) {
      shimmerProgress.value = withRepeat(
        withTiming(1, {
          duration: shimmerDuration,
          easing: Easing.linear,
        }),
        -1, // Infinite loop
        false // No reverse
      );
    } else {
      shimmerProgress.value = 0;
    }

    return () => {
      shimmerProgress.value = 0;
    };
  }, [isLoading, shimmerDuration]);

  // Animated style for shimmer
  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: shimmerProgress.value * 400 - 200, // Move from -200 to +200
      },
    ],
  }));

  // Handle image load
  const handleImageLoad = () => {
    setTimeout(() => {
      setIsLoading(false);
    }, 100); // Smooth transition delay
  };

  return (
    <View
      className="relative rounded-xl overflow-hidden shadow-md"
      style={style}
    >
      {/* Skeleton Loader */}
      {isLoading && (
        <Animated.View
          className="absolute inset-0 bg-gray-200"
          style={[styles.skeleton, skeletonStyle]}
        >
          <Animated.View
            className="absolute inset-0"
            style={[styles.shimmerContainer, shimmerStyle]}
          >
            <LinearGradient
              colors={shimmerColors}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.shimmer}
            />
          </Animated.View>
        </Animated.View>
      )}

      {/* Image */}
      <Animated.Image
        source={source}
        className="w-full h-full"
        style={[style, { opacity: isLoading ? 0 : 1 }]}
        resizeMode={resizeMode}
        onLoadStart={() => setIsLoading(true)}
        onLoad={handleImageLoad}
        onError={() => setIsLoading(false)}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    borderRadius: 12,
  },
  shimmerContainer: {
    width: "100%",
    height: "100%",
  },
  shimmer: {
    flex: 1,
    width: 400, // Wider for smooth gradient
    height: "100%",
  },
});

export default ImageWithSkeleton;
