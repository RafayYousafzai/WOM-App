import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Wifi, WifiOff } from "lucide-react-native";

interface NetworkErrorProps {
  onRetry: () => void;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({ onRetry }) => {
  return (
    <View className="flex-1 items-center justify-center py-20 px-6">
      <View className="bg-red-100 rounded-full p-6 mb-4">
        <WifiOff size={32} color="#ef4444" />
      </View>
      <Text className="text-gray-800 text-lg font-semibold mb-2 text-center">
        No Internet Connection
      </Text>
      <Text className="text-gray-500 text-sm mb-6 text-center">
        Please check your WiFi or mobile data connection and try again.
      </Text>
      <TouchableOpacity
        onPress={onRetry}
        className="bg-blue-500 px-6 py-3 rounded-lg flex-row items-center"
        activeOpacity={0.7}
      >
        <Wifi size={18} color="white" className="mr-2" />
        <Text className="text-white font-medium ml-2">Try Again</Text>
      </TouchableOpacity>
    </View>
  );
};
