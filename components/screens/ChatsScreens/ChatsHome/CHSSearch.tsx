import React from 'react';
import {View, TextInput, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {useNavigation} from '@react-navigation/native';
import { theme } from '../../../contants/theme';

interface CHSSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
}

const CHSSearch = ({searchQuery, setSearchQuery, onSearch}: CHSSearchProps) => {
  const navigation = useNavigation();

  const handleSearchPress = () => {
    if (searchQuery.trim()) {
      navigation.navigate('ChatsSearchScreen' as never, {
        searchQuery: searchQuery.trim(),
      } as never);
    }
  };

  return (
    <View style={styles.searchContainer}>
      <Icon name="search" size={20} color="#64748B" />
      <TextInput
        style={styles.searchInput}
        placeholder="Search chats or users"
        placeholderTextColor="#64748B"
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearchPress}
      />
      {searchQuery && (
        <TouchableOpacity
          style={styles.searchActionButton}
          onPress={handleSearchPress}>
          <Icon name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    gap: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    paddingVertical: 0,
  },
  searchButton: {
    backgroundColor: theme.colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchActionButton: {
    backgroundColor: theme.colors.primaryDark,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CHSSearch;