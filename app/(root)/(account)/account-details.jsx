"use client";
import { useUser } from "@clerk/clerk-expo";
import { router, useFocusEffect } from "expo-router";
import { useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from "react-native";

import { EditProfileScreen } from "@/components/profile-view/ProfileEdit";

export default function ProfileScreen() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const scrollY = new Animated.Value(0);

  const [isEditing, setIsEditing] = useState(false);

  useFocusEffect(() => {
    if (isLoaded && isSignedIn) {
      if (!clerkUser?.firstName || !clerkUser?.username) {
        setIsEditing(true);
      } else {
        router.push("home");
      }
    }
  });

  return (
    <View className="flex-1 bg-white mt-6">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {isLoaded ? (
          <Animated.ScrollView
            className="flex-1 bg-white rounded-t-3xl   "
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              {
                useNativeDriver: false,
              }
            )}
            scrollEventThrottle={16}
          >
            <View style={{ height: 16 }} />
            <EditProfileScreen setIsEditing={setIsEditing} />

            <View style={{ height: 100 }} />
          </Animated.ScrollView>
        ) : (
          <ActivityIndicator size="large" color="#f39f1e" className="flex-1" />
        )}
      </KeyboardAvoidingView>
    </View>
  );
}
