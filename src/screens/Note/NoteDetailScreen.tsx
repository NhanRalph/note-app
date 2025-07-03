import Colors from "@/src/constants/Colors";
import { useNavigation } from "@/src/hook/useNavigation";
import { RootStackParamList } from "@/src/navigation/types/navigationTypes";
import { RootState } from "@/src/redux/rootReducer";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useRoute } from "@react-navigation/native";
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
  const { note } = route.params;
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
        onPress: () => {
          /* Call delete API here */
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
          onPress: () => {
            /* Call lock/unlock API here */
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết ghi chú</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={styles.title}>{note.title}</Text>

        {/* Group */}
        {note.groupId && (
          <Text style={styles.groupText}>Nhóm: {selectedGroupName}</Text>
        )}

        {/* Icons */}
        <View style={styles.iconRow}>
          {note.pinned && (
            <Ionicons
              name="star"
              size={20}
              color={Colors.primary600}
              style={styles.icon}
            />
          )}
          {note.locked && (
            <Ionicons
              name="lock-closed"
              size={20}
              color="red"
              style={styles.icon}
            />
          )}
        </View>

        {/* Content */}
        <Text style={styles.content}>{note.content}</Text>

        {/* Images */}
        {note.images && note.images.length > 0 && (
          <>
            <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
              Hình ảnh:
            </Text>
            <View style={styles.imageContainer}>
              {/* Label "Hình ảnh" */}
              {note.images.map((img, index) => (
                <Image key={index} source={{ uri: img }} style={styles.image} />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
          <Text style={styles.actionButtonText}>Chỉnh sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#e74c3c" }]}
          onPress={handleDelete}
        >
          <Text style={styles.actionButtonText}>Xoá</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#6366f1" }]}
          onPress={handleLock}
        >
          <Text style={styles.actionButtonText}>
            {note.locked ? "Mở khoá" : "Khoá"}
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
});
