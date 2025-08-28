import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Animated,
  Image,
} from "react-native";
import { Avatar } from "react-native-paper";
import { Feather } from "@expo/vector-icons";

export const BottomModal = ({
  bottomModalVisible,
  hideBottomModal,
  overlayOpacity,
  slideAnim,
  navigateToProfile,
  navigateToLocation,
  userAvatar,
  username,
  gatekeepingEnabled,
  location,
}) => (
  <Modal
    transparent
    visible={bottomModalVisible}
    animationType="none"
    onRequestClose={hideBottomModal}
  >
    <View style={{ flex: 1 }}>
      {/* Overlay */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "black",
          opacity: overlayOpacity,
        }}
      />

      {/* Backdrop touchable */}
      <Pressable style={{ flex: 1 }} onPress={hideBottomModal} />

      {/* Bottom Sheet */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          transform: [{ translateY: slideAnim }],
        }}
        className="bg-white rounded-t-3xl shadow-2xl"
      >
        {/* Handle bar */}
        <View className="items-center pt-3 pb-2">
          <View className="w-12 h-1 bg-gray-300 rounded-full" />
        </View>

        <View className="px-6 pb-8">
          <Text className="text-xl font-bold text-gray-900 text-center mb-6">
            Choose an option
          </Text>

          {/* Profile Option */}
          <TouchableOpacity
            onPress={navigateToProfile}
            className="bg-gray-200 py-4 px-6 rounded-2xl shadow-sm active:scale-95 mb-3"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center">
              <Avatar.Image
                size={40}
                source={{ uri: userAvatar }}
                className="bg-gray-100"
              />
              <View className="ml-4 flex-1">
                <Text className="text-black font-semibold text-base">
                  {username}
                </Text>
                <Text className="text-gray-700 text-sm">View Profile</Text>
              </View>
              <Feather name="user" size={20} color="black" />
            </View>
          </TouchableOpacity>

          {/* Location Option - only show if location exists and not gatekeeping */}
          {!gatekeepingEnabled && location && (
            <TouchableOpacity
              onPress={navigateToLocation}
              className="bg-gray-200 py-4 px-6 rounded-2xl shadow-sm active:scale-95 mb-3"
              activeOpacity={0.8}
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
                  <Image
                    source={require("../../../assets/icons/marker.png")}
                    className="w-5 h-5"
                  />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-black font-semibold text-base">
                    {location.split(",")[0]}
                  </Text>
                  <Text className="text-gray-700 text-sm">View Restaurant</Text>
                </View>
                <Feather name="map-pin" size={20} color="black" />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </View>
  </Modal>
);
