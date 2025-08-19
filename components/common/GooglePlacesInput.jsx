import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Input, InputField, Text, Spinner, Modal } from "@/components/ui";
import LottieView from "lottie-react-native";

const GoogleTextInput = ({ initialLocation, handlePress }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(
    initialLocation?.address || ""
  );

  const API = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

  // Fetch autocomplete suggestions from Google Places API
  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          query
        )}&key=${API}&language=en`
      );
      const data = await response.json();
      if (data.status === "OK") {
        setSuggestions(data.predictions);
      } else {
        console.error("Autocomplete API error:", data);
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch place details when a suggestion is selected
  const fetchPlaceDetails = async (placeId) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,formatted_address,name,place_id,types&key=AIzaSyDLcdnqXezTGgGv_-ylE-CjywMLiP6-yUs`
      );
      const data = await response.json();
      if (data.status === "OK") {
        return data.result;
      } else {
        console.error("Place Details API error:", data.status);
        return null;
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
      return null;
    }
  };

  // Handle suggestion selection
  const handleLocationSelect = async (item) => {
    const details = await fetchPlaceDetails(item.place_id);
    if (!details) {
      Alert.alert("Error", "Could not fetch location details.");
      return;
    }

    const locationData = {
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
      address: item.description,
      placeId: item.place_id,
      mainText: item.structured_formatting.main_text,
      secondaryText: item.structured_formatting.secondary_text,
      terms: item.terms.map((term) => term.value),
      types: item.types,
    };

    const terms = locationData.terms;
    const structured = {
      place: terms[0],
      area: terms[1],
      locality: terms[2],
      city: terms[3],
      state: terms[4],
      country: terms[5],
    };

    locationData.structured = structured;

    setSelectedLocation(locationData.address);
    setSearchQuery("");
    setSuggestions([]);
    setIsModalVisible(false);

    if (handlePress) {
      handlePress(locationData);
    }
  };

  // Debounce search input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSuggestions(searchQuery);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <View>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setIsModalVisible(true)}
        className="mb-4"
      >
        <Input
          variant="rounded"
          size="md"
          className="flex-1 justify-between pr-3 bg-white shadow-sm"
          pointerEvents="none"
        >
          <InputField
            value={selectedLocation}
            placeholder="Enter the location"
            className="text-gray-800 text-base"
            editable={false}
          />
        </Input>
      </TouchableOpacity>

      <Modal
        isOpen={isModalVisible}
        className="flex-1 "
        onRequestClose={() => setIsModalVisible(false)}
      >
        <SafeAreaView className="flex-1 w-full bg-gray-50 mt-10">
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              className="p-2"
            >
              <Ionicons name="close" size={28} color="#1F2937" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-gray-800 flex-1 text-center">
              Select Location
            </Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Search Input */}
          <View space="md" className="px-4 pt-4">
            <View className="p-4 ">
              <Text className="text-base font-medium mb-1">Location</Text>
              <Input variant="rounded" size="md" className="bg-gray-50">
                <InputField
                  onChangeText={setSearchQuery}
                  placeholder="Search for a location"
                  placeholderTextColor="#9CA3AF"
                  returnKeyType="search"
                  className="text-gray-800 text-base"
                />
              </Input>
            </View>

            {/* Suggestions List */}
            {suggestions.length > 0 && (
              <View>
                <View className="bg-white rounded-xl shadow-lg max-h-80 overflow-hidden">
                  <FlatList
                    data={suggestions}
                    keyExtractor={(item) => item.place_id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleLocationSelect(item)}
                        className="px-4 py-3 border-b border-gray-100"
                      >
                        <Text className="text-gray-800 text-base font-medium">
                          {item.structured_formatting.main_text}
                        </Text>
                        <Text className="text-gray-500 text-sm mt-1">
                          {item.structured_formatting.secondary_text}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </View>
            )}

            {/* Loading State */}
            {isLoading && <Spinner size="small" />}
          </View>

          {/* Lottie Animation */}
          {!isLoading && suggestions.length === 0 && (
            <View className="flex-1 items-center justify-center px-4 mt-8">
              <LottieView
                autoPlay
                style={{
                  width: 200,
                  height: 200,
                }}
                source={require("../../assets/lottie/Maps.json")}
              />
              <Text className="text-gray-600 text-base text-center mt-4 w-3/4">
                Add the location so others can savor the flavors you discovered!
              </Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default GoogleTextInput;
