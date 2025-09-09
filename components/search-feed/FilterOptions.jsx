import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  Animated,
  StatusBar,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useReview } from "@/context/reviewContext";
import { useSearch } from "@/context/searchContext";
import Joi from "joi";

const FilterOptions = () => {
  const { tags: tagCategories } = useReview();

  const [modalVisible, setModalVisible] = useState(false);
  const { selectedFilters, setSelectedFilters, setMoreFilters } = useSearch();
  const [tempSelectedFilters, setTempSelectedFilters] = useState(new Set());
  const slideAnim = new Animated.Value(0);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [rating, setRating] = useState("");

  // Joi validation schemas
  const priceSchema = Joi.number().min(0).allow(null, "");
  const ratingSchema = Joi.number().min(1).max(10).allow(null, "");

  // Get popular tags for horizontal scroll
  const popularTags = useMemo(
    () => [{ id: "all", name: "All", type: "special", icon: "options" }],
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
    // Helper function to validate and parse values with Joi
    const validateValue = (value, schema) => {
      if (!value || value.trim() === "") return null;

      const { error, value: validatedValue } = schema.validate(
        parseFloat(value)
      );
      return error ? null : validatedValue;
    };

    // Validate using Joi schemas
    let validMinPrice = validateValue(minPrice, priceSchema);
    let validMaxPrice = validateValue(maxPrice, priceSchema);
    let validRating = validateValue(rating, ratingSchema);

    // Validate price range logic - swap if min > max
    if (
      validMinPrice !== null &&
      validMaxPrice !== null &&
      validMinPrice > validMaxPrice
    ) {
      [validMinPrice, validMaxPrice] = [validMaxPrice, validMinPrice];
    }

    setSelectedFilters(new Set(tempSelectedFilters));
    setMoreFilters({
      priceRange: {
        min: validMinPrice,
        max: validMaxPrice,
      },
      rating: validRating,
    });
    closeModal();
  }, [
    tempSelectedFilters,
    minPrice,
    maxPrice,
    rating,
    closeModal,
    priceSchema,
    ratingSchema,
  ]);

  const resetFilters = useCallback(() => {
    setTempSelectedFilters(new Set());
    setMinPrice("");
    setMaxPrice("");
    setRating("");
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
            borderRadius: 21,
            paddingHorizontal: 16,
            paddingVertical: 10,
            height: 46,
            marginHorizontal: 3,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: selectedFilters.size === 0 ? "#f3f4f6" : "#F59E0B",
          }}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isSpecial ? "options" : "pricetag-outline"}
            size={16}
            color={selectedFilters.size === 0 ? "#666" : "#f3f4f6"}
          />
        </TouchableOpacity>
      );
    },
    [selectedFilters, toggleFilter]
  );

  return (
    <View style={{ backgroundColor: "#FFFFFF" }}>
      {/* Horizontal Scrollable Tags */}
      <View style={{ paddingVertical: 0 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={100}
        >
          {popularTags.map(renderHorizontalChip)}
        </ScrollView>
      </View>

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
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        rating={rating}
        setRating={setRating}
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
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  rating,
  setRating,
}) => {
  const validateNumericInput = (value, min, max) => {
    const num = parseFloat(value);
    if (isNaN(num)) return false;
    return num >= min && num <= max;
  };

  const handlePriceInput = (value, setter, isMin = false) => {
    // Allow empty string, decimal point, and valid numbers
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setter(value);
    }
  };

  const handleRatingInput = (value) => {
    // Allow empty string, decimal point, and valid numbers between 1-10
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const num = parseFloat(value);
      if (value === "" || (num >= 1 && num <= 10)) {
        setRating(value);
      }
    }
  };
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
            backgroundColor: "#fff",
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

            <ScrollView>
              {/* Price and Rating Inputs */}
              <View
                style={{
                  paddingHorizontal: 20,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: "#111827",
                    marginBottom: 16,
                  }}
                >
                  Price Range
                </Text>

                {/* Price Range */}
                <View style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{ flex: 1 }}>
                      <TextInput
                        value={minPrice}
                        onChangeText={(value) =>
                          handlePriceInput(value, setMinPrice, true)
                        }
                        placeholder="0.00"
                        keyboardType="decimal-pad"
                        style={{
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          fontSize: 16,
                          backgroundColor: "#F9FAFB",
                        }}
                      />
                    </View>
                    <Text style={{ color: "#6B7280", marginHorizontal: 8 }}>
                      to
                    </Text>
                    <View style={{ flex: 1, marginHorizontal: 8 }}>
                      <TextInput
                        value={maxPrice}
                        onChangeText={(value) =>
                          handlePriceInput(value, setMaxPrice)
                        }
                        placeholder="0.00"
                        keyboardType="decimal-pad"
                        style={{
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          fontSize: 16,
                          backgroundColor: "#F9FAFB",
                        }}
                      />
                    </View>
                  </View>
                </View>
                {/* Rating */}
                <View>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "700",
                      color: "#111827",
                      marginBottom: 16,
                    }}
                  >
                    Minimum Rating
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{ flex: 1 }}>
                      <TextInput
                        value={rating}
                        onChangeText={handleRatingInput}
                        placeholder="3.4"
                        keyboardType="decimal-pad"
                        style={{
                          borderRadius: 12,
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          fontSize: 16,
                          backgroundColor: "#F9FAFB",
                        }}
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* Categories */}
              <FlatList
                data={categoryData}
                keyExtractor={([categoryName]) => categoryName}
                renderItem={renderCategorySection}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 20 }}
                scrollEnabled={false}
              />
            </ScrollView>

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
