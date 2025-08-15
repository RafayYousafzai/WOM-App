import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Plus, X } from "lucide-react-native";

export const DishTabs = ({
  dishTypes,
  activeTab,
  onTabChange,
  onAddDish,
  onRemoveTab,
}) => {
  return (
    <View className="bg-white/90 backdrop-blur-lg rounded-2xl mx-4 mb-4 p-2 shadow-lg border border-slate-200/50">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
      >
        {dishTypes.map((dish, index) => (
          <View key={dish.id} className="flex-row items-center">
            <TouchableOpacity
              onPress={() => onTabChange(dish.id)}
              className={`px-4 py-3 rounded-xl mr-2 flex-row items-center ${
                activeTab === dish.id
                  ? "bg-[#f39f1e] shadow-md"
                  : "bg-slate-100/80"
              }`}
              style={
                activeTab === dish.id
                  ? {
                      shadowColor: "#f59e0b",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 5,
                    }
                  : {}
              }
            >
              <Text
                className={`text-sm font-medium ${
                  activeTab === dish.id ? "text-white" : "text-gray-600"
                }`}
              >
                {dish.name}
              </Text>

              {/* Remove button for non-main course tabs */}
              {dish.id !== "main-course" && (
                <TouchableOpacity
                  onPress={() => onRemoveTab(dish.id)}
                  className="ml-2 bg-red-100 rounded-full p-1"
                >
                  <X size={12} color="#ef4444" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>
        ))}

        {/* Add new dish type button */}
        <TouchableOpacity
          onPress={onAddDish}
          className="bg-slate-200/80 rounded-xl px-3 py-3 flex-row items-center justify-center min-w-[50px]"
        >
          <Plus size={18} color="#374151" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
