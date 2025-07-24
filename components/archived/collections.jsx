import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HomeIcon, ChartBarIcon } from "react-native-heroicons/outline";
import { StarIcon as StarIconSolid } from "react-native-heroicons/solid";
import { classNames } from "@/utils/classNames";

// Sample data for the favorites/collections
const collections = [
  // {
  //   id: 1,
  //   title: "All",
  //   amount: 180,
  //   target: 300,
  //   percentage: 60,
  //   category: "sport",
  //   color: "bg-purple-200",
  //   textColor: "text-purple-800",
  //   tagColor: "bg-purple-300",
  // },
  {
    id: 2,
    title: "Wishlists",
    amount: 144,
    target: 800,
    percentage: 18,
    category: "game",
    color: "bg-blue-200",
    textColor: "text-blue-800",
    tagColor: "bg-blue-300",
  },
  {
    id: 3,
    title: "Recipe",
    amount: 240,
    target: 240,
    percentage: 100,
    category: "entertainment",
    color: "bg-yellow-200",
    textColor: "text-yellow-800",
    tagColor: "bg-yellow-300",
    completed: true,
  },
  {
    id: 4,
    title: "History",
    amount: 75,
    target: 150,
    percentage: 50,
    category: "tech",
    color: "bg-green-200",
    textColor: "text-green-800",
    tagColor: "bg-green-300",
  },
  {
    id: 5,
    title: "My Likes",
    amount: 120,
    target: 200,
    percentage: 60,
    category: "outdoor",
    color: "bg-pink-200",
    textColor: "text-pink-800",
    tagColor: "bg-pink-300",
  },
];

export default function Favorites() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-5 pt-4">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Header */}
          <View className="px-2 pt-8 pb-4">
            <View>
              <Text className="text-6xl font-extrabold text-slate-900">
                Collections
              </Text>
              <Text className="text-sm text-slate-500 mt-2 font-medium">
                Discover trending restaurants and find what you're looking for
              </Text>
            </View>
          </View>

          {/* Collections List */}
          {collections.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.9}
              className={classNames(
                "mb-4 rounded-3xl p-4 shadow-sm",
                item.color
              )}
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text
                    className={classNames(
                      "text-lg font-bold mb-1",
                      item.textColor
                    )}
                  >
                    {item.title}
                  </Text>
                  <Text
                    className={classNames(
                      "text-base font-medium",
                      item.textColor
                    )}
                  >
                    ${item.amount} of ${item.target}
                  </Text>

                  <View className="flex-row items-center mt-2">
                    <View
                      className={classNames(
                        "px-2 py-1 rounded-full mr-2",
                        item.tagColor
                      )}
                    >
                      <Text
                        className={classNames(
                          "text-xs font-medium",
                          item.textColor
                        )}
                      >
                        #{item.category}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="items-center justify-center">
                  {item.completed ? (
                    <View className="w-8 h-8 rounded-full bg-green-600 items-center justify-center">
                      <Text className="text-white font-bold">✓</Text>
                    </View>
                  ) : (
                    <Text
                      className={classNames(
                        "text-3xl font-black",
                        item.textColor
                      )}
                    >
                      {item.percentage}%
                    </Text>
                  )}
                </View>
              </View>

              {/* Progress bar */}
              <View className="h-2 bg-white/50 rounded-full mt-3 overflow-hidden">
                <View
                  className="h-full bg-white"
                  style={{ width: `${item.percentage}%` }}
                />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Bottom Navigation */}
        <View className="h-16 flex-row justify-around items-center bg-white rounded-t-3xl shadow-lg">
          <TouchableOpacity className="items-center">
            <HomeIcon size={24} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="items-center">
            <ChartBarIcon size={24} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="items-center">
            <StarIconSolid size={24} color="#000" />
            <View className="h-1 w-6 bg-black rounded-full mt-1" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
