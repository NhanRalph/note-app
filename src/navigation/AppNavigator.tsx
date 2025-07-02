import HomeScreen from "@/src/screens/Home/HomeScreen";
import { Ionicons } from "@expo/vector-icons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import CustomBottomTab, {
  TabBarProps,
} from "../components/BottomBar/CustomBottomBar";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import { RootStackParamList } from "./types/navigationTypes";

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
    <>
      <Stack.Screen name="Main" options={{ headerShown: false }}>
        {() => <CustomBottomTab tabs={userTabBarProps} />}
      </Stack.Screen>
    </>
  );
};

export default AppNavigator;
