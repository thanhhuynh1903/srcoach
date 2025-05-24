'use client';

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Modal,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import WorkoutComparison from './Comparison';
import useScheduleStore from '../../utils/useScheduleStore';
import { theme } from '../../contants/theme';
import Toast from 'react-native-toast-message';

interface Workout {
  time: string;
  name: string;
  steps: number;
  distance: number;
  calories: number;
  status: string;
  minbpm?: number;
  maxbpm?: number;
}

interface DaySchedule {
  day: number;
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
  expert_id: string;
  userName: string;
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
  expert_id,
  userName,
}: ScheduleCardProps) => {
  const navigation = useNavigation();
  const [selectedDay, setSelectedDay] = useState(initialSelectedDay);
  const [alarmEnabled, setAlarmEnabled] = useState(initialAlarmEnabled);
  const [expanded, setExpanded] = useState(false);
  const { deleteSchedule, message, clear } = useScheduleStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [expandAnimation] = useState(new Animated.Value(0));

  const handleMorePress = () => {
    setModalVisible(true);
  };
  const calculateTotals = (schedules: DaySchedule[]) => {
    let totalSteps = 0;
    let totalDistance = 0;
    let totalCalories = 0;

    schedules.forEach(day => {
      day.workouts.forEach(workout => {
        totalSteps += workout.steps || 0;
        totalDistance += workout.distance || 0;
        totalCalories += workout.calories || 0;
      });
    });

    return { totalSteps, totalDistance, totalCalories };
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Schedule',
      'Are you sure you want to delete this schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
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
    await navigation.navigate('UpdateScheduleScreen', { scheduleId: id });
    setModalVisible(false);
  };
  const handleViewDetail = async () => {
    await navigation.navigate('UpdateScheduleScreen', { scheduleId: id, view: true });
    setModalVisible(false);
  };
  const handleContact = async () => {
    Alert.alert('Tinh nang Contact voi expert dang bao tri')
    setModalVisible(false);
  };

  // Find the schedule for the selected day
  const selectedDaySchedule = daySchedules.find(
    schedule => schedule.day === selectedDay,
  );

  // Handle day selection with animation
  const handleDaySelect = (day: number) => {
    if (selectedDay === day) {
      toggleExpanded();
    } else {
      setSelectedDay(day);
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

    if (startDate && typeof startDate === 'string') {
      const date = new Date();
      return months[date.getMonth()];
    }

    return 'Current month';
  };

  const getStatusColor = () => {
    switch (status) {
      case 'COMPLETED':
        return '#22C55E'; // Green
      case 'UPCOMING':
        return '#3B82F6'; // Blue
      case 'ONGOING':
        return '#6366F1'; // Indigo
      case 'PENDING':
        return '#FF9F00';
      case 'MISSED':
        return '#EF4444'; // Red
      default:
        return '#64748B'; // Gray
    }
  };

  // Get heart rate zone color
  const getHeartRateColor = (minbpm?: number, maxbpm?: number) => {
    if (!minbpm || !maxbpm) return '#3B82F6';

    const avgBpm = (minbpm + maxbpm) / 2;

    if (avgBpm < 120) return '#22C55E'; // Light - Green
    if (avgBpm < 140) return '#3B82F6'; // Moderate - Blue
    if (avgBpm < 160) return '#F59E0B'; // Vigorous - Orange
    return '#EF4444'; // Maximum - Red
  };

  const maxHeight = expandAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 3000], // Adjust based on content
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
            style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleMorePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon name="ellipsis-vertical" size={18} color="#64748B" />
          </TouchableOpacity>
        </View>
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
            {calculateTotals(daySchedules).totalSteps.toLocaleString()}
          </Text>
          <Text style={styles.totalLabel}>Total Steps</Text>
        </View>

        {/* Distance */}
        <View style={styles.totalItem}>
          <Icon name="map-outline" size={20} color="#3B82F6" />
          <Text style={styles.totalValue}>
            {calculateTotals(daySchedules).totalDistance.toFixed(1)} km
          </Text>
          <Text style={styles.totalLabel}>Total Distance</Text>
        </View>

        {/* Calories */}
        <View style={styles.totalItem}>
          <Icon name="flame-outline" size={20} color="#F97316" />
          <Text style={styles.totalValue}>
            {calculateTotals(daySchedules).totalCalories.toLocaleString()}
          </Text>
          <Text style={styles.totalLabel}>Total Calories</Text>
        </View>
      </View>
      {/* Calendar Days */}
      <View style={styles.daysContainer}>
        {days?.map(day => {
          const currentDaySchedule = daySchedules.find(
            schedule => schedule.day === day,
          );
          const hasMissed = currentDaySchedule?.workouts.some(
            workout => workout.status === 'MISSED',
          );
          const isCompleted = currentDaySchedule?.workouts.every(
            workout => workout.status === 'COMPLETED',
          );

          return (
            <TouchableOpacity
              key={day}
              onPress={() => handleDaySelect(day)}
              style={[
                styles.dayCircle,
                selectedDay === day && styles.selectedDayCircle,
                hasMissed && styles.missedDayCircle,
                isCompleted && styles.completedDayCircle,
              ]}>
              <Text
                style={[
                  styles.dayText,
                  selectedDay === day && styles.selectedDayText,
                  hasMissed && styles.missedText,
                  isCompleted && styles.completedText,
                ]}>
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Workout Details for Selected Day - Animated */}
      <Animated.View
        style={[
          styles.workoutDetailsWrapper,
          { maxHeight, opacity: expandAnimation },
        ]}>
        {selectedDaySchedule && selectedDaySchedule.workouts.length > 0 && (
          <View style={styles.workoutDetailsContainer}>
            <Text style={styles.workoutDetailsTitle}>
              Workouts for {getMonthFromStartDate()} {selectedDay}
            </Text>
            {selectedDaySchedule.workouts?.map((workout, index) => (
              <View key={index} style={styles.workoutItem}>
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

            <WorkoutComparison workouts={selectedDaySchedule.workouts} />
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

          {user_id && userName && (
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

        <View style={styles.alarmContainer}>
          <Text style={styles.alarmText}>Alarm</Text>
          <Switch
            value={alarmEnabled}
            onValueChange={setAlarmEnabled}
            trackColor={{ false: '#E2E8F0', true: '#3B82F6' }}
            thumbColor={alarmEnabled ? '#fff' : '#fff'}
            ios_backgroundColor="#E2E8F0"
          />
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
                  <Text style={[styles.modalOptionText, { color: '#EF4444' }]}>
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
    shadowOffset: { width: 0, height: 2 },
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
  headerIcon: {
    marginRight: 4,
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
  },
  titleContainer: {
    marginBottom: 16,
  },
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
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
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    transform: [{ scale: 1.05 }],
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
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
  },
  workoutItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
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
    marginBottom: 12,
  },
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
    borderRadius: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  workoutStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  workoutStatusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  heartRateContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  heartRateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  heartRateIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  heartRateTitle: {
    fontSize: 15,
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
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  minBpmCard: {
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  maxBpmCard: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  bpmValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  bpmLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
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
  tagIcon: {
    marginRight: 4,
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

});

export default EnhancedScheduleCard;
