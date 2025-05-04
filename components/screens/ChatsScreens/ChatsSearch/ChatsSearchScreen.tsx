import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {useTheme} from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  searchUsers,
  searchExperts,
  searchRunners,
  searchAllMessages,
} from '../../../utils/useChatsAPI';
import ToastUtil from '../../../utils/utils_toast';
import BackButton from '../../../BackButton';
import { CommonAvatar } from '../../../commons/CommonAvatar';
import {theme} from '../../../contants/theme';
import { capitalizeFirstLetter } from '../../../utils/utils_format';

type SearchTab = 'all' | 'runners' | 'experts' | 'messages';

interface UserItem {
  id: string;
  name: string;
  username: string;
  image?: {url: string};
  points: number;
  user_level: number;
  roles: string[];
}

interface RouteParams {
  searchQuery?: string;
}

const ChatsSearchScreen = () => {
  const {colors} = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const [searchResults, setSearchResults] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const params = route.params as RouteParams;
    if (params?.searchQuery) {
      setSearchQuery(params.searchQuery);
      setHasSearched(true);
      handleSearch(params.searchQuery);
    }
  }, [route.params]);

  const handleSearch = useCallback(async (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    try {
      let response;
      switch (activeTab) {
        case 'all':
          response = await searchUsers(searchTerm);
          break;
        case 'runners':
          response = await searchRunners(searchTerm);
          break;
        case 'experts':
          response = await searchExperts(searchTerm);
          break;
        case 'messages':
          response = await searchAllMessages(searchTerm);
          break;
      }

      if (response?.status && response.data) {
        setSearchResults(response.data);
        setHasSearched(true);
      } else {
        ToastUtil.error(
          'Search Failed',
          response?.message || 'No results found',
        );
        setHasSearched(true);
      }
    } catch (error) {
      ToastUtil.error('Search Error', 'Failed to perform search');
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, activeTab]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    handleSearch().finally(() => setRefreshing(false));
  }, [handleSearch]);

  const getUserMode = (roles: string[]) => {
    if (roles?.includes('expert')) return 'expert';
    if (roles?.includes('runner')) return 'runner';
    return null;
  };

  const renderUserItem = ({item}: {item: UserItem}) => (
    <TouchableOpacity
      style={[styles.itemContainer, {backgroundColor: '#FFFFFF'}]}
      onPress={() => navigation.navigate('ChatsMessageScreen', {userId: item.id})}>
      <View style={styles.userInfoContainer}>
        <CommonAvatar
          mode={getUserMode(item.roles)}
          uri={item.image?.url}
          size={40}
        />
        <View style={styles.userDetails}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.username}>@{item.username}</Text>
          <View style={styles.userStats}>
            <View style={styles.statItem}>
              <Ionicons name="trophy" size={16} color="#FFD700" />
              <Text style={styles.statText}>{item.points}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="medal" size={16} color="#FFD700" />
              <Text style={styles.statText}>
                {item.user_level === null ? 'Newbie' : `${capitalizeFirstLetter(item.user_level as any)}`}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <Ionicons name="chatbubble" size={24} color={theme.colors.primaryDark} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={[styles.header, {backgroundColor: '#FFFFFF'}]}>
          <BackButton size={24} />
          <TextInput
            style={[
              styles.searchInput,
              {color: '#000000', backgroundColor: '#f3f3f3'},
            ]}
            placeholder="Search..."
            placeholderTextColor="#9E9E9E"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => {
              setHasSearched(true);
              handleSearch();
            }}
          />
          <TouchableOpacity
            style={[styles.searchButton, {backgroundColor: theme.colors.primaryDark}]}
            onPress={() => {
              setHasSearched(true);
              handleSearch();
            }}>
            <Ionicons name="search" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={styles.tabsOuterContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContainer}
          >
            {(['all', 'runners', 'experts', 'messages'] as SearchTab[]).map(tab => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabButton,
                  activeTab === tab && {
                    backgroundColor: theme.colors.primaryDark,
                  },
                ]}
                onPress={() => {
                  setActiveTab(tab);
                  if (hasSearched) {
                    handleSearch();
                  }
                }}>
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab ? {color: 'white'} : {color: '#424242'},
                  ]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Search Results */}
      <View style={styles.contentContainer}>
        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={searchResults}
            renderItem={renderUserItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
              />
            }
            ListEmptyComponent={
              hasSearched ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="search-outline" size={48} color="#9E9E9E" />
                  <Text style={styles.emptyText}>
                    {searchQuery
                      ? 'No results found'
                      : 'Search for users or messages'}
                  </Text>
                </View>
              ) : null
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingTop: 16,
  },
  tabsOuterContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    fontSize: 14,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginRight: 8,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
    paddingTop: 8,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
  },
  username: {
    fontSize: 13,
    color: '#757575',
    marginBottom: 4,
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#616161',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: '#9E9E9E',
  },
});

export default ChatsSearchScreen;