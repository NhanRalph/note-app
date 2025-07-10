// screens/DrawScreen.tsx
import { DrawOnImage } from "@/src/components/DrawOnImage/DrawOnImage";
import { RootStackParamList } from "@/src/navigation/types/navigationTypes";
import { RouteProp } from "@react-navigation/native";
import React from "react";
import { ActivityIndicator, View } from "react-native";


interface DrawScreenProps {
  route: RouteProp<RootStackParamList, "DrawScreen">;
}

const DrawScreen: React.FC<DrawScreenProps> = ({ route }) => {
  const { imageUri, onSave } = route.params;
  const [ loading, setLoading ] = React.useState(false);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="gray" /> 
      </View>
    );
  }

  return <DrawOnImage imageUri={imageUri} onSave={onSave} setLoading={setLoading} />;
};

export default DrawScreen;