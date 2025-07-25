import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from '@react-native-vector-icons/material-design-icons';
import {CommonAvatar} from '../../../../commons/CommonAvatar';
import {theme} from '../../../../contants/theme';
import {formatTimestampAgo} from '../../../../utils/utils_format';
import {getNameFromExerciseType} from '../../../../contants/exerciseType';
import CommonDialog from '../../../../commons/CommonDialog';
import {archiveMessage} from '../../../../utils/useChatsAPI';
import { Divider } from 'react-native-paper';

const {width} = Dimensions.get('window');
const BUBBLE_WIDTH = width * 0.8;

interface CMIExerciseRecordProps {
  message: {
    id: string;
    content: {
      stats?: {
        min_heart_rate?: number;
        max_heart_rate?: number;
        avg_heart_rate?: number;
        total_distance?: number;
        total_steps?: number;
        total_calories?: number;
        avg_pace?: number;
      };
      exercise_type?: string;
    } | null;
    created_at: string;
    read_at?: string;
    archived?: boolean;
    sender: {
      image?: {
        url: string;
      };
      roles: string[];
    };
  };
  isMe: boolean;
  onPress?: () => void;
  onViewMap?: () => void;
  onUpdateMessage?: (messageId: string, updates: Partial<any>) => void;
}

export const CMIExerciseRecord = ({
  message,
  isMe,
  onPress,
  onViewMap,
  onUpdateMessage,
}: CMIExerciseRecordProps) => {
  const [showArchiveDialog, setShowArchiveDialog] = React.useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [isArchived, setIsArchived] = React.useState(
    message?.archived || false,
  );
  const [isPressed, setIsPressed] = React.useState(false);

  const stats = message.content?.stats || {};

  const handleArchive = async () => {
    setShowArchiveDialog(false);
    const response = await archiveMessage(message.id);
    if (response.status) {
      setIsArchived(true);
      setShowConfirmDialog(false);
      if (onUpdateMessage) {
        onUpdateMessage(message.id, {archived: true});
      }
    }
  };

  const handleLongPress = () => {
    if (isMe && !isArchived) {
      setShowArchiveDialog(true);
    }
  };

  if (isArchived || !message.content) {
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
              mode={
                message.sender.roles.includes('expert') ? 'expert' : 'runner'
              }
            />
          </View>
        )}
        <View
          style={[
            styles.bubbleContainer,
            {width: BUBBLE_WIDTH},
            isMe ? styles.archivedBubble : styles.archivedOtherBubble,
          ]}>
          <Text style={[styles.archivedText, isMe && styles.myArchivedText]}>
            Exercise record deleted{isMe ? ' by you' : ''}
          </Text>
          <View style={styles.footer}>
            <Text style={isMe ? styles.myTime : styles.otherTime}>
              {formatTimestampAgo(message.created_at)}
            </Text>
            {isMe && (
              <Icon
                name={message.read_at ? 'check-all' : 'check'}
                size={14}
                color={message.read_at ? '#d3d3d3' : 'rgba(255,255,255,0.5)'}
                style={styles.icon}
              />
            )}
          </View>
        </View>
      </View>
    );
  }

  const formatPace = (pace: number | undefined) => {
    if (!pace) return 'N/A';
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace % 1) * 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds} min/km`;
  };

  return (
    <>
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
              mode={
                message.sender.roles.includes('expert') ? 'expert' : 'runner'
              }
            />
          </View>
        )}
        <View style={[styles.bubbleContainer, {width: BUBBLE_WIDTH}]}>
          <TouchableOpacity
            style={[
              styles.bubble,
              isMe ? styles.myBubble : styles.otherBubble,
              isPressed && isMe && styles.pressedBubble,
            ]}
            onLongPress={handleLongPress}
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
            delayLongPress={300}
            activeOpacity={0.9}>
            <View style={styles.header}>
              <Icon
                name="heart-pulse"
                size={20}
                color={isMe ? '#d3d3d3' : theme.colors.primaryDark}
              />
              <Text style={[styles.title, isMe && styles.myText]}>
                Exercise Session
              </Text>
            </View>

            <View style={styles.statsContainer}>
              {/* Heart Rate Row - All in one line */}
              <View style={styles.heartRateRow}>
                <View style={styles.statItem}>
                  <Icon
                    name="heart-multiple"
                    size={14}
                    color={isMe ? '#d3d3d3' : theme.colors.primaryDark}
                  />
                  <View style={styles.statTextContainer}>
                    <Text style={[styles.statLabel, isMe && styles.myText]}>Avg</Text>
                    <Text style={[styles.statValue, isMe && styles.myText]}>
                      {stats.avg_heart_rate || 'N/A'} bpm
                    </Text>
                  </View>
                </View>
                
                <View style={styles.statItem}>
                  <Icon
                    name="heart-plus"
                    size={14}
                    color={isMe ? '#d3d3d3' : theme.colors.primaryDark}
                  />
                  <View style={styles.statTextContainer}>
                    <Text style={[styles.statLabel, isMe && styles.myText]}>Max</Text>
                    <Text style={[styles.statValue, isMe && styles.myText]}>
                      {stats.max_heart_rate || 'N/A'} bpm
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.statRow}>
                 <View style={styles.statItem}>
                  <Icon
                    name="heart-minus"
                    size={14}
                    color={isMe ? '#d3d3d3' : theme.colors.primaryDark}
                  />
                  <View style={styles.statTextContainer}>
                    <Text style={[styles.statLabel, isMe && styles.myText]}>Min</Text>
                    <Text style={[styles.statValue, isMe && styles.myText]}>
                      {stats.min_heart_rate || 'N/A'} bpm
                    </Text>
                  </View>
                </View>
              </View>
              <Divider style={{marginBottom: 10}} />

              {/* Distance and Steps Row */}
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Icon
                    name="map-marker-distance"
                    size={14}
                    color={isMe ? '#d3d3d3' : theme.colors.primaryDark}
                  />
                  <View style={styles.statTextContainer}>
                    <Text style={[styles.statLabel, isMe && styles.myText]}>Distance</Text>
                    <Text style={[styles.statValue, isMe && styles.myText]}>
                      {stats.total_distance
                        ? (stats.total_distance / 1000).toFixed(2)
                        : '0.00'} km
                    </Text>
                  </View>
                </View>
                
                <View style={styles.statItem}>
                  <Icon
                    name="walk"
                    size={14}
                    color={isMe ? '#d3d3d3' : theme.colors.primaryDark}
                  />
                  <View style={styles.statTextContainer}>
                    <Text style={[styles.statLabel, isMe && styles.myText]}>Steps</Text>
                    <Text style={[styles.statValue, isMe && styles.myText]}>
                      {stats.total_steps || '0'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Calories and Pace Row */}
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Icon
                    name="fire"
                    size={14}
                    color={isMe ? '#d3d3d3' : theme.colors.primaryDark}
                  />
                  <View style={styles.statTextContainer}>
                    <Text style={[styles.statLabel, isMe && styles.myText]}>Calories</Text>
                    <Text style={[styles.statValue, isMe && styles.myText]}>
                      {stats.total_calories?.toFixed(0) || '0'} kcal
                    </Text>
                  </View>
                </View>
                
                <View style={styles.statItem}>
                  <Icon
                    name="speedometer"
                    size={14}
                    color={isMe ? '#d3d3d3' : theme.colors.primaryDark}
                  />
                  <View style={styles.statTextContainer}>
                    <Text style={[styles.statLabel, isMe && styles.myText]}>Avg Pace</Text>
                    <Text style={[styles.statValue, isMe && styles.myText]}>
                      {formatPace(stats.avg_pace)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Exercise Type */}
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Icon
                    name="run-fast"
                    size={14}
                    color={isMe ? '#d3d3d3' : theme.colors.primaryDark}
                  />
                  <View style={styles.statTextContainer}>
                    <Text style={[styles.statLabel, isMe && styles.myText]}>Activity</Text>
                    <Text style={[styles.statValue, isMe && styles.myText]}>
                      {getNameFromExerciseType(message.content?.exercise_type)}
                    </Text>
                  </View>
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
                name="map-outline"
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
                  name={message.read_at ? 'check-all' : 'check'}
                  size={14}
                  color={message.read_at ? '#d3d3d3' : 'rgba(255,255,255,0.5)'}
                  style={styles.icon}
                />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <CommonDialog
        visible={showArchiveDialog}
        onClose={() => setShowArchiveDialog(false)}
        title="Message Options"
        content={
          <View>
            <Text style={styles.dialogContentText}>
              What would you like to do with this exercise record?
            </Text>
            <TouchableOpacity
              style={styles.dialogActionButton}
              onPress={() => {
                setShowArchiveDialog(false);
                setShowConfirmDialog(true);
              }}>
              <Icon name="delete-outline" size={20} color={theme.colors.primaryDark} />
              <Text style={styles.dialogActionButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <CommonDialog
        visible={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        title="Confirm Delete"
        content={
          <View>
            <Text style={styles.dialogContentText}>
              Are you sure you want to delete this exercise record?
            </Text>
            <View style={styles.dialogButtonGroup}>
              <TouchableOpacity
                style={[styles.dialogButton, styles.dialogCancelButton]}
                onPress={() => setShowConfirmDialog(false)}>
                <Text style={styles.dialogCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogButton, styles.dialogConfirmButton]}
                onPress={handleArchive}>
                <Text style={styles.dialogConfirmButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
      />
    </>
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
  archivedBubble: {
    backgroundColor: theme.colors.primaryDark,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    padding: 16,
    borderRadius: 20,
  },
  archivedOtherBubble: {
    backgroundColor: '#f9f9f9',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    padding: 16,
    borderRadius: 20,
  },
  pressedBubble: {
    opacity: 0.8,
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
  heartRateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
  },
  statTextContainer: {
    marginLeft: 8,
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000',
    marginTop: 2,
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
  archivedText: {
    fontStyle: 'italic',
    color: '#999',
    fontSize: 14,
    marginBottom: 8,
  },
  myArchivedText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  dialogContentText: {
    color: '#000',
    fontSize: 16,
    marginBottom: 20,
  },
  dialogActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  dialogActionButtonText: {
    color: '#000',
    fontSize: 16,
    marginLeft: 12,
  },
  dialogButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  dialogButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    marginLeft: 10,
  },
  dialogCancelButton: {
    borderWidth: 1,
    borderColor: theme.colors.primaryDark,
  },
  dialogConfirmButton: {
    backgroundColor: '#d30000',
  },
  dialogCancelButtonText: {
    color: theme.colors.primaryDark,
  },
  dialogConfirmButtonText: {
    color: '#fff',
  },
});