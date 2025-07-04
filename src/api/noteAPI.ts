import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";

export interface NoteType {
  id: string;
  title: string;
  content: string;
  images: string[];
  groupId: string | null;
  locked: boolean;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getNotes = async (
  userId: string,
  pageSize: number,
  groupId?: string,
  lastDoc?: FirebaseFirestoreTypes.DocumentSnapshot,
  keyword?: string
) => {
  let query = firestore()
    .collection("users")
    .doc(userId)
    .collection("notes")
    .orderBy("pinned", "desc")
    .orderBy("updatedAt", "desc")
    .limit(pageSize);

  if (lastDoc) {
    query = query.startAfter(lastDoc);
  }

  if (groupId) {
    query = query.where("groupId", "==", groupId);
  }

  const snapshot = await query.get();

  let notes = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      content: data.content,
      images: data.images || [],
      groupId: data.groupId || null,
      locked: !!data.locked,
      pinned: !!data.pinned,
      createdAt:
        data.createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt:
        data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
    };
  });

  // Lọc theo keyword nếu có
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    notes = notes.filter(
      (note) =>
        note.title?.toLowerCase().includes(lowerKeyword) ||
        note.content?.toLowerCase().includes(lowerKeyword)
    );
  }

  const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;

  return { notes, lastVisible };
};

export const createNote = async (
  userId: string,
  data: {
    title: string;
    content: string;
    images?: string[];
    groupId: string | null;
  }
) => {
  const noteRef = firestore().collection(`users/${userId}/notes`).doc();
  await noteRef.set({
    ...data,
    images: data.images || [],
    locked: false,
    pinned: false,
    createdAt: firestore.FieldValue.serverTimestamp(),
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
  return noteRef.id;
};

export const updateNote = async (userId: string, noteId: string, data: any) => {
  await firestore()
    .doc(`users/${userId}/notes/${noteId}`)
    .update({
      ...data,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
};

export const deleteNote = async (userId: string, noteId: string) => {
  await firestore().doc(`users/${userId}/notes/${noteId}`).delete();
};

//move note to another group
export const moveNoteToGroup = async (
  userId: string,
  noteId: string,
  groupId: string | null
) => {
  await firestore().doc(`users/${userId}/notes/${noteId}`).update({
    groupId,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
};

//toggle pin
export const togglePinNote = async (
  userId: string,
  noteId: string,
  pinned: boolean
) => {
  await firestore().doc(`users/${userId}/notes/${noteId}`).update({
    pinned,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
};

//toggle locked
export const toggleLockNote = async (
  userId: string,
  noteId: string,
  locked: boolean
) => {
  await firestore().doc(`users/${userId}/notes/${noteId}`).update({
    locked,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
};

export const getPinnedNotes = async (
  userId: string,
  pageSize: number,
  lastDoc?: FirebaseFirestoreTypes.DocumentSnapshot,
  keyword?: string
) => {
  let query = firestore()
    .collection("users")
    .doc(userId)
    .collection("notes")
    .where("pinned", "==", true)
    .orderBy("updatedAt", "desc")
    .limit(pageSize);

  if (lastDoc) {
    query = query.startAfter(lastDoc);
  }

  const snapshot = await query.get();

  let notes = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      content: data.content,
      images: data.images || [],
      groupId: data.groupId || null,
      locked: !!data.locked,
      pinned: !!data.pinned,
      createdAt:
        data.createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt:
        data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
    };
  });

  // Lọc theo keyword nếu có
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    notes = notes.filter(
      (note) =>
        note.title?.toLowerCase().includes(lowerKeyword) ||
        note.content?.toLowerCase().includes(lowerKeyword)
    );
  }

  const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;

  return { notes, lastVisible };
};

export const getLockedNotes = async (
  userId: string,
  pageSize: number,
  lastDoc?: FirebaseFirestoreTypes.DocumentSnapshot,
  keyword?: string
) => {
  let query = firestore()
    .collection("users")
    .doc(userId)
    .collection("notes")
    .where("locked", "==", true)
    .orderBy("updatedAt", "desc")
    .limit(pageSize);

  if (lastDoc) {
    query = query.startAfter(lastDoc);
  }

  const snapshot = await query.get();

  let notes = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      content: data.content,
      images: data.images || [],
      groupId: data.groupId || null,
      locked: !!data.locked,
      pinned: !!data.pinned,
      createdAt:
        data.createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt:
        data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
    };
  });

  // Lọc theo keyword nếu có
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    notes = notes.filter(
      (note) =>
        note.title?.toLowerCase().includes(lowerKeyword) ||
        note.content?.toLowerCase().includes(lowerKeyword)
    );
  }

  const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;

  return { notes, lastVisible };
};
