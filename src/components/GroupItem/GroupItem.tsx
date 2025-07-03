import Colors from '@/src/constants/Colors';
import { StyleSheet, Text, View } from 'react-native';

export default function GroupItem({ group }: { group: { id: string, name: string } }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{group.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  text: {
    color: Colors.primary600,
    fontWeight: 'bold',
  },
});
