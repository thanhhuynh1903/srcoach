import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {theme} from '../../../contants/theme';
import LinearGradient from 'react-native-linear-gradient';
import {CommonAvatar} from '../../../commons/CommonAvatar';
import {capitalizeFirstLetter} from '../../../utils/utils_format';
import {Session, BlockedUser, User} from './types';

interface ChatsListItemProps {
  item: Session | BlockedUser;
  userId: string;
  pendingSessions: {initiated: Session[], invited: Session[]};
  onChatPress: (session: Session) => void;
  onShowActionMenu: (item: Session | BlockedUser) => void;
  onAcceptSession: (sessionId: string) => void;
  onRejectSession: (sessionId: string) => void;
  getFilterColor: (filter: string) => string;
}

export const ChatsListItem = ({
  item,
  userId,
  pendingSessions,
  onChatPress,
  onShowActionMenu,
  onAcceptSession,
  onRejectSession,
  getFilterColor,
}: ChatsListItemProps) => {
  const isBlocked = 'blockedAt' in item;
  const otherUser = getOtherUser(item, userId);
  const isExpert = otherUser.roles?.includes('expert');
  const isPendingForYou = !isBlocked && 
    item.status === 'PENDING' && 
    pendingSessions.invited.some((s: Session) => s.id === item.id);

  const onPress = () => {
    if (!isBlocked && item.status === 'ACCEPTED') {
      onChatPress(item as Session);
    } else {
      onShowActionMenu(item);
    }
  };

  const onLongPress = () => onShowActionMenu(item);

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        styles.listItemContainer,
        isExpert && styles.expertNameplate,
        {borderLeftColor: isBlocked ? getFilterColor('BLOCKED') : getFilterColor(item.status)},
      ]}
    >
      <View style={styles.itemContainer}>
        <CommonAvatar
          mode={isExpert ? 'expert' : 'runner'}
          uri={otherUser.image?.url}
          size={40}
        />
        <View style={styles.textContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.nameText}>{otherUser.name}</Text>
            {isExpert && (
              <LinearGradient
                colors={['#FFD700', '#FFC000']}
                style={styles.expertBadge}>
                <Icon name="star" size={12} color="#FFF" />
                <Text style={styles.expertBadgeText}>Expert</Text>
              </LinearGradient>
            )}
            <Text style={styles.usernameText}>@{otherUser.username}</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="trophy" size={16} color={theme.colors.warning} />
              <Text style={styles.statText}>{otherUser.points}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="medal" size={16} color={theme.colors.warning} />
              <Text style={styles.statText}>
                {capitalizeFirstLetter(otherUser.user_level)}
              </Text>
            </View>
          </View>
        </View>
        {!isBlocked && item.status === 'PENDING' && (item as Session).initiatedByYou && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>Pending</Text>
          </View>
        )}
        {isBlocked && (
          <View style={styles.blockedBadge}>
            <Text style={styles.blockedText}>Blocked</Text>
          </View>
        )}
        {isPendingForYou && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => onAcceptSession(item.id)}>
              <Icon name="checkmark" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => onRejectSession(item.id)}>
              <Icon name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const getOtherUser = (item: Session | BlockedUser, userId: string): User => {
  if ('blockedAt' in item) return item.user;
  return userId === item.participant1_id ? item.participant2 : item.participant1;
};

const styles = StyleSheet.create({
  listItemContainer: {
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 6,
  },
  expertNameplate: {
    borderLeftColor: '#FFD700',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  expertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  expertBadgeText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  usernameText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
  },
  pendingBadge: {
    backgroundColor: theme.colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingText: {
    color: 'white',
    fontSize: 12,
  },
  blockedBadge: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  blockedText: {
    color: 'white',
    fontSize: 12,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
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
  rejectButton: {
    backgroundColor: theme.colors.error,
  },
});