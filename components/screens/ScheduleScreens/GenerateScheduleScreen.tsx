"use client"

import { useState, useEffect, useMemo } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native"
import Icon from "@react-native-vector-icons/ionicons"
import EnhancedScheduleCard from "./EnhancedScheduleCard"
import { useNavigation } from "@react-navigation/native"
import BackButton from "../../BackButton"
import useScheduleStore from "../../utils/useScheduleStore"
import CommonDialog from "../../commons/CommonDialog"
import { theme } from "../../contants/theme"
const GenerateScheduleScreen = () => {
  const [activeTab, setActiveTab] = useState("All")
  const navigation = useNavigation()
  const { schedules, isLoading, error, fetchSelfSchedules } = useScheduleStore()
  const [showInfoDialog, setShowInfoDialog] = useState(false)

  const hasActiveSchedule = useMemo(() => {
    return schedules?.some(
      (schedule) => schedule.status === "IN_PROGRESS" || schedule.status === "PENDING" || schedule.status === "ONGOING",
    )
  }, [schedules])

  useEffect(() => {
    fetchSelfSchedules()
  }, [])

  // Logic lọc dựa trên tab đang chọn
  const filteredSchedules = useMemo(() => {
    if (!schedules || schedules.length === 0) return []

    switch (activeTab) {
      case "Expert's Choice":
        return schedules.filter((schedule) => schedule.schedule_type === "EXPERT")
      case "My Schedules":
        return schedules.filter((schedule) => schedule.schedule_type !== "EXPERT")
      default: // "All"
        return schedules
    }
  }, [schedules, activeTab])

  const formatScheduleData = (schedule) => {
    if (!schedule || !schedule.ScheduleDay) return null

    // Sắp xếp các ngày theo thứ tự tăng dần
    const sortedDays = [...schedule.ScheduleDay].sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime())

    // Lấy danh sách ngày để hiển thị
    const days = sortedDays.map((day) => new Date(day.day).getDate())

    // Lấy ngày bắt đầu
    const startDate = sortedDays.length > 0 ? new Date(sortedDays[0].day) : new Date()

    // Định dạng ngày bắt đầu
    const formattedStartDate = startDate.toLocaleDateString("vi-VN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })

    // Tạo daySchedules cho mỗi ngày
    const daySchedules = sortedDays.map((day) => {
      const date = new Date(day.day)
      return {
        day: date.getDate(),
        workouts: day.ScheduleDetail.map((detail) => {
          const startTime = new Date(detail.start_time)
          const endTime = new Date(detail.end_time)

          // Định dạng thời gian
          const formattedStartTime = startTime.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })

          const formattedEndTime = endTime.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })

          return {
            time: `${formattedStartTime} - ${formattedEndTime}`,
            name: detail.description || "Session",
            steps: detail.goal_steps || 0,
            distance: detail.goal_distance || 0,
            calories: detail.goal_calories || 0,
            status: detail.status,
            id: detail.id,
            minbpm: detail.goal_minbpms || 0,
            maxbpm: detail.goal_maxbpms || 0,
          }
        }),
      }
    })

    return {
      id: schedule.id,
      title: schedule.title,
      description: schedule.description,
      startDate: formattedStartDate,
      days: days,
      daySchedules: daySchedules,
      isExpertChoice: schedule.schedule_type === "EXPERT",
      status: schedule.status,
    }
  }

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
    )
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
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchSelfSchedules()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
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
        <TouchableOpacity onPress={() => setShowInfoDialog(true)} style={{ marginLeft: "auto" }}>
          <Icon name="information-circle-outline" size={22} color="#0F2B5B" />
        </TouchableOpacity>
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
          style={[styles.actionButton, { backgroundColor: hasActiveSchedule ? "#f3f4f6" : "#F9FAFB" }]}
          onPress={() => {
            navigation.navigate("AddScheduleScreen" as never)
          }}
          disabled={hasActiveSchedule}
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
      <ScrollView style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredSchedules && filteredSchedules.length > 0 ? (
          <>
            {filteredSchedules.map((schedule) => {
              const formattedSchedule = formatScheduleData(schedule)
              if (!formattedSchedule) return null

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
              )
            })}

            {/* Thông báo giới hạn lịch chạy */}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="calendar-outline" size={60} color="#94A3B8" />
            <Text style={styles.emptyText}>
              {activeTab === "All"
                ? "You do not have any training schedule yet."
                : activeTab === "Expert's Choice"
                  ? "No workout schedule from the expert"
                  : "You have not created any workout schedule yet."}
            </Text>
            {activeTab === "My Schedules" && (
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate("AddScheduleScreen" as never)}
              >
                <Text style={styles.createButtonText}>Create new workout schedule</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
      <CommonDialog
        visible={showInfoDialog}
        onClose={() => setShowInfoDialog(false)}
        title="Schedule Info"
        content={
          <View>
            <Text style={styles.dialogText}>- This screen displays all your workout schedules.</Text>
            <Text style={styles.dialogText}>
              - To ensure effective training, each user is only allowed to maintain one running schedule. Complete your
              current goals or adjust your existing schedule to suit your needs. When you are done, you can create a new
              schedule with new challenges!
            </Text>
          </View>
        }
        actionButtons={[
          {
            label: "Got it",
            variant: "contained",
            color: theme.colors.primaryDark,
            handler: () => setShowInfoDialog(false),
          },
        ]}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    position: "relative",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 12,
    color: "#0F172A",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    position: "relative",
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  activeTab: {
    backgroundColor: "#EBF3FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  tabText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#0F2B5B",
    fontWeight: "600",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 1,
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 90,
    height: 90,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  actionButtonText: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 8,
    textAlign: "center",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  scrollViewContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    padding: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 20,
    marginBottom: 28,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  createButton: {
    backgroundColor: "#0F2B5B",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#0F2B5B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0F172A",
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#FFFFFF",
  },
  errorText: {
    fontSize: 16,
    color: "#0F172A",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: "#0F2B5B",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#0F2B5B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  dialogText: {
    fontSize: 15,
    color: "#333",
    marginBottom: 12,
    lineHeight: 22,
  },
})

export default GenerateScheduleScreen
