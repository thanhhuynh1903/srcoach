import {useCallback, useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {Calendar} from 'react-native-calendars';
import BackButton from '../../BackButton';
import useScheduleStore from '../../utils/useScheduleStore';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import dayjs from 'dayjs';
import ContentLoader from 'react-content-loader/native';
import {Rect} from 'react-native-svg';
import Ionicons from '@react-native-vector-icons/ionicons';
interface Schedule {
  id: any;
  name: any;
  title: any;
  days: any;
  color: string;
  schedule_type: any;
  expert: any;
  daysList: any;
  ScheduleDay: any;
}
export default function ScheduleFullCalendarScreen() {
  const [selectedDate, setSelectedDate] = useState('');
  const [currentMonth, setCurrentMonth] = useState(dayjs().format('YYYY-MM-01'));
  const {fetchOverview} = useScheduleStore();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [markedDates, setMarkedDates] = useState({});
  const [displayedSchedules, setDisplayedSchedules] = useState<Schedule[]>([]);;
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Fixed function to fetch schedules using the correct API
  const fetchSelfSchedules = async () => {
    try {
      const response = await fetchOverview();
      if (response !== undefined && Array.isArray(response)) {
        // Transform the API response to match expected structure
        const transformedSchedules = response?.map(item => ({
          id: item.id,
          title: item.title,
          schedule_type: item.expert ? 'EXPERT' : 'USER', // Determine type based on expert presence
          expert: item.expert,
          ScheduleDay: item?.days?.map(day => ({
            id: day.id,
            day: day.day
          }))
        }));
        setSchedules(transformedSchedules);
      } else {
        setSchedules([]);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setSchedules([]);
    }
  };

  const generateMarkedDates = useCallback(() => {
    const newMarkedDates : { [key: string]: any } = {};
    const colors = ['#1E3A8A', '#10B981', '#F97316', '#8B5CF6', '#EC4899'];

    const today = dayjs().format('YYYY-MM-DD');
    newMarkedDates[today] = {
      today: true,
      todayTextColor: '#0F2B5B',
      dots: [],
    };

    schedules.forEach((schedule, index) => {
      const color = colors[index % colors.length];
      schedule?.ScheduleDay?.forEach(day => {
        const dateStr = dayjs(day.day).format('YYYY-MM-DD');
        if (!newMarkedDates[dateStr]) {
          newMarkedDates[dateStr] = {
            dots: [],
            disabled: false,
          };
        }
        newMarkedDates[dateStr].dots.push({
          color,
          key: schedule.id,
        });
      });
    });

    if (selectedDate) {
      newMarkedDates[selectedDate] = {
        ...newMarkedDates[selectedDate],
        selected: true,
        selectedColor: '#0F2B5B',
      };
    }

    return newMarkedDates;
  }, [schedules, selectedDate]);

  const onMonthChange = month => {
    setCurrentMonth(month.dateString);
  };

  const onDayPress = day => {
    if (selectedDate === day.dateString) {
      setSelectedDate('');
    } else {
      setSelectedDate(day.dateString);
    }
  };

  const initData = async () => {
    setIsInitialLoading(true);
    await fetchSelfSchedules();
    setIsInitialLoading(false);
  };

  useEffect(() => {
    const active = schedules.map(schedule => ({
      id: schedule.id,
      name: schedule.title,
      days: schedule.ScheduleDay.length,
      color: schedule.schedule_type === 'EXPERT' ? '#1E3A8A' : '#10B981',
      schedule_type: schedule.schedule_type,
      expert: schedule.expert,
      daysList: schedule.ScheduleDay.map(day =>
        dayjs(day.day).format('YYYY-MM-DD'),
      ),
    }));

    if (selectedDate) {
      const filtered = active.filter(schedule =>
        schedule.daysList.includes(selectedDate),
      );
      setDisplayedSchedules(filtered);
    } else {
      setDisplayedSchedules(active);
    }
  }, [schedules, selectedDate]);

  useEffect(() => {
    setMarkedDates(generateMarkedDates());
  }, [schedules, selectedDate, generateMarkedDates]);

  useFocusEffect(
    useCallback(() => {
      initData();
    }, []),
  );

  if (isInitialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <BackButton size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Schedules - Full calendar</Text>
        </View>
        <ContentLoader
          speed={1}
          width="100%"
          height={500}
          viewBox="0 0 400 500"
          backgroundColor="#f3f3f3"
          foregroundColor="#ecebeb">
          <Rect x="16" y="20" rx="4" ry="4" width="368" height="300" />
          <Rect x="16" y="340" rx="4" ry="4" width="120" height="24" />
          <Rect x="16" y="380" rx="4" ry="4" width="368" height="60" />
          <Rect x="16" y="460" rx="4" ry="4" width="368" height="60" />
        </ContentLoader>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedules - Full calendar</Text>
      </View>

      <Calendar
        current={currentMonth}
        onDayPress={onDayPress}
        onMonthChange={onMonthChange}
        markedDates={markedDates}
        markingType={'multi-dot'}
        initialDate={dayjs().format('YYYY-MM-DD')}
        hideExtraDays={true}
        theme={{
          backgroundColor: '#FFFFFF',
          calendarBackground: '#FFFFFF',
          textSectionTitleColor: '#64748B',
          selectedDayBackgroundColor: '#0F2B5B',
          selectedDayTextColor: '#FFFFFF',
          todayTextColor: '#0F2B5B',
          dayTextColor: '#0F172A',
          textDisabledColor: '#CBD5E1',
          dotColor: '#1E3A8A',
          selectedDotColor: '#FFFFFF',
          arrowColor: '#0F172A',
          monthTextColor: '#0F172A',
          textMonthFontWeight: '600',
          textMonthFontSize: 18,
          textDayFontSize: 16,
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

      <View style={styles.activeSchedulesContainer}>
        <Text style={styles.activeSchedulesTitle}>Active Schedules ({displayedSchedules.length})</Text>
        {displayedSchedules.length === 0 ? (
          <View style={styles.noSchedulesContainer}>
            <Ionicons name="calendar-outline" size={35} color="#64748B" />
            <Text style={styles.noSchedulesText}>
              {selectedDate
                ? 'No schedules for this date'
                : 'No active schedules'}
            </Text>
          </View>
        ) : (
          displayedSchedules.map(schedule => (
            <View key={schedule.id} style={styles.scheduleItem}>
              <View
                style={[styles.scheduleDot, {backgroundColor: schedule.color}]}
              />
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleName}>{schedule.name}</Text>
              </View>
              <Text style={styles.scheduleDays}>{schedule.days} days</Text>
            </View>
          ))
        )}
      </View>
    </SafeAreaView>
  );
}

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
    padding: 4,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  activeSchedulesContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  activeSchedulesTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleName: {
    fontSize: 14,
  },
  expertInfo: {
    flexDirection: 'row',
    gap: 4,
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    alignItems: 'center',
  },
  expertLabel: {
    fontSize: 12,
  },
  scheduleDays: {
    fontSize: 14,
    color: '#64748B',
  },
  noSchedulesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  noSchedulesText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 8,
  },
});