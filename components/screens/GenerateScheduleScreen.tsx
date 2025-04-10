import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from "react-native"
import Icon from "@react-native-vector-icons/ionicons"
import EnhancedScheduleCard from "./EnhancedScheduleCard"
import { useNavigation } from "@react-navigation/native"
import BackButton from "../BackButton"
// Mock component for BackButton

const GenerateScheduleScreen = () => {
  const [activeTab, setActiveTab] = useState("All")
  const navigation = useNavigation()

  // Sample workout data for each day
  const springFitnessDaySchedules = [
    {
      day: 15,
      workouts: [
        {
          time: "12:00 - 14:00",
          name: "Buổi sáng",
          steps: 6000,
          distance: 6.5,
          calories: 350,
        },
        {
          time: "16:00 - 18:00",
          name: "Buổi chiều",
          steps: 9000,
          distance: 9.5,
          calories: 650,
        },
      ],
    },
    {
      day: 16,
      workouts: [
        {
          time: "07:00 - 08:30",
          name: "Chạy buổi sáng",
          steps: 5000,
          distance: 5.2,
          calories: 300,
        },
      ],
    },
    {
      day: 17,
      workouts: [
        {
          time: "12:00 - 14:00",
          name: "Buổi sáng",
          steps: 6100,
          distance: 6.1,
          calories: 355,
        },
        {
          time: "17:00 - 19:00",
          name: "Buổi chiều",
          steps: 9200,
          distance: 8.9,
          calories: 670,
        },
      ],
    },
    {
      day: 18,
      workouts: [
        {
          time: "06:00 - 07:30",
          name: "Chạy buổi sáng",
          steps: 5300,
          distance: 5.6,
          calories: 310,
        },
      ],
    },
    {
      day: 19,
      workouts: [
        {
          time: "12:00 - 14:00",
          name: "Buổi sáng",
          steps: 6500,
          distance: 6.8,
          calories: 370,
        },
        {
          time: "16:00 - 18:00",
          name: "Buổi chiều",
          steps: 8900,
          distance: 9.1,
          calories: 630,
        },
      ],
    },
    {
      day: 20,
      workouts: [
        {
          time: "07:00 - 08:30",
          name: "Chạy buổi sáng",
          steps: 5300,
          distance: 5.6,
          calories: 310,
        },
      ],
    },
    {
      day: 21,
      workouts: [
        {
          time: "12:00 - 14:00",
          name: "Buổi sáng",
          steps: 6100,
          distance: 6.3,
          calories: 345,
        },
        {
          time: "17:00 - 19:00",
          name: "Buổi chiều",
          steps: 9300,
          distance: 9.7,
          calories: 660,
        },
      ],
    },
  ]

  const morningCardioDaySchedules = [
    {
      day: 10,
      workouts: [
        {
          time: "06:00 - 07:30",
          name: "Cardio nhẹ",
          steps: 4500,
          distance: 3.0,
          calories: 280,
        },
      ],
    },
    {
      day: 11,
      workouts: [
        {
          time: "06:00 - 07:30",
          name: "Cardio cường độ cao",
          steps: 5200,
          distance: 3.5,
          calories: 320,
        },
      ],
    },
    {
      day: 12,
      workouts: [
        {
          time: "06:00 - 07:00",
          name: "Chạy bộ",
          steps: 4800,
          distance: 3.2,
          calories: 290,
        },
      ],
    },
    {
      day: 13,
      workouts: [
        {
          time: "06:00 - 07:30",
          name: "Cardio nhẹ",
          steps: 4500,
          distance: 3.0,
          calories: 280,
        },
      ],
    },
    {
      day: 14,
      workouts: [
        {
          time: "06:00 - 07:30",
          name: "Cardio cường độ cao",
          steps: 5200,
          distance: 3.5,
          calories: 320,
        },
      ],
    },
    {
      day: 15,
      workouts: [
        {
          time: "06:00 - 07:00",
          name: "Chạy bộ",
          steps: 4800,
          distance: 3.2,
          calories: 290,
        },
      ],
    },
  ]

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
        <EnhancedScheduleCard
          title="Spring Fitness Challenge"
          description="30-day comprehensive workout plan designed by fitness experts"
          startDate="Mar 15, 2024"
         
          days={[15, 16, 17, 18, 19, 20, 21]}
          selectedDay={15}
          alarmEnabled={true}
          isExpertChoice={true}
          daySchedules={springFitnessDaySchedules}
        />

        <EnhancedScheduleCard
          title="Morning Cardio Routine"
          description="Personal cardio workout schedule for morning sessions"
          startDate="Mar 10, 2024"
          metrics={[
            { icon: "walk", value: "3km" },
            { icon: "flame", value: "300kcal" },
            { icon: "footsteps", value: "8,000" },
            { icon: "time", value: "13:00pm" },
          ]}
          days={[10, 11, 12, 13, 14, 15]}
          selectedDay={10}
          alarmEnabled={false}
          isExpertChoice={false}
          daySchedules={morningCardioDaySchedules}
        />
      </ScrollView>
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
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
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
