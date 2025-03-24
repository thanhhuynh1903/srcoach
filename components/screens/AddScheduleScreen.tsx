'use client';

import {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {Calendar} from 'react-native-calendars';
import BackButton from '../BackButton';

const AddScheduleScreen = () => {
  // State for form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState('2024-02-15');
  const [currentMonth, setCurrentMonth] = useState('2024-02-01');

  const [goals, setGoals] = useState({
    distance: 0,
    calories: 0,
    steps: 0,
    heartRate: 0,
  });

  // Duration options
  //   const durationOptions = ["1 Day", "7 Days", "30 Days", "Custom"]

  // Handle month change
  const onMonthChange = (month: any) => {
    setCurrentMonth(month.dateString);
  };

  // Handle date selection
  const onDayPress = (day: any) => {
    setSelectedDate(day.dateString);
  };

  // Update goal value
  const updateGoal = (type: any, value: any) => {
    setGoals({
      ...goals,
      [type]: value,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedules - Add Schedule</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Title Input */}
        <Text style={styles.sectionTitle}>Schedule Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter schedule title"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#A1A1AA"
        />

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <Calendar
            current={currentMonth}
            onDayPress={onDayPress}
            onMonthChange={onMonthChange}
            markedDates={{
              [selectedDate]: {selected: true, selectedColor: '#0F2B5B'},
            }}
            // Theme customization
            theme={{
              backgroundColor: '#F1F5F9',
              calendarBackground: '#F1F5F9',
              textSectionTitleColor: '#64748B',
              selectedDayBackgroundColor: '#0F2B5B',
              selectedDayTextColor: '#FFFFFF',
              todayTextColor: '#0F2B5B',
              dayTextColor: '#0F172A',
              textDisabledColor: '#CBD5E1',
              arrowColor: '#0F172A',
              monthTextColor: '#0F172A',
              textMonthFontWeight: '600',
              textMonthFontSize: 16,
              textDayFontSize: 14,
              textDayHeaderFontSize: 14,
            }}
            // Custom header
            renderHeader={(date: any) => {
              const monthNames = [
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
              const month = date.getMonth();
              const year = date.getFullYear();
              return (
                <Text style={styles.monthTitle}>
                  {monthNames[month]} {year}
                </Text>
              );
            }}
            // Enable swipe months
            enableSwipeMonths={true}
          />
        </View>

        {/* Duration Selection */}
        {/* <View style={styles.durationContainer}>
          {durationOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.durationOption, duration === option && styles.selectedDuration]}
              onPress={() => setDuration(option)}
            >
              <Text style={[styles.durationText, duration === option && styles.selectedDurationText]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View> */}

        {/* Goals */}
        <Text style={styles.sectionTitle}>Goals</Text>
        <View style={styles.goalsContainer}>
          <GoalInput
            icon="walk"
            value={goals.distance}
            unit="km"
            onChangeValue={(value: any) => updateGoal('distance', value)}
          />
          <GoalInput
            icon="flame"
            value={goals.calories}
            unit="kcal"
            onChangeValue={(value: any) => updateGoal('calories', value)}
          />
          <GoalInput
            icon="footsteps"
            value={goals.steps}
            unit="steps"
            onChangeValue={(value: any) => updateGoal('steps', value)}
          />
          <GoalInput
            icon="heart"
            value={goals.heartRate}
            unit="bpm"
            onChangeValue={(value: any) => updateGoal('heartRate', value)}
          />
        </View>

        {/* Description */}
        <Text style={styles.sectionTitle}>Description</Text>
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          placeholder="Add description"
          value={description}
          onChangeText={setDescription}
          multiline
          placeholderTextColor="#A1A1AA"
        />

        {/* Action Buttons */}
        <TouchableOpacity style={styles.aiButton}>
          <Icon name="construct" size={20} color="#FFFFFF" />
          <Text style={styles.aiButtonText}>Automatic generate (AI)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.createButton}>
          <Text style={styles.createButtonText}>Create Schedule</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const GoalInput = ({
  icon,
  value,
  unit,
  onChangeValue,
}: {
  icon: any;
  value: any;
  unit: any;
  onChangeValue: any;
}) => {
  return (
    <View style={styles.goalInputContainer}>
      <View style={styles.goalIconContainer}>
        <Icon name={icon} size={20} color="#0F2B5B" />
      </View>
      <Text style={styles.goalValue}>{value}</Text>
      <Text style={styles.goalUnit}>{unit}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#0F172A',
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  calendarContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 16,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  durationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  durationOption: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDuration: {
    backgroundColor: '#0F2B5B',
  },
  durationText: {
    color: '#64748B',
    fontWeight: '500',
  },
  selectedDurationText: {
    color: '#FFFFFF',
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  goalInputContainer: {
    width: '48%',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  goalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  goalValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0F172A',
  },
  goalUnit: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  aiButton: {
    backgroundColor: '#0F2B5B',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  aiButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  createButton: {
    backgroundColor: '#0F2B5B',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default AddScheduleScreen;
