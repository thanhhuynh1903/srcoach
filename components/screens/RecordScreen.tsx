import {View, Text, StyleSheet, ScrollView,TouchableOpacity} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import ScreenWrapper from '../ScreenWrapper';
import HeaderBar from '../HeaderBar';
import { useNavigation } from '@react-navigation/native';
export default function RecordScreen() {
  const navigate = useNavigation();
  const runData = [
    {
      date: 'Sun, Feb 9',
      metrics: {steps: 700, points: 51},
      activities: [
        {time: '16:59', type: 'Evening Run', duration: 31, distance: 4.2},
        {time: '13:50', type: 'Lunch Run', duration: 23, distance: 2.8},
        {time: '08:30', type: 'Morning Run', duration: 45, distance: 6.8},
      ],
    },
    {
      date: 'Sat, Feb 8',
      metrics: {steps: 700, points: 51},
      activities: [
        {time: '16:59', type: 'Evening Run', duration: 31, distance: 4.2},
        {time: '13:50', type: 'Lunch Run', duration: 23, distance: 2.8},
        {time: '08:30', type: 'Morning Run', duration: 45, distance: 6.8},
      ],
    },
  ];

  return (
    <ScreenWrapper bg={'#FFFFFF'}>
      <HeaderBar />
      <ScrollView style={styles.container}>
        {runData.map((day, dayIndex) => (
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
                <View style={styles.metricItem}>
                  <Icon
                    name="analytics"
                    size={19}
                    color="#F4B400"
                    style={styles.metricIcon}
                  />
                  <Text style={styles.metricText}>
                    {day.metrics.points} pts
                  </Text>
                </View>
              </View>
            </View>

            {day.activities.map((activity, actIndex) => (
              <View key={actIndex} style={styles.activityContainer}>
                <TouchableOpacity style={styles.activityRow} onPress={() => {navigate.navigate('RecordDetailScreen' as never)}}>
                <Text style={styles.timeText}>{activity.time}</Text>
                <View style={styles.iconContainer}>
                  <Icon
                    name="walk"
                    size={32}
                    color="#052658"
                    style={styles.runIcon}
                  />
                </View>
                <View style={styles.activityDetails}>
                  <Text style={styles.activityType}>{activity.type}</Text>
                  <Text style={styles.activityMetrics}>
                    {activity.duration} min • {activity.distance} km
                  </Text>
                </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}
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
  activityRow:{
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
});
