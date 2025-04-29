import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
} from 'react-native';
import {theme} from '../../../contants/theme';
import moment from 'moment';
import Icon from '@react-native-vector-icons/ionicons';
import {
  getIconFromExerciseType,
  getNameFromExerciseType,
} from '../../../contants/exerciseType';
import CommonDialog from '../../../commons/CommonDialog';
import {archiveMessage} from '../../../utils/useChatsAPI';
import ToastUtil from '../../../utils/utils_toast';
import { useNavigation } from '@react-navigation/native';

type Metrics = {
  distance: number;
  calories: number;
  steps: number;
  avg_heart_rate: number;
  min_heart_rate: number;
  max_heart_rate: number;
  start_time: string;
  end_time: string;
  exercise_type: number;
};

type Message = {
  id: string;
  type: string;
  created_at: string;
  user_id: string;
  User: {
    id: string;
    name: string;
    username: string;
    points: number;
    user_level: string;
    roles: string[];
  };
  metrics: Metrics;
  RecordExerciseSession: {
    start_time: string;
  };
  archive?: boolean;
};

export const ECMessageItemExerciseRecord = ({
  message,
  isCurrentUser,
  onMessageArchived,
}: {
  message: Message;
  isCurrentUser: boolean;
  onMessageArchived?: (messageId: string) => void;
}) => {
  const navigation = useNavigation()
  const [showStats, setShowStats] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const isArchived = message.archive === true;

  const duration = moment
    .duration(
      moment(message.metrics?.end_time).diff(message.metrics?.start_time),
    )
    .asMinutes()
    .toFixed(0);

  const exerciseName = getNameFromExerciseType(message.metrics?.exercise_type);
  const exerciseIcon = getIconFromExerciseType(message.metrics?.exercise_type);
  const formattedDate = moment(message.RecordExerciseSession.start_time).format(
    'MMM D, YYYY h:mm A',
  );

  const toggleStats = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowStats(!showStats);
  };

  const handleLongPress = () => {
    if (!isArchived && isCurrentUser) {
      setShowDialog(true);
    }
  };

  const handleViewMap = () => {
    navigation.navigate("CRMessageItemExerciseRecordDetail", { sessionId: message.exercise_session_record_id });
  };

  const handleArchiveMessage = async () => {
    setShowDialog(false);
    try {
      const response = await archiveMessage(message.id);
      if (response.status) {
        ToastUtil.success('Exercise record archived successfully');
        if (onMessageArchived) {
          onMessageArchived(message.id);
        }
      } else {
        ToastUtil.error('Failed to archive record', response.message);
      }
    } catch (error) {
      ToastUtil.error('Failed to archive record', 'An error occurred');
    }
  };

  if (isArchived) {
    return (
      <View style={[styles.container, styles.archivedContainer]}>
        <Text style={styles.archivedText}>Exercise record deleted</Text>
        <Text style={[styles.timeText, styles.archivedTime]}>
          {moment(message.created_at).format('h:mm A')}
        </Text>
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.7}
        onLongPress={handleLongPress}
        delayLongPress={300}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Icon
              name={exerciseIcon}
              size={20}
              color={theme.colors.primaryDark}
            />
            <Text style={styles.headerText}>
              <Text style={styles.userName}>@{message.User.username}</Text>{' '}
              shared a <Text style={styles.exerciseName}>{exerciseName}</Text>{' '}
              record
            </Text>
          </View>

          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>
              Exercise recorded at {formattedDate}
            </Text>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.toggleButton}
            onPress={toggleStats}
            activeOpacity={0.7}>
            <Text style={styles.toggleButtonText}>
              {showStats ? 'Hide Stats' : 'Show Stats'}
            </Text>
            <Icon
              name={showStats ? 'chevron-up-outline' : 'chevron-down-outline'}
              size={16}
              color={theme.colors.primaryDark}
            />
          </TouchableOpacity>

          {message.metrics && showStats && (
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Icon name="speedometer-outline" size={20} color="#8E8E93" />
                <Text style={styles.statLabel}>Distance</Text>
                <Text style={styles.statValue}>
                  {(message.metrics?.distance / 1000).toFixed(2)} km
                </Text>
              </View>

              <View style={styles.statItem}>
                <Icon name="time-outline" size={20} color="#8E8E93" />
                <Text style={styles.statLabel}>Duration</Text>
                <Text style={styles.statValue}>{duration} mins</Text>
              </View>

              <View style={styles.statItem}>
                <Icon name="pulse-outline" size={20} color="#8E8E93" />
                <Text style={styles.statLabel}>Avg HR</Text>
                <Text style={styles.statValue}>
                  {message.metrics?.avg_heart_rate.toFixed(0)} bpm
                </Text>
              </View>

              <View style={styles.statItem}>
                <Icon name="flame-outline" size={20} color="#8E8E93" />
                <Text style={styles.statLabel}>Calories</Text>
                <Text style={styles.statValue}>
                  {message.metrics?.calories || '0'} kcal
                </Text>
              </View>

              <View style={styles.statItem}>
                <Icon name="footsteps-outline" size={20} color="#8E8E93" />
                <Text style={styles.statLabel}>Steps</Text>
                <Text style={styles.statValue}>
                  {message.metrics?.steps || '0'}
                </Text>
              </View>

              <View style={styles.statItem}>
                <Icon name="trending-up-outline" size={20} color="#8E8E93" />
                <Text style={styles.statLabel}>Max HR</Text>
                <Text style={styles.statValue}>
                  {message.metrics?.max_heart_rate} bpm
                </Text>
              </View>
            </View>
          )}

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.viewMapButton}
              onPress={handleViewMap}
              activeOpacity={0.7}>
              <Icon name="map-outline" size={16} color={'#FFF'} />
              <Text style={styles.viewMapText}>View Details</Text>
            </TouchableOpacity>
            <Text style={styles.timeText}>
              {moment(message.created_at).format('h:mm A')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <CommonDialog
        visible={showDialog}
        onClose={() => setShowDialog(false)}
        title="Exercise Record Options"
        content={
          <Text>What would you like to do with this exercise record?</Text>
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
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  archivedContainer: {
    opacity: 0.7,
    backgroundColor: 'transparent',
    borderColor: '#E5E5EA',
  },
  archivedText: {
    fontStyle: 'italic',
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '400',
    marginLeft: 8,
  },
  userName: {
    color: theme.colors.primaryDark,
    fontWeight: 'bold',
  },
  username: {
    color: theme.colors.primaryDark,
    fontWeight: 'normal',
    fontSize: 12,
  },
  exerciseName: {
    color: theme.colors.primaryDark,
    fontWeight: 'bold',
  },
  dateContainer: {
    marginTop: 4,
    marginLeft: 28, // Align with text (icon width + margin)
  },
  dateText: {
    fontSize: 10,
    color: '#8E8E93',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 12,
    marginLeft: 28, // Align with text (icon width + margin)
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
    marginBottom: 8,
  },
  toggleButtonText: {
    color: theme.colors.primaryDark,
    fontWeight: '500',
    marginRight: 4,
    fontSize: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 8,
    marginRight: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  timeText: {
    fontSize: 10,
    color: '#8E8E93',
  },
  archivedTime: {
    color: '#8E8E93',
  },
  viewMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.primaryDark,
    borderRadius: 16,
    borderWidth: 1,
  },
  viewMapText: {
    color: '#FFFFFF',
    marginLeft: 6,
    fontWeight: '500',
    fontSize: 12,
  },
});
