import { uploadBase64ToCloudinary } from "@/src/api/imageAPI";
import firestore from "@react-native-firebase/firestore";
import RNFS from "react-native-fs";

// Truyền userId vào hàm này (vì cấu trúc bạn có users/{userId})
export const syncOfflineNoteImages = async (userId: string) => {
  const notesSnap = await firestore()
    .collection("users")
    .doc(userId)
    .collection("notes")
    .where("isSynced", "==", false)
    .get();

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
          // await RNFS.unlink(realPath);
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
      }
    }

    if (updated) {
      try {
        await firestore()
          .collection("users")
          .doc(userId)
          .collection("notes")
          .doc(noteId)
          .update({
            images: newImageUrls,
            isSynced: true,
          });

        console.log(`✅ Synced note ${noteId}`);
      } catch (err: any) {
        console.error(
          `❌ Firestore update failed for note ${noteId}`,
          err.message
        );
      }
    }
  }
};
