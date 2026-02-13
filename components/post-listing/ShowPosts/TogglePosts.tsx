"use client";

import type React from "react";
import { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur"; // npm install expo-blur

interface TogglePostsProps {
  activeTab: "following" | "forYou";
  onTabChange: (tab: "following" | "forYou") => void;
}

const { width } = Dimensions.get("window");
const SLIDER_WIDTH = (width - 32) / 2 - 4; // Account for padding

export const TogglePosts: React.FC<TogglePostsProps> = ({
  activeTab,
  onTabChange,
}) => {
  const slideAnimation = useRef(
    new Animated.Value(activeTab === "following" ? 0 : 1),
  ).current;

  useEffect(() => {
    Animated.spring(slideAnimation, {
      toValue: activeTab === "following" ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, [activeTab, slideAnimation]);

  const translateX = slideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [4, SLIDER_WIDTH + 4],
  });

  return (
    <View style={styles.container}>
      {/* Glass Background */}
      <BlurView
        intensity={Platform.OS === "ios" ? 20 : 10}
        tint="light"
        style={styles.glassBackground}
      >
        {/* Subtle gradient overlay for depth */}
        <View style={styles.gradientOverlay} />

        {/* Animated Glass Slider */}
        <Animated.View
          style={[
            styles.slider,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          <BlurView
            intensity={Platform.OS === "ios" ? 40 : 20}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
          {/* Orange tint overlay */}
          <View style={styles.sliderTint} />
        </Animated.View>

        {/* Following Tab */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => onTabChange("following")}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "following"
                ? styles.activeText
                : styles.inactiveText,
            ]}
          >
            Following
          </Text>
        </TouchableOpacity>

        {/* For You Tab */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => onTabChange("forYou")}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "forYou" ? styles.activeText : styles.inactiveText,
            ]}
          >
            For You
          </Text>
        </TouchableOpacity>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  glassBackground: {
    flexDirection: "row",
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor:
      Platform.OS === "ios" ? "rgba(255,255,255,0.2)" : "rgba(240,240,240,0.9)",
    borderWidth: Platform.OS === "ios" ? 0.5 : 0,
    borderColor: "rgba(255,255,255,0.3)",
    // Shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:
      Platform.OS === "ios" ? "rgba(255,255,255,0.1)" : "transparent",
  },
  slider: {
    position: "absolute",
    width: SLIDER_WIDTH,
    height: 40,
    top: 4,
    borderRadius: 20,
    overflow: "hidden",
    // Glass edge highlight
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.5)",
    // Inner shadow effect
    shadowColor: "#f39f1e",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  sliderTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(243,159,30,0.15)", // Subtle orange tint
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  activeText: {
    color: "#f39f1e", // Orange for active
    textShadowColor: "rgba(243,159,30,0.3)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  inactiveText: {
    color: "rgba(100,100,100,0.8)",
  },
});
