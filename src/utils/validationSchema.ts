import * as Yup from "yup";

export const loginSchema = Yup.object({
  email: Yup.string().email("Email không hợp lệ").required("Bắt buộc nhập"),
  password: Yup.string().min(6, "Tối thiểu 6 ký tự").required("Bắt buộc nhập"),
});

export const signUpSchema = Yup.object({
  email: Yup.string().email("Email không hợp lệ").required("Bắt buộc nhập"),
  password: Yup.string().min(6, "Tối thiểu 6 ký tự").required("Bắt buộc nhập"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Mật khẩu không khớp")
    .required("Bắt buộc nhập"),
});

export const createGroupSchema = Yup.object({
  name: Yup.string().required("Bắt buộc nhập"),
});

export const createNoteSchema = Yup.object({
  title: Yup.string().required("Bắt buộc nhập"),
  content: Yup.string().required("Bắt buộc nhập"),
});
