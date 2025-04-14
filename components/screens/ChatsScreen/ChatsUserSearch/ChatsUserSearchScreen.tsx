import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from '@react-native-vector-icons/ionicons';
import ContentLoader, {Rect, Circle} from 'react-content-loader/native';
import {searchUsers, searchExperts} from '../../../utils/useChatsAPI';
import {theme} from '../../../contants/theme';
import { CommonAvatar } from '../../../commons/CommonAvatar';

const RunnerItem = ({item}: {item: any}) => {
  const navigation = useNavigation();
  const statusColor =
    item.status === 'ACCEPTED' || item.status === 'accepted'
      ? '#4CAF50'
      : item.status === 'PENDING' || item.status === 'pending'
      ? '#FFC107'
      : item.status === 'BLOCKED' || item.status === 'blocked'
      ? '#F44336'
      : null;

  const userLevel = item.user_level
    ? item.user_level.charAt(0).toUpperCase() + item.user_level.slice(1)
    : '';

  const onPress = () => {
    if (item.status === null) {
      navigation.navigate('ChatsUserInviRunnerScreen', {userId: item.id});
    }
  };

  return (
    <TouchableOpacity
      style={styles.listItem}
      onPress={onPress}
      disabled={item.status !== null}>
      <View style={styles.listItemContent}>
        <CommonAvatar 
          mode="runner" 
          size={52} 
          uri={item.profile_picture || `https://ui-avatars.com/api/?name=${item.name}&background=random`}
        />

        <View style={styles.textContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.username}>@{item.username}</Text>
          </View>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Icon name="trophy" size={14} color="#FFD700" />
              <Text style={styles.metaText}>{item.points} pts</Text>
            </View>

            {userLevel && (
              <View style={styles.metaItem}>
                <Icon name="star" size={14} color="#FFD700" />
                <Text style={styles.metaText}>{userLevel}</Text>
              </View>
            )}

            {item.status && (
              <View style={styles.metaItem}>
                <Icon name="checkmark-circle" size={14} color={statusColor} />
                <Text style={styles.metaText}>
                  {item.status.charAt(0).toUpperCase() +
                    item.status.slice(1).toLowerCase()}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.rightContainer}>
          {statusColor && (
            <View style={[styles.statusChip, {backgroundColor: statusColor}]}>
              <Text style={styles.statusText}>
                {item.status.charAt(0).toUpperCase() +
                  item.status.slice(1).toLowerCase()}
              </Text>
            </View>
          )}
          {item.archived && (
            <Icon
              name="archive-outline"
              size={18}
              color="#9E9E9E"
              style={styles.archiveIcon}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const ExpertItem = ({item}: {item: any}) => {
  const navigation = useNavigation();
  const statusColor =
    item.status === 'ACCEPTED' || item.status === 'accepted'
      ? '#4CAF50'
      : item.status === 'PENDING' || item.status === 'pending'
      ? '#FFC107'
      : item.status === 'BLOCKED' || item.status === 'blocked'
      ? '#F44336'
      : null;

  const userLevel = item.user_level
    ? item.user_level.charAt(0).toUpperCase() + item.user_level.slice(1)
    : '';

  const onPress = () => {
    if (item.status === null) {
      navigation.navigate('ChatsUserInviExpertScreen', {userId: item.id});
    }
  };

  return (
    <TouchableOpacity
      style={styles.listItem}
      onPress={onPress}
      disabled={item.status !== null}>
      <View style={styles.listItemContent}>
        <CommonAvatar 
          mode="expert" 
          size={52} 
          uri={item.profile_picture || `https://ui-avatars.com/api/?name=${item.name}&background=random`}
        />

        <View style={styles.textContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.username}>@{item.username}</Text>
          </View>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Icon name="trophy" size={14} color="#FFD700" />
              <Text style={styles.metaText}>{item.points} pts</Text>
            </View>

            {userLevel && (
              <View style={styles.metaItem}>
                <Icon name="star" size={14} color="#FFD700" />
                <Text style={styles.metaText}>{userLevel}</Text>
              </View>
            )}

            {item.status && (
              <View style={styles.metaItem}>
                <Icon name="checkmark-circle" size={14} color={statusColor} />
                <Text style={styles.metaText}>
                  {item.status.charAt(0).toUpperCase() +
                    item.status.slice(1).toLowerCase()}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.rightContainer}>
          {statusColor && (
            <View style={[styles.statusChip, {backgroundColor: statusColor}]}>
              <Text style={styles.statusText}>
                {item.status.charAt(0).toUpperCase() +
                  item.status.slice(1).toLowerCase()}
              </Text>
            </View>
          )}
          {item.archived && (
            <Icon
              name="archive-outline"
              size={18}
              color="#9E9E9E"
              style={styles.archiveIcon}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function ChatsUserSearchScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpertSearch, setIsExpertSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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
      const response = isExpertSearch
        ? await searchExperts(searchQuery)
        : await searchUsers(searchQuery);
      if (response.status) {
        setSearchResults(response.data);
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
  }, [searchQuery, isExpertSearch]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    handleSearch();
    setRefreshing(false);
  }, [handleSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) handleSearch();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[...Array(5)].map((_, index) => (
        <ContentLoader
          key={index}
          speed={1}
          width="100%"
          height={80}
          viewBox="0 0 400 80"
          backgroundColor="#f3f3f3"
          foregroundColor="#ecebeb">
          <Circle cx="40" cy="40" r="30" />
          <Rect x="85" y="20" rx="4" ry="4" width="150" height="18" />
          <Rect x="85" y="45" rx="3" ry="3" width="100" height="14" />
          <Rect x="300" y="30" rx="4" ry="4" width="70" height="20" />
        </ContentLoader>
      ))}
    </View>
  );

  const renderItem = ({item}: {item: any}) => {
    if (item.roles.includes('expert')) {
      return <ExpertItem item={item} />;
    }
    return <RunnerItem item={item} />;
  };

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
            placeholder="Search users..."
            placeholderTextColor="#d4d4d4"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setIsExpertSearch(!isExpertSearch)}
            style={styles.trophyButton}>
            <Icon
              name={isExpertSearch ? 'trophy' : 'trophy-outline'}
              size={24}
              color="#FFD700"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Icon name="search" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading && searchResults.length === 0 ? (
        renderSkeleton()
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#1E90FF']}
              tintColor="#1E90FF"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="search-outline" size={50} color="#aaa" />
              <Text style={styles.emptyText}>
                {searchQuery
                  ? 'No results found'
                  : 'Search for users or experts'}
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
  trophyButton: {
    padding: 6,
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
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metaText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusChip: {
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  archiveIcon: {
    marginLeft: 4,
  },
  skeletonContainer: {
    padding: 12,
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