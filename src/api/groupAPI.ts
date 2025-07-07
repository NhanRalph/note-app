import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";

export interface GroupType {
  id: string;
  name: string;
  noteCount: number;
  createdAt: FirebaseFirestoreTypes.Timestamp | string;
}

export const getNoteStats = async (userId: string) => {
  const notesRef = firestore().collection(`users/${userId}/notes`);

  const [allSnap, pinnedSnap, lockedSnap] = await Promise.all([
    notesRef.get(),
    notesRef.where("pinned", "==", true).get(),
    notesRef.where("locked", "==", true).get(),
  ]);

  return {
    all: allSnap.size,
    pinned: pinnedSnap.size,
    locked: lockedSnap.size,
  };
};

export const getGroups = async (
  userId: string,
  pageSize: number,
  lastCreatedAt: string | null
): Promise<{
  groups: GroupType[];
  lastCreatedAt: string | null;
}> => {
  let query = firestore()
    .collection("users")
    .doc(userId)
    .collection("groups")
    .orderBy("createdAt", "desc")
    .limit(pageSize);

  if (lastCreatedAt) {
    query = query.startAfter(new Date(lastCreatedAt));
  }

  const snapshot = await query.get();

  const groups = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      noteCount: data.noteCount || 0,
      createdAt:
        data.createdAt?.toDate().toISOString() || new Date().toISOString(),
    };
  });

  const lastGroup = groups[groups.length - 1] || null;
  const lastCreatedAtResult = lastGroup?.createdAt || null;

  return { groups, lastCreatedAt: lastCreatedAtResult };
};

export const createGroup = async (userId: string, name: string) => {
  const groupRef = firestore().collection(`users/${userId}/groups`).doc();
  await groupRef.set({
    name,
    noteCount: 0,
    createdAt: firestore.FieldValue.serverTimestamp(),
  });

  return {
    id: groupRef.id,
    name,
    noteCount: 0,
    createdAt: new Date().toISOString(),
  };
};

export const updateGroup = async (
  userId: string,
  groupId: string,
  name: string
) => {
  await firestore().doc(`users/${userId}/groups/${groupId}`).update({ name });
};

export const deleteGroup = async (userId: string, groupId: string) => {
  await firestore().doc(`users/${userId}/groups/${groupId}`).delete();

  const notesSnap = await firestore()
    .collection(`users/${userId}/notes`)
    .where("groupId", "==", groupId)
    .get();

  const batch = firestore().batch();
  notesSnap.forEach((doc) => {
    batch.update(doc.ref, { groupId: null });
  });
  await batch.commit();
};
