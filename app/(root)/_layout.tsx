import { useUser } from "@clerk/clerk-expo";
import { Stack, router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { ActivityIndicator } from "react-native";
import "react-native-url-polyfill/auto";
import "react-native-get-random-values";

export default function RoutesLayout() {
  const { user, isLoaded, isSignedIn } = useUser();

  useFocusEffect(
    useCallback(() => {
      if (isLoaded && isSignedIn) {
        const missingDetails = !user?.firstName || !user?.username;
        if (missingDetails) {
          router.replace("/account-details");
        }
      }
    }, [isLoaded, isSignedIn, user])
  );

  if (!isLoaded) {
    return <ActivityIndicator />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: "ios_from_right" }}>
      {/* This customizes the /comments route */}
      <Stack.Screen
        name="comments"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen name="sharedlink/[id]" />
      {/* All other screens are automatically included */}
    </Stack>
  );
}
