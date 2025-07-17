import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as RNLocalize from "react-native-localize";

// Import các tệp bản dịch
import en from "./locales/en.json";
import vi from "./locales/vi.json";

// Cấu hình ngôn ngữ mặc định dựa trên thiết bị
const locales = RNLocalize.getLocales();
const fallbackLang = "en"; // Ngôn ngữ dự phòng
const currentLanguage =
  locales.length > 0 ? locales[0].languageCode : fallbackLang;

// Kiểm tra xem ngôn ngữ hiện tại có được hỗ trợ không
const supportedLngs = ["en", "vi"];
const initialLng = supportedLngs.includes(currentLanguage)
  ? currentLanguage
  : fallbackLang;

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en: {
        translation: en,
      },
      vi: {
        translation: vi,
      },
    },
    lng: initialLng, // Ngôn ngữ khởi tạo
    fallbackLng: fallbackLang, // Ngôn ngữ dự phòng
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
