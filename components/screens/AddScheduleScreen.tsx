import {useState, useEffect} from 'react';
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
import DailyGoalsSection from '../DailyGoalsScreen';
import BackButton from '../BackButton';
import {useNavigation} from '@react-navigation/native';
import useScheduleStore from '../utils/useScheduleStore';
import {Activity} from 'react-native-feather';
import {ActivityIndicator} from 'react-native-paper';

const AddScheduleScreen = () => {
  // State for form fields
  const navigate = useNavigation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDates, setSelectedDates] = useState({});
  const [currentMonth, setCurrentMonth] = useState('');
  const [validDates, setValidDates] = useState({});
  const {createSchedule, schedules, isLoading, message,fetchSelfSchedules} = useScheduleStore();
  const [isCreating, setIsCreating] = useState(false);
  // Daily goals for each selected date
  const [dailyGoals, setDailyGoals] = useState({});

  // Maximum number of days that can be selected
  const MAX_DAYS_SELECTION = 14;

  const handleCreateSchedule = async () => {
    // Kiểm tra dữ liệu đầu vào
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

      // Dữ liệu từ dailyGoals đã được định dạng đúng từ DailyGoalsSection
      const formData = {
        title,
        description,
        user_id: null,
        days: dailyGoals, // dailyGoals đã được xử lý và định dạng đúng từ component DailyGoalsSection
      };
      console.log('Form data:', formData);

      // Gọi API tạo lịch tập
      const result = await createSchedule(formData);
      console.log('Create schedule result:', result);
      console.log('Schedules after creation:', message);
      await fetchSelfSchedules(); // Cập nhật danh sách lịch tập sau khi tạo mới
      if (result) {
        Alert.alert('Success', 'Schedule created successfully', [
          {text: 'OK', onPress: () => navigate.goBack()},
        ]);
      } else {
        Alert.alert('Error', message);
      }
    } catch (err) {
      console.error('Error creating workout schedule:', err);
      Alert.alert(
        'Error',
        'An error occurred while creating the workout schedule. Please try again later.',
      );
    } finally {
      // Kết thúc loading
      setIsCreating(false);
    }
  };
  // Initialize with current date and set valid date range (today + 6 days)
  useEffect(() => {
    const today = new Date();
    const todayStr = formatDateString(today);

    // Set current month for calendar
    setCurrentMonth(todayStr);

    // Generate valid dates (today + 6 days)
    const validDatesObj = {};
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
      dotColor: '#0F2B5B',
    };

    setValidDates(validDatesObj);
  }, []);

  // Format date to YYYY-MM-DD
  const formatDateString = date => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handle month change
  const onMonthChange = month => {
    setCurrentMonth(month.dateString);
  };

  // Handle date selection with validation
  const onDayPress = day => {
    const dateStr = day.dateString;

    // Check if date is in valid range
    if (!validDates[dateStr]) {
      Alert.alert(
        'Invalid Selection',
        'You can only select days within the next 7 days starting from today.',
        [{text: 'OK'}],
      );
      return;
    }

    setSelectedDates(prevSelectedDates => {
      const newSelectedDates = {...prevSelectedDates};

      if (newSelectedDates[dateStr]) {
        // If already selected, remove it
        delete newSelectedDates[dateStr];
      } else {
        // If not selected, add it
        newSelectedDates[dateStr] = {
          selected: true,
          selectedColor: '#0F2B5B',
        };
      }

      return newSelectedDates;
    });
  };

  // Handle daily goals changes
  const handleDailyGoalsChange = newDailyGoals => {
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

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
  };

  // Combine marked dates (selected + valid dates)
  const getMarkedDates = () => {
    const markedDates = {...validDates};

    // Add selected dates styling
    Object.keys(selectedDates).forEach(dateStr => {
      markedDates[dateStr] = {
        ...markedDates[dateStr],
        selected: true,
        selectedColor: '#0F2B5B',
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

        {/* Selection limit info */}
        <View style={styles.limitInfoContainer}>
          <Icon name="information-circle-outline" size={18} color="#64748B" />
          <Text style={styles.limitInfoText}>{getRemainingDaysText()}</Text>
        </View>

        {/* Selected Dates Summary */}
        <View style={styles.selectedDatesContainer}>
          <Text style={styles.selectedDatesText}>{formatSelectedDates()}</Text>
        </View>

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <Calendar
            current={currentMonth}
            onDayPress={onDayPress}
            onMonthChange={onMonthChange}
            markedDates={getMarkedDates()}
            markingType="multi-dot"
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
            // Enable swipe months
            enableSwipeMonths={true}
          />
        </View>

        {/* Daily Goals Section - New Component */}
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

        {/* Action Buttons */}
        <TouchableOpacity style={styles.aiButton}>
          <Icon name="construct" size={20} color="#FFFFFF" />
          <Text style={styles.aiButtonText}>Automatic generate (AI)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.createButton,
            getSelectedDatesCount() === 0 || isCreating
              ? styles.disabledButton
              : null,
          ]}
          disabled={getSelectedDatesCount() === 0 || isCreating}
          onPress={handleCreateSchedule}>
          {isCreating ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.createButtonText}>
              Create Schedule ({getSelectedDatesCount()}{' '}
              {getSelectedDatesCount() === 1 ? 'day' : 'days'})
            </Text>
          )}
        </TouchableOpacity>
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
  sectionDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
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
  disabledButton: {
    backgroundColor: '#94A3B8',
  },
});

export default AddScheduleScreen;
