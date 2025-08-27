import { Modal, Pressable, View, Text, Animated } from "react-native";
import { Feather } from "@expo/vector-icons";

export const DropdownMenu = ({
  menuOpen,
  hideMenu,
  menuPosition,
  scaleValue,
  opacityValue,
  menuItems,
}) => (
  <Modal
    transparent
    visible={menuOpen}
    animationType="none"
    onRequestClose={hideMenu}
  >
    <Pressable style={{ flex: 1 }} onPress={hideMenu} className="flex-1">
      <View className="flex-1 relative">
        <Animated.View
          style={{
            position: "absolute",
            top: menuPosition.top,
            right: menuPosition.right,
            transform: [{ scale: scaleValue }],
            opacity: opacityValue,
          }}
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        >
          {/* Dropdown Arrow */}
          <View className="absolute -top-2 right-4 w-4 h-4 bg-white border-l border-t border-gray-100 transform rotate-45" />

          <View className="py-2 min-w-[200px]">
            {menuItems.map((item, index) => (
              <Pressable
                key={index}
                onPress={item.loading ? null : item.onPress}
                className={`flex-row items-center px-2 py-2 mx-2 rounded-xl ${
                  item.loading ? "opacity-50" : "active:scale-95"
                }`}
                style={({ pressed }) => ({
                  backgroundColor:
                    pressed && !item.loading
                      ? item.backgroundColor
                      : "transparent",
                  transform: [{ scale: pressed && !item.loading ? 0.98 : 1 }],
                })}
                disabled={item.loading}
              >
                <View
                  className="w-4 h-4 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: item.backgroundColor }}
                >
                  {item.loading ? (
                    <View className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Feather name={item.icon} size={16} color={item.color} />
                  )}
                </View>
                <Text
                  className={`text-sm font-medium flex-1 ${
                    item.loading ? "text-gray-400" : ""
                  }`}
                  style={{
                    color: item.loading
                      ? "#9CA3AF"
                      : item.destructive
                      ? item.color
                      : "#1F2937",
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </View>
    </Pressable>
  </Modal>
);
