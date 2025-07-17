import Button from "@/src/components/Button/Button";
import UserInfoRow from "@/src/components/UserInfoRow/UserInfoRow";
import Colors from "@/src/constants/Colors";
import { useAppDispatch } from "@/src/hook/useDispatch";
import { useNavigation } from "@/src/hook/useNavigation";
import { RootState } from "@/src/redux/rootReducer";
import { logout } from "@/src/redux/slices/authSlices";
import { resetGroupState } from "@/src/redux/slices/groupSlices";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
// Import hook useTranslation từ react-i18next
import { useTranslation } from "react-i18next";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  // Sử dụng hook useTranslation để truy cập hàm t và đối tượng i18n
  const { t, i18n } = useTranslation(); 

  const handleLogout = () => {
    Alert.alert(t('profile.logout_title'), t('profile.logout_confirm'), [ // Dịch tiêu đề và nội dung Alert
      { text: t('common.cancel') }, // Dịch nút "Hủy"
      {
        text: t('profile.logout_button'), // Dịch nút "Đăng xuất"
        onPress: () => {
          dispatch(logout()).unwrap();
          dispatch(resetGroupState());
        },
        style: "destructive",
      },
    ]);
  };

  // Hàm để thay đổi ngôn ngữ
  const handleChangeLanguage = () => {
    const newLang = i18n.language === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <View style={styles.container}>
      {/* Dịch tiêu đề màn hình */}
      <Text style={styles.title}>{t('profile.screen_title')}</Text> 
      
      {/* Dịch các nhãn UserInfoRow */}
      <UserInfoRow label={t('profile.email_label')} value={user?.email || t('profile.guest_label')} />

      <View style={styles.logoutBtn}>
        {
          user ? (
            <Button
              size={"large"}
              title={t('profile.logout_button')} // Dịch nút Đăng xuất
              color={Colors.primary500}
              onPress={handleLogout}
            />
          ) : (
            <Button
              size={"large"}
              title={t('profile.login_button')} // Dịch nút Đăng nhập
              color={Colors.primary500}
              onPress={() => navigation.navigate("LoginScreen")}
            />
          )
        }
        {/* Nút đổi ngôn ngữ */}
        <Button
          size={"large"}
          title={t('button.change_language')} // Dịch nút đổi ngôn ngữ
          color={Colors.gray500} // Màu sắc khác để phân biệt
          onPress={handleChangeLanguage}
          // style={styles.languageBtn} // Thêm style cho nút ngôn ngữ
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  logoutBtn: {
    marginTop: 40,
  },
  languageBtn: {
    marginTop: 16, // Khoảng cách giữa nút đăng xuất và nút đổi ngôn ngữ
  },
});
