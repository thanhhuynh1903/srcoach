import {useState, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import EnhancedScheduleCard from './EnhancedScheduleCard';
import {useNavigation} from '@react-navigation/native';
import BackButton from '../BackButton';
import useScheduleStore from '../utils/useScheduleStore';

const GenerateScheduleScreen = () => {
  const [activeTab, setActiveTab] = useState('All');
  const navigation = useNavigation();
  const {schedules, isLoading, error, fetchSelfSchedules} = useScheduleStore();

  const hasActiveSchedule = useMemo(() => {
    return schedules?.some(
      schedule =>
        schedule.status === 'IN_PROGRESS' ||
        schedule.status === 'PENDING' ||
        schedule.status === 'ONGOING',
    );
  }, [schedules]);

  useEffect(() => {
    fetchSelfSchedules();
  }, []);

  // Logic lọc dựa trên tab đang chọn
  const filteredSchedules = useMemo(() => {
    if (!schedules || schedules.length === 0) return [];

    switch (activeTab) {
      case "Expert's Choice":
        return schedules.filter(
          schedule => schedule.schedule_type === 'EXPERT',
        );
      case 'My Schedules':
        return schedules.filter(
          schedule => schedule.schedule_type !== 'EXPERT',
        );
      default: // "All"
        return schedules;
    }
  }, [schedules, activeTab]);

  const formatScheduleData = schedule => {
    if (!schedule || !schedule.ScheduleDay) return null;

    // Sắp xếp các ngày theo thứ tự tăng dần
    const sortedDays = [...schedule.ScheduleDay].sort(
      (a, b) => new Date(a.day).getTime() - new Date(b.day).getTime(),
    );

    // Lấy danh sách ngày để hiển thị
    const days = sortedDays.map(day => new Date(day.day).getDate());

    // Lấy ngày bắt đầu
    const startDate =
      sortedDays.length > 0 ? new Date(sortedDays[0].day) : new Date();

    // Định dạng ngày bắt đầu
    const formattedStartDate = startDate.toLocaleDateString('vi-VN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    // Tạo daySchedules cho mỗi ngày
    const daySchedules = sortedDays.map(day => {
      const date = new Date(day.day);
      return {
        day: date.getDate(),
        workouts: day.ScheduleDetail.map(detail => {
          const startTime = new Date(detail.start_time);
          const endTime = new Date(detail.end_time);

          // Định dạng thời gian
          const formattedStartTime = startTime.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });

          const formattedEndTime = endTime.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });

          return {
            time: `${formattedStartTime} - ${formattedEndTime}`,
            name: detail.description || 'Session',
            steps: detail.goal_steps || 0,
            distance: detail.goal_distance || 0,
            calories: detail.goal_calories || 0,
            status: detail.status,
            id: detail.id,
          };
        }),
      };
    });

    return {
      id: schedule.id,
      title: schedule.title,
      description: schedule.description,
      startDate: formattedStartDate,
      days: days,
      daySchedules: daySchedules,
      isExpertChoice: schedule.schedule_type === 'EXPERT',
      status: schedule.status,
    };
  };

  // Hiển thị màn hình loading
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <BackButton size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Schedule</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0F2B5B" />
          <Text style={styles.loadingText}>Loading schedules...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Hiển thị thông báo lỗi
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <BackButton size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Schedule</Text>
        </View>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={60} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchSelfSchedules()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedules</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {['All', "Expert's Choice", 'My Schedules'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}>
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            navigation.navigate('CalendarScreen' as never);
          }}>
          <Icon name="calendar-outline" size={24} color="#555" />
          <Text style={styles.actionButtonText}>Full{'\n'}Calendar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton,{  backgroundColor: hasActiveSchedule ? '#f3f4f6' : '#F9FAFB', }]}
          onPress={() => {
            navigation.navigate('AddScheduleScreen' as never);
          }}
          disabled={hasActiveSchedule}>
          <Icon name="add-circle-outline" size={24} color="#555" />
          <Text style={styles.actionButtonText}>Add{'\n'}Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            navigation.navigate('ScheduleHistoryScreen' as never);
          }}>
          <Icon name="time-outline" size={24} color="#555" />
          <Text style={styles.actionButtonText}>History</Text>
        </TouchableOpacity>
      </View>

      {/* Schedule Cards */}
      <ScrollView style={styles.scrollView}>
        {filteredSchedules && filteredSchedules.length > 0 ? (
          <>
            {filteredSchedules.map(schedule => {
              const formattedSchedule = formatScheduleData(schedule);
              if (!formattedSchedule) return null;

              return (
                <EnhancedScheduleCard
                  key={formattedSchedule.id}
                  id={formattedSchedule.id}
                  title={formattedSchedule.title}
                  description={formattedSchedule.description}
                  startDate={formattedSchedule.startDate}
                  days={formattedSchedule.days}
                  selectedDay={formattedSchedule.days[0] || 0}
                  alarmEnabled={false}
                  isExpertChoice={formattedSchedule.isExpertChoice}
                  daySchedules={formattedSchedule.daySchedules}
                  status={formattedSchedule.status}
                />
              );
            })}

            {/* Thông báo giới hạn lịch chạy */}
            <View style={styles.limitNoteContainer}>
              <Icon
                name="information-circle-outline"
                size={22}
                color="#0F2B5B"
              />
              <Text style={styles.limitNoteText}>
                Để đảm bảo hiệu quả tập luyện, mỗi người dùng chỉ được phép duy
                trì một lịch chạy. Hãy hoàn thành mục tiêu hiện tại hoặc điều
                chỉnh lịch trình sẵn có để phù hợp với nhu cầu của bạn. Khi hoàn
                thành, bạn có thể tạo lịch mới với những thách thức mới!
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="calendar-outline" size={60} color="#94A3B8" />
            <Text style={styles.emptyText}>
              {activeTab === 'All'
                ? 'Bạn chưa có lịch tập nào'
                : activeTab === "Expert's Choice"
                ? 'Không có lịch tập nào từ chuyên gia'
                : 'Bạn chưa tạo lịch tập nào'}
            </Text>
            {activeTab === 'My Schedules' && (
              <TouchableOpacity
                style={styles.createButton}
                onPress={() =>
                  navigation.navigate('AddScheduleScreen' as never)
                }>
                <Text style={styles.createButtonText}>Tạo lịch tập mới</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
    marginTop: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F1F5F9',
  },
  errorText: {
    fontSize: 16,
    color: '#0F172A',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#0F2B5B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#0F2B5B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  activeTab: {
    backgroundColor: '#F4F0FF',
  },
  tabText: {
    fontSize: 14,
    color: '#64748B',
  },
  activeTabText: {
    color: '#052658',
    fontWeight: '500',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 6,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  limitNoteContainer: {
    backgroundColor: '#EBF3FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#0F2B5B',
  },
  limitNoteText: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    marginLeft: 10,
  },
});

export default GenerateScheduleScreen;
