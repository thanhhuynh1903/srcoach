import {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Modal,
  Alert
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {useNavigation} from '@react-navigation/native';
import WorkoutComparison from './Comparison';
import useScheduleStore from '../../utils/useScheduleStore';
import {theme} from '../../contants/theme';
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
}: ScheduleCardProps) => {
  const navigation = useNavigation();
  const [selectedDay, setSelectedDay] = useState(initialSelectedDay);
  const [alarmEnabled, setAlarmEnabled] = useState(initialAlarmEnabled);
  const [expanded, setExpanded] = useState(false);
  const {deleteSchedule,message,clear} = useScheduleStore();
  const [modalVisible, setModalVisible] = useState(false);

  const handleMorePress = () => {
    setModalVisible(true);
  };
  const handleDelete = () => {    
    Alert.alert(
      'Delete Schedule',
      'Are you sure you want to delete this schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          async onPress() {
            try {
              const success = await deleteSchedule(id);
                            
              if (success) {
                await clear();
                Toast.show({
                  type: 'success',
                  text1:'Delete Schedule successful'
                });
              }
            } catch (error) {
              Toast.show({ type: 'error', text1: 'Xóa thất bại' });
            }
          }
        }
      ]
  
    );
  };

  const handleEdit = async () => {
  await navigation.navigate('UpdateScheduleScreen', {scheduleId: id});
  setModalVisible(false);
  };
  // Find the schedule for the selected day
  const selectedDaySchedule = daySchedules.find(
    schedule => schedule.day === selectedDay,
  );

  // Handle day selection
  const handleDaySelect = (day: number) => {
    if (selectedDay === day) {
      setExpanded(!expanded);
    } else {
      setSelectedDay(day);
      setExpanded(true);
    }
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

    // Nếu startDate có định dạng "Tháng X, ngày, năm"
    if (startDate && typeof startDate === 'string') {
      const date = new Date();
      return months[date.getMonth()];
    }

    return 'Current month';
  };

  const getStatusColor = () => {
    switch (status) {
      case 'COMPLETED':
        return '#22C55E'; // Xanh lá
      case 'INCOMING':
        return '#3B82F6'; // Xanh dương
      case 'ONGOING':
        return '#64748B'; 
      case 'MISSED':
        return '#CB0404';
      default:
        return '#64748B'; // Xám
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

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.startedText}>Started {startDate}</Text>
        <View style={styles.headerRight}>
          <View
            style={[styles.statusBadge, {backgroundColor: getStatusColor()}]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleMorePress}>
            <Icon name="ellipsis-vertical" size={18} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>

      {/* Calendar Days */}
      <View style={styles.daysContainer}>
       {days.map(day => {
  const currentDaySchedule = daySchedules.find(schedule => schedule.day === day);
  const hasMissed = currentDaySchedule?.workouts.some(workout => workout.status === 'MISSED');

  return (
    <TouchableOpacity
      key={day}
      onPress={() => handleDaySelect(day)}
      style={[
        styles.dayCircle,
        selectedDay === day && styles.selectedDayCircle,
        hasMissed && styles.missedDayCircle,
      ]}>
      <Text
        style={[
          styles.dayText,
          selectedDay === day && styles.selectedDayText,
          hasMissed && styles.missedText,
        ]}>
        {day}
      </Text>
    </TouchableOpacity>
  );
})}
      </View>

      {/* Workout Details for Selected Day */}
      {expanded &&
        selectedDaySchedule &&
        selectedDaySchedule.workouts.length > 0 && (
          <View style={styles.workoutDetailsContainer}>
            <Text style={styles.workoutDetailsTitle}>
              Workouts for Mar {selectedDay} {getMonthFromStartDate()}
            </Text>
            {selectedDaySchedule.workouts.map((workout, index) => (
              console.log('workout', workout),
              
              <View key={index} style={styles.workoutItem}>
                {/* Time */}
                <View style={styles.timeContainer}>
                  <View style={styles.timeChildContainer}>
                    <Icon name="time-outline" size={18} color="#666" />
                    <Text style={styles.timeText}>{workout.time}</Text>
                  </View>
                  <View
                    style={[
                      styles.workoutStatusBadge,
                      {
                        backgroundColor:
                          workout.status === 'COMPLETED'
                            ? '#22C55E'
                            : workout.status === 'INCOMING'
                            ? '#3B82F6'
                            : workout.status === 'ONGOING'
                            ? '#64748B'
                            : '#CB0404',
                      },
                    ]}>
                    <Text style={styles.workoutStatusText}>
                      {workout.status}
                    </Text>
                  </View>
                </View>

                {/* Session Name */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                  }}>
                  <Text style={styles.sessionName}>{workout.name}</Text>
                </View>

                {/* Enhanced Heart Rate Target Section */}
                {(workout.minbpm || workout.maxbpm) && (
                  <View style={styles.heartRateContainer}>
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
                    <Icon name="footsteps-outline" size={25} color="#4285F4" />
                    <Text style={styles.statValue}>
                      {workout.steps.toLocaleString()}
                    </Text>
                    <Text style={styles.statLabel}>Step</Text>
                  </View>

                  {/* Distance */}
                  <View style={styles.statItem}>
                    <Icon name="map-outline" size={25} color="#4285F4" />
                    <Text style={styles.statValue}>{workout.distance} km</Text>
                    <Text style={styles.statLabel}>Distance</Text>
                  </View>

                  {/* Calories */}
                  <View style={styles.statItem}>
                    <Icon name="flame-outline" size={25} color="#4285F4" />
                    <Text style={styles.statValue}>{workout.calories}</Text>
                    <Text style={styles.statLabel}>Calories</Text>
                  </View>
                </View>
              </View>
            ))}

            <WorkoutComparison workouts={selectedDaySchedule.workouts} />
          </View>
        )}

      {/* Card Footer */}
      <View style={styles.cardFooter}>
        <TouchableOpacity>
          {isExpertChoice ? (
            <Text style={styles.expertChoiceText}>Expert's Choice</Text>
          ) : (
            <Text style={styles.expertChoiceText}>Self's Choice</Text>
          )}
        </TouchableOpacity>

        <View style={styles.alarmContainer}>
          <Text style={styles.alarmText}>Alarm</Text>
          <Switch
            value={alarmEnabled}
            onValueChange={setAlarmEnabled}
            trackColor={{false: '#E2E8F0', true: '#1E40AF'}}
            thumbColor={alarmEnabled ? '#fff' : '#fff'}
            ios_backgroundColor="#E2E8F0"
          />
        </View>
      </View>
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
            <TouchableOpacity style={styles.modalOption} onPress={handleEdit}>
              <Icon
                name="create-outline"
                size={24}
                color={theme.colors.primaryDark}
              />
              <Text style={styles.modalOptionText}>Update</Text>
            </TouchableOpacity>

            <View style={styles.modalDivider} />

            <TouchableOpacity style={styles.modalOption} onPress={handleDelete}>
              <Icon name="trash-outline" size={24} color="red" />
              <Text style={[styles.modalOptionText, {color: 'red'}]}>
                Delete
              </Text>
            </TouchableOpacity>

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
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  startedText: {
    fontSize: 12,
    color: '#64748B',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  modalOptionText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#000',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  modalCancelButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primaryDark,
  },
  expertChoiceText: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#F4F0FF',
    fontSize: 15,
    color: '#052658',
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#0F172A',
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: '#F4F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 12,
    color: '#64748B',
  },
  daysContainer: {
    flexDirection: 'row',
    gap: 15,
    justifyContent: 'center',
    alignItems:'flex-start',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  dayCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  selectedDayCircle: {
    backgroundColor: '#1E3A8A',
  },
  missedDayCircle: {
    color:'#FFF',
    backgroundColor: '#EF4444',
  },
  missedText: {
    color:'#FFF',
  },
  dayText: {
    fontSize: 14,
    color: '#64748B',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#1E40AF',
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
  },
  workoutDetailsContainer: {
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
  },
  workoutDetailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
  },
  workoutItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  timeChildContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  workoutStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  workoutStatusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
  },

  // Enhanced styles for heart rate section
  heartRateContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  heartRateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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

  // New improved BPM display
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
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3B82F6',
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
    marginTop: 2,
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
    backgroundColor: '#3B82F6',
  },
});

export default EnhancedScheduleCard;
