import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {CommonAvatar} from '../../../../commons/CommonAvatar';
import {theme} from '../../../../contants/theme';
import {formatTimestampAgo} from '../../../../utils/utils_format';

interface CMIExpertRecommendationProps {
  message: any;
  isMe: boolean;
}

export const CMIExpertRecommendation = ({message, isMe}: CMIExpertRecommendationProps) => {
  return (
    <View style={[styles.container, isMe ? styles.myContainer : styles.otherContainer]}>
      {!isMe && (
        <View style={styles.avatar}>
          <CommonAvatar
            size={32}
            uri={message.sender.image?.url}
            mode={message.sender.roles.includes('EXPERT') ? 'expert' : 'runner'}
          />
        </View>
      )}
      <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
        <View style={styles.header}>
          <Icon name="ribbon" size={20} color={isMe ? '#fff' : theme.colors.primaryDark} />
          <Text style={[styles.title, isMe && styles.myText]}>
            Expert Recommendation
          </Text>
        </View>
        <Text style={[styles.text, isMe && styles.myText]}>
          {message.content.text}
        </Text>
        <View style={[styles.status, message.content.is_accepted && styles.accepted]}>
          <Text style={styles.statusText}>
            {message.content.is_accepted ? 'Accepted' : 'Pending acceptance'}
          </Text>
        </View>
        <View style={styles.footer}>
          <Text style={isMe ? styles.myTime : styles.otherTime}>
            {formatTimestampAgo(message.created_at)}
          </Text>
          {isMe && (
            <Icon
              name={message.read_at ? 'checkmark-done' : 'checkmark'}
              size={14}
              color={message.read_at ? theme.colors.primaryDark : 'rgba(255,255,255,0.5)'}
              style={styles.icon}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  myContainer: {
    justifyContent: 'flex-end',
  },
  otherContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    marginRight: 8,
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: theme.colors.primaryDark,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#e5e5ea',
    borderBottomLeftRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  text: {
    fontSize: 14,
    color: '#000',
    marginBottom: 8,
  },
  myText: {
    color: '#fff',
  },
  status: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#FFEB3B',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  accepted: {
    backgroundColor: '#4CAF50',
  },
  statusText: {
    fontSize: 12,
    color: '#000',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  myTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  otherTime: {
    fontSize: 12,
    color: '#666',
  },
  icon: {
    marginLeft: 4,
  },
});