// reviewValidationSchema.js
import * as yup from "yup";

export const postSchema = yup.object().shape({
  id: yup.mixed().nullable(), // allow null or any type (since it’s generated later)
  location: yup
    .string()
    .nullable()
    .required("Please provide the restaurant location."),
  rating: yup
    .number()
    .min(0, "Rating must be at least 0.")
    .max(5, "Rating cannot exceed 5.")
    .required("Rating is required."),
  review: yup
    .string()
    .nullable()
    .required("Please write a review before submitting."),
  images: yup
    .array()
    .of(yup.string().url("Invalid image URL"))
    .default([])
    .required("At least one image is required."),
  is_review: yup
    .string()
    .oneOf(
      ["restaurant", "homedish"],
      'Type must be either "restaurant" or "homedish"'
    )
    .required("Type is required"),
  anonymous: yup.boolean().required(),
  cuisineTags: yup.array().of(yup.string()).default([]),
  amenityTags: yup.array().of(yup.string()).default([]),
  dietaryTags: yup.array().of(yup.string()).default([]),
  peoplesTags: yup.array().of(yup.string()).default([]),

  dishTypes: yup
    .array()
    .of(
      yup.object().shape({
        id: yup.string().required(),
        name: yup.string().required(),
        dishName: yup.string().required("Dish name is required."),
        recommendDish: yup.boolean().required(),
        price: yup.string().nullable(),
        rating: yup
          .number()
          .min(0, "Rating must be at least 0.")
          .max(5, "Rating cannot exceed 5."),
        images: yup
          .array()
          .of(yup.string().url("Invalid image URL"))
          .default([]),
      })
    )
    .min(1, "Please add at least one dish."),
});
