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

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      // Reload user data from Clerk
      await clerkUser?.reload();

      // Add any other data refresh logic here
      // For example, if you have other API calls to refresh data:
      // await refreshUserProfile();
      // await refreshUserPreferences();
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [clerkUser]);

  useFocusEffect(
    useCallback(() => {
      if (isLoaded && isSignedIn) {
        if (!clerkUser?.firstName) {
          setIsEditing(true);
        }
      }
    }, [isLoaded, isSignedIn, clerkUser])
  );

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
              <EditProfileScreen setIsEditing={setIsEditing} />
            ) : (
              <ProfileContentScreen setIsEditing={setIsEditing} />
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
