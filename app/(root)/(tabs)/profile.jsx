"use client";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  RefreshControl,
} from "react-native";

import { EditProfileScreen } from "@/components/profile-view/ProfileEdit";
import { ProfileContentScreen } from "@/components/profile-view/ProfileContent";
import UnloggedState from "@/components/auth/unlogged-state";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { user: clerkUser, isLoaded } = useUser();
  const { isSignedIn } = useAuth();

  const scrollY = new Animated.Value(0);

  const [isEditing, setIsEditing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    const count = refreshCount + 1;

    setRefreshCount(count);

    try {
      await clerkUser?.reload();
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(() => {
    if (isLoaded && isSignedIn) {
      if (!clerkUser?.firstName) {
        setIsEditing(true);
      }
    }
  });

  if (!isSignedIn) {
    return <UnloggedState />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {isLoaded ? (
          <Animated.ScrollView
            className="flex-1 rounded-t-3xl"
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              {
                useNativeDriver: false,
              }
            )}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#f39f1e"]} // Android
                tintColor="#f39f1e" // iOS
                title="Pull to refresh" // iOS
                titleColor="#f39f1e" // iOS
              />
            }
          >
            <View style={{ height: 16 }} />
            {isEditing ? (
              <EditProfileScreen
                setIsEditing={setIsEditing}
                refreshing={refreshing}
                setRefreshing={setRefreshing}
                setRefreshCount={setRefreshCount}
                refreshCount={refreshCount}
              />
            ) : (
              <ProfileContentScreen
                setIsEditing={setIsEditing}
                setRefreshing={setRefreshing}
                setRefreshCount={setRefreshCount}
                refreshCount={refreshCount}
              />
            )}
            <View style={{ height: 100 }} />
          </Animated.ScrollView>
        ) : (
          <ActivityIndicator size="large" color="#f39f1e" className="flex-1" />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
