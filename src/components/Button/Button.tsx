import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  size?: 'large' | 'medium' | 'small';
  color?: string;
  loading?: boolean;
  disabled?: boolean;
}

export default function Button({
  title,
  onPress,
  size = 'small',
  color = '#007bff',
  loading = false,
  disabled
}: ButtonProps) {
  let widthStyle = {};

  if (size === 'large') {
    widthStyle = { width: '100%' };
  } else if (size === 'medium') {
    widthStyle = { width: '50%' };
  } // small thì không cần set width

  return (
    <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    disabled={loading || disabled} // Khi loading thì disable luôn button
      style={[styles.button, { backgroundColor: color, 
        opacity: loading || disabled ? 0.6 : 1
       }, widthStyle]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 8,
    alignSelf: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
