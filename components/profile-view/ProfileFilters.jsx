import { Feather } from "@expo/vector-icons";
import { View, Text, TouchableOpacity } from "react-native";
import RenderFilteredPosts from "./RenderFilteredPosts";

const FILTER_TITLES = {
  reviews: "Reviews",
  own_reviews: "Homemade Posts",
};

const FILTER_OPTIONS = [
  { value: "reviews", label: "Reviews" },
  { value: "own_reviews", label: "Homemade" },
];

const FilterOption = ({ title, value, activeFilter, onPress }) => {
  const isActive = activeFilter === value;

  return (
    <TouchableOpacity
      onPress={() => onPress(value)}
      className={`px-4 py-2.5 ${
        isActive ? "bg-[#f39f1e]" : "bg-white"
      } border-b border-gray-100`}
    >
      <Text
        className={`${
          isActive ? "text-white font-medium" : "text-gray-700"
        } text-sm`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const ProfileFilters = ({
  activeFilter,
  showFilterDropdown,
  setShowFilterDropdown,
  handleFilterChange,
  setActiveFilter,
  refreshCount,
  setRefreshCount,
}) => {
  const toggleFilterDropdown = () => setShowFilterDropdown(!showFilterDropdown);
  const closeFilterDropdown = () => setShowFilterDropdown(false);

  return (
    <View className="border-gray-200">
      {/* Tab Header - Same as visit profile */}
      <View className="flex-row">
        <TouchableOpacity
          onPress={() => setActiveFilter("reviews")}
          className={`flex-1 py-3 items-center ${
            activeFilter === "reviews" ? "border-b-2 border-[#f39f1e]" : ""
          }`}
        >
          <Feather
            name="star"
            size={22}
            color={activeFilter === "reviews" ? "#f39f1e" : "#888"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveFilter("own_reviews")}
          className={`flex-1 py-3 items-center ${
            activeFilter === "own_reviews" ? "border-b-2 border-[#f39f1e]" : ""
          }`}
        >
          <Feather
            name="grid"
            size={22}
            color={activeFilter === "own_reviews" ? "#f39f1e" : "#888"}
          />
        </TouchableOpacity>
      </View>

      {/* Filter Section */}
      <View className="flex-row justify-between items-center px-4 py-3 relative">
        {/* <Text className="font-bold text-gray-800 text-lg">
          {FILTER_TITLES[activeFilter] || "All Posts"}
        </Text> */}

        {/* Filter Dropdown Toggle */}
        {/* <TouchableOpacity
          onPress={toggleFilterDropdown}
          className="flex-row items-center"
        >
          <Feather name="sliders" size={20} color="#666" />
          <Feather
            name={showFilterDropdown ? "chevron-up" : "chevron-down"}
            size={16}
            color="#666"
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity> */}

        {/* Filter Dropdown */}
        {/* {showFilterDropdown && (
          <View className="absolute top-12 right-4 bg-white rounded-md w-48 z-10 border border-gray-200 overflow-hidden">
            {FILTER_OPTIONS.map((option) => (
              <FilterOption
                key={option.value}
                title={option.countKey ? `${option.label}` : option.label}
                value={option.value}
                activeFilter={activeFilter}
                onPress={handleFilterChange}
              />
            ))}
          </View>
        )} */}
      </View>

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
        setActiveFilter={setActiveFilter}
        title={FILTER_TITLES[activeFilter] || "All Posts"}
        refreshCount={refreshCount}
        setRefreshCount={setRefreshCount}
      />
    </View>
  );
};

export default ProfileFilters;
