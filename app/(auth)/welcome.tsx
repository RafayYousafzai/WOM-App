"use client";

import { router } from "expo-router";
import { useRef, useState, useEffect } from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Carousel from "react-native-reanimated-carousel";
import { MotiView, MotiText } from "moti";
import { onboarding as baseOnboarding } from "@/constants";
import { images } from "@/constants";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

const { width, height } = Dimensions.get("window");

// iPad detection function
const isIPad = () => {
  if (Platform.OS === "ios") {
    const aspectRatio = height / width;
    const minTabletWidth = 768;
    const isTabletSize = width >= minTabletWidth || height >= minTabletWidth;
    const hasTabletAspectRatio = aspectRatio >= 1.0 && aspectRatio <= 1.5;
    return isTabletSize && hasTabletAspectRatio;
  }

  if (Platform.OS === "android") {
    const minTabletWidth = 768;
    return width >= minTabletWidth || height >= minTabletWidth;
  }

  return false;
};

// IMPORTANT: Detect device type immediately, not in useEffect
const deviceIsIPad = isIPad();

// Create the correct onboarding data immediately
const getOnboardingData = () => {
  if (deviceIsIPad) {
    console.log("Creating iPad onboarding data immediately");
    return baseOnboarding.map((item, index) => ({
      ...item,
      image:
        index === 0
          ? images.onboardingIPAD1
          : index === 1
          ? images.onboardingIPAD2
          : index === 2
          ? images.onboardingIPAD3
          : item.image,
    }));
  }

  console.log("Using default phone onboarding data");
  return baseOnboarding;
};

const COLORS = {
  primary: "#FF4D4D",
  secondary: "#FFEDED",
  textPrimary: "#1F1F1F",
  textSecondary: "#5A5A5A",
  gradientStart: "#f39f1e",
  gradientEnd: "#FF8A65",
  shadow: "#FF4D4D40",
  glass: "rgba(255, 255, 255, 0.15)",
  glassBorder: "rgba(255, 255, 255, 0.2)",
  skipButton: "rgba(0, 0, 0, 0.3)",
};

const THEME = {
  colors: {
    primary: "#6366F1",
    primaryDark: "#4F46E5",
    secondary: "#F8FAFC",
    accent: "#F59E0B",
    text: {
      primary: "#1E293B",
      secondary: "#64748B",
      light: "#FFFFFF",
    },
    background: {
      glass: "rgba(255, 255, 255, 0.1)",
      glassBorder: "rgba(255, 255, 255, 0.2)",
      overlay: "rgba(0, 0, 0, 0.4)",
    },
    shadow: "rgba(99, 102, 241, 0.3)",
  },
  spacing: {
    xs: 8,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    full: 999,
  },
};

