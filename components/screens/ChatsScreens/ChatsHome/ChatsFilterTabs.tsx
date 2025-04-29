import React from 'react';
import {View, ScrollView, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {theme} from '../../../contants/theme';
import Icon from '@react-native-vector-icons/ionicons';

interface ChatsFilterTabsProps {
  activeFilter: 'ALL' | 'ACCEPTED' | 'PENDING' | 'BLOCKED';
  setActiveFilter: (filter: 'ALL' | 'ACCEPTED' | 'PENDING' | 'BLOCKED') => void;
}

export const ChatsFilterTabs = ({activeFilter, setActiveFilter}: ChatsFilterTabsProps) => {
  // Define tab configurations with icons
  const tabs = [
    {
      id: 'ALL',
      label: 'All',
      icon: 'chatbubbles',
      inactiveColor: '#64748B', // gray
      activeColor: '#FFFFFF', // white
      bgInactive: '#F1F5F9',
      bgActive: theme.colors.primaryDark,
    },
    {
      id: 'ACCEPTED',
      label: 'Accepted',
      icon: 'checkmark-circle',
      inactiveColor: '#64748B', // gray
      activeColor: '#FFFFFF', // white
      bgInactive: 'rgba(34, 197, 94, 0.1)',
      bgActive: theme.colors.success,
    },
    {
      id: 'PENDING',
      label: 'Pending',
      icon: 'time',
      inactiveColor: '#64748B', // gray
      activeColor: '#FFFFFF', // white
      bgInactive: 'rgba(249, 115, 22, 0.1)',
      bgActive: theme.colors.warning,
    },
    {
      id: 'BLOCKED',
      label: 'Blocked',
      icon: 'ban',
      inactiveColor: '#64748B', // gray
      activeColor: '#FFFFFF', // white
      bgInactive: 'rgba(239, 68, 68, 0.1)',
      bgActive: theme.colors.error,
    },
  ];

  return (
    <View style={styles.filtersWrapper}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.filtersContainer}
      >
        {tabs.map(tab => {
          const isActive = activeFilter === tab.id;
          const iconColor = isActive ? tab.activeColor : tab.inactiveColor;
          const textColor = isActive ? '#FFFFFF' : '#64748B';
          const backgroundColor = isActive ? tab.bgActive : tab.bgInactive;

          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.filterTab,
                {backgroundColor},
                isActive && styles.filterTabActive,
              ]}
              onPress={() => setActiveFilter(tab.id as 'ALL' | 'ACCEPTED' | 'PENDING' | 'BLOCKED')}
            >
              <Icon 
                name={tab.icon} 
                size={16} 
                color={iconColor} 
                style={styles.filterIcon}
              />
              <Text style={[
                styles.filterText, 
                isActive && styles.filterTextActive,
                {color: textColor}
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
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
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 80,
  },
  filterTabActive: {
    shadowColor: theme.colors.primaryDark,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    fontWeight: '600',
  },
  filterIcon: {
    marginRight: 6,
  },
});