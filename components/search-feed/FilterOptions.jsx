import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { FILTER_CATEGORIES, QUICK_FILTERS } from "@/constants/SearchFilters";
import { useSearch } from "@/context/searchContext";

const FilterOptions = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const {
    activeFilters,
    setActiveFilters,
    filterCategories,
    setFilterCategories,
  } = useSearch();

  // Update active filters based on selected options
  const updateActiveFilters = useCallback(() => {
    const selectedFilters = filterCategories.flatMap((category) =>
      category.options
        .filter((option) => option.selected)
        .map((option) => ({ categoryId: category.id, ...option }))
    );
    setActiveFilters(selectedFilters.map((filter) => filter.label));
    return selectedFilters;
  }, [filterCategories, setActiveFilters]);

  // Toggle filter option selection
  const toggleFilterOption = useCallback((categoryId, optionId) => {
    setFilterCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              options: category.options.map((option) =>
                option.id === optionId
                  ? { ...option, selected: !option.selected }
                  : option
              ),
            }
          : category
      )
    );
  }, []);

  // Apply filters and optionally close modal
  const applyFilters = useCallback((closeModal = true) => {
    updateActiveFilters();
    if (closeModal) setModalVisible(false);
  }, []);

  // Reset all filters
  const resetFilters = () => {
    setFilterCategories(FILTER_CATEGORIES);
    setActiveFilters([]);
  };

  // Remove a specific filter
  const removeFilter = useCallback((filterLabel) => {
    setFilterCategories((prev) =>
      prev.map((category) => ({
        ...category,
        options: category.options.map((option) =>
          option.label === filterLabel ? { ...option, selected: false } : option
        ),
      }))
    );
  }, []);

  // Effect to update active filters when selections change
  useEffect(() => {
    updateActiveFilters();
  }, [filterCategories, updateActiveFilters]);

  // Toggle quick filter (combines toggle and immediate apply)
  const toggleQuickFilter = useCallback(
    (filterId, categoryId) => {
      toggleFilterOption(categoryId, filterId);
      setTimeout(() => applyFilters(false), 0);
    },
    [applyFilters, toggleFilterOption]
  );

  // Check if a quick filter is selected
  const isQuickFilterSelected = useCallback(
    (filterId) => {
      return filterCategories.some((category) =>
        category.options.some((opt) => opt.id === filterId && opt.selected)
      );
    },
    [filterCategories]
  );

  // Render individual filter chip
  const renderFilterChip = useCallback(
    (filter) => (
      <TouchableOpacity
        key={filter}
        onPress={() => removeFilter(filter)}
        className="flex-row items-center mr-2.5 px-2.5 py-1.5 bg-amber-100 rounded-full border border-amber-200"
        activeOpacity={0.7}
      >
        <Text className="text-amber-800 text-xs font-medium mr-1.5">
          {filter}
        </Text>
        <Ionicons name="close-circle" size={14} color="#92400E" />
      </TouchableOpacity>
    ),
    [removeFilter]
  );

  // Render quick filter button
  const renderQuickFilter = useCallback(
    (filter) => (
      <TouchableOpacity
        key={filter.id}
        onPress={() => toggleQuickFilter(filter.id, filter.categoryId)}
        className={`mr-1.5 px-3 py-1.5 rounded-full border border-gray-300  ${
          isQuickFilterSelected(filter.id)
            ? "bg-amber-500 border-amber-500"
            : "bg-white border-gray-200"
        }`}
        activeOpacity={0.7}
      >
        <Text
          className={`text-sm font-medium ${
            isQuickFilterSelected(filter.id) ? "text-white" : "text-gray-700"
          }`}
        >
          {filter.label}
        </Text>
      </TouchableOpacity>
    ),
    [isQuickFilterSelected, toggleQuickFilter]
  );

  // Render filter option in modal
  const renderFilterOption = useCallback(
    ({ item: category }) => (
      <View className="px-4 py-3 border-b border-gray-100">
        <Text className="text-lg font-bold mb-3">{category.name}</Text>
        <View className="flex-row flex-wrap">
          {category.options.map((option) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => toggleFilterOption(category.id, option.id)}
              className={`mr-2.5 mb-2.5 px-3.5 py-1.5 rounded-full border ${
                option.selected
                  ? "bg-amber-500 border-amber-500"
                  : "bg-white border-gray-300"
              }`}
              activeOpacity={0.7}
            >
              <Text
                className={`font-medium text-sm ${
                  option.selected ? "text-white" : "text-gray-700"
                }`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    ),
    [toggleFilterOption]
  );

  return (
    <View className="mt-3 mb-0">
      {/* Main Filter Bar */}
      <View className="px-0">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row"
          contentContainerStyle={{ paddingVertical: 4, paddingHorizontal: 4 }}
        >
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="flex-row items-center bg-white rounded-full px-3 py-1.5 border border-gray-200 shadow-sm mr-1.5"
            activeOpacity={0.7}
          >
            <Ionicons name="options-outline" size={16} color="#666" />
          </TouchableOpacity>

          {QUICK_FILTERS.map(renderQuickFilter)}
        </ScrollView>
      </View>

      {/* Active Filters Row */}
      {activeFilters?.length > 0 && (
        <View className="mt-2">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 2 }}
          >
            {activeFilters.map(renderFilterChip)}
            <TouchableOpacity
              onPress={resetFilters}
              className="flex-row items-center mr-2 px-2.5 py-1.5 bg-gray-100 rounded-full border border-gray-200"
              activeOpacity={0.7}
            >
              <Text className="text-gray-600 text-xs font-medium">
                Clear All
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onReset={resetFilters}
        onApply={() => applyFilters(true)}
        filterCategories={filterCategories}
        renderFilterOption={renderFilterOption}
        activeFiltersCount={activeFilters.length}
      />
    </View>
  );
};

const FilterModal = ({
  visible,
  onClose,
  onReset,
  onApply,
  filterCategories,
  renderFilterOption,
  activeFiltersCount,
}) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row justify-between items-center px-4 py-4 border-b mt-6 border-gray-200">
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold">All Filters</Text>
        <TouchableOpacity onPress={onReset}>
          <Text className="text-amber-500 font-medium">Reset</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filterCategories}
        keyExtractor={(item) => item.id}
        renderItem={renderFilterOption}
        showsVerticalScrollIndicator={false}
      />

      <SafeAreaView className="bg-white border-t border-gray-200">
        <View className="px-4 py-4">
          <TouchableOpacity
            onPress={onApply}
            className="bg-amber-500 rounded-full py-3 items-center shadow-sm"
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-lg">
              Apply {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ""}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaView>
  </Modal>
);

export default FilterOptions;
