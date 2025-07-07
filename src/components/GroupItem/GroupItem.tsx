// import {
//   deleteNote,
//   NoteType,
//   toggleLockNote,
//   togglePinNote,
// } from "@/src/api/groupAPI";
import { GroupType } from "@/src/api/groupAPI";
import Colors from "@/src/constants/Colors";
import { useNavigation } from "@/src/hook/useNavigation";
import { RootState } from "@/src/redux/rootReducer";
import { formatDate } from "@/src/utils/formatDate";
import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useSelector } from "react-redux";

type Props = {
  group: GroupType;
  viewMode: "list" | "grid";
  // changeFlag: () => void;
  onLongPressNote?: () => void;
  handleDelete?: (groupId: string) => void;
  handleEdit?: (groupId: string) => void;
  // setOpenedSwipeRef?: (ref: Swipeable | null) => void;
};

export default function GroupItem({
  group,
  viewMode,
  // changeFlag,
  handleDelete = () => {},
  handleEdit = () => {},
  onLongPressNote,
}: // setOpenedSwipeRef,
Props) {
  const navigation = useNavigation();
  const { user } = useSelector((state: RootState) => state.auth);
  // Handle group click
  const handleGroupClick = () => {
    // Navigate to group detail screen
    navigation.navigate("ListNotesScreen", {
      userId: user!.uid,
      groupId: group.id,
    });
  };
  const swipeableRef = useRef<any>(null);

  const checkIdDefault = (id: string | undefined) => {
    if (!id) return false;
    return id === "all" || id === "pinned" || id === "locked";
  };

  if (viewMode === "list") {
    const renderRightActions = () => (
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#4b7bec" }]}
          onPress={() => handleEdit(group.id)}
        >
          <Ionicons name="pencil" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#EF4444" }]}
          onPress={() => handleDelete(group.id)}
        >
          <Ionicons name="trash" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    );

    // Nếu là id mặc định thì KHÔNG cho swipeable, chỉ trả về TouchableOpacity
    if (checkIdDefault(group.id)) {
      return (
        <TouchableOpacity
          style={[styles.container]}
          onPress={handleGroupClick}
          onLongPress={onLongPressNote}
          delayLongPress={300}
        >
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text numberOfLines={1} style={styles.title}>
              {group.name}
            </Text>
          </View>
      <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
        
          <Text numberOfLines={1} style={styles.content}>
            
          </Text>
      </View>
        </TouchableOpacity>
      );
    }

    // Nếu không phải id mặc định thì cho swipeable
    return (
      <Swipeable ref={swipeableRef} renderRightActions={renderRightActions}>
        <TouchableOpacity
          style={[styles.container]}
          onPress={handleGroupClick}
          onLongPress={onLongPressNote}
          delayLongPress={300}
        >
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text numberOfLines={1} style={styles.title}>
              {group.name}
            </Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <Text numberOfLines={1} style={styles.content}>
              {formatDate(group.createdAt.toString())}
            </Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, viewMode === "grid" && { width: "48%" }]}
      onPress={handleGroupClick}
      onLongPress={onLongPressNote}
      delayLongPress={300}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text numberOfLines={1} style={styles.title}>
          {group.name}
        </Text>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
        {!checkIdDefault(group.id) ? (
          <Text numberOfLines={1} style={styles.content}>
            {formatDate(group.createdAt.toString())}
          </Text>
        ) : (
          <Text numberOfLines={1} style={styles.content}>
            {/* {group.name} */}
          </Text>
        )}
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
  },
  title: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  content: {
    color: "#888",
    fontSize: 12,
  },
  groupItemList: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    marginVertical: 4,
    borderRadius: 8,
  },
  groupItemGrid: {
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
