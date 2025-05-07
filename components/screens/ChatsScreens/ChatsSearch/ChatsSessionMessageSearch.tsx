import React, {useState} from 'react';
import {View, StyleSheet, TouchableOpacity, Text, TextInput, FlatList} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import Icon from '@react-native-vector-icons/ionicons';
import {theme} from '../../../contants/theme';
import {CommonAvatar} from '../../../commons/CommonAvatar';
import { searchSessionMessages } from '../../../utils/useChatsAPI';
import BackButton from '../../../BackButton';

interface SearchResult {
  id: string;
  content: string;
  type: string;
  createdAt: string;
  readAt: string | null;
  sender: {
    id: string;
    name: string;
    username: string;
    email: string;
    image: {url: string} | null;
    points: number;
    user_level: string;
    roles: string[];
  };
  sessionId: string;
}

const ChatsSessionMessageSearch = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {sessionId} = route.params as {sessionId: string};
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const response = await searchSessionMessages(searchQuery, sessionId);
      if (response.status && response.data?.results) {
        setSearchResults(response.data.results);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;

    const before = text.substring(0, index);
    const match = text.substring(index, index + query.length);
    const after = text.substring(index + query.length);

    return (
      <Text>
        {before}
        <Text style={{fontWeight: 'bold'}}>{match}</Text>
        {after}
      </Text>
    );
  };

  const renderMessageItem = ({item}: {item: SearchResult}) => {
    const truncatedContent = 
      item.content.length > 100 
        ? `${item.content.substring(0, 100)}...` 
        : item.content;

    return (
      <TouchableOpacity
        style={styles.messageItem}
        onPress={() => navigation.navigate('ChatsMessageScreen', {userId: item.sender.id})}>
        <View style={styles.avatarContainer}>
          <CommonAvatar
            mode={item.sender.roles.includes('expert') ? 'expert' : 'runner'}
            size={40}
            uri={item.sender.image?.url}
          />
        </View>
        <View style={styles.messageContent}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.sender.name}</Text>
            <Text style={styles.username}>@{item.sender.username}</Text>
          </View>
          <Text style={styles.messageText}>
            {highlightMatch(truncatedContent, searchQuery)}
          </Text>
          <Text style={styles.messageTime}>
            {new Date(item.createdAt).toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton size={24} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoFocus
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <Icon name="search" size={24} color={theme.colors.primaryDark} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={searchResults}
        renderItem={renderMessageItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {isSearching ? 'Searching...' : 'No results found'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: "#e3e3e3",
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
    marginLeft: 12,
  },
  searchButton: {
    marginLeft: 12,
  },
  listContainer: {
    paddingBottom: 20,
    backgroundColor: '#ededed',
    flex: 1,
    paddingTop: 10,
  },
  messageItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFF',
    marginHorizontal: 10,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontWeight: '600',
    fontSize: 16,
    color: theme.colors.dark,
    marginRight: 8,
  },
  username: {
    fontSize: 14,
    color: '#646464',
  },
  messageText: {
    fontSize: 15,
    color: theme.colors.dark,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 12,
    color: '#646464',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#646464',
  },
});

export default ChatsSessionMessageSearch;