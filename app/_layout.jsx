import "./global.css";

import { tokenCache } from "@/lib/cache";

import { createContext, useState, useEffect } from "react";
import { SplashScreen, Stack, useRouter } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { ToastProvider } from "react-native-toast-notifications";
import { DishProvider } from "@/context/dishContext";
import { GluestackUIProvider } from "@/components/ui";
import { SearchProvider } from "@/context/searchContext";
import { GlobalProvider } from "@/context/globalContext";
import { ReviewProvider } from "@/context/reviewContext";
import { SupabaseProvider } from "@/context/supabaseContext";
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import { StatusBar } from "expo-status-bar";
import NotificationConfig from "@/lib/notifications/NotificationConfig";
import * as Linking from "expo-linking";
import { InteractionManager } from "react-native";
import { UploadProvider } from "@/context/upload-context";
import { LoadingPopover } from "@/components/LoadingPopover";

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env"
  );
}

const defaultTheme = "light";

export const ThemeContext = createContext({
  colorMode: "light",
  toggleColorMode: () => {},
});

export default function RootLayoutNav() {
  const [colorMode, setColorMode] = useState(defaultTheme);
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Set isReady to true after initial render
    setIsReady(true);
  }, []);

  useEffect(() => {
    const handleDeepLink = (url) => {
      console.log("🔗 Deep link received:", url);
      const { path, queryParams } = Linking.parse(url);

      if (path?.startsWith("post/")) {
        const postId = path.split("/")[1];
        const postType = queryParams?.type || "review";

        console.log("📩 Post ID:", postId);
        console.log("📄 Post Type:", postType);

        // Ensure navigation only happens when the app is ready
        router.push({
          pathname: "/(root)/post/[id]",
          params: {
            id: postId,
            postType,
          },
        });
      }
    };
    // App launched via link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // App already open
    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink(url);
    });

    return () => subscription?.remove();
  }, [isReady]);

  const toggleColorMode = () => {
    setColorMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <SupabaseProvider>
          <ThemeContext.Provider value={{ colorMode, toggleColorMode }}>
            <GluestackUIProvider mode={colorMode}>
              <ToastProvider>
                <PaperProvider>
                  <GlobalProvider>
                    <SearchProvider>
                      <UploadProvider>
                        <DishProvider>
                          <ReviewProvider>
                            <LoadingPopover />
                            <NotificationConfig />
                            <StatusBar backgroundColor="#fff" style="dark" />

                            <Stack
                              screenOptions={{
                                headerShown: false,
                                animation: "fade_from_bottom",
                              }}
                            >
                              <Stack.Screen name="index" />
                              <Stack.Screen name="(auth)" />
                              <Stack.Screen name="(root)" />
                            </Stack>
                          </ReviewProvider>
                        </DishProvider>
                      </UploadProvider>
                    </SearchProvider>
                  </GlobalProvider>
                </PaperProvider>
              </ToastProvider>
            </GluestackUIProvider>
          </ThemeContext.Provider>
        </SupabaseProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
