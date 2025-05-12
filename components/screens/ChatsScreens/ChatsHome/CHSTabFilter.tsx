import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { theme } from '../../../contants/theme';

interface CHSTabFilterProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const filters = ['All', 'Accepted', 'Pending'];

const CHSTabFilter = ({ activeFilter, onFilterChange }: CHSTabFilterProps) => {
  const getFilterIcon = (filter: string) => {
    switch (filter) {
      case 'Accepted':
        return 'checkmark-circle';
      case 'Pending':
        return 'time';
      default:
        return 'chatbubbles';
    }
  };

  const getFilterColor = (filter: string) => {
    switch (filter) {
      case 'Accepted':
        return theme.colors.success;
      case 'Pending':
        return theme.colors.warning;
      default:
        return theme.colors.primaryDark;
    }
  };

  return (
    <View style={styles.filtersWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}>
        {filters.map(filter => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              activeFilter === filter && styles.filterTabActive,
              filter === 'Accepted' && styles.acceptedFilter,
              filter === 'Pending' && styles.pendingFilter,
              activeFilter === filter &&
                filter === 'Accepted' &&
                styles.acceptedFilterActive,
              activeFilter === filter &&
                filter === 'Pending' &&
                styles.pendingFilterActive,
              activeFilter === filter &&
                filter === 'All' &&
                styles.allFilterActive,
            ]}
            onPress={() => onFilterChange(filter)}>
            <Icon
              name={getFilterIcon(filter)}
              size={16}
              color={
                activeFilter === filter
                  ? '#FFFFFF'
                  : getFilterColor(filter)
              }
              style={styles.filterIcon}
            />
            <Text
              style={[
                styles.filterText,
                activeFilter === filter && styles.filterTextActive,
              ]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  filtersWrapper: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    gap: 12,
    flexDirection: 'row',
  },
  filterTab: {
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 80,
  },
  filterTabActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  acceptedFilter: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  pendingFilter: {
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
  },
  allFilterActive: {
    backgroundColor: theme.colors.primaryDark,
    shadowColor: theme.colors.primaryDark,
  },
  acceptedFilterActive: {
    backgroundColor: theme.colors.success,
    shadowColor: theme.colors.success,
  },
  pendingFilterActive: {
    backgroundColor: theme.colors.warning,
    shadowColor: theme.colors.warning,
  },
  filterIcon: {
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default CHSTabFilter;