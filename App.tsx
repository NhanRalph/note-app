import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from "react-native-toast-message";
import { Provider } from 'react-redux';
import { PersistGate } from "redux-persist/integration/react";
import Colors from './src/constants/Colors';
import RootNavigator from './src/navigation';
import store, { persistor } from './src/redux';

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {/* Bạn có thể bọc SafeAreaView ở đây nếu thực sự cần */}
        <SafeAreaView style={styles.container}>
          <RootNavigator />
          <Toast />
        </SafeAreaView>
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
