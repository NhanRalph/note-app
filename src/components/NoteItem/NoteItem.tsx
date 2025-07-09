import {
  deleteNote,
  NoteType,
  toggleLockNote,
  togglePinNote,
} from "@/src/api/noteAPI";
import Colors from "@/src/constants/Colors";
import { useNavigation } from "@/src/hook/useNavigation";
import { RootState } from "@/src/redux/rootReducer";
import { formatDate } from "@/src/utils/formatDate";
import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useSelector } from "react-redux";

type Props = {
  note: NoteType;
  viewMode: "list" | "grid";
  changeFlag: () => void;
  onLongPressNote?: () => void;
  handleUnSelectItem?: () => void;
  setOpenedSwipeRef?: (ref: Swipeable | null) => void;
};

export default function NoteItem({
  note,
  viewMode,
  changeFlag,
  onLongPressNote,
  handleUnSelectItem,
  setOpenedSwipeRef,
}: Props) {
  const navigation = useNavigation();
  const { user } = useSelector((state: RootState) => state.auth);
  // Handle note click
  const handleNoteClick = () => {
    // Navigate to note detail screen
    navigation.navigate("NoteDetail", { note });
  };
  const swipeableRef = useRef<any>(null);

  const handlePinNote = (note: NoteType) => {
    Alert.alert(
      "Ghim ghi chú",
      note.pinned
        ? "Bạn có muốn bỏ ghim ghi chú này không?"
        : "Bạn có muốn ghim ghi chú này không?",
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: note.pinned ? "Bỏ ghim" : "Ghim",
          onPress: async () => {
            try {
              // Call pin API here
              await togglePinNote(user!.uid, note.id, !note.pinned);
              Alert.alert("Thành công", "Đã ghim ghi chú!");
              changeFlag();
              swipeableRef.current?.close();
            } catch (error) {
              console.error("Error pinning note:", error);
              Alert.alert(
                "Lỗi",
                "Không thể ghim ghi chú. Vui lòng thử lại sau."
              );
            }
          },
        },
      ]
    );
  };

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
            changeFlag();
            swipeableRef.current?.close();
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
                changeFlag();
                swipeableRef.current?.close();
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

  if (viewMode === "list") {
    const renderRightActions = () => (
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#a855f7" }]}
          onPress={() => handlePinNote(note)}
        >
          <Ionicons name="bookmark" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#4b5563" }]}
          onPress={handleLock}
        >
          {note.locked ? (
            <Ionicons name="lock-open" size={20} color="#fff" />
          ) : (
            <Ionicons name="lock-closed" size={20} color="#fff" />
          )}
        </TouchableOpacity>

        {!note.locked && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#4b7bec" }]}
            onPress={handleEdit}
          >
            <Ionicons name="pencil" size={20} color="#fff" />
          </TouchableOpacity>
        )}

        {!note.locked && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#EF4444" }]}
            onPress={handleDelete}
          >
            <Ionicons name="trash" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    );
    return (
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        onSwipeableOpen={() => setOpenedSwipeRef?.(swipeableRef.current)}
      >
        <TouchableOpacity
          style={[styles.container]}
          onPress={handleNoteClick}
          onLongPress={onLongPressNote}
          delayLongPress={300}
        >
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text numberOfLines={1} style={styles.title}>
              {note.title}
            </Text>

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              {note.locked && (
                <Ionicons name="lock-closed" size={16} color="gray" />
              )}
              {note.pinned && (
                <Ionicons name="bookmark" size={16} color="gold" />
              )}

              {note.images.length !== 0 && (
                <Ionicons name="image-outline" size={16} color="gray" />
              )}
            </View>
          </View>
          <Text numberOfLines={2} style={styles.content}>
            {note.content}
          </Text>

          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <Text numberOfLines={1} style={styles.contentDate}>
              {formatDate(note.updatedAt.toString())}
            </Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, viewMode === "grid" && { width: "48%" }]}
      onPress={handleNoteClick}
      onLongPress={onLongPressNote}
      delayLongPress={300}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ width: "70%" }}>
          <Text numberOfLines={1} style={styles.title}>
            {note.title}
          </Text>
        </View>
        <View style={styles.actionsRow}>
          {note.images.length !== 0 && (
            <Ionicons name="image-outline" size={16} color="gray" />
          )}
          {note.locked && (
            <Ionicons name="lock-closed" size={16} color="gray" />
          )}
          {note.pinned && <Ionicons name="star" size={16} color="gold" />}
        </View>
      </View>
      <Text numberOfLines={1} style={styles.content}>
        {note.content}
      </Text>

      <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
        <Text numberOfLines={1} style={styles.contentDate}>
          {formatDate(note.updatedAt.toString())}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary50,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    marginRight: "2%",
    // add shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,  
    },
    shadowOpacity: 0.25,
    elevation: 5,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  content: {
    color: "#555",
  },
  contentDate: {
    color: "#888",
    fontSize: 12,
  },
  noteItemList: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    marginVertical: 4,
    borderRadius: 8,
  },
  noteItemGrid: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    margin: 4,
    flex: 1,
    borderRadius: 8,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionBtn: {
    backgroundColor: "#4b7bec",
    padding: 12,
    margin: 4,
    borderRadius: 6,
  },
});
