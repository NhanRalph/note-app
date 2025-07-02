export type RootStackParamList = {
  Main: {
    screen: keyof BottomTabParamList;
  };
  HomeScreen: undefined;
  LoginScreen: undefined;
  SignUpScreen: undefined;
  WelcomeScreen: undefined;
  ResultScreen: { date: string };
  AuthLoadingScreen: undefined;
  SearchResults: { query: string };
  PackageDetail: { id: string };
  CartScreen: undefined;
  ProfileScreen: undefined;
  OrderScreen: undefined;
  OrderDetail: { orderId: string };
  OrderForm: undefined;
  OrderResult: { orderData: string } | { vnpayData: string };
  AddressScreen: undefined;
  AddAddressScreen: undefined;
  FilterResults: { brandName: string };
  EditProfileScreen: undefined;
  ChangePasswordScreen: undefined;
  ListFavoriteBlogScreen: undefined;
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
