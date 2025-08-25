"use client";

import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { useEffect, useRef } from "react";
import GoogleTextInput from "@/components/common/GooglePlacesInput";
import { Textarea, TextareaInput } from "@/components/ui";
import { Switch, Title, Paragraph } from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DishTypeModal } from "../shared-components/DishTypeModal";
import { DishTabs } from "../shared-components/DishTabs";
import { DishForm } from "../shared-components/DishForm";
import { useReview } from "@/context/reviewContext";
import { useGlobal } from "@/context/globalContext";
import { RatingStars } from "../shared-components/rating-stars";

export const Step1ImageSelection = () => {
  const {
    reviewData,
    handleChange,
    handleAddDishType,
    handleDishChange,
    getCurrentDish,
    showModal,
    setShowModal,
  } = useReview();
  const { postType } = useGlobal();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={{
                paddingHorizontal: 20,
                paddingTop: 20,
                paddingBottom: 16,
              }}
            >
              <Title
                style={{
                  fontSize: 32,
                  fontWeight: "bold",
                  color: "#1f2937",
                  marginBottom: 8,
                  letterSpacing: -0.5,
                }}
              >
                Review Information
              </Title>
            </View>

            <DishTabs />

            <DishForm
              dishData={getCurrentDish()}
              onDishChange={handleDishChange}
            />

            <View style={{ paddingHorizontal: 0, marginBottom: 24 }}>
              {/* <Title
                style={{
                  fontSize: 32,
                  fontWeight: "bold",
                  color: "#1f2937",
                  marginBottom: 8,
                  letterSpacing: -0.5,
                  marginLeft: 20,
                }}
              >
                Restaurant Information
              </Title> */}

              <View
                style={{
                  borderRadius: 16,
                  backgroundColor: "#ffffff",
                }}
              >
                <View style={{ paddingHorizontal: 20 }}>
                  <GoogleTextInput
                    containerStyle={{
                      flex: 1,
                    }}
                    handlePress={(val) => handleChange("location", val)}
                    initialLocation={reviewData.location}
                    textInputBackgroundColor="#f9fafb"
                  />
                </View>
              </View>

              <View
                style={{
                  elevation: 4,
                  borderRadius: 16,
                  backgroundColor: "#ffffff",
                  minHeight: 200,
                }}
              >
                <View style={{ padding: 20 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    Your Review
                  </Text>
                  <Textarea
                    size="lg"
                    style={{
                      backgroundColor: "#f9fafb",
                      borderRadius: 16,
                      borderWidth: 0,
                      minHeight: 140,
                    }}
                  >
                    <TextareaInput
                      value={reviewData.review}
                      onChangeText={(text) => handleChange("review", text)}
                      placeholder="Share your experience at this restaurant..."
                      placeholderTextColor="#343a40" // This will definitely work with TextInput
                      multiline
                      style={{
                        fontSize: 17, // Larger font size
                        lineHeight: 24,
                        color: "#374151",
                        padding: 16,
                      }}
                    />
                  </Textarea>
                </View>
              </View>
            </View>

            {postType === "homemade" && (
              <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
                <View
                  style={{
                    elevation: 4,
                    borderRadius: 16,
                    backgroundColor: "#ffffff",
                  }}
                >
                  <View style={{ padding: 20 }}>
                    <RatingStars
                      rating={reviewData.rating}
                      setRating={(rating) => handleChange("rating", rating)}
                    />
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
      <DishTypeModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSelectType={handleAddDishType}
      />
    </GestureHandlerRootView>
  );
};
