import { deleteNote, toggleLockNote } from "@/src/api/noteAPI";
import Colors from "@/src/constants/Colors";
import { useNoteContext } from "@/src/context/noteContext";
import { useNavigation } from "@/src/hook/useNavigation";
import { RootState } from "@/src/redux/rootReducer";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Share from "react-native-share";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";

export default function NoteDetailScreen() {
  const navigation = useNavigation();
  const { groups } = useSelector((state: RootState) => state.group);
  const { user } = useSelector((state: RootState) => state.auth);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { selectedNote, handleUpdateNote, handleDeleteNote } = useNoteContext();
  const { t } = useTranslation();

  if (!selectedNote) {
    Alert.alert(t('common.error'), t('note_detail.note_not_found_error'));
    navigation.goBack();
    return null;
  }

  const selectedGroupName =
    selectedNote.groupId === null
      ? t('note_detail.no_group')
      : groups.find((g) => g.id === selectedNote.groupId)?.name || t('note_detail.unknown_group');

  const handleEdit = () => {
    navigation.navigate("UpdateNote", { note: selectedNote });
  };

  const handleDelete = () => {
    Alert.alert(t('note_detail.delete_note_title'), t('note_detail.delete_note_confirm'), 
    [
      { text: t('common.cancel'), style: "cancel" },
      {
        text: t('common.delete'),
        style: "destructive",
        onPress: async () => {
          try {
            await deleteNote(user!.uid, selectedNote.id);
            Toast.show({
              type: "success",
              text1: t('common.success'),
              text2: t('note_detail.delete_note_success'),
            });
            handleDeleteNote(selectedNote.id);
            navigation.goBack();
          } catch (error) {
            console.error("Error deleting note:", error);
            Alert.alert(t('common.error'), t('note_detail.delete_note_failed'));
          }
        },
      },
    ]);
  };

  const handleLock = () => {
    Alert.alert(
      selectedNote.locked ? t('note_detail.unlock_note_title') : t('note_detail.lock_note_title'),
      selectedNote.locked
        ? t('note_detail.unlock_note_confirm')
        : t('note_detail.lock_note_confirm'),
      [
        { text: t('common.cancel'), style: "cancel" },
        {
          text: selectedNote.locked ? t('note_detail.unlock_button') : t('note_detail.lock_button'),
          onPress: async () => {
            {
              try {
                await toggleLockNote(
                  user!.uid,
                  selectedNote.id,
                  !selectedNote.locked
                );
                Alert.alert(
                  t('common.success'),
                  selectedNote.locked
                    ? t('note_detail.unlock_note_success')
                    : t('note_detail.lock_note_success')
                );
                handleUpdateNote({
                  ...selectedNote,
                  locked: !selectedNote.locked,
                });
              } catch (error) {
                console.error("Error locking/unlocking note:", error);
                Alert.alert(
                  t('common.error'),
                  t('note_detail.lock_unlock_failed')
                );
              }
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    try {
      const shareMessage = `${t('note_detail.share_title_label')}: ${selectedNote.title}\n\n${selectedNote.content}\n\n${selectedNote.images && selectedNote.images.length > 0
        ? selectedNote.images.map((img) => `${img}`).join("\n\n")
        : t('note_detail.no_images_attached')}\n\n${t('note_detail.shared_from_app')}`;

      let shareOptions: {
        title: string;
        message: string;
        type: string;
      } = {
        title: t('note_detail.share_note_title'),
        message: shareMessage,
        type: "text/plain"
      };

      await Share.open(shareOptions);
      Toast.show({
        type: "success",
        text1: t('common.success'),
        text2: t('note_detail.share_note_success'),
      });
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string" &&
        (error as { message: string }).message !== "User did not share"
      ) {
        Alert.alert(t('common.error'), t('note_detail.share_note_failed'));
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.primary600} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('note_detail.screen_title')}</Text>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color={Colors.primary600} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{selectedNote.title}</Text>

        <Text style={styles.groupText}>{t('note_detail.group_label')}: {selectedGroupName}</Text>

        <View style={styles.iconRow}>
          {selectedNote.pinned && (
            <Ionicons
              name="bookmark"
              size={20}
              color={"gold"}
              style={styles.icon}
            />
          )}
          {selectedNote.locked && (
            <Ionicons
              name="lock-closed"
              size={20}
              color="gray"
              style={styles.icon}
            />
          )}
        </View>

        <Text style={styles.content}>{selectedNote.content}</Text>

        {selectedNote.images && selectedNote.images.length > 0 && (
          <>
            <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
              {t('note_detail.images_label')}:
            </Text>
            <View style={styles.imageContainer}>
              {selectedNote.images.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setSelectedImage(img);
                    setModalVisible(true);
                  }}
                >
                  <Image source={{ uri: img }} style={styles.image} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.actionButtonsContainer}>
        {!selectedNote.locked && (
          <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
            <Ionicons name="create-outline" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>{t('note_detail.edit_button')}</Text>
          </TouchableOpacity>
        )}
        {!selectedNote.locked && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#e74c3c" }]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>{t('common.delete')}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#6366f1" }]}
          onPress={handleLock}
        >
          <Ionicons
            name={
              selectedNote.locked ? "lock-open-outline" : "lock-closed-outline"
            }
            size={18}
            color="#fff"
          />
          <Text style={styles.actionButtonText}>
            {selectedNote.locked ? t('note_detail.unlock_button') : t('note_detail.lock_button')}
          </Text>
        </TouchableOpacity>
      </View>
      {/* Modal for viewing image */}
      {selectedImage && (
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.9)",
              justifyContent: "center",
              alignItems: "center",
            }}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <Image
              source={{ uri: selectedImage }}
              style={{
                width: "90%",
                height: "60%",
                resizeMode: "contain",
                borderRadius: 12,
              }}
            />
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
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
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
    justifyContent: "flex-end",
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
  backBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  shareBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
});
