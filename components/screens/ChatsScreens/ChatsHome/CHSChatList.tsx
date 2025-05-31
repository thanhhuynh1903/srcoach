import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {theme} from '../../../contants/theme';
import {CommonAvatar} from '../../../commons/CommonAvatar';
import {capitalizeFirstLetter} from '../../../utils/utils_format';
import {useLoginStore} from '../../../utils/useLoginStore';
import {useNavigation} from '@react-navigation/native';

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

interface ChatCategoryProps {
  title: string;
  iconName: string;
  count: string | number;
  id: string;
}

const ChatCategory: React.FC<ChatCategoryProps> = ({
  title,
  iconName,
  count,
  id,
}) => (
  <View style={styles.categoryContainer} testID={`category-${id}`}>
    <Icon
      name={iconName}
      size={18}
      color={theme.colors.primaryDark}
      style={styles.categoryIcon}
    />
    <Text style={styles.categoryText}>{title}</Text>
    <View style={styles.categoryBadge}>
      <Text style={styles.categoryBadgeText}>{count}</Text>
    </View>
  </View>
);

const ChatListItem: React.FC<ChatListItemProps> = ({
  session,
  onPress,
  onAccept,
  onDeny,
}) => {
  const navigation = useNavigation();
  const {profile} = useLoginStore();
  const isExpert = profile?.roles?.includes('expert');
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
    if (!session.last_message) return {text: 'No messages yet', icon: null};
    if (session.last_message.archived)
      return {text: 'Archived message', icon: null};

    switch (session.last_message.message_type) {
      case 'NORMAL':
        return {text: session.last_message.content || 'Message', icon: null};
      case 'PROFILE':
        return {text: 'Profile information shared', icon: 'person'};
      case 'EXERCISE_RECORD':
        return {text: 'Exercise record shared', icon: 'fitness'};
      case 'EXPERT_RECOMMENDATION':
        return {text: 'Expert recommendation sent', icon: 'ribbon'};
      case 'IMAGE':
        return {text: 'Image attached', icon: 'image'};
      case 'EXPERT_SCHEDULE':
        return {text: 'Schedule shared', icon: 'calendar'};
      default:
        return {text: 'New message', icon: null};
    }
  };

  const preview = getMessagePreview();
  const isSpecialMessage =
    session.last_message?.message_type !== 'NORMAL' &&
    session.last_message?.message_type !== undefined;
  const getUserRole = () =>
    session.other_user.roles.includes('expert') ? 'expert' : 'runner';
  const showActionButtons =
    session.status === 'PENDING' && !session.is_initiator;
  const isDisabled = session.status === 'PENDING' && !isExpert;

  return (
    <View
      style={[
        styles.chatItemContainer,
        {borderLeftWidth: 4, borderLeftColor: getStatusColor()},
      ]}>
      <TouchableOpacity
        style={styles.chatItem}
        onPress={onPress}
        disabled={isDisabled}>
        <View style={styles.avatarContainer}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('UserProfileScreen', {
                userId: session.other_user.id,
              })
            }>
            <CommonAvatar
              mode={getUserRole()}
              size={40}
              uri={session.other_user.image?.url}
            />
          </TouchableOpacity>
          {session.unread_count > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{session.unread_count}</Text>
            </View>
          )}
        </View>
        <View style={styles.chatContent}>
          <View style={styles.userInfo}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('UserProfileScreen', {
                  userId: session.other_user.id,
                })
              }>
              <Text style={styles.userName} numberOfLines={1}>
                {session.other_user.name}
              </Text>
            </TouchableOpacity>
            <Text style={styles.username}>@{session.other_user.username}</Text>
          </View>
          <View style={styles.userStats}>
            <View style={styles.statItem}>
              <Icon name="trophy" size={14} color={theme.colors.warning} />
              <Text style={styles.statText}>{session.other_user.points}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="medal" size={14} color={theme.colors.warning} />
              <Text style={styles.statText}>
                {capitalizeFirstLetter(session.other_user.user_level)}
              </Text>
            </View>
          </View>
          <View style={styles.previewContainer}>
            {preview.icon && (
              <Icon
                name={preview.icon}
                size={14}
                color="#828282"
                style={styles.previewIcon}
              />
            )}
            <Text
              style={[
                styles.chatPreview,
                session.unread_count > 0 && styles.unreadPreview,
                isSpecialMessage && styles.specialPreview,
              ]}
              numberOfLines={1}>
              {preview.text}
            </Text>
          </View>
        </View>
        {!showActionButtons && (
          <View style={styles.rightContent}>
            {session.last_message && (
              <Text style={styles.chatTime}>
                {new Date(session.last_message.created_at).toLocaleTimeString(
                  [],
                  {hour: '2-digit', minute: '2-digit'},
                )}
              </Text>
            )}
            {showActionButtons ? (
              <Icon name="arrow-redo-outline" size={20} color="#828282" />
            ) : (
              <Icon name="chevron-forward" size={20} color="#828282" />
            )}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

interface CHSChatListProps {
  sessions: ChatListItemProps['session'][];
  onItemPress: (session: ChatListItemProps['session']) => void;
  onAccept: (session: ChatListItemProps['session']) => void;
  onDeny: (session: ChatListItemProps['session']) => void;
}

const CHSChatList: React.FC<CHSChatListProps> = ({
  sessions,
  onItemPress,
  onAccept,
  onDeny,
}) => {
  const {profile} = useLoginStore();
  const isExpert = profile?.roles?.includes('expert');

  // Categorize sessions based on user role and other user role
  const categorizeSessions = () => {
    const expertSessions: ChatListItemProps['session'][] = [];
    const directMessages: ChatListItemProps['session'][] = [];
    const pendingRequests: ChatListItemProps['session'][] = [];

    sessions.forEach(session => {
      const otherIsExpert = session.other_user.roles.includes('expert');

      if (session.status === 'PENDING') {
        pendingRequests.push(session);
      } else if (isExpert && otherIsExpert) {
        directMessages.push(session);
      } else if (!isExpert && !otherIsExpert) {
        directMessages.push(session);
      } else {
        expertSessions.push(session);
      }
    });

    return {expertSessions, directMessages, pendingRequests};
  };

  const {expertSessions, directMessages, pendingRequests} =
    categorizeSessions();

  const expertSessionCount = isExpert
    ? `${expertSessions.length}/15`
    : `${expertSessions.length}/1`;
  const directMessageCount = directMessages.length;
  const pendingRequestCount = pendingRequests.length;

  const renderSection = (
    sessions: ChatListItemProps['session'][],
    title: string,
    iconName: string,
    count: string | number,
    id: string,
  ) => {
    if (sessions.length === 0) return null;

    return (
      <View key={id}>
        <ChatCategory title={title} iconName={iconName} count={count} id={id} />
        {sessions.map(session => (
          <ChatListItem
            key={session.id}
            session={session}
            onPress={() => onItemPress(session)}
            onAccept={() => onAccept(session)}
            onDeny={() => onDeny(session)}
          />
        ))}
        <View style={styles.sectionSeparator} />
      </View>
    );
  };

  return (
    <View style={styles.listContainer}>
      {renderSection(
        expertSessions,
        isExpert ? 'Runner Sessions' : 'Expert Sessions',
        isExpert ? 'people' : 'trophy',
        expertSessionCount,
        'expert-sessions',
      )}
      {renderSection(
        directMessages,
        'Direct Messages',
        'chatbubbles',
        directMessageCount,
        'direct-messages',
      )}
      {renderSection(
        pendingRequests,
        'Pending Requests',
        'time',
        pendingRequestCount,
        'pending-requests',
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  sectionSeparator: {
    height: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
    paddingHorizontal: 8,
  },
  categoryIcon: {
    marginRight: 8,
  },
  categoryText: {
    fontWeight: '600',
    fontSize: 16,
    color: theme.colors.primaryDark,
    marginRight: 10,
  },
  categoryBadge: {
    color: theme.colors.primaryDark,
    borderRadius: 5,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    backgroundColor: '#5959592d',
  },
  categoryBadgeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
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
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewIcon: {
    marginRight: 4,
  },
  chatPreview: {
    fontSize: 13,
    color: '#828282',
  },
  specialPreview: {
    fontStyle: 'italic',
  },
  unreadPreview: {
    color: theme.colors.dark,
    fontWeight: '600',
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  chatTime: {
    fontSize: 12,
    color: '#828282',
    marginBottom: 4,
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
    backgroundColor: theme.colors.primaryDark,
  },
  acceptButton: {
    backgroundColor: theme.colors.success,
  },
  denyButton: {
    backgroundColor: theme.colors.error,
  },
});

export default CHSChatList;