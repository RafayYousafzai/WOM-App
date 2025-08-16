"use client";

import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from "react-native";
import { Ionicons, FontAwesome5, Feather } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import { useUser } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { classNames } from "@/utils/classNames";
import { CurrencyDollarIcon, StarIcon } from "react-native-heroicons/mini";
import { useReview } from "@/context/reviewContext";

export const Step3Summary = () => {
  const { user } = useUser();
  const { restaurantData, cuisineTags, amenityTags, dietaryTags, extraTags } =
    useReview();

  const submission = {
    ...restaurantData,
    allTags: [
      ...(cuisineTags || []),
      ...(dietaryTags || []),
      ...(amenityTags || []),
      ...(extraTags || []),
    ].filter(Boolean),
  };

  const safeSubmission = {
    dishName: submission?.dishTypes[0]?.dishName || "Dish",
    restaurantName: submission?.location?.name || "Restaurant",
    price: submission?.dishTypes[0]?.price || "0",
    rating: submission?.dishTypes[0]?.rating || 0,
    images: submission?.images || [],
    location: submission?.location || {
      address: "Location not provided",
      latitude: 40.7128,
      longitude: -74.006,
    },
    tags: submission?.allTags || [],
    allTags: submission?.allTags || [],
    cuisines: submission?.allTags || [],
    recommendDish: submission?.dishTypes[0]?.recommendDish || "",
    review: submission?.review || "",
    phoneNumber: submission?.location?.phoneNumber || "",
    website: submission?.location?.website || "",
  };

  const getPriceCategory = (price) => {
    const numPrice = Number.parseInt(price) || 0;
    if (numPrice <= 50) return "$";
    if (numPrice <= 150) return "$$";
    if (numPrice <= 300) return "$$$";
    return "$$$$";
  };

  const openMaps = () => {
    const { latitude, longitude } = safeSubmission.location;
    const url = Platform.select({
      ios: `maps:${latitude},${longitude}?q=${safeSubmission.restaurantName}`,
      android: `geo:${latitude},${longitude}?q=${safeSubmission.restaurantName}`,
    });
    Linking.openURL(url);
  };

  const renderRating = (rating) => {
    const stars = [];
    const safeRating = Number(rating) || 0;
    for (let i = 1; i <= 10; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= safeRating ? "star" : "star-outline"}
          size={22}
          color={i <= safeRating ? "#FFD700" : "#BBBBBB"}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

  const getUserInitial = () => {
    if (!user || !user.username) return "U";
    return user.username.charAt(0).toUpperCase();
  };

  const getUserName = () => {
    return user?.username || "User";
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView className="flex-1 bg-white">
        <View className="relative">
          <Image
            source={
              safeSubmission.images && safeSubmission.images.length > 0
                ? { uri: safeSubmission.images[0] }
                : require("@/assets/display/image10.jpg")
            }
            className="w-full h-72"
            style={{ resizeMode: "cover" }}
          />
          <View className="absolute inset-0 bg-black opacity-30" />
          <View className="absolute bottom-0 left-0 right-0 p-5">
            <Text className="text-white text-3xl font-bold">
              {safeSubmission.restaurantName}
            </Text>
            <View className="flex-row items-center mt-1 mb-8">
              <View className="flex-row mr-4">
                {renderRating(safeSubmission.rating)}
              </View>
              <Text className="text-white text-lg font-semibold">
                {getPriceCategory(safeSubmission.price)}
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-t-3xl -mt-6 px-5 pt-6 pb-10">
          {safeSubmission.tags.length > 0 ||
          safeSubmission.cuisines.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-5"
            >
              {safeSubmission.tags.map((tag, index) => (
                <View
                  key={index}
                  className="bg-yellow-50 px-4 py-2 rounded-full mr-2 flex-row items-center"
                >
                  <Text className="text-yellow-500 ml-1 font-medium">
                    {tag}
                  </Text>
                </View>
              ))}
              {safeSubmission.cuisines.map((cuisine, index) => (
                <View
                  key={`cuisine-${index}`}
                  className="bg-orange-50 px-4 py-2 rounded-full mr-2"
                >
                  <Text className="text-orange-500 font-medium">{cuisine}</Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View className="mb-5 py-2">
              <View className="bg-gray-100 px-4 py-2 rounded-full mr-2 flex-row items-center self-start">
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color="#9ca3af"
                />
                <Text className="text-gray-500 ml-1 font-medium">
                  No tags or cuisines added
                </Text>
              </View>
            </View>
          )}

          <View className="bg-gray-50 rounded-xl p-4 mb-5">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="bg-yellow-100 p-2 rounded-lg mr-3">
                  <Ionicons name="location" size={22} color="#f39f1e" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 font-bold text-lg">
                    Location
                  </Text>
                  <Text className="text-gray-600 pr-4">
                    {safeSubmission.location.address}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={openMaps}
                className="bg-yellow-500 p-2 rounded-lg"
              >
                <Text className="text-white font-semibold">Map</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={openMaps} className="mt-3">
              <View className="h-32 rounded-lg overflow-hidden">
                <MapView
                  style={{ height: "100%", width: "100%" }}
                  initialRegion={{
                    latitude: safeSubmission.location.latitude,
                    longitude: safeSubmission.location.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                >
                  <Marker
                    coordinate={{
                      latitude: safeSubmission.location.latitude,
                      longitude: safeSubmission.location.longitude,
                    }}
                    title={safeSubmission.restaurantName}
                  />
                </MapView>
                <View className="absolute inset-0 flex items-center justify-center">
                  <View className="bg-white/80 px-3 py-1 rounded-full">
                    <Text className="text-yellow-500 font-semibold">
                      Tap to open in Maps
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View className="flex-row mb-6">
            <View className="flex-1 bg-green-50 rounded-xl p-4 mr-2">
              <View className="flex-row mb-4 items-center">
                <CurrencyDollarIcon size={25} color="#22c55e" />
                <Text className="text-gray-800 font-bold text-lg ml-1">
                  Price
                </Text>
              </View>
              <Text
                className={classNames("text-3xl font-black text-green-600")}
              >
                {safeSubmission.price
                  ? `$${safeSubmission.price}`
                  : "Not specified"}
              </Text>
              <Text className="text-gray-500 text-xs mt-1">Average cost</Text>
            </View>
            <View className="flex-1 bg-purple-50 rounded-xl p-4 ml-2">
              <View className="flex-row mb-4 items-center">
                <StarIcon size={25} color="#8b5cf6" />
                <Text className="text-gray-800 font-bold text-lg ml-1">
                  Rating
                </Text>
              </View>
              <Text className="text-gray-700 text-xl font-bold mt-1">
                <Text
                  className={classNames("text-3xl font-black text-purple-600")}
                >
                  {safeSubmission.rating}/10
                </Text>
              </Text>
              <Text className="text-gray-500 text-xs mt-1">
                Based on reviews
              </Text>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-gray-800 font-bold text-xl mb-3">
              Recommended Dishes
            </Text>
            {safeSubmission.recommendDish ? (
              <View className="bg-yellow-100 border-l-4 border-yellow-400 rounded-xl p-4 shadow-sm">
                <View className="flex-row items-center">
                  <FontAwesome5
                    name="utensils"
                    size={18}
                    className="ml-1 mr-2"
                    color="#d97706"
                  />
                  <Text className="text-yellow-800 font-semibold ml-2 text-base">
                    {`${
                      safeSubmission.dishName || "This dish"
                    } is recommended and will appear as a recommendation.`}
                  </Text>
                </View>
              </View>
            ) : (
              <View className="bg-gray-50 border-l-4 border-gray-300 rounded-xl p-4 shadow-sm">
                <View className="flex-row items-center">
                  <Feather
                    name="info"
                    size={18}
                    className="ml-1 mr-2"
                    color="#9ca3af"
                  />
                  <Text className="text-gray-500 font-medium ml-2 text-base">
                    {`${
                      safeSubmission.dishName || "This dish"
                    } is not recommended and will appear as an unrecommendation.`}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View className="mb-6">
            <Text className="text-gray-800 font-bold text-xl mb-3">Review</Text>
            {safeSubmission.review ? (
              <View className="bg-gray-50 rounded-xl p-4">
                <Text className="text-gray-700 italic">
                  "{safeSubmission.review}"
                </Text>
                <View className="flex-row items-center mt-3">
                  <View className="h-8 w-8 rounded-full bg-yellow-100 items-center justify-center">
                    <Text className="text-yellow-500 font-bold">
                      {getUserInitial()}
                    </Text>
                  </View>
                  <Text className="text-gray-500 ml-2 font-medium">
                    {getUserName()}
                  </Text>
                </View>
              </View>
            ) : (
              <View className="bg-gray-100 rounded-xl p-4">
                <View className="flex-row items-center">
                  <Feather name="message-square" size={18} color="#9ca3af" />
                  <Text className="text-gray-500 font-medium ml-2">
                    No review provided
                  </Text>
                </View>
              </View>
            )}
          </View>

          {(safeSubmission.phoneNumber || safeSubmission.website) && (
            <View className="mb-6">
              <Text className="text-gray-800 font-bold text-xl mb-3">
                Contact Actions
              </Text>
              <View className="flex-row">
                {safeSubmission.phoneNumber ? (
                  <TouchableOpacity
                    className="flex-1 bg-yellow-50 rounded-xl p-4 mr-2 items-center"
                    onPress={() =>
                      Linking.openURL(`tel:${safeSubmission.phoneNumber}`)
                    }
                  >
                    <Feather name="phone" size={22} color="#f39f1e" />
                    <Text className="text-yellow-500 font-medium mt-2">
                      Call
                    </Text>
                  </TouchableOpacity>
                ) : null}
                {safeSubmission.website ? (
                  <TouchableOpacity
                    className="flex-1 bg-yellow-50 rounded-xl p-4 ml-2 items-center"
                    onPress={() => Linking.openURL(safeSubmission.website)}
                  >
                    <Feather name="globe" size={22} color="#f39f1e" />
                    <Text className="text-yellow-500 font-medium mt-2">
                      Website
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  shadowButton: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
