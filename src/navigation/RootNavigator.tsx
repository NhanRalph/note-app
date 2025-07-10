import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";
import CustomBottomTab, {
  TabBarProps,
} from "../components/BottomBar/CustomBottomBar";
import { RootState } from "../redux/rootReducer";
import LoginScreen from "../screens/Auth/LoginScreen";
import SignUpScreen from "../screens/Auth/SignUpScreen";
import DrawScreen from "../screens/DrawScreen/DrawScreen";
import CreateGroup from "../screens/Group/CreateGroup";
import UpdateGroupScreen from "../screens/Group/UpdateGroup";
import HomeScreen from "../screens/Home/HomeScreen";
import CreateNote from "../screens/Note/CreateNote";
import ListNotesScreen from "../screens/Note/ListNotesScreen";
import NoteDetailScreen from "../screens/Note/NoteDetailScreen";
import UpdateNoteScreen from "../screens/Note/UpdateNote";
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

const RootNavigator = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" options={{ headerShown: false }}>
              {() => <CustomBottomTab tabs={userTabBarProps} />}
            </Stack.Screen>
            
            <Stack.Screen name="ListNotesScreen" component={ListNotesScreen} />

            <Stack.Screen name="CreateGroup" component={CreateGroup} />
            <Stack.Screen name="CreateNote" component={CreateNote} />
            <Stack.Screen name="NoteDetail" component={NoteDetailScreen} options={{ headerShown: false }} />

            <Stack.Screen name="UpdateNote" component={UpdateNoteScreen} />
            <Stack.Screen name="UpdateGroup" component={UpdateGroupScreen} />

            <Stack.Screen name="DrawScreen" component={DrawScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
