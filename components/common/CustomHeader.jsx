import { router, useNavigation } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CustomHeader = ({ statusbarPad = false, handleBack }) => {
  const insets = useSafeAreaInsets();
  const nav = useNavigation();

  const onBackPress = () => {
    if (handleBack && typeof handleBack === "function") {
      handleBack();
    } else if (nav.canGoBack()) {
      nav.goBack();
    } else {
      // 👇 Go home if no back available
      router.push("/home"); // replace with your home route group name
    }
  };

  return (
    <View
      className="flex-row mt-3 items-center justify-between px-4 py-3 bg-white"
      style={{ paddingTop: statusbarPad ? insets.top : 0 }}
    >
      {/* Back / Home Button */}
      <TouchableOpacity
        onPress={onBackPress}
        className="p-2 bg-gray-200 rounded-full"
      >
        <ArrowLeft size={20} color="#374151" />
      </TouchableOpacity>

      {/* Screen Title */}
      <Text className="text-lg font-semibold text-black">Word Of Mouth</Text>

      {/* Right Placeholder */}
      <View className="w-8" />
    </View>
  );
};

export default CustomHeader;
