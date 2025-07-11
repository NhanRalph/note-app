import { createNote } from "@/src/api/noteAPI";
import Button from "@/src/components/Button/Button";
import Colors from "@/src/constants/Colors";
import { useNoteContext } from "@/src/context/noteContext";
import { useAppDispatch } from "@/src/hook/useDispatch";
import { useNavigation } from "@/src/hook/useNavigation";
import { RootStackParamList } from "@/src/navigation/types/navigationTypes";
import { RootState } from "@/src/redux/rootReducer";
import { increaseNoteCount } from "@/src/redux/slices/groupSlices";
import { createNoteSchema } from "@/src/utils/validationSchema";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { Formik } from "formik";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";

interface CreateNoteScreenProps {
  route: RouteProp<RootStackParamList, "CreateNote">;
}

const CreateNoteScreen: React.FC<CreateNoteScreenProps> = ({ route }) => {
  const dispatch = useAppDispatch();
  const userId = route.params?.userId;
  let groupId = route.params?.groupId;
  const { groups } = useSelector((state: RootState) => state.group);

  if (
    groupId === null ||
    groupId === "all" ||
    groupId === "pinned" ||
    groupId === "locked"
  ) {
    groupId = groups[0].id; // Default to first group if no valid groupId
  }
  const navigation = useNavigation();

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(
    groupId
  );
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const { handleAddNote } = useNoteContext();

  const selectedGroupName =
    selectedGroupId === null ||
    selectedGroupId === "all" ||
    selectedGroupId === "pinned" ||
    selectedGroupId === "locked"
      ? "Không thuộc nhóm nào"
      : groups.find((g) => g.id === selectedGroupId)?.name || "Không rõ";

  const initialValues = {
    title: "",
    content: "",
  };

  const handlePickImage = async () => {
    if (images.length >= 5) {
      Alert.alert("Thông báo", "Chỉ chọn tối đa 5 hình ảnh.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      navigation.navigate("DrawScreen", {
        imageUri: selectedUri,
        onSave: (finalUri) => {
          setImages((prev) => [...prev, finalUri]);
        }
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const getGroupId = (groupId: string | null) => {
    switch (groupId) {
      case "all":
      case "pinned":
      case "locked":
        return "all";
      default:
        return groupId as string;
    }
  };

  const handleSubmit = async (values: { title: string; content: string }) => {
    try {
      if (selectedGroupId === null) {
        Alert.alert("Thông báo", "Vui lòng chọn nhóm cho ghi chú.");
        return;
      }
      setLoading(true);

      const res = await createNote(userId, {
        title: values.title,
        content: values.content,
        images,
        groupId: selectedGroupId,
      });

      dispatch(increaseNoteCount({ groupId: selectedGroupId }));

      handleAddNote(res);

      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Đã tạo ghi chú!",
      });

      //reset navigation to ListNotesScreen
      navigation.goBack();
    } catch (error) {
      console.log(error);
      Alert.alert("Lỗi", "Không thể tạo ghi chú.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={Colors.primary600} />
      </TouchableOpacity>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <Text style={styles.title}>Tạo ghi chú</Text>

        <Formik
          initialValues={initialValues}
          validationSchema={createNoteSchema}
          onSubmit={handleSubmit}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            dirty,
          }) => (
            <>
              <TextInput
                style={styles.input}
                placeholder="Tiêu đề ghi chú"
                placeholderTextColor="#999"
                onChangeText={handleChange("title")}
                onBlur={handleBlur("title")}
                value={values.title}
              />
              {touched.title && errors.title && (
                <Text style={styles.error}>{errors.title}</Text>
              )}

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Nội dung ghi chú"
                placeholderTextColor="#999"
                onChangeText={handleChange("content")}
                onBlur={handleBlur("content")}
                value={values.content}
                multiline
                numberOfLines={4}
              />
              {touched.content && errors.content && (
                <Text style={styles.error}>{errors.content}</Text>
              )}

              <Text style={styles.label}>Nhóm</Text>

              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setDropdownVisible((prev) => !prev)}
              >
                <Text style={styles.dropdownText}>{selectedGroupName}</Text>
                <Ionicons
                  name={dropdownVisible ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#333"
                />
              </TouchableOpacity>

              {dropdownVisible && (
                <View style={[styles.dropdownList, { maxHeight: 200 }]}>
                  <ScrollView nestedScrollEnabled>
                    {groups.map((group) => (
                      <TouchableOpacity
                        key={group.id}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setSelectedGroupId(group.id);
                          setDropdownVisible(false);
                        }}
                      >
                        <Text>{group.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <TouchableOpacity
                    style={[
                      styles.dropdownItem,
                      { justifyContent: "center", alignItems: "center" },
                    ]}
                    onPress={() => {
                      navigation.navigate("CreateGroup", { userId: userId });
                    }}
                  >
                    <Text>Thêm mới</Text>
                  </TouchableOpacity>
                </View>
              )}

              <Text style={styles.label}>Hình ảnh ({images.length}/5)</Text>

              <View style={styles.imageContainer}>
                {images.map((uri, index) => (
                  <View key={index} style={styles.imageWrapper}>
                    <Image source={{ uri }} style={styles.image} />
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => handleRemoveImage(index)}
                    >
                      <Ionicons name="close" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
                {images.length < 5 && (
                  <TouchableOpacity
                    style={styles.addImageBtn}
                    onPress={handlePickImage}
                  >
                    <Ionicons name="add" size={24} color="#666" />
                  </TouchableOpacity>
                )}
              </View>

              <Button
                title="Tạo ghi chú"
                size="large"
                color={Colors.primary600}
                onPress={handleSubmit}
                loading={loading}
                disabled={!dirty}
              />
            </>
          )}
        </Formik>
      </ScrollView>
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
    marginTop: 48,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  error: {
    color: "red",
    marginBottom: 8,
    marginLeft: 4,
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: "bold",
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  dropdownText: {
    color: "#333",
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#fff",
    elevation: 2,
    maxHeight: 200, // Giới hạn chiều cao dropdown, tránh tràn
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  imageWrapper: {
    position: "relative",
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  removeBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#f00",
    borderRadius: 10,
    padding: 2,
  },
  addImageBtn: {
    width: 70,
    height: 70,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CreateNoteScreen;
