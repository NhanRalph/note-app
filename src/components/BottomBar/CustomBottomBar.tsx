import Colors from "@/src/constants/Colors";
import { BottomTabParamList } from "@/src/navigation/types/navigationTypes";
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import {
  View
} from "react-native";
const Tab = createBottomTabNavigator<BottomTabParamList>();

export interface TabBarProps {
  route: keyof BottomTabParamList;
  component: React.ComponentType<any>;
  tabBarLabel: string;
  tabBarIconProps: {
    iconType: any;
    iconName: keyof typeof Ionicons.glyphMap;
  };
}

const CustomBottomTab: React.FC<{ tabs: TabBarProps[] }> = ({ tabs }) => {

  return (
      <View style={{ flex: 1 }}>
        <Tab.Navigator
          initialRouteName={tabs[0].route}
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: Colors.primary600,
            tabBarInactiveTintColor: "gray",
            tabBarStyle: {
              borderTopRightRadius: 20,
              borderTopLeftRadius: 20,
              height: 70,
              backgroundColor: "white",
            },
          }}
        >
          {tabs.map((tabProps: TabBarProps, idx) => (
            <Tab.Screen
              key={idx}
              name={tabProps.route}
              component={tabProps.component}
              options={{
                tabBarLabel: tabProps.tabBarLabel,
                tabBarIcon: ({ color, size }) =>
                    <Ionicons
                      name={tabProps.tabBarIconProps.iconName}
                      color={color}
                      size={20}
                    />
                  ,
              }}
            />
          ))}
        </Tab.Navigator>
      </View>
  );
};

export default CustomBottomTab;
