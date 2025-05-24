import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, FlatList} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {CommonAvatar} from '../../../../commons/CommonAvatar';
import {theme} from '../../../../contants/theme';
import {formatTimestampAgo} from '../../../../utils/utils_format';
import {useLoginStore} from '../../../../utils/useLoginStore';
import {archiveMessage} from '../../../../utils/useChatsAPI';
import CommonDialog from '../../../../commons/CommonDialog';
import useScheduleStore from '../../../../utils/useScheduleStore';

interface CMIExpertScheduleProps {
  message: {
    id: string;
    message_type: string;
    created_at: string;
    read_at?: string;
    archived?: boolean;
    status?: 'PENDING' | 'INCOMING' | 'ONGOING' | 'CANCELED';
    sender: {
      id: string;
      name: string;
      username: string;
      email: string;
      image?: {
        url: string;
      };
      roles: string[];
    };
    content: {
      schedule: {
        id: string;
        schedule_type: string;
        title: string;
        description: string;
        created_at: string;
        ScheduleDay: Array<{
          id: string;
          day: string;
          is_rest_day: boolean;
          ScheduleDetail: Array<{
            id: string;
            description: string;
            start_time: string;
            end_time: string;
            goal_steps?: number;
            goal_distance?: number;
            goal_calories?: number;
            estimated_time?: number;
          }>;
        }>;
      };
    };
  };
  isMe: boolean;
  onRefresh?: () => void;
  onUpdateMessage?: (messageId: string, updates: Partial<any>) => void;
}

