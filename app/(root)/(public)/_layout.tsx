import { Stack } from "expo-router";
import CustomHeader from "@/components/common/CustomHeader";

export default function RoutesLayout() {
  return (
    <Stack
      screenOptions={{
        header: (props) => <CustomHeader statusbarPad={true} handleBack={undefined} />, // Custom Header
        animation: "fade",
      }}
    />
  );
}
