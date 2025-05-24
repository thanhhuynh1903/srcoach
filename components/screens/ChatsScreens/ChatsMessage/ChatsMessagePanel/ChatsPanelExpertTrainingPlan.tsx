import React, {useState, useEffect} from 'react';
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
import {Calendar} from 'react-native-calendars';
import DailyGoalsSection from '../../../../DailyGoalsScreen';
import {theme} from '../../../../contants/theme';
import CommonPanel from '../../../../commons/CommonPanel';
import CommonDialog from '../../../../commons/CommonDialog';
import {ActivityIndicator} from 'react-native-paper';
import useScheduleStore from '../../../../utils/useScheduleStore';
import Toast from 'react-native-toast-message';
import {hp} from '../../../../helpers/common';

interface ChatsPanelExpertTrainingPlanProps {
  visible: boolean;
  onClose: () => void;
  otherUser: any;
  onSendSuccess: () => void;
}

const ChatsPanelExpertTrainingPlan: React.FC<
  ChatsPanelExpertTrainingPlanProps
> = ({visible, onClose, otherUser, onSendSuccess}) => {
  const MAX_DAYS_SELECTION = 14;
  const MAX_TITLE_LENGTH = 255;
  const MAX_DESCRIPTION_LENGTH = 1000;

  const [formData, setFormData] = useState({
    user_id: otherUser?.id,
    title: '',
    description: '',
    days: {},
  });
  const [selectedDates, setSelectedDates] = useState({});
  const [currentMonth, setCurrentMonth] = useState('');
  const [validDates, setValidDates] = useState<{[key: string]: any}>({});
  const [isCreating, setIsCreating] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const {createExpertSchedule, isLoading, message, error} = useScheduleStore();

  useEffect(() => {
    if (error) {
      setValidationError(error);
      setShowErrorDialog(true);
      useScheduleStore.getState().clear();
    }
  }, [error]);

  useEffect(() => {
    if (!visible) return;

    const today = new Date();
    const todayStr = formatDateString(today);
    setCurrentMonth(todayStr);

    const validDatesObj: {[key: string]: any} = {};
    for (let i = 0; i < MAX_DAYS_SELECTION; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      const dateStr = formatDateString(date);
      validDatesObj[dateStr] = {disabled: false};
    }

    validDatesObj[todayStr] = {
      ...validDatesObj[todayStr],
      marked: true,
      dotColor: theme.colors.primaryDark,
    };
    setValidDates(validDatesObj);
    setSelectedDates({});
    setFormData({
      user_id: otherUser.id,
      title: '',
      description: '',
      days: {},
    });
    setValidationError('');
    setShowErrorDialog(false);
  }, [visible]);

  const formatDateString = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const onMonthChange = (month: any) => {
    setCurrentMonth(month.dateString);
  };

  const onDayPress = (day: any) => {
    const dateStr = day.dateString;
    if (!validDates[dateStr]) return;

    setSelectedDates(prev => {
      const newSelectedDates = {...prev};
      if (newSelectedDates[dateStr]) {
        delete newSelectedDates[dateStr];
      } else {
        newSelectedDates[dateStr] = {
          selected: true,
          selectedColor: theme.colors.primaryDark,
        };
      }
      return newSelectedDates;
    });
  };

  const handleDailyGoalsChange = (newDailyGoals: any) => {
    setFormData(prev => ({...prev, days: newDailyGoals}));
  };

  const getMarkedDates = () => {
    const markedDates: {[key: string]: any} = {...validDates};
    Object.keys(selectedDates).forEach(dateStr => {
      markedDates[dateStr] = {
        ...markedDates[dateStr],
        selected: true,
        selectedColor: theme.colors.primaryDark,
      };
    });

    const today = new Date();
    const currentDate = new Date(currentMonth || formatDateString(today));
    currentDate.setDate(1);
    const lastDay = new Date(currentDate);
    lastDay.setMonth(lastDay.getMonth() + 1);
    lastDay.setDate(0);

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

  const handleCreateSchedule = async () => {
    setValidationError('');
    if (!formData.title) {
      const errorMsg = 'Please enter a title for your workout schedule.';
      setValidationError(errorMsg);
      setShowErrorDialog(true);
      return;
    }

    if (Object.keys(selectedDates).length === 0) {
      const errorMsg = 'Please select at least one date';
      setValidationError(errorMsg);
      setShowErrorDialog(true);
      return;
    }

    try {
      setIsCreating(true);
      const result = await createExpertSchedule(formData as any);
      if (result?.status == 'success') {
        setValidationError('');
        setShowErrorDialog(false);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Training plan created and sent successfully',
        });
        onSendSuccess();
        onClose();
      }
    } catch (err) {
      const errorMsg =
        'An error occurred while creating the training plan. Please try again later.';
      setValidationError(errorMsg);
      setShowErrorDialog(true);
    } finally {
      setIsCreating(false);
    }
  };

  const renderErrorBanner = () => {
    if (!validationError) return null;

    return (
      <View style={styles.errorContainer}>
        <Icon name="warning" size={18} color={theme.colors.error} />
        <Text style={styles.errorText}>{validationError}</Text>
      </View>
    );
  };

  const isFormValid = () => {
    return formData.title.trim() && Object.keys(selectedDates).length > 0;
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
            color: theme.colors.primaryDark,
            handler: () => setShowErrorDialog(false),
          },
        ]}
      />

      <CommonPanel
        visible={visible}
        onClose={onClose}
        title="Create Training Plan"
        direction="bottom"
        height={hp(95)}
        borderRadius={16}
        backdropOpacity={0.5}
        contentStyle={{padding: 0}}
        swipeToClose={false}
        disableBackdropClose={true}
        content={
          <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <ScrollView
              style={styles.scrollView}
              scrollEventThrottle={16}
              keyboardShouldPersistTaps="handled">
              {renderErrorBanner()}

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
                onChangeText={text =>
                  setFormData(prev => ({...prev, title: text}))
                }
                placeholderTextColor="#A1A1AA"
                maxLength={MAX_TITLE_LENGTH}
              />
              {!formData.title && (
                <Text style={styles.errorMessage}>Please enter a title</Text>
              )}

              <View style={styles.limitInfoContainer}>
                <Icon
                  name="information-circle-outline"
                  size={18}
                  color="#64748B"
                />
                <Text style={styles.limitInfoText}>
                  {Object.keys(selectedDates).length}/{MAX_DAYS_SELECTION} days
                  selected
                </Text>
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
                    selectedDayBackgroundColor: theme.colors.primaryDark,
                    selectedDayTextColor: '#FFFFFF',
                    todayTextColor: theme.colors.primaryDark,
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
                onChangeText={text =>
                  setFormData(prev => ({...prev, description: text}))
                }
                multiline
                placeholderTextColor="#A1A1AA"
                maxLength={MAX_DESCRIPTION_LENGTH}
              />

              <TouchableOpacity
                style={[
                  styles.createButton,
                  !isFormValid() && styles.disabledButton,
                ]}
                disabled={!isFormValid() || isCreating}
                onPress={handleCreateSchedule}>
                {isCreating ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.createButtonText}>
                    Create Training Plan ({Object.keys(selectedDates).length}{' '}
                    days)
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        }
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    color: theme.colors.primaryDark,
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
  createButton: {
    backgroundColor: theme.colors.primaryDark,
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
    color: theme.colors.error,
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
    color: theme.colors.error,
    marginLeft: 8,
    fontSize: 14,
  },
});

export default ChatsPanelExpertTrainingPlan;
