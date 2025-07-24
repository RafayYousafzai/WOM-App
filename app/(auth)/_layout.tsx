import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { AuthProvider } from "@/context/authContext";

export default function AuthRoutesLayout() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Redirect href={"/home"} />;
  }

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
