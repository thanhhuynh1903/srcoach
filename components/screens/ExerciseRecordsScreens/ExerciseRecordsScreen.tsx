import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import ScreenWrapper from '../../ScreenWrapper';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useCallback, useState} from 'react';
import {
  getNameFromExerciseType,
  getIconFromExerciseType,
} from '../../contants/exerciseType';
import {
  ExerciseSession,
  fetchExerciseSessionRecords,
  initializeHealthConnect,
} from '../../utils/utils_healthconnect';
import ContentLoader, {Rect} from 'react-content-loader/native';
import {format, parseISO} from 'date-fns';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {theme} from '../../contants/theme';
import CommonDialog from '../../commons/CommonDialog';
import ToastUtil from '../../utils/utils_toast';

const {width} = Dimensions.get('window');

export default function ExerciseRecordsScreen() {
  const navigate = useNavigation();
  const [exerciseSessions, setExerciseSessions] = useState<ExerciseSession[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [showInfoDialog, setShowInfoDialog] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleDateConfirm = (date: Date) => {
    hideDatePicker();
    if (!startDate) {
      setStartDate(date.toISOString());
    } else if (!endDate && new Date(date) > new Date(startDate)) {
      setEndDate(date.toISOString());
    } else {
      setStartDate(date.toISOString());
      setEndDate(null);
    }
  };

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const generateData = (sessions: ExerciseSession[]) => {
    const sessionsByDate: Record<string, any[]> = {};

    sessions.forEach(session => {
      const startDate = parseISO(session.startTime);
      const dateStr = format(startDate, 'EEE, MMM d');

      if (!sessionsByDate[dateStr]) {
        sessionsByDate[dateStr] = [];
      }

      const endDate = parseISO(session.endTime);
      const duration =
        session.duration_minutes ||
        Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));

      const distanceInMeters =
        session.total_distance || Math.round((2 + Math.random() * 8) * 1000);

      const timeStr = format(startDate, 'HH:mm');

      sessionsByDate[dateStr].push({
        time: timeStr,
        type: getNameFromExerciseType(session.exerciseType),
        duration,
        distance: distanceInMeters,
        steps:
          session.total_steps || Math.round((distanceInMeters / 1000) * 1300),
        id: session.id,
        clientRecordId: session.clientRecordId,
        exerciseType: session.exerciseType,
        startTime: session.startTime,
        endTime: session.endTime,
      });
    });

    const result = Object.keys(sessionsByDate).map(dateStr => {
      const activities = sessionsByDate[dateStr];
      const totalSteps = activities.reduce(
        (sum, activity) => sum + (activity.steps || 0),
        0,
      );
      const totalDistance = activities.reduce(
        (sum, activity) => sum + activity.distance,
        0,
      );

      return {
        date: dateStr,
        dateObj: parseISO(activities[0].startTime),
        metrics: {
          steps: totalSteps,
          distance: totalDistance,
        },
        activities: activities.sort(
          (a, b) =>
            new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
        ),
      };
    });

    return result.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  };

  const exerciseData = generateData(exerciseSessions);

  const readSampleData = async () => {
    try {
      setLoading(true);
      setError(null);

      const isInitialized = await initializeHealthConnect();
      if (!isInitialized) {
        ToastUtil.error(
          'Failed to load health data',
          'Please check Health Connect permissions.',
        );
      }

      const data = await fetchExerciseSessionRecords(
        startDate || new Date('2025-01-01T00:00:00.000Z').toISOString(),
        endDate || new Date().toISOString(),
      );

      setExerciseSessions(data);
    } catch (error) {
      ToastUtil.error('An error occurred', 'Failed to load health data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    readSampleData();
  }, [startDate, endDate]);

  useFocusEffect(
    useCallback(() => {
      readSampleData();
    }, [startDate, endDate]),
  );

  const renderLoadingSkeleton = () => (
    <View style={styles.loadingContainer}>
      {[...Array(3)].map((_, i) => (
        <View key={i} style={styles.skeletonDayContainer}>
          <ContentLoader
            speed={1}
            width={width - 32}
            height={200}
            viewBox={`0 0 ${width - 32} 200`}
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb">
            <Rect x="0" y="0" rx="4" ry="4" width="150" height="24" />
            <Rect x={width - 182} y="0" rx="4" ry="4" width="150" height="24" />
            <Rect x="0" y="40" rx="4" ry="4" width={width - 32} height="20" />
            <Rect x="0" y="70" rx="4" ry="4" width={width - 32} height="20" />
            <Rect x="0" y="100" rx="4" ry="4" width={width - 32} height="20" />
            <Rect x="0" y="140" rx="4" ry="4" width={width - 32} height="20" />
            <Rect x="0" y="170" rx="4" ry="4" width={width - 32} height="20" />
          </ContentLoader>
        </View>
      ))}
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyState}>
      <Icon name="warning" size={48} color="#FF5252" />
      <Text style={styles.emptyText}>Error loading data</Text>
      <Text style={styles.emptySubtext}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={readSampleData}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="walk" size={48} color="#ACADAE" />
      <Text style={styles.emptyText}>No run data available</Text>
      <Text style={styles.emptySubtext}>
        Your recorded runs will appear here
      </Text>
    </View>
  );

  return (
    <ScreenWrapper bg={'#FFFFFF'}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="pulse" size={24} color={theme.colors.primaryDark} />
          <Text style={styles.headerTitle}>Run Records</Text>
          <TouchableOpacity
            onPress={() => setShowInfoDialog(true)}
            style={styles.infoButton}>
            <Icon
              name="information-circle-outline"
              size={20}
              color={theme.colors.primaryDark}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={showDatePicker}>
            <Icon
              name="calendar"
              size={24}
              color={theme.colors.primaryDark}
              style={styles.headerIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon
              name="notifications-outline"
              size={24}
              color={theme.colors.primaryDark}
              style={styles.headerIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon
              name="trophy-outline"
              size={24}
              color={theme.colors.primaryDark}
              style={styles.headerIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.dateFilterContainer}
        onPress={showDatePicker}>
        <Text style={styles.dateFilterText}>
          {startDate
            ? format(parseISO(startDate), 'MMM d, yyyy')
            : 'All time start'}
        </Text>
        <Icon
          name="chevron-forward"
          size={16}
          color={'#656565'}
          style={styles.dateFilterIcon}
        />
        <Text style={styles.dateFilterText}>
          {endDate ? format(parseISO(endDate), 'MMM d, yyyy') : 'All time end'}
        </Text>
        {(startDate || endDate) && (
          <TouchableOpacity
            onPress={clearFilters}
            style={styles.clearFilterButton}>
            <Icon name="close" size={16} color={'#656565'} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={hideDatePicker}
        minimumDate={new Date('2025-01-01')}
        maximumDate={new Date()}
      />

      <CommonDialog
        visible={showInfoDialog}
        onClose={() => setShowInfoDialog(false)}
        title="Run Records Info"
        content={
          <View>
            <Text style={styles.dialogText}>
              This screen displays your recorded run sessions from Health
              Connect.
            </Text>
            <Text style={styles.dialogText}>
              Each session shows details like duration, distance, and steps.
            </Text>
            <Text style={[styles.dialogText, {marginTop: 12}]}>
              <Text style={{fontWeight: 'bold'}}>Running sessions</Text>{' '}
              include:
            </Text>
            <View style={styles.dialogBullet}>
              <View style={styles.dialogBullet}>
                <Text style={styles.dialogText}>• Distance covered</Text>
              </View>
              <View style={styles.dialogBullet}>
                <Text style={styles.dialogText}>• Duration</Text>
              </View>
              <View style={styles.dialogBullet}>
                <Text style={styles.dialogText}>• Estimated steps</Text>
              </View>
              <View style={styles.dialogBullet}>
                <Text style={styles.dialogText}>• Pace metrics</Text>
              </View>
              <View style={[styles.dialogBullet]}>
                <Text style={styles.dialogText}>
                  • Routes run (visible via map)
                </Text>
              </View>
            </View>
          </View>
        }
        actionButtons={[
          {
            label: 'Got it',
            variant: 'contained',
            color: theme.colors.primaryDark,
            handler: () => setShowInfoDialog(false),
          },
        ]}
      />

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primaryDark]}
            tintColor={theme.colors.primaryDark}
          />
        }>
        {loading
          ? renderLoadingSkeleton()
          : error
          ? renderErrorState()
          : exerciseData.length > 0
          ? exerciseData.map((day, dayIndex) => (
              <View key={dayIndex} style={styles.dayContainer}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dateText}>{day.date}</Text>
                  <View style={styles.metricsContainer}>
                    <View style={styles.metricItem}>
                      <Icon
                        name="footsteps"
                        size={18}
                        color="#4285F4"
                        style={styles.metricIcon}
                      />
                      <Text style={styles.metricText}>
                        {day.metrics.steps.toLocaleString()} steps
                      </Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Icon
                        name="map"
                        size={18}
                        color="#0F9D58"
                        style={styles.metricIcon}
                      />
                      <Text style={styles.metricText}>
                        {(day.metrics.distance / 1000).toFixed(1)} km
                      </Text>
                    </View>
                  </View>
                </View>

                {day.activities.map((activity, actIndex) => (
                  <View key={actIndex} style={styles.activityContainer}>
                    <TouchableOpacity
                      style={styles.activityRow}
                      onPress={() => {
                        navigate.navigate('RecordDetailScreen' as never, {
                          id: activity.id,
                          clientRecordId: activity.clientRecordId,
                        });
                      }}>
                      <Text style={styles.timeText}>{activity.time}</Text>
                      <View style={styles.iconContainer}>
                        <Icon
                          name={getIconFromExerciseType(activity.exerciseType)}
                          size={32}
                          color="#052658"
                          style={styles.runIcon}
                        />
                      </View>
                      <View style={styles.activityDetails}>
                        <Text style={styles.activityType}>{activity.type}</Text>
                        <Text style={styles.activityMetrics}>
                          {activity.duration} min •{' '}
                          {(activity.distance / 1000).toFixed(1)} km
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ))
          : renderEmptyState()}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 10,
    color: '#000',
  },
  infoButton: {
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: 20,
    color: theme.colors.primaryDark,
  },
  dateFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F5F5F5',
  },
  dateFilterText: {
    fontSize: 14,
    color: theme.colors.primaryDark,
    fontWeight: '500',
  },
  dateFilterIcon: {
    marginHorizontal: 8,
  },
  clearFilterButton: {
    marginLeft: 12,
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    width: '100%',
  },
  skeletonDayContainer: {
    marginBottom: 24,
    width: '100%',
  },
  dayContainer: {
    marginBottom: 24,
    width: '100%',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  dateText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#333333',
  },
  metricsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIcon: {
    marginRight: 4,
  },
  metricText: {
    fontSize: 15,
    color: '#757575',
  },
  activityContainer: {
    marginVertical: 8,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ACADAE',
    paddingBottom: 16,
    width: '100%',
  },
  activityRow: {
    gap: 18,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  timeText: {
    width: 48,
    fontSize: 16,
    color: '#757575',
  },
  iconContainer: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  runIcon: {
    backgroundColor: '#E8F0FE',
    padding: 4,
    borderRadius: 50,
    overflow: 'hidden',
  },
  activityDetails: {
    flex: 1,
    marginLeft: 8,
  },
  activityType: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333333',
  },
  activityMetrics: {
    fontSize: 16,
    color: '#757575',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
    padding: 20,
    width: '100%',
  },
  emptyText: {
    fontSize: 18,
    color: '#333333',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#757575',
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#4285F4',
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
  dialogText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
  },
  dialogBullet: {
    marginLeft: 16,
    marginTop: 8,
  },
});
