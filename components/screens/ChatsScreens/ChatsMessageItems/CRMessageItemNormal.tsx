import React, { useState } from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {theme} from '../../../contants/theme';
import moment from 'moment';
import {CommonAvatar} from '../../../commons/CommonAvatar';
import {CRMessageItemProfile} from './CRMessageItemProfile';
import {ECMessageItemExerciseRecord} from './CRMessageItemExerciseRecord';
import { CRMessageItemExpertRecommendation } from './CRMessageItemExpertRecommendation';
import CommonDialog from '../../../commons/CommonDialog';
import { archiveMessage } from '../../../utils/useChatsAPI';
import ToastUtil from '../../../utils/utils_toast';
import { formatTimestampAgo } from '../../../utils/utils_format';

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
  archive?: boolean;
};

const UserAvatar = ({user}: {user: User}) => {
  const isExpert = user.roles.includes('expert');
  const isRunner = user.roles.includes('runner') && !isExpert;

  return (
    <CommonAvatar
      uri={user?.image?.url}
      mode={isExpert ? 'expert' : isRunner ? 'runner' : undefined}
    />
  );
};

const ExpertChip = () => {
  return (
    <View style={styles.expertChip}>
      <Text style={styles.expertChipText}>Expert</Text>
    </View>
  );
};

const UserMetaInfo = ({
  user,
  alignRight = false,
}: {
  user: User;
  alignRight?: boolean;
}) => {
  const isExpert = user.roles.includes('expert');
  
  return (
    <View style={[styles.userMetaContainer, alignRight && styles.userMetaRight]}>
      <View style={[styles.userMetaRow, alignRight && styles.userMetaRowRight]}>
        <Text style={styles.userName}>{user.name}</Text>
        {isExpert && <ExpertChip />}
      </View>
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
  const isExpert = message.User.roles.includes('expert');
  const isCurrentUserExpert = isCurrentUser && isExpert;
  const isOtherExpert = !isCurrentUser && isExpert;

  return (
    <View
      style={[
        styles.messageBubble,
        isCurrentUser && !isCurrentUserExpert && styles.currentUserBubble,
        isCurrentUserExpert && styles.currentUserExpertBubble,
        !isCurrentUser && !isOtherExpert && styles.otherUserBubble,
        isOtherExpert && styles.expertBubble,
        message.archive && styles.archivedBubble,
      ]}>
      {message.archive ? (
        <Text style={styles.archivedText}>Message deleted</Text>
      ) : (
        <>
          <Text
            style={[
              styles.messageText,
              isCurrentUser && !isCurrentUserExpert && styles.currentUserText,
              isCurrentUserExpert && styles.currentUserExpertText,
              !isCurrentUser && !isOtherExpert && styles.otherUserText,
              isOtherExpert && styles.expertText,
            ]}>
            {message.message}
          </Text>
          <Text
            style={[
              styles.messageTime,
              isCurrentUser && !isCurrentUserExpert && styles.currentUserTime,
              isCurrentUserExpert && styles.currentUserExpertTime,
              !isCurrentUser && !isOtherExpert && styles.otherUserTime,
              isOtherExpert && styles.expertTime,
            ]}>
            {formatTimestampAgo(message.created_at)}
          </Text>
        </>
      )}
    </View>
  );
};

export const CRMessageItemNormal = ({
  message,
  isCurrentUser,
  onMessageArchived,
}: {
  message: Message;
  isCurrentUser: boolean;
  onMessageArchived?: (messageId: string) => void;
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const isArchived = message.archive === true;

  const handleLongPress = () => {
    if (!isArchived && isCurrentUser) {
      setShowDialog(true);
    }
  };

  const handleArchiveMessage = async () => {
    setShowDialog(false);
    try {
      const response = await archiveMessage(message.id);
      if (response.status) {
        ToastUtil.success('Message archived successfully');
        if (onMessageArchived) {
          onMessageArchived(message.id);
        }
      } else {
        ToastUtil.error('Failed to archive message', response.message);
      }
    } catch (error) {
      ToastUtil.error('Failed to archive message', 'An error occurred');
    }
  };

  if (message.type === 'PROFILE') {
    return <CRMessageItemProfile message={message} isCurrentUser={isCurrentUser} />;
  }

  if (message.type === 'EXERCISE_RECORD') {
    return <ECMessageItemExerciseRecord message={message} isCurrentUser={isCurrentUser} />;
  }

  if (message.type === 'EXPERT_RECOMMENDATION') {
    return <CRMessageItemExpertRecommendation message={message} isCurrentUser={isCurrentUser} />;
  }

  return (
    <>
      <TouchableOpacity 
        activeOpacity={.8}
        onLongPress={handleLongPress}
        delayLongPress={300}
      >
        <View
          style={[
            styles.messageContainer,
            isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer,
            isArchived && styles.archivedContainer,
          ]}>
          {!isCurrentUser && <UserAvatar user={message.User} />}
          <View
            style={[
              styles.messageContentWrapper,
              isCurrentUser && styles.currentUserContentWrapper,
            ]}>
            {!isCurrentUser && <UserMetaInfo user={message.User} />}
            {isCurrentUser && <UserMetaInfo user={message.User} alignRight />}
            <CRRegularMessage message={message} isCurrentUser={isCurrentUser} />
          </View>
          {isCurrentUser && <UserAvatar user={message.User} />}
        </View>
      </TouchableOpacity>

      <CommonDialog
        visible={showDialog}
        onClose={() => setShowDialog(false)}
        title="Message Options"
        content={<Text>What would you like to do with this message?</Text>}
        actionButtons={[
          {
            label: 'Delete',
            color: theme.colors.error,
            variant: 'contained',
            iconName: 'trash',
            handler: handleArchiveMessage,
          },
          {
            label: 'Cancel',
            variant: 'outlined',
            handler: () => setShowDialog(false),
          },
        ]}
      />
    </>
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
    maxWidth: '75%',
    marginHorizontal: 8,
  },
  currentUserContentWrapper: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
  },
  currentUserBubble: {
    backgroundColor: theme.colors.primaryDark,
    borderTopRightRadius: 2,
  },
  currentUserExpertBubble: {
    backgroundColor: '#ffe342',
    borderTopRightRadius: 2,
  },
  otherUserBubble: {
    backgroundColor: '#E5E5EA',
    borderBottomLeftRadius: 2,
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
  currentUserExpertText: {
    color: '#000',
  },
  otherUserText: {
    color: '#000',
  },
  expertText: {
    color: '#000',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  currentUserTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  currentUserExpertTime: {
    color: 'rgba(0,0,0,0.7)',
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
  userMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userMetaRowRight: {
    justifyContent: 'flex-end',
  },
  userName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  expertChip: {
    backgroundColor: '#FFD700',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  expertChipText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  archivedContainer: {
    opacity: 0.7,
  },
  archivedBubble: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  archivedText: {
    fontStyle: 'italic',
    color: '#8E8E93',
    fontSize: 16,
  },
});