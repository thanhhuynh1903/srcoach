"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from "react-native"
import Icon from "@react-native-vector-icons/ionicons"

const ScheduleDetailScreen = ({ navigation }) => {
  const [selectedDay, setSelectedDay] = useState("11")

  // Days data for the horizontal scroll
  const days = [
    { day: "11", weekday: "Thứ" },
    { day: "14", weekday: "Thứ" },
    { day: "16", weekday: "Thứ" },
    { day: "18", weekday: "Thứ" },
    { day: "21", weekday: "Thứ" },
  ]

  // Schedule data
  const scheduleData = [
    {
      date: "Thứ Sáu, 11/04/2025",
      sessions: [
        {
          time: "12:00 - 14:00",
          name: "Buổi sáng",
          steps: 6000,
          distance: 6.5,
          calories: 350,
        },
        {
          time: "02:00 - 06:00",
          name: "Buổi chiều",
          steps: 9000,
          distance: 9.5,
          calories: 650,
        },
      ],
    },
    {
      date: "Thứ Hai, 14/04/2025",
      sessions: [
        {
          time: "12:00 - 14:00",
          name: "Buổi sáng",
          steps: 6000,
          distance: 6.2,
          calories: 340,
        },
        {
          time: "02:00 - 06:00",
          name: "Buổi chiều",
          steps: 8500,
          distance: 8.8,
          calories: 620,
        },
      ],
    },
    {
      date: "Thứ Tư, 16/04/2025",
      sessions: [
        {
          time: "13:00 - 15:00",
          name: "Chạy buổi sáng",
          steps: 5000,
          distance: 5.2,
          calories: 300,
        },
      ],
    },
    {
      date: "Thứ Sáu, 18/04/2025",
      sessions: [
        {
          time: "12:00 - 14:00",
          name: "Buổi sáng",
          steps: 6100,
          distance: 6.1,
          calories: 355,
        },
        {
          time: "02:00 - 06:00",
          name: "Buổi chiều",
          steps: 9200,
          distance: 8.9,
          calories: 670,
        },
      ],
    },
    {
      date: "Thứ Hai, 21/04/2025",
      sessions: [
        {
          time: "12:00 - 14:00",
          name: "Buổi sáng",
          steps: 6500,
          distance: 6.8,
          calories: 370,
        },
        {
          time: "02:00 - 06:00",
          name: "Buổi chiều",
          steps: 8900,
          distance: 9.1,
          calories: 630,
        },
      ],
    },
    {
      date: "Thứ Tư, 23/04/2025",
      sessions: [
        {
          time: "13:00 - 15:00",
          name: "Chạy buổi sáng",
          steps: 5300,
          distance: 5.6,
          calories: 310,
        },
      ],
    },
    {
      date: "Thứ Sáu, 25/04/2025",
      sessions: [
        {
          time: "12:00 - 14:00",
          name: "Buổi sáng",
          steps: 6100,
          distance: 6.3,
          calories: 345,
        },
        {
          time: "02:00 - 06:00",
          name: "Buổi chiều",
          steps: 9300,
          distance: 9.7,
          calories: 660,
        },
      ],
    },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack()}>
          <Icon name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Lịch tập tuần 1 (2 tuần)</Text>
          <Text style={styles.headerSubtitle}>Kế hoạch chạy Thứ 2-4-6 trong 2 tuần</Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        {/* Days Selector */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.daysContainer}
          style={styles.daysScrollView}
        >
          {days.map((day) => (
            <TouchableOpacity
              key={day.day}
              style={[styles.dayButton, selectedDay === day.day && styles.selectedDayButton]}
              onPress={() => setSelectedDay(day.day)}
            >
              <Text style={[styles.dayWeekday, selectedDay === day.day && styles.selectedDayText]}>{day.weekday}</Text>
              <Text style={[styles.dayNumber, selectedDay === day.day && styles.selectedDayText]}>{day.day}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Schedule Content */}
        <ScrollView 
          style={styles.scheduleContainer} 
          contentContainerStyle={styles.scheduleContentContainer}
          showsVerticalScrollIndicator={false}
        >
          {scheduleData
            .filter((daySchedule) => {
              // Show only the selected day's schedule
              if (selectedDay === "11" && daySchedule.date.includes("11/04/2025")) return true
              if (selectedDay === "14" && daySchedule.date.includes("14/04/2025")) return true
              if (selectedDay === "16" && daySchedule.date.includes("16/04/2025")) return true
              if (selectedDay === "18" && daySchedule.date.includes("18/04/2025")) return true
              if (selectedDay === "21" && daySchedule.date.includes("21/04/2025")) return true
              return false
            })
            .map((daySchedule, index) => (
              <View key={index} style={styles.daySchedule}>
                <Text style={styles.dateText}>{daySchedule.date}</Text>

                {daySchedule.sessions.map((session, sessionIndex) => (
                  <View key={sessionIndex} style={styles.sessionContainer}>
                    {/* Time */}
                    <View style={styles.timeContainer}>
                      <Icon name="time-outline" size={18} color="#666" />
                      <Text style={styles.timeText}>{session.time}</Text>
                    </View>

                    {/* Session Name */}
                    <Text style={styles.sessionName}>{session.name}</Text>

                    {/* Stats */}
                    <View style={styles.statsContainer}>
                      {/* Steps */}
                      <View style={styles.statItem}>
                        <Icon name="footsteps-outline" size={24} color="#4285F4" />
                        <Text style={styles.statValue}>{session.steps.toLocaleString()}</Text>
                        <Text style={styles.statLabel}>bước</Text>
                      </View>

                      {/* Distance */}
                      <View style={styles.statItem}>
                        <Icon name="map-outline" size={24} color="#4285F4" />
                        <Text style={styles.statValue}>{session.distance} km</Text>
                        <Text style={styles.statLabel}>Quãng đường</Text>
                      </View>

                      {/* Calories */}
                      <View style={styles.statItem}>
                        <Icon name="flame-outline" size={24} color="#4285F4" />
                        <Text style={styles.statValue}>{session.calories}</Text>
                        <Text style={styles.statLabel}>Calories</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  backButton: {
    padding: 4,
  },
  headerTextContainer: {
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  daysScrollView: {
    backgroundColor: "#FFF",
    maxHeight: 84, // Set a fixed height for the ScrollView
  },
  daysContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  dayButton: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  selectedDayButton: {
    backgroundColor: "#4285F4",
  },
  dayWeekday: {
    fontSize: 14,
    color: "#666",
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  selectedDayText: {
    color: "#FFF",
  },
  scheduleContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scheduleContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  daySchedule: {
    marginBottom: 16,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
    marginTop: 0,
  },
  sessionContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  timeText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
})

export default ScheduleDetailScreen