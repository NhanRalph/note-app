import {
  NoteType
} from "@/src/api/noteAPI";
import Colors from "@/src/constants/Colors";
import { useNoteContext } from "@/src/context/noteContext";
import { useNavigation } from "@/src/hook/useNavigation";
import { RootState } from "@/src/redux/rootReducer";
import { formatDate } from "@/src/utils/formatDate";
import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useSelector } from "react-redux";

type Props = {
  note: NoteType;
  viewMode: "list" | "grid";
  changeFlag: () => void;
  onLongPressNote?: () => void;
  drag?: () => void;
  handlePinNote: (note: NoteType) => void;
  handleEdit: (note: NoteType) => void;
  handleDelete: (note: NoteType) => void;
  handleLock: (note: NoteType) => void;
  handleUnSelectItem?: () => void;
  setOpenedSwipeRef?: (ref: Swipeable | null) => void;
};

export default function NoteItem({
  note,
  viewMode,
  changeFlag,
  onLongPressNote,
  drag,
  handlePinNote,
  handleEdit,
  handleDelete,
  handleLock,
  handleUnSelectItem,
  setOpenedSwipeRef,
}: Props) {
  const navigation = useNavigation();
  const { user } = useSelector((state: RootState) => state.auth);
  const { handleSetSelectedNote } = useNoteContext();
  // Handle note click
  const handleNoteClick = () => {
    // Navigate to note detail screen
    handleSetSelectedNote(note);
    navigation.navigate("NoteDetail", { note });
  };
  const swipeableRef = useRef<any>(null);

  if (viewMode === "list") {
    const renderRightActions = () => (
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#a855f7" }]}
          onPress={() => {
            handlePinNote(note)
            swipeableRef.current?.close();
          }}
        >
          <Ionicons name="bookmark" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#4b5563" }]}
          onPress={() => {
            handleLock(note)
            swipeableRef.current?.close();
          }}
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
            onPress={() => {
              handleEdit(note)
              swipeableRef.current?.close();
            }}
          >
            <Ionicons name="pencil" size={20} color="#fff" />
          </TouchableOpacity>
        )}

        {!note.locked && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#EF4444" }]}
            onPress={() => {
              handleDelete(note)
              swipeableRef.current?.close();
            }}
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
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text numberOfLines={2} style={styles.content}>
              {note.content}
            </Text>
            <TouchableOpacity onLongPress={drag} delayLongPress={100}>
              <Text style={{ fontSize: 20 }}>☰</Text>
            </TouchableOpacity>
          </View>

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
      style={[styles.container]}
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
    marginHorizontal: "1%",
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
