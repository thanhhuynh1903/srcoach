import { useState, useEffect } from 'react';
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
import { Calendar } from 'react-native-calendars';
import DailyGoalsSection from '../../DailyGoalsScreen';
import BackButton from '../../BackButton';
import { useNavigation } from '@react-navigation/native';
import useScheduleStore from '../../utils/useScheduleStore';
import { ActivityIndicator } from 'react-native-paper';
import { is } from 'date-fns/locale';
import Toast from 'react-native-toast-message';
import { useRoute } from '@react-navigation/native';
interface TrainingSession {
  description: string;
  start_time: string;
  end_time: string;
  goal_steps: number | null;
  goal_distance: number | null;
  goal_calories: number | null;
  goal_minbpms: number | null;
  goal_maxbpms: number | null;
  status?: string;
}

interface DailySchedule {
  day: string;
  details: TrainingSession[];
}
const UpdateScheduleScreen = () => {
  // State for form fields
  const navigate = useNavigation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDates, setSelectedDates] = useState<Record<string, any>>({});
  const [currentMonth, setCurrentMonth] = useState('');
  const [validDates, setValidDates] = useState<{ [key: string]: any }>({});
  const {
    updateSchedule,
    updateScheduleExpert,
    schedules,
    isLoading,
    message,
    fetchSelfSchedules,
    fetchExpertSchedule,
    fetchDetail,
  } = useScheduleStore();
  const [isCreating, setIsCreating] = useState(false);
  // Daily goals for each selected date
  const [dailyGoals, setDailyGoals] = useState<DailySchedule[]>([]);
  const route = useRoute();
  const { scheduleId } = route.params as { scheduleId: string };
  const { view } = route.params as { view: boolean };
  const [initialGoals, setInitialGoals] = useState<DailySchedule[]>([]);
  // Maximum number of days that can be selected
  const MAX_DAYS_SELECTION = 14;
  // useEffect(() => {
  //   if (message) {
  //     Alert.alert('Validation Error', message, [{text: 'OK'}]);
  //     // Reset message sau khi hiển thị
  //     useScheduleStore.getState().clear();
  //   }
  // }, [message]);
  const handleUpdateSchedule = async () => {
    try {
      setIsCreating(true);

      const validDays = dailyGoals?.filter(
        (day: DailySchedule) =>
          !day.details.some(session => session.status === 'MISSED' || session.status === 'CANCELED' || session.status === 'COMPLETED' ||
            session.status === 'ONGOING' ||
            session.status === 'INCOMING'),
      );
      if (validDays.length === 0) {
        Alert.alert(
          'Cannot Update',
          'Some days contain sessions that are ongoing, incoming, completed, or missed. You cannot update these days.',
          [{ text: 'OK' }],
        );
        setIsCreating(false);
        return;
      }

      const cleanedDays = validDays?.map((day: DailySchedule) => ({
        ...day,
        details: day.details.map(({ status, ...rest }) => rest), // Bỏ trường status
      }));

      const formData = {
        title,
        description,
        days: cleanedDays,
      };

      // Lấy dữ liệu chi tiết lịch để kiểm tra loại lịch
      const scheduleData = await fetchDetail(scheduleId);

      let result;
      if (scheduleData?.schedule_type === 'EXPERT') {
        // Nếu là lịch expert tạo cho runner
        result = await updateScheduleExpert(scheduleId, formData);
      } else {
        // Nếu là lịch cá nhân
        result = await updateSchedule(scheduleId, formData);
      }

      if (result === 'success') {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Schedule updated successfully',
        });
        if (scheduleData?.schedule_type === 'EXPERT') {
          await fetchExpertSchedule();
        } else {
          await fetchSelfSchedules();
        }
        navigate.goBack();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Update failed',
          text2: 'Could not update schedule. Please try again.',
        });
      }
    } catch (err) {
      console.log('Error updating schedule:', err);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An error occurred while updating the schedule.',
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Initialize with current date and set valid date range (today + 6 days)
  useEffect(() => {
    const today = new Date();
    const todayStr = formatDateString(today);

    // Tạo validDates cho 14 ngày tới
    const validDatesObj: { [key: string]: any } = {};
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

    // Thêm các ngày từ initialGoals vào validDates nếu là quá khứ
    initialGoals.forEach(day => {
      const dayDate = new Date(day.day);
      if (dayDate < today && !validDatesObj[day.day]) {
        validDatesObj[day.day] = {
          disabled: true,
          disableTouchEvent: true,
          textColor: '#CBD5E1',
        };
      }
    });

    // Highlight today
    validDatesObj[todayStr] = {
      ...validDatesObj[todayStr],
      marked: true,
      dotColor: '#0F2B5B',
    };

    setValidDates(validDatesObj);
  }, [initialGoals]);

  useEffect(() => {
    const loadScheduleData = async () => {
      try {
        const scheduleData = await fetchDetail(scheduleId);
        console.log('scheduleData', scheduleData);

        if (!scheduleData) {
          Alert.alert('Error', 'Schedule not found');
          return;
        }

        setTitle(scheduleData.title || '');
        setDescription(scheduleData.description || '');

        // Chuyển đổi dữ liệu từ API sang định dạng DailySection cần
        const convertedDays = scheduleData?.ScheduleDay?.map(day => ({
          day: new Date(day.day).toISOString().split('T')[0], // Format thành YYYY-MM-DD
          details: day.ScheduleDetail.map(detail => ({
            description: detail.description,
            start_time: detail.start_time,
            end_time: detail.end_time,
            goal_steps: detail.goal_steps,
            goal_distance: detail.goal_distance,
            goal_calories: detail.goal_calories,
            goal_minbpms: detail.goal_minbpms,
            goal_maxbpms: detail.goal_maxbpms,
            status: detail.status,
          })),
        }));

        // Cập nhật selectedDates
        const dates = convertedDays.reduce((acc, day) => {
          acc[day.day] = { selected: true, selectedColor: '#0F2B5B' };
          return acc;
        }, {});

        setSelectedDates(dates);
        setInitialGoals(convertedDays);
      } catch (error) {
        console.error('Error loading schedule:', error);
      }
    };

    loadScheduleData();
  }, [scheduleId]);

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
    const selectedDate = new Date(dateStr);
    const today = new Date();

    // Check if date is in valid range
    if (selectedDate < today && !initialGoals.find(d => d.day === dateStr)) {
      Alert.alert('Invalid Selection', 'Cannot select past dates', [
        { text: 'OK' },
      ]);
      return;
    }

    if (!validDates[dateStr]) {
      Alert.alert(
        'Invalid Selection',
        'You can only select days within the next 14 days starting from today.',
        [{ text: 'OK' }],
      );
      return;
    }
    setSelectedDates(prevSelectedDates => {
      const newSelectedDates = { ...prevSelectedDates };

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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Combine marked dates (selected + valid dates)
  const getMarkedDates = () => {
    const markedDates: { [key: string]: any } = { ...validDates };

    // Thêm các ngày đã chọn và initial goals
    Object.keys(selectedDates).forEach(dateStr => {
      markedDates[dateStr] = {
        ...markedDates[dateStr],
        selected: true,
        selectedColor: '#0F2B5B',
      };
    });

    // Thêm các ngày từ initialGoals
    initialGoals.forEach(day => {
      const dateStr = day.day;
      const dayDate = new Date(dateStr);
      const today = new Date();

      if (dayDate < today) {
        if (initialGoals && initialGoals.length > 0) {
          initialGoals.forEach(day => {
            const dateStr = day.day;
            const hasOngoingSession = day.details.some(
              detail => detail.status === 'ONGOING'
            );
            const hasBlockedSession = day.details.some(
              detail =>
                detail.status === 'MISSED' ||
                detail.status === 'COMPLETED'
            );

            if (hasOngoingSession) {
              markedDates[dateStr] = {
                ...markedDates[dateStr],
                selected: true,
                selectedColor: '#4E71FF',
                disabled: true,
                disableTouchEvent: true,
              };
            } else if (hasBlockedSession) {
              markedDates[dateStr] = {
                ...markedDates[dateStr],
                selected: true,
                selectedColor: day?.details?.status?.include('MISSED') ? '#EF4444' : '#F59E0B', 
                disabled: true,
                disableTouchEvent: true,
              };
            }
          });
        } else {
          markedDates[dateStr] = {
            ...markedDates[dateStr],
            selected: true,
            selectedColor: '#64748B',
            disabled: true,
            disableTouchEvent: true,
          };
        }
      }
    });

    // Đánh dấu các ngày không hợp lệ khác
    const today = new Date();
    const firstDay = new Date(currentMonth || today);
    firstDay.setDate(1);

    const lastDay = new Date(firstDay);
    lastDay.setMonth(lastDay.getMonth() + 1);
    lastDay.setDate(0);

    let currentDate = new Date(firstDay);
    while (currentDate <= lastDay) {
      const dateStr = formatDateString(currentDate);

      if (!validDates[dateStr] && !initialGoals.find(d => d.day === dateStr)) {
        markedDates[dateStr] = {
          disabled: true,
          disableTouchEvent: true,
          textColor: '#CBD5E1',
        };
      }

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
        <Text style={styles.headerTitle}>Schedules</Text>
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
          editable={!view}
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
          initialSchedules={initialGoals}
          view={view === undefined ? false : view}
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
          editable={!view}
        />
        {!view && (
          <TouchableOpacity
            style={[
              styles.createButton,
              getSelectedDatesCount() < 0 || isCreating
                ? styles.disabledButton
                : null,
            ]}
            disabled={getSelectedDatesCount() < 0 || isCreating}
            onPress={handleUpdateSchedule}>
            {isCreating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.createButtonText}>
                Update Schedule ({getSelectedDatesCount()}{' '}
                {getSelectedDatesCount() === 1 ? 'day' : 'days'})
              </Text>
            )}
          </TouchableOpacity>
        )}
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
    borderRadius: 20,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});

export default UpdateScheduleScreen;
