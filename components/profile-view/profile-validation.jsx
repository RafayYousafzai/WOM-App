import * as yup from "yup";

export const profileSchema = yup.object().shape({
  username: yup.string().required("Username is required"),
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  imageUrl: yup.string().url("Invalid image URL").nullable(),
  bio: yup.string().max(150, "Bio must be less than 150 characters"),
  dietaryRestrictions: yup.array(),
});