const Home = () => {
  const carouselRef = useRef<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Use the pre-calculated onboarding data
  const onboarding = getOnboardingData();
  const isLastSlide = activeIndex >= onboarding.length - 1;

  useEffect(() => {
    StatusBar.setBackgroundColor("transparent");
    StatusBar.setTranslucent(true);
    StatusBar.setBarStyle("light-content");

    // // Log for debugging
    // console.log("=== FINAL SETUP ===");
    // console.log("Device is iPad:", deviceIsIPad);
    // console.log("First slide image ID:", onboarding[0].image);
    // console.log("Expected iPad image ID:", images.onboardingIPAD1);
    // console.log("Expected phone image ID:", images.onboarding1);
  }, []);

  const handleNextPress = () => {
    if (isLastSlide) {
      router.push("/(auth)/select-auth");
    } else {
      const nextIndex = activeIndex + 1;
      setActiveIndex(nextIndex);
      carouselRef.current?.scrollTo({ index: nextIndex, animated: true });
    }
  };

  const handleDotPress = (index: number) => {
    setActiveIndex(index);
    carouselRef.current?.scrollTo({ index, animated: true });
  };

  const handleSnapToItem = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {/* Carousel container */}
      <View style={{ flex: 1 }}>
        <Carousel
          ref={carouselRef}
          width={width}
          height={height}
          data={onboarding}
          scrollAnimationDuration={600}
          onSnapToItem={handleSnapToItem}
          pagingEnabled={true}
          snapEnabled={true}
          loop={false}
          autoPlay={false}
          renderItem={({ item, index }) => (
            <View key={item.id} style={{ flex: 1 }}>
              <MotiView
                from={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "timing", duration: 600 }}
                style={{ flex: 1 }}
              >
                <Image
                  source={item.image}
                  style={{
                    width: "100%",
                    height: "90%",
                    resizeMode: "cover",
                  }}
                  onLoad={() => {
                    console.log(`Image ${index} loaded:`, item.image);
                  }}
                />
                <LinearGradient
                  colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.8)"]}
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                  }}
                />
              </MotiView>
            </View>
          )}
        />

        {/* Fixed: Overlay with proper pointer events */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
          }}
          pointerEvents="box-none"
        >
          <SafeAreaView style={{ flex: 1 }} pointerEvents="box-none">
            {/* Header with Skip button */}
            <MotiView
              from={{ opacity: 0, translateY: -30 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "spring", duration: 600 }}
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "flex-end",
                paddingHorizontal: 24,
                paddingTop: 16,
              }}
              pointerEvents="box-none"
            >
              <TouchableOpacity
                onPress={() => router.push("/(auth)/select-auth")}
                style={{
                  overflow: "hidden",
                  borderRadius: 20,
                }}
                activeOpacity={0.7}
              >
                <BlurView
                  intensity={20}
                  tint="dark"
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    backgroundColor: COLORS.skipButton,
                    borderWidth: 1,
                    borderColor: COLORS.glassBorder,
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: "600",
                    }}
                  >
                    Skip
                  </Text>
                </BlurView>
              </TouchableOpacity>
            </MotiView>

            {/* Content container - FIXED: Allow swipes to pass through */}
            <View
              style={{
                flex: 1,
                justifyContent: "flex-end",
                paddingHorizontal: THEME.spacing.md,
                paddingBottom: 180,
              }}
              pointerEvents="none"
            >
              {/* Category Badge */}
              <MotiView
                key={`badge-${activeIndex}`}
                from={{ opacity: 0, scale: 0.8, translateY: 20 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                transition={{ type: "spring", duration: 600 }}
                style={{
                  alignSelf: "center",
                  marginBottom: THEME.spacing.md,
                }}
              >
                <View
                  style={{
                    overflow: "hidden",
                    borderRadius: THEME.borderRadius.full,
                  }}
                >
                  <BlurView
                    intensity={20}
                    tint="light"
                    style={{
                      paddingHorizontal: THEME.spacing.sm,
                      paddingVertical: THEME.spacing.xs,
                      backgroundColor: THEME.colors.background.glass,
                      borderWidth: 1,
                      borderColor: THEME.colors.background.glassBorder,
                    }}
                  >
                    <Text
                      style={{
                        color: THEME.colors.accent,
                        fontSize: 12,
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      Step {activeIndex + 1} of {onboarding.length}{" "}
                      {deviceIsIPad ? "(iPad)" : "(Phone)"}
                    </Text>
                  </BlurView>
                </View>
              </MotiView>

              {/* Main Title */}
              <MotiText
                key={`title-${activeIndex}`}
                from={{ opacity: 0, translateY: 30 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "spring", duration: 700, delay: 100 }}
                style={{
                  fontSize: 36,
                  fontWeight: "800",
                  textAlign: "center",
                  color: THEME.colors.text.light,
                  lineHeight: 44,
                  marginBottom: THEME.spacing.md,
                  textShadowColor: "rgba(0, 0, 0, 0.5)",
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 4,
                }}
              >
                {onboarding[activeIndex].title}
              </MotiText>

              {/* Description */}
              <MotiView
                key={`desc-${activeIndex}`}
                from={{ opacity: 0, translateY: 30 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "spring", duration: 700, delay: 200 }}
                style={{
                  overflow: "hidden",
                  borderRadius: THEME.borderRadius.lg,
                  marginHorizontal: THEME.spacing.sm,
                }}
              >
                <BlurView
                  intensity={15}
                  tint="dark"
                  style={{
                    backgroundColor: THEME.colors.background.glass,
                    borderWidth: 1,
                    borderColor: THEME.colors.background.glassBorder,
                    padding: THEME.spacing.md,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "500",
                      textAlign: "center",
                      lineHeight: 24,
                      color: THEME.colors.text.light,
                      opacity: 0.9,
                    }}
                  >
                    {onboarding[activeIndex].description}
                  </Text>
                </BlurView>
              </MotiView>
            </View>

            {/* Bottom controls */}
            <MotiView
              from={{ opacity: 0, translateY: 50 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "spring", duration: 700 }}
              style={{
                position: "absolute",
                bottom: 32,
                width: "100%",
                paddingHorizontal: 32,
              }}
            >
              {/* Next/Start button */}
              <TouchableOpacity onPress={handleNextPress} activeOpacity={0.8}>
                <MotiView
                  style={{
                    backgroundColor: COLORS.primary,
                    shadowColor: COLORS.shadow,
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.5,
                    shadowRadius: 15,
                    elevation: 10,
                    width: "100%",
                    paddingVertical: 20,
                    borderRadius: 999,
                    alignItems: "center",
                  }}
                  from={{ scale: 1 }}
                  animate={{ scale: 1.03 }}
                  transition={{
                    type: "timing",
                    duration: 1200,
                    loop: true,
                    repeatReverse: true,
                  }}
                >
                  <LinearGradient
                    colors={[COLORS.gradientStart, COLORS.gradientEnd]}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: 999,
                    }}
                  />
                  <Text
                    style={{
                      color: "white",
                      fontSize: 18,
                      fontWeight: "bold",
                    }}
                  >
                    {isLastSlide ? "Start Your Food Journey" : "Next"}
                  </Text>
                </MotiView>
              </TouchableOpacity>

              {/* Progress indicators */}
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "timing", duration: 600, delay: 200 }}
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  marginTop: 24,
                }}
              >
                {onboarding.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleDotPress(index)}
                    style={{ marginHorizontal: 8 }}
                  >
                    <MotiView
                      animate={{
                        width: index === activeIndex ? 30 : 10,
                        height: 10,
                        borderRadius: 5,
                        opacity: index === activeIndex ? 1 : 0.5,
                        backgroundColor: COLORS.secondary,
                      }}
                      transition={{ type: "timing", duration: 300 }}
                    />
                  </TouchableOpacity>
                ))}
              </MotiView>
            </MotiView>
          </SafeAreaView>
        </View>
      </View>
    </View>
  );
};

export default Home;
