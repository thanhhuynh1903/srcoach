import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { theme } from '../../../contants/theme';
import {useNavigation} from '@react-navigation/native';

export const ChatsHeader = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Icon name="chatbubble-ellipses" size={24} color={theme.colors.primaryDark} />
        <Text style={styles.headerTitle}>Chats</Text>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity onPress={() => navigation.navigate('ChatsUserSearchScreen' as never)}>
          <Icon name="person-add-outline" size={24} color={theme.colors.primaryDark} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('ManageNotificationsScreen' as never)}>
          <Icon name="notifications-outline" size={24} color={theme.colors.primaryDark} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('LeaderBoardScreen' as never)}>
          <Icon name="trophy-outline" size={24} color={theme.colors.primaryDark} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 10,
    color: '#000',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
});