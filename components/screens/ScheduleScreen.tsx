import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import BackButton from '../BackButton';
import {useState} from 'react';
import {useNavigation} from '@react-navigation/native';

const weeklySchedule = [
  {
    day: 'Monday',
    date: 'Oct 15',
    distance: '5.0 km',
    calories: 500,
    activity: 'Interval Training',
    duration: 45,
    icon: 'activity',
  },
  {
    day: 'Tuesday',
    date: 'Oct 16',
    distance: '3.0 km',
    calories: 300,
    activity: 'Recovery Run',
    duration: 30,
    icon: 'activity',
  },
  {
    day: 'Wednesday',
    date: 'Oct 17',
    distance: '6.0 km',
    calories: 600,
    activity: 'Tempo Run',
    duration: 50,
    icon: 'activity',
  },
  {
    day: 'Thursday',
    date: 'Oct 18',
    distance: 'Rest',
    calories: 0,
    activity: 'Recovery',
    duration: 0,
    icon: 'activity',
  },
  {
    day: 'Friday',
    date: 'Oct 19',
    distance: '4.0 km',
    calories: 400,
    activity: 'Easy Run',
    duration: 40,
    icon: 'activity',
  },
  {
    day: 'Saturday',
    date: 'Oct 20',
    distance: '8.0 km',
    calories: 800,
    activity: 'Long Run',
    duration: 70,
    icon: 'activity',
  },
  {
    day: 'Sunday',
    date: 'Oct 21',
    distance: 'Rest',
    calories: 0,
    activity: 'Recovery',
    duration: 0,
    icon: 'activity',
  },
];

const ScheduleScreen = () => {
  const [buttonStatus, setbuttonStatus] = useState(false);
  const navigate = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weekly Schedule</Text>
        <TouchableOpacity>
          <Icon name="settings-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Weekly Goals Card */}
        <View style={styles.goalsCard}>
          <Text style={styles.goalsTitle}>This Week's Goals</Text>
          <View style={styles.goalsContent}>
            <View>
              <Text style={styles.totalDistance}>24.5 km</Text>
              <Text style={styles.totalCalories}>2,450 kcal</Text>
            </View>
            <View style={styles.progressCircle}>
              <Text style={styles.progressText}>65%</Text>
            </View>
          </View>
        </View>

        {/* Daily Schedule */}
        <View style={styles.scheduleList}>
          {weeklySchedule.map((day, index) => (
            <View key={index} style={styles.scheduleItem}>
              <View style={styles.dayHeader}>
                <View>
                  <Text style={styles.dayName}>{day.day}</Text>
                  <Text style={styles.dayDate}>{day.date}</Text>
                </View>
                <Icon name="walk-sharp" size={20} color="#22C55E" />
              </View>

              <View style={styles.activityDetails}>
                <View style={styles.distanceRow}>
                  <Text style={styles.distance}>{day.distance}</Text>
                  <View style={styles.caloriesContainer}>
                    <Icon name="flame" size={20} color="#64748B" />
                    <Text style={styles.calories}>{day.calories} kcal</Text>
                  </View>
                </View>

                <View style={styles.activityRow}>
                  <Text style={styles.activityType}>{day.activity}</Text>
                  <Text style={styles.duration}>{day.duration} min</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Bottom Stats */}
        <View style={styles.bottomStats}>
          <View style={styles.statItem}>
            <Icon name="speedometer-outline" size={20} color="#2563EB" />
            <Text style={styles.statValue}>5:30</Text>
            <Text style={styles.statLabel}>Avg Pace</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="time-outline" size={20} color="#2563EB" />
            <Text style={styles.statValue}>4h 35m</Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="trophy-outline" size={20} color="#2563EB" />
            <Text style={styles.statValue}>85%</Text>
            <Text style={styles.statLabel}>Achievement</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {!buttonStatus ? (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setbuttonStatus(!buttonStatus)}>
              <Text style={styles.primaryButtonText}>Start Today's Run</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.CancelButton}
              onPress={() => setbuttonStatus(!buttonStatus)}>
              <Text style={styles.CancelButtonText}>Cancel Schedule </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() =>
              buttonStatus === true
                ? navigate.navigate('RateScheduleScreen' as never)
                : null
            }>
            {!buttonStatus ? (
              <Text style={styles.secondaryButtonText}>
                Start running to unlock rate
              </Text>
            ) : (
              <Text style={styles.secondaryButtonText}>Rate this schedule</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  content: {
    flex: 1,
  },
  goalsCard: {
    backgroundColor: '#2563EB',
    margin: 16,
    borderRadius: 16,
    padding: 16,
  },
  goalsTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
  },
  goalsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalDistance: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  totalCalories: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.8,
  },
  progressCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  scheduleList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  scheduleItem: {
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  dayDate: {
    fontSize: 14,
    color: '#64748B',
  },
  activityDetails: {
    gap: 8,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distance: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginRight: 8,
  },
  caloriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  calories: {
    fontSize: 16,
    color: '#4B5563',
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityType: {
    fontSize: 14,
    color: '#4B5563',
  },
  duration: {
    fontSize: 14,
    color: '#4B5563',
  },
  bottomStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  statLabel: {
    fontSize: 12,
    color: '#4B5563',
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  CancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  CancelButton: {
    backgroundColor: '#E93232',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  ButtonFooter: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  ButtonFooterText: {
    color: '#4A4A4A',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#4A4A4A',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ScheduleScreen;
