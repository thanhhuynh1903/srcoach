import React from 'react';
import {View, StyleSheet, TouchableOpacity, Text, TouchableWithoutFeedback} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {theme} from '../../../contants/theme';
import {CommonAvatar} from '../../../commons/CommonAvatar';
import { capitalizeFirstLetter } from '../../../utils/utils_format';

interface ChatListItemProps {
  session: {
    id: string;
    status: string;
    created_at: string;
    is_expert_session: boolean;
    expert_rating_allowed: boolean;
    user_archived: boolean;
    is_initiator: boolean;
    other_user: {
      id: string;
      name: string;
      username: string;
      email: string;
      image: {url: string} | null;
      points: number;
      user_level: string;
      roles: string[];
    };
    last_message: {
      id: string;
      message_type: string;
      created_at: string;
      archived: boolean;
      content: any;
    } | null;
    unread_count: number;
  };
  onPress: () => void;
  onAccept: () => void;
  onDeny: () => void;
}

export const CHSChatList = ({session, onPress, onAccept, onDeny}: ChatListItemProps) => {
  const getStatusColor = () => {
    switch (session.status) {
      case 'ACCEPTED':
        return theme.colors.success;
      case 'PENDING':
        return theme.colors.warning;
      default:
        return 'transparent';
    }
  };

  const getMessagePreview = () => {
    if (!session.last_message) return 'No messages yet';
    if (session.last_message.archived) return 'Archived message';

    switch (session.last_message.message_type) {
      case 'NORMAL':
        return session.last_message.content || 'Message';
      case 'PROFILE':
        return 'Profile information shared';
      case 'EXERCISE_RECORD':
        return 'Exercise record shared';
      case 'EXPERT_RECOMMENDATION':
        return 'Expert recommendation';
      case 'IMAGE':
        return 'Image';
      default:
        return 'New message';
    }
  };

  const getUserRole = () => {
    return session.other_user.roles.includes('EXPERT') ? 'expert' : 'runner';
  };

  const showActionButtons = session.status === 'PENDING' && !session.is_initiator;

  return (
    <View style={[
      styles.chatItemContainer,
      {borderLeftWidth: 4, borderLeftColor: getStatusColor()},
    ]}>
      <TouchableOpacity 
        style={styles.chatItem}
        onPress={onPress}
      >
        <View style={styles.avatarContainer}>
          <CommonAvatar
            mode={getUserRole()}
            size={40}
            uri={session.other_user.image?.url}
          />
          {session.unread_count > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{session.unread_count}</Text>
            </View>
          )}
        </View>

        <View style={styles.chatContent}>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {session.other_user.name}
            </Text>
            <Text style={styles.username}>@{session.other_user.username}</Text>
          </View>

          <View style={styles.userStats}>
            <View style={styles.statItem}>
              <Icon name="trophy" size={14} color={theme.colors.warning} />
              <Text style={styles.statText}>{session.other_user.points}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="medal" size={14} color={theme.colors.warning} />
              <Text style={styles.statText}>{capitalizeFirstLetter(session.other_user.user_level)}</Text>
            </View>
          </View>

          <Text
            style={[
              styles.chatPreview,
              session.unread_count > 0 && styles.unreadPreview,
            ]}
            numberOfLines={1}>
            {getMessagePreview()}
          </Text>
        </View>

        {session.last_message && !showActionButtons && (
          <Text style={styles.chatTime}>
            {new Date(session.last_message.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        )}
      </TouchableOpacity>

      {showActionButtons && (
        <View style={styles.actionButtons}>
          <TouchableWithoutFeedback onPress={onDeny}>
            <View style={[styles.actionButton, styles.denyButton]}>
              <Icon name="close" size={20} color={theme.colors.white} />
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={onAccept}>
            <View style={[styles.actionButton, styles.acceptButton]}>
              <Icon name="checkmark" size={20} color={theme.colors.white} />
            </View>
          </TouchableWithoutFeedback>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chatItemContainer: {
    borderRadius: 8,
    backgroundColor: '#FFF',
    marginVertical: 4,
    overflow: 'hidden',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  chatContent: {
    flex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  userName: {
    fontWeight: '600',
    fontSize: 14,
    color: theme.colors.dark,
    marginRight: 6,
  },
  username: {
    fontSize: 12,
    color: '#828282',
  },
  userStats: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    fontSize: 12,
    color: theme.colors.dark,
    marginLeft: 4,
  },
  chatPreview: {
    fontSize: 13,
    color: '#828282',
  },
  unreadPreview: {
    color: theme.colors.dark,
    fontWeight: '600',
  },
  chatTime: {
    fontSize: 12,
    color: '#828282',
    alignSelf: 'flex-start',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF0000',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    position: 'absolute',
    right: 12,
    height: '100%',
    alignItems: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  acceptButton: {
    backgroundColor: theme.colors.success,
  },
  denyButton: {
    backgroundColor: theme.colors.error,
  },
});

export default CHSChatList;