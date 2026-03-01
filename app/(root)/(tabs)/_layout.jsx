import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import {
  Platform,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, Tabs } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { useDish } from "@/context/dishContext";
import { useReview } from "@/context/reviewContext";
import { useGlobal } from "@/context/globalContext";

const ORANGE = "#f39f1e";

// Custom tab bar component for Android
function CustomTabBar({ state, descriptors, navigation, theme }) {
  const { user } = useUser();
  const { setSelectedImages, setPostType } = useGlobal();
  const { drafts: hasDishDraft } = useDish();
  const { drafts: hasReviewDraft } = useReview();

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
                if (isFocused) {
                  navigation.navigate("home", { scrollToTop: true });
                } else {
                  navigation.navigate(route.name);
                }
                return;
              }

              if (route.name === "create-review") {
                resetStates();

                if (hasDishDraft || hasReviewDraft) {
                  router.push("/create-review");
                  // router.push("/draft-manager");
                  return;
                }
              }

              if (route.name === "favorites") {
                resetStates();
              }

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
  if (Platform.OS === "android") {
    const theme = {
      colors: {
        primary: ORANGE,
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

  // iOS layout
  return (
    <NativeTabs
      backgroundColor="#FFFFFF"
      blurEffect="systemThinMaterial"
      shadowColor="rgba(0, 0, 0, 0.15)"
      backBehavior="history"
      labelVisibilityMode="labeled"
      badgeBackgroundColor={"#f39f1e4d"}
      indicatorColor={"#f39f1e33"}
      tintColor={ORANGE}
      labelStyle={{
        default: { color: "#888888", fontSize: 11, fontWeight: "500" },
        selected: { color: ORANGE, fontSize: 11, fontWeight: "700" },
      }}
    >
      <NativeTabs.Trigger name="home">
        <Icon
          sf={{ default: "house", selected: "house.fill" }}
          androidSrc={{
            default: require("../../../assets/icons/home.png"),
            selected: require("../../../assets/icons/home-solid.png"),
          }}
        />
        <Label>Home</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search" role="search">
        <Label>Search</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="create-review">
        <Icon
          sf={{ default: "plus.circle", selected: "plus.circle.fill" }}
          androidSrc={{
            default: require("../../../assets/icons/upload.png"),
            selected: require("../../../assets/icons/upload.png"),
          }}
        />
        <Label>Create</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="favorites">
        <Icon
          sf={{ default: "heart", selected: "heart.fill" }}
          androidSrc={{
            default: require("../../../assets/icons/heart.png"),
            selected: require("../../../assets/icons/heart-solid.png"),
          }}
        />
        <Label>Favorites</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Icon
          sf={{ default: "person", selected: "person.fill" }}
          androidSrc={{
            default: require("../../../assets/icons/account.png"),
            selected: require("../../../assets/icons/account-solid.png"),
          }}
        />
        <Label>Profile</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="draft-manager" hidden />
    </NativeTabs>
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
    shadowColor: ORANGE,
  },
  activeIndicator: {
    position: "absolute",
    bottom: 15,
    height: 3,
    width: 24,
    borderRadius: 3,
  },
});
