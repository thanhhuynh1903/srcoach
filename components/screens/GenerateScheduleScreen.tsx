import { useState,useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar,ActivityIndicator } from "react-native"
import Icon from "@react-native-vector-icons/ionicons"
import EnhancedScheduleCard from "./EnhancedScheduleCard"
import { useNavigation } from "@react-navigation/native"
import BackButton from "../BackButton"
import useScheduleStore from "../utils/useScheduleStore"
// Mock component for BackButton

const GenerateScheduleScreen = () => {
  const [activeTab, setActiveTab] = useState("All")
  const navigation = useNavigation()
  const { schedules, isLoading, error, fetchSelfSchedules } = useScheduleStore();
  useEffect(() => {
    fetchSelfSchedules();
  }, []);
  const formatScheduleData = (schedule) => {
    if (!schedule || !schedule.ScheduleDay) return null;
    
    // Sắp xếp các ngày theo thứ tự tăng dần
    const sortedDays = [...schedule.ScheduleDay].sort((a, b) => 
      new Date(a.day).getTime() - new Date(b.day).getTime()
    );
    
    // Lấy danh sách ngày để hiển thị
    const days = sortedDays.map(day => new Date(day.day).getDate());
    
    // Lấy ngày bắt đầu
    const startDate = sortedDays.length > 0 
      ? new Date(sortedDays[0].day) 
      : new Date();
    
    // Định dạng ngày bắt đầu
    const formattedStartDate = startDate.toLocaleDateString('vi-VN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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
            hour12: false
          });
          
          const formattedEndTime = endTime.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
          
          return {
            time: `${formattedStartTime} - ${formattedEndTime}`,
            name: detail.description || "Session",
            steps: detail.goal_steps || 0,
            distance: detail.goal_distance || 0,
            calories: detail.goal_calories || 0,
            status: detail.status,
            id: detail.id
          };
        })
      };
    });
    
    return {
      id: schedule.id,
      title: schedule.title,
      description: schedule.description ,
      startDate: formattedStartDate,
      days: days,
      daySchedules: daySchedules,
      isExpertChoice: schedule.schedule_type === "EXPERT",
      status: schedule.status
    };
  };

  // Hiển thị màn hình loading
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
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
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
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
        <TouchableOpacity style={styles.backButton}>
          <BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedules</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {["All", "Expert's Choice", "My Schedules"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            navigation.navigate("CalendarScreen" as never)
          }}
        >
          <Icon name="calendar-outline" size={24} color="#555" />
          <Text style={styles.actionButtonText}>Full{"\n"}Calendar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            navigation.navigate("AddScheduleScreen" as never)
          }}
        >
          <Icon name="add-circle-outline" size={24} color="#555" />
          <Text style={styles.actionButtonText}>Add{"\n"}Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            navigation.navigate("ScheduleHistoryScreen" as never)
          }}
        >
          <Icon name="time-outline" size={24} color="#555" />
          <Text style={styles.actionButtonText}>History</Text>
        </TouchableOpacity>
      </View>

      {/* Schedule Cards */}
      <ScrollView style={styles.scrollView}>
      {schedules && schedules.length > 0 ? (
          schedules.map((schedule) => {
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
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="calendar-outline" size={60} color="#94A3B8" />
            <Text style={styles.emptyText}>Bạn chưa có lịch tập nào</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

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
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
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
  },

  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  activeTab: {
    backgroundColor: "#F4F0FF",
  },
  tabText: {
    fontSize: 14,
    color: "#64748B",
  },
  activeTabText: {
    color: "#052658",
    fontWeight: "500",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 80,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 12,
    color: "#4B5563",
    marginTop: 6,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
})

export default GenerateScheduleScreen
