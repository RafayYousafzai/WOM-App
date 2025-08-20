import Joi from "joi";

// Dish schema
const dishSchema = Joi.object({
  dishName: Joi.string().required().min(1).max(255).messages({
    "string.empty": "Dish name is required",
    "string.max": "Dish name cannot exceed 255 characters",
    "any.required": "Dish name is required",
  }),
  id: Joi.string().optional(),
  name: Joi.string().optional(),
  price: Joi.alternatives()
    .try(
      Joi.number().min(0),
      Joi.string()
        .pattern(/^\d+(\.\d{1,2})?$/)
        .messages({
          "string.pattern.base": "Price must be a valid number",
        })
    )
    .required()
    .messages({
      "any.required": "Dish price is required",
    }),
  rating: Joi.number().integer().min(1).max(10).required().messages({
    "number.min": "Rating must be between 1 and 10",
    "number.max": "Rating must be between 1 and 10",
    "any.required": "Dish rating is required",
  }),
  recommendDish: Joi.boolean().default(false),
  images: Joi.array().items(Joi.string().uri()).default([]).messages({
    "string.uri": "Image URLs must be valid URLs",
  }),
});

// Main review data schema
export const reviewDataSchema = Joi.object({
  // Tags
  amenityTags: Joi.array().items(Joi.string()).default([]),
  cuisineTags: Joi.array().items(Joi.string()).min(1).required().messages({
    "array.min": "At least one cuisine tag is required",
    "any.required": "Cuisine tags are required",
  }),
  dietaryTags: Joi.array().items(Joi.string()).default([]),
  peoplesTags: Joi.array().items(Joi.string()).default([]),

  // Review content
  review: Joi.string().required().min(10).max(1000).messages({
    "string.empty": "Review text is required",
    "string.min": "Review must be at least 10 characters long",
    "string.max": "Review cannot exceed 1000 characters",
    "any.required": "Review text is required",
  }),

  // Settings
  anonymous: Joi.boolean().default(false),

  // Restaurant and dishes
  location: Joi.string().required(),
  dishTypes: Joi.array().items(dishSchema).min(1).required().messages({
    "array.min": "At least one dish is required",
    "any.required": "At least one dish is required",
  }),

  // Optional fields
  rating: Joi.number().integer().min(0).max(10).default(0),
  images: Joi.array().items(Joi.string().uri()).default([]),
  drafts: Joi.array().default([]),
  id: Joi.string().allow(null).optional(),
  is_review: Joi.string().valid("restaurant").default("restaurant"),
});

/**
 * Validates review data against the schema
 * @param {Object} data - The review data to validate
 * @returns {Object} - Validation result with error details if any
 */
export const validateReviewData = (data) => {
  const { error, value } = reviewDataSchema.validate(data, {
    abortEarly: false, // Collect all errors
    allowUnknown: false, // Don't allow unknown fields
    stripUnknown: true, // Remove unknown fields
  });

  if (error) {
    const validationErrors = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
      value: detail.context?.value,
    }));

    return {
      isValid: false,
      errors: validationErrors,
      data: null,
    };
  }

  return {
    isValid: true,
    errors: [],
    data: value,
  };
};

/**
 * Sanitizes review data by trimming strings and normalizing values
 * @param {Object} data - The review data to sanitize
 * @returns {Object} - Sanitized data
 */
export const sanitizeReviewData = (data) => {
  if (!data || typeof data !== "object") {
    return data;
  }

  const sanitized = { ...data };

  // Trim string values
  if (sanitized.review && typeof sanitized.review === "string") {
    sanitized.review = sanitized.review.trim();
  }

  // Sanitize location
  if (sanitized.location && typeof sanitized.location === "object") {
    if (sanitized.location.name) {
      sanitized.location.name = sanitized.location.name.trim();
    }
    if (sanitized.location.address) {
      sanitized.location.address = sanitized.location.address.trim();
    }
  }

  // Sanitize dishes
  if (Array.isArray(sanitized.dishTypes)) {
    sanitized.dishTypes = sanitized.dishTypes.map((dish) => ({
      ...dish,
      dishName: dish.dishName ? dish.dishName.trim() : dish.dishName,
      price: typeof dish.price === "string" ? dish.price.trim() : dish.price,
    }));
  }

  return sanitized;
};

/**
 * Complete validation function that sanitizes and validates data
 * @param {Object} data - Raw review data
 * @returns {Object} - Complete validation result
 */
export const validateAndSanitizeReviewData = (data) => {
  try {
    // First sanitize the data
    const sanitizedData = sanitizeReviewData(data);

    // Then validate it
    const validationResult = validateReviewData(sanitizedData);

    return validationResult;
  } catch (error) {
    return {
      isValid: false,
      errors: [
        {
          field: "general",
          message: "Failed to process review data",
          value: error.message,
        },
      ],
      data: null,
    };
  }
};

export default {
  reviewDataSchema,
  validateReviewData,
  sanitizeReviewData,
  validateAndSanitizeReviewData,
};
