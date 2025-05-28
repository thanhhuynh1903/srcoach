import {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Animated,
  Easing,
  ScrollView,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {useNavigation} from '@react-navigation/native';
import WorkoutComparison from './Comparison';
import useScheduleStore from '../../utils/useScheduleStore';
import {theme} from '../../contants/theme';
import Toast from 'react-native-toast-message';

// API Workout
interface Workout {
  id: string;
  description: string;
  start_time: string;
  end_time: string;
  goal_steps: number;
  goal_distance: number;
  goal_calories: number;
  goal_minbpms?: number | null;
  goal_maxbpms?: number | null;
  status?: string;
}

// API DaySchedule
interface DaySchedule {
  id: string;
  day: string; // ISO string
  ScheduleDetail: Workout[];
}

interface ScheduleCardProps {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  isExpertChoice: boolean;
  userName?: string;
  ScheduleDay: DaySchedule[];
}

const EnhancedHistoryCard = ({
  id,
  title,
  description,
  startDate,
  endDate,
  status,
  isExpertChoice,
  userName,
  ScheduleDay = [],
}: ScheduleCardProps) => {
  const navigation = useNavigation();
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [alarmEnabled, setAlarmEnabled] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const {deleteSchedule, clear} = useScheduleStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [expandAnimation] = useState(new Animated.Value(0));
  const calculateTotals = (schedules: DaySchedule[]) => {
    let totalSteps = 0;
    let totalDistance = 0;
    let totalCalories = 0;

    schedules.forEach(day => {
      day.ScheduleDetail.forEach(workout => {
        totalSteps += workout.goal_steps || 0;
        totalDistance += workout.goal_distance || 0;
        totalCalories += workout.goal_calories || 0;
      });
    });

    return {totalSteps, totalDistance, totalCalories};
  };
  // Sort days ascending
  const sortedDays = [...ScheduleDay].sort(
    (a, b) => new Date(a.day).getTime() - new Date(b.day).getTime(),
  );

  // For UI: get day numbers
  const dayNumbers = sortedDays.map(day => new Date(day.day).getDate());

  // Get selected day schedule
  const selectedDay = sortedDays[selectedDayIdx];

  // Map workouts for UI
  const workouts =
    selectedDay?.ScheduleDetail?.map(detail => ({
      id: detail.id,
      name: detail.description,
      time: `${new Date(detail.start_time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
      })} - ${new Date(detail.end_time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
      })}`,
      steps: detail.goal_steps,
      distance: detail.goal_distance,
      calories: detail.goal_calories,
      minbpm: detail.goal_minbpms,
      maxbpm: detail.goal_maxbpms,
      status: detail.status,
    })) || [];

  // Stats for selected day
  const stats = (() => {
    let steps = 0,
      distance = 0,
      calories = 0,
      heartRate = 0,
      hrCount = 0;
    if (selectedDay?.ScheduleDetail) {
      selectedDay.ScheduleDetail.forEach(detail => {
        steps += detail.goal_steps || 0;
        distance += detail.goal_distance || 0;
        calories += detail.goal_calories || 0;
        if (detail.goal_maxbpms) {
          heartRate += detail.goal_maxbpms;
          hrCount++;
        }
      });
    }
    return {
      steps,
      distance,
      calories,
      heartRate: hrCount ? Math.round(heartRate / hrCount) : 0,
    };
  })();

  const handleMorePress = () => setModalVisible(true);

  const handleDelete = () => {
    Alert.alert(
      'Delete Schedule',
      'Are you sure you want to delete this schedule?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          async onPress() {
            try {
              const success = await deleteSchedule(id);
              if (success) {
                await clear();
                Toast.show({
                  type: 'success',
                  text1: 'Schedule deleted successfully',
                });
              }
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Failed to delete schedule',
              });
            }
          },
        },
      ],
    );
  };

  const handleEdit = async () => {
    await navigation.navigate('UpdateScheduleScreen', {scheduleId: id});
    setModalVisible(false);
  };
  const handleViewDetail = async () => {
    await navigation.navigate('UpdateScheduleScreen', {
      scheduleId: id,
      view: true,
    });
    setModalVisible(false);
  };
  const handleContact = async () => {
    Alert.alert('Tinh nang Contact voi expert dang bao tri');
    setModalVisible(false);
  };

  // Handle day selection with animation
  const handleDaySelect = (idx: number) => {
    if (selectedDayIdx === idx) {
      toggleExpanded();
    } else {
      setSelectedDayIdx(idx);
      if (!expanded) {
        toggleExpanded(true);
      }
    }
  };

  const toggleExpanded = (forceExpand = null) => {
    const newExpandedState = forceExpand !== null ? forceExpand : !expanded;
    setExpanded(newExpandedState);

    Animated.timing(expandAnimation, {
      toValue: newExpandedState ? 1 : 0,
      duration: 300,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start();
  };

  const getMonthFromStartDate = () => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    if (startDate && !isNaN(Date.parse(startDate))) {
      const date = new Date(startDate);
      return months[date.getMonth()];
    }
    return 'Current month';
  };

  const getStatusColor = () => {
    switch (status) {
      case 'COMPLETED':
        return '#22C55E';
      case 'UPCOMING':
        return '#3B82F6';
      case 'ONGOING':
        return '#6366F1';
      case 'MISSED':
        return '#EF4444';
      default:
        return '#64748B';
    }
  };

  // Get heart rate zone color
  const getHeartRateColor = (minbpm?: number, maxbpm?: number) => {
    if (!minbpm || !maxbpm) return '#3B82F6';
    const avgBpm = (minbpm + maxbpm) / 2;
    if (avgBpm < 120) return '#22C55E';
    if (avgBpm < 140) return '#3B82F6';
    if (avgBpm < 160) return '#F59E0B';
    return '#EF4444';
  };

  const maxHeight = expandAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 3000],
  });

  return (
    <View style={styles.card}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Icon
            name="calendar-outline"
            size={14}
            color="#64748B"
            style={styles.headerIcon}
          />
          <Text style={styles.startedText}>Started {startDate}</Text>
        </View>
        <View style={styles.headerRight}>
          <View
            style={[styles.statusBadge, {backgroundColor: getStatusColor()}]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>
        {/* <View style={styles.headerRight}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleMorePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="ellipsis-vertical" size={18} color="#64748B" />
          </TouchableOpacity>
        </View> */}
      </View>

      {/* Card Title and Description */}
      <View style={styles.titleContainer}>
        <Text style={styles.cardTitle}>{title}</Text>
        {description && (
          <Text style={styles.cardDescription}>{description}</Text>
        )}
      </View>
      <View style={styles.totalsContainer}>
        {/* Steps */}
        <View style={styles.totalItem}>
          <Icon name="footsteps-outline" size={20} color="#3B82F6" />
          <Text style={styles.totalValue}>
            {calculateTotals(ScheduleDay).totalSteps.toLocaleString()}
          </Text>
          <Text style={styles.totalLabel}>Total Steps</Text>
        </View>

        {/* Distance */}
        <View style={styles.totalItem}>
          <Icon name="map-outline" size={20} color="#3B82F6" />
          <Text style={styles.totalValue}>
            {calculateTotals(ScheduleDay).totalDistance.toFixed(1)} km
          </Text>
          <Text style={styles.totalLabel}>Total Distance</Text>
        </View>

        {/* Calories */}
        <View style={styles.totalItem}>
          <Icon name="flame-outline" size={20} color="#F97316" />
          <Text style={styles.totalValue}>
            {calculateTotals(ScheduleDay).totalCalories.toLocaleString()}
          </Text>
          <Text style={styles.totalLabel}>Total Calories</Text>
        </View>
      </View>
      {/* Calendar Days */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.daysContainer}>
        {dayNumbers.map((dayNum, idx) => {
          const currentDay = sortedDays[idx];
          const hasMissed = currentDay?.ScheduleDetail?.some(
            workout => workout.status === 'MISSED',
          );
          const isCompleted =
            currentDay?.ScheduleDetail?.length > 0 &&
            currentDay?.ScheduleDetail?.every(
              workout => workout.status === 'COMPLETED',
            );
          return (
            <TouchableOpacity
              key={currentDay.id}
              onPress={() => handleDaySelect(idx)}
              style={[
                styles.dayCircle,
                selectedDayIdx === idx && styles.selectedDayCircle,
                hasMissed && styles.missedDayCircle,
                isCompleted && styles.completedDayCircle,
              ]}>
              <Text
                style={[
                  styles.dayText,
                  selectedDayIdx === idx && styles.selectedDayText,
                  hasMissed && styles.missedText,
                  isCompleted && styles.completedText,
                ]}>
                {dayNum}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Workout Details for Selected Day - Animated */}
      <Animated.View
        style={[
          styles.workoutDetailsWrapper,
          {maxHeight, opacity: expandAnimation},
        ]}>
        {workouts.length > 0 && (
          <View style={styles.workoutDetailsContainer}>
            <Text style={styles.workoutDetailsTitle}>
              Workouts for {getMonthFromStartDate()}{' '}
              {selectedDay ? new Date(selectedDay.day).getDate() : ''}
            </Text>
            {workouts.map((workout, index) => (
              <View key={workout.id || index} style={styles.workoutItem}>
                {/* Time and Status */}
                <View style={styles.timeContainer}>
                  <View style={styles.timeChildContainer}>
                    <Icon name="time-outline" size={16} color="#64748B" />
                    <Text style={styles.timeText}>{workout.time}</Text>
                  </View>
                  <View
                    style={[
                      styles.workoutStatusBadge,
                      {
                        backgroundColor:
                          workout.status === 'COMPLETED'
                            ? '#22C55E'
                            : workout.status === 'UPCOMING'
                            ? '#3B82F6'
                            : workout.status === 'ONGOING'
                            ? '#6366F1'
                            : '#EF4444',
                      },
                    ]}>
                    <Text style={styles.workoutStatusText}>
                      {workout.status}
                    </Text>
                  </View>
                </View>

                {/* Session Name */}
                <View style={styles.sessionNameContainer}>
                  <Text style={styles.sessionName}>{workout.name}</Text>
                </View>

                {/* Enhanced Heart Rate Target Section */}
                {(workout.minbpm || workout.maxbpm) && (
                  <View
                    style={[
                      styles.heartRateContainer,
                      {
                        borderLeftColor: getHeartRateColor(
                          workout.minbpm,
                          workout.maxbpm,
                        ),
                      },
                    ]}>
                    <View style={styles.heartRateHeader}>
                      <View
                        style={[
                          styles.heartRateIconContainer,
                          {
                            backgroundColor: `${getHeartRateColor(
                              workout.minbpm,
                              workout.maxbpm,
                            )}20`,
                          },
                        ]}>
                        <Icon
                          name="heart"
                          size={16}
                          color={getHeartRateColor(
                            workout.minbpm,
                            workout.maxbpm,
                          )}
                        />
                      </View>
                      <Text style={styles.heartRateTitle}>
                        Heart Rate Target
                      </Text>
                    </View>

                    {/* Improved BPM Range Display */}
                    <View style={styles.bpmCardContainer}>
                      <View
                        style={[
                          styles.bpmCard,
                          styles.minBpmCard,
                          {
                            borderColor: getHeartRateColor(
                              workout.minbpm,
                              workout.maxbpm,
                            ),
                          },
                        ]}>
                        <Text style={styles.bpmValue}>
                          {workout.minbpm || 100}
                        </Text>
                        <Text style={styles.bpmLabel}>Min BPM</Text>
                      </View>

                      <View style={styles.bpmConnector}>
                        <View
                          style={[
                            styles.bpmConnectorLine,
                            {
                              backgroundColor: getHeartRateColor(
                                workout.minbpm,
                                workout.maxbpm,
                              ),
                            },
                          ]}
                        />
                      </View>

                      <View
                        style={[
                          styles.bpmCard,
                          styles.maxBpmCard,
                          {
                            borderColor: getHeartRateColor(
                              workout.minbpm,
                              workout.maxbpm,
                            ),
                          },
                        ]}>
                        <Text style={styles.bpmValue}>
                          {workout.maxbpm || 180}
                        </Text>
                        <Text style={styles.bpmLabel}>Max BPM</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Stats */}
                <View style={styles.statsContainer}>
                  {/* Steps */}
                  <View style={styles.statItem}>
                    <View style={styles.statIconContainer}>
                      <Icon
                        name="footsteps-outline"
                        size={20}
                        color="#3B82F6"
                      />
                    </View>
                    <Text style={styles.statValue}>
                      {workout.steps.toLocaleString()}
                    </Text>
                    <Text style={styles.statLabel}>Steps</Text>
                  </View>

                  {/* Distance */}
                  <View style={styles.statItem}>
                    <View style={styles.statIconContainer}>
                      <Icon name="map-outline" size={20} color="#3B82F6" />
                    </View>
                    <Text style={styles.statValue}>{workout.distance} km</Text>
                    <Text style={styles.statLabel}>Distance</Text>
                  </View>

                  {/* Calories */}
                  <View style={styles.statItem}>
                    <View style={styles.statIconContainer}>
                      <Icon name="flame-outline" size={20} color="#F97316" />
                    </View>
                    <Text style={styles.statValue}>{workout.calories}</Text>
                    <Text style={styles.statLabel}>Calories</Text>
                  </View>
                </View>
              </View>
            ))}

            <WorkoutComparison workouts={workouts} />
          </View>
        )}
      </Animated.View>

      {/* Card Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.footerTags}>
          {isExpertChoice ? (
            <View style={styles.tagContainer}>
              <Icon
                name="ribbon-outline"
                size={14}
                color="#052658"
                style={styles.tagIcon}
              />
              <Text style={styles.tagText}>Expert's Choice</Text>
            </View>
          ) : (
            <View style={styles.tagContainer}>
              <Icon
                name="person-outline"
                size={14}
                color="#052658"
                style={styles.tagIcon}
              />
              <Text style={styles.tagText}>Self's Choice</Text>
            </View>
          )}

          {userName && (
            <View style={styles.tagContainer}>
              <Icon
                name="person-circle-outline"
                size={14}
                color="#052658"
                style={styles.tagIcon}
              />
              <Text style={styles.tagText}>{userName}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Action Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />
            {!isExpertChoice ? (
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
                  onPress={handleDelete}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
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
  headerIcon: {
    marginRight: 6,
  },
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
    backgroundColor: '#F8FAFC',
  },
  titleContainer: {
    marginBottom: 16,
  },
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  totalItem: {
    alignItems: 'center',
    flex: 1,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  daysContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingRight: 16,
    marginBottom: 16,
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 10,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  missedText: {
    color: '#EF4444',
  },
  completedText: {
    color: '#22C55E',
  },
  workoutDetailsWrapper: {
    overflow: 'hidden',
  },
  workoutDetailsContainer: {
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
  },
  workoutDetailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
  },
  workoutItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
  sessionNameContainer: {
    marginBottom: 14,
  },
  sessionName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  workoutStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  workoutStatusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heartRateContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  heartRateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  heartRateIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  heartRateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
  },
  bpmCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  bpmCard: {
    width: '40%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  minBpmCard: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  maxBpmCard: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  bpmValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  bpmLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  bpmConnector: {
    width: '20%',
    height: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bpmConnectorLine: {
    height: 2,
    width: '100%',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  footerTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
  },
  tagIcon: {
    marginRight: 6,
  },
  tagText: {
    fontSize: 13,
    color: '#052658',
    fontWeight: '500',
  },
  alarmContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alarmText: {
    fontSize: 14,
    color: '#64748B',
    marginRight: 8,
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
});

export default EnhancedHistoryCard;
