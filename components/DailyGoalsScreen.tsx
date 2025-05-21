'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { format } from 'date-fns';
import { US } from 'date-fns/locale';
interface TrainingSession {
  description: string;
  start_time: string;
  end_time: string;
  goal_steps: number | null;
  goal_distance: number | null;
  goal_calories: number | null;
  goal_minbpms: number | null;
  goal_maxbpms: number | null;
  status: string | null;
}

interface DailySchedule {
  day: string;
  details: TrainingSession[];
}

interface DailyGoalsSectionProps {
  selectedDates: Record<string, any>;
  onGoalsChange: (schedule: DailySchedule[]) => void;
  initialSchedules?: DailySchedule[];
  view?: boolean
}

const DailyGoalsSection: React.FC<DailyGoalsSectionProps> = ({
  selectedDates,
  onGoalsChange,
  initialSchedules = [],
  view = false
}) => {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [dailySchedule, setDailySchedule] = useState<DailySchedule[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, Record<string, string>>
  >({});
  // Thời gian mặc định cho các buổi tập
  const defaultSessions = {
    morning: {
      description: 'Morning',
      start_time: '06:00',
      end_time: '08:00',
      goal_steps: 5000,
      goal_distance: 5,
      goal_calories: 300,
      goal_minbpms: 100,
      goal_maxbpms: 130,
    },
    afternoon: {
      description: 'afternoon',
      start_time: '15:00',
      end_time: '17:00',
      goal_steps: 8000,
      goal_distance: 8,
      goal_calories: 500,
      goal_minbpms: 110,
      goal_maxbpms: 135,
    },
    evening: {
      description: 'evening',
      start_time: '18:00',
      end_time: '20:00',
      goal_steps: 6000,
      goal_distance: 6,
      goal_calories: 400,
      goal_minbpms: 100,
      goal_maxbpms: 120,
    },
  };

  // Hàm kiểm tra và sửa lỗi dữ liệu trước khi gửi đi
  const getDistanceError = (value: number | null) => {
    if (value == null) return null; // Không lỗi nếu không có mục tiêu
    if (value < 1.0) return 'Khoảng cách phải ít nhất 1.0 km từ 25km';
    if (value > 25) return 'Khoảng cách phải ít nhất 1.0 km từ 25km';
    return null;
  };

  const getCaloriesError = (value: number | null) => {
    if (value == null) return null;
    if (value < 10) return 'Calo phải ít nhất 10 và tối đa 2000';
    if (value > 2000) return 'Calo phải ít nhất 10 và tối đa 2000';
    return null;
  };

  const getStepsError = (value: number | null) => {
    if (value == null) return null;
    if (value < 1500) return 'Bước chân phải ít nhất 1500 và tối đa 35000';
    if (value > 35000) return 'Bước chân phải ít nhất 1500 tối đa 35000';
    return null;
  };

  const validateAndFixScheduleData = (
    scheduleData: DailySchedule[],
  ): DailySchedule[] => {
    return scheduleData.map(day => {
      return {
        day: day.day,
        details: day.details.map(session => {
          return {
            description: session.description || 'Session',
            status: session.status,
            start_time: session.start_time,
            end_time: session.end_time,
            goal_steps:
              typeof session.goal_steps === 'string'
                ? Number.parseInt(session.goal_steps)
                : session.goal_steps,
            goal_distance:
              typeof session.goal_distance === 'string'
                ? Math.min(Number.parseFloat(session.goal_distance), 9999.99)
                : session.goal_distance !== null
                  ? Math.min(session.goal_distance, 9999.99)
                  : null,

            goal_calories:
              typeof session.goal_calories === 'string'
                ? Number.parseInt(session.goal_calories)
                : session.goal_calories,
            goal_minbpms:
              typeof session.goal_minbpms === 'string'
                ? Number.parseInt(session.goal_minbpms)
                : session.goal_minbpms,
            goal_maxbpms:
              typeof session.goal_maxbpms === 'string'
                ? Number.parseInt(session.goal_maxbpms)
                : session.goal_maxbpms,
          };
        }),
      };
    });
  };

  // Khởi tạo lịch cho các ngày được chọn
  useEffect(() => {
    const newSchedule: DailySchedule[] = [];
    const initialData = initialSchedules || [];

    Object.keys(selectedDates)
      .sort()
      .forEach(date => {
        // Kiểm tra xem ngày đã có trong lịch chưa
        const initialDay = initialData.find(item => item.day === date);

        if (initialDay) {
          // Nếu có dữ liệu ban đầu, sử dụng nó
          newSchedule.push(initialDay);
        } else {
          const existingDay = dailySchedule.find(item => item.day === date);

          if (existingDay) {
            newSchedule.push(existingDay);
          } else {
            // Thêm ngày mới với buổi sáng mặc định
            const now = new Date();
            const currentHour = now.getHours();
            const currentMiniute = now.getMinutes();

            let sessionTemplate = defaultSessions.morning;
            if (currentHour >= 17) {
              sessionTemplate = defaultSessions.evening;
            } else if (currentHour >= 12) {
              sessionTemplate = defaultSessions.afternoon;
            }

            newSchedule.push({
              day: date,
              details: [
                {
                  ...sessionTemplate,
                  start_time: `${date}T${sessionTemplate.start_time}:00.000Z`,
                  end_time: `${date}T${sessionTemplate.end_time}:00.000Z`,
                },
              ],
            });
          }
        }
      });

    // Loại bỏ các ngày không còn được chọn
    const filteredSchedule = newSchedule.filter(day =>
      Object.keys(selectedDates).includes(day.day),
    );

    // Kiểm tra và sửa lỗi dữ liệu
    const validatedSchedule = validateAndFixScheduleData(filteredSchedule);

    setDailySchedule(validatedSchedule);
    onGoalsChange(validatedSchedule);
  }, [selectedDates, initialSchedules !== undefined]);

  useEffect(() => {
    if (initialSchedules.length > 0) {
      // Validate dữ liệu ban đầu
      const validated = validateAndFixScheduleData(initialSchedules);
      setDailySchedule(validated);
      onGoalsChange(validated);
    }
  }, [initialSchedules]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'EEE, dd/MM', { locale: US });
  };

  const canEditSession = (session: TrainingSession, view: boolean | null) => {
    if (view) return false;
    if (session.status === 'MISSED' || session.status === 'COMPLETED') return false;
    return true; // Cho phép input mọi thời gian, kể cả quá khứ
  };
  const getTimeError = (inputTime: string, day: string) => {
    try {
      // Lấy giờ hiện tại ở Việt Nam
      const now = new Date();
      const vnNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);

      // Parse ngày và giờ input thành giờ Việt Nam
      const [year, month, date] = day.split('-').map(Number);
      const [hours, minutes] = inputTime.split(':').map(Number);
      const inputVN = new Date(Date.UTC(year, month - 1, date, hours, minutes));
      inputVN.setHours(inputVN.getHours()); // Chuyển sang GMT+7

      const diffMs = inputVN.getTime() - vnNow.getTime();

      if (diffMs < 0) {
        return 'Do not enter past times in Vietnam time';
      }
      if (diffMs < 3 * 60 * 60 * 1000) {
        // Nếu thời gian chạy chỉ còn dưới 3 tiếng thì báo lỗi
        return 'You must create a run at least 3 hours before the start time (Vietnam time)';
      }
      return null;
    } catch {
      return 'Invalid time';
    }
  };
  const toggleDay = (date: string) => {
    setExpandedDay(expandedDay === date ? null : date);
  };

  const addSession = (dayIndex: number) => {
    const newSchedule = [...dailySchedule];
    const day = newSchedule[dayIndex];
    const date = day.day;

    // Lấy giờ hiện tại
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const isToday = date === todayStr;
    const currentHour = isToday ? now.getHours() : 6; // Nếu là hôm nay thì lấy giờ hiện tại, nếu không thì mặc định 6h

    // Chọn template phù hợp
    let sessionTemplate = defaultSessions.morning;
    if (currentHour >= 17) {
      sessionTemplate = defaultSessions.evening;
    } else if (currentHour >= 12) {
      sessionTemplate = defaultSessions.afternoon;
    }

    // Set start_time và end_time cho session mới (giờ hiện tại +1, +2)
    const startHour = (currentHour + 1) % 24;
    const endHour = (currentHour + 2) % 24;
    const start_time = `${date}T${startHour.toString().padStart(2, '0')}:00:00.000Z`;
    const end_time = `${date}T${endHour.toString().padStart(2, '0')}:00:00.000Z`;

    // Không cho phép thêm nếu có session MISSED/COMPLETED
    if (day.details.some(s => s.status === 'MISSED' || s.status === 'COMPLETED')) {
      return;
    }

    day.details.push({
      ...sessionTemplate,
      start_time,
      end_time,
      status: null,
    });

    setDailySchedule(newSchedule);
    onGoalsChange(validateAndFixScheduleData(newSchedule));
  };
  const removeSession = (dayIndex: number, sessionIndex: number) => {
    const newSchedule = [...dailySchedule];

    // Không cho phép xóa nếu chỉ còn 1 buổi tập
    if (newSchedule[dayIndex].details.length <= 1) {
      return;
    }

    newSchedule[dayIndex].details.splice(sessionIndex, 1);

    // Xóa thông báo lỗi cho buổi tập đã xóa
    const newValidationErrors = { ...validationErrors };
    const sessionKey = `${dayIndex}-${sessionIndex}`;
    if (newValidationErrors[sessionKey]) {
      delete newValidationErrors[sessionKey];
    }
    setValidationErrors(newValidationErrors);

    setDailySchedule(newSchedule);
    onGoalsChange(validateAndFixScheduleData(newSchedule));
  };

  const validateField = (
    dayIndex: number,
    sessionIndex: number,
    field: keyof TrainingSession,
    value: any,
  ) => {
    const sessionKey = `${dayIndex}-${sessionIndex}`;
    const newValidationErrors = { ...validationErrors };

    if (!newValidationErrors[sessionKey]) {
      newValidationErrors[sessionKey] = {};
    }

    // Xóa lỗi cũ nếu có
    if (newValidationErrors[sessionKey][field]) {
      delete newValidationErrors[sessionKey][field];
    }

    // Kiểm tra các điều kiện
    let error = null;
    if (field === 'goal_distance') {
      error = getDistanceError(value);
    } else if (field === 'goal_calories') {
      error = getCaloriesError(value);
    } else if (field === 'goal_steps') {
      error = getStepsError(value);
    }

    if (error) {
      newValidationErrors[sessionKey][field] = error;
    } else if (Object.keys(newValidationErrors[sessionKey]).length === 0) {
      delete newValidationErrors[sessionKey];
    }

    setValidationErrors(newValidationErrors);
  };

  const updateSession = (
    dayIndex: number,
    sessionIndex: number,
    field: keyof TrainingSession,
    value: any,
  ) => {
    const newSchedule = [...dailySchedule];
    const session = newSchedule[dayIndex].details[sessionIndex];

    if (field === 'start_time' || field === 'end_time') {
      // Xử lý cập nhật thời gian
      const [hours = '00', minutes = '00'] = value.split(':');
      const cleanHours = Math.min(23, Math.max(0, parseInt(hours) || 0));
      const cleanMinutes = Math.min(59, Math.max(0, parseInt(minutes) || 0));

      const timeString = `${newSchedule[dayIndex].day}T${cleanHours
        .toString()
        .padStart(2, '0')}:${cleanMinutes.toString().padStart(2, '0')}:00.000Z`;

      session[field] = timeString;
    } else if (
      field === 'goal_steps' ||
      field === 'goal_calories' ||
      field === 'goal_minbpms' ||
      field === 'goal_maxbpms'
    ) {
      // Đảm bảo các giá trị số nguyên được lưu dưới dạng số, không phải chuỗi
      const newValue = Number.parseInt(value) || 0;
      if (newValue === 0) {
        session[field] = null;
      } else {
        session[field] = newValue;
      }

      // Validate immediately after updating
      if (field === 'goal_steps' || field === 'goal_calories') {
        validateField(dayIndex, sessionIndex, field, newValue);
      }
    } else if (field === 'goal_distance') {
      const newValue =
        value === null ? null : Math.min(Number.parseFloat(value), 9999.99);
      session[field] = isNaN(newValue) ? null : newValue;

      // Validate immediately after updating
      validateField(dayIndex, sessionIndex, field, newValue);
    } else {
      // Xử lý các trường khác
      session[field] = value;
    }

    setDailySchedule(newSchedule);
    onGoalsChange(validateAndFixScheduleData(newSchedule));
  };

  // Hàm trích xuất giờ:phút từ chuỗi ISO
  const extractTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return '00:00'; // Xử lý trường hợp invalid date

      return `${date.getUTCHours().toString().padStart(2, '0')}:${date
        .getUTCMinutes()
        .toString()
        .padStart(2, '0')}`;
    } catch (error) {
      return '00:00'; // Trả về giá trị mặc định nếu có lỗi
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '#22C55E'; // Xanh lá
      case 'INCOMING':
        return '#3B82F6'; // Xanh dương
      case 'ONGOING':
        return '#64748B';
      case 'MISSED':
        return '#CB0404';
      default:
        return '#64748B'; // Xám
    }
  };
  if (Object.keys(selectedDates).length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Daily Goals</Text>
      <Text style={styles.sectionDescription}>
        Set specific goals for each day in your workout schedule
      </Text>

      <ScrollView
        style={styles.daysContainer}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 8 }}>
        {dailySchedule.map((day, dayIndex) => (
          <View key={day.day} style={styles.dayCard}>
            <TouchableOpacity
              style={styles.dayHeader}
              onPress={() => toggleDay(day.day)}
              activeOpacity={0.7}
            >
              <View style={styles.dayHeaderLeft}>
                <View style={styles.dateCircle}>
                  <Text style={styles.dateNumber}>
                    {new Date(day.day).getDate()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.dateText}>{formatDate(day.day)}</Text>
                  <Text style={styles.sessionCount}>
                    {day.details.length}{' '}
                    {day.details.length === 1 ? 'Session' : 'Sessions'}
                  </Text>
                </View>
              </View>
              <Icon
                name={expandedDay === day.day ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#64748B"
              />
            </TouchableOpacity>

            {expandedDay === day.day && (
              <View style={styles.dayGoals}>
                {day.details.map((session, sessionIndex) => {
                  const sessionKey = `${dayIndex}-${sessionIndex}`;
                  const sessionErrors = validationErrors[sessionKey] || {};
                  const hasMissedSession = day.details.some(
                    s => s.status === 'MISSED' || s.status === 'COMPLETED',
                  );

                  return (
                    <View key={sessionIndex} style={styles.sessionContainer}>
                      <View style={styles.sessionHeader}>
                        <Text style={styles.sessionTitle}>
                          Session {sessionIndex + 1}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          {session.status && (
                            <View
                              style={[
                                styles.statusBadge,
                                {
                                  backgroundColor: getStatusColor(
                                    session?.status,
                                  ),
                                },
                              ]}>
                              <Text style={styles.statusText}>
                                {session.status}
                              </Text>
                            </View>
                          )}
                          {day.details.length > 1 &&
                            canEditSession(session, view) && (
                              <TouchableOpacity
                                onPress={() =>
                                  removeSession(dayIndex, sessionIndex)
                                }
                                style={styles.removeButton}>
                                <Icon
                                  name="trash-outline"
                                  size={16}
                                  color="#EF4444"
                                />
                                <Text style={styles.removeButtonText}>
                                  Delete
                                </Text>
                              </TouchableOpacity>
                            )}
                        </View>
                      </View>

                      {/* Mô tả buổi tập */}
                      <View style={styles.inputRow}>
                        <Text style={styles.inputLabel}>Describe:</Text>
                        <TextInput
                          style={styles.textInput}
                          value={session.description}
                          onChangeText={value =>
                            updateSession(
                              dayIndex,
                              sessionIndex,
                              'description',
                              value,
                            )
                          }
                          editable={canEditSession(session, view)}
                          placeholder="Describe your session"
                        />
                      </View>

                      {/* Thời gian bắt đầu và kết thúc */}
                      <View style={styles.timeRow}>
                        <View style={styles.timeInputContainer}>
                          <Text style={styles.timeLabel}>Start:</Text>
                          <TextInput
                            style={[
                              styles.timeInput,
                              sessionErrors.start_time ? styles.inputError : null
                            ]}
                            value={extractTime(session.start_time)}
                            onChangeText={value => {
                              const cleanedValue = value.replace(/[^0-9:]/g, '');
                              updateSession(dayIndex, sessionIndex, 'start_time', cleanedValue);

                              // Kiểm tra lỗi thời gian
                              const error = getTimeError(cleanedValue, day.day);
                              setValidationErrors(prev => ({
                                ...prev,
                                [`${dayIndex}-${sessionIndex}`]: {
                                  ...prev[`${dayIndex}-${sessionIndex}`],
                                  start_time: error?.toString() ?? '',
                                }
                              }));
                            }}
                            onBlur={() => {
                              const error = getTimeError(extractTime(session.start_time), day.day);
                              setValidationErrors(prev => ({
                                ...prev,
                                [`${dayIndex}-${sessionIndex}`]: {
                                  ...prev[`${dayIndex}-${sessionIndex}`],
                                  start_time: error ?? '',
                                }
                              }));
                            }}
                            placeholder="HH:MM"
                            editable={canEditSession(session, view)}
                            keyboardType="numbers-and-punctuation"
                            maxLength={5}
                          />
                          {sessionErrors.start_time && (
                            <Text style={styles.errorTime}>{sessionErrors.start_time}</Text>
                          )}
                        </View>
                        <View style={styles.timeInputContainer}>
                          <Text style={styles.timeLabel}>End:</Text>
                          <TextInput
                            style={styles.timeInput}
                            value={extractTime(session.end_time)}
                            onChangeText={value =>
                              updateSession(
                                dayIndex,
                                sessionIndex,
                                'end_time',
                                value,
                              )
                            }
                            editable={canEditSession(session, view)}
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
                        <View
                          style={[
                            styles.goalInputWrapper,
                            sessionErrors.goal_distance
                              ? styles.inputError
                              : null,
                          ]}>
                          <TextInput
                            style={styles.goalInput}
                            value={
                              typeof session.goal_distance === 'number'
                                ? session.goal_distance.toString()
                                : typeof session.goal_distance === 'string'
                                  ? session.goal_distance
                                  : ''
                            }
                            onChangeText={value => {
                              // Cho phép nhập dấu chấm và số
                              if (/^\d*\.?\d*$/.test(value)) {
                                updateSession(
                                  dayIndex,
                                  sessionIndex,
                                  'goal_distance',
                                  value,
                                );
                              }
                            }}
                            onBlur={() => {
                              validateField(
                                dayIndex,
                                sessionIndex,
                                'goal_distance',
                                session.goal_distance,
                              );
                            }}
                            editable={canEditSession(session, view)}
                            keyboardType="decimal-pad"
                            placeholder="0.00"
                            maxLength={5}
                          />
                          <Text style={styles.goalUnit}>km</Text>
                          {sessionErrors.goal_distance && (
                            <View style={styles.errorIcon}>
                              <Icon
                                name="alert-circle"
                                size={16}
                                color="#EF4444"
                              />
                            </View>
                          )}
                        </View>
                      </View>
                      {sessionErrors.goal_distance && (
                        <Text style={styles.errorText}>
                          {sessionErrors.goal_distance}
                        </Text>
                      )}

                      <View style={styles.goalRow}>
                        <View style={styles.goalIconContainer}>
                          <Icon name="flame" size={16} color="#0F2B5B" />
                        </View>
                        <Text style={styles.goalLabel}>Calo</Text>
                        <View
                          style={[
                            styles.goalInputWrapper,
                            sessionErrors.goal_calories
                              ? styles.inputError
                              : null,
                          ]}>
                          <TextInput
                            style={styles.goalInput}
                            value={session.goal_calories?.toString() || ''}
                            onChangeText={value => {
                              if (/^\d*$/.test(value)) {
                                updateSession(
                                  dayIndex,
                                  sessionIndex,
                                  'goal_calories',
                                  value === '' ? null : Number.parseInt(value),
                                );
                              }
                            }}
                            onBlur={() => {
                              validateField(
                                dayIndex,
                                sessionIndex,
                                'goal_calories',
                                session.goal_calories,
                              );
                            }}
                            keyboardType="numeric"
                            editable={canEditSession(session, view)}
                            maxLength={5}
                          />
                          <Text style={styles.goalUnit}>kcal</Text>
                          {sessionErrors.goal_calories && (
                            <View style={styles.errorIcon}>
                              <Icon
                                name="alert-circle"
                                size={16}
                                color="#EF4444"
                              />
                            </View>
                          )}
                        </View>
                      </View>
                      {sessionErrors.goal_calories && (
                        <Text style={styles.errorText}>
                          {sessionErrors.goal_calories}
                        </Text>
                      )}

                      <View style={styles.goalRow}>
                        <View style={styles.goalIconContainer}>
                          <Icon name="footsteps" size={16} color="#0F2B5B" />
                        </View>
                        <Text style={styles.goalLabel}>Steps</Text>
                        <View
                          style={[
                            styles.goalInputWrapper,
                            sessionErrors.goal_steps ? styles.inputError : null,
                          ]}>
                          <TextInput
                            style={styles.goalInput}
                            value={session.goal_steps?.toString() || ''}
                            onChangeText={value => {
                              if (/^\d*$/.test(value)) {
                                updateSession(
                                  dayIndex,
                                  sessionIndex,
                                  'goal_steps',
                                  value === '' ? null : Number.parseInt(value),
                                );
                              }
                            }}
                            onBlur={() => {
                              validateField(
                                dayIndex,
                                sessionIndex,
                                'goal_steps',
                                session.goal_steps,
                              );
                            }}
                            editable={canEditSession(session, view)}
                            keyboardType="numeric"
                            maxLength={5}
                          />
                          <Text style={styles.goalUnit}>Step</Text>
                          {sessionErrors.goal_steps && (
                            <View style={styles.errorIcon}>
                              <Icon
                                name="alert-circle"
                                size={16}
                                color="#EF4444"
                              />
                            </View>
                          )}
                        </View>
                      </View>
                      {sessionErrors.goal_steps && (
                        <Text style={styles.errorText}>
                          {sessionErrors.goal_steps}
                        </Text>
                      )}

                      {/* Heart Rate BPM Range */}
                      <View style={styles.goalRow}>
                        <View style={styles.goalIconContainer}>
                          <Icon name="heart" size={16} color="#0F2B5B" />
                        </View>
                        <Text style={styles.goalLabel}>Min Heart Rate</Text>
                        <View style={styles.goalInputWrapper}>
                          <TextInput
                            style={styles.goalInput}
                            value={session.goal_minbpms?.toString() || ''}
                            onChangeText={value => {
                              if (/^\d*$/.test(value)) {
                                updateSession(
                                  dayIndex,
                                  sessionIndex,
                                  'goal_minbpms',
                                  value === '' ? null : Number.parseInt(value),
                                );
                              }
                            }}
                            editable={canEditSession(session, view)}
                            keyboardType="numeric"
                            maxLength={3}
                          />
                          <Text style={styles.goalUnit}>bpm</Text>
                        </View>
                      </View>

                      <View style={styles.goalRow}>
                        <View style={styles.goalIconContainer}>
                          <Icon name="heart-half" size={16} color="#0F2B5B" />
                        </View>
                        <Text style={styles.goalLabel}>Max Heart Rate</Text>
                        <View style={styles.goalInputWrapper}>
                          <TextInput
                            style={styles.goalInput}
                            value={session.goal_maxbpms?.toString() || ''}
                            onChangeText={value => {
                              if (/^\d*$/.test(value)) {
                                updateSession(
                                  dayIndex,
                                  sessionIndex,
                                  'goal_maxbpms',
                                  value === '' ? null : Number.parseInt(value),
                                );
                              }
                            }}
                            editable={canEditSession(session, view)}
                            keyboardType="numeric"
                            maxLength={3}
                          />
                          <Text style={styles.goalUnit}>bpm</Text>
                        </View>
                      </View>

                      {!hasMissedSession && day.details.every(s => canEditSession(s, view)) && !view && (
                        <>
                          <View style={styles.divider} />
                          <TouchableOpacity
                            style={[
                              styles.addButton,
                              hasMissedSession && styles.disabledButton,
                            ]}
                            onPress={() => addSession(dayIndex)}
                            disabled={hasMissedSession}>
                            <Icon
                              name="add-circle-outline"
                              size={16}
                              color={hasMissedSession ? '#94A3B8' : '#0F2B5B'}
                            />
                            <Text
                              style={[
                                styles.addButtonText,
                                hasMissedSession && styles.disabledButtonText,
                              ]}>
                              Add more session
                            </Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  daysContainer: {
    maxHeight: 500,
    flexGrow: 0,
  },
  dayCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  dayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0F2B5B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dateNumber: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0F172A',
  },
  sessionCount: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  dayGoals: {
    padding: 12,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  sessionContainer: {
    marginBottom: 8,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  sessionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },

  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  removeButtonText: {
    fontSize: 12,
    color: '#EF4444',
    marginLeft: 4,
  },
  inputRow: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeInputContainer: {
    flex: 1,
    marginRight: 8,
  },
  timeLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  timeInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  goalsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 12,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  goalIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  goalLabel: {
    fontSize: 14,
    color: '#0F172A',
    flex: 1,
  },
  goalInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 100,
    minHeight: 32,
  },
  goalInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    padding: 0,
    textAlign: 'right',
    paddingRight: 4,
    includeFontPadding: false,
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
    backgroundColor: '#FEF2F2',
  },
  goalUnit: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
    width: 30,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0E7FF',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F2B5B',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 44,
    marginBottom: 8,
    fontWeight: '500',
  },
  errorTime: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginBottom: 8,
    fontWeight: '500',
  },
  errorIcon: {
    position: 'absolute',
    right: -8,
    top: -8,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  disabledButton: {
    backgroundColor: '#F1F5F9',
  },
  disabledButtonText: {
    color: '#94A3B8',
  },
  disabledInput: {
    backgroundColor: '#F1F5F9',
    color: '#64748B',
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFF',
  },
});

export default DailyGoalsSection;
