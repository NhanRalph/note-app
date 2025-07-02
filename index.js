import { registerRootComponent } from "expo";
import App from "./App";

import { GoogleSignin } from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
  webClientId:
    "529456653714-rpvugao17vs3fhkn4saqlallkhg5eqca.apps.googleusercontent.com",
});

registerRootComponent(App);
