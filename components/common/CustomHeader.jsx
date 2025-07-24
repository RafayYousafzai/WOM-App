import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CustomHeader = ({ statusbarPad = false, handleBack }) => {
  const insets = useSafeAreaInsets();
  const nav = useNavigation();

  // Determine the back action
  const onBackPress =
    handleBack && typeof handleBack === "function"
      ? handleBack
      : () => nav.goBack();

  return (
    <View
      className="flex-row mt-3 items-center justify-between px-4 py-3 bg-white "
      style={{ paddingTop: statusbarPad ? insets.top : 0 }}
    >
      {/* Back Button (Only Shows When Possible) */}
      {nav?.canGoBack() ? (
        <TouchableOpacity
          onPress={onBackPress}
          className="p-2 bg-gray-200 rounded-full"
        >
          <ArrowLeft size={20} color="#374151" />
        </TouchableOpacity>
      ) : (
        <View className="w-8" /> // Placeholder to keep title centered
      )}

      {/* Screen Title */}
      <Text className="text-lg font-semibold text-black">Word Of Mouth</Text>

      {/* Right Placeholder (Can Add Icons Here Later) */}
      <View className="w-8" />
    </View>
  );
};

export default CustomHeader;
