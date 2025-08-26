import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Plus, X } from "lucide-react-native";
import { useReview } from "@/context/reviewContext";

export const DishTabs = () => {
  const { reviewData, handleRemoveTab, activeTab, setActiveTab, setShowModal } =
    useReview();

  const onAddDish = () => setShowModal(true);
  const onRemoveTab = (id) => handleRemoveTab(id);
  const dishTypes = reviewData.dishTypes;

  return (
    <View className="bg-white/95 backdrop-blur-lg rounded-3xl mb-6 p-4">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
        contentContainerStyle={{ paddingHorizontal: 4 }}
      >
        {dishTypes.map((dish, index) => (
          <View key={dish.id} className="flex-row items-center">
            <TouchableOpacity
              onPress={() => setActiveTab(dish.id)}
              className={`px-6 py-4 rounded-2xl mr-3 flex-row items-center min-h-[56px] ${
                activeTab === dish.id ? "bg-[#f39f1e]" : "bg-slate-100/90"
              }`}
              style={
                activeTab === dish.id
                  ? {
                      shadowColor: "#f59e0b",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.15,
                      shadowRadius: 2,
                      elevation: 2,
                    }
                  : {}
              }
            >
              <Text
                className={`text-base font-semibold ${
                  activeTab === dish.id ? "text-white" : "text-gray-700"
                }`}
              >
                {dish.name}
              </Text>

              {/* Remove button for non-main course tabs */}
              {dish.id !== "main-course" && (
                <TouchableOpacity
                  onPress={() => onRemoveTab(dish.id)}
                  className="ml-5 bg-red-100/90 rounded-full p-2"
                >
                  <X size={16} color="#ef4444" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>
        ))}

        {/* Add new dish type button */}
        <TouchableOpacity
          onPress={onAddDish}
          className="bg-slate-200/90 rounded-2xl px-5 py-4 flex-row items-center justify-center min-w-[56px] min-h-[56px]"
        >
          <Plus size={22} color="#374151" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
