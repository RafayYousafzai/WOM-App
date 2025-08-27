import { Feather } from "@expo/vector-icons";
import { View, Text, TouchableOpacity, Image } from "react-native";
import RenderFilteredPosts from "./RenderFilteredPosts";

const FILTER_TITLES = {
  reviews: "Reviews",
  own_reviews: "Homemade",
};

const ProfileFilters = ({
  activeFilter,
  showFilterDropdown,
  setShowFilterDropdown,
  setActiveFilter,
  refreshCount,
  setRefreshCount,
}) => {
  const closeFilterDropdown = () => setShowFilterDropdown(false);

  return (
    <View className="border-gray-200">
      {/* Tab Header */}
      <View className="flex-row">
        <TouchableOpacity
          onPress={() => setActiveFilter("reviews")}
          className={`flex-1 py-3 items-center ${
            activeFilter === "reviews" ? "border-b-2 border-[#f39f1e]" : ""
          }`}
        >
          {activeFilter === "reviews" ? (
            <Image
              source={require("../../assets/home-icons/resturant.png")}
              className="w-6 h-6"
            />
          ) : (
            <Image
              source={require("../../assets/home-icons/resturant-thick.png")}
              className="w-5 h-5"
            />
          )}
          <Text className="text-xs mt-1">
            {activeFilter === "reviews" ? "Restaurant Review" : ""}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveFilter("own_reviews")}
          className={`flex-1 py-3 items-center ${
            activeFilter === "own_reviews" ? "border-b-2 border-[#f39f1e]" : ""
          }`}
        >
          {activeFilter === "own_reviews" ? (
            <Image
              source={require("../../assets/home-icons/home-solid.png")}
              className="w-6 h-6"
            />
          ) : (
            <Image
              source={require("../../assets/home-icons/home-thick.png")}
              className="w-5 h-5"
            />
          )}
          <Text className="text-xs mt-1">
            {activeFilter === "own_reviews" ? "Homemade" : ""}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Section */}
      <View className="flex-row justify-between items-center px-4 py-3 relative"></View>

      {/* Backdrop to close dropdown when clicking outside */}
      {showFilterDropdown && (
        <TouchableOpacity
          activeOpacity={0}
          onPress={closeFilterDropdown}
          className="absolute top-0 left-0 right-0 bottom-0 z-5"
          style={{ backgroundColor: "transparent" }}
        />
      )}

      {/* Posts */}
      <RenderFilteredPosts
        activeFilter={activeFilter}
        title={FILTER_TITLES[activeFilter] || "All Posts"}
        refreshCount={refreshCount}
        setRefreshCount={setRefreshCount}
      />
    </View>
  );
};

export default ProfileFilters;
