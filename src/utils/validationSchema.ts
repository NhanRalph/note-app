import * as Yup from "yup";
import i18n from "../i18n/i18n";

// Sử dụng i18n.t() để dịch các thông báo lỗi
export const loginSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email(i18n.t("validation.email_invalid")) // Dịch "Email không hợp lệ"
    .required(i18n.t("validation.required_field")), // Dịch "Bắt buộc nhập"
  password: Yup.string()
    .trim()
    .min(6, i18n.t("validation.min_length", { min: 6 })) // Dịch "Tối thiểu 6 ký tự"
    .required(i18n.t("validation.required_field")), // Dịch "Bắt buộc nhập"
});

export const signUpSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email(i18n.t("validation.email_invalid")) // Dịch "Email không hợp lệ"
    .required(i18n.t("validation.required_field")), // Dịch "Bắt buộc nhập"
  password: Yup.string()
    .trim()
    .min(6, i18n.t("validation.min_length", { min: 6 })) // Dịch "Tối thiểu 6 ký tự"
    .required(i18n.t("validation.required_field")), // Dịch "Bắt buộc nhập"
  confirmPassword: Yup.string()
    .trim()
    .oneOf([Yup.ref("password")], i18n.t("validation.password_mismatch")) // Dịch "Mật khẩu không khớp"
    .required(i18n.t("validation.required_field")), // Dịch "Bắt buộc nhập"
});

export const createGroupSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required(i18n.t("validation.required_field")) // Dịch "Bắt buộc nhập"
    .max(50, i18n.t("validation.max_length", { max: 50 })), // Dịch "Tối đa 50 ký tự"
});

export const createNoteSchema = Yup.object({
  title: Yup.string()
    .trim()
    .required(i18n.t("validation.required_field")) // Dịch "Bắt buộc nhập"
    .max(50, i18n.t("validation.max_length", { max: 50 })), // Dịch "Tối đa 50 ký tự"
  content: Yup.string()
    .trim()
    .required(i18n.t("validation.required_field")) // Dịch "Bắt buộc nhập"
    .max(5000, i18n.t("validation.max_length", { max: 5000 })), // Dịch "Tối đa 5000 ký tự"
});
