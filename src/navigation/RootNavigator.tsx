import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import AppNavigator from './AppNavigator';

const RootNavigator = () => {
  // const user = useSelector((state: RootState) => state.user);

  return (
    <NavigationContainer>
      {/* {user ? <AppNavigator /> : <AuthNavigator />} */}
      <AppNavigator />
    </NavigationContainer>
  );
};

export default RootNavigator;
