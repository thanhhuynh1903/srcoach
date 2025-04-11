import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from '@react-native-vector-icons/ionicons';
import useChatsAPI from '../../utils/useChatsAPI';

type User = {
  id: string;
  name?: string;
  username?: string;
  email?: string;
  is_expert?: boolean;
  session_status: 'PENDING' | 'ACCEPTED' | null;
};

const ExpertChatSearchUser = () => {
  const navigation = useNavigation();
  const { searchUsers, searchExperts } = useChatsAPI();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingExperts, setIsSearchingExperts] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = isSearchingExperts
        ? await searchExperts(searchQuery)
        : await searchUsers(searchQuery);

      if (response.status) {
        setSearchResults(response.data || []);
      } else {
        setError(response.message);
        setSearchResults([]);
      }
    } catch (err) {
      setError('Failed to perform search');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserPress = (userId: string) => {
    navigation.navigate('ExpertChatInvitationScreen', { userId });
  };

  const toggleSearchType = () => {
    setIsSearchingExperts(!isSearchingExperts);
    if (searchQuery) {
      handleSearch();
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, isSearchingExperts]);

  const renderItem = ({ item }: { item: User }) => {
    const isDisabled = item.session_status === 'PENDING' || item.session_status === 'ACCEPTED';
    
    return (
      <TouchableOpacity
        style={[styles.userItem, isDisabled && styles.disabledItem]}
        onPress={() => !isDisabled && handleUserPress(item.id)}
        disabled={isDisabled}
      >
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name || item.username}</Text>
          <Text style={styles.userUsername}>@{item.username}</Text>
          {item.is_expert && (
            <View style={styles.expertBadge}>
              <Text style={styles.expertText}>Expert</Text>
            </View>
          )}
        </View>
        {isDisabled && (
          <Text style={styles.statusText}>
            {item.session_status === 'PENDING' ? 'Request Pending' : 'Already Connected'}
          </Text>
        )}
        <Icon name="chevron-forward" size={20} color="#888" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={isSearchingExperts ? "Search experts..." : "Search users..."}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          <TouchableOpacity onPress={toggleSearchType} style={styles.searchTypeButton}>
            <Icon 
              name={isSearchingExperts ? "star" : "star-outline"} 
              size={24} 
              color="#FFD700" 
            />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No results found' : 'Start typing to search'}
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    padding: 0,
  },
  searchTypeButton: {
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  disabledItem: {
    opacity: 0.6,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userUsername: {
    fontSize: 14,
    color: '#888',
  },
  expertBadge: {
    backgroundColor: '#FFD700',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  expertText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  statusText: {
    color: '#888',
    marginRight: 10,
    fontStyle: 'italic',
  },
});

export default ExpertChatSearchUser;