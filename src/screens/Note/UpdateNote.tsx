import { NoteType, updateNote } from "@/src/api/noteAPI";
import Button from "@/src/components/Button/Button";
import Colors from "@/src/constants/Colors";
import { useNoteContext } from "@/src/context/noteContext";
import { useAppDispatch } from "@/src/hook/useDispatch";
import { useNavigation } from "@/src/hook/useNavigation";
import { RootStackParamList } from "@/src/navigation/types/navigationTypes";
import { RootState } from "@/src/redux/rootReducer";
import {
  getNoteStatsStore,
  moveNoteToAnotherGroup,
} from "@/src/redux/slices/groupSlices";
import { hasInternetConnection } from "@/src/utils/checkInternet";
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
// Import hook useTranslation
import { GroupType } from "@/src/api/groupAPI";
import { useTranslation } from "react-i18next";

interface UpdateNoteScreenProps {
  route: RouteProp<RootStackParamList, "UpdateNote">;
}

const UpdateNoteScreen: React.FC<UpdateNoteScreenProps> = ({ route }) => {
  const dispatch = useAppDispatch();
  const { note } = route.params;
  const navigation = useNavigation();
  const { groups } = useSelector((state: RootState) => state.group);
  const { user } = useSelector((state: RootState) => state.auth);
  const { handleUpdateNote, handleDeleteNote } = useNoteContext();

  // Sử dụng hook useTranslation
  const { t } = useTranslation();

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(
    note.groupId || null
  );
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [images, setImages] = useState<string[]>(note.images || []);
  const [loading, setLoading] = useState(false);

  const selectedGroupName =
    selectedGroupId === null
      ? t('update_note.no_group') // Dịch "Không thuộc nhóm nào"
      : groups.find((g) => g.id === selectedGroupId)?.name || t('update_note.unknown_group'); // Dịch "Không rõ"

  const initialValues = {
    title: note.title || "",
    content: note.content || "",
  };

  const handlePickImage = async () => {
    if (images.length >= 5) {
      Alert.alert(t('common.notification'), t('update_note.max_images_reached')); // Dịch "Thông báo", "Chỉ chọn tối đa 5 hình ảnh."
      return;
    }

    // This check seems to be copied from CreateNoteScreen, but `note` is always defined here.
    // Keeping the translation key for consistency if it's used elsewhere.
    // if (!note) {
    //   Alert.alert(t('common.notification'), t('update_note.note_not_initialized')); // Dịch "Thông báo", "Ghi chú chưa được khởi tạo."
    //   return;
    // }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      navigation.navigate("DrawScreen", {
        userId: user!.uid,
        noteId: note.id,
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
    if (!user) {
      Alert.alert(t('common.error'), t('update_note.login_required_error')); // Dịch "Lỗi", "Bạn cần đăng nhập để thực hiện thao tác này."
      return;
    }
    setLoading(true);
    try {
      const isConnected = await hasInternetConnection();
  
      const updatedNote: NoteType = {
        ...note,
        title: values.title,
        content: values.content,
        images,
        groupId: selectedGroupId,
        updatedAt: new Date().toISOString(),
      };
  
      if (!isConnected) {
        // Offline: chỉ cập nhật local
        handleUpdateNote(updatedNote);
        dispatch(getNoteStatsStore({ userId: user.uid }));
        if (selectedGroupId !== note.groupId) {
          dispatch(
            moveNoteToAnotherGroup({
              fromGroupId: getGroupId(note.groupId),
              toGroupId: getGroupId(selectedGroupId),
            })
          );
          handleDeleteNote(note.id); // This seems incorrect for a move, should be update, not delete
        }
        setLoading(false);

        Toast.show({
          type: "success",
          text1: t('common.success'), // Dịch "Thành công"
          text2: t('update_note.update_success'), // Dịch "Đã chỉnh sửa ghi chú!"
        });
        navigation.goBack();
        await updateNote(user.uid, note.id, {
          title: values.title,
          content: values.content,
          images,
          groupId: selectedGroupId,
        });
        return;
      }
  
      // Online: cập nhật server
      await updateNote(user.uid, note.id, {
        title: values.title,
        content: values.content,
        images,
        groupId: selectedGroupId,
      });
  
      handleUpdateNote(updatedNote);
      dispatch(getNoteStatsStore({ userId: user.uid }));
      if (selectedGroupId !== note.groupId) {
        dispatch(
          moveNoteToAnotherGroup({
            fromGroupId: getGroupId(note.groupId),
            toGroupId: getGroupId(selectedGroupId),
          })
        );
        handleDeleteNote(note.id); // This seems incorrect for a move, should be update, not delete
      }
  
      Toast.show({
        type: "success",
        text1: t('common.success'), // Dịch "Thành công"
        text2: t('update_note.update_success'), // Dịch "Đã chỉnh sửa ghi chú!"
      });
      navigation.goBack();
    } catch (error) {
      console.log(error);
      Alert.alert(t('common.error'), t('update_note.update_failed')); // Dịch "Lỗi", "Không thể chỉnh sửa ghi chú."
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
        <Text style={styles.title}>{t('update_note.screen_title')}</Text>

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
          }) => {
            // So sánh group và images với giá trị ban đầu
            const isGroupChanged = selectedGroupId !== (note.groupId || null);
            const isImagesChanged =
              JSON.stringify(images) !== JSON.stringify(note.images || []);
            const isChanged = dirty || isGroupChanged || isImagesChanged;

            return (
              <>
                <TextInput
                  style={styles.input}
                  placeholder={t('update_note.title_placeholder')}
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
                  placeholder={t('update_note.content_placeholder')}
                  placeholderTextColor="#999"
                  onChangeText={handleChange("content")}
                  onBlur={handleBlur("content")}
                  value={values.content}
                  multiline
                  numberOfLines={10}
                  textAlignVertical="top"
                />
                {touched.content && errors.content && (
                  <Text style={styles.error}>{errors.content}</Text>
                )}

                <Text style={styles.label}>{t('update_note.group_label')}</Text>

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
                      {groups.map((group: GroupType) => (
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
                        navigation.navigate("CreateGroup", {
                          userId: user!.uid,
                        });
                      }}
                    >
                      <Text>{t('update_note.add_new_group_button')}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <Text style={styles.label}>{t('update_note.images_label')} ({images.length}/5)</Text>

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
                  title={t('update_note.update_button')}
                  size="large"
                  color={Colors.primary600}
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={!isChanged}
                />
              </>
            );
          }}
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
    textAlignVertical: "top",
    minHeight: 120,
    maxHeight: 320,
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

export default UpdateNoteScreen;
