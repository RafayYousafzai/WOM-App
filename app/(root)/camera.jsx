import CameraScreen from "@/components/camera/CameraScreen";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

export default function CameraPage() {
  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar backgroundColor="#000" style="light" />
      <CameraScreen />
    </View>
  );
}
