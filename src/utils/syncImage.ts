import { uploadBase64ToCloudinary } from "@/src/api/imageAPI";
import firestore from "@react-native-firebase/firestore";
import RNFS from "react-native-fs";

// Truyền userId vào hàm này (vì cấu trúc bạn có users/{userId})
export const syncOfflineNoteImages = async (
  userId: string,
  onProgress: (progress: number) => void // Thêm callback để cập nhật tiến trình
) => {
  const notesSnap = await firestore()
    .collection("users")
    .doc(userId)
    .collection("notes")
    .where("isSynced", "==", false)
    .get();

  const totalNotes = notesSnap.size; // Tổng số ghi chú cần đồng bộ
  let processedNotes = 0; // Số ghi chú đã xử lý

  for (const doc of notesSnap.docs) {
    const note = doc.data();
    const noteId = doc.id;

    const newImageUrls: string[] = [];
    let updated = false;

    for (const imgPath of note.images || []) {
      if (imgPath.startsWith("file://")) {
        try {
          const realPath = imgPath.replace("file://", "");

          const exists = await RNFS.exists(realPath);
          if (!exists) {
            console.warn(`⚠️ File not found: ${imgPath}`);
            newImageUrls.push(imgPath);
            continue;
          }

          const base64 = await RNFS.readFile(realPath, "base64");

          const cloudUrl = await uploadBase64ToCloudinary(
            `data:image/png;base64,${base64}`
          );

          newImageUrls.push(cloudUrl);
          // await RNFS.unlink(realPath); // Nếu muốn xóa file sau khi tải lên
          updated = true;
        } catch (err: any) {
          console.error(
            `❌ Sync failed for ${imgPath}`,
            err.message,
            err.stack
          );
          newImageUrls.push(imgPath);
        }
      } else {
        newImageUrls.push(imgPath);
        updated = true;
      }
    }

    //trường hợp note không có ảnh nhưng isSynced là false thì vẫn có updated = true. để cập nhật lại
    if (note.images.length === 0 && note.isSynced === false) {
      updated = true;
    }

    if (updated) {
      try {
        firestore()
          .collection("users")
          .doc(userId)
          .collection("notes")
          .doc(noteId)
          .update({
            images: newImageUrls,
            isSynced: true,
            isDraft: false,
          });

        console.log(`✅ Synced note ${noteId}`);
      } catch (err: any) {
        console.error(
          `❌ Firestore update failed for note ${noteId}`,
          err.message
        );
      }
    }

    // Cập nhật tiến trình sau mỗi ghi chú
    processedNotes += 1;
    const progress = Math.floor((processedNotes / totalNotes) * 100); // Tính phần trăm
    onProgress(progress); // Cập nhật tiến trình cho callback
  }
};
