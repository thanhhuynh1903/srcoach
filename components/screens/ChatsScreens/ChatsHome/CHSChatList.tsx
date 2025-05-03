import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface CHSChatListProps {
  filter: string;
  searchQuery: string;
}

const CHSChatList = ({filter, searchQuery}: CHSChatListProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholderText}>Hello!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  placeholderText: {
    fontSize: 24,
    color: '#64748B',
  },
});

export default CHSChatList;