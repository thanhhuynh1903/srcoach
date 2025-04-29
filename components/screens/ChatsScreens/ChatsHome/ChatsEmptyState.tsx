import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';

export const ChatsEmptyState = () => {
  return (
    <View style={styles.emptyState}>
      <Icon name="search-outline" size={48} color="#CBD5E1" />
      <Text style={styles.emptyStateTitle}>No results found</Text>
      <Text style={styles.emptyStateDescription}>
        Try adjusting your search or filter to find what you're looking for
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
});