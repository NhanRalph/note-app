import HomeScreen from "@/src/screens/Home/HomeScreen";
import { Ionicons } from "@expo/vector-icons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import CustomBottomTab, {
  TabBarProps,
} from "../components/BottomBar/CustomBottomBar";
import LoginScreen from "../screens/Auth/LoginScreen";
import SignUpScreen from "../screens/Auth/SignUpScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import { RootStackParamList } from "./types/navigationTypes";
// import NoteDetailScreen from '../screens/Notes/NoteDetailScreen';
// import GroupManagerScreen from '../screens/Groups/GroupManagerScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const userTabBarProps: TabBarProps[] = [
  {
    route: "Home",
    component: HomeScreen,
    tabBarLabel: "Trang chủ",
    tabBarIconProps: {
      iconType: Ionicons,
      iconName: "home",
    },
  },
  {
    route: "Profile",
    component: ProfileScreen,
    tabBarLabel: "Cá nhân",
    tabBarIconProps: {
      iconType: Ionicons,
      iconName: "person",
    },
  },
];

const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Main" options={{ headerShown: false }}>
        {() => <CustomBottomTab tabs={userTabBarProps} />}
      </Stack.Screen>
      {/* <Stack.Screen name="Home" component={HomeScreen} /> */}
      {/* <Stack.Screen name="NoteDetail" component={NoteDetailScreen} />
      <Stack.Screen name="GroupManager" component={GroupManagerScreen} /> */}
      <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="SignUpScreen" component={SignUpScreen} options={{ headerShown: false }}/>
    </Stack.Navigator>
  );
};

export default AppNavigator;
