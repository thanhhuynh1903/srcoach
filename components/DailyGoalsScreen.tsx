import React, { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Switch } from "react-native"
import Icon from "@react-native-vector-icons/ionicons"

interface DailyGoal {
  distance: string
  calories: string
  steps: string
  sessions: {
    morning: boolean
    noon: boolean
    afternoon: boolean
    evening: boolean
    lateNight: boolean
  }
  sessionTimes: {
    morning: string
    noon: string
    afternoon: string
    evening: string
    lateNight: string
  }
}

interface DailyGoalsSectionProps {
  selectedDates: Record<string, any>
  onGoalsChange: (dailyGoals: Record<string, DailyGoal>) => void
}

const DailyGoalsSection: React.FC<DailyGoalsSectionProps> = ({ selectedDates, onGoalsChange }) => {
  const [expandedDay, setExpandedDay] = useState<string | null>(null)
  const [dailyGoals, setDailyGoals] = useState<Record<string, DailyGoal>>({})

  // Thời gian mặc định cho mỗi phiên
  const defaultSessionTimes = {
    morning: "06:00 - 08:00",
    noon: "11:00 - 13:00",
    afternoon: "15:00 - 17:00",
    evening: "18:00 - 20:00",
    lateNight: "21:00 - 23:00",
  }

  // Khởi tạo mục tiêu cho các ngày mới được chọn
  React.useEffect(() => {
    const newDailyGoals = { ...dailyGoals }

    // Thêm ngày mới
    Object.keys(selectedDates).forEach((date) => {
      if (!newDailyGoals[date]) {
        newDailyGoals[date] = {
          distance: "0",
          calories: "0",
          steps: "0",
          sessions: {
            morning: false,
            noon: false,
            afternoon: false,
            evening: false,
            lateNight: false,
          },
          sessionTimes: { ...defaultSessionTimes },
        }
      }
    })

    // Xóa các ngày không còn được chọn
    Object.keys(newDailyGoals).forEach((date) => {
      if (!selectedDates[date]) {
        delete newDailyGoals[date]
      }
    })

    setDailyGoals(newDailyGoals)
    onGoalsChange(newDailyGoals)
  }, [selectedDates])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  }

  const updateGoal = (date: string, goalType: keyof DailyGoal, value: string) => {
    const newDailyGoals = {
      ...dailyGoals,
      [date]: {
        ...dailyGoals[date],
        [goalType]: value,
      },
    }
    setDailyGoals(newDailyGoals)
    onGoalsChange(newDailyGoals)
  }

  const toggleSession = (date: string, session: keyof DailyGoal["sessions"]) => {
    const newDailyGoals = {
      ...dailyGoals,
      [date]: {
        ...dailyGoals[date],
        sessions: {
          ...dailyGoals[date].sessions,
          [session]: !dailyGoals[date].sessions[session],
        },
      },
    }
    setDailyGoals(newDailyGoals)
    onGoalsChange(newDailyGoals)
  }

  const updateSessionTime = (date: string, session: keyof DailyGoal["sessionTimes"], value: string) => {
    const newDailyGoals = {
      ...dailyGoals,
      [date]: {
        ...dailyGoals[date],
        sessionTimes: {
          ...dailyGoals[date].sessionTimes,
          [session]: value,
        },
      },
    }
    setDailyGoals(newDailyGoals)
    onGoalsChange(newDailyGoals)
  }

  const toggleDay = (date: string) => {
    setExpandedDay(expandedDay === date ? null : date)
  }

  const getActiveSessions = (date: string) => {
    if (!dailyGoals[date]?.sessions) return 0
    return Object.values(dailyGoals[date].sessions).filter(Boolean).length
  }

  if (Object.keys(selectedDates).length === 0) {
    return null
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Daily Goals</Text>
      <Text style={styles.sectionDescription}>Set specific goals for each day of your schedule</Text>

      <ScrollView
        style={styles.daysContainer}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 8 }}
      >
        {Object.keys(selectedDates)
          .sort()
          .map((date) => (
            <View key={date} style={styles.dayCard}>
              <TouchableOpacity style={styles.dayHeader} onPress={() => toggleDay(date)} activeOpacity={0.7}>
                <View style={styles.dayHeaderLeft}>
                  <View style={styles.dateCircle}>
                    <Text style={styles.dateNumber}>{new Date(date).getDate()}</Text>
                  </View>
                  <View>
                    <Text style={styles.dateText}>{formatDate(date)}</Text>
                    <Text style={styles.sessionCount}>
                      {getActiveSessions(date)} {getActiveSessions(date) === 1 ? "session" : "sessions"} selected
                    </Text>
                  </View>
                </View>
                <Icon name={expandedDay === date ? "chevron-up" : "chevron-down"} size={20} color="#64748B" />
              </TouchableOpacity>

              {expandedDay === date && (
                <View style={styles.dayGoals}>
                  {/* Sessions Selection */}
                  <Text style={styles.sectionSubtitle}>Training Sessions</Text>
                  
                  <SessionToggle
                    title="Morning"
                    time={dailyGoals[date]?.sessionTimes.morning || defaultSessionTimes.morning}
                    isActive={dailyGoals[date]?.sessions.morning || false}
                    onToggle={() => toggleSession(date, "morning")}
                    onTimeChange={(value) => updateSessionTime(date, "morning", value)}
                  />
                  
                  <SessionToggle
                    title="Noon"
                    time={dailyGoals[date]?.sessionTimes.noon || defaultSessionTimes.noon}
                    isActive={dailyGoals[date]?.sessions.noon || false}
                    onToggle={() => toggleSession(date, "noon")}
                    onTimeChange={(value) => updateSessionTime(date, "noon", value)}
                  />
                  
                  <SessionToggle
                    title="Afternoon"
                    time={dailyGoals[date]?.sessionTimes.afternoon || defaultSessionTimes.afternoon}
                    isActive={dailyGoals[date]?.sessions.afternoon || false}
                    onToggle={() => toggleSession(date, "afternoon")}
                    onTimeChange={(value) => updateSessionTime(date, "afternoon", value)}
                  />
                  
                  <SessionToggle
                    title="Evening"
                    time={dailyGoals[date]?.sessionTimes.evening || defaultSessionTimes.evening}
                    isActive={dailyGoals[date]?.sessions.evening || false}
                    onToggle={() => toggleSession(date, "evening")}
                    onTimeChange={(value) => updateSessionTime(date, "evening", value)}
                  />
                  
                  <SessionToggle
                    title="Late Night"
                    time={dailyGoals[date]?.sessionTimes.lateNight || defaultSessionTimes.lateNight}
                    isActive={dailyGoals[date]?.sessions.lateNight || false}
                    onToggle={() => toggleSession(date, "lateNight")}
                    onTimeChange={(value) => updateSessionTime(date, "lateNight", value)}
                  />

                  <View style={styles.divider} />

                  {/* Goals */}
                  <Text style={styles.sectionSubtitle}>Daily Training Goals</Text>

                  <View style={styles.goalRow}>
                    <View style={styles.goalIconContainer}>
                      <Icon name="walk" size={16} color="#0F2B5B" />
                    </View>
                    <Text style={styles.goalLabel}>Distance</Text>
                    <View style={styles.goalInputWrapper}>
                      <TextInput
                        style={styles.goalInput}
                        value={dailyGoals[date]?.distance || "0"}
                        onChangeText={(value) => updateGoal(date, "distance", value)}
                        keyboardType="numeric"
                      />
                      <Text style={styles.goalUnit}>km</Text>
                    </View>
                  </View>

                  <View style={styles.goalRow}>
                    <View style={styles.goalIconContainer}>
                      <Icon name="flame" size={16} color="#0F2B5B" />
                    </View>
                    <Text style={styles.goalLabel}>Calories</Text>
                    <View style={styles.goalInputWrapper}>
                      <TextInput
                        style={styles.goalInput}
                        value={dailyGoals[date]?.calories || "0"}
                        onChangeText={(value) => updateGoal(date, "calories", value)}
                        keyboardType="numeric"
                      />
                      <Text style={styles.goalUnit}>kcal</Text>
                    </View>
                  </View>

                  <View style={styles.goalRow}>
                    <View style={styles.goalIconContainer}>
                      <Icon name="footsteps" size={16} color="#0F2B5B" />
                    </View>
                    <Text style={styles.goalLabel}>Steps</Text>
                    <View style={styles.goalInputWrapper}>
                      <TextInput
                        style={styles.goalInput}
                        value={dailyGoals[date]?.steps || "0"}
                        onChangeText={(value) => updateGoal(date, "steps", value)}
                        keyboardType="numeric"
                      />
                      <Text style={styles.goalUnit}>steps</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          ))}
      </ScrollView>
    </View>
  )
}

