"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from "react-native"
import Icon from "@react-native-vector-icons/ionicons"
import { Calendar } from "react-native-calendars"
import BackButton from "../BackButton"
const CalendarScreen = () => {
  // Current date and selected date
  const [selectedDate, setSelectedDate] = useState("2025-12-15")
  const [currentMonth, setCurrentMonth] = useState("2025-12-01")

  // Active schedules data
  const activeSchedules = [
    { id: 1, name: "Spring Fitness Challenge", days: 7, color: "#1E3A8A" },
    { id: 2, name: "Morning Cardio", days: 5, color: "#10B981" },
    { id: 3, name: "Marathon Prep", days: 10, color: "#F97316" },
  ]

  // Create marked dates for the calendar
  const markedDates = {
    // Selected date
    "2025-12-15": {
      selected: true,
      selectedColor: "#0F2B5B",
      dots: [{ color: "#1E3A8A" }],
    },

    // Spring Fitness Challenge (blue)
    "2025-12-05": { dots: [{ color: "#1E3A8A" }] },
    "2025-12-06": { dots: [{ color: "#1E3A8A" }] },
    "2025-12-07": {
      dots: [
        { color: "#1E3A8A", key: "fitness" },
        { color: "#10B981", key: "cardio" },
      ],
    },
    "2025-12-08": { dots: [{ color: "#1E3A8A" }, { color: "#10B981" }] },
    "2025-12-09": { dots: [{ color: "#1E3A8A" }] },

    // Morning Cardio (green)
    "2025-12-11": { dots: [{ color: "#10B981" }] },

    // Marathon Prep (orange)
    "2025-12-03": { dots: [{ color: "#F97316" }] },
    "2025-12-04": { dots: [{ color: "#F97316" }] },
    "2025-12-10": { dots: [{ color: "#F97316" }] },
    "2025-12-16": { dots: [{ color: "#F97316" }] },
    "2025-12-17": { dots: [{ color: "#F97316" }] },
    "2025-12-18": { dots: [{ color: "#F97316" }] },
    "2025-12-19": { dots: [{ color: "#F97316" }] },
    "2025-12-20": { dots: [{ color: "#F97316" }] },
    "2025-12-21": { dots: [{ color: "#F97316" }] },
    "2025-12-22": { dots: [{ color: "#F97316" }] },
    "2025-12-23": { dots: [{ color: "#F97316" }] },
    "2025-12-24": { dots: [{ color: "#F97316" }] },
  }

  // Handle month change
  const onMonthChange = (month) => {
    setCurrentMonth(month.dateString)
  }

  // Handle date selection
  const onDayPress = (day) => {
    setSelectedDate(day.dateString)
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackButton size={24} />  
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedules - Full calendar</Text>
      </View>

      {/* Calendar */}
      <Calendar
        current={currentMonth}
        onDayPress={onDayPress}
        onMonthChange={onMonthChange}
        markedDates={markedDates}
        markingType={"multi-dot"}
        // Theme customization
        theme={{
          backgroundColor: "#FFFFFF",
          calendarBackground: "#FFFFFF",
          textSectionTitleColor: "#64748B",
          selectedDayBackgroundColor: "#0F2B5B",
          selectedDayTextColor: "#FFFFFF",
          todayTextColor: "#0F2B5B",
          dayTextColor: "#0F172A",
          textDisabledColor: "#CBD5E1",
          dotColor: "#1E3A8A",
          selectedDotColor: "#FFFFFF",
          arrowColor: "#0F172A",
          monthTextColor: "#0F172A",
          textMonthFontWeight: "600",
          textMonthFontSize: 18,
          textDayFontSize: 16,
          textDayHeaderFontSize: 14,
        }}
        // Custom header
        renderHeader={(date) => {
          const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ]
          const month = date.getMonth()
          const year = date.getFullYear()
          return (
            <Text style={styles.monthTitle}>
              {monthNames[month]} {year}
            </Text>
          )
        }}
        // Enable dot marking
        enableSwipeMonths={true}
      />

      {/* Active Schedules */}
      <View style={styles.activeSchedulesContainer}>
        <Text style={styles.activeSchedulesTitle}>Active Schedules</Text>

        {activeSchedules.map((schedule) => (
          <View key={schedule.id} style={styles.scheduleItem}>
            <View style={[styles.scheduleDot, { backgroundColor: schedule.color }]} />
            <Text style={styles.scheduleName}>{schedule.name}</Text>
            <Text style={styles.scheduleDays}>{schedule.days} days</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backButton: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
  },
  activeSchedulesContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  activeSchedulesTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  scheduleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  scheduleName: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  scheduleDays: {
    fontSize: 14,
    color: "#64748B",
  },
})

export default CalendarScreen

