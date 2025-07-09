import { deleteNote, toggleLockNote } from "@/src/api/noteAPI";
import Colors from "@/src/constants/Colors";
import { useNavigation } from "@/src/hook/useNavigation";
import { RootStackParamList } from "@/src/navigation/types/navigationTypes";
import { RootState } from "@/src/redux/rootReducer";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

type NoteDetailRouteProp = RouteProp<RootStackParamList, "NoteDetail">;

export default function NoteDetailScreen() {
  const route = useRoute<NoteDetailRouteProp>();
  const navigation = useNavigation();
  const { groups } = useSelector((state: RootState) => state.group);
  const { user } = useSelector((state: RootState) => state.auth);
  const { note } = route.params;

  const [localNote, setLocalNote] = useState(note);
  const selectedGroupName =
    note.groupId === null
      ? "Không thuộc nhóm nào"
      : groups.find((g) => g.id === note.groupId)?.name || "Không rõ";

  const handleEdit = () => {
    navigation.navigate("UpdateNote", { note });
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
            await deleteNote(user!.uid, note.id);
            Alert.alert("Thành công", "Đã xoá ghi chú!");
            navigation.reset({
              index: 0,
              routes: [{ name: "Main" }],
            });
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
      note.locked ? "Mở khoá ghi chú" : "Khoá ghi chú",
      note.locked
        ? "Bạn có muốn mở khoá ghi chú này không?"
        : "Bạn có muốn khoá ghi chú này không?",
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: note.locked ? "Mở khoá" : "Khoá",
          onPress: async () => {
            {
              try {
                // Call lock/unlock API here
                await toggleLockNote(user!.uid, note.id, !note.locked);
                Alert.alert(
                  "Thành công",
                  note.locked ? "Đã mở khoá ghi chú!" : "Đã khoá ghi chú!"
                );
                setLocalNote({ ...localNote, locked: !localNote.locked });
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
        <Text style={styles.title}>{localNote.title}</Text>

        <Text style={styles.groupText}>Nhóm: {selectedGroupName}</Text>

        {/* Icons */}
        <View style={styles.iconRow}>
          {localNote.pinned && (
            <Ionicons
              name="bookmark"
              size={20}
              color={"gold"}
              style={styles.icon}
            />
          )}
          {localNote.locked && (
            <Ionicons
              name="lock-closed"
              size={20}
              color="gray"
              style={styles.icon}
            />
          )}
        </View>

        {/* Content */}
        <Text style={styles.content}>{localNote.content}</Text>

        {/* Images */}
        {localNote.images && localNote.images.length > 0 && (
          <>
            <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
              Hình ảnh:
            </Text>
            <View style={styles.imageContainer}>
              {/* Label "Hình ảnh" */}
              {localNote.images.map((img, index) => (
                <Image key={index} source={{ uri: img }} style={styles.image} />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        {!localNote.locked && (
          <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
            <Text style={styles.actionButtonText}>Chỉnh sửa</Text>
          </TouchableOpacity>
        )}
        {!localNote.locked && (
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
            {localNote.locked ? "Mở khoá" : "Khoá"}
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
