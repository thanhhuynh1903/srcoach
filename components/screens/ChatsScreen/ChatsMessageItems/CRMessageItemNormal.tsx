import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {theme} from '../../../contants/theme';
import moment from 'moment';
import {CommonAvatar} from '../../../commons/CommonAvatar';
import {CRMessageItemProfile} from './CRMessageItemProfile';
import {ECMessageItemExerciseRecord} from './CRMessageItemExerciseRecord';
import { CRMessageItemExpertRecommendation } from './CRMessageItemExpertRecommendation';

type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  points: number;
  user_level: string;
  roles: string[];
  avatar?: string;
};

type Message = {
  id: string;
  message: string;
  created_at: string;
  user_id: string;
  User: User;
  type: 'MESSAGE' | 'EXPERT_RECOMMENDATION' | 'PROFILE' | 'EXERCISE_RECORD';
  height?: string;
  weight?: string;
  running_level?: string;
  running_goal?: string;
};

const UserAvatar = ({user}: {user: User}) => {
  const isExpert = user.roles.includes('expert');
  const isRunner = user.roles.includes('runner') && !isExpert;

  return (
    <CommonAvatar
      uri={user.avatar}
      mode={isExpert ? 'expert' : isRunner ? 'runner' : undefined}
    />
  );
};

const UserMetaInfo = ({
  user,
  alignRight = false,
}: {
  user: User;
  alignRight?: boolean;
}) => {
  return (
    <View
      style={[styles.userMetaContainer, alignRight && styles.userMetaRight]}>
      <Text style={styles.userName}>{user.name}</Text>
    </View>
  );
};

const CRRegularMessage = ({
  message,
  isCurrentUser,
}: {
  message: Message;
  isCurrentUser: boolean;
}) => {
  const isExpertRecommendation = message.type === 'EXPERT_RECOMMENDATION';
  const isCurrentUserExpert =
    isCurrentUser && message.User.roles.includes('expert');

  return (
    <View
      style={[
        styles.messageBubble,
        isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
        isExpertRecommendation && !isCurrentUser && styles.expertBubble,
        isCurrentUserExpert && styles.currentUserExpertBubble,
      ]}>
      <Text
        style={[
          styles.messageText,
          isCurrentUser ? styles.currentUserText : styles.otherUserText,
          (isExpertRecommendation || isCurrentUserExpert) && styles.expertText,
        ]}>
        {message.message}
      </Text>
      <Text
        style={[
          styles.messageTime,
          isCurrentUser ? styles.currentUserTime : styles.otherUserTime,
          (isExpertRecommendation || isCurrentUserExpert) && styles.expertTime,
        ]}>
        {moment(message.created_at).format('h:mm A')}
      </Text>
    </View>
  );
};

export const CRMessageItemNormal = ({
  message,
  isCurrentUser,
}: {
  message: Message;
  isCurrentUser: boolean;
}) => {

  if (message.type === 'PROFILE') {
    return <CRMessageItemProfile message={message} />;
  }

  if (message.type === 'EXERCISE_RECORD') {
    return <ECMessageItemExerciseRecord message={message} />;
  }

  if (message.type === 'EXPERT_RECOMMENDATION') {
    return <CRMessageItemExpertRecommendation message={message} isCurrentUser={isCurrentUser} />;
  }

  return (
    <View
      style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer,
      ]}>
      {!isCurrentUser && <UserAvatar user={message.User} />}
      <View
        style={[
          styles.messageContentWrapper,
          isCurrentUser && styles.expertContentWrapper,
        ]}>
        {!isCurrentUser && <UserMetaInfo user={message.User} />}

        <CRRegularMessage message={message} isCurrentUser={isCurrentUser} />
      </View>
      {(isCurrentUser) && <UserAvatar user={message.User} />}
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
    paddingHorizontal: 5,
  },
  currentUserContainer: {
    justifyContent: 'flex-end',
  },
  otherUserContainer: {
    justifyContent: 'flex-start',
  },
  messageContentWrapper: {
    flex: 1,
    maxWidth: '75%',
    marginHorizontal: 8,
  },
  expertContentWrapper: {
    marginLeft: 'auto',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
  },
  currentUserBubble: {
    backgroundColor: theme.colors.primaryDark,
    borderTopRightRadius: 2,
    marginLeft: 'auto',
  },
  currentUserExpertBubble: {
    backgroundColor: '#ffe342',
    borderTopRightRadius: 2,
    marginLeft: 'auto',
  },
  otherUserBubble: {
    backgroundColor: '#E5E5EA',
    borderBottomLeftRadius: 2,
    marginRight: 'auto',
  },
  expertBubble: {
    backgroundColor: '#FFF9C4',
    borderColor: '#FFD700',
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
  },
  currentUserText: {
    color: 'white',
  },
  otherUserText: {
    color: '#000',
  },
  expertText: {
    color: '#000',
    fontStyle: 'italic',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  currentUserTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  expertTime: {
    color: 'rgba(0,0,0,0.7)',
  },
  otherUserTime: {
    color: '#8E8E93',
  },
  userMetaContainer: {
    marginBottom: 2,
  },
  userMetaRight: {
    alignItems: 'flex-end',
  },
  userName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
});
