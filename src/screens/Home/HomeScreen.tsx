import { getNotes, NoteType } from "@/src/api/noteAPI";
import GroupItem from "@/src/components/GroupItem/GroupItem";
import NoteItem from "@/src/components/NoteItem/NoteItem";
import Colors from "@/src/constants/Colors";
import { useAppDispatch } from "@/src/hook/useDispatch";
import { useNavigation } from "@/src/hook/useNavigation";
import { RootState } from "@/src/redux/rootReducer";
import { deleteGroupStore, getGroupsStore } from "@/src/redux/slices/groupSlices";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

export default function HomeScreen() {
  //use state
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [selectedGroupActionId, setSelectedGroupActionId] = useState<
    string | null
  >(null);
  const [isDeleted, setIsDeleted] = useState(false);

  // Redux hooks
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { groups, loading, error } = useSelector(
    (state: RootState) => state.group
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const fetchNotes = async (params: { userId: string; groupId?: string }) => {
    try {
      // Call your API to fetch notes based on userId and groupId
      // For example:
      const response = await getNotes(params.userId, params.groupId);
      if (!response || !Array.isArray(response)) {
        throw new Error("Invalid response from API");
      }
      // Update the notes state with the fetched notes
      setNotes(response);
      return response;
    } catch (error) {
      console.error("Error fetching notes:", error);
      // Handle error appropriately, e.g., show an alert or log the error
    }
  };// Only fetch groups and notes when user changes
  useEffect(() => {
    if (user) {
      dispatch(getGroupsStore({ userId: user.uid }));
      fetchNotes({ userId: user.uid });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Fetch notes when selectedGroupId changes
  useEffect(() => {
    if (user && selectedGroupId !== null) {
      if (selectedGroupId !== "all") {
        fetchNotes({ userId: user.uid, groupId: selectedGroupId });
      } else {
        fetchNotes({ userId: user.uid });
      }
    }
     
  }, [selectedGroupId, user]);

  // Fetch notes when groups change (e.g., after create/delete group)
  useEffect(() => {
    if (user) {
      fetchNotes({ userId: user.uid });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDeleted]);

  const createGroup = () => {
    if (!user) {
      navigation.navigate("LoginScreen");
      return;
    }
    navigation.navigate("CreateGroup", { userId: user.uid });
  };

  const createNote = () => {
    if (!user) {
      navigation.navigate("LoginScreen");
      return;
    }
    navigation.navigate("CreateNote", { userId: user.uid });
  };

  const handleGroupLongPress = (groupId: string) => {
    if (groupId === "all") return;
    setSelectedGroupActionId(groupId);
  };

  const handleCloseActions = () => {
    setSelectedGroupActionId(null);
  };

  // Dummy update/delete functions
  const handleUpdateGroup = (groupId: string) => {
    // Implement your update logic here
    alert(`Update group ${groupId}`);
    handleCloseActions();
  };

  const handleDeleteGroup = (groupId: string) => {
    // Implement your delete logic here
    Alert.alert(`Delete group`, "Bạn có chắc chắn muốn xoá nhóm này không?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Xoá",
        style: "destructive",
        onPress: () =>{
          dispatch(deleteGroupStore({ userId: user!.uid, groupId }));
          handleCloseActions();
          setIsDeleted(!isDeleted);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Note Daily</Text>
        <TouchableOpacity
          onPress={() => setViewMode(viewMode === "list" ? "grid" : "list")}
        >
          <Ionicons
            name={viewMode === "list" ? "grid" : "list"}
            size={24}
            color="black"
          />
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: "row", marginVertical: 12 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.groupsScroll}
        >
          <TouchableOpacity style={styles.addGroupBtn} onPress={createGroup}>
            <Ionicons name="add" size={20} color={Colors.primary600} />
          </TouchableOpacity>
          {[{ id: "all", name: "Tất cả", createdAt: "" }, ...groups].map(
            (group) => (
              <View key={group.id} style={{ position: "relative" }}>
                <TouchableOpacity
                  onPress={() => setSelectedGroupId(group.id)}
                  onLongPress={() => handleGroupLongPress(group.id)}
                  delayLongPress={500}
                  style={[
                    styles.listGroupItem,
                    selectedGroupId === group.id && {
                      backgroundColor: Colors.primary200,
                    },
                  ]}
                >
                  <GroupItem group={group} />
                </TouchableOpacity>
              </View>
            )
          )}
        </ScrollView>
      </View>

      {/* Notes */}
      <FlatList
        data={notes}
        key={viewMode}
        numColumns={viewMode === "grid" ? 2 : 1}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NoteItem note={item} viewMode={viewMode} />}
        showsVerticalScrollIndicator={false}
      />

      {/* Nút thêm Note */}
      <TouchableOpacity style={styles.addNoteBtn} onPress={createNote}>
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={!!selectedGroupActionId}
        transparent
        animationType="fade"
        onRequestClose={handleCloseActions}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseActions}
        >
          <View style={styles.groupActionsModal}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleUpdateGroup(selectedGroupActionId!)}
            >
              <Text style={styles.actionText}>Update</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleDeleteGroup(selectedGroupActionId!)}
            >
              <Text style={styles.actionText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeActionBtn}
              onPress={handleCloseActions}
            >
              <Ionicons name="close" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  groupsScroll: {
    marginBottom: 16,
  },
  addGroupBtn: {
    padding: 12,
    backgroundColor: Colors.primary100,
    borderRadius: 8,
    marginRight: 8,
  },
  addNoteBtn: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: Colors.primary600,
    padding: 16,
    borderRadius: 32,
  },
  listGroupItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.primary100,
    borderRadius: 8,
    marginRight: 8,
  },
  groupActions: {
    position: "absolute",
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 6,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 8,
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },

  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.primary100,
    borderRadius: 6,
    marginHorizontal: 4,
    marginBottom: 8,
    justifyContent: "center",
  },
  actionText: {
    color: Colors.primary600,
    fontWeight: "bold",
  },
  closeActionBtn: {
    marginLeft: 8,
    backgroundColor: Colors.primary600,
    borderRadius: 12,
    padding: 4,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  groupActionsModal: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    width: "72%",
    alignItems: "center",
  },
});
