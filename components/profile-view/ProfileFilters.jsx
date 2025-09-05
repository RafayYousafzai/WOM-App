import { Feather } from "@expo/vector-icons";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
} from "react-native";
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
  const country = unsafeMetadata?.country?.name;
  const birthday = unsafeMetadata?.birthday;
  const favoriteEmoji = unsafeMetadata?.favoriteEmoji;
  const dietaryRestrictions = unsafeMetadata?.dietaryRestrictions;
  const closeFilterDropdown = () => setShowFilterDropdown(false);

  const handleTagPress = (tag) => {
    console.log("Tag pressed:", tag.name);
  };

  const InfoRow = ({ icon, label, value, isEmoji = false }) => (
    <View className="flex-row items-center py-3 px-1">
      <View className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-4">
        {isEmoji ? (
          <Text className="text-lg">{icon}</Text>
        ) : (
          <Feather name={icon} size={18} color="#6B7280" />
        )}
      </View>
      <View className="flex-1">
        <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
          {label}
        </Text>
        <Text className="text-gray-900 font-medium text-base">
          {isEmoji ? <Text className="text-2xl">{value}</Text> : value}
        </Text>
      </View>
    </View>
  );

  return (
    <View className="border-gray-200">
      {/* Tab Header */}
      <View className="flex-row bg-white shadow-sm">
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
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="p-4">
              <View className="bg-white rounded-3xl shadow-lg border border-gray-100 mb-4">
                <View className="px-6 py-5 border-b border-gray-100">
                  <Text className="text-xl font-bold text-gray-900">
                    Personal Information
                  </Text>
                </View>

                <View className="px-5 py-2">
                  {username && (
                    <InfoRow
                      icon="at-sign"
                      label="Username"
                      value={`@${username}`}
                    />
                  )}

                  {country && (
                    <InfoRow icon="map-pin" label="Country" value={country} />
                  )}

                  {favoriteEmoji && (
                    <InfoRow
                      icon={favoriteEmoji}
                      label="Favorite Emoji"
                      value={favoriteEmoji}
                      isEmoji={true}
                    />
                  )}

                  {birthday && (
                    <InfoRow
                      icon="calendar"
                      label="Birthday"
                      value={new Date(birthday).toLocaleDateString()}
                    />
                  )}
                </View>
              </View>

              {/* Dietary Restrictions Card */}
              {dietaryRestrictions && dietaryRestrictions.length > 0 && (
                <View className="bg-white rounded-3xl shadow-lg border border-gray-100 mb-4">
                  <View className="px-6 py-5 border-b border-gray-100">
                    <Text className="text-xl font-bold text-gray-900">
                      Dietary Preferences
                    </Text>
                    <Text className="text-gray-500 text-sm mt-1">
                      Foods and ingredients to avoid
                    </Text>
                  </View>

                  <View className="px-6 py-5">
                    <View className="flex-row flex-wrap -m-1">
                      {dietaryRestrictions.map((restriction, index) => (
                        <View
                          key={index}
                          className="m-1  px-4 py-2 rounded-2xl border border-red-200 shadow-sm"
                        >
                          <Text className="text-yellow-600 text-sm font-semibold">
                            {restriction}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              {/* Favorite Tags Card */}
              {tags && tags.length > 0 && (
                <View className="bg-white rounded-3xl shadow-lg border border-gray-100 mb-6">
                  <View className="px-6 py-5 border-b border-gray-100">
                    <Text className="text-xl font-bold text-gray-900">
                      Favorite Cuisines
                    </Text>
                    <Text className="text-gray-500 text-sm mt-1">
                      Most used tags by {firstName || "this user"}
                    </Text>
                  </View>

                  <View className="px-6 py-5">
                    <FlatList
                      data={tags}
                      keyExtractor={(item) => item.id}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ paddingRight: 20 }}
                      ItemSeparatorComponent={() => <View className="w-3" />}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          onPress={() => handleTagPress(item)}
                          className="bg-gradient-to-r from-orange-50 to-orange-100 px-5 py-3 rounded-2xl border border-orange-200 shadow-sm min-w-20 items-center"
                          activeOpacity={0.7}
                        >
                          <Text className="text-orange-700 font-bold text-base">
                            #{item.name}
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        ) : (
          <RenderFilteredPosts
            activeFilter={activeFilter}
            title={FILTER_TITLES[activeFilter] || "All Posts"}
            refreshCount={refreshCount}
            setRefreshCount={setRefreshCount}
            profileUserId={user?.id}
          />
        )}
      </View>
    </View>
  );
};

export default ProfileFilters;
