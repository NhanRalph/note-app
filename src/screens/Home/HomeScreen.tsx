import {
  deleteNote,
  getLockedNotes,
  getNotes,
  getPinnedNotes,
  NoteType,
  toggleLockNote,
  togglePinNote,
} from "@/src/api/noteAPI";
import GroupItem from "@/src/components/GroupItem/GroupItem";
import NoteItem from "@/src/components/NoteItem/NoteItem";
import Colors from "@/src/constants/Colors";
import { useAppDispatch } from "@/src/hook/useDispatch";
import { useNavigation } from "@/src/hook/useNavigation";
import { RootState } from "@/src/redux/rootReducer";
import {
  deleteGroupStore,
  getGroupsStore,
} from "@/src/redux/slices/groupSlices";
import { Ionicons } from "@expo/vector-icons";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Keyboard,
  Modal,
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

export default function HomeScreen() {
  //use state
  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");
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

  const [notes, setNotes] = useState<NoteType[]>([]);
  const [selectedGroupActionId, setSelectedGroupActionId] = useState<
    string | null
  >(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [flag, setFlag] = useState(false);

  // Redux hooks
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { groups, error, lastCreatedAt, loadingGroup, hasMoreGroup } =
    useSelector((state: RootState) => state.group);

  const { user } = useSelector((state: RootState) => state.auth);

  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const [openedSwipeRef, setOpenedSwipeRef] = useState<Swipeable | null>(null);

  const fetchNotes = async (params: {
    userId: string;
    groupId?: string;
    keyword?: string;
    reset?: boolean;
    isLoadMore?: boolean;
  }) => {
    try {
      if (loading || loadingMore || (!hasMore && params.isLoadMore)) return;

      if (params.isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await getNotes(
        params.userId,
        PAGE_SIZE,
        params.groupId,
        params.reset ? undefined : lastDoc,
        params.keyword
      );

      if (params.reset) {
        setNotes(response.notes);
      } else {
        setNotes((prev) => [...prev, ...response.notes]);
      }

      setLastDoc(response.lastVisible);
      setHasMore(response.notes.length >= PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchAllNotes = async (params: {
    userId: string;
    keyword?: string;
    reset?: boolean;
    isLoadMore?: boolean;
  }) => {
    try {
      if (loading || loadingMore || (!hasMore && params.isLoadMore)) return;

      if (params.isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await getNotes(
        params.userId,
        PAGE_SIZE,
        undefined,
        params.reset ? undefined : lastDoc,
        params.keyword
      );

      if (params.reset) {
        setNotes(response.notes);
      } else {
        setNotes((prev) => [...prev, ...response.notes]);
      }

      setLastDoc(response.lastVisible);
      setHasMore(response.notes.length >= PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchPinnedNotes = async (params: {
    userId: string;
    keyword?: string;
    reset?: boolean;
    isLoadMore?: boolean;
  }) => {
    try {
      if (loading || loadingMore || (!hasMore && params.isLoadMore)) return;

      if (params.isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      const response = await getPinnedNotes(
        params.userId,
        PAGE_SIZE,
        params.reset ? undefined : lastDoc,
        params.keyword
      );

      if (params.reset) {
        setNotes(response.notes);
      } else {
        setNotes((prev) => [...prev, ...response.notes]);
      }

      setLastDoc(response.lastVisible);
      setHasMore(response.notes.length >= PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchLockedNotes = async (params: {
    userId: string;
    keyword?: string;
    reset?: boolean;
    isLoadMore?: boolean;
  }) => {
    try {
      if (loading || loadingMore || (!hasMore && params.isLoadMore)) return;

      if (params.isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      const response = await getLockedNotes(
        params.userId,
        PAGE_SIZE,
        params.reset ? undefined : lastDoc,
        params.keyword
      );

      if (params.reset) {
        setNotes(response.notes);
      } else {
        setNotes((prev) => [...prev, ...response.notes]);
      }

      setLastDoc(response.lastVisible);
      setHasMore(response.notes.length >= PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (user) {
      dispatch(
        getGroupsStore({
          userId: user.uid,
          pageSize: PAGE_SIZE,
          lastCreatedAt: null,
        })
      );
      // fetchNotes({ userId: user.uid, reset: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Fetch notes when selectedGroupId changes
  useEffect(() => {
    if (!user) return;

    if (selectedGroupId === "all") {
      fetchAllNotes({
        userId: user.uid,
        keyword: debouncedKeyword,
        reset: true,
      });
    } else if (selectedGroupId === "pinned") {
      fetchPinnedNotes({
        userId: user.uid,
        keyword: debouncedKeyword,
        reset: true,
      });
    } else if (selectedGroupId === "locked") {
      fetchLockedNotes({
        userId: user.uid,
        keyword: debouncedKeyword,
        reset: true,
      });
    } else {
      fetchNotes({
        userId: user.uid,
        groupId: selectedGroupId,
        keyword: debouncedKeyword,
        reset: true,
      });
    }
  }, [selectedGroupId, debouncedKeyword, flag]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchKeyword]);

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
    navigation.navigate("CreateNote", {
      userId: user.uid,
      groupId: selectedGroupId,
    });
  };

  const handleGroupLongPress = (groupId: string) => {
    if (groupId === "all" || groupId === "pinned" || groupId === "locked")
      return;
    setSelectedGroupActionId(groupId);
  };

  const handleCloseActions = () => {
    setSelectedGroupActionId(null);
  };

  // Dummy update/delete functions
  const handleUpdateGroup = (groupId: string) => {
    navigation.navigate("UpdateGroup", {
      userId: user!.uid,
      groupId: groupId,
      name: groups.find((g) => g.id === groupId)?.name || "",
    });
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
        onPress: () => {
          dispatch(deleteGroupStore({ userId: user!.uid, groupId }));
          handleCloseActions();

          Toast.show({
            type: "success",
            text1: "Thành công",
            text2: "Đã xoá nhóm thành công!",
          });
          setIsDeleted(!isDeleted);
        },
      },
    ]);
  };

  const handlePinNote = (note: NoteType) => {
    Alert.alert(
      "Ghim ghi chú",
      note.pinned
        ? "Bạn có muốn bỏ ghim ghi chú này không?"
        : "Bạn có muốn ghim ghi chú này không?",
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: note.pinned
        ? "Bỏ ghim" : "Ghim",
          onPress: async () => {
            try {
              // Call pin API here
              await togglePinNote(user!.uid, note.id, !note.pinned);

              Toast.show({
                type: "success",
                text1: "Thành công",
                text2: "Đã ghim ghi chú",
              });
              setFlag(!flag);
              setSelectedNoteActionId(null);
              setSelectedNote(null);
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
    setSelectedNoteActionId(null);
    setSelectedNote(null);
    navigation.navigate("UpdateNote", { note });
  };

  const handleDeleteNote = (note: NoteType) => {
    Alert.alert("Xoá ghi chú", "Bạn có chắc chắn muốn xoá ghi chú này không?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: async () => {
          try {
            // Call delete API here
            await deleteNote(user!.uid, note.id);

            Toast.show({
              type: "success",
              text1: "Thành công",
              text2: "Đã xoá thành công!",
            });
            setFlag(!flag);
            setSelectedNoteActionId(null);
            setSelectedNote(null);
          } catch (error) {
            console.error("Error deleting note:", error);
            Alert.alert("Lỗi", "Không thể xoá ghi chú. Vui lòng thử lại sau.");
          }
        },
      },
    ]);
  };

  const handleLockNote = (note: NoteType) => {
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
                Toast.show({
                  type: "success",
                  text1: "Thành công",
                  text2: note.locked
                    ? "Đã mở khoá ghi chú!"
                    : "Đã khoá ghi chú!",
                });
                setFlag(!flag);
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
    setFlag(!flag);
  };

  const handlePressOutside = () => {
    if (openedSwipeRef) {
      openedSwipeRef.close();
      setOpenedSwipeRef(null);
    }
    Keyboard.dismiss(); // Ẩn bàn phím nếu có
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

      <View style={{ flexDirection: "row", marginVertical: 12 }}>
        <FlatList
          data={[
            { id: "all", name: "Tất cả", createdAt: "" },
            { id: "pinned", name: "Ghim", createdAt: "" },
            { id: "locked", name: "Đã khoá", createdAt: "" },
            ...groups,
          ]}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View key={item.id} style={{ position: "relative" }}>
              <TouchableOpacity
                onPress={() => setSelectedGroupId(item.id)}
                onLongPress={() => handleGroupLongPress(item.id)}
                delayLongPress={300}
                style={[
                  styles.listGroupItem,
                  selectedGroupId === item.id && {
                    backgroundColor: Colors.red500 + "15",
                  },
                ]}
              >
                <GroupItem group={item} />
              </TouchableOpacity>
            </View>
          )}
          ListHeaderComponent={
            <TouchableOpacity style={styles.addGroupBtn} onPress={createGroup}>
              <Ionicons name="add" size={20} color={Colors.primary600} />
            </TouchableOpacity>
          }
          onEndReached={() => {
            if (!user || loadingGroup || !hasMoreGroup) return;
            dispatch(
              getGroupsStore({
                userId: user.uid,
                pageSize: PAGE_SIZE,
                lastCreatedAt: lastCreatedAt,
              })
            );
          }}
          onEndReachedThreshold={0.3}
        />
      </View>

      {/* Notes */}
      <TouchableWithoutFeedback onPress={handlePressOutside}>
        <FlatList
          data={notes}
          key={viewMode}
          numColumns={viewMode === "grid" ? 2 : 1}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NoteItem
              note={item}
              viewMode={viewMode}
              changeFlag={handleChangeFlag}
              onLongPressNote={() => {
                setSelectedNoteActionId(item.id);
                setSelectedNote(item);
              }}
              setOpenedSwipeRef={setOpenedSwipeRef}
            />
          )}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (!user || loadingMore || !hasMore) return;

            if (selectedGroupId === "all") {
              fetchAllNotes({
                userId: user.uid,
                keyword: debouncedKeyword,
                isLoadMore: true,
              });
            } else if (selectedGroupId === "pinned") {
              fetchPinnedNotes({
                userId: user.uid,
                keyword: debouncedKeyword,
                isLoadMore: true,
              });
            } else {
              fetchNotes({
                userId: user.uid,
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
        />
      </TouchableWithoutFeedback>

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
              style={[styles.actionBtn, { backgroundColor: "#4b7bec15" }]}
              onPress={() => handleUpdateGroup(selectedGroupActionId!)}
            >
              <Text style={[styles.actionText, { color: "#4b7bec" }]}>
                <Ionicons name="pencil" size={14} color={"#4b7bec"} /> Chỉnh sửa
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#EF444415" }]}
              onPress={() => handleDeleteGroup(selectedGroupActionId!)}
            >
              <Text style={[styles.actionText, { color: "#EF4444" }]}>
                <Ionicons name="trash" size={14} color={"#EF4444"} /> Xoá
              </Text>
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
                  <Ionicons name="bookmark" size={14} color={"#a855f7"} /> {selectedNote.pinned
                  ? "Bỏ ghim" : "Ghim"}
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
                  onPress={() => handleDeleteNote(selectedNote)}
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
