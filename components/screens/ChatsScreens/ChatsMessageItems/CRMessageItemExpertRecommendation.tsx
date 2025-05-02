import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {theme} from '../../../contants/theme';
import {CommonAvatar} from '../../../commons/CommonAvatar';
import CommonDialog from '../../../commons/CommonDialog';
import {archiveMessage} from '../../../utils/useChatsAPI';
import ToastUtil from '../../../utils/utils_toast';

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

type ExpertRecommendationMessage = {
  id: string;
  message: string;
  created_at: string;
  user_id: string;
  expert_id: string;
  User: User;
  type: 'EXPERT_RECOMMENDATION';
  archive?: boolean;
};

export const CRMessageItemExpertRecommendation = ({
  message,
  isCurrentUser,
  onMessageArchived,
}: {
  message: ExpertRecommendationMessage;
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
        ToastUtil.success('Recommendation archived successfully');
        if (onMessageArchived) {
          onMessageArchived(message.id);
        }
      } else {
        ToastUtil.error('Failed to archive recommendation', response.message);
      }
    } catch (error) {
      ToastUtil.error('Failed to archive recommendation', 'An error occurred');
    }
  };

  if (isArchived) {
    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser
            ? styles.currentUserContainer
            : styles.otherUserContainer,
          styles.archivedContainer,
        ]}>
        {!isCurrentUser && (
          <CommonAvatar uri={message.User.avatar} mode="expert" />
        )}
        <View
          style={[
            styles.messageContentWrapper,
            isCurrentUser && styles.expertContentWrapper,
          ]}>
          <View style={[styles.messageBubble, styles.archivedBubble]}>
            <Text style={styles.archivedText}>Recommendation deleted</Text>
            <Text style={[styles.messageTime, styles.archivedTime]}>
              {new Date(message.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>
        {isCurrentUser && (
          <CommonAvatar uri={message.User.avatar} mode="expert" />
        )}
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.7}
        onLongPress={handleLongPress}
        delayLongPress={300}>
        <View
          style={[
            styles.messageContainer,
            isCurrentUser
              ? styles.currentUserContainer
              : styles.otherUserContainer,
          ]}>
          {!isCurrentUser && (
            <CommonAvatar uri={message.User.avatar} mode="expert" />
          )}
          <View
            style={[
              styles.messageContentWrapper,
              isCurrentUser && styles.expertContentWrapper,
            ]}>
            <View style={[styles.messageBubble, styles.expertBubble]}>
              <View style={styles.header}>
                <Text style={styles.headerText}>
                  <Text style={isCurrentUser ? {} : styles.usernameBold}>
                    {isCurrentUser ? 'You' : `@${message.User.username}`}
                  </Text>
                  {isCurrentUser ? ' have' : ' has'} sent an advice with the
                  following:
                </Text>
              </View>

              <Text style={styles.messageText}>{message.message}</Text>

              {!isCurrentUser && (
                <TouchableOpacity style={styles.saveButton} activeOpacity={0.7}>
                  <Text style={styles.saveButtonText}>Save recommendation</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.messageTime}>
                {new Date(message.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>
          {isCurrentUser && (
            <CommonAvatar uri={message.User.avatar} mode="expert" />
          )}
        </View>
      </TouchableOpacity>

      <CommonDialog
        visible={showDialog}
        onClose={() => setShowDialog(false)}
        title="Recommendation Options"
        content={
          <Text>What would you like to do with this recommendation?</Text>
        }
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
    width: '100%',
  },
  expertBubble: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  archivedBubble: {
    backgroundColor: 'transparent',
    borderColor: '#c9c9c9',
    borderWidth: 1,
  },
  archivedContainer: {
    opacity: 1,
  },
  archivedText: {
    fontStyle: 'italic',
    color: '#8E8E93',
    fontSize: 16,
  },
  archivedTime: {
    color: '#8E8E93',
  },
  header: {
    marginBottom: 8,
  },
  headerText: {
    fontSize: 14,
    color: '#2E7D32',
    fontStyle: 'italic',
  },
  usernameBold: {
    fontWeight: 'bold',
  },
  messageText: {
    fontSize: 16,
    color: '#000',
    marginVertical: 8,
  },
  messageTime: {
    fontSize: 10,
    color: '#9E9E9E',
    textAlign: 'right',
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: theme.colors.primaryDark,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
