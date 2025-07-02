import { StyleSheet, Text, View } from 'react-native';

interface UserInfoRowProps {
  label: string;
  value: string;
}

export default function UserInfoRow({ label, value }: UserInfoRowProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    width: 100,
  },
  value: {
    flex: 1,
    fontSize: 16,
  },
});
