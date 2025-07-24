import * as yup from "yup";

const profileSchema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  imageUrl: yup.string().url("Invalid image URL").nullable(),
});

export { profileSchema };
