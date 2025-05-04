import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {CommonAvatar} from '../../../../commons/CommonAvatar';
import {theme} from '../../../../contants/theme';
import {formatTimestampAgo} from '../../../../utils/utils_format';

interface CMIExerciseRecordProps {
  message: any;
  isMe: boolean;
  onPress?: () => void;
}

export const CMIExerciseRecord = ({message, isMe, onPress}: CMIExerciseRecordProps) => {
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
      <TouchableOpacity
        style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}
        onPress={onPress}>
        <View style={styles.header}>
          <Icon name="walk" size={20} color={isMe ? '#fff' : theme.colors.primaryDark} />
          <Text style={[styles.title, isMe && styles.myText]}>
            Exercise Record
          </Text>
        </View>
        {message.content.record && (
          <View style={styles.details}>
            <Text style={[styles.text, isMe && styles.myText]}>
              Duration: {message.content.record.duration || 'N/A'} mins
            </Text>
            <Text style={[styles.text, isMe && styles.myText]}>
              Distance: {message.content.record.distance || 'N/A'} km
            </Text>
            <Text style={[styles.text, isMe && styles.myText]}>
              Calories: {message.content.record.calories || 'N/A'} kcal
            </Text>
          </View>
        )}
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
      </TouchableOpacity>
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