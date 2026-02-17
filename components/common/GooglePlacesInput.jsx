"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Animated,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text, Spinner } from "@/components/ui";
import {
  Card,
  Surface,
  Searchbar,
  List,
  Portal,
  Modal as PaperModal,
} from "react-native-paper";
import LottieView from "lottie-react-native";
import debounce from "lodash.debounce";
const GoogleTextInput = ({ initialLocation, handlePress, containerStyle }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(
    initialLocation?.address || "",
  );
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const API = "AIzaSyCGY13_ngkgRv9o0Otx63iLrbEcG-DJp6U";

  useEffect(() => {
    if (isModalVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    }
  }, [isModalVisible]);

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
          query,
        )}&key=${API}&language=en`,
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

  const fetchPlaceDetails = async (placeId) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,formatted_address&key=${API}`,
      );
      const data = await response.json();
      if (data.status === "OK") {
        const { lat, lng } = data.result.geometry.location;
        return {
          latitude: lat,
          longitude: lng,
          address: data.result.formatted_address,
        };
      } else {
        console.error("Place Details API error:", data);
        // Fallback to description
        return null;
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
      return null;
    }
  };

  // Handle suggestion selection
  const handleLocationSelect = async (item) => {
    // Show loading indicator while fetching details
    setIsLoading(true);
    const details = await fetchPlaceDetails(item.place_id);
    setIsLoading(false);

    if (details) {
      setSelectedLocation(details.address);
      if (handlePress) {
        handlePress(details);
      }
    } else {
      // Fallback to just address if details fetch fails
      setSelectedLocation(item.description);
      if (handlePress) {
        handlePress({
          latitude: null,
          longitude: null,
          address: item.description,
        });
      }
    }

    setSearchQuery("");
    setSuggestions([]);
    setIsModalVisible(false);
  };

  const handleClear = () => {
    setSelectedLocation("");
    if (handlePress) {
      handlePress({
        latitude: null,
        longitude: null,
        address: null,
      });
    }
    setIsModalVisible(false);
  };

  // Debounce search input

  const debouncedFetch = useMemo(() => debounce(fetchSuggestions, 400), [API]);

  useEffect(() => {
    if (searchQuery) {
      debouncedFetch(searchQuery);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  return (
    <View style={containerStyle}>
      <View
        style={{
          borderRadius: 16,
          backgroundColor: "#f9fafb", // Light gray background
          marginTop: -28,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsModalVisible(true)}
          style={{
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: 16, // Rounded corners for the touchable
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: "#1F2937",
                fontWeight: "400",
              }}
              className="text-xl"
            >
              {selectedLocation || "Add the location"}
            </Text>
          </View>
          <Ionicons name="location-outline" size={24} color="#fcbf49" />
        </TouchableOpacity>
      </View>

      <Portal>
        <PaperModal
          visible={isModalVisible}
          onDismiss={() => setIsModalVisible(false)}
          contentContainerStyle={{
            backgroundColor: "#F9FAFB",
            marginTop: 60,
            marginBottom: 0,
            marginHorizontal: 0,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            height: "90%",
          }}
        >
          <Animated.View
            style={{
              height: "100%",
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <SafeAreaView
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Surface
                style={{
                  elevation: 2,
                  backgroundColor: "#ffffff",
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  flexShrink: 0,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setIsModalVisible(false)}
                    style={{
                      padding: 8,
                      borderRadius: 12,
                      backgroundColor: "#F3F4F6",
                    }}
                  >
                    <Ionicons name="close" size={24} color="#374151" />
                  </TouchableOpacity>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "700",
                      color: "#1F2937",
                      flex: 1,
                      textAlign: "center",
                    }}
                  >
                    Select Location
                  </Text>
                  <TouchableOpacity
                    onPress={handleClear}
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      width: 40,
                    }}
                  >
                    <Text style={{ color: "#6366F1", fontWeight: "600" }}>
                      Clear
                    </Text>
                  </TouchableOpacity>
                </View>
              </Surface>

              <View
                style={{
                  flex: 1,
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Searchbar
                  placeholder="Search for a location"
                  onChangeText={setSearchQuery}
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: 16,
                    elevation: 2,
                    marginBottom: 16,
                    flexShrink: 0,
                  }}
                  inputStyle={{
                    fontSize: 16,
                    color: "#1F2937",
                  }}
                  iconColor="#6366F1"
                />

                {isLoading && (
                  <View
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      paddingVertical: 20,
                    }}
                  >
                    <Spinner size="large" color="#6366F1" />
                    <Text
                      style={{
                        marginTop: 12,
                        fontSize: 16,
                        color: "#6B7280",
                        fontWeight: "500",
                      }}
                    >
                      Searching locations...
                    </Text>
                  </View>
                )}

                {!isLoading && suggestions.length > 0 && (
                  <View style={{ flex: 1 }}>
                    {/* Debug: Show count of suggestions */}
                    <Text
                      style={{ color: "gray", marginBottom: 10, fontSize: 12 }}
                    >
                      {suggestions.length} suggestions found
                    </Text>

                    <View
                      style={{
                        borderRadius: 16,
                        backgroundColor: "#ffffff",
                        borderWidth: 1,
                        borderColor: "#e5e7eb",
                        flex: 1,
                        maxHeight: 300, // Set a fixed maxHeight
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                      }}
                    >
                      <FlatList
                        data={suggestions}
                        keyExtractor={(item) => item.place_id}
                        showsVerticalScrollIndicator={true}
                        style={{ flex: 1 }}
                        initialNumToRender={10} // Render only initial items
                        maxToRenderPerBatch={10} // Render in batches of 10
                        windowSize={5} // Reduce the window size
                        removeClippedSubviews={true} // Remove offscreen items
                        updateCellsBatchingPeriod={50} // Batch updates
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            onPress={() => handleLocationSelect(item)}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              paddingVertical: 16,
                              paddingHorizontal: 20,
                            }}
                          >
                            <Ionicons
                              name="location-outline"
                              size={24}
                              color="#6366F1"
                              style={{ marginRight: 16 }}
                            />
                            <View style={{ flex: 1 }}>
                              <Text
                                style={{
                                  fontSize: 16,
                                  fontWeight: "600",
                                  color: "#1F2937",
                                  marginBottom: 4,
                                }}
                                numberOfLines={1} // Limit text to single line
                              >
                                {item.structured_formatting?.main_text ||
                                  "No main text"}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 14,
                                  color: "#6B7280",
                                }}
                                numberOfLines={1} // Limit text to single line
                              >
                                {item.description || "No description"}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        )}
                        ItemSeparatorComponent={() => (
                          <View
                            style={{
                              height: 1,
                              backgroundColor: "#F3F4F6",
                              marginHorizontal: 16,
                            }}
                          />
                        )}
                      />
                    </View>
                  </View>
                )}

                {!isLoading &&
                  suggestions.length === 0 &&
                  searchQuery === "" && (
                    <View
                      style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        paddingHorizontal: 32,
                      }}
                    >
                      <LottieView
                        autoPlay
                        style={{
                          width: 240,
                          height: 240,
                        }}
                        source={require("../../assets/lottie/Maps.json")}
                      />
                      <Text
                        style={{
                          fontSize: 18,
                          color: "#374151",
                          textAlign: "center",
                          marginTop: 16,
                          fontWeight: "600",
                          lineHeight: 26,
                        }}
                      >
                        Add the location so others can savor the flavors you
                        discovered!
                      </Text>
                    </View>
                  )}

                {!isLoading &&
                  suggestions.length === 0 &&
                  searchQuery !== "" && (
                    <View
                      style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        paddingHorizontal: 32,
                      }}
                    >
                      <Ionicons
                        name="search-outline"
                        size={64}
                        color="#D1D5DB"
                      />
                      <Text
                        style={{
                          fontSize: 18,
                          color: "#374151",
                          textAlign: "center",
                          marginTop: 16,
                          fontWeight: "600",
                          lineHeight: 26,
                        }}
                      >
                        No locations found for "{searchQuery}"
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#6B7280",
                          textAlign: "center",
                          marginTop: 8,
                          lineHeight: 20,
                        }}
                      >
                        Try a different search term
                      </Text>
                    </View>
                  )}
              </View>
            </SafeAreaView>
          </Animated.View>
        </PaperModal>
      </Portal>
    </View>
  );
};

export default GoogleTextInput;
