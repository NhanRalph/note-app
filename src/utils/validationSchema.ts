import * as Yup from "yup";

export const loginSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Email không hợp lệ")
    .required("Bắt buộc nhập"),
  password: Yup.string()
    .trim()
    .min(6, "Tối thiểu 6 ký tự")
    .required("Bắt buộc nhập"),
});

export const signUpSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Email không hợp lệ")
    .required("Bắt buộc nhập"),
  password: Yup.string()
    .trim()
    .min(6, "Tối thiểu 6 ký tự")
    .required("Bắt buộc nhập"),
  confirmPassword: Yup.string()
    .trim()
    .oneOf([Yup.ref("password")], "Mật khẩu không khớp")
    .required("Bắt buộc nhập"),
});

export const createGroupSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Bắt buộc nhập")
    .max(50, "Tối đa 50 ký tự"),
});

export const createNoteSchema = Yup.object({
  title: Yup.string()
    .trim()
    .required("Bắt buộc nhập")
    .max(50, "Tối đa 50 ký tự"),
  content: Yup.string()
    .trim()
    .required("Bắt buộc nhập")
    .max(5000, "Tối đa 5000 ký tự"),
});
