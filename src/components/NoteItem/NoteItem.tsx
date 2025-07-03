import Colors from '@/src/constants/Colors';
import { useNavigation } from '@/src/hook/useNavigation';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NoteItem({ note, viewMode }: { note: any, viewMode: 'list' | 'grid' }) {
  const navigation = useNavigation();
  // Handle note click
  const handleNoteClick = () => {
    // Navigate to note detail screen
    navigation.navigate('NoteDetail', { note });
  };

  return (
    <TouchableOpacity style={[styles.container, viewMode === 'grid' && { width: '48%' }]} onPress={handleNoteClick}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.title}>{note.title}</Text>
        {note.locked && <Ionicons name="lock-closed" size={16} color="gray" />}
        {note.pinned && <Ionicons name="star" size={16} color="gold" />}
      </View>
      <Text numberOfLines={2} style={styles.content}>{note.content}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary50,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    marginRight: '2%',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  content: {
    color: '#555',
  },
});
