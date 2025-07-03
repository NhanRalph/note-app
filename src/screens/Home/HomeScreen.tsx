import { getNotes, NoteType } from "@/src/api/noteAPI";
import GroupItem from "@/src/components/GroupItem/GroupItem";
import NoteItem from "@/src/components/NoteItem/NoteItem";
import Colors from "@/src/constants/Colors";
import { useAppDispatch } from "@/src/hook/useDispatch";
import { useNavigation } from "@/src/hook/useNavigation";
import { RootState } from "@/src/redux/rootReducer";
import { getGroupsStore } from "@/src/redux/slices/groupSlices";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  FlatList,
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
  };

  useEffect(() => {
    //dispatch group
    if (user) {
      dispatch(getGroupsStore({ userId: user.uid }));

      // Fetch initial notes
      fetchNotes({ userId: user.uid });
    }
  }, []);

  useEffect(() => {
    if (user) {
      if (selectedGroupId && selectedGroupId !== "all") {
        fetchNotes({ userId: user.uid, groupId: selectedGroupId });
      } else {
        fetchNotes({ userId: user.uid });
      }
    }
  }, [selectedGroupId]);

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

  const notes2 = [
    {
      id: "note1",
      title: "Ghi chú 1",
      content: "...",
      pinned: true,
      locked: false,
      groupId: "group1",
    },
    {
      id: "note2",
      title: "Ghi chú 2",
      content: "...",
      pinned: false,
      locked: true,
      groupId: "group2",
    },
  ];

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
              <TouchableOpacity
                key={group.id}
                onPress={() => setSelectedGroupId(group.id)}
                style={[
                  styles.listGroupItem,
                  selectedGroupId === group.id && {
                    backgroundColor: Colors.primary200,
                  }, // Đánh dấu selected
                ]}
              >
                <GroupItem group={group} />
              </TouchableOpacity>
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
});
