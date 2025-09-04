import { Feather } from "@expo/vector-icons";
import { View, Text, TouchableOpacity, Image, FlatList } from "react-native";
import RenderFilteredPosts from "./RenderFilteredPosts";

const FILTER_TITLES = {
  reviews: "Reviews",
  own_reviews: "Homemade",
  about: "About",
};

const ProfileFilters = ({
  activeFilter,
  showFilterDropdown,
  setShowFilterDropdown,
  setActiveFilter,
  refreshCount,
  setRefreshCount,
  tags,
  user,
}) => {
  const unsafeMetadata = user?.unsafeMetadata;
  const username = user?.username;
  const firstName = user?.firstName;
  const lastName = user?.lastName;
  const bio = unsafeMetadata?.bio;
  const country = unsafeMetadata?.country?.name;
  const birthday = unsafeMetadata?.birthday;
  const favoriteEmoji = unsafeMetadata?.favoriteEmoji;
  const dietaryRestrictions = unsafeMetadata?.dietaryRestrictions;
  const closeFilterDropdown = () => setShowFilterDropdown(false);

  // This is a placeholder function since the original code was missing it
  const handleTagPress = (tag) => {
    console.log("Tag pressed:", tag.name);
  };

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
              className="w-8 h-8"
            />
          ) : (
            <Image
              source={require("../../assets/home-icons/resturant-thick.png")}
              className="w-8 h-8"
            />
          )}
          <Text className="text-xs mt-1">
            {activeFilter === "reviews" ? "Restaurant" : ""}
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
              className="w-7 h-7"
            />
          ) : (
            <Image
              source={require("../../assets/home-icons/home-thick.png")}
              className="w-7 h-7"
            />
          )}
          <Text className="text-xs mt-1">
            {activeFilter === "own_reviews" ? "Homemade" : ""}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveFilter("about")}
          className={`flex-1 py-3 items-center ${
            activeFilter === "about" ? "border-b-2 border-[#f39f1e]" : ""
          }`}
        >
          {activeFilter === "about" ? (
            <Image
              source={require("../../assets/home-icons/about-fill.png")}
              className="w-7 h-7"
            />
          ) : (
            <Image
              source={require("../../assets/home-icons/about-outline.png")}
              className="w-7 h-7"
            />
          )}
          <Text className="text-xs mt-1">
            {activeFilter === "about" ? "About" : ""}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Section */}
      <View className="flex-row justify-between items-center px-4 relative"></View>

      {/* Backdrop to close dropdown when clicking outside */}
      {showFilterDropdown && (
        <TouchableOpacity
          activeOpacity={0}
          onPress={closeFilterDropdown}
          className="absolute top-0 left-0 right-0 bottom-0 z-5"
          style={{ backgroundColor: "transparent" }}
        />
      )}

      {/* Content Section */}
      <View className="bg-gray-50 min-h-screen">
        {activeFilter === "about" ? (
          <View className="bg-white mx-4 mt-4 rounded-2xl shadow-sm border border-gray-100">
            {/* About Header */}
            <View className="p-6 border-b border-gray-100">
              <Text className="text-2xl font-bold text-gray-900 mb-2">
                About {user?.firstName || "Me"}
              </Text>
              {bio && (
                <Text className="text-gray-600 leading-relaxed">{bio}</Text>
              )}
            </View>

            {/* User Details Section */}
            <View className="p-6 space-y-4">
              {username && (
                <View className="flex-row items-center">
                  <Text className="text-sm font-medium text-gray-500 w-20">
                    Username
                  </Text>
                  <Text className="text-gray-900 font-medium">@{username}</Text>
                </View>
              )}

              {country && (
                <View className="flex-row items-center">
                  <Text className="text-sm font-medium text-gray-500 w-20">
                    Location
                  </Text>
                  <Text className="text-gray-900">{country}</Text>
                </View>
              )}

              {favoriteEmoji && (
                <View className="flex-row items-center">
                  <Text className="text-sm font-medium text-gray-500 w-20">
                    Emoji
                  </Text>
                  <Text className="text-2xl">{favoriteEmoji}</Text>
                </View>
              )}

              {dietaryRestrictions && dietaryRestrictions.length > 0 && (
                <View>
                  <Text className="text-sm font-medium text-gray-500 mb-2">
                    Dietary Restrictions
                  </Text>
                  <View className="flex-row flex-wrap">
                    {dietaryRestrictions.map((restriction, index) => (
                      <View
                        key={index}
                        className="bg-red-100 px-3 py-1 rounded-full mr-2 mb-2"
                      >
                        <Text className="text-red-700 text-sm font-medium">
                          {restriction}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Tags Section */}
            {tags && tags.length > 0 && (
              <View className="p-6 border-t border-gray-100">
                <Text className="text-lg font-semibold text-gray-900 mb-3">
                  Favorite Tags
                </Text>
                <Text className="text-sm text-gray-500 mb-4">
                  Tags {user?.fullName || user?.firstName} has used
                </Text>
                <FlatList
                  data={tags}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 20 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => handleTagPress(item)}
                      className="mr-3 bg-gradient-to-r from-orange-100 to-orange-50 px-4 py-2 rounded-full border border-orange-200 shadow-sm"
                      activeOpacity={0.8}
                    >
                      <Text className="text-orange-700 font-medium text-sm">
                        #{item.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>
        ) : (
          <RenderFilteredPosts
            activeFilter={activeFilter}
            title={FILTER_TITLES[activeFilter] || "All Posts"}
            refreshCount={refreshCount}
            setRefreshCount={setRefreshCount}
          />
        )}
      </View>
    </View>
  );
};

export default ProfileFilters;
