// DishSidebar.tsx
import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

interface DishTypesSectionProps {
  dishes: any[];
  onClose: () => void;
}

export const DishTypesSection: React.FC<DishTypesSectionProps> = ({
  dishes,
  onClose,
}) => {
  const slideAnim = useRef(new Animated.Value(width)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, opacityAnim]);

  const closeSidebar = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  return (
    <>
      {/* Overlay Background */}
      <Animated.View
        style={{
          opacity: opacityAnim,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          zIndex: 40,
        }}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={closeSidebar}
        />
      </Animated.View>

      {/* Sidebar */}
      <Animated.View
        style={{
          transform: [{ translateX: slideAnim }],
          position: "absolute",
          top: 0,
          right: 0,
          width: width * 0.85,
          height: height,
          backgroundColor: "#ffffff",
          zIndex: 50,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: -2, height: 0 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
        }}
      >
        {/* Header */}
        <View
          style={{
            paddingTop: 50, // Account for status bar
            paddingHorizontal: 20,
            paddingBottom: 15,
            borderBottomWidth: 1,
            borderBottomColor: "#e5e7eb",
            backgroundColor: "#f8fafc",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "#1f2937",
                }}
              >
                Other Dishes
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: "#6b7280",
                  marginTop: 2,
                }}
              >
                {dishes.length} dish{dishes.length > 1 ? "es" : ""} available
              </Text>
            </View>
            <TouchableOpacity
              onPress={closeSidebar}
              style={{
                padding: 8,
                borderRadius: 20,
                backgroundColor: "#e5e7eb",
              }}
            >
              <Ionicons name="close" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Dishes List */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {dishes.map((dish, index) => (
            <View
              key={index}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderBottomWidth: index < dishes.length - 1 ? 1 : 0,
                borderBottomColor: "#f3f4f6",
                backgroundColor: "#ffffff",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#1f2937",
                      marginBottom: 4,
                    }}
                  >
                    {dish.dish_name}
                  </Text>

                  {dish.review && (
                    <View
                      style={{
                        backgroundColor: "#f9fafb",
                        padding: 8,
                        borderRadius: 6,
                        marginTop: 4,
                        borderLeftWidth: 3,
                        borderLeftColor: "#e5e7eb",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#6b7280",
                          fontStyle: "italic",
                        }}
                      >
                        "{dish.review}"
                      </Text>
                    </View>
                  )}
                </View>

                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "#059669",
                      marginBottom: 4,
                    }}
                  >
                    ${dish.price}
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#fef3c7",
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 12,
                    }}
                  >
                    <FontAwesome name="star" size={12} color="#f59e0b" />
                    <Text
                      style={{
                        marginLeft: 4,
                        fontSize: 13,
                        fontWeight: "500",
                        color: "#92400e",
                      }}
                    >
                      {dish.rating.toFixed(1)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </Animated.View>
    </>
  );
};
