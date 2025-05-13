import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {CommonAvatar} from '../../../../commons/CommonAvatar';
import {theme} from '../../../../contants/theme';
import {formatTimestampAgo} from '../../../../utils/utils_format';
import { getNameFromExerciseType } from '../../../../contants/exerciseType';

const {width} = Dimensions.get('window');
const BUBBLE_WIDTH = width * 0.8;

interface CMIExerciseRecordProps {
  message: any;
  isMe: boolean;
  onPress?: () => void;
  onViewMap?: () => void;
}

export const CMIExerciseRecord = ({
  message,
  isMe,
  onPress,
  onViewMap,
}: CMIExerciseRecordProps) => {
  const stats = message.content?.stats || {};

  return (
    <View
      style={[
        styles.container,
        isMe ? styles.myContainer : styles.otherContainer,
      ]}>
      {!isMe && (
        <View style={styles.avatar}>
          <CommonAvatar
            size={32}
            uri={message.sender.image?.url}
            mode={message.sender.roles.includes('expert') ? 'expert' : 'runner'}
          />
        </View>
      )}
      <View style={[styles.bubbleContainer, {width: BUBBLE_WIDTH}]}>
        <TouchableOpacity
          style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}
          onPress={onPress}
          activeOpacity={0.9}>
          <View style={styles.header}>
            <Icon
              name="pulse"
              size={20}
              color={isMe ? '#d3d3d3' : theme.colors.primaryDark}
            />
            <Text style={[styles.title, isMe && styles.myText]}>
              Exercise Session
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Icon
                  name="heart"
                  size={14}
                  color={isMe ? '#d3d3d3' : theme.colors.primaryDark}
                />
                <Text style={[styles.statText, isMe && styles.myText]}>
                  {stats.avg_heart_rate || 'N/A'} bpm
                </Text>
              </View>
              <View style={styles.statItem}>
                <Icon
                  name="speedometer"
                  size={14}
                  color={isMe ? '#d3d3d3' : theme.colors.primaryDark}
                />
                <Text style={[styles.statText, isMe && styles.myText]}>
                  {stats.max_heart_rate || 'N/A'} max
                </Text>
              </View>
            </View>

            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Icon
                  name="walk"
                  size={14}
                  color={isMe ? '#d3d3d3' : theme.colors.primaryDark}
                />
                <Text style={[styles.statText, isMe && styles.myText]}>
                  {stats.total_distance
                    ? (stats.total_distance / 1000).toFixed(2)
                    : '0'}{' '}
                  km
                </Text>
              </View>
              <View style={styles.statItem}>
                <Icon
                  name="footsteps"
                  size={14}
                  color={isMe ? '#d3d3d3' : theme.colors.primaryDark}
                />
                <Text style={[styles.statText, isMe && styles.myText]}>
                  {stats.total_steps || '0'} steps
                </Text>
              </View>
            </View>

            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Icon
                  name="flame"
                  size={14}
                  color={isMe ? '#d3d3d3' : theme.colors.primaryDark}
                />
                <Text style={[styles.statText, isMe && styles.myText]}>
                  {stats.total_calories?.toFixed(0) || '0'} kcal
                </Text>
              </View>
              <View style={styles.statItem}>
                <Icon
                  name="time"
                  size={14}
                  color={isMe ? '#d3d3d3' : theme.colors.primaryDark}
                />
                <Text style={[styles.statText, isMe && styles.myText]}>
                  {getNameFromExerciseType(message.content?.exercise_type)}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.mapButton,
              isMe ? styles.myMapButton : styles.otherMapButton,
            ]}
            onPress={onViewMap}
            activeOpacity={0.7}>
            <Icon
              name="map"
              size={16}
              color={isMe ? '#d3d3d3' : theme.colors.primaryDark}
            />
            <Text
              style={[styles.mapButtonText, isMe && styles.myMapButtonText]}>
              View Map
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={isMe ? styles.myTime : styles.otherTime}>
              {formatTimestampAgo(message.created_at)}
            </Text>
            {isMe && (
              <Icon
                name={message.read_at ? 'checkmark-done' : 'checkmark'}
                size={14}
                color={message.read_at ? '#d3d3d3' : 'rgba(255,255,255,0.5)'}
                style={styles.icon}
              />
            )}
          </View>
        </TouchableOpacity>
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
  bubbleContainer: {
    maxWidth: '80%',
  },
  avatar: {
    marginRight: 8,
  },
  bubble: {
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  myBubble: {
    backgroundColor: theme.colors.primaryDark,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#f0f0f5',
    borderBottomLeftRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  statsContainer: {
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '500',
    color: '#000',
  },
  myText: {
    color: '#fff',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 12,
  },
  myMapButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  otherMapButton: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  mapButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primaryDark,
  },
  myMapButtonText: {
    color: '#d3d3d3',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  myTime: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  otherTime: {
    fontSize: 11,
    color: '#666',
  },
  icon: {
    marginLeft: 4,
  },
});
