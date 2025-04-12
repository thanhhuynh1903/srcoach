import {StyleSheet, Text, TextInput, View} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { theme } from '../../contants/theme';
import { useLoginStore } from '../../utils/useLoginStore';

export default function ChatsScreen() {

  const {profile} = useLoginStore();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="chatbubble-ellipses" size={24} color={theme.colors.primaryDark} />
          <Text style={styles.headerTitle}>Chats</Text>
        </View>
        <View style={styles.headerRight}>
          <Icon
            name="search-outline"
            size={24}
            color={theme.colors.primaryDark}
            style={styles.headerIcon}
          />
          <Icon
            name="notifications-outline"
            size={24}
            color={theme.colors.primaryDark}
            style={styles.headerIcon}
          />
          <Icon
            name="trophy-outline"
            size={24}
            color={theme.colors.primaryDark}
            style={styles.headerIcon}
          />
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon
          name="search"
          size={20}
          color="#8E8E93"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for user or chat"
          placeholderTextColor="#8E8E93"
        />
        <Icon
          name="options"
          size={20}
          color="#007AFF"
          style={styles.searchButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEFF4', // Light gray background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 10,
    color: '#000',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: 20,
    color: theme.colors.primaryDark,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  searchIcon: {
    marginRight: 8,
    color: theme.colors.primaryDark,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  searchButton: {
    marginLeft: 8,
  },
});
