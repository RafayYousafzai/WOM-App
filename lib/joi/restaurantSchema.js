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

export const restaurantSchema = Joi.object({
  // Required fields
  images: Joi.array().items(commonValidations.uri).min(1).required().messages({
    "array.base": "Please upload at least one image",
    "array.min": "Please upload at least one image",
    "any.required": "Images are required",
  }),

  restaurantName: commonValidations.requiredString(3, 100).messages({
    "string.empty": "Restaurant name is required",
    "string.min": "Name must be at least 3 characters",
    "string.max": "Name cannot exceed 100 characters",
  }),

  location: Joi.object({
    latitude: Joi.number().required().messages({
      "any.required": "Latitude is required",
      "number.base": "Latitude must be a number",
    }),
    longitude: Joi.number().required().messages({
      "any.required": "Longitude is required",
      "number.base": "Longitude must be a number",
    }),
    address: commonValidations.requiredString(3, 200).messages({
      "string.empty": "Address is required",
      "string.min": "Address must be at least 3 characters",
    }),
  }).required(),

  price: Joi.number().min(0).max(10000).required().messages({
    "number.base": "Price must be a number",
    "number.min": "Price cannot be negative",
    "number.max": "Price cannot exceed 10,000",
    "any.required": "Price is required",
  }),

  rating: Joi.number().min(0).max(5).required().messages({
    "number.base": "Rating must be a number",
    "number.min": "Minimum rating is 0",
    "number.max": "Maximum rating is 5",
    "any.required": "Rating is required",
  }),

  review: commonValidations.requiredString(10, 2000).messages({
    "string.empty": "Review is required",
    "string.min": "Review must be at least 10 characters",
    "string.max": "Review cannot exceed 2000 characters",
  }),

  // Optional fields
  recommendDish: Joi.boolean().optional().default(false).messages({
    "boolean.base": "Must be true or false",
  }),

  website: Joi.alternatives()
    .try(commonValidations.uri, Joi.string().allow("").empty(""))
    .messages({
      "string.uri": "Please enter a valid URL",
      "alternatives.match": "Please enter a valid URL or leave empty",
    }),
  phoneNumber: commonValidations.phoneNumber.messages({
    "string.pattern.base": "Please enter a valid phone number",
  }),

  cuisines: commonValidations.optionalArray(10).optional().messages({
    "array.max": "Maximum 10 cuisines allowed",
  }),

  amenities: commonValidations.optionalArray(10).optional().messages({
    "array.max": "Maximum 10 amenities allowed",
  }),

  dietary: commonValidations.optionalArray(10).optional().messages({
    "array.max": "Maximum 10 dietary options allowed",
  }),

  peoples: commonValidations.optionalArray(20).optional().messages({
    "array.max": "Maximum 20 people tags allowed",
  }),

  // Extra metadata
  anonymous: Joi.boolean().default(false),
  quote: Joi.boolean().default(false),

  // Flexible additional fields
  extra: Joi.array().items(Joi.string()).max(10).messages({
    "array.max": "Maximum 10 extra tags allowed",
  }),
})
  // Allow unknown fields but strip them
  .options({ allowUnknown: true, stripUnknown: true });
