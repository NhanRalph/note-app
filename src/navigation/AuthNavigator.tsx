// import LoginScreen from '@/screens/Auth/LoginScreen';
import LoginScreen from '@/src/screens/Auth/LoginScreen';
import SignUpScreen from '@/src/screens/Auth/SignUpScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </>
  );
};

export default AuthNavigator;
