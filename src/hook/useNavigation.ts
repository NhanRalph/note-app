import {
  NavigationProp,
  RouteProp,
  useNavigation as useNativeNavigation,
  useRoute as useNativeRoute,
} from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types/navigationTypes";

export const useNavigation = () =>
  useNativeNavigation<NavigationProp<RootStackParamList>>();

export const useRoute = <T extends keyof RootStackParamList>() =>
  useNativeRoute<RouteProp<RootStackParamList, T>>();
