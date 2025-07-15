import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";

export interface GroupType {
  id: string;
  name: string;
  noteCount: number;
  createdAt: FirebaseFirestoreTypes.Timestamp | string;
  order: number;
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
  lastOrder: number | null
): Promise<{
  groups: GroupType[];
  lastOrder: number | null;
}> => {
  let query = firestore()
    .collection("users")
    .doc(userId)
    .collection("groups")
    .orderBy("order", "asc")
    .limit(pageSize);

  if (lastOrder !== null) {
    query = query.startAfter(lastOrder);
    console.log("Starting after order:", lastOrder);
  }

  const snapshot = await query.get();

  const groups = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      noteCount: data.noteCount || 0,
      order: data.order || 0,
      createdAt: new Date().toISOString() || new Date().toISOString(),
    };
  });

  const lastGroup = groups[groups.length - 1] || null;
  const lastOrderResult = lastGroup?.order ?? null;

  return { groups, lastOrder: lastOrderResult };
};

export const createGroup = async (userId: string, name: string) => {
  const groupsSnap = await firestore()
    .collection(`users/${userId}/groups`)
    .orderBy("order", "desc")
    .limit(1)
    .get();

  const maxOrder = groupsSnap.empty
    ? 0
    : (groupsSnap.docs[0].data().order || 0) + 1;

  const groupRef = firestore().collection(`users/${userId}/groups`).doc();
  await groupRef.set({
    name,
    noteCount: 0,
    order: maxOrder,
    createdAt: firestore.FieldValue.serverTimestamp(),
  });

  return {
    id: groupRef.id,
    name,
    noteCount: 0,
    order: maxOrder,
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
  const groupRef = firestore().doc(`users/${userId}/groups/${groupId}`);
  const notesRef = firestore()
    .collection(`users/${userId}/notes`)
    .where("groupId", "==", groupId);

  const batch = firestore().batch();
  batch.delete(groupRef);

  const notesSnap = await notesRef.get();
  notesSnap.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
};

export const getGroupNoteStats = async (
  userId: string,
  groupId: string
): Promise<{
  all: number;
  pinned: number;
  locked: number;
}> => {
  const notesRef = firestore()
    .collection(`users/${userId}/notes`)
    .where("groupId", "==", groupId);

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

export const updateGroupOrder = async (userId: string, groups: GroupType[]) => {
  const batch = firestore().batch();

  groups.forEach((group, index) => {
    const ref = firestore().doc(`users/${userId}/groups/${group.id}`);
    batch.update(ref, { order: index });
  });

  await batch.commit();
};
