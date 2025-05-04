import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {CommonAvatar} from '../../../../commons/CommonAvatar';
import {theme} from '../../../../contants/theme';
import {formatTimestampAgo} from '../../../../utils/utils_format';

interface CMIProfileProps {
  message: any;
  isMe: boolean;
}

export const CMIProfile = ({message, isMe}: CMIProfileProps) => {
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
          <Icon name="person" size={20} color={isMe ? '#fff' : theme.colors.primaryDark} />
          <Text style={[styles.title, isMe && styles.myText]}>
            Profile Information
          </Text>
        </View>
        <View style={styles.details}>
          {message.content.age && (
            <Text style={[styles.text, isMe && styles.myText]}>
              Age: {message.content.age}
            </Text>
          )}
          {message.content.height && (
            <Text style={[styles.text, isMe && styles.myText]}>
              Height: {message.content.height} cm
            </Text>
          )}
          {message.content.weight && (
            <Text style={[styles.text, isMe && styles.myText]}>
              Weight: {message.content.weight} kg
            </Text>
          )}
          {message.content.issues && (
            <Text style={[styles.text, isMe && styles.myText]}>
              Health Issues: {message.content.issues}
            </Text>
          )}
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
  details: {
    marginLeft: 28,
  },
  text: {
    fontSize: 14,
    color: '#000',
    marginBottom: 4,
  },
  myText: {
    color: '#fff',
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