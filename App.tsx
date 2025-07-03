import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import Colors from './src/constants/Colors';
import RootNavigator from './src/navigation';
import store from './src/redux';

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        {/* Bạn có thể bọc SafeAreaView ở đây nếu thực sự cần */}
        <SafeAreaView style={styles.container}>
          <RootNavigator />
        </SafeAreaView>
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
