import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { Calendar } from 'react-native-calendars';
import DailyGoalsSection from '../../DailyGoalsScreen';
import BackButton from '../../BackButton';
import { useNavigation } from '@react-navigation/native';
import useScheduleStore from '../../utils/useScheduleStore';
import { ActivityIndicator } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import CommonDialog from '../../commons/CommonDialog';
import { useRoute } from '@react-navigation/native';
const AddScheduleScreen = () => {
  const MAX_DAYS_SELECTION = 14;
  const MAX_TITLE_LENGTH = 255;
  const MAX_DESCRIPTION_LENGTH = 1000;

  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    days: {},
  });
  const route = useRoute();
  const runner = route.params?.runner;

  const [selectedDates, setSelectedDates] = useState({});
  const [currentMonth, setCurrentMonth] = useState('');
  const [validDates, setValidDates] = useState<{ [key: string]: any }>({});
  const [isCreating, setIsCreating] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const { createSchedule, createExpertSchedule, isLoading, message, error, fetchSelfSchedules,fetchExpertSchedule } = useScheduleStore();
  const [hasGoalError, setHasGoalError] = useState(false);
  useEffect(() => {
    if (error) {
      setValidationError(error);
      setShowErrorDialog(true);
      useScheduleStore.getState().clear();
    }
  }, [error]);

  useEffect(() => {
    const today = new Date();
    const todayStr = formatDateString(today);
    setCurrentMonth(todayStr);

    const validDatesObj: { [key: string]: any } = {};
    for (let i = 0; i < MAX_DAYS_SELECTION; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      const dateStr = formatDateString(date);
      validDatesObj[dateStr] = {
        disabled: false,
        textColor: '#000000',
        disableTouchEvent: false,
      };
    }

    validDatesObj[todayStr] = {
      ...validDatesObj[todayStr],
      marked: true,
      dotColor: '#0F2B5B',
    };
    setValidDates(validDatesObj);
    setSelectedDates({});
    setFormData({
      title: '',
      description: '',
      days: {},
    });
    setValidationError('');
    setShowErrorDialog(false);
  }, []);

  const formatDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const onMonthChange = (month: any) => {
    setCurrentMonth(month.dateString);
  };

  const onDayPress = (day: any) => {
    const dateStr = day.dateString;
    if (!validDates[dateStr]) {
      setValidationError('You can only select days within the next 14 days starting from today.');
      setShowErrorDialog(true);
      return;
    }

    setSelectedDates(prev => {
      const newSelectedDates = { ...prev };
      if (newSelectedDates[dateStr]) {
        delete newSelectedDates[dateStr];
      } else {
        newSelectedDates[dateStr] = {
          selected: true,
          selectedColor: '#0F2B5B',
        };
      }
      return newSelectedDates;
    });
  };

  const handleDailyGoalsChange = (newDailyGoals: any) => {
    setFormData(prev => ({ ...prev, days: newDailyGoals }));
  };

  const getSelectedDatesCount = () => {
    return Object.keys(selectedDates).length;
  };

  const formatSelectedDates = () => {
    const dates = Object.keys(selectedDates).sort();
    if (dates.length === 0) return 'No dates selected';
    if (dates.length === 1) return `Selected: ${formatDate(dates[0])}`;
    return `Selected ${dates.length} days`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getMarkedDates = () => {
    const markedDates: { [key: string]: any } = { ...validDates };
    Object.keys(selectedDates).forEach(dateStr => {
      markedDates[dateStr] = {
        ...markedDates[dateStr],
        selected: true,
        selectedColor: '#0F2B5B',
      };
    });

    const today = new Date();
    const todayStr = formatDateString(today);
    const firstDay = new Date(currentMonth || todayStr);
    firstDay.setDate(1);
    const lastDay = new Date(firstDay);
    lastDay.setMonth(lastDay.getMonth() + 1);
    lastDay.setDate(0);

    const currentDate = new Date(firstDay);
    while (currentDate <= lastDay) {
      const dateStr = formatDateString(currentDate);
      if (!validDates[dateStr]) {
        markedDates[dateStr] = {
          disabled: true,
          disableTouchEvent: true,
          textColor: '#CBD5E1',
        };
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return markedDates;
  };

  const getRemainingDaysText = () => {
    const selectedCount = getSelectedDatesCount();
    const remaining = MAX_DAYS_SELECTION - selectedCount;
    if (remaining === MAX_DAYS_SELECTION) return `Select up to ${MAX_DAYS_SELECTION} days`;
    if (remaining === 0) return 'All days selected';
    return `${remaining} ${remaining === 1 ? 'day' : 'days'} remaining`;
  };

  const handleCreateSchedule = async () => {
    setValidationError('');
    if (!formData.title) {
      setValidationError('Please enter a title for your workout schedule.');
      setShowErrorDialog(true);
      return;
    }

    if (getSelectedDatesCount() === 0) {
      setValidationError('Please select at least one date');
      setShowErrorDialog(true);
      return;
    }

    try {
      setIsCreating(true);
      const scheduleData = {
        ...formData,
        user_id: runner?.id || null,
      };
      let result;
      if (runner?.id) {
        result = await createExpertSchedule(scheduleData);
        await fetchSelfSchedules();
        await fetchExpertSchedule();
      } else {
        result = await createSchedule(scheduleData);
        await fetchSelfSchedules();
      } 
      if (result?.status === 'success') {
        setValidationError('');
        setShowErrorDialog(false);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: result?.message || 'Schedule created successfully',
        });
        navigation.goBack();
      } else {
        setValidationError(result?.message || 'Failed to create schedule due to validation error');
        setShowErrorDialog(true);
      }
    } catch (err) {
      console.error('Error creating workout schedule:', err);
      setValidationError('An error occurred while creating the workout schedule. Please try again later.');
      setShowErrorDialog(true);
    } finally {
      setIsCreating(false);
    }
  };

  const isFormValid = () => {
    return formData.title.trim() && getSelectedDatesCount() > 0;
  };

  const renderErrorBanner = () => {
    if (!validationError) return null;
    return (
      <View style={styles.errorContainer}>
        <Icon name="warning" size={18} color="#EF4444" />
        <Text style={styles.errorText}>{validationError}</Text>
      </View>
    );
  };

  return (
    <>
      <CommonDialog
        visible={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        title="Validation Error"
        content={<Text>{validationError}</Text>}
        actionButtons={[
          {
            label: 'OK',
            variant: 'contained',
            color: '#0F2B5B',
            handler: () => setShowErrorDialog(false),
          },
        ]}
      />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <BackButton size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Schedules - Add Schedule</Text>
        </View>
        <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
          {renderErrorBanner()}
          {runner && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Icon name="person-outline" size={20} color="#059669" />
              <Text style={{ marginLeft: 8, fontWeight: '600', color: '#059669', fontSize: 15 }}>
                Creating schedule for: {runner.name}
              </Text>
            </View>
          )}
          <View style={styles.titleInputContainer}>
            <Text style={styles.sectionTitle}>Schedule Title *</Text>
            <Text style={styles.charCounterText}>
              {formData.title.length}/{MAX_TITLE_LENGTH}
            </Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Enter schedule title"
            value={formData.title}
            onChangeText={text => setFormData(prev => ({ ...prev, title: text }))}
            placeholderTextColor="#A1A1AA"
            maxLength={MAX_TITLE_LENGTH}
          />
          {!formData.title && (
            <Text style={styles.errorMessage}>Please enter a title</Text>
          )}
          <View style={styles.limitInfoContainer}>
            <Icon name="information-circle-outline" size={18} color="#64748B" />
            <Text style={styles.limitInfoText}>{getRemainingDaysText()}</Text>
          </View>
          <View style={styles.selectedDatesContainer}>
            <Text style={styles.selectedDatesText}>{formatSelectedDates()}</Text>
          </View>
          <View style={styles.calendarContainer}>
            <Calendar
              current={currentMonth}
              onDayPress={onDayPress}
              onMonthChange={onMonthChange}
              markedDates={getMarkedDates()}
              markingType="multi-dot"
              theme={{
                backgroundColor: '#F1F5F9',
                calendarBackground: '#F1F5F9',
                textSectionTitleColor: '#64748B',
                selectedDayBackgroundColor: '#0F2B5B',
                selectedDayTextColor: '#FFFFFF',
                todayTextColor: '#0F2B5B',
                dayTextColor: '#0F172A',
                textDisabledColor: '#CBD5E1',
                arrowColor: '#0F172A',
                monthTextColor: '#0F172A',
                textMonthFontWeight: '600',
                textMonthFontSize: 16,
                textDayFontSize: 14,
                textDayHeaderFontSize: 14,
              }}
              renderHeader={date => {
                const monthNames = [
                  'January',
                  'February',
                  'March',
                  'April',
                  'May',
                  'June',
                  'July',
                  'August',
                  'September',
                  'October',
                  'November',
                  'December',
                ];
                const month = date.getMonth();
                const year = date.getFullYear();
                return (
                  <Text style={styles.monthTitle}>
                    {monthNames[month]} {year}
                  </Text>
                );
              }}
              enableSwipeMonths={true}
            />
          </View>
          <DailyGoalsSection
            selectedDates={selectedDates}
            onGoalsChange={handleDailyGoalsChange}
            onErrorStateChange={setHasGoalError}
            view={false}
          />
          <View style={styles.titleInputContainer}>
            <Text style={styles.sectionTitle}>Description (optional)</Text>
            <Text style={styles.charCounterText}>
              {formData.description.length}/{MAX_DESCRIPTION_LENGTH}
            </Text>
          </View>
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Add description"
            value={formData.description}
            onChangeText={text => setFormData(prev => ({ ...prev, description: text }))}
            multiline
            placeholderTextColor="#A1A1AA"
            maxLength={MAX_DESCRIPTION_LENGTH}
          />
          <TouchableOpacity
            style={[styles.createButton, (!isFormValid() || hasGoalError || isCreating) && styles.disabledButton]}
            disabled={!isFormValid() || hasGoalError || isCreating}
            onPress={handleCreateSchedule}
          >
            {isCreating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.createButtonText}>
                Create Schedule ({getSelectedDatesCount()}{' '}
                {getSelectedDatesCount() === 1 ? 'day' : 'days'})
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    borderRadius: 20,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  titleInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
  },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#0F172A',
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  calendarContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  limitInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  limitInfoText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 6,
  },
  selectedDatesContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  selectedDatesText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  createButton: {
    backgroundColor: '#0F2B5B',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#94A3B8',
  },
  charCounterText: {
    fontSize: 12,
    color: '#64748B',
  },
  errorMessage: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#EF4444',
    marginLeft: 8,
    fontSize: 14,
  },
});

export default AddScheduleScreen;