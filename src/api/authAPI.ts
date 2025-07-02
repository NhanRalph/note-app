import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(
      email,
      password
    );

    // Lưu Firestore
    try {
      await firestore().collection("users").doc(userCredential.user.uid).set({
        email: userCredential.user.email,
        createdAt: new Date(),
      });
    } catch (firestoreError: any) {
      console.log("Lỗi khi lưu Firestore:", firestoreError.message);
    }

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

export const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const { idToken } = await GoogleSignin.getTokens();

    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    const userCredential = await auth().signInWithCredential(googleCredential);

    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message || "Đăng nhập Google thất bại");
  }
};

export const logout = async () => {
  try {
    await auth().signOut();
  } catch (error: any) {
    throw new Error(error.message || "Đăng xuất thất bại");
  }
};
