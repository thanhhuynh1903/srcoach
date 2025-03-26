import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import ScreenWrapper from '../ScreenWrapper';
import HeaderBar from '../HeaderBar';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useCallback, useEffect, useState} from 'react';
import {
  initialize,
  readRecord,
  readRecords,
  requestPermission,
} from 'react-native-health-connect';
import {
  getNameFromExerciseType,
  getIconFromExerciseType,
} from '../contants/exerciseType';
import { DistanceRecord, ExerciseSession, fetchDistanceRecords, fetchExerciseSessionRecords, fetchStepRecords, initializeHealthConnect, StepRecord } from '../utils/utils_healthconnect';

export default function RecordScreen() {
  const navigate = useNavigation();
  const [exerciseSessions, setExerciseSessions] = useState<ExerciseSession[]>(
    [],
  );
  const [stepRecords, setStepRecords] = useState<StepRecord[]>([]);
  const [distanceRecords, setDistanceRecords] = useState<DistanceRecord[]>([]);

  const generateData = (
    sessions: ExerciseSession[],
    steps: StepRecord[],
    distances: DistanceRecord[],
  ) => {
    // Group sessions by date
    const sessionsByDate: Record<string, any[]> = {};

    sessions.forEach(session => {
      const startDate = new Date(session.startTime);
      const dateStr = startDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });

      if (!sessionsByDate[dateStr]) {
        sessionsByDate[dateStr] = [];
      }

      const endDate = new Date(session.endTime);
      const duration = Math.round(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60),
      );

      // Find matching distance record for this session
      const distanceRecord = distances.find(
        d =>
          new Date(d.startTime).getTime() === startDate.getTime() &&
          new Date(d.endTime).getTime() === endDate.getTime(),
      );

      const distanceInMeters = distanceRecord
        ? Math.round(distanceRecord.distance)
        : Math.round((2 + Math.random() * 8) * 1000);
      const timeStr = startDate
        .toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
        .replace('24:', '00:');

      sessionsByDate[dateStr].push({
        time: timeStr,
        type: getNameFromExerciseType(session.exerciseType),
        duration,
        distance: distanceInMeters,
        id: session.id,
        clientRecordId: session.clientRecordId,
        exerciseType: session.exerciseType,
      });
    });

    // Calculate total steps per day
    const stepsByDate: Record<string, number> = {};
    steps.forEach(step => {
      const date = new Date(step.startTime);
      const dateStr = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      if (!stepsByDate[dateStr]) {
        stepsByDate[dateStr] = 0;
      }
      stepsByDate[dateStr] += step.count;
    });

    // Calculate metrics for each date
    const result = Object.keys(sessionsByDate).map(dateStr => {
      const activities = sessionsByDate[dateStr];
      const totalSteps =
        stepsByDate[dateStr] ||
        Math.round(
          activities.reduce(
            (sum, activity) => sum + (activity.distance / 1000) * 1300,
            0,
          ),
        ); // Approximate steps based on distance
      const totalPoints = Math.round(
        activities.reduce(
          (sum, activity) =>
            sum + activity.duration * (0.8 + Math.random() * 0.4),
          0,
        ),
      );
      const totalDistance = activities.reduce(
        (sum, activity) => sum + activity.distance,
        0,
      );

      return {
        date: dateStr,
        dateObj: new Date(activities[0].time), // For sorting
        metrics: {
          steps: totalSteps,
          points: totalPoints,
          distance: totalDistance,
        },
        activities: activities,
      };
    });

    // Sort by date descending (newest first)
    return result.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  };

  const exerciseData = generateData(
    exerciseSessions,
    stepRecords,
    distanceRecords,
  );

  const readSampleData = async () => {
    try {
      const isInitialized = await initializeHealthConnect();
      if (!isInitialized) {
        console.log('Health Connect initialization failed');
        return;
      }

      const data = await fetchExerciseSessionRecords('2025-03-02T00:00:00.000Z', new Date().toISOString());
      const stepData = await fetchStepRecords('2025-03-02T00:00:00.000Z', new Date().toISOString());
      const distanceData = await fetchDistanceRecords('2025-03-02T00:00:00.000Z', new Date().toISOString());

      setExerciseSessions(data);
      setStepRecords(stepData);
      setDistanceRecords(distanceData);
    } catch (error) {
      console.error('Error reading health data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      readSampleData();
    }, []),
  );

  return (
    <ScreenWrapper bg={'#FFFFFF'}>
      <HeaderBar />
      <ScrollView style={styles.container}>
        {exerciseData.length > 0 ? (
          exerciseData.map((day, dayIndex) => (
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
                      {day.metrics.steps} steps
                    </Text>
                  </View>
                  {/* <View style={styles.metricItem}>
                    <Icon
                      name="analytics"
                      size={19}
                      color="#F4B400"
                      style={styles.metricIcon}
                    />
                    <Text style={styles.metricText}>
                      {day.metrics.points} pts
                    </Text>
                  </View> */}
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
                        {activity.duration} min • {activity.distance} m
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="walk" size={48} color="#ACADAE" />
            <Text style={styles.emptyText}>No workout data available</Text>
            <Text style={styles.emptySubtext}>
              Your recorded workouts will appear here
            </Text>
          </View>
        )}
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
  dayContainer: {
    marginBottom: 24,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    marginHorizontal: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ACADAE',
    paddingBottom: 16,
  },
  activityRow: {
    gap: 18,
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  emptyText: {
    fontSize: 18,
    color: '#333333',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#757575',
    marginTop: 8,
  },
});