export const CMIExpertSchedule = ({
  message,
  isMe,
  onRefresh,
  onUpdateMessage,
}: CMIExpertScheduleProps) => {
  const {profile} = useLoginStore();
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isArchived, setIsArchived] = useState(message?.archived || false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const {acceptExpertSchedule, declineExpertSchedule} = useScheduleStore();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  const status = message.content.schedule?.status || 'PENDING';
  const isActive = status === 'INCOMING' || status === 'ONGOING';
  const isCancelled = status === 'CANCELED';

  useEffect(() => {
    const calculateTimeLeft = () => {
      const createdAt = new Date(message.content.schedule.created_at).getTime();
      const now = new Date().getTime();
      const expirationTime = createdAt + 30 * 60 * 1000;
      const remaining = expirationTime - now;

      if (remaining <= 0) {
        setIsExpired(true);
        return 0;
      }
      return remaining;
    };

    const initialTimeLeft = calculateTimeLeft();
    setTimeLeft(initialTimeLeft);

    if (initialTimeLeft > 0) {
      const timer = setInterval(() => {
        const newTimeLeft = calculateTimeLeft();
        setTimeLeft(newTimeLeft);
        if (newTimeLeft <= 0) {
          clearInterval(timer);
          setIsExpired(true);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [message.content.schedule.created_at]);

  const formatTime = (milliseconds: number) => {
    if (milliseconds <= 0) return '00:00';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  const handleArchive = async () => {
    setShowArchiveDialog(false);
    const response = await archiveMessage(message.id);
    if (response.status) {
      setIsArchived(true);
      setShowConfirmDialog(false);
      onUpdateMessage?.(message.id, {archived: true});
    }
  };

  const handleLongPress = () => {
    if (isMe && !isArchived) {
      setShowArchiveDialog(true);
    }
  };

  const toggleDaySelection = (index: number) => {
    setSelectedDayIndex(selectedDayIndex === index ? null : index);
  };

  const formatDayName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {weekday: 'short'});
  };

  const formatDayNumber = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDate();
  };

  const formatTimeRange = (start: string, end: string) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    return `${startTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })} - ${endTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  // Calculate totals
  const totals = message.content.schedule.ScheduleDay.reduce(
    (acc, day) => {
      day.ScheduleDetail?.forEach(detail => {
        acc.steps += detail.goal_steps || 0;
        acc.distance += detail.goal_distance || 0;
        acc.calories += detail.goal_calories || 0;
        acc.time += detail.estimated_time || 0;
      });
      return acc;
    },
    {steps: 0, distance: 0, calories: 0, time: 0},
  );

  if (isArchived || !message.content) {
    return (
      <View style={styles.centeredContainer}>
        <View style={[styles.container, styles.archivedBubble]}>
          <Text style={styles.archivedText}>
            Expert schedule deleted{isMe ? ' by you' : ''}
          </Text>
          <View style={styles.footer}>
            <Text style={styles.timeText}>
              {formatTimestampAgo(message.created_at)}
            </Text>
            {message.read_at && (
              <Icon
                name="checkmark-done"
                size={14}
                color={theme.colors.primaryDark}
                style={styles.icon}
              />
            )}
          </View>
        </View>
      </View>
    );
  }

  // Determine bubble style based on status
  const bubbleStyle = [
    styles.container,
    isCancelled
      ? styles.cancelledBubble
      : isActive
      ? styles.activeBubble
      : isExpired
      ? styles.expiredBubble
      : styles.centeredBubble,
  ];

  // Determine text color based on status
  const textStyle = [
    isCancelled
      ? styles.cancelledText
      : isActive
      ? styles.activeText
      : isExpired
      ? styles.expiredText
      : styles.defaultText,
  ];

  return (
    <>
      <TouchableOpacity
        style={styles.centeredContainer}
        onLongPress={handleLongPress}
        activeOpacity={0.9}>
        <View style={bubbleStyle}>
          <View style={styles.avatarRow}>
            <CommonAvatar
              style={{marginRight: 10}}
              size={24}
              uri={message.sender.image?.url}
            />
            {isMe ? (
              <Text style={textStyle}>You </Text>
            ) : (
              <Text style={[textStyle, styles.senderName]}>
                {message.sender.name}{' '}
              </Text>
            )}
            <Text style={textStyle}>
              {isMe ? 'have' : 'has'} sent a Training Schedule
            </Text>
          </View>

          <Text style={[styles.scheduleTitle, textStyle]}>
            {message.content.schedule.title}
          </Text>

          {message.content.schedule.description && (
            <Text style={[styles.scheduleDescription, textStyle]}>
              {message.content.schedule.description}
            </Text>
          )}

          {/* Totals Summary */}
          <View style={styles.totalsContainer}>
            {totals.steps > 0 && (
              <View style={styles.totalItem}>
                <Icon
                  name="walk"
                  size={16}
                  color={
                    isCancelled
                      ? '#d60015'
                      : isActive
                      ? '#00880b'
                      : isExpired
                      ? '#d60015'
                      : theme.colors.primaryDark
                  }
                />
                <Text style={[styles.totalText, textStyle]}>
                  {totals.steps.toLocaleString()} steps
                </Text>
              </View>
            )}
            {totals.distance > 0 && (
              <View style={styles.totalItem}>
                <Icon
                  name="map"
                  size={16}
                  color={
                    isCancelled
                      ? '#d60015'
                      : isActive
                      ? '#00880b'
                      : isExpired
                      ? '#d60015'
                      : theme.colors.primaryDark
                  }
                />
                <Text style={[styles.totalText, textStyle]}>
                  {totals.distance} km
                </Text>
              </View>
            )}
            {totals.calories > 0 && (
              <View style={styles.totalItem}>
                <Icon
                  name="flame"
                  size={16}
                  color={
                    isCancelled
                      ? '#d60015'
                      : isActive
                      ? '#00880b'
                      : isExpired
                      ? '#d60015'
                      : theme.colors.primaryDark
                  }
                />
                <Text style={[styles.totalText, textStyle]}>
                  {totals.calories} cal
                </Text>
              </View>
            )}
            {totals.time > 0 && (
              <View style={styles.totalItem}>
                <Icon
                  name="time"
                  size={16}
                  color={
                    isCancelled
                      ? '#d60015'
                      : isActive
                      ? '#00880b'
                      : isExpired
                      ? '#d60015'
                      : theme.colors.primaryDark
                  }
                />
                <Text style={[styles.totalText, textStyle]}>
                  {Math.floor(totals.time / 60)}h {totals.time % 60}m
                </Text>
              </View>
            )}
          </View>

          {/* Status Message */}
          {status === 'PENDING' && isExpired ? (
            <View style={styles.statusMessage}>
              <Icon name="alert-circle" size={16} color="#d32f2f" />
              <Text style={styles.expirationText}>
                This schedule has expired
              </Text>
            </View>
          ) : status === 'PENDING' && !isExpired && !isMe ? (
            <Text style={styles.expirationCountdown}>
              Expires in: {formatTime(timeLeft)}
            </Text>
          ) : isActive ? (
            <View style={styles.statusMessage}>
              <Icon name="checkmark-circle" size={16} color="#388e3c" />
              <Text style={styles.activeStatusText}>
                {isMe
                  ? 'User has accepted this schedule'
                  : 'You have accepted this schedule'}
              </Text>
            </View>
          ) : isCancelled ? (
            <View style={styles.statusMessage}>
              <Icon name="close-circle" size={16} color="#d32f2f" />
              <Text style={styles.cancelledStatusText}>
                {isMe
                  ? 'User has cancelled this schedule'
                  : 'You have cancelled this schedule'}
              </Text>
            </View>
          ) : null}

          {/* Day Selection */}
          <FlatList
            horizontal
            data={message.content.schedule.ScheduleDay}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.daysContainer}
            renderItem={({item, index}) => (
              <TouchableOpacity
                style={[
                  styles.dayCircle,
                  selectedDayIndex === index && styles.dayCircleSelected,
                  item.is_rest_day && styles.restDayCircle,
                  (isExpired || isCancelled) && styles.expiredDayCircle,
                  isActive && styles.activeDayCircle,
                ]}
                onPress={() =>
                  !isExpired &&
                  !isCancelled &&
                  !isActive &&
                  toggleDaySelection(index)
                }>
                <Text style={[styles.dayName, textStyle]}>
                  {formatDayName(item.day)}
                </Text>
                <Text style={[styles.dayNumber, textStyle]}>
                  {formatDayNumber(item.day)}
                </Text>
                {item.is_rest_day && (
                  <Icon
                    name="bed"
                    size={12}
                    color={
                      isCancelled
                        ? '#d60015'
                        : isActive
                        ? '#00880b'
                        : isExpired
                        ? '#d60015'
                        : '#666'
                    }
                    style={styles.restIcon}
                  />
                )}
              </TouchableOpacity>
            )}
          />

          {/* Day Details */}
          {selectedDayIndex !== null && (
            <View style={styles.dayDetailsContainer}>
              {message.content.schedule.ScheduleDay[selectedDayIndex]
                .is_rest_day ? (
                <Text style={[styles.restDayText, textStyle]}>Rest Day</Text>
              ) : (
                message.content.schedule.ScheduleDay[
                  selectedDayIndex
                ].ScheduleDetail.map(detail => (
                  <View
                    key={detail.id}
                    style={[
                      styles.sessionContainer,
                      (isExpired || isCancelled) &&
                        styles.expiredSessionContainer,
                    ]}>
                    <Text style={[styles.sessionTitle, textStyle]}>
                      {detail.description}
                    </Text>
                    <Text style={[styles.sessionTime, textStyle]}>
                      {formatTimeRange(detail.start_time, detail.end_time)}
                    </Text>
                    <View style={styles.sessionGoals}>
                      {detail.goal_steps && (
                        <View style={styles.goalItem}>
                          <Icon
                            name="walk"
                            size={14}
                            color={
                              isCancelled
                                ? '#d60015'
                                : isActive
                                ? '#00880b'
                                : isExpired
                                ? '#d60015'
                                : '#666'
                            }
                          />
                          <Text style={[styles.goalText, textStyle]}>
                            {detail.goal_steps.toLocaleString()} steps
                          </Text>
                        </View>
                      )}
                      {detail.goal_distance && (
                        <View style={styles.goalItem}>
                          <Icon
                            name="map"
                            size={14}
                            color={
                              isCancelled
                                ? '#d60015'
                                : isActive
                                ? '#00880b'
                                : isExpired
                                ? '#d60015'
                                : '#666'
                            }
                          />
                          <Text style={[styles.goalText, textStyle]}>
                            {detail.goal_distance} km
                          </Text>
                        </View>
                      )}
                      {detail.goal_calories && (
                        <View style={styles.goalItem}>
                          <Icon
                            name="flame"
                            size={14}
                            color={
                              isCancelled
                                ? '#d60015'
                                : isActive
                                ? '#00880b'
                                : isExpired
                                ? '#d60015'
                                : '#666'
                            }
                          />
                          <Text style={[styles.goalText, textStyle]}>
                            {detail.goal_calories} cal
                          </Text>
                        </View>
                      )}
                      {detail.estimated_time && (
                        <View style={styles.goalItem}>
                          <Icon
                            name="time"
                            size={14}
                            color={
                              isCancelled
                                ? '#d60015'
                                : isActive
                                ? '#00880b'
                                : isExpired
                                ? '#d60015'
                                : '#666'
                            }
                          />
                          <Text style={[styles.goalText, textStyle]}>
                            {Math.floor(detail.estimated_time / 60)}h{' '}
                            {detail.estimated_time % 60}m
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {/* Action Buttons - Only show for PENDING status and not expired */}
          {status === 'PENDING' && !isExpired && !isMe && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() =>
                  acceptExpertSchedule(message.content.schedule.id)
                }>
                <Text style={styles.buttonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() =>
                  declineExpertSchedule(message.content.schedule.id)
                }>
                <Text style={styles.buttonText}>Decline</Text>
              </TouchableOpacity>
            </View>
          )}

          {status === 'PENDING' && isMe && !isExpired && (
            <View style={styles.waitingContainer}>
              <Text style={styles.waitingText}>
                Waiting for user to accept...
              </Text>
              <Text style={styles.expirationCountdown}>
                Expires in: {formatTime(timeLeft)}
              </Text>
            </View>
          )}

          <View style={styles.footer}>
            <Text style={[styles.timeText, textStyle]}>
              {formatTimestampAgo(message.created_at)}
            </Text>
            {message.read_at && (
              <Icon
                name="checkmark-done"
                size={14}
                color={
                  isCancelled
                    ? '#d60015'
                    : isActive
                    ? '#00880b'
                    : isExpired
                    ? '#d60015'
                    : theme.colors.primaryDark
                }
                style={styles.icon}
              />
            )}
          </View>
        </View>
      </TouchableOpacity>

      <CommonDialog
        visible={showArchiveDialog}
        onClose={() => setShowArchiveDialog(false)}
        title="Message Options"
        content={
          <View>
            <Text style={styles.dialogContentText}>
              What would you like to do with this schedule?
            </Text>
            <TouchableOpacity
              style={styles.dialogActionButton}
              onPress={() => {
                setShowArchiveDialog(false);
                setShowConfirmDialog(true);
              }}>
              <Icon name="archive" size={20} color={theme.colors.primaryDark} />
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
              Are you sure you want to delete this schedule?
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
  centeredContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 16,
  },
  container: {
    width: '90%',
    maxWidth: 400,
  },
  centeredBubble: {
    backgroundColor: '#e1f5fe',
    borderColor: '#039be5',
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
  },
  activeBubble: {
    backgroundColor: '#daffdd',
    borderColor: '#388e3c',
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
  },
  expiredBubble: {
    backgroundColor: '#ffebee',
    borderColor: '#ef9a9a',
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
  },
  cancelledBubble: {
    backgroundColor: '#ffebee',
    borderColor: '#d32f2f',
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
  },
  archivedBubble: {
    backgroundColor: '#f9f9f9',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  senderName: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '700',
  },
  defaultText: {
    color: '#01579b',
  },
  activeText: {
    color: '#1b5e20',
  },
  expiredText: {
    color: '#d32f2f',
  },
  cancelledText: {
    color: '#d32f2f',
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  scheduleDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  archivedText: {
    fontStyle: 'italic',
    color: '#999',
    fontSize: 14,
    marginBottom: 8,
  },
  totalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#b3e5fc',
  },
  totalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  totalText: {
    fontSize: 12,
    marginLeft: 4,
  },
  daysContainer: {
    marginBottom: 12,
  },
  dayCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#b3e5fc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  dayCircleSelected: {
    backgroundColor: '#4fc3f7',
    borderWidth: 2,
    borderColor: '#0288d1',
  },
  activeDayCircle: {
    backgroundColor: '#c8e6c9',
  },
  expiredDayCircle: {
    backgroundColor: '#ffced3',
  },
  restDayCircle: {
    backgroundColor: '#e0e0e0',
  },
  dayName: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  restIcon: {
    position: 'absolute',
    bottom: 2,
  },
  dayDetailsContainer: {
    marginBottom: 12,
  },
  restDayText: {
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 8,
  },
  sessionContainer: {
    backgroundColor: 'rgba(2, 136, 209, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  expiredSessionContainer: {
    backgroundColor: 'rgba(239, 154, 154, 0.1)',
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sessionTime: {
    fontSize: 12,
    marginBottom: 8,
  },
  sessionGoals: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  goalText: {
    fontSize: 12,
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  waitingContainer: {
    marginBottom: 12,
  },
  waitingText: {
    fontStyle: 'italic',
    color: '#757575',
    textAlign: 'center',
  },
  statusMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  activeStatusText: {
    color: '#388e3c',
    marginLeft: 8,
  },
  cancelledStatusText: {
    color: '#d32f2f',
    marginLeft: 8,
  },
  expirationCountdown: {
    textAlign: 'center',
    color: '#d32f2f',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
  },
  icon: {
    marginLeft: 4,
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
