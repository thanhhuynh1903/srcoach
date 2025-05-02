import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  SafeAreaView,
  Image,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import Icon from '@react-native-vector-icons/ionicons';
import {getAllMessages} from '../../../utils/useChatsAPI';
import {theme} from '../../../contants/theme';
import {CommonAvatar} from '../../../commons/CommonAvatar';
import {formatTimeAgo} from '../../../utils/utils_format';

const MessageItem = ({item, searchQuery}: {item: any; searchQuery: string}) => {
  const navigation = useNavigation();

  // Function to highlight matching text
  const getHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) return <Text>{text}</Text>;

    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <Text>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <Text key={i} style={{fontWeight: 'bold'}}>
              {part}
            </Text>
          ) : (
            <Text key={i}>{part}</Text>
          ),
        )}
      </Text>
    );
  };

  // Truncate message if too long
  const truncatedMessage =
    item.message.length > 150
      ? `${item.message.substring(0, 150)}...`
      : item.message;

  const onPress = () => {
    navigation.navigate('ChatsRunnerMessageScreen', {
      messageId: item.id,
      sessionId: item.chat_session_id,
    });
  };

  return (
    <TouchableOpacity style={styles.listItem} onPress={onPress}>
      <View style={styles.listItemContent}>
        <CommonAvatar
          mode={item.User.roles.includes('expert') ? 'expert' : 'runner'}
          size={45}
          uri={item?.User?.image?.url}
        />

        <View style={styles.textContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{item.User.name}</Text>
            <Text style={styles.username}>@{item.User.username}</Text>
            <Text style={styles.timeText}>
              {formatTimeAgo(item.created_at)}
            </Text>
          </View>

          <View style={styles.messageContainer}>
            {getHighlightedText(truncatedMessage, searchQuery)}
          </View>
        </View>

        {item.image_url && (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{uri: item.image_url}}
              style={styles.imagePreview}
              resizeMode="cover"
            />
            <Icon
              name="image"
              size={16}
              color="#666"
              style={styles.imageIcon}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function UserSearchAllMessagesScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const {query} = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getAllMessages(searchQuery);
      if (response.status) {
        setSearchResults(response.data.results);
      } else {
        setError(response.message);
        setSearchResults([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to perform search');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  const renderItem = ({item}: {item: any}) => (
    <MessageItem item={item} searchQuery={searchQuery} />
  );

  useEffect(() => {
    if (query) {
      setSearchQuery(query);
      handleSearch();
    }
  }, [query, handleSearch]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search messages..."
            placeholderTextColor="#d4d4d4"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Icon name="search" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading && searchResults.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Icon name="search-outline" size={40} color="#aaa" />
          <Text style={styles.loadingText}>Searching messages...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={40} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="search-outline" size={50} color="#aaa" />
              <Text style={styles.emptyText}>
                {searchQuery
                  ? 'No messages found'
                  : 'Search for messages in all your chats'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryDark,
    paddingVertical: 12,
    paddingHorizontal: 16,
    height: 60,
  },
  backButton: {
    marginRight: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    height: 40,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  searchButton: {
    padding: 6,
  },
  listContainer: {
    padding: 12,
  },
  listItem: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  username: {
    fontSize: 14,
    color: '#888',
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 8,
  },
  messageContainer: {
    marginTop: 4,
  },
  imagePreviewContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
    marginLeft: 8,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imageIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 8,
    padding: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  loadingText: {
    marginTop: 16,
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    color: '#F44336',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  emptyText: {
    marginTop: 16,
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
});
