import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(
      email,
      password
    );

    // Lưu user vào Firestore
    await firestore().collection("users").doc(userCredential.user.uid).set({
      email: userCredential.user.email,
      createdAt: new Date(),
    });

    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message || "Đăng ký thất bại");
  }
};

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(
      email,
      password
    );
    console.log("User logged in:", userCredential.user);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message || "Đăng nhập thất bại");
  }
};

export const logout = async () => {
  try {
    await auth().signOut();
  } catch (error: any) {
    throw new Error(error.message || "Đăng xuất thất bại");
  }
};
