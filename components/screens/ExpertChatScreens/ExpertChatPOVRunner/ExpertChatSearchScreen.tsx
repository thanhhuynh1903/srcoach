import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from '@react-native-vector-icons/ionicons';
import {useUserSearchStore} from '../../../utils/useUserSearchStore';
import {theme} from '../../../contants/theme';

interface ExpertItemProps {
  expert: {
    id: string;
    username: string;
    name: string;
    roles: string[];
    points: number;
    user_level: string;
  };
  onPress: () => void;
}

const ExpertItem: React.FC<ExpertItemProps> = ({expert, onPress}) => {
  // Capitalize first letter of user_level
  const formattedUserLevel = expert.user_level
    ? expert.user_level.charAt(0).toUpperCase() + expert.user_level.slice(1)
    : 'Unknown';

  return (
    <TouchableOpacity style={styles.expertItem} onPress={onPress}>
      <View style={styles.expertAvatar}>
        <Icon name="person" size={32} color="#555" />
      </View>
      <View style={styles.expertInfo}>
        <Text style={styles.expertName}>{expert.name || expert.username}</Text>
        <Text style={styles.expertUsername}>@{expert.username}</Text>

        <View style={styles.expertStats}>
          <View style={styles.statItem}>
            <Icon name="star" size={14} color={theme.colors.primary} />
            <Text style={styles.statText}>{formattedUserLevel}</Text>
          </View>

          <View style={styles.statItem}>
            <Icon name="flash" size={14} color={theme.colors.secondary} />
            <Text style={styles.statText}>{expert.points || 0} pts</Text>
          </View>
        </View>
      </View>
      <Icon name="arrow-forward" size={20} color="#999" />
    </TouchableOpacity>
  );
};

const ExpertChatSearchScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const {
    expertsResults,
    isLoadingExperts,
    errorExperts,
    searchExperts,
    clearExpertsResults,
  } = useUserSearchStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim() && isTyping) {
        searchExperts(searchQuery);
      } else if (!searchQuery.trim()) {
        clearExpertsResults();
      }
      setIsTyping(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, isTyping, searchExperts, clearExpertsResults]);

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      searchExperts(searchQuery);
    } else {
      clearExpertsResults();
    }
  }, [searchQuery, searchExperts, clearExpertsResults]);

  const handleExpertPress = (expertId: string) => {
    navigation.navigate('ExpertChatInvitationScreen', {expertId});
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find an Expert</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search experts..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={text => {
            setSearchQuery(text);
            setIsTyping(true);
          }}
          onSubmitEditing={handleSearch}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {searchQuery ? (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              clearExpertsResults();
            }}
            style={styles.clearButton}>
            <Icon name="close" size={20} color="#999" />
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <Icon name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {isLoadingExperts ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
          </View>
        ) : errorExperts ? (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle-outline" size={48} color="#ff4444" />
            <Text style={styles.errorText}>{errorExperts}</Text>
          </View>
        ) : expertsResults.length === 0 && searchQuery ? (
          <View style={styles.emptyContainer}>
            <Icon name="alert-circle-outline" size={48} color="#999" />
            <Text style={styles.emptyText}>No experts found</Text>
            <Text style={styles.emptySubText}>Try a different search term</Text>
          </View>
        ) : expertsResults.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="search" size={48} color="#999" />
            <Text style={styles.emptyText}>Search for experts</Text>
            <Text style={styles.emptySubText}>
              Enter a name or username above
            </Text>
          </View>
        ) : (
          <FlatList
            data={expertsResults}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <ExpertItem
                expert={item}
                onPress={() => handleExpertPress(item.id)}
              />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
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
    justifyContent: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 3,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerRightPlaceholder: {
    width: 32,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 8,
    marginLeft: 8,
  },
  searchButton: {
    marginLeft: 8,
    padding: 8,
    backgroundColor: theme.colors.primaryDark,
    borderRadius: 20,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },
  listContent: {
    paddingBottom: 16,
  },
  expertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  expertAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginHorizontal: 16,
  },
  expertStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  expertInfo: {
    flex: 1,
    paddingRight: 8,
  },
  expertName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  expertUsername: {
    fontSize: 13,
    color: '#454545',
    marginTop: 2,
  },
});

export default ExpertChatSearchScreen;
