import * as yup from "yup";

export const postSchema = yup.object().shape({
  location: yup.object().shape({
    latitude: yup.number().required("Latitude is required."),
    longitude: yup.number().required("Longitude is required."),
    address: yup.string().required("Address is required."),
  }),

  rating: yup
    .number()
    .min(0, "Rating must be at least 0.")
    .max(10, "Rating cannot exceed 10.")
    .required("Rating is required."),

  review: yup
    .string()
    .min(10, "Review must be at least 10 characters.")
    .max(500, "Review cannot exceed 500 characters.")
    .required("Please write a review before submitting."),

  is_review: yup.boolean().required("Type is required"),

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
          .max(10, "Rating cannot exceed 10."), // ✅ aligned with 5-star system
        images: yup
          .array()
          .of(yup.string().required("Image is required")) // ✅ no url() check yet
          .min(1, "Please add at least one image for this dish.")
          .required(),
      })
    )
    .min(1, "Please add at least one dish."),
});
