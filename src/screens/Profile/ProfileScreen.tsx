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
// import { useDispatch } from 'react-redux';
// import { logout } from '../redux/authSlice';

export default function ProfileScreen() {
  const navigation = useNavigation();
    const dispatch = useAppDispatch();
    const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy" },
      {
        text: "Đăng xuất",
        onPress: () => {
          dispatch(logout()).unwrap();
          dispatch(resetGroupState());
        },
        style: "destructive",
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thông tin cá nhân</Text>
      <UserInfoRow label="Họ tên" value={"Nhân"} />
      <UserInfoRow label="Email" value={user?.email || "Khách"} />
      <UserInfoRow label="SĐT" value={"0123456789"} />

      <View style={styles.logoutBtn}>
        {
          user ? (
            <Button
              size={"large"}
              title="Đăng xuất"
              color={Colors.primary500}
              onPress={handleLogout}
            />
          ) : (
            <Button
              size={"large"}
              title="Đăng nhập"
              color={Colors.primary500}
              onPress={() => navigation.navigate("LoginScreen")}
            />
          )
        }
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
});
