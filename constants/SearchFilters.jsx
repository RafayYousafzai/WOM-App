// Constants for filter data
export const QUICK_FILTERS = [
  { id: "outdoor_seating", label: "Outdoor Seating", categoryId: "amenities" },
  { id: "dog_friendly", label: "Dog Friendly", categoryId: "amenities" },
  { id: "vegetarian", label: "Vegetarian", categoryId: "food" },
];

export const FILTER_CATEGORIES = [
  {
    id: "cuisine",
    name: "Cuisine Type",
    options: [
      { id: "italian", label: "Italian", selected: false },
      { id: "chinese", label: "Chinese", selected: false },
      { id: "mexican", label: "Mexican", selected: false },
      { id: "indian", label: "Indian", selected: false },
      { id: "japanese", label: "Japanese", selected: false },
      { id: "thai", label: "Thai", selected: false },
      { id: "french", label: "French", selected: false },
      { id: "greek", label: "Greek", selected: false },
      { id: "korean", label: "Korean", selected: false },
      { id: "mediterranean", label: "Mediterranean", selected: false },
    ],
  },
  {
    id: "food",
    name: "Food Type",
    options: [
      { id: "vegetarian", label: "Vegetarian", selected: false },
      { id: "vegan", label: "Vegan", selected: false },
      { id: "gluten_free", label: "Gluten Free", selected: false },
      { id: "organic", label: "Organic", selected: false },
      { id: "seafood", label: "Seafood", selected: false },
      // { id: "bbq", label: "BBQ", selected: false },
      { id: "halal", label: "Halal", selected: false },
      { id: "kosher", label: "Kosher", selected: false },
      { id: "vegan", label: "Vegan", selected: false },
      { id: "pescatarian", label: "Pescatarian", selected: false },
      { id: "dairy_free", label: "Dairy-Free", selected: false },
      { id: "egg_free", label: "Egg-Free", selected: false },
      { id: "nut_free", label: "Nut-Free", selected: false },
      { id: "soy_free", label: "Soy-Free", selected: false },
      { id: "shellfish_free", label: "Shellfish-Free", selected: false },
      { id: "low_carb", label: "Low-Carb", selected: false },
      { id: "keto_friendly", label: "Keto-Friendly", selected: false },
      { id: "paleo", label: "Paleo", selected: false },
      { id: "whole30", label: "Whole30", selected: false },
      { id: "low_sodium", label: "Low-Sodium", selected: false },
      { id: "sugar_free", label: "Sugar-Free", selected: false },
      { id: "diabetic_friendly", label: "Diabetic-Friendly", selected: false },
    ],
  },

  {
    id: "amenities",
    name: "Amenities",
    options: [
      { id: "dog_friendly", label: "Dog Friendly", selected: false },
      { id: "wifi", label: "WiFi", selected: false },
      { id: "parking", label: "Parking", selected: false },
      { id: "outdoor_seating", label: "Outdoor Seating", selected: false },
      { id: "delivery", label: "Delivery", selected: false },
      { id: "takeout", label: "Takeout", selected: false },
      { id: "reservations", label: "Reservations", selected: false },
      { id: "live_music", label: "Live Music", selected: false },
      {
        id: "wheelchair_accessible",
        label: "Wheelchair Accessible",
        selected: false,
      },
      { id: "kids_friendly", label: "Kid-Friendly", selected: false },
    ],
  },
  {
    id: "rating",
    name: "Rating",
    options: [
      { id: "5_stars", label: "5 Stars", selected: false },
      { id: "4_stars", label: "4+ Stars", selected: false },
      { id: "3_stars", label: "3+ Stars", selected: false },
    ],
  },
  {
    id: "hours",
    name: "Hours",
    options: [
      { id: "open_now", label: "Open Now", selected: false },
      { id: "open_late", label: "Open Late", selected: false },
      { id: "breakfast", label: "Breakfast", selected: false },
      { id: "lunch", label: "Lunch", selected: false },
      { id: "dinner", label: "Dinner", selected: false },
      { id: "weekend_brunch", label: "Weekend Brunch", selected: false },
    ],
  },
  {
    id: "extras",
    name: "Extra Information",
    options: [
      { id: "cleanliness", label: "Cleanliness", selected: false },
      { id: "ambiance", label: "Ambiance", selected: false },
      { id: "portion_size", label: "Portion Size", selected: false },
      { id: "service", label: "Service", selected: false },
      { id: "noise_level", label: "Noise Level", selected: false },
      { id: "presentation", label: "Presentation", selected: false },
      { id: "value_for_money", label: "Value for Money", selected: false },
      { id: "lighting", label: "Lighting", selected: false },
      { id: "seating_comfort", label: "Seating Comfort", selected: false },
      { id: "temperature", label: "Temperature", selected: false },
      { id: "music", label: "Music", selected: false },
      { id: "crowd", label: "Crowd", selected: false },
      { id: "accessibility", label: "Accessibility", selected: false },
      { id: "restroom_quality", label: "Restroom Quality", selected: false },
    ],
  },
];

export const extractSuggestionsByCategory = (categories) => {
  const result = {};

  categories.forEach((category) => {
    const key = category.id; // e.g., "cuisine", "food", "amenities", etc.
    result[key] = category.options.map((opt) => opt.label);
  });

  return result;
};

export const extractSuggestionsIdByCategory = (categories) => {
  const result = {};

  categories.forEach((category) => {
    const key = category.id; // e.g., "cuisine", "food", "amenities", etc.
    result[key] = category.options.map((opt) => opt.id);
  });

  return result;
};
