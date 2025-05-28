'use client';

import {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {useNavigation} from '@react-navigation/native';
import useScheduleStore from '../../utils/useScheduleStore';
import {theme} from '../../contants/theme';
import Toast from 'react-native-toast-message';
import {useLoginStore} from '../../utils/useLoginStore';
import PendingTimer from '../../PendingTimer';
import CommonDialog from '../../commons/CommonDialog';
import { CommonAvatar } from '../../commons/CommonAvatar';

interface Workout {
  time: string;
  name: string;
  steps: number;
  distance: number;
  calories: number;
  status: string;
  minbpm?: number;
  maxbpm?: number;
  actual_steps?: number;
  actual_distance?: number;
  actual_calories?: number;
}

interface DaySchedule {
  day: number;
  fullDate?: string;
  workouts: Workout[];
}

interface ScheduleCardProps {
  id: string;
  title: string;
  description: string;
  startDate: string;
  days: number[];
  selectedDay: number;
  alarmEnabled: boolean;
  isExpertChoice: boolean;
  daySchedules?: DaySchedule[];
  status: string;
  user_id: string;
  runnername?: string;
  expert_id: string;
  expertname: string;
  expertavatar: string
  created_at?: string;
}

const EnhancedScheduleCard = ({
  id,
  title,
  description,
  startDate,
  days,
  selectedDay: initialSelectedDay,
  alarmEnabled: initialAlarmEnabled,
  isExpertChoice,
  daySchedules = [],
  status,
  user_id,
  created_at,
  runnername,
  expert_id,
  expertname,
  expertavatar
}: ScheduleCardProps) => {
  const navigation = useNavigation();
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<
    'self' | 'expert' | null
  >(null);
  const [selectedDay, setSelectedDay] = useState(initialSelectedDay);
  const [alarmEnabled, setAlarmEnabled] = useState(initialAlarmEnabled);
  const [expanded, setExpanded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [expandAnimation] = useState(new Animated.Value(0));
  const {
    deleteSchedule,
    deleteScheduleExpert,
    clear,
    acceptExpertSchedule,
    declineExpertSchedule,
  } = useScheduleStore();
  const {schedules: selfSchedules} = useScheduleStore();
  const {profile} = useLoginStore();

  const hasSelfChoice = selfSchedules?.some(
    sch => sch.schedule_type !== 'EXPERT',
  );
  const isOwner = expert_id === profile?.id;

  const calculateTotals = (schedules: DaySchedule[]) => {
    let totalSteps = 0,
      totalDistance = 0,
      totalCalories = 0;
    let totalActualSteps = 0,
      totalActualDistance = 0,
      totalActualCalories = 0;

    schedules.forEach(day => {
      day.workouts.forEach(workout => {
        totalSteps += workout.steps || 0;
        totalDistance += workout.distance || 0;
        totalCalories += workout.calories || 0;
        totalActualSteps += workout.actual_steps || 0;
        totalActualDistance += workout.actual_distance || 0;
        totalActualCalories += workout.actual_calories || 0;
      });
    });

    return {
      totalActualSteps,
      totalActualDistance,
      totalActualCalories,
      totalSteps,
      totalDistance,
      totalCalories,
    };
  };

  const handleAccept = async () => {
    if (isExpertChoice && !isOwner && status === 'PENDING' && hasSelfChoice) {
      setShowAcceptDialog(true);
    } else {
      await acceptExpertSchedule(id);
    }
  };

  const confirmAccept = async () => {
    setShowAcceptDialog(false);
    await acceptExpertSchedule(id);
  };

  const handleDecline = async () => {
    await declineExpertSchedule(id);
  };

  const handleDelete = (type: 'self' | 'expert') => {
    setShowDeleteDialog(type);
  };

  const confirmDelete = async (type: 'self' | 'expert') => {
    try {
      const success = await (type === 'self'
        ? deleteSchedule(id)
        : deleteScheduleExpert(id));
      if (success) {
        await clear();
        Toast.show({type: 'success', text1: `Schedule deleted successfully`});
      }
    } catch {
      Toast.show({type: 'error', text1: `Failed to delete schedule`});
    } finally {
      setShowDeleteDialog(null);
    }
  };

  const handleEdit = () => {
    navigation.navigate('UpdateScheduleScreen', {scheduleId: id});
    setModalVisible(false);
  };

  const handleViewDetail = () => {
    navigation.navigate('UpdateScheduleScreen', {scheduleId: id, view: true});
    setModalVisible(false);
  };

  const handleContact = () => {
    setModalVisible(false);
    // Placeholder for contact functionality
    Toast.show({type: 'info', text1: 'Contact feature under maintenance'});
  };

  const selectedDaySchedule = daySchedules.find(
    schedule => schedule.day === selectedDay,
  );

  const handleDaySelect = (day: number) => {
    setSelectedDay(day);
    toggleExpanded(day !== selectedDay || !expanded);
  };

  const toggleExpanded = (forceExpand = !expanded) => {
    setExpanded(forceExpand);
    Animated.timing(expandAnimation, {
      toValue: forceExpand ? 1 : 0,
      duration: 300,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start();
  };

  const getMonthFromStartDate = () => {
    const date = selectedDaySchedule?.fullDate
      ? new Date(selectedDaySchedule.fullDate)
      : startDate && typeof startDate === 'string'
      ? new Date(startDate)
      : new Date();
    return date.toLocaleString('en-US', {month: 'long'});
  };

  const formatStartDate = (dateString: string) => {
    return dateString && typeof dateString === 'string'
      ? new Date(dateString).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : 'Unknown date';
  };

  const getStatusColor = (isWorkout = false) =>
    ({
      COMPLETED: '#22C55E',
      UPCOMING: '#3B82F6',
      ONGOING: '#6366F1',
      PENDING: '#FF9F00',
      INCOMING: isWorkout ? '#64748B' : '#3B82F6',
      MISSED: '#EF4444',
    }[status] || '#64748B');

  const maxHeight = expandAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 3000],
  });

  return (
    <View style={styles.card}>
      <PendingTimer startDate={startDate} status={status} />
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Icon
            name="calendar-outline"
            size={14}
            color="#64748B"
            style={styles.headerIcon}
          />
          <Text style={styles.startedText}>
            Started in {formatStartDate(created_at)}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <View
            style={[styles.statusBadge, {backgroundColor: getStatusColor()}]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
          {status === 'PENDING' && isOwner ? (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete('expert')}>
              <Icon name="trash-outline" size={16} color="#EF4444" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setModalVisible(true)}
              hitSlop={10}>
              <Icon name="ellipsis-vertical" size={18} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.cardTitle}>{title}</Text>
        {description && (
          <Text style={styles.cardDescription}>{description}</Text>
        )}
      </View>

      <View style={styles.totalsContainer}>
        <View style={styles.totalItem}>
          <Icon name="footsteps-outline" size={20} color="#3B82F6" />
          <View style={styles.totalValueContainer}>
            <Text style={styles.totalActualValue}>
              {calculateTotals(daySchedules).totalActualSteps.toLocaleString()}
            </Text>
            <Text style={styles.totalGoalValue}>
              /{calculateTotals(daySchedules).totalSteps.toLocaleString()}
            </Text>
          </View>
          <Text style={styles.totalLabel}>Total Steps</Text>
        </View>
        <View style={styles.totalItem}>
          <Icon name="map-outline" size={20} color="#3B82F6" />
          <View style={styles.totalValueContainer}>
            <Text style={styles.totalActualValue}>
              {calculateTotals(daySchedules).totalActualDistance.toFixed(1)}
            </Text>
            <Text style={styles.totalGoalValue}>
              /{calculateTotals(daySchedules).totalDistance.toFixed(1)} km
            </Text>
          </View>
          <Text style={styles.totalLabel}>Total Distance</Text>
        </View>
        <View style={styles.totalItem}>
          <Icon name="flame-outline" size={20} color="#F97316" />
          <View style={styles.totalValueContainer}>
            <Text style={styles.totalActualValue}>
              {calculateTotals(
                daySchedules,
              ).totalActualCalories.toLocaleString()}
            </Text>
            <Text style={styles.totalGoalValue}>
              /{calculateTotals(daySchedules).totalCalories.toLocaleString()}
            </Text>
          </View>
          <Text style={styles.totalLabel}>Total Calories</Text>
        </View>
      </View>

      <View style={styles.daysContainer}>
        {days.map(day => {
          const schedule = daySchedules.find(s => s.day === day);
          const isMissed = schedule?.workouts.some(w => w.status === 'MISSED');
          const isCompleted = schedule?.workouts.every(
            w => w.status === 'COMPLETED',
          );
          return (
            <TouchableOpacity
              key={day}
              onPress={() => handleDaySelect(day)}
              style={[
                styles.dayCircle,
                selectedDay === day && styles.selectedDayCircle,
                isMissed && styles.missedDayCircle,
                isCompleted && styles.completedDayCircle,
              ]}>
              <Text
                style={[
                  styles.dayText,
                  selectedDay === day && styles.selectedDayText,
                  isMissed && styles.missedText,
                  isCompleted && styles.completedText,
                ]}>
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Animated.View
        style={[
          styles.workoutDetailsWrapper,
          {maxHeight, opacity: expandAnimation},
        ]}>
        {selectedDaySchedule?.workouts.length > 0 && (
          <View style={styles.workoutDetailsContainer}>
            <Text style={styles.workoutDetailsTitle}>
              Workouts for {getMonthFromStartDate()} {selectedDay}
            </Text>
            {selectedDaySchedule.workouts.map((workout, index) => (
              <View key={index} style={styles.workoutItem}>
                <View style={styles.timeContainer}>
                  <View style={styles.timeChildContainer}>
                    <Icon name="time-outline" size={16} color="#64748B" />
                    <Text style={styles.timeText}>{workout.time}</Text>
                  </View>
                  <View
                    style={[
                      styles.workoutStatusBadge,
                      {backgroundColor: getStatusColor(true)},
                    ]}>
                    <Text style={styles.workoutStatusText}>
                      {workout.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.sessionNameContainer}>
                  <Text style={styles.sessionName}>{workout.name}</Text>
                </View>
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <View style={styles.statIconContainer}>
                      <Icon
                        name="footsteps-outline"
                        size={20}
                        color="#3B82F6"
                      />
                    </View>
                    <View style={styles.statValueContainer}>
                      <Text style={styles.statActualValue}>
                        {(workout.actual_steps || 0).toLocaleString()}
                      </Text>
                      <Text style={styles.statGoalValue}>
                        /{workout.steps.toLocaleString()}
                      </Text>
                    </View>
                    <Text style={styles.statLabel}>Steps</Text>
                  </View>
                  <View style={styles.statItem}>
                    <View style={styles.statIconContainer}>
                      <Icon name="map-outline" size={20} color="#3B82F6" />
                    </View>
                    <View style={styles.statValueContainer}>
                      <Text style={styles.statActualValue}>
                        {(workout.actual_distance || 0).toFixed(1)}
                      </Text>
                      <Text style={styles.statGoalValue}>
                        /{workout.distance.toFixed(1)} km
                      </Text>
                    </View>
                    <Text style={styles.statLabel}>Distance</Text>
                  </View>
                  <View style={styles.statItem}>
                    <View style={styles.statIconContainer}>
                      <Icon name="flame-outline" size={20} color="#F97316" />
                    </View>
                    <View style={styles.statValueContainer}>
                      <Text style={styles.statActualValue}>
                        {(workout.actual_calories || 0).toLocaleString()}
                      </Text>
                      <Text style={styles.statGoalValue}>
                        /{workout.calories.toLocaleString()}
                      </Text>
                    </View>
                    <Text style={styles.statLabel}>Calories</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </Animated.View>

      <View style={styles.cardFooter}>
        <View style={styles.footerTags}>
          <View style={styles.tagContainer}>
            <Icon
              name={isExpertChoice ? 'ribbon-outline' : 'person-outline'}
              size={14}
              color="#052658"
              style={styles.tagIcon}
            />
            <Text style={styles.tagText}>
              {isExpertChoice ? "Expert's Choice" : "Self's Choice"}
            </Text>
          </View>
          {expertname && (
            <View style={styles.expertRole}>
              <CommonAvatar uri={expertavatar} size={14} style={styles.tagIcon} />
              <Text style={styles.tagText}>{expertname}</Text>
            </View>
          )}
          {runnername && (
            <View style={styles.runnerRole}>
              <Icon
                name="person-circle-outline"
                size={14}
                color="#FFF"
                style={styles.tagIcon}
              />
              <Text style={styles.runnerText}>{runnername}</Text>
            </View>
          )}
        </View>
      </View>

      {!isOwner && status === 'PENDING' && (
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButtonBase, styles.acceptButton]}
            onPress={handleAccept}
            activeOpacity={0.8}>
            <Icon
              name="checkmark-circle"
              size={20}
              color="#fff"
              style={styles.buttonIcon}
            />
            <Text style={styles.actionButtonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButtonBase, styles.declineButton]}
            onPress={handleDecline}
            activeOpacity={0.8}>
            <Icon
              name="close-circle"
              size={20}
              color="#fff"
              style={styles.buttonIcon}
            />
            <Text style={styles.actionButtonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />
            {status !== 'PENDING' &&
              status !== 'MISSED' &&
              status !== 'COMPLETED' &&
              !isOwner && (
                <>
                  <View style={styles.modalAlarmSection}>
                    <View style={styles.modalAlarmHeader}>
                      <Icon name="alarm-outline" size={24} color="#3B82F6" />
                      <Text style={styles.modalAlarmTitle}>Alarm Settings</Text>
                    </View>
                    <View style={styles.modalAlarmControl}>
                      <Text style={styles.modalAlarmText}>
                        Enable workout reminders
                      </Text>
                      <Switch
                        value={alarmEnabled}
                        onValueChange={setAlarmEnabled}
                        trackColor={{false: '#E2E8F0', true: '#3B82F6'}}
                        thumbColor="#fff"
                        ios_backgroundColor="#E2E8F0"
                      />
                    </View>
                  </View>
                  <View style={styles.modalDivider} />
                </>
              )}
            {isOwner || !isExpertChoice ? (
              <>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={handleEdit}>
                  <Icon
                    name="create-outline"
                    size={24}
                    color={theme.colors.primaryDark}
                  />
                  <Text style={styles.modalOptionText}>Update</Text>
                </TouchableOpacity>
                <View style={styles.modalDivider} />
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() =>
                    handleDelete(isExpertChoice ? 'expert' : 'self')
                  }>
                  <Icon name="trash-outline" size={24} color="#EF4444" />
                  <Text style={[styles.modalOptionText, {color: '#EF4444'}]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={handleViewDetail}>
                  <Icon
                    name="eye-outline"
                    size={24}
                    color={theme.colors.primaryDark}
                  />
                  <Text style={styles.modalOptionText}>View Details</Text>
                </TouchableOpacity>
                <View style={styles.modalDivider} />
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={handleContact}>
                  <Icon
                    name="arrow-redo-circle-outline"
                    size={24}
                    color={theme.colors.primaryDark}
                  />
                  <Text style={styles.modalOptionText}>Contact</Text>
                </TouchableOpacity>
              </>
            )}
            <View style={styles.modalDivider} />
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <CommonDialog
        visible={showAcceptDialog}
        onClose={() => setShowAcceptDialog(false)}
        title="Accept Expert's Schedule"
        content={
          <Text>
            Your current schedule will be deleted if you accept this expert's
            schedule.
          </Text>
        }
        actionButtons={[
          {
            label: 'Cancel',
            variant: 'outlined',
            handler: () => setShowAcceptDialog(false),
          },
          {
            label: 'Accept',
            variant: 'contained',
            color: '#22C55E',
            handler: confirmAccept,
            iconName: 'checkmark-circle-outline',
          },
        ]}
      />

      <CommonDialog
        visible={showDeleteDialog === 'self'}
        onClose={() => setShowDeleteDialog(null)}
        title="Delete Schedule"
        content={<Text>Are you sure you want to delete this schedule?</Text>}
        actionButtons={[
          {
            label: 'Cancel',
            variant: 'outlined',
            handler: () => setShowDeleteDialog(null),
          },
          {
            label: 'Delete',
            variant: 'contained',
            color: '#EF4444',
            handler: () => confirmDelete('self'),
            iconName: 'trash-outline',
          },
        ]}
      />

      <CommonDialog
        visible={showDeleteDialog === 'expert'}
        onClose={() => setShowDeleteDialog(null)}
        title="Delete Expert Schedule"
        content={
          <Text>Are you sure you want to delete this expert schedule?</Text>
        }
        actionButtons={[
          {
            label: 'Cancel',
            variant: 'outlined',
            handler: () => setShowDeleteDialog(null),
          },
          {
            label: 'Delete',
            variant: 'contained',
            color: '#EF4444',
            handler: () => confirmDelete('expert'),
            iconName: 'trash-outline',
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {marginRight: 4},
  startedText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 20,
  },
  titleContainer: {marginBottom: 16},
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
    color: '#0F172A',
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  daysContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedDayCircle: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
    shadowColor: '#1E40AF',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    transform: [{scale: 1.05}],
  },
  missedDayCircle: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  completedDayCircle: {
    backgroundColor: '#DCFCE7',
    borderColor: '#22C55E',
  },
  dayText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  selectedDayText: {color: '#FFF'},
  missedText: {color: '#EF4444'},
  completedText: {color: '#22C55E'},
  workoutDetailsWrapper: {overflow: 'hidden'},
  workoutDetailsContainer: {
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
  },
  workoutDetailsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
  },
  workoutItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeChildContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timeText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 6,
    fontWeight: '500',
  },
  sessionNameContainer: {marginBottom: 12},
  sessionName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0F172A',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValueContainer: {
    alignItems: 'center',
  },
  statActualValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  statGoalValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  workoutStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  workoutStatusText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  footerTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
  },
  expertRole: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFD586',
    borderWidth: 1,
    borderColor: '#CA7842',
  },
  runnerRole: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#3D90D7',
    borderWidth: 1,
    borderColor: '#5409DA',
  },
  tagIcon: {marginRight: 4},
  tagText: {
    fontSize: 13,
    color: '#052658',
    fontWeight: '500',
  },
  runnerText: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 30,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  modalOptionText: {
    fontSize: 16,
    marginLeft: 16,
    color: '#0F172A',
    fontWeight: '500',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  modalCancelButton: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginTop: 16,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primaryDark,
  },
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  totalItem: {
    alignItems: 'center',
    flex: 1,
  },
  totalValueContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  totalActualValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  totalGoalValue: {
    fontSize: 12,
    color: '#64748B',
  },
  totalLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingHorizontal: 4,
  },
  actionButtonBase: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  acceptButton: {
    backgroundColor: '#22C55E',
    shadowColor: '#22C55E',
  },
  declineButton: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  buttonIcon: {marginRight: 8},
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalAlarmSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  modalAlarmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalAlarmTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginLeft: 12,
  },
  modalAlarmControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalAlarmText: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '500',
  },
});

export default EnhancedScheduleCard;
