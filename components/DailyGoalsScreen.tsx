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
  Alert,
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
  view?: boolean;
  onErrorStateChange?: (hasError: boolean) => void;
}

const DailyGoalsSection: React.FC<DailyGoalsSectionProps> = ({
  selectedDates,
  onGoalsChange,
  onErrorStateChange,
  initialSchedules = [],
  view = false,
}) => {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [dailySchedule, setDailySchedule] = useState<DailySchedule[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, Record<string, string>>
  >({});
  const [timeInputs, setTimeInputs] = useState<Record<string, { start: string; end: string }>>({});

  const hasAnyValidationError = () => {
    for (const sessionKey in validationErrors) {
      if (!validationErrors.hasOwnProperty(sessionKey)) continue;
      const sessionErrors = validationErrors[sessionKey];
      for (const field in sessionErrors) {
        if (sessionErrors[field]) return true;
      }
    }
    return false;
  };

  useEffect(() => {
    if (onErrorStateChange) {
      onErrorStateChange(hasAnyValidationError());
    }
  }, [validationErrors]);

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

  const getSessionIntervalErrorIndexes = (sessions: TrainingSession[]) => {
    const errorIndexes: number[] = [];
    for (let i = 0; i < sessions.length - 1; i++) {
      const prevEnd = new Date(sessions[i].end_time).getTime();
      const nextStart = new Date(sessions[i + 1].start_time).getTime();
      if (nextStart >= prevEnd && nextStart - prevEnd < 30 * 60 * 1000) {
        errorIndexes.push(i + 1);
      }
    }
    return errorIndexes;
  };

  useEffect(() => {
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach(key => {
        if (newErrors[key]?.session_interval) {
          delete newErrors[key].session_interval;
          if (Object.keys(newErrors[key]).length === 0) {
            delete newErrors[key];
          }
        }
      });
      return newErrors;
    });

    dailySchedule.forEach((day, dayIndex) => {
      const errorIndexes = getSessionIntervalErrorIndexes(day.details);
      errorIndexes.forEach(idx => {
        const sessionKey = `${dayIndex}-${idx}`;
        setValidationErrors(prev => ({
          ...prev,
          [sessionKey]: {
            ...prev[sessionKey],
            session_interval: `Each session must be at least 30 minutes apart (between session ${idx} and ${idx + 1})`,
          },
        }));
      });
    });
  }, [dailySchedule]);

  const getSessionOverlapError = (newStart: string, newEnd: string, existingSessions: TrainingSession[], day: string) => {
    try {
      const newStartDate = new Date(newStart).getTime();
      const newEndDate = new Date(newEnd).getTime();
      const dayDate = new Date(day).setUTCHours(0, 0, 0, 0);

      for (const session of existingSessions) {
        const existingStart = new Date(session.start_time).getTime();
        const existingEnd = new Date(session.end_time).getTime();
        const existingDay = new Date(session.start_time).setUTCHours(0, 0, 0, 0);

        if (existingDay === dayDate) {
          const gapBeforeStart = newStartDate - existingEnd;
          const gapAfterEnd = existingStart - newEndDate;

          if (gapBeforeStart > 0 && gapBeforeStart < 30 * 60 * 1000) {
            return `Start time must be at least 30 minutes after the end of the previous session (ends at ${extractTime(session.end_time)})`;
          }
          if (gapAfterEnd > 0 && gapAfterEnd < 30 * 60 * 1000) {
            return `End time must be at least 30 minutes before the start of the next session (starts at ${extractTime(session.start_time)})`;
          }
          if (newStartDate < existingEnd && newEndDate > existingStart) {
            return `Session overlaps with existing session from ${extractTime(session.start_time)} to ${extractTime(session.end_time)}.`;
          }
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  const getSessionTimeGapError = (start: string, end: string) => {
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const diffMs = endDate.getTime() - startDate.getTime();
      const diffMin = diffMs / (60 * 1000);
      if (diffMin < 5) return 'The session must be at least 5 minutes long.';
      if (diffMin > 240) return 'The session must not be more than 4 hours long.';
      return null;
    } catch {
      return null;
    }
  };

  const getDistanceError = (value: number | null) => {
    if (value == null) return null;
    if (value < 1.0) return 'Distance must be at least 1.0 km from 25km';
    if (value > 25) return 'Distance must be at least 1.0 km from 25km';
    return null;
  };

  const getCaloriesError = (value: number | null) => {
    if (value == null) return null;
    if (value < 10) return 'Calories should be at least 10 and maximum 2000';
    if (value > 2000) return 'Calories should be at least 10 and maximum 2000';
    return null;
  };

  const getStepsError = (value: number | null) => {
    if (value == null) return null;
    if (value < 1500) return 'Steps must be at least 1500 and maximum 35000';
    if (value > 35000) return 'Steps must be at least 1500 maximum 35000';
    return null;
  };

  const validateAndFixScheduleData = (
    scheduleData: DailySchedule[],
  ): DailySchedule[] => {
    return scheduleData.map(day => ({
      day: day.day,
      details: day.details.map(session => ({
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
      })),
    }));
  };

  useEffect(() => {
    const newSchedule: DailySchedule[] = [];
    const initialData = initialSchedules || [];

    Object.keys(selectedDates)
      .sort()
      .forEach(date => {
        const initialDay = initialData.find(item => item.day === date);

        if (initialDay) {
          newSchedule.push(initialDay);
        } else {
          const existingDay = dailySchedule.find(item => item.day === date);

          if (existingDay) {
            newSchedule.push(existingDay);
          } else {
            const now = new Date();
            const currentHour = now.getHours();

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

    const filteredSchedule = newSchedule.filter(day =>
      Object.keys(selectedDates).includes(day.day),
    );

    const validatedSchedule = validateAndFixScheduleData(filteredSchedule);

    setDailySchedule(validatedSchedule);
    onGoalsChange(validatedSchedule);
  }, [selectedDates, initialSchedules]);

  useEffect(() => {
    if (initialSchedules.length > 0) {
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
    if (session.status === 'MISSED' || session.status === 'COMPLETED' || session.status === 'INCOMING' || session.status === 'ONGOING') return false;

    try {
      const now = new Date();
      const vnNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
      const startDate = new Date(session.start_time);
      const timeDiff = startDate.getTime() - vnNow.getTime();

      if (timeDiff < 30 * 60 * 1000) {
        return true;
      }

      return true;
    } catch {
      return false;
    }
  };

  const canAddSession = (sessions: TrainingSession[]) => {
    if (!sessions || sessions.length === 0) return true;
    if (sessions.length >= 5) return false;
    return true;
  };

  const getTimeError = (inputTime: string, day: string) => {
    try {
      const now = new Date();
      const vnNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
      const [year, month, date] = day.split('-').map(Number);
      const [hours, minutes] = inputTime.split(':').map(Number);
      const inputVN = new Date(Date.UTC(year, month - 1, date, hours, minutes));
      inputVN.setHours(inputVN.getHours());

      const diffMs = inputVN.getTime() - vnNow.getTime();

      if (diffMs < 0) {
        return 'Do not enter past times in Vietnam time';
      }
      if (diffMs < 30 * 60 * 1000) {
        return 'You must create a run at least 30 minutes before the start time (Vietnam time)';
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

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const isToday = date === todayStr;
    const currentHour = isToday ? now.getHours() : 6;

    let sessionTemplate = defaultSessions.morning;
    if (currentHour >= 17) {
      sessionTemplate = defaultSessions.evening;
    } else if (currentHour >= 12) {
      sessionTemplate = defaultSessions.afternoon;
    }

    const startHour = (currentHour + 1) % 24;
    const endHour = (currentHour + 2) % 24;
    const start_time = `${date}T${startHour.toString().padStart(2, '0')}:00:00.000Z`;
    const end_time = `${date}T${endHour.toString().padStart(2, '0')}:00:00.000Z`;

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

    if (newSchedule[dayIndex].details.length <= 1) {
      return;
    }

    newSchedule[dayIndex].details.splice(sessionIndex, 1);

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

    if (newValidationErrors[sessionKey][field]) {
      delete newValidationErrors[sessionKey][field];
    }

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
    } else {
      delete newValidationErrors[sessionKey][field];
      if (Object.keys(newValidationErrors[sessionKey]).length === 0) {
        delete newValidationErrors[sessionKey];
      }
    }

    setValidationErrors(newValidationErrors);
  };

  const formatTimeInput = (value: string): string => {
    const numbers = value.replace(/[^\d]/g, '');
    if (!numbers) return '';
    if (numbers.length <= 2) return numbers;
    const hours = numbers.substring(0, 2);
    const minutes = numbers.substring(2, 4);
    return `${hours}:${minutes}`;
  };

  const updateSession = (
    dayIndex: number,
    sessionIndex: number,
    field: keyof TrainingSession,
    value: Date | string,
  ) => {
    const newSchedule = [...dailySchedule];
    const session = newSchedule[dayIndex].details[sessionIndex];
    const sessionKey = `${dayIndex}-${sessionIndex}`;
    const existingSessions = [...newSchedule[dayIndex].details].filter((_, idx) => idx !== sessionIndex);
    const day = newSchedule[dayIndex].day;

    if (field === 'start_time' || field === 'end_time') {
      const formattedValue = formatTimeInput(value as string);
      if (formattedValue === '' || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formattedValue)) {
        if (formattedValue !== '') {
          const [hours, minutes] = formattedValue.split(':').map(Number);
          const timeString = `${day}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00.000Z`;
          session[field] = timeString;

          const start = field === 'start_time' ? timeString : session.start_time;
          const end = field === 'end_time' ? timeString : session.end_time;

          const gapError = getSessionTimeGapError(start, end);
          const timeError = field === 'start_time' ? getTimeError(formattedValue, day) : null;
          const overlapError = getSessionOverlapError(start, end, existingSessions, day);

          setValidationErrors(prev => ({
            ...prev,
            [sessionKey]: {
              ...prev[sessionKey],
              time_gap: gapError ?? '',
              ...(field === 'start_time' && { start_time: timeError ?? '' }),
              overlap_error: overlapError ?? '',
            },
          }));
        }
      }
    } else if (
      field === 'goal_steps' ||
      field === 'goal_calories' ||
      field === 'goal_minbpms' ||
      field === 'goal_maxbpms'
    ) {
      const newValue = Number.parseInt(value as string) || 0;
      if (newValue === 0) {
        session[field] = null;
      } else {
        session[field] = newValue;
      }

      if (field === 'goal_steps' || field === 'goal_calories') {
        validateField(dayIndex, sessionIndex, field, newValue);
      }
    } else if (field === 'goal_distance') {
      const newValue =
        (value as string) === null ? null : Math.min(Number.parseFloat(value as string), 9999.99);
      session[field] = isNaN(newValue) ? null : newValue;

      validateField(dayIndex, sessionIndex, field, newValue);
    } else {
      session[field] = value as string;
    }

    setDailySchedule(newSchedule);
    onGoalsChange(validateAndFixScheduleData(newSchedule));
  };

  const extractTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return '';
      return `${date.getUTCHours().toString().padStart(2, '0')}:${date
        .getUTCMinutes()
        .toString()
        .padStart(2, '0')}`;
    } catch (error) {
      return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '#22C55E';
      case 'INCOMING':
        return '#3B82F6';
      case 'ONGOING':
        return '#64748B';
      case 'MISSED':
        return '#CB0404';
      default:
        return '#64748B';
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
              activeOpacity={0.7}>
              <View style={styles.dayHeaderLeft}>
                <View style={styles.dateCircle}>
                  <Text style={styles.dateNumber}>{new Date(day.day).getDate()}</Text>
                </View>
                <View>
                  <Text style={styles.dateText}>{formatDate(day.day)}</Text>
                  <Text style={styles.sessionCount}>
                    {day.details.length} {day.details.length === 1 ? 'Session' : 'Sessions'}
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

                  const startTimeInput = timeInputs[sessionKey]?.start ?? extractTime(session.start_time);
                  const endTimeInput = timeInputs[sessionKey]?.end ?? extractTime(session.end_time);

                  return (
                    <View key={sessionIndex} style={styles.sessionContainer}>
                      <View style={styles.sessionHeader}>
                        <Text style={styles.sessionTitle}>Session {sessionIndex + 1}</Text>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          {session.status && (
                            <View
                              style={[
                                styles.statusBadge,
                                { backgroundColor: getStatusColor(session?.status) },
                              ]}>
                              <Text style={styles.statusText}>{session.status}</Text>
                            </View>
                          )}
                          {day.details.length > 1 && canEditSession(session, view) && (
                            <TouchableOpacity
                              onPress={() => removeSession(dayIndex, sessionIndex)}
                              style={styles.removeButton}>
                              <Icon name="trash-outline" size={16} color="#EF4444" />
                              <Text style={styles.removeButtonText}>Delete</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>

                      <View style={styles.inputRow}>
                        <Text style={styles.inputLabel}>Describe:</Text>
                        <TextInput
                          style={styles.textInput}
                          value={session.description}
                          onChangeText={value => updateSession(dayIndex, sessionIndex, 'description', value)}
                          editable={canEditSession(session, view)}
                          placeholder="Describe your session"
                        />
                      </View>

                      <View style={styles.timeRow}>
                        <View style={styles.timeInputContainer}>
                          <Text style={styles.timeLabel}>Start:</Text>
                          <TextInput
                            style={[
                              styles.timeInput,
                              sessionErrors.start_time ? styles.inputError : null,
                            ]}
                            value={startTimeInput}
                            onChangeText={text => {
                              const formatted = formatTimeInput(text);
                              setTimeInputs(prev => ({
                                ...prev,
                                [sessionKey]: { ...prev[sessionKey], start: formatted },
                              }));
                              if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formatted)) {
                                updateSession(dayIndex, sessionIndex, 'start_time', formatted);
                              }
                            }}
                            placeholder="HH:MM"
                            keyboardType="numbers-and-punctuation"
                            maxLength={5}
                            editable={canEditSession(session, view)}
                          />
                          {sessionErrors.start_time && (
                            <Text style={styles.errorTime}>{sessionErrors.start_time}</Text>
                          )}
                        </View>
                        <View style={styles.timeInputContainer}>
                          <Text style={styles.timeLabel}>End:</Text>
                          <TextInput
                            style={[
                              styles.timeInput,
                              sessionErrors.end_time ? styles.inputError : null,
                            ]}
                            value={endTimeInput}
                            onChangeText={text => {
                              const formatted = formatTimeInput(text);
                              setTimeInputs(prev => ({
                                ...prev,
                                [sessionKey]: { ...prev[sessionKey], end: formatted },
                              }));
                              if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formatted)) {
                                updateSession(dayIndex, sessionIndex, 'end_time', formatted);
                              }
                            }}
                            placeholder="HH:MM"
                            keyboardType="numbers-and-punctuation"
                            maxLength={5}
                            editable={canEditSession(session, view)}
                          />
                          {sessionErrors.end_time && (
                            <Text style={styles.errorTime}>{sessionErrors.end_time}</Text>
                          )}
                        </View>
                      </View>
                      {sessionErrors.time_gap && (
                        <Text style={styles.errorTime}>{sessionErrors.time_gap}</Text>
                      )}
                      {sessionErrors.overlap_error && (
                        <Text style={styles.errorTime}>{sessionErrors.overlap_error}</Text>
                      )}
                      {sessionErrors.session_interval && (
                        <Text style={styles.errorTime}>{sessionErrors.session_interval}</Text>
                      )}
                      <Text style={styles.goalsTitle}>Training objectives</Text>

                      <View style={styles.goalRow}>
                        <View style={styles.goalIconContainer}>
                          <Icon name="walk" size={16} color="#0F2B5B" />
                        </View>
                        <Text style={styles.goalLabel}>Distance</Text>
                        <View
                          style={[
                            styles.goalInputWrapper,
                            sessionErrors.goal_distance ? styles.inputError : null,
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
                              if (/^\d*\.?\d*$/.test(value)) {
                                updateSession(dayIndex, sessionIndex, 'goal_distance', value);
                              }
                            }}
                            onBlur={() => {
                              validateField(dayIndex, sessionIndex, 'goal_distance', session.goal_distance);
                            }}
                            editable={canEditSession(session, view)}
                            keyboardType="decimal-pad"
                            placeholder="0.00"
                            maxLength={5}
                          />
                          <Text style={styles.goalUnit}>km</Text>
                          {sessionErrors.goal_distance && (
                            <View style={styles.errorIcon}>
                              <Icon name="alert-circle" size={16} color="#EF4444" />
                            </View>
                          )}
                        </View>
                      </View>
                      {sessionErrors.goal_distance && (
                        <Text style={styles.errorText}>{sessionErrors.goal_distance}</Text>
                      )}

                      <View style={styles.goalRow}>
                        <View style={styles.goalIconContainer}>
                          <Icon name="flame" size={16} color="#0F2B5B" />
                        </View>
                        <Text style={styles.goalLabel}>Calo</Text>
                        <View
                          style={[
                            styles.goalInputWrapper,
                            sessionErrors.goal_calories ? styles.inputError : null,
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
                              validateField(dayIndex, sessionIndex, 'goal_calories', session.goal_calories);
                            }}
                            keyboardType="numeric"
                            editable={canEditSession(session, view)}
                            maxLength={5}
                          />
                          <Text style={styles.goalUnit}>kcal</Text>
                          {sessionErrors.goal_calories && (
                            <View style={styles.errorIcon}>
                              <Icon name="alert-circle" size={16} color="#EF4444" />
                            </View>
                          )}
                        </View>
                      </View>
                      {sessionErrors.goal_calories && (
                        <Text style={styles.errorText}>{sessionErrors.goal_calories}</Text>
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
                              validateField(dayIndex, sessionIndex, 'goal_steps', session.goal_steps);
                            }}
                            editable={canEditSession(session, view)}
                            keyboardType="numeric"
                            maxLength={5}
                          />
                          <Text style={styles.goalUnit}>Step</Text>
                          {sessionErrors.goal_steps && (
                            <View style={styles.errorIcon}>
                              <Icon name="alert-circle" size={16} color="#EF4444" />
                            </View>
                          )}
                        </View>
                      </View>
                      {sessionErrors.goal_steps && (
                        <Text style={styles.errorText}>{sessionErrors.goal_steps}</Text>
                      )}

                      {!view && canAddSession(day.details) && (
                        <>
                          <View style={styles.divider} />
                          <TouchableOpacity
                            style={[
                              styles.addButton,
                              !canAddSession(day.details) && styles.disabledButton,
                            ]}
                            onPress={() => addSession(dayIndex)}
                            disabled={!canAddSession(day.details)}
                          >
                            <Icon
                              name="add-circle-outline"
                              size={16}
                              color={!canAddSession(day.details) ? '#94A3B8' : '#0F2B5B'}
                            />
                            <Text
                              style={[
                                styles.addButtonText,
                                !canAddSession(day.details) && styles.disabledButtonText,
                              ]}
                            >
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
    justifyContent: 'center',
    alignItems: 'center',
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