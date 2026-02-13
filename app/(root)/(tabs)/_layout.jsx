import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";

const ORANGE = "#f39f1e";

export default function TabLayout() {
  return (
    <NativeTabs
      backgroundColor="#FFFFFF"
      blurEffect="systemThinMaterial"
      shadowColor="rgba(0, 0, 0, 0.15)"
      backBehavior="history"
      labelVisibilityMode="selected"
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
            default: require("@/assets/icons/home.png"),
            selected: require("@/assets/icons/home-solid.png"),
          }}
        />
        <Label>Home</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search">
        <Icon
          sf={{ default: "fork.knife", selected: "fork.knife" }}
          androidSrc={{
            default: require("@/assets/icons/fork.png"),
            selected: require("@/assets/icons/fork-solid.png"),
          }}
        />
        <Label>Search</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="create-review">
        <Icon
          sf={{ default: "plus.circle", selected: "plus.circle.fill" }}
          androidSrc={{
            default: require("@/assets/icons/upload.png"),
            selected: require("@/assets/icons/upload.png"),
          }}
        />
        <Label>Create</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="favorites">
        <Icon
          sf={{ default: "heart", selected: "heart.fill" }}
          androidSrc={{
            default: require("@/assets/icons/heart.png"),
            selected: require("@/assets/icons/heart-solid.png"),
          }}
        />
        <Label>Favorites</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Icon
          sf={{ default: "person", selected: "person.fill" }}
          androidSrc={{
            default: require("@/assets/icons/account.png"),
            selected: require("@/assets/icons/account-solid.png"),
          }}
        />
        <Label>Profile</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="draft-manager" hidden />
    </NativeTabs>
  );
}
