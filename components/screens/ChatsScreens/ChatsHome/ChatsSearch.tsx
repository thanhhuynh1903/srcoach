import React, {useState} from 'react';
import {View, TextInput, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {theme} from '../../../contants/theme';
import {useNavigation} from '@react-navigation/native';

export const ChatsSearch = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={styles.searchContainer}>
      <Icon name="search" size={20} color="#64748B" />
      <TextInput
        style={styles.searchInput}
        placeholder="Search chats..."
        placeholderTextColor="#64748B"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <TouchableOpacity
        onPress={() => searchQuery && navigation.navigate('ChatsSearchAllMessagesScreen' as never, {
          query: searchQuery,
        })}
        style={styles.searchButton}>
        <Icon name="search-outline" size={20} color={'#FFF'} />
      </TouchableOpacity>
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
    padding: 7,
    backgroundColor: theme.colors.primaryDark,
    borderRadius: 10,
  },
});