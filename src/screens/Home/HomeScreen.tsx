// import { RootState } from '@/src/redux';
// import { logout } from '@/src/redux/slices/userSlice';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const HomeScreen = () => {
  // const user = useSelector((state: RootState) => state.user.user);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome {'Guest'}</Text>
      {/* <Button title="Logout" onPress={() => dispatch(logout())} /> */}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 20 },
});
