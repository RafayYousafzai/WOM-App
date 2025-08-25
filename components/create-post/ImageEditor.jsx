"use client";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, TouchableOpacity, Animated, ScrollView } from "react-native";
import { View, Text } from "react-native";
import { useEffect, useState, useRef } from "react";
import { useReview } from "@/context/reviewContext";

export default function ImageEditor({}) {
  const { activeTab, getCurrentDish, handleDishImagesChange } = useReview();

  const dish = getCurrentDish();
  const [selectedIndex, setSelectedIndex] = useState(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setSelectedIndex(null);
  }, [activeTab]);

  useEffect(() => {
    if (selectedIndex !== null) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.95,
          useNativeDriver: true,
          tension: 150,
          friction: 8,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 150,
          friction: 8,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [selectedIndex]);

  const removeImage = (imageToRemove) => {
    handleDishImagesChange(
      (dish.images || []).filter((img) => img !== imageToRemove)
    );
  };

  const moveImage = (fromIndex, toIndex) => {
    const newImages = [...(dish.images || [])];
    const [movedItem] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedItem);
    handleDishImagesChange(newImages);
    setSelectedIndex(null);
  };

  const handleImagePress = (index) => {
    if (selectedIndex === null) {
      setSelectedIndex(index);
    } else if (selectedIndex === index) {
      setSelectedIndex(null);
    } else {
      moveImage(selectedIndex, index);
    }
  };

  const images = Array.isArray(dish?.images) ? dish.images : [];

  return (
    <View>
      <View style={{ marginBottom: 10 }}>
        <ScrollView
          horizontal
          style={{ flexDirection: "row" }}
          showsHorizontalScrollIndicator={false}
        >
          {images &&
            images.length > 0 &&
            images?.map((img, index) => (
              <View
                key={`${img}-${index}`}
                style={{ position: "relative", marginHorizontal: 7 }}
              >
                <TouchableOpacity
                  onPress={() => handleImagePress(index)}
                  activeOpacity={0.8}
                >
                  <Animated.View
                    style={{
                      transform: [
                        {
                          scale: selectedIndex === index ? scaleAnim : 1,
                        },
                      ],
                      opacity: selectedIndex === index ? fadeAnim : 1,
                    }}
                  >
                    <Image
                      source={{ uri: img || null }}
                      style={{
                        width: 140,
                        height: 140,
                        borderRadius: 20,
                        backgroundColor: "#f3f4f6",
                      }}
                    />
                    {selectedIndex === index && (
                      <View
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: "rgba(99, 102, 241, 0.3)",
                          borderRadius: 20,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <View
                          style={{
                            backgroundColor: "#6366F1",
                            borderRadius: 25,
                            padding: 12,
                          }}
                        >
                          <Ionicons name="checkmark" size={24} color="white" />
                        </View>
                      </View>
                    )}
                  </Animated.View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    padding: 8,
                    backgroundColor: "white",
                    borderRadius: 20,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                  }}
                  onPress={() => removeImage(img)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash" size={18} color="#dc2626" />
                </TouchableOpacity>

                <View
                  style={{
                    position: "absolute",
                    bottom: 8,
                    left: 8,
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    borderRadius: 16,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 14,
                      fontWeight: "bold",
                    }}
                  >
                    {index + 1}
                  </Text>
                </View>
              </View>
            ))}

          <TouchableOpacity
            onPress={() => router.replace("/camera")}
            style={{
              width: 140,
              height: 140,
              backgroundColor: "#F9FAFB",
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 2,
              borderStyle: "dashed",
              borderColor: "#D1D5DB",
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="camera" size={40} color="#6B7280" />
            <Text
              style={{
                fontSize: 14,
                color: "#6B7280",
                marginTop: 8,
                textAlign: "center",
                fontWeight: "500",
              }}
            >
              {images.length > 0 ? "Add More" : "Take Photos"}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {selectedIndex !== null && (
          <TouchableOpacity
            style={{
              marginTop: 24,
              padding: 16,
              backgroundColor: "#F3F4F6",
              borderRadius: 16,
            }}
            onPress={() => setSelectedIndex(null)}
            activeOpacity={0.8}
          >
            <Text
              style={{
                textAlign: "center",
                color: "#374151",
                fontWeight: "600",
                fontSize: 16,
              }}
            >
              Cancel Reordering
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
