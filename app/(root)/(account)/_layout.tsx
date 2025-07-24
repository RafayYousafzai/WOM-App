import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="account-details" />
      <Stack.Screen name="account-settings" />
      <Stack.Screen name="followers" />
      <Stack.Screen name="following" />
    </Stack>
  );
}
