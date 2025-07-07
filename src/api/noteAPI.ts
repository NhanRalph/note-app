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

const updateNoteCount = async (
  userId: string,
  groupId: string,
  increment: number
) => {
  if (!groupId) return;

  await firestore()
    .doc(`users/${userId}/groups/${groupId}`)
    .update({
      noteCount: firestore.FieldValue.increment(increment),
    });
};

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

  if (data.groupId) {
    await updateNoteCount(userId, data.groupId, 1);
  }

  return noteRef.id;
};

export const updateNote = async (userId: string, noteId: string, data: any) => {
  const noteRef = firestore().doc(`users/${userId}/notes/${noteId}`);
  const noteSnap = await noteRef.get();

  if (!noteSnap.exists) {
    throw new Error("Note không tồn tại");
  }

  let oldGroupId = noteSnap.data()?.groupId ?? null;
  if (oldGroupId === "") oldGroupId = null;

  let newGroupId = data.groupId ?? oldGroupId;
  if (newGroupId === "") newGroupId = null;

  const batch = firestore().batch();

  // Nếu groupId thay đổi thì xử lý update noteCount
  if (oldGroupId !== newGroupId) {
    if (oldGroupId) {
      const oldGroupRef = firestore().doc(
        `users/${userId}/groups/${oldGroupId}`
      );
      batch.update(oldGroupRef, {
        noteCount: firestore.FieldValue.increment(-1),
      });
    }

    if (newGroupId) {
      const newGroupRef = firestore().doc(
        `users/${userId}/groups/${newGroupId}`
      );
      batch.update(newGroupRef, {
        noteCount: firestore.FieldValue.increment(1),
      });
    }
  }

  batch.update(noteRef, {
    ...data,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });

  await batch.commit();
};

export const deleteNote = async (userId: string, noteId: string) => {
  const noteSnap = await firestore()
    .doc(`users/${userId}/notes/${noteId}`)
    .get();

  const noteData = noteSnap.data();
  const groupId = noteData?.groupId || null;

  await firestore().doc(`users/${userId}/notes/${noteId}`).delete();

  if (groupId) {
    await updateNoteCount(userId, groupId, -1);
  }
};

//move note to another group
export const moveNoteToGroup = async (
  userId: string,
  noteId: string,
  newGroupId: string | null
) => {
  const noteRef = firestore().doc(`users/${userId}/notes/${noteId}`);
  const noteSnap = await noteRef.get();

  if (!noteSnap.exists) {
    throw new Error("Note không tồn tại");
  }

  const noteData = noteSnap.data();
  const oldGroupId = noteData?.groupId || null;

  console.log("old", oldGroupId);
  console.log("new", newGroupId);

  const batch = firestore().batch();

  if (oldGroupId && oldGroupId !== newGroupId) {
    const oldGroupRef = firestore().doc(`users/${userId}/groups/${oldGroupId}`);
    batch.update(oldGroupRef, {
      noteCount: firestore.FieldValue.increment(-1),
    });
  }

  if (newGroupId && oldGroupId !== newGroupId) {
    const newGroupRef = firestore().doc(`users/${userId}/groups/${newGroupId}`);
    batch.update(newGroupRef, {
      noteCount: firestore.FieldValue.increment(1),
    });
  }

  batch.update(noteRef, {
    groupId: newGroupId,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });

  await batch.commit();
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
