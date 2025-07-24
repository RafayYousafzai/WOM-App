import { View, TouchableOpacity, Text, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useEffect } from "react";

interface RatingStarsProps {
  rating: number;
  setRating: (rating: number) => void;
  size?: number;
  activeColor?: string;
  inactiveColor?: string;
}

export function RatingStars({
  rating,
  setRating,
  size = 32,
  activeColor = "#F59E0B",
  inactiveColor = "#D1D5DB",
}: RatingStarsProps) {
  // Animation values for each star
  const starAnimations = [
    useRef(new Animated.Value(rating >= 1 ? 1 : 0)).current,
    useRef(new Animated.Value(rating >= 2 ? 1 : 0)).current,
    useRef(new Animated.Value(rating >= 3 ? 1 : 0)).current,
    useRef(new Animated.Value(rating >= 4 ? 1 : 0)).current,
    useRef(new Animated.Value(rating >= 5 ? 1 : 0)).current,
  ];

  // Animation for the rating text
  const textOpacity = useRef(new Animated.Value(rating > 0 ? 1 : 0)).current;

  // Update animations when rating changes
  useEffect(() => {
    // Animate stars
    [1, 2, 3, 4, 5].forEach((star) => {
      Animated.spring(starAnimations[star - 1], {
        toValue: rating >= star ? 1 : 0,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    });

    // Animate text
    Animated.timing(textOpacity, {
      toValue: rating > 0 ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [rating]);

  // Get rating label
  const getRatingLabel = () => {
    switch (rating) {
      case 1:
        return "Poor";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Very Good";
      case 5:
        return "Excellent";
      default:
        return "";
    }
  };

  return (
    <View className="py-2">
      <View className="flex-row items-center justify-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            className="mx-1"
            activeOpacity={0.7}
          >
            <Animated.View
              style={{
                transform: [
                  {
                    scale: starAnimations[star - 1].interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2],
                    }),
                  },
                ],
              }}
            >
              <Ionicons
                name={rating >= star ? "star" : "star-outline"}
                size={size}
                color={rating >= star ? activeColor : inactiveColor}
              />
            </Animated.View>
          </TouchableOpacity>
        ))}
      </View>

      {rating > 0 && (
        <Animated.View
          className="mt-2 items-center"
          style={{ opacity: textOpacity }}
        >
          <Text
            className="text-base font-medium"
            style={{ color: activeColor }}
          >
            {getRatingLabel()}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}
