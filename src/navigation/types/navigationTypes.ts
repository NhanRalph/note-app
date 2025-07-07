import { NoteType } from "@/src/api/noteAPI";

export type RootStackParamList = {
  Main: {
    screen: keyof BottomTabParamList;
  };
  HomeScreen: undefined;
  LoginScreen: undefined;
  SignUpScreen: undefined;
  CreateGroup: { userId: string };
  CreateNote: { userId: string; groupId: string };
  ListNotesScreen: { userId: string; groupId: string };
  NoteDetail: { note: NoteType };
  UpdateNote: { note: NoteType };
  UpdateGroup: { userId: string; groupId: string; name: string };
};

export type BottomTabParamList = {
  Notifications: undefined;
  Home: undefined;
  Orders: undefined;
  Profile: undefined;
  Campaign: undefined;
  Blogs: undefined;
  Products: undefined;
  Cart: undefined;
};
