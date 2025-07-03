import Colors from "@/src/constants/Colors";
import { useNavigation } from "@/src/hook/useNavigation";
import { RootStackParamList } from "@/src/navigation/types/navigationTypes";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type NoteDetailRouteProp = RouteProp<RootStackParamList, "NoteDetail">;

export default function NoteDetailScreen() {
  const route = useRoute<NoteDetailRouteProp>();
  const navigation = useNavigation();
  const { note } = route.params;

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
          <Text style={styles.groupText}>Nhóm: {note.groupId}</Text>
        )}

        {/* Icons */}
        <View style={styles.iconRow}>
          {note.pinned && (
            <Ionicons name="star" size={20} color={Colors.primary600} style={styles.icon} />
          )}
          {note.locked && (
            <Ionicons name="lock-closed" size={20} color="red" style={styles.icon} />
          )}
        </View>

        {/* Content */}
        <Text style={styles.content}>{note.content}</Text>

        {/* Images */}
        {note.images && note.images.length > 0 && (
          <View style={styles.imageContainer}>
            {note.images.map((img, index) => (
              <Image key={index} source={{ uri: img }} style={styles.image} />
            ))}
          </View>
        )}
      </ScrollView>
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
});
