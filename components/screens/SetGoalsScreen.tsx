import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import BackButton from '../BackButton';
import ScreenWrapper from '../ScreenWrapper';

const activities = [
  {id: 'running', icon: 'walk-sharp', label: 'Running'},
  {id: 'walking', icon: 'navigation', label: 'Walking'},
  {id: 'exercise', icon: 'disc', label: 'Light Exercise'},
  {id: 'rest', icon: 'moon', label: 'Rest'},
];

const days = ['M', 'Tu', 'W', 'Th', 'F', 'Sat', 'Sun'];

const SetGoalsScreen = () => {
  const [selectedActivity, setSelectedActivity] = useState('running');
  const [selectedDays, setSelectedDays] = useState(['M', 'T', 'W', 'T', 'F']);
  const [remindersEnabled, setRemindersEnabled] = useState(true);

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  return (
    <ScreenWrapper bg={'#FFFFFF'}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set Your Goals</Text>
        <TouchableOpacity>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Activity Types */}
      <View style={styles.activitiesContainer}>
        {activities.map(activity => (
          <TouchableOpacity
            key={activity.id}
            style={[
              styles.activityButton,
              selectedActivity === activity.id && styles.activityButtonActive,
            ]}
            onPress={() => setSelectedActivity(activity.id)}>
            <Icon
              name={activity.icon as any}
              size={24}
              color={selectedActivity === activity.id ? '#FFFFFF' : '#64748B'}
            />
            <Text
              style={[
                styles.activityLabel,
                selectedActivity === activity.id && styles.activityLabelActive,
              ]}>
              {activity.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Goals */}
      <View style={styles.goalsContainer}>
        <View style={styles.goalItem}>
          <Icon name="location-outline" size={24} color="#64748B" />
          <View style={styles.goalInfo}>
            <Text style={styles.goalLabel}>Distance</Text>
            <Text style={styles.goalSubtitle}>Target distance goal</Text>
          </View>
          <View style={styles.textstyle}>
            <TextInput
              style={styles.input}
              value={'25'}
              keyboardType="numeric"
            />
          </View>
          <Text style={styles.unit}>km</Text>
        </View>

        <View style={styles.goalItem}>
          <Icon name="time-outline" size={24} color="#64748B" />
          <View style={styles.goalInfo}>
            <Text style={styles.goalLabel}>Duration</Text>
            <Text style={styles.goalSubtitle}>Target time goal</Text>
          </View>
          <View style={styles.textstyle}>
            <TextInput
              style={styles.input}
              value={'30'}
              keyboardType="numeric"
            />
          </View>
          <Text style={styles.unit}>min</Text>
        </View>

        <View style={styles.goalItem}>
          <Icon name="flame-outline" size={24} color="#64748B" />
          <View style={styles.goalInfo}>
            <Text style={styles.goalLabel}>Calories</Text>
            <Text style={styles.goalSubtitle}>Target calories burn</Text>
          </View>
          <View style={styles.textstyle}>
            <TextInput
              style={styles.input}
              value={'300'}
              keyboardType="numeric"
            />
          </View>
          <Text style={styles.unit}>kcal</Text>
        </View>
      </View>

      {/* Schedule */}
      <View style={styles.scheduleContainer}>
        <Text style={styles.sectionTitle}>Schedule</Text>
        <View style={styles.daysContainer}>
          {days.map(day => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayButton,
                selectedDays.includes(day) && styles.dayButtonActive,
              ]}
              onPress={() => toggleDay(day)}>
              <Text
                style={[
                  styles.dayText,
                  selectedDays.includes(day) && styles.dayTextActive,
                ]}>
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.timeContainer}>
          <Icon name="calendar-outline" size={24} color="#4285F4" />
          <View style={styles.timeInfo}>
            <Text style={styles.timeLabel}>Time</Text>
            <Text style={styles.timeSubtitle}>Daily schedule</Text>
          </View>
          <Text style={styles.timeValue}>06:00 - 07:00</Text>
        </View>

        {/* Reminders */}
        <View style={styles.remindersContainer}>
          <View style={styles.reminderHeader}>
            <View style={styles.reminderLeft}>
              <Icon name={"notifications-outline" as any} size={24} color="#4285F4" />
              <Text style={styles.reminderTitle}>Reminders</Text>
            </View>
            <Switch
              value={remindersEnabled}
              onValueChange={setRemindersEnabled}
              trackColor={{false: '#E2E8F0', true: '#93C5FD'}}
              thumbColor={remindersEnabled ? '#4285F4' : '#FFFFFF'}
            />
          </View>
          <Text style={styles.reminderText}>
            Get notified 15 minutes before your scheduled activity
          </Text>
        </View>
      </View>
      {/* Set Goals Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.setGoalsButton}>
          <Text style={styles.setGoalsButtonText}>Set Goals</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
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
    paddingHorizontal: 14,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4285F4',
  },
  activitiesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 12,
    marginBottom: 24,
  },
  activityButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  activityButtonActive: {
    backgroundColor: '#4285F4',
  },
  activityLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  activityLabelActive: {
    color: '#FFFFFF',
  },
  goalsContainer: {
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 24,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  goalSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  goalValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  scheduleContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonActive: {
    backgroundColor: '#4285F4',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  dayTextActive: {
    color: '#FFFFFF',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  timeInfo: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  timeSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4285F4',
  },
  remindersContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical:16,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  reminderText: {
    fontSize: 14,
    color: '#64748B',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  setGoalsButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  setGoalsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  textstyle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    padding: 0,
    minWidth: 40,
  },
  unit: {
    fontSize: 16,
    color: '#64748B',
  },
});

export default SetGoalsScreen;
