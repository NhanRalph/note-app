import firebase from "@react-native-firebase/app";
import firestore from "@react-native-firebase/firestore";
import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import { LogBox, SafeAreaView, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import Colors from "./src/constants/Colors";
import { NoteProvider } from "./src/context/noteContext";
import withSyncLoading from "./src/hoc/withSyncLoading";
import i18n from "./src/i18n/i18n";
import RootNavigator from "./src/navigation";
import store, { persistor } from "./src/redux";

if (!firebase.apps.length) {
  console.log("Firebase chưa được khởi tạo");
} else {
  console.log("✅ Firebase đã được khởi tạo");
}

const AppContent = () => {
  useEffect(() => {
    // Bật persistence mode
    firestore()
      .settings({
        persistence: true,
      })
      .then(() => {
        console.log("🔥 Firestore offline persistence enabled");
      })
      .catch((error) => {
        console.log("❌ Firestore settings error", error);
      });

    // Ẩn warning nếu có
    LogBox.ignoreLogs(["Setting a timer"]);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <PersistGate loading={null} persistor={persistor}>
            <NoteProvider>
              <SafeAreaView style={styles.container}>
                <RootNavigator />
                <Toast />
              </SafeAreaView>
            </NoteProvider>
          </PersistGate>
        </I18nextProvider>
      </Provider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    backgroundColor: Colors.background,
  },
});

// Wrap AppContent với HOC
const App = withSyncLoading(AppContent);

export default withSyncLoading(AppContent);
