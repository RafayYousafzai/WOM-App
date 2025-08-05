import Joi from "joi";

// Common reusable validation patterns
const commonValidations = {
  uri: Joi.string().uri().messages({
    "string.uri": "Must be a valid URL",
  }),
  optionalString: (max) => Joi.string().max(max).allow(""),
  requiredString: (min, max) => Joi.string().min(min).max(max).required(),
  optionalArray: (maxItems) => Joi.array().items(Joi.string()).max(maxItems),
  phoneNumber: Joi.string()
    .pattern(/^\+?[0-9]{7,15}$/)
    .allow(""),
};

export const postSchema = Joi.object({
  // Required fields
  images: Joi.array()
    .items(Joi.string().uri()) // Added URI validation
    .min(1)
    .required()
    .messages({
      "array.base": "Please upload at least one image",
      "array.min": "Please upload at least one image",
      "any.required": "Images are required",
      "string.uri": "Image URLs must be valid",
    }),

  caption: Joi.string().min(3).max(100).required().messages({
    "string.empty": "Caption is required",
    "string.min": "Caption must be at least 3 characters",
    "string.max": "Caption cannot exceed 100 characters",
  }),

  review: Joi.string().min(4).max(500).required().messages({
    "string.empty": "Review is required",
    "string.min": "Review must be at least 4 characters",
    "string.max": "Review cannot exceed 500 characters",
  }),

  rating: Joi.number().min(1).max(10).required().messages({
    "number.base": "Rating must be a number",
    "number.min": "Minimum rating is 1",
    "number.max": "Maximum rating is 10",
    "any.required": "Rating is required",
  }),

  // Optional arrays with improved validation
  cuisines: Joi.array().items(Joi.string().max(30)).max(10).messages({
    "array.base": "Cuisines must be an array",
    "array.max": "Maximum 10 cuisines allowed",
    "string.max": "Each cuisine cannot exceed 30 characters",
  }),

  hashtags: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[a-zA-Z0-9_]+$/)
        .max(30)
    )
    .max(10)
    .messages({
      "array.max": "Maximum 10 hashtags allowed",
      "string.pattern.base": "Only letters, numbers and underscores allowed",
      "string.max": "Each hashtag cannot exceed 30 characters",
    }),

  people: Joi.array().items(Joi.object().max(50)).max(10).messages({
    "array.max": "Maximum 10 people tags allowed",
    "string.max": "Each person tag cannot exceed 50 characters",
  }),

  // New optional fields with defaults
  dietary_tags: Joi.array()
    .items(Joi.string().max(30))
    .max(10)
    .default([])
    .messages({
      "array.max": "Maximum 10 dietary tags allowed",
    }),

  info_tags: Joi.array()
    .items(Joi.string().max(30))
    .max(10)
    .default([])
    .messages({
      "array.max": "Maximum 10 info tags allowed",
    }),

  quote: Joi.boolean().default(false),

  user_id: Joi.string().required().messages({
    "string.empty": "User ID is required",
  }),
}).options({
  abortEarly: false, // Show all validation errors
  stripUnknown: true, // Remove unknown fields
  allowUnknown: true, // Don't fail on unknown fields
});
