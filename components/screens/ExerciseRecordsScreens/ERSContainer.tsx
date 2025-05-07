import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {ExerciseSession} from '../../utils/utils_healthconnect';
import {format, parseISO} from 'date-fns';
import {theme} from '../../contants/theme';
import {getNameFromExerciseType, getIconFromExerciseType} from '../../contants/exerciseType';

const {width} = Dimensions.get('window');

interface ERSContainerProps {
  exerciseSessions: ExerciseSession[];
  accessDetailNavigation: boolean;
  onPressActivity: (id: string, clientRecordId: string) => void;
}

export const ERSContainer = ({
  exerciseSessions,
  accessDetailNavigation,
  onPressActivity,
}: ERSContainerProps) => {
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

  if (exerciseData.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Icon name="walk" size={48} color="#ACADAE" />
        <Text style={styles.emptyText}>No run data available</Text>
        <Text style={styles.emptySubtext}>
          Your recorded runs will appear here
        </Text>
      </View>
    );
  }

  return (
    <>
      {exerciseData.map((day, dayIndex) => (
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
                  if (!accessDetailNavigation) return;
                  onPressActivity(activity.id, activity.clientRecordId);
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
      ))}
    </>
  );
};

const styles = StyleSheet.create({
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
});