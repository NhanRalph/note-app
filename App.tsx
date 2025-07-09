import firebase from '@react-native-firebase/app';
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from "react-native-toast-message";
import { Provider } from 'react-redux';
import { PersistGate } from "redux-persist/integration/react";
import Colors from './src/constants/Colors';
import { NoteProvider } from './src/context/noteContext';
import RootNavigator from './src/navigation';
import store, { persistor } from './src/redux';


if (!firebase.apps.length) {
  console.log('Firebase chưa được khởi tạo');
} else {
  console.log('✅ Firebase đã được khởi tạo');
}

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <NoteProvider>
            <SafeAreaView style={styles.container}>
              <RootNavigator />
              <Toast />
            </SafeAreaView>
          </NoteProvider>
        </PersistGate>
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

export default App;
