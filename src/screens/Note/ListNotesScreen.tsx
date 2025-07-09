import {
  deleteNote,
  getLockedNotes,
  getNotes,
  getPinnedNotes,
  NoteType,
  toggleLockNote,
  togglePinNote,
} from "@/src/api/noteAPI";
import NoteItem from "@/src/components/NoteItem/NoteItem";
import Colors from "@/src/constants/Colors";
import { useNoteContext } from "@/src/context/noteContext";
import { useAppDispatch } from "@/src/hook/useDispatch";
import { useNavigation } from "@/src/hook/useNavigation";
import { RootStackParamList } from "@/src/navigation/types/navigationTypes";
import { RootState } from "@/src/redux/rootReducer";
import { getNoteStatsStore } from "@/src/redux/slices/groupSlices";
import { Ionicons } from "@expo/vector-icons";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { RouteProp } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";

interface ListNotesScreenProps {
  route: RouteProp<RootStackParamList, "ListNotesScreen">;
}

const ListNotesScreen: React.FC<ListNotesScreenProps> = ({ route }) => {
  //use state
  const { userId, groupId } = route.params;
  const dispatch = useAppDispatch();

  const [selectedGroupId, setSelectedGroupId] = useState<string>(groupId);
  const [selectedNoteActionId, setSelectedNoteActionId] = useState<
    string | null
  >(null);
  const [selectedNote, setSelectedNote] = useState<NoteType | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>("");
  const PAGE_SIZE = 10;
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<
    FirebaseFirestoreTypes.DocumentSnapshot | undefined
  >(undefined);
  const [hasMore, setHasMore] = useState(true);

  const {notes, setNotes, handleUpdateNote, handleDeleteNote, handleSetNotes, handleSetSelectedNote} = useNoteContext();
  const [flag, setFlag] = useState(false);

  const navigation = useNavigation();

  const { user } = useSelector((state: RootState) => state.auth);

  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [sortedNotes, setSortedNotes] = useState<NoteType[]>([]);

  const [openedSwipeRef, setOpenedSwipeRef] = useState<Swipeable | null>(null);
  const fetchNotesByType = async (params: {
    userId: string;
    groupId?: string;
    type?: "all" | "pinned" | "locked";
    keyword?: string;
    reset?: boolean;
    isLoadMore?: boolean;
  }) => {
    try {
      if (loading || loadingMore || (!hasMore && params.isLoadMore)) return;

      params.isLoadMore ? setLoadingMore(true) : setLoading(true);

      let response;
      if (params.type === "pinned") {
        response = await getPinnedNotes(
          params.userId,
          PAGE_SIZE,
          params.reset ? undefined : lastDoc,
          params.keyword
        );
      } else if (params.type === "locked") {
        response = await getLockedNotes(
          params.userId,
          PAGE_SIZE,
          params.reset ? undefined : lastDoc,
          params.keyword
        );
      } else {
        response = await getNotes(
          params.userId,
          PAGE_SIZE,
          params.groupId,
          params.reset ? undefined : lastDoc,
          params.keyword
        );
      }

      setNotes(response.notes);
      setLastDoc(response.lastVisible);
      setHasMore(response.notes.length >= PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetch = (groupId: string) => {
    if (!user) return;

    if (groupId === "all") {
      fetchNotesByType({
        userId: user.uid,
        type: "all",
        keyword: debouncedKeyword,
        reset: true,
      });
    } else if (groupId === "pinned") {
      fetchNotesByType({
        userId: user.uid,
        type: "pinned",
        keyword: debouncedKeyword,
        reset: true,
      });
    } else if (groupId === "locked") {
      fetchNotesByType({
        userId: user.uid,
        type: "locked",
        keyword: debouncedKeyword,
        reset: true,
      });
    } else {
      fetchNotesByType({
        userId: user.uid,
        groupId,
        keyword: debouncedKeyword,
        reset: true,
      });
    }
  };

  useEffect(() => {
    fetch(groupId);
  }, [selectedGroupId, debouncedKeyword, groupId]);

  //sort notes by pinned,locked, updateAt
  useEffect(() => {

    // Sắp xếp ghi chú theo pinned, locked và thời gian cập nhật
    const sorted = [...notes].sort((a, b) => {
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1; // Ghim lên đầu
      }
      if (a.locked !== b.locked) {
        return a.locked ? 1 : -1; // Khoá xuống dưới
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(); // Sắp xếp theo thời gian cập nhật
    });
    setSortedNotes(sorted);
  }, [notes, flag]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchKeyword]);

  const handleRefresh = async () => {
    setRefreshing(true);
    fetch(groupId);
    setRefreshing(false);
  };

  const createNote = () => {
    if (!user) {
      navigation.navigate("LoginScreen");
      return;
    }
    navigation.navigate("CreateNote", {
      userId: user.uid,
      groupId: selectedGroupId,
    });
  };

  const handlePinNote = (note: NoteType) => {
    handleUnSelectItem();
    Alert.alert(
      "Ghim ghi chú",
      note.pinned
        ? "Bạn có muốn bỏ ghim ghi chú này không?"
        : "Bạn có muốn ghim ghi chú này không?",
      [
        { text: "Huỷ", style: "cancel", onPress: () => handleSelectItem(note) },
        {
          text: note.pinned ? "Bỏ ghim" : "Ghim",
          onPress: async () => {
            try {
              // Call pin API here
              await togglePinNote(user!.uid, note.id, !note.pinned);

              handleUpdateNote({
                ...note,
                pinned: !note.pinned,
              });

              Toast.show({
                type: "success",
                text1: "Thành công",
                text2: "Đã ghim ghi chú",
              });
              handleChangeFlag();
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

  const handleEditNote = (note: NoteType) => {
    handleUnSelectItem();
    navigation.navigate("UpdateNote", {
      note,
    });
  };

  const handleDelete = (note: NoteType) => {
    handleUnSelectItem();
    Alert.alert("Xoá ghi chú", "Bạn có chắc chắn muốn xoá ghi chú này không?", [
      { text: "Huỷ", style: "cancel", onPress: () => handleSelectItem(note) },
      {
        text: "Xoá",
        style: "destructive",
        onPress: async () => {
          try {
            // Call delete API here
            await deleteNote(user!.uid, note.id);

            handleDeleteNote(note.id);

            Toast.show({
              type: "success",
              text1: "Thành công",
              text2: "Đã xoá thành công!",
            });
            handleChangeFlag();
          } catch (error) {
            console.error("Error deleting note:", error);
            Alert.alert("Lỗi", "Không thể xoá ghi chú. Vui lòng thử lại sau.");
          }
        },
      },
    ]);
  };

  const handleLockNote = (note: NoteType) => {
    handleUnSelectItem();
    Alert.alert(
      note.locked ? "Mở khoá ghi chú" : "Khoá ghi chú",
      note.locked
        ? "Bạn có muốn mở khoá ghi chú này không?"
        : "Bạn có muốn khoá ghi chú này không?",
      [
        { text: "Huỷ", style: "cancel", onPress: () => handleSelectItem(note) },
        {
          text: note.locked ? "Mở khoá" : "Khoá",
          onPress: async () => {
            {
              try {
                // Call lock/unlock API here
                await toggleLockNote(user!.uid, note.id, !note.locked);

                handleUpdateNote({
                  ...note,
                  locked: !note.locked,
                });
                
                Toast.show({
                  type: "success",
                  text1: "Thành công",
                  text2: note.locked
                    ? "Đã mở khoá ghi chú!"
                    : "Đã khoá ghi chú!",
                });
                handleChangeFlag();
                setSelectedNoteActionId(null);
                setSelectedNote(null);
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

  const handleChangeFlag = () => {
    dispatch(getNoteStatsStore({ userId }));
    // setFlag(!flag);
  };

  const handlePressOutside = () => {
    if (openedSwipeRef) {
      openedSwipeRef.close();
      setOpenedSwipeRef(null);
    }
    Keyboard.dismiss(); // Ẩn bàn phím nếu có
  };

  const handleSelectItem = (note: NoteType) => {
    setSelectedNoteActionId(note.id);
    setSelectedNote(note);
    Keyboard.dismiss(); // Ẩn bàn phím nếu có
  };

  const handleUnSelectItem = () => {
    setSelectedNoteActionId(null);
    setSelectedNote(null);
    Keyboard.dismiss(); // Ẩn bàn phím nếu có
  };

  const handleHome = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleHome}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary600} />
        </TouchableOpacity>
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

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#888"
          style={{ marginRight: 8 }}
        />
        <TextInput
          placeholder="Tìm kiếm ghi chú..."
          style={styles.searchInput}
          value={searchKeyword}
          onChangeText={(text) => setSearchKeyword(text)}
        />
      </View>

      {/* Notes */}
      {loading ? (
        <View style={styles.container}>
          <ActivityIndicator
            size="large"
            color={Colors.primary600}
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          />
        </View>
      ) : (
        <TouchableWithoutFeedback onPress={handlePressOutside}>
          <FlatList
            data={sortedNotes}
            key={viewMode}
            numColumns={viewMode === "grid" ? 2 : 1}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <NoteItem
                note={item}
                viewMode={viewMode}
                changeFlag={handleChangeFlag}
                onLongPressNote={() => {
                  handleSelectItem(item);
                }}
                handlePinNote={handlePinNote}
                handleEdit={handleEditNote}
                handleDelete={handleDelete}
                handleLock={handleLockNote}
                handleUnSelectItem={handleUnSelectItem}
                setOpenedSwipeRef={setOpenedSwipeRef}
              />
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
            showsVerticalScrollIndicator={false}
            onEndReached={() => {
              if (!user || loadingMore || !hasMore) return;

              if (selectedGroupId === "all") {
                fetchNotesByType({
                  userId: user.uid,
                  type: "all",
                  keyword: debouncedKeyword,
                  isLoadMore: true,
                });
              } else if (selectedGroupId === "pinned") {
                fetchNotesByType({
                  userId: user.uid,
                  type: "pinned",
                  keyword: debouncedKeyword,
                  isLoadMore: true,
                });
              } else {
                fetchNotesByType({
                  userId: user.uid,
                  type: "locked",
                  groupId: selectedGroupId,
                  keyword: debouncedKeyword,
                  isLoadMore: true,
                });
              }
            }}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              loadingMore ? (
                <View style={{ padding: 16, alignItems: "center" }}>
                  <Text style={{ color: "#888" }}>Đang tải thêm...</Text>
                </View>
              ) : null
            }
            ListEmptyComponent={
              !loading ? (
                <View style={{ padding: 16, alignItems: "center" }}>
                  <Text style={{ color: "#888" }}>
                    Chưa có ghi chú nào. Hãy tạo ghi chú mới!
                  </Text>
                </View>
              ) : null
            }
          />
        </TouchableWithoutFeedback>
      )}

      {/* Nút thêm Note */}
      <TouchableOpacity style={styles.addNoteBtn} onPress={createNote}>
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {selectedNote && (
        <Modal
          visible={!!selectedNoteActionId}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedNoteActionId(null)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setSelectedNoteActionId(null)}
          >
            <View style={styles.groupActionsModal}>
              {/* Ghim */}
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#a855f715" }]}
                onPress={() => handlePinNote(selectedNote)}
              >
                <Text style={[styles.actionText, { color: "#a855f7" }]}>
                  <Ionicons name="bookmark" size={14} color={"#a855f7"} />{" "}
                  {selectedNote.pinned ? "Bỏ ghim" : "Ghim"}
                </Text>
              </TouchableOpacity>

              {/* Khoá / Mở khoá */}
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#4b556315" }]}
                onPress={() => handleLockNote(selectedNote)}
              >
                <Text style={[styles.actionText, { color: "#4b5563" }]}>
                  <Ionicons
                    name={selectedNote.locked ? "lock-open" : "lock-closed"}
                    size={14}
                    color={"#4b5563"}
                    style={{ marginLeft: 8 }}
                  />{" "}
                  {selectedNote.locked ? "Mở khoá" : "Khoá"}
                </Text>
              </TouchableOpacity>

              {/* Chỉnh sửa (chỉ khi chưa khoá) */}
              {!selectedNote.locked && (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#4b7bec15" }]}
                  onPress={() => handleEditNote(selectedNote)}
                >
                  <Text style={[styles.actionText, { color: "#4b7bec" }]}>
                    <Ionicons name="pencil" size={14} color={"#4b7bec"} /> Chỉnh
                    sửa
                  </Text>
                </TouchableOpacity>
              )}

              {/* Xoá (chỉ khi chưa khoá) */}
              {!selectedNote.locked && (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#EF444415" }]}
                  onPress={() => handleDelete(selectedNote)}
                >
                  <Text style={[styles.actionText, { color: "#EF4444" }]}>
                    <Ionicons name="trash" size={14} color={"#EF4444"} /> Xoá
                  </Text>
                </TouchableOpacity>
              )}

              {/* Đóng */}
              <TouchableOpacity
                style={styles.closeActionBtn}
                onPress={() => setSelectedNoteActionId(null)}
              >
                <Ionicons name="close" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  backBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
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
    padding: 8,
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
    paddingVertical: 2,
    paddingHorizontal: 6,
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
    fontSize: 16,
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
});

export default ListNotesScreen;
