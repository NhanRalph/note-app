import { deleteNote, toggleLockNote } from "@/src/api/noteAPI";
import Colors from "@/src/constants/Colors";
import { useNoteContext } from "@/src/context/noteContext";
import { useNavigation } from "@/src/hook/useNavigation";
import { RootState } from "@/src/redux/rootReducer";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Share from "react-native-share";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";

export default function NoteDetailScreen() {
  const navigation = useNavigation();
  const { groups } = useSelector((state: RootState) => state.group);
  const { user } = useSelector((state: RootState) => state.auth);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // const { note } = route.params;
  const { selectedNote, handleUpdateNote, handleDeleteNote } = useNoteContext();

  if (!selectedNote) {
    // Alert.alert("Lỗi", "Không tìm thấy ghi chú. Vui lòng thử lại sau.");
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

  const handleShare = async () => {
    try {

      // trong trường hợp có ảnh, thì show link các ảnh ra trong sharedMessage
      const shareMessage = `Title: ${selectedNote.title}
      
${selectedNote.content}

${selectedNote.images && selectedNote.images.length > 0
        ? selectedNote.images.map((img) => `${img}`).join("\n\n")
        : "Không có hình ảnh đính kèm."}

Shared from MyNotesApp`;

      let shareOptions: {
        title: string;
        message: string;
        type: string;
      } = {
        title: "Chia sẻ ghi chú của bạn",
        message: shareMessage,
        type: "text/plain"
      };

      await Share.open(shareOptions);
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Ghi chú đã được chia sẻ!",
      });
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string" &&
        (error as { message: string }).message !== "User did not share"
      ) {
        Alert.alert("Lỗi", "Không thể chia sẻ ghi chú. Vui lòng thử lại sau.");
      }
    }
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
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color={Colors.primary600} />
        </TouchableOpacity>
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
              {selectedNote.images.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setSelectedImage(img);
                    setModalVisible(true);
                  }}
                >
                  <Image source={{ uri: img }} style={styles.image} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        {!selectedNote.locked && (
          <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
            <Ionicons name="create-outline" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>Chỉnh sửa</Text>
          </TouchableOpacity>
        )}
        {!selectedNote.locked && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#e74c3c" }]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>Xoá</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#6366f1" }]}
          onPress={handleLock}
        >
          <Ionicons
            name={
              selectedNote.locked ? "lock-open-outline" : "lock-closed-outline"
            }
            size={18}
            color="#fff"
          />
          <Text style={styles.actionButtonText}>
            {selectedNote.locked ? "Mở khoá" : "Khoá"}
          </Text>
        </TouchableOpacity>
      </View>
      {/* Modal for viewing image */}
      {selectedImage && (
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.9)",
              justifyContent: "center",
              alignItems: "center",
            }}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <Image
              source={{ uri: selectedImage }}
              style={{
                width: "90%",
                height: "60%",
                resizeMode: "contain",
                borderRadius: 12,
              }}
            />
          </TouchableOpacity>
        </Modal>
      )}
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
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
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
  shareBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
});