interface SessionToggleProps {
  title: string
  time: string
  isActive: boolean
  onToggle: () => void
  onTimeChange: (value: string) => void
}

const SessionToggle: React.FC<SessionToggleProps> = ({ title, time, isActive, onToggle, onTimeChange }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [timeValue, setTimeValue] = useState(time)

  const handleTimeChange = (value: string) => {
    setTimeValue(value)
  }

  const saveTimeChange = () => {
    onTimeChange(timeValue)
    setIsEditing(false)
  }

  return (
    <View style={styles.sessionRow}>
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionTitle}>{title}</Text>
        {isEditing ? (
          <View style={styles.timeEditContainer}>
            <TextInput
              style={styles.timeInput}
              value={timeValue}
              onChangeText={handleTimeChange}
              onBlur={saveTimeChange}
              autoFocus
            />
            <TouchableOpacity onPress={saveTimeChange} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => isActive && setIsEditing(true)}>
            <Text style={[styles.sessionTime, !isActive && styles.sessionTimeInactive]}>{time}</Text>
          </TouchableOpacity>
        )}
      </View>
      <Switch
        value={isActive}
        onValueChange={onToggle}
        trackColor={{ false: "#E2E8F0", true: "#BAC8FF" }}
        thumbColor={isActive ? "#0F2B5B" : "#F1F5F9"}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0F172A",
    marginBottom: 12,
    marginTop: 4,
  },
  daysContainer: {
    maxHeight: 450, // Tăng chiều cao để hiển thị nhiều nội dung hơn
    flexGrow: 0,
  },
  dayCard: {
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  dayHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0F2B5B",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  dateNumber: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0F172A",
  },
  sessionCount: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  dayGoals: {
    padding: 12,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 16,
  },
  sessionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7",
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0F172A",
  },
  sessionTime: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  sessionTimeInactive: {
    color: "#CBD5E1",
  },
  timeEditContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  timeInput: {
    fontSize: 12,
    color: "#0F172A",
    borderWidth: 1,
    borderColor: "#BAC8FF",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: "#0F2B5B",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  goalIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E0E7FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  goalLabel: {
    fontSize: 14,
    color: "#0F172A",
    flex: 1,
  },
  goalInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 100,
  },
  goalInput: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
    padding: 0,
    textAlign: "right",
  },
  goalUnit: {
    fontSize: 12,
    color: "#64748B",
    marginLeft: 4,
    width: 30,
  },
})

export default DailyGoalsSection

