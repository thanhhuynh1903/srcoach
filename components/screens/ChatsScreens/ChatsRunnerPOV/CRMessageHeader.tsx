import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {theme} from '../../../contants/theme';
import {capitalizeFirstLetter} from '../../../utils/utils_format';
import { CommonAvatar } from '../../../commons/CommonAvatar';

// Types
type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  points: number;
  user_level: string;
  roles: string[];
  image?: {
    url: string;
  };
};

type SessionInfo = {
  id: string;
  status: string;
  other_user: User;
  initiated_by_you: boolean;
  archived_by_you: boolean;
};

export const CRMessageHeader = ({
  sessionInfo,
  navigation,
  onInfoPress,
}: {
  sessionInfo: SessionInfo | null;
  navigation: any;
  onInfoPress: () => void;
}) => {
  if (!sessionInfo) {
    return (
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.colors.primaryDark} />
        </TouchableOpacity>
        <View style={styles.userInfoPlaceholder} />
      </View>
    );
  }

  const isExpert = sessionInfo.other_user.roles.includes('expert');

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color={theme.colors.primaryDark} />
      </TouchableOpacity>

      <View style={styles.userInfo}>
        <CommonAvatar
          mode={isExpert ? 'expert' : 'runner'}
          uri={sessionInfo.other_user.image?.url}
          size={36}
        />
        <View style={styles.userTextContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{sessionInfo.other_user.name}</Text>
            <Text style={styles.username}>@{sessionInfo.other_user.username}</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="trophy" size={14} color={theme.colors.warning} />
              <Text style={styles.statText}>{sessionInfo.other_user.points}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="medal" size={14} color={theme.colors.warning} />
              <Text style={styles.statText}>
                {capitalizeFirstLetter(sessionInfo.other_user.user_level)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.headerRight}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() =>
            navigation.navigate('ChatsSearchSessionMessagesScreen', {
              sessionId: sessionInfo.id,
            })
          }>
          <Icon name="search" size={24} color={theme.colors.primaryDark} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={onInfoPress}>
          <Icon
            name="information-circle"
            size={24}
            color={theme.colors.primaryDark}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
    marginHorizontal: 12,
  },
  userInfoPlaceholder: {
    flex: 1,
    marginHorizontal: 12,
  },
  userTextContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  username: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  statText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 2,
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
});