import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {Calendar} from 'react-native-calendars';
import DailyGoalsSection from '../../../../DailyGoalsScreen';
import {theme} from '../../../../contants/theme';
import CommonPanel from '../../../../commons/CommonPanel';
import {ActivityIndicator} from 'react-native-paper';
import useScheduleStore from '../../../../utils/useScheduleStore';
import Toast from 'react-native-toast-message';
import { hp } from '../../../../helpers/common';

interface ChatsPanelExpertTrainingPlanProps {
  visible: boolean;
  onClose: () => void;
  sessionId: string;
  onSendSuccess: () => void;
}

const ChatsPanelExpertTrainingPlan: React.FC<ChatsPanelExpertTrainingPlanProps> = ({
  visible,
  onClose,
  sessionId,
  onSendSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDates, setSelectedDates] = useState({});
  const [currentMonth, setCurrentMonth] = useState('');
  const [validDates, setValidDates] = useState<{[key: string]: any}>({});
  const {createSchedule, isLoading, message} = useScheduleStore();
  const [isCreating, setIsCreating] = useState(false);
  const [dailyGoals, setDailyGoals] = useState({});

  const MAX_DAYS_SELECTION = 14;

  useEffect(() => {
    if (message) {
      Alert.alert('Validation Error', message, [{text: 'OK'}]);
      useScheduleStore.getState().clear();
    }
  }, [message]);

  // Initialize with current date and set valid date range
  useEffect(() => {
    if (!visible) return;

    const today = new Date();
    const todayStr = formatDateString(today);

    // Set current month for calendar
    setCurrentMonth(todayStr);

    // Generate valid dates (today + MAX_DAYS_SELECTION days)
    const validDatesObj: {[key: string]: any} = {};
    for (let i = 0; i < MAX_DAYS_SELECTION; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      const dateStr = formatDateString(date);
      validDatesObj[dateStr] = {
        disabled: false,
        textColor: '#000000',
        disableTouchEvent: false,
      };
    }

    // Highlight today
    validDatesObj[todayStr] = {
      ...validDatesObj[todayStr],
      marked: true,
      dotColor: theme.colors.primaryDark,
    };

    setValidDates(validDatesObj);
    setSelectedDates({});
    setTitle('');
    setDescription('');
    setDailyGoals({});
  }, [visible]);

  const handleCreateSchedule = async () => {
    useScheduleStore.getState().clear();

    if (!title) {
      Alert.alert('Error', 'Please enter a title for your workout schedule.');
      return;
    }

    if (getSelectedDatesCount() === 0) {
      Alert.alert('Error', 'Please select at least one date');
      return;
    }

    try {
      setIsCreating(true);

      const formData = {
        title,
        description,
        user_id: null,
        days: dailyGoals,
      };

      const result = await createSchedule(formData);
      if (result) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Training plan created and sent successfully',
        });
        onSendSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Error creating training plan:', err);
      Alert.alert(
        'Error',
        'An error occurred while creating the training plan. Please try again later.',
      );
    } finally {
      setIsCreating(false);
    }
  };

  // Format date to YYYY-MM-DD
  const formatDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handle month change
  const onMonthChange = (month: any) => {
    setCurrentMonth(month.dateString);
  };

  // Handle date selection with validation
  const onDayPress = (day: any) => {
    const dateStr = day.dateString;

    if (!validDates[dateStr]) {
      Alert.alert(
        'Invalid Selection',
        `You can only select days within the next ${MAX_DAYS_SELECTION} days starting from today.`,
        [{text: 'OK'}],
      );
      return;
    }

    setSelectedDates(prevSelectedDates => {
      const newSelectedDates = {...prevSelectedDates};

      if (newSelectedDates[dateStr]) {
        delete newSelectedDates[dateStr];
      } else {
        newSelectedDates[dateStr] = {
          selected: true,
          selectedColor: theme.colors.primaryDark,
        };
      }

      return newSelectedDates;
    });
  };

  // Handle daily goals changes
  const handleDailyGoalsChange = (newDailyGoals: any) => {
    setDailyGoals(newDailyGoals);
  };

  // Get count of selected dates
  const getSelectedDatesCount = () => {
    return Object.keys(selectedDates).length;
  };

  // Format dates for display
  const formatSelectedDates = () => {
    const dates = Object.keys(selectedDates).sort();
    if (dates.length === 0) return 'No dates selected';
    if (dates.length === 1) return `Selected: ${formatDate(dates[0])}`;
    return `Selected ${dates.length} days`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
  };

  // Combine marked dates (selected + valid dates)
  const getMarkedDates = () => {
    const markedDates: {[key: string]: any} = {...validDates};

    // Add selected dates styling
    Object.keys(selectedDates).forEach(dateStr => {
      markedDates[dateStr] = {
        ...markedDates[dateStr],
        selected: true,
        selectedColor: theme.colors.primaryDark,
      };
    });

    // Mark all other dates as disabled
    const today = new Date();
    const todayStr = formatDateString(today);

    // Get first day of current month
    const firstDay = new Date(currentMonth || todayStr);
    firstDay.setDate(1);

    // Get last day of current month
    const lastDay = new Date(firstDay);
    lastDay.setMonth(lastDay.getMonth() + 1);
    lastDay.setDate(0);

    // Loop through all days in current month
    const currentDate = new Date(firstDay);
    while (currentDate <= lastDay) {
      const dateStr = formatDateString(currentDate);

      // If not in valid dates, mark as disabled
      if (!validDates[dateStr]) {
        markedDates[dateStr] = {
          disabled: true,
          disableTouchEvent: true,
          textColor: '#CBD5E1',
        };
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return markedDates;
  };

  // Get remaining days text
  const getRemainingDaysText = () => {
    const selectedCount = getSelectedDatesCount();
    const remaining = MAX_DAYS_SELECTION - selectedCount;

    if (remaining === MAX_DAYS_SELECTION)
      return `Select up to ${MAX_DAYS_SELECTION} days`;
    if (remaining === 0) return 'All days selected';
    return `${remaining} ${remaining === 1 ? 'day' : 'days'} remaining`;
  };

  return (
    <CommonPanel
      visible={visible}
      onClose={onClose}
      title="Create Training Plan"
      direction="bottom"
      height={hp(95)}
      borderRadius={16}
      backdropOpacity={0.5}
      contentStyle={{padding: 0}}
      swipeToClose={false}
      disableBackdropClose={true}
      content={
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" />

          <ScrollView style={styles.scrollView}>
            <Text style={styles.sectionTitle}>Schedule Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter schedule title"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#A1A1AA"
            />

            <View style={styles.limitInfoContainer}>
              <Icon name="information-circle-outline" size={18} color="#64748B" />
              <Text style={styles.limitInfoText}>{getRemainingDaysText()}</Text>
            </View>

            <View style={styles.selectedDatesContainer}>
              <Text style={styles.selectedDatesText}>{formatSelectedDates()}</Text>
            </View>

            <View style={styles.calendarContainer}>
              <Calendar
                current={currentMonth}
                onDayPress={onDayPress}
                onMonthChange={onMonthChange}
                markedDates={getMarkedDates()}
                markingType="multi-dot"
                theme={{
                  backgroundColor: '#F1F5F9',
                  calendarBackground: '#F1F5F9',
                  textSectionTitleColor: '#64748B',
                  selectedDayBackgroundColor: theme.colors.primaryDark,
                  selectedDayTextColor: '#FFFFFF',
                  todayTextColor: theme.colors.primaryDark,
                  dayTextColor: '#0F172A',
                  textDisabledColor: '#CBD5E1',
                  arrowColor: '#0F172A',
                  monthTextColor: '#0F172A',
                  textMonthFontWeight: '600',
                  textMonthFontSize: 16,
                  textDayFontSize: 14,
                  textDayHeaderFontSize: 14,
                }}
                renderHeader={date => {
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
                enableSwipeMonths={true}
              />
            </View>

            {/* Daily Goals Section */}
            <DailyGoalsSection
              selectedDates={selectedDates}
              onGoalsChange={handleDailyGoalsChange}
            />

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

            <TouchableOpacity
              style={[
                styles.createButton,
                getSelectedDatesCount() < 3 || isCreating
                  ? styles.disabledButton
                  : null,
              ]}
              disabled={getSelectedDatesCount() < 3 || isCreating}
              onPress={handleCreateSchedule}>
              {isCreating ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.createButtonText}>
                  Create Training Plan ({getSelectedDatesCount()}{' '}
                  {getSelectedDatesCount() === 1 ? 'day' : 'days'})
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    color: theme.colors.primaryDark,
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
    marginTop: 8,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  limitInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  limitInfoText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 6,
  },
  selectedDatesContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  selectedDatesText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  createButton: {
    backgroundColor: theme.colors.primaryDark,
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
  disabledButton: {
    backgroundColor: '#94A3B8',
  },
});

export default ChatsPanelExpertTrainingPlan;