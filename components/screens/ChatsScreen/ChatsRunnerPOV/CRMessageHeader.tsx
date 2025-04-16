// CRMessageHeader.tsx
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {theme} from '../../../contants/theme';
import {capitalizeFirstLetter} from '../../../utils/utils_format';

// Types
type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  points: number;
  user_level: string;
  roles: string[];
};

type SessionInfo = {
  id: string;
  status: string;
  other_user: User;
  initiated_by_you: boolean;
  archived_by_you: boolean;
};

const RoleBadge = ({roles}: {roles: string[]}) => {
  const isExpert = roles.includes('expert');
  const isRunner = roles.includes('runner') && !isExpert;

  if (isExpert) {
    return (
      <View style={[styles.roleBadge, styles.expertBadge]}>
        <Icon name="trophy" size={12} color="white" />
      </View>
    );
  }

  if (isRunner) {
    return (
      <View style={[styles.roleBadge, styles.runnerBadge]}>
        <Icon name="footsteps" size={12} color="white" />
      </View>
    );
  }

  return null;
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

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color={theme.colors.primaryDark} />
      </TouchableOpacity>

      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
            <Icon name="person" size={20} color="white" />
          </View>
          <RoleBadge roles={sessionInfo.other_user.roles} />
        </View>
        <View style={styles.userTextContainer}>
          <Text style={styles.userName}>{sessionInfo.other_user.name}</Text>
          <View style={styles.userMeta}>
            <Text style={styles.username}>
              @{sessionInfo.other_user.username}
            </Text>
            <View style={styles.userPoints}>
              <Icon name="trophy" size={14} color="#FFD700" />
              <Text style={styles.pointsText}>
                {sessionInfo.other_user.points}
              </Text>
            </View>
            <View style={styles.userLevel}>
              <Icon name="star" size={14} color="#FFD700" />
              <Text style={styles.levelText}>
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
          }
        >
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
    marginHorizontal: 12,
  },
  userInfoPlaceholder: {
    flex: 1,
    marginHorizontal: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 8,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  runnerBadge: {
    backgroundColor: theme.colors.success,
  },
  expertBadge: {
    backgroundColor: theme.colors.warning,
  },
  userTextContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  username: {
    fontSize: 12,
    color: '#8E8E93',
    marginRight: 8,
  },
  userPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  pointsText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 2,
  },
  userLevel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelText: {
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
