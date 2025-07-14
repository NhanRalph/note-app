import {
  getGroupNoteStats,
  GroupType,
  updateGroupOrder
} from "@/src/api/groupAPI";
import GroupItem from "@/src/components/GroupItem/GroupItem";
import Colors from "@/src/constants/Colors";
import { useAppDispatch } from "@/src/hook/useDispatch";
import { useNavigation } from "@/src/hook/useNavigation";
import { RootState } from "@/src/redux/rootReducer";
import {
  adjustNoteStatsFromUpdate,
  deleteGroupById,
  deleteGroupStore,
  getGroupsStore,
  getNoteStatsStore,
} from "@/src/redux/slices/groupSlices";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";

export default function HomeScreen() {
  //use state
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>("");
  const PAGE_SIZE = 30;
  const [selectedGroupActionId, setSelectedGroupActionId] = useState<
    string | null
  >(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Redux hooks
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const {
    groups,
    virtualGroups,
    error,
    lastOrder,
    loadingGroup,
    loadingMoreGroup,
    hasMoreGroup,
  } = useSelector((state: RootState) => state.group);

  const [groupsResult, setGroupsResult] = useState<GroupType[]>(groups);

  const { user } = useSelector((state: RootState) => state.auth);

  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  useEffect(() => {
    if (user && !loadingGroup) {
      dispatch(
        getGroupsStore({
          userId: user.uid,
          pageSize: PAGE_SIZE,
          lastOrder: null,
        })
      );
      dispatch(getNoteStatsStore({ userId: user.uid }));
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const keyword = debouncedKeyword.trim().toLowerCase();

    console.log(groups);

    if (keyword === "") {
      setGroupsResult(groups); // hiển thị toàn bộ nhóm
    } else {
      const filteredGroups = groups.filter((group) =>
        group.name.toLowerCase().includes(keyword)
      );
      setGroupsResult(filteredGroups);
    }
  }, [groups]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchKeyword]);

  const handleRefresh = async () => {
    setRefreshing(true);
    dispatch(
      getGroupsStore({
        userId: user!.uid,
        pageSize: PAGE_SIZE,
        lastOrder: null,
      })
    );
    dispatch(getNoteStatsStore({ userId: user!.uid }));
    setRefreshing(false);
  };

  const createGroup = () => {
    if (!user) {
      navigation.navigate("LoginScreen");
      return;
    }
    navigation.navigate("CreateGroup", { userId: user.uid });
  };

  const handleGroupLongPress = (groupId: string) => {
    if (groupId === "all" || groupId === "pinned" || groupId === "locked")
      return;
    setSelectedGroupActionId(groupId);
  };

  const handleCloseActions = () => {
    setSelectedGroupActionId(null);
  };

  const handleUpdateGroup = (groupId: string) => {
    handleCloseActions();
    navigation.navigate("UpdateGroup", {
      userId: user!.uid,
      groupId: groupId,
      name: groups.find((g) => g.id === groupId)?.name || "",
    });
  };

  const handleDeleteGroup = (groupId: string) => {
    handleCloseActions();
    Alert.alert(`Delete group`, "Bạn có chắc chắn muốn xoá nhóm này không?", [
      {
        text: "Hủy",
        style: "cancel",
        onPress: () => {
          setSelectedGroupActionId(groupId);
        },
      },
      {
        text: "Xoá",
        style: "destructive",
        onPress: async () => {
          const resStats = await getGroupNoteStats(user!.uid, groupId);
          dispatch(deleteGroupById({ id: groupId }));

          dispatch(deleteGroupStore({ userId: user!.uid, groupId }));
          dispatch(
            adjustNoteStatsFromUpdate({
              allChange: -resStats.all,
              pinnedChange: -resStats.pinned,
              lockedChange: -resStats.locked,
            })
          );
          // dispatch(getNoteStatsStore({ userId: user!.uid }));

          Toast.show({
            type: "success",
            text1: "Thành công",
            text2: "Đã xoá nhóm thành công!",
          });
        },
      },
    ]);
  };

  if (error) {
    <View style={styles.container}>
      <Text style={{ color: "red" }}>{error}</Text>
    </View>;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>List Groups Daily</Text>
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

      {loadingGroup ? (
        <View style={styles.container}>
          <ActivityIndicator
            size="large"
            color={Colors.primary600}
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          />
        </View>
      ) : (
        <DraggableFlatList
          data={[...groupsResult]}
          key={viewMode}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          numColumns={viewMode === "grid" ? 2 : 1}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          onDragEnd={async ({ data }) => {
            setGroupsResult(data);
            await updateGroupOrder(user!.uid, data);
          }}
          renderItem={({ item, drag, isActive }) => (
            <View
              style={
                viewMode === "grid"
                  ? { width: "48%", marginHorizontal: "1%", marginBottom: 12 }
                  : undefined
              }
            >
              <GroupItem
                group={item}
                viewMode={viewMode}
                drag={drag}
                onLongPressNote={() => handleGroupLongPress(item.id)}
                handleDelete={() => handleDeleteGroup(item.id)}
                handleEdit={() => handleUpdateGroup(item.id)}
              />
            </View>
          )}
          activationDistance={20}
          onEndReached={async () => {
            if (!user || loadingMoreGroup || !hasMoreGroup) return;
            dispatch(
              getGroupsStore({
                userId: user.uid,
                pageSize: PAGE_SIZE,
                lastOrder: lastOrder,
              })
            );
          }}
          onEndReachedThreshold={0.3}
          ListHeaderComponent={
            <View
              style={{
                marginBottom: 4,
              }}
            >
              {virtualGroups.map((item, idx) => (
                <View key={item.id}>
                  <GroupItem group={item} viewMode="list" />
                </View>
              ))}
            </View>
          }
          ListFooterComponent={
            loadingMoreGroup ? (
              <View style={{ padding: 16, alignItems: "center" }}>
                <Text style={{ color: "#888" }}>Đang tải thêm...</Text>
              </View>
            ) : null
          }
          // Sửa đoạn này:
          ListEmptyComponent={
            !loadingGroup && groups.length === 0 ? (
              <View style={{ padding: 16, alignItems: "center" }}>
                <Text style={{ color: "#888" }}>
                  Không có nhóm nào. Hãy tạo nhóm mới!
                </Text>
              </View>
            ) : null
          }
          contentContainerStyle={{
            paddingBottom: 100,
            flexGrow: 1,
          }}
        />
      )}

      {/* Nút thêm Note */}
      <TouchableOpacity style={styles.addNoteBtn} onPress={createGroup}>
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
