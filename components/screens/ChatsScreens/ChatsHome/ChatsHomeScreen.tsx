import React, {useState} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import { theme } from '../../../contants/theme';
import CHSHeader from './CHSHeader';
import CHSSearch from './CHSSearch';
import CHSTabFilter from './CHSTabFilter';
import CHSChatList from './CHSChatList';

const ChatsHomeScreen = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleSearch = () => {
    // Navigation to search screen will be handled in CHSSearch component
  };

  return (
    <View style={styles.container}>
      <CHSHeader />
      <CHSSearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
      />
      <CHSTabFilter
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />
      <ScrollView style={styles.content}>
        <CHSChatList filter={activeFilter} searchQuery={searchQuery} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

export default ChatsHomeScreen;