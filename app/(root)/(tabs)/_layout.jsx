import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, Tabs } from "expo-router";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useDish } from "@/context/dishContext";
import { useReview } from "@/context/reviewContext";
import { useGlobal } from "@/context/globalContext";

// Custom tab bar component that preserves your styling
function CustomTabBar({ state, descriptors, navigation, theme }) {
  const { user } = useUser();
  const { setSelectedImages, setPostType } = useGlobal();
  const { drafts: hasDishDraft } = useDish();
  const { drafts: hasReviewDraft } = useReview();

  // Map routes to your custom configuration
  const routes = [
    {
      key: "home",
      focusedImage: require("@/assets/icons/home-solid.png"),
      unfocusedImage: require("@/assets/icons/home.png"),
      useCustomImage: true,
    },
    {
      key: "search",
      focusedImage: require("@/assets/icons/fork-solid.png"),
      unfocusedImage: require("@/assets/icons/fork.png"),
      useCustomImage: true,
    },
    {
      key: "create-review",
      focusedIcon: "plus",
      unfocusedIcon: "plus",
      special: true,
    },
    {
      key: "favorites",
      focusedImage: require("@/assets/icons/heart-outline.png"),
      unfocusedImage: require("@/assets/icons/heart.png"),
      useCustomImage: true,
    },
    {
      key: "profile",
      focusedImage: user?.imageUrl
        ? { uri: user.imageUrl }
        : require("@/assets/icons/account-solid.png"),
      unfocusedImage: user?.imageUrl
        ? { uri: user.imageUrl }
        : require("@/assets/icons/account.png"),
      useCustomImage: true,
    },
  ];

  const resetStates = () => {
    setSelectedImages([]);
    setPostType(null);
  };

  return (
    <View style={styles.bottomBarContainer}>
      <View
        style={[
          styles.bottomNav,
          {
            backgroundColor: theme.colors.navBackground,
            shadowColor: theme.colors.navShadow,
          },
        ]}
      >
        {state.routes
          .filter((route) => route.name !== "draft-manager")
          .map((route, index) => {
            const isFocused = state.index === index;
            const customRoute = routes.find((r) => r.key === route.name) || {};

            const iconColor = customRoute.special
              ? "#FFFFFF"
              : isFocused
              ? theme.colors.primary
              : "#888888";

            const onPress = () => {
              if (route.name === "home") {
                // Check if home tab is already focused
                if (isFocused) {
                  // Navigate to home with scroll to top parameter
                  navigation.navigate("home", { scrollToTop: true });
                } else {
                  // Just navigate to home normally
                  navigation.navigate(route.name);
                }
                return; // Exit early for home tab
              }

              // Handle create-review and draft logic
              if (route.name === "create-review") {
                resetStates();

                if (hasDishDraft || hasReviewDraft) {
                  router.push("/draft-manager");
                  return;
                }
              }

              // Handle favorites
              if (route.name === "favorites") {
                resetStates();
              }

              // Default navigation behavior
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                style={[
                  styles.navItem,
                  customRoute.special && styles.specialNavItem,
                ]}
                onPress={onPress}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.navItemContent,
                    customRoute.special && [
                      styles.specialNavItemContent,
                      { backgroundColor: theme.colors.primary },
                    ],
                  ]}
                >
                  {customRoute.key === "profile" && user?.imageUrl ? (
                    <Image
                      source={{ uri: user.imageUrl }}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 15,
                      }}
                      resizeMode="cover"
                    />
                  ) : customRoute.useCustomImage ? (
                    <Image
                      source={
                        isFocused
                          ? customRoute.focusedImage
                          : customRoute.unfocusedImage
                      }
                      style={{
                        width: customRoute.special ? 24 : 24,
                        height: customRoute.special ? 24 : 24,
                        tintColor: iconColor,
                      }}
                      resizeMode="contain"
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name={
                        isFocused
                          ? customRoute.focusedIcon
                          : customRoute.unfocusedIcon
                      }
                      size={customRoute.special ? 30 : 24}
                      color={iconColor}
                    />
                  )}
                </View>

                {isFocused && !customRoute.special && (
                  <View
                    style={[
                      styles.activeIndicator,
                      { backgroundColor: theme.colors.primary },
                    ]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  // Define your theme
  const theme = {
    colors: {
      primary: "#f39f1e",
      navBackground: "#FFFFFF",
      navShadow: "#00000020",
    },
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" },
        animation: "fade",
      }}
      tabBar={(props) => <CustomTabBar {...props} theme={theme} />}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="create-review" />
      <Tabs.Screen name="favorites" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen
        name="draft-manager"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bottomBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "transparent",
  },
  bottomNav: {
    flexDirection: "row",
    height: 80,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  navItemContent: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -8,
  },
  specialNavItem: {
    marginTop: -5,
  },
  specialNavItemContent: {
    width: 38,
    height: 38,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 8,
    shadowColor: "#f39f1e",
  },
  activeIndicator: {
    position: "absolute",
    bottom: 15,
    height: 3,
    width: 24,
    borderRadius: 3,
  },
});