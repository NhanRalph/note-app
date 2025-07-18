import {
  createDraftNote,
  deleteNote,
  finalizeDraftNote,
  NoteType,
  updateNote,
} from "@/src/api/noteAPI";
import Button from "@/src/components/Button/Button";
import Colors from "@/src/constants/Colors";
import { useNoteContext } from "@/src/context/noteContext";
import { useAppDispatch } from "@/src/hook/useDispatch";
import { useNavigation } from "@/src/hook/useNavigation";
import { RootStackParamList } from "@/src/navigation/types/navigationTypes";
import { RootState } from "@/src/redux/rootReducer";
import { increaseNoteCount } from "@/src/redux/slices/groupSlices";
import { hasInternetConnection } from "@/src/utils/checkInternet";
import { createNoteSchema } from "@/src/utils/validationSchema";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { Formik } from "formik";
import { useEffect, useState } from "react";
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
import { useTranslation } from "react-i18next";

interface CreateNoteScreenProps {
  route: RouteProp<RootStackParamList, "CreateNote">;
}

const CreateNoteScreen: React.FC<CreateNoteScreenProps> = ({ route }) => {
  const dispatch = useAppDispatch();
  const userId = route.params?.userId;
  let groupId = route.params?.groupId;
  const { groups } = useSelector((state: RootState) => state.group);

  const [draftNote, setDraftNote] = useState<NoteType | null>(null);

  // Sử dụng hook useTranslation
  const { t } = useTranslation();

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
      ? t('create_note.no_group') // Dịch "Không thuộc nhóm nào"
      : groups.find((g) => g.id === selectedGroupId)?.name || t('create_note.unknown_group'); // Dịch "Không rõ"

  const initialValues = {
    title: "",
    content: "",
  };

  useEffect(() => {
    if (!userId || draftNote) return;
    const fetchDraftNote = async () => {
      console.log(t('create_note.creating_draft_start')); // Dịch "🌀 Bắt đầu tạo draft..."

      const isConnected = await hasInternetConnection();
      if (!isConnected) {
        const draft = await createDraftNote(userId);
        console.log(t('create_note.draft_offline_success'), draft); // Dịch "✅ Draft Offline tạo xong:"
        setDraftNote(draft);
        return;
      }

      try {
        const draft = await createDraftNote(userId);
        console.log(t('create_note.draft_success'), draft); // Dịch "✅ Draft tạo xong:"

        if (draft) {
          setDraftNote(draft);
          setImages(draft.images || []);
        }
      } catch (error) {
        console.error("❌ Lỗi khi tạo draft:", error);
        Alert.alert(t('common.error'), t('create_note.draft_creation_failed')); // Dịch "Lỗi", "Không thể tạo ghi chú nháp. Vui lòng thử lại."
      }
    };

    fetchDraftNote();
  }, [userId, draftNote]);

  const handlePickImage = async () => {
    if (images.length >= 5) {
      Alert.alert(t('common.notification'), t('create_note.max_images_reached')); // Dịch "Thông báo", "Chỉ chọn tối đa 5 hình ảnh."
      return;
    }

    if (!draftNote) {
      Alert.alert(t('common.notification'), t('create_note.note_not_initialized')); // Dịch "Thông báo", "Ghi chú chưa được khởi tạo."
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      navigation.navigate("DrawScreen", {
        userId: userId,
        noteId: draftNote.id,
        imageUri: selectedUri,
        onSave: (finalUri) => {
          setImages((prev) => [...prev, finalUri]);
        },
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
      if (!selectedGroupId) {
        Alert.alert(t('common.notification'), t('create_note.select_group_required')); // Dịch "Thông báo", "Vui lòng chọn nhóm cho ghi chú."
        return;
      }

      if (!draftNote) {
        Alert.alert(t('common.notification'), t('create_note.note_not_initialized')); // Dịch "Thông báo", "Ghi chú chưa được khởi tạo."
        return;
      }

      setLoading(true);

      const isConnected = await hasInternetConnection();

      if (isConnected) {
        // Online: finalize draft note và update Firestore
        const res = await finalizeDraftNote(userId, draftNote.id, {
          title: values.title,
          content: values.content,
          images,
          groupId: selectedGroupId,
        });

        dispatch(increaseNoteCount({ groupId: selectedGroupId }));
        handleAddNote(res);

        Toast.show({
          type: "success",
          text1: t('common.success'), // Dịch "Thành công"
          text2: t('create_note.create_success'), // Dịch "Đã tạo ghi chú!"
        });

        navigation.goBack();
      } else {
        // Offline: tạo note mock local, chờ sync
        const mockNote = {
          id: draftNote.id,
          title: values.title,
          content: values.content,
          images,
          groupId: getGroupId(selectedGroupId),
          locked: false,
          pinned: false,
          order: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isSynced: false, // Đánh dấu là chưa đồng bộ
          isDraft: false, // Đánh dấu là ghi chú nháp
        };

        dispatch(increaseNoteCount({ groupId: selectedGroupId }));
        handleAddNote(mockNote);

        Toast.show({
          type: "info",
          text1: t('create_note.saved_offline_title'), // Dịch "Đã lưu offline"
          text2: t('create_note.saved_offline_message'), // Dịch "Ghi chú sẽ được đồng bộ khi có mạng."
        });

        navigation.goBack();
        await updateNote(userId, draftNote.id, mockNote);
        // Optionally: thêm vào hàng chờ sync thủ công ở đây (nếu bạn có queue sync riêng)
      }
    } catch (error) {
      console.error("Error creating note:", error);
      Alert.alert(t('common.error'), t('create_note.create_failed')); // Dịch "Lỗi", "Không thể tạo ghi chú."
    } finally {
      setLoading(false);
    }
  };

  const handleBack = async (values: { title: string; content: string }) => {
    if (!draftNote) {
      navigation.goBack();
      return;
    }

    if (images.length > 0 || values.title || values.content) {
      Alert.alert(
        t('common.confirmation'), // Dịch "Xác nhận"
        t('create_note.exit_confirm_message'), // Dịch "Bạn có chắc muốn rời khỏi trang này? Tất cả thay đổi sẽ không được lưu."
        [
          { text: t('common.cancel'), style: "cancel" }, // Dịch "Hủy"
          {
            text: t('create_note.exit_confirm_button'), // Dịch "Rời khỏi"
            onPress: async () => {
              await deleteNote(userId, draftNote.id)
              navigation.goBack()
            },
            style: "destructive",
          },
        ]
      );
    } else {
      await deleteNote(userId, draftNote.id)
      navigation.goBack();
    }
  }

  // if (!draftNote) {
  //   return (
  //     <View style={styles.container}>
  //       <Text>Đang khởi tạo ghi chú nháp...</Text> // Dịch
  //     </View>
  //   );
  // }

  return (
    <View style={styles.container}><Formik
          initialValues={{
            title: draftNote?.title || "",
            content: draftNote?.content || "",
          }}
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
            
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => handleBack(values)}
      >
        <Ionicons name="arrow-back" size={24} color={Colors.primary600} />
      </TouchableOpacity>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <Text style={styles.title}>{t('create_note.screen_title')}</Text> {/* Dịch "Tạo ghi chú" */}
        <Text style={styles.title}>{draftNote?.id ? draftNote.id : ""}</Text>

        
            <>
              <TextInput
                style={styles.input}
                placeholder={t('create_note.title_placeholder')} // Dịch "Tiêu đề ghi chú"
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
                placeholder={t('create_note.content_placeholder')} // Dịch "Nội dung ghi chú"
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

              <Text style={styles.label}>{t('create_note.group_label')}</Text> {/* Dịch "Nhóm" */}

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
                    <Text>{t('create_note.add_new_group_button')}</Text> {/* Dịch "Thêm mới" */}
                  </TouchableOpacity>
                </View>
              )}

              <Text style={styles.label}>{t('create_note.images_label')} ({images.length}/5)</Text> {/* Dịch "Hình ảnh" */}

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
                title={t('create_note.create_note_button')}
                size="large"
                color={Colors.primary600}
                onPress={handleSubmit}
                loading={loading}
                disabled={!dirty}
              />
            </>
      </ScrollView>
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
