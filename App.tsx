import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import Colors from './src/constants/Colors';
import RootNavigator from './src/navigation';
import store from './src/redux';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Provider store={store}>
        <RootNavigator />
      </Provider>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    backgroundColor: Colors.background, // Quy chuẩn màu nền toàn app
  },
});

export default App;
