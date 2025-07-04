import Button from "@/src/components/Button/Button";
import Colors from "@/src/constants/Colors";
import { useAppDispatch } from "@/src/hook/useDispatch";
import { useNavigation } from "@/src/hook/useNavigation";
import { RootStackParamList } from "@/src/navigation/types/navigationTypes";
import { RootState } from "@/src/redux/rootReducer";
import { updateGroupStore } from "@/src/redux/slices/groupSlices";
import { createGroupSchema } from "@/src/utils/validationSchema";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { Formik } from "formik";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";

interface UpdateGroupScreenProps {
  route: RouteProp<RootStackParamList, "UpdateGroup">;
}

const UpdateGroupScreen: React.FC<UpdateGroupScreenProps> = ({ route }) => {
  const userId = route.params?.userId;
  const name = route.params?.name;
  const groupId = route.params?.groupId;
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { loadingGroup, error } = useSelector((state: RootState) => state.group);

  const initialValues = {
    name: name || "",
  };

  const handleSubmit = (values: { name: string }) => {
    dispatch(
      updateGroupStore({ userId: userId, groupId: groupId, name: values.name })
    );

    //check create group success
    if (error) {
      Alert.alert("Error", error);
      return;
    }

    Toast.show({
      type: "success",
      text1: "Thành công",
      text2: "Đã chỉnh sửa thành công!",
    });
    navigation.reset({
      index: 0,
      routes: [{ name: "Main" }],
    });
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={Colors.primary600} />
      </TouchableOpacity>
      <Text style={styles.title}>Chỉnh sửa nhóm ghi chú</Text>

      <Formik
        initialValues={initialValues}
        validationSchema={createGroupSchema}
        onSubmit={handleSubmit}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
        }) => (
          <>
            <TextInput
              style={styles.input}
              placeholder="Group Name"
              placeholderTextColor="#999"
              onChangeText={handleChange("name")}
              onBlur={handleBlur("name")}
              value={values.name}
              autoCapitalize="none"
            />
            {touched.name && errors.name && (
              <Text style={styles.error}>{errors.name}</Text>
            )}

            <Button
              title="Chỉnh sửa"
              size="large"
              color={Colors.primary600}
              onPress={handleSubmit}
              loading={loadingGroup}
            />
          </>
        )}
      </Formik>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  backBtn: {
    position: "absolute",
    top: 48,
    left: 24,
    zIndex: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  error: {
    color: "red",
    marginBottom: 8,
    marginLeft: 4,
  },
  orText: {
    textAlign: "center",
    marginVertical: 16,
    color: "#666",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    justifyContent: "center",
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  socialText: {
    color: "#fff",
    fontWeight: "bold",
  },
  floatLeft: {
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  createAccountText: {
    color: Colors.primary600,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

export default UpdateGroupScreen;
