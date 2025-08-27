"use client";

import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Image,
  Text as RNText,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  View,
  Text,
  Platform,
} from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { useGlobal } from "@/context/globalContext";
import { ErrorBoundary } from "@/components/create-post/ErrorBoundary";
import UnloggedState from "@/components/auth/unlogged-state";
import RestaurantCreation from "@/components/create-post/review/ResturantCreation";
import { HStack, Box } from "@/components/ui"; // Adjusted import path
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useReview } from "@/context/reviewContext";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const { width } = Dimensions.get("window");
const imageSize = width * 0.44;
export default function CreateReview() {
  const { isSignedIn } = useAuth();
  const { selectedImages } = useGlobal();
  const [activeImage, setActiveImage] = useState(0);
  const { reviewData, setReviewData } = useReview();

  if (!isSignedIn) {
    return <UnloggedState />;
  }

  if (reviewData.is_review === null) {
    return (
      <ErrorBoundary>
        <SafeAreaView className="flex-1 bg-white">
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              entering={FadeInUp.duration(600)}
              className={`px-6 pt-12 ${
                Platform.OS === "android" ? "mt-8" : "pb-0"
              }`}
            >
              <Text className="text-6xl font-extrabold text-slate-900">
                Create
              </Text>
              <Text className="text-sm text-slate-500 mt-2 font-medium">
                Share your experience by posting a review or uploading a new
                post.
              </Text>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.duration(600).delay(200)}
              className="px-4 pb-16 pt-2 flex-1"
            >
              <View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={(e) => {
                    const newIndex = Math.round(
                      e.nativeEvent.contentOffset.x / (imageSize + 16)
                    );
                    setActiveImage(newIndex);
                  }}
                  decelerationRate="fast"
                  snapToInterval={imageSize + 16}
                  snapToAlignment="start"
                >
                  {selectedImages.map((uri: any, index: any) => (
                    <View
                      key={index}
                      style={[
                        styles.imageContainer,
                        activeImage === index && styles.activeImageContainer,
                      ]}
                    >
                      <Image
                        source={{ uri }}
                        style={styles.galleryImage}
                        resizeMode="cover"
                      />
                    </View>
                  ))}
                </ScrollView>

                {/* Image Indicators */}
                {selectedImages.length > 1 && (
                  <View style={styles.indicatorContainer}>
                    {selectedImages.map((_: any, index: number) => (
                      <View
                        key={index}
                        style={[
                          styles.indicator,
                          activeImage === index && styles.activeIndicator,
                        ]}
                      />
                    ))}
                  </View>
                )}
              </View>

              <View className="mt-16">
                <Animated.View entering={FadeInDown.duration(600).delay(400)}>
                  <TouchableOpacity
                    className="bg-slate-50 rounded-3xl p-6 py-5 mb-4"
                    onPress={() =>
                      setReviewData((prev) => ({
                        ...prev,
                        is_review: "restaurant",
                      }))
                    }
                    activeOpacity={0.8}
                  >
                    <HStack className="items-center mb-5">
                      <Box className="p-4 rounded-2xl bg-gray-200">
                        <Ionicons
                          name="restaurant-outline"
                          size={28}
                          color="#F59E0B"
                        />
                      </Box>
                      <View className="ml-4 flex-1">
                        <RNText className="font-bold text-2xl text-slate-900">
                          Review a Restaurant
                        </RNText>
                        <RNText className="text-base text-slate-600 mt-1">
                          Share your dining discovery
                        </RNText>
                      </View>
                      <Box className="bg-gray-200 rounded-full p-3">
                        <Ionicons
                          name="chevron-forward"
                          size={22}
                          color="#F59E0B"
                        />
                      </Box>
                    </HStack>
                    <HStack className="flex-wrap">
                      {[
                        "Rate dishes",
                        "Share location",
                        "Food recommendations",
                      ].map((tag, index) => (
                        <RNText
                          key={index}
                          className="bg-gray-200 rounded-full px-4 py-2 text-sm mr-3 mb-2 font-medium"
                        >
                          {tag}
                        </RNText>
                      ))}
                    </HStack>
                  </TouchableOpacity>
                </Animated.View>

                <Animated.View entering={FadeInDown.duration(600).delay(500)}>
                  <TouchableOpacity
                    className="bg-slate-50 rounded-3xl p-6 py-5 mb-4"
                    onPress={() =>
                      setReviewData((prev) => ({
                        ...prev,
                        is_review: "homemade",
                      }))
                    }
                    activeOpacity={0.8}
                  >
                    <HStack className="items-center mb-5">
                      <Box className="p-4 rounded-2xl bg-gray-200">
                        <MaterialCommunityIcons
                          name="chef-hat"
                          size={28}
                          color="#F59E0B"
                        />
                      </Box>
                      <View className="ml-4 flex-1">
                        <RNText className="font-bold text-2xl text-slate-900">
                          Review Your Homemade Dish
                        </RNText>
                        <RNText className="text-base text-slate-600 mt-1">
                          Showcase your homemade creation
                        </RNText>
                      </View>
                      <Box className="bg-gray-200 rounded-full p-3">
                        <Ionicons
                          name="chevron-forward"
                          size={22}
                          color="#F59E0B"
                        />
                      </Box>
                    </HStack>
                    <HStack className="flex-wrap">
                      {["Share recipe", "Cooking tips", "Get feedback"].map(
                        (tag, index) => (
                          <RNText
                            key={index}
                            className="bg-gray-200 rounded-full px-4 py-2 text-sm mr-3 mb-2 font-medium"
                          >
                            {tag}
                          </RNText>
                        )
                      )}
                    </HStack>
                  </TouchableOpacity>
                </Animated.View>

                <Animated.View entering={FadeInDown.duration(600).delay(600)}>
                  <Box className="bg-amber-100 p-6 rounded-3xl mt-8">
                    <HStack className="items-center mb-3">
                      <Ionicons
                        name="information-circle"
                        size={24}
                        color="#F59E0B"
                      />
                      <RNText className="font-bold text-slate-800 ml-3 text-lg">
                        Foodie Community
                      </RNText>
                    </HStack>
                    <RNText className="text-slate-800 text-base leading-relaxed">
                      Your posts inspire our community of food lovers. Share
                      your culinary adventures and connect with others!
                    </RNText>
                  </Box>
                </Animated.View>
              </View>
            </Animated.View>
            <StatusBar backgroundColor="#fff" style="dark" />
          </ScrollView>
        </SafeAreaView>
      </ErrorBoundary>
    );
  }

  if (
    reviewData.is_review === "restaurant" ||
    reviewData.is_review === "homemade"
  ) {
    return (
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <StatusBar backgroundColor="#fff" style="dark" />
        <RestaurantCreation />;
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 42,
    fontWeight: "800",
    color: "#1F2937",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 8,
    lineHeight: 22,
  },

  imageContainer: {
    marginRight: 16,
    borderRadius: 20,
    overflow: "hidden",
    height: imageSize,
    width: imageSize,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  activeImageContainer: {
    borderWidth: 3,
    borderColor: "#F59E0B",
  },
  galleryImage: {
    height: "100%",
    width: "100%",
    borderRadius: 20,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  indicator: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 5,
  },
  activeIndicator: {
    backgroundColor: "#F59E0B",
    width: 24,
  },
});
