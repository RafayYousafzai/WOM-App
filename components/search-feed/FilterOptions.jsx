"use client";

import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useReview } from "@/context/reviewContext";

const { width: screenWidth } = Dimensions.get("window");

const FilterOptions = () => {
  const { tags: tagCategories } = useReview();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState(new Set());
  const [tempSelectedFilters, setTempSelectedFilters] = useState(new Set());
  const slideAnim = new Animated.Value(0);

  // Get popular tags for horizontal scroll
  const popularTags = useMemo(
    () => [
      { id: "all", name: "All", type: "special", icon: "options" },
      ...tagCategories.amenity,
      ...tagCategories.cuisine,
      ...tagCategories.dietary,
    ],
    []
  );

  const openModal = useCallback(() => {
    setTempSelectedFilters(new Set(selectedFilters));
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [selectedFilters]);

  const closeModal = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  }, []);

  const toggleFilter = useCallback(
    (filterId) => {
      if (filterId === "all") {
        openModal();
        return;
      }

      setSelectedFilters((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(filterId)) {
          newSet.delete(filterId);
        } else {
          newSet.add(filterId);
        }
        return newSet;
      });
    },
    [openModal]
  );

  const toggleTempFilter = useCallback((filterId) => {
    setTempSelectedFilters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(filterId)) {
        newSet.delete(filterId);
      } else {
        newSet.add(filterId);
      }
      return newSet;
    });
  }, []);

  const applyFilters = useCallback(() => {
    setSelectedFilters(new Set(tempSelectedFilters));
    closeModal();
  }, [tempSelectedFilters, closeModal]);

  const resetFilters = useCallback(() => {
    setTempSelectedFilters(new Set());
  }, []);

  const removeFilter = useCallback((filterId) => {
    setSelectedFilters((prev) => {
      const newSet = new Set(prev);
      newSet.delete(filterId);
      return newSet;
    });
  }, []);

  // Render horizontal filter chip
  const renderHorizontalChip = useCallback(
    (tag) => {
      const isSelected = selectedFilters.has(tag.id);
      const isSpecial = tag.id === "all";

      return (
        <TouchableOpacity
          key={tag.id}
          onPress={() => toggleFilter(tag.id)}
          style={{
            marginRight: 12,
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 25,
            backgroundColor: isSelected
              ? "#F59E0B"
              : isSpecial
              ? "#EF4444"
              : "#F8F9FA",

            minWidth: isSpecial ? 120 : 80,
          }}
          activeOpacity={0.8}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: isSelected
                  ? "#FFFFFF"
                  : isSpecial
                  ? "#FFFFFF"
                  : "#374151",
              }}
            >
              {tag.name}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [selectedFilters, toggleFilter]
  );

  // Render selected filter chips (removable)
  const renderSelectedChip = useCallback(
    (filterId) => {
      const allTags = [
        ...tagCategories.amenity,
        ...tagCategories.cuisine,
        ...tagCategories.dietary,
      ];
      const tag = allTags.find((t) => t.id === filterId);
      if (!tag) return null;

      return (
        <TouchableOpacity
          key={filterId}
          onPress={() => removeFilter(filterId)}
          style={{
            marginRight: 8,
            marginBottom: 8,
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: "#FEF3C7",
            borderRadius: 20,
            flexDirection: "row",
            alignItems: "center",
          }}
          activeOpacity={0.7}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: "#92400E",
              marginRight: 6,
            }}
          >
            {tag.name}
          </Text>
          <Ionicons name="close-outline" size={16} color="#92400E" />
        </TouchableOpacity>
      );
    },
    [removeFilter, tagCategories]
  );

  return (
    <View style={{ backgroundColor: "#FFFFFF" }}>
      {/* Horizontal Scrollable Tags */}
      <View style={{ paddingVertical: 16 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={100}
        >
          {popularTags.map(renderHorizontalChip)}
        </ScrollView>
      </View>

      {/* Selected Filters */}
      {selectedFilters.size > 0 && (
        <View style={{ paddingBottom: 16 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={100}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#374151",
                marginTop: 6,
                paddingRight: 20,
              }}
            >
              Active Filters ({selectedFilters.size})
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {Array.from(selectedFilters).map(renderSelectedChip)}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={modalVisible}
        onClose={closeModal}
        onApply={applyFilters}
        onReset={resetFilters}
        tagCategories={tagCategories}
        tempSelectedFilters={tempSelectedFilters}
        toggleTempFilter={toggleTempFilter}
        slideAnim={slideAnim}
      />
    </View>
  );
};

const FilterModal = ({
  visible,
  onClose,
  onApply,
  onReset,
  tagCategories,
  tempSelectedFilters,
  toggleTempFilter,
  slideAnim,
}) => {
  const renderCategorySection = useCallback(
    ({ item: [categoryName, tags] }) => (
      <View style={{ marginBottom: 32 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: "#111827",
            marginBottom: 16,
            paddingHorizontal: 20,
            textTransform: "capitalize",
          }}
        >
          {categoryName}
        </Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            paddingHorizontal: 20,
          }}
        >
          {tags.map((tag) => {
            const isSelected = tempSelectedFilters.has(tag.id);
            return (
              <TouchableOpacity
                key={tag.id}
                onPress={() => toggleTempFilter(tag.id)}
                style={{
                  marginRight: 12,
                  marginBottom: 12,
                  paddingHorizontal: 18,
                  paddingVertical: 14,
                  backgroundColor: isSelected ? "#F59E0B" : "#F9FAFB",
                  borderRadius: 25,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
                activeOpacity={0.8}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "500",
                      color: isSelected ? "#FFFFFF" : "#374151",
                    }}
                  >
                    {tag.name}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    ),
    [tempSelectedFilters, toggleTempFilter]
  );

  const categoryData = Object.entries(tagCategories);

  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="dark-content" />
      <View style={{ flex: 1, marginTop: 10 }}>
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: "#FFFFF3",
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
          }}
        >
          <SafeAreaView style={{ flex: 1 }}>
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 20,
                paddingVertical: 20,
                borderBottomWidth: 1,
                borderBottomColor: "#E5E7EB",
              }}
            >
              <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
                <Ionicons name="close" size={28} color="#374151" />
              </TouchableOpacity>
              <Text
                style={{ fontSize: 22, fontWeight: "700", color: "#111827" }}
              >
                All Filters
              </Text>
              <TouchableOpacity onPress={onReset} style={{ padding: 4 }}>
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#EF4444" }}
                >
                  Reset
                </Text>
              </TouchableOpacity>
            </View>

            {/* Categories */}
            <FlatList
              data={categoryData}
              keyExtractor={([categoryName]) => categoryName}
              renderItem={renderCategorySection}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 20 }}
            />

            {/* Apply Button */}
            <SafeAreaView
              style={{
                backgroundColor: "#FFFFFF",
                borderTopWidth: 1,
                borderTopColor: "#E5E7EB",
                paddingHorizontal: 20,
                paddingVertical: 16,
              }}
            >
              <TouchableOpacity
                onPress={onApply}
                style={{
                  backgroundColor: "#F59E0B",
                  borderRadius: 25,
                  paddingVertical: 18,
                  alignItems: "center",
                  shadowColor: "#F59E0B",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                }}
                activeOpacity={0.9}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 18,
                    fontWeight: "700",
                  }}
                >
                  Apply Filters{" "}
                  {tempSelectedFilters.size > 0
                    ? `(${tempSelectedFilters.size})`
                    : ""}
                </Text>
              </TouchableOpacity>
            </SafeAreaView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default FilterOptions;
