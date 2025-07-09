import { deleteNote, toggleLockNote } from "@/src/api/noteAPI";
import Colors from "@/src/constants/Colors";
import { useNoteContext } from "@/src/context/noteContext";
import { useNavigation } from "@/src/hook/useNavigation";
import { RootState } from "@/src/redux/rootReducer";
import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";

export default function NoteDetailScreen() {
  const navigation = useNavigation();
  const { groups } = useSelector((state: RootState) => state.group);
  const { user } = useSelector((state: RootState) => state.auth);
  // const { note } = route.params;
  const { selectedNote, handleUpdateNote, handleDeleteNote } = useNoteContext();

  if (!selectedNote) {
    Alert.alert("Lỗi", "Không tìm thấy ghi chú. Vui lòng thử lại sau.");
    navigation.goBack();
    return null;
  }
  const selectedGroupName =
    selectedNote.groupId === null
      ? "Không thuộc nhóm nào"
      : groups.find((g) => g.id === selectedNote.groupId)?.name || "Không rõ";

  const handleEdit = () => {
    navigation.navigate("UpdateNote", { note: selectedNote });
  };

  const handleDelete = () => {
    Alert.alert("Xoá ghi chú", "Bạn có chắc chắn muốn xoá ghi chú này không?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: async () => {
          try {
            // Call delete API here
            await deleteNote(user!.uid, selectedNote.id);
            Toast.show({
              type: "success",
              text1: "Thành công",
              text2: "Đã xoá ghi chú",
            });
            handleDeleteNote(selectedNote.id);
            navigation.goBack();
          } catch (error) {
            console.error("Error deleting note:", error);
            Alert.alert("Lỗi", "Không thể xoá ghi chú. Vui lòng thử lại sau.");
          }
        },
      },
    ]);
  };

  const handleLock = () => {
    Alert.alert(
      selectedNote.locked ? "Mở khoá ghi chú" : "Khoá ghi chú",
      selectedNote.locked
        ? "Bạn có muốn mở khoá ghi chú này không?"
        : "Bạn có muốn khoá ghi chú này không?",
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: selectedNote.locked ? "Mở khoá" : "Khoá",
          onPress: async () => {
            {
              try {
                // Call lock/unlock API here
                await toggleLockNote(
                  user!.uid,
                  selectedNote.id,
                  !selectedNote.locked
                );
                Alert.alert(
                  "Thành công",
                  selectedNote.locked
                    ? "Đã mở khoá ghi chú!"
                    : "Đã khoá ghi chú!"
                );
                handleUpdateNote({
                  ...selectedNote,
                  locked: !selectedNote.locked,
                });
              } catch (error) {
                console.error("Error locking/unlocking note:", error);
                Alert.alert(
                  "Lỗi",
                  "Không thể thực hiện thao tác. Vui lòng thử lại sau."
                );
              }
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.primary600} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết ghi chú</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={styles.title}>{selectedNote.title}</Text>

        <Text style={styles.groupText}>Nhóm: {selectedGroupName}</Text>

        {/* Icons */}
        <View style={styles.iconRow}>
          {selectedNote.pinned && (
            <Ionicons
              name="bookmark"
              size={20}
              color={"gold"}
              style={styles.icon}
            />
          )}
          {selectedNote.locked && (
            <Ionicons
              name="lock-closed"
              size={20}
              color="gray"
              style={styles.icon}
            />
          )}
        </View>

        {/* Content */}
        <Text style={styles.content}>{selectedNote.content}</Text>

        {/* Images */}
        {selectedNote.images && selectedNote.images.length > 0 && (
          <>
            <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
              Hình ảnh:
            </Text>
            <View style={styles.imageContainer}>
              {/* Label "Hình ảnh" */}
              {selectedNote.images.map((img, index) => (
                <Image key={index} source={{ uri: img }} style={styles.image} />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        {!selectedNote.locked && (
          <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
            <Text style={styles.actionButtonText}>Chỉnh sửa</Text>
          </TouchableOpacity>
        )}
        {!selectedNote.locked && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#e74c3c" }]}
            onPress={handleDelete}
          >
            <Text style={styles.actionButtonText}>Xoá</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#6366f1" }]}
          onPress={handleLock}
        >
          <Text style={styles.actionButtonText}>
            {selectedNote.locked ? "Mở khoá" : "Khoá"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  groupText: {
    fontSize: 14,
    color: "gray",
    marginBottom: 8,
    textAlign: "right",
  },
  iconRow: {
    flexDirection: "row",
    marginBottom: 8,
    justifyContent: "flex-end",
  },
  icon: {
    marginRight: 8,
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
    textAlign: "justify",
  },
  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 8,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary600,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    gap: 6,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  backBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
});
