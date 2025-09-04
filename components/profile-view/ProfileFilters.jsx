import { View, Text, TouchableOpacity, Image, FlatList } from "react-native";
import RenderFilteredPosts from "./RenderFilteredPosts";

const FILTERS = [
  {
    key: "reviews",
    label: "Restaurant",
    activeIcon: require("../../assets/home-icons/resturant.png"),
    inactiveIcon: require("../../assets/home-icons/resturant-thick.png"),
    size: { width: 32, height: 32 },
  },
  {
    key: "own_reviews",
    label: "Homemade",
    activeIcon: require("../../assets/home-icons/home-solid.png"),
    inactiveIcon: require("../../assets/home-icons/home-thick.png"),
    size: { width: 28, height: 28 },
  },
  {
    key: "about",
    label: "About",
    activeIcon: require("../../assets/home-icons/about-fill.png"),
    inactiveIcon: require("../../assets/home-icons/about-outline.png"),
    size: { width: 28, height: 28 },
  },
];

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

  const handleTagPress = (item) => {
    // Add your tag press logic here
    console.log("Tag pressed:", item);
  };

  return (
    <View className="bg-white">
      {/* Enhanced Tab Header */}
      <View className="flex-row bg-white shadow-sm border-b border-gray-100">
        {FILTERS.map(({ key, label, activeIcon, inactiveIcon, size }) => {
          const isActive = activeFilter === key;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => setActiveFilter(key)}
              className={`flex-1 py-4 items-center relative transition-all duration-200 ${
                isActive ? "bg-orange-50" : "bg-white hover:bg-gray-50"
              }`}
              activeOpacity={0.7}
            >
              {/* Active indicator */}
              {isActive && (
                <View className="absolute top-0 left-0 right-0 h-1 bg-orange-400 rounded-b-full" />
              )}

              {/* Icon container with subtle animation effect */}
              <View
                className={`p-2 rounded-full mb-1 ${
                  isActive ? "bg-orange-100 shadow-sm" : "bg-transparent"
                }`}
              >
                <Image
                  source={isActive ? activeIcon : inactiveIcon}
                  style={{
                    width: size.width,
                    height: size.height,
                    tintColor: isActive ? "#f39f1e" : "#6b7280",
                  }}
                />
              </View>

              {/* Label with better typography */}
              <Text
                className={`text-xs font-medium ${
                  isActive ? "text-orange-600" : "text-gray-500"
                }`}
              >
                {label}
              </Text>

              {/* Subtle bottom border for active state */}
              {isActive && (
                <View className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-orange-400 rounded-full" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Backdrop for dropdown */}
      {showFilterDropdown && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={closeFilterDropdown}
          className="absolute inset-0 bg-black/10 z-10"
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
          <View className="mt-4">
            <RenderFilteredPosts
              activeFilter={activeFilter}
              title={FILTER_TITLES[activeFilter] || "All Posts"}
              refreshCount={refreshCount}
              setRefreshCount={setRefreshCount}
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default ProfileFilters;
