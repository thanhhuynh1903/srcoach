import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Switch } from "react-native"
import Icon from "@react-native-vector-icons/ionicons"
import { format } from "date-fns"
import { US } from "date-fns/locale"
interface TrainingSession {
  description: string
  start_time: string
  end_time: string
  goal_steps: number
  goal_distance: number
  goal_calories: number
}

interface DailySchedule {
  day: string
  details: TrainingSession[]
}

interface DailyGoalsSectionProps {
  selectedDates: Record<string, any>
  onGoalsChange: (schedule: DailySchedule[]) => void
}

const DailyGoalsSection: React.FC<DailyGoalsSectionProps> = ({ selectedDates, onGoalsChange }) => {
  const [expandedDay, setExpandedDay] = useState<string | null>(null)
  const [dailySchedule, setDailySchedule] = useState<DailySchedule[]>([])

  // Thời gian mặc định cho các buổi tập
  const defaultSessions = {
    morning: {
      description: "Morning",
      start_time: "06:00",
      end_time: "08:00",
      goal_steps: 5000,
      goal_distance: 5,
      goal_calories: 300
    },
    afternoon: {
      description: "afternoon",
      start_time: "15:00",
      end_time: "17:00",
      goal_steps: 8000,
      goal_distance: 8,
      goal_calories: 500
    },
    evening: {
      description: "evening",
      start_time: "18:00",
      end_time: "20:00",
      goal_steps: 6000,
      goal_distance: 6,
      goal_calories: 400
    }
  }

  // Hàm kiểm tra và sửa lỗi dữ liệu trước khi gửi đi
  const validateAndFixScheduleData = (scheduleData: DailySchedule[]): DailySchedule[] => {
    return scheduleData.map(day => {
      return {
        day: day.day,
        details: day.details.map(session => {
          return {
            description: session.description || "Session",
            start_time: session.start_time,
            end_time: session.end_time,
            goal_steps: typeof session.goal_steps === 'string' ? parseInt(session.goal_steps) : session.goal_steps,
            goal_distance: typeof session.goal_distance === 'string' ? parseFloat(session.goal_distance) : session.goal_distance,
            goal_calories: typeof session.goal_calories === 'string' ? parseInt(session.goal_calories) : session.goal_calories
          };
        })
      };
    });
  }

  // Khởi tạo lịch cho các ngày được chọn
  useEffect(() => {
    const newSchedule: DailySchedule[] = []
    
    Object.keys(selectedDates).sort().forEach(date => {
      // Kiểm tra xem ngày đã có trong lịch chưa
      const existingDay = dailySchedule.find(item => item.day === date)
      
      if (existingDay) {
        newSchedule.push(existingDay)
      } else {
        // Thêm ngày mới với buổi sáng mặc định
        newSchedule.push({
          day: date,
          details: [{
            ...defaultSessions.morning,
            start_time: `${date}T${defaultSessions.morning.start_time}:00.000Z`,
            end_time: `${date}T${defaultSessions.morning.end_time}:00.000Z`
          }]
        })
      }
    })
    
    // Loại bỏ các ngày không còn được chọn
    const filteredSchedule = newSchedule.filter(day => 
      Object.keys(selectedDates).includes(day.day)
    );
    
    // Kiểm tra và sửa lỗi dữ liệu
    const validatedSchedule = validateAndFixScheduleData(filteredSchedule);
    
    setDailySchedule(validatedSchedule)
    onGoalsChange(validatedSchedule)
  }, [selectedDates])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "EEE, dd/MM", { locale: US })
  }

  const toggleDay = (date: string) => {
    setExpandedDay(expandedDay === date ? null : date)
  }

  const addSession = (dayIndex: number) => {
    const newSchedule = [...dailySchedule]
    const day = newSchedule[dayIndex]
    const date = day.day
    
    // Thêm buổi tập mới vào ngày với giá trị số đúng kiểu dữ liệu
    day.details.push({
      description: "New Session",
      start_time: `${date}T${defaultSessions.afternoon.start_time}:00.000Z`,
      end_time: `${date}T${defaultSessions.afternoon.end_time}:00.000Z`,
      goal_steps: Number(defaultSessions.afternoon.goal_steps),
      goal_distance: Number(defaultSessions.afternoon.goal_distance),
      goal_calories: Number(defaultSessions.afternoon.goal_calories)
    })
    
    setDailySchedule(newSchedule)
    onGoalsChange(validateAndFixScheduleData(newSchedule))
  }

  const removeSession = (dayIndex: number, sessionIndex: number) => {
    const newSchedule = [...dailySchedule]
    
    // Không cho phép xóa nếu chỉ còn 1 buổi tập
    if (newSchedule[dayIndex].details.length <= 1) {
      return
    }
    
    newSchedule[dayIndex].details.splice(sessionIndex, 1)
    setDailySchedule(newSchedule)
    onGoalsChange(validateAndFixScheduleData(newSchedule))
  }

  const updateSession = (dayIndex: number, sessionIndex: number, field: keyof TrainingSession, value: any) => {
    const newSchedule = [...dailySchedule]
    const session = newSchedule[dayIndex].details[sessionIndex]
    
    if (field === 'start_time' || field === 'end_time') {
      // Xử lý cập nhật thời gian
      const date = newSchedule[dayIndex].day
      const [hours, minutes] = value.split(':')
      const timeString = `${date}T${hours}:${minutes}:00.000Z`
      session[field] = timeString
    } else if (field === 'goal_steps' || field === 'goal_calories') {
      // Đảm bảo các giá trị số nguyên được lưu dưới dạng số, không phải chuỗi
      session[field] = parseInt(value) || 0
    } else if (field === 'goal_distance') {
      // Đảm bảo giá trị số thực được lưu dưới dạng số, không phải chuỗi
      session[field] = parseFloat(value) || 0
    } else {
      // Xử lý các trường khác
      session[field] = value
    }
    
    setDailySchedule(newSchedule)
    onGoalsChange(validateAndFixScheduleData(newSchedule))
  }

  // Hàm trích xuất giờ:phút từ chuỗi ISO
  const extractTime = (isoString: string) => {
    const date = new Date(isoString)
    return `${date.getUTCHours().toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')}`
  }

  if (Object.keys(selectedDates).length === 0) {
    return null
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Daily Goals</Text>
      <Text style={styles.sectionDescription}>Set specific goals for each day in your workout schedule</Text>

      <ScrollView
        style={styles.daysContainer}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 8 }}
      >
        {dailySchedule.map((day, dayIndex) => (
          <View key={day.day} style={styles.dayCard}>
            <TouchableOpacity 
              style={styles.dayHeader} 
              onPress={() => toggleDay(day.day)} 
              activeOpacity={0.7}
            >
              <View style={styles.dayHeaderLeft}>
                <View style={styles.dateCircle}>
                  <Text style={styles.dateNumber}>{new Date(day.day).getDate()}</Text>
                </View>
                <View>
                  <Text style={styles.dateText}>{formatDate(day.day)}</Text>
                  <Text style={styles.sessionCount}>
                    {day.details.length} {day.details.length === 1 ? "Session" : "Session"}
                  </Text>
                </View>
              </View>
              <Icon name={expandedDay === day.day ? "chevron-up" : "chevron-down"} size={20} color="#64748B" />
            </TouchableOpacity>

            {expandedDay === day.day && (
              <View style={styles.dayGoals}>
                {day.details.map((session, sessionIndex) => (
                  <View key={sessionIndex} style={styles.sessionContainer}>
                    <View style={styles.sessionHeader}>
                      <Text style={styles.sessionTitle}>Session {sessionIndex + 1}</Text>
                      {day.details.length > 1 && (
                        <TouchableOpacity 
                          onPress={() => removeSession(dayIndex, sessionIndex)}
                          style={styles.removeButton}
                        >
                          <Icon name="trash-outline" size={16} color="#EF4444" />
                          <Text style={styles.removeButtonText}>Delete</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    
                    {/* Mô tả buổi tập */}
                    <View style={styles.inputRow}>
                      <Text style={styles.inputLabel}>Describe:</Text>
                      <TextInput
                        style={styles.textInput}
                        value={session.description}
                        onChangeText={(value) => updateSession(dayIndex, sessionIndex, 'description', value)}
                        placeholder="Describe your session"
                      />
                    </View>
                    
                    {/* Thời gian bắt đầu và kết thúc */}
                    <View style={styles.timeRow}>
                      <View style={styles.timeInputContainer}>
                        <Text style={styles.timeLabel}>Start:</Text>
                        <TextInput
                          style={styles.timeInput}
                          value={extractTime(session.start_time)}
                          onChangeText={(value) => updateSession(dayIndex, sessionIndex, 'start_time', value)}
                          placeholder="HH:MM"
                        />
                      </View>
                      <View style={styles.timeInputContainer}>
                        <Text style={styles.timeLabel}>End:</Text>
                        <TextInput
                          style={styles.timeInput}
                          value={extractTime(session.end_time)}
                          onChangeText={(value) => updateSession(dayIndex, sessionIndex, 'end_time', value)}
                          placeholder="HH:MM"
                        />
                      </View>
                    </View>
                    
                    {/* Mục tiêu */}
                    <Text style={styles.goalsTitle}>Training objectives</Text>
                    
                    <View style={styles.goalRow}>
                      <View style={styles.goalIconContainer}>
                        <Icon name="walk" size={16} color="#0F2B5B" />
                      </View>
                      <Text style={styles.goalLabel}>Distance</Text>
                      <View style={styles.goalInputWrapper}>
                        <TextInput
                          style={styles.goalInput}
                          value={session.goal_distance.toString()}
                          onChangeText={(value) => updateSession(dayIndex, sessionIndex, 'goal_distance', parseFloat(value) || 0)}
                          keyboardType="numeric"
                        />
                        <Text style={styles.goalUnit}>km</Text>
                      </View>
                    </View>

                    <View style={styles.goalRow}>
                      <View style={styles.goalIconContainer}>
                        <Icon name="flame" size={16} color="#0F2B5B" />
                      </View>
                      <Text style={styles.goalLabel}>Calo</Text>
                      <View style={styles.goalInputWrapper}>
                        <TextInput
                          style={styles.goalInput}
                          value={session.goal_calories.toString()}
                          onChangeText={(value) => updateSession(dayIndex, sessionIndex, 'goal_calories', parseInt(value) || 0)}
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
                          value={session.goal_steps.toString()}
                          onChangeText={(value) => updateSession(dayIndex, sessionIndex, 'goal_steps', parseInt(value) || 0)}
                          keyboardType="numeric"
                        />
                        <Text style={styles.goalUnit}>Step</Text>
                      </View>
                    </View>
                    
                    <View style={styles.divider} />
                  </View>
                ))}
                
                {/* Nút thêm buổi tập */}
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => addSession(dayIndex)}
                >
                  <Icon name="add-circle-outline" size={16} color="#0F2B5B" />
                  <Text style={styles.addButtonText}>Add more session</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
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
    fontWeight: "600",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 16,
  },
  daysContainer: {
    maxHeight: 500,
    flexGrow: 0,
  },
  dayCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0F2B5B",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  dateNumber: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  dateText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#0F172A",
  },
  sessionCount: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  dayGoals: {
    padding: 12,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  sessionContainer: {
    marginBottom: 8,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 12,
  },
  sessionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  removeButtonText: {
    fontSize: 12,
    color: "#EF4444",
    marginLeft: 4,
  },
  inputRow: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  timeInputContainer: {
    flex: 1,
    marginRight: 8,
  },
  timeLabel: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
  },
  timeInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  goalsTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0F172A",
    marginBottom: 12,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 16,
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  goalIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
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
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E0E7FF",
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0F2B5B",
    marginLeft: 8,
  },
})

export default DailyGoalsSection