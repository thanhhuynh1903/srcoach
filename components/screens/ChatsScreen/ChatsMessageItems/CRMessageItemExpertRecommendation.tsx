import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {theme} from '../../../contants/theme';
import {CommonAvatar} from '../../../commons/CommonAvatar';

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
  User: User;
  type: 'EXPERT_RECOMMENDATION';
};

export const CRMessageItemExpertRecommendation = ({
  message,
  isCurrentUser,
}: {
  message: ExpertRecommendationMessage;
  isCurrentUser: boolean;
}) => {
  return (
    <View
      style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer,
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
            <TouchableOpacity style={styles.saveButton}>
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
