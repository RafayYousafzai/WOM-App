import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Animated,
} from "react-native";
import { X } from "lucide-react-native";

const dishTypes = [
  { id: "appetizer", name: "Appetizer" },
  { id: "beverage", name: "Beverage" },
  { id: "seafood", name: "Seafood" },
  { id: "dessert", name: "Dessert" },
  { id: "soup", name: "Soup" },
  { id: "salad", name: "Salad" },
  { id: "pasta", name: "Pasta" },
  { id: "pizza", name: "Pizza" },
  { id: "sandwich", name: "Sandwich" },
  { id: "burger", name: "Burger" },
  { id: "steak", name: "Steak" },
  { id: "chicken", name: "Chicken" },
  { id: "vegetarian", name: "Vegetarian" },
  { id: "vegan", name: "Vegan" },
  { id: "healthy", name: "Healthy" },
  { id: "comfort-food", name: "Comfort Food" },
];

export const DishTypeModal = ({ visible, onClose, onSelectType }) => {
  const [scaleAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  const handleSelectType = (type) => {
    onSelectType(type);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/60 justify-center items-center px-4"
        onPress={onClose}
      >
        <Animated.View
          style={{ transform: [{ scale: scaleAnim }] }}
          className="w-full max-w-sm"
        >
          <Pressable
            className="bg-white rounded-2xl p-6"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.25,
              shadowRadius: 20,
              elevation: 20,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-900">
                Select Dish Type
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="bg-gray-100 rounded-full p-2"
              >
                <X size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* Dish Types Grid */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 400 }}
            >
              <View className="flex-row flex-wrap justify-between">
                {dishTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    onPress={() => handleSelectType(type)}
                    className="w-[48%] bg-gray-50 border border-gray-200 rounded-xl p-4 mb-3"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 6,
                      elevation: 2,
                    }}
                  >
                    <Text className="text-sm font-medium text-gray-800 text-center">
                      {type.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};
