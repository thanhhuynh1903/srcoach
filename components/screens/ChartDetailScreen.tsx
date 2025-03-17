import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import SlideCard from '../SlideCard';
import BackButton from '../BackButton';
import GridCard from '../GridCard';
import ScreenWrapper from '../ScreenWrapper';
const ChartDetailScreen = () => {
  const metricsData = [
    {
      id: '1',
      icon: 'footsteps-outline',
      iconColor: '#2563EB',
      circleColor: '#2563EB',
      value: '8,547',
      label: 'Steps',
    },
    {
      id: '2',
      icon: 'flame',
      iconColor: '#EF4444',
      circleColor: '#EF4444',
      value: '432',
      label: 'kcal',
    },
    {
      id: '3',
      icon: 'walk-outline',
      iconColor: '#6366F1',
      circleColor: '#6366F1',
      value: '15',
      label: 'km',
    },
  ];

  const heartRateData = [70, 72, 71, 73, 72, 71];
  const sleepData = [7, 5, 4, 6, 7.5, 7];
  const caloriesData = [250, 200, 150, 200, 280, 286];
  const spo2Data = [97, 98, 98, 97.5, 98, 98];
  return (
    <SafeAreaView style={{backgroundColor: '#F9FAFB', flex: 1}}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calories</Text>
      </View>

      <ScrollView style={styles.content}>
        <View
          style={{
            backgroundColor: '#FFFFFF',
            marginBottom: 10,
            paddingHorizontal: 12,
            borderRadius: 12,
          }}>
          <View style={styles.header_content}>
            <Image
              source={{
                uri: 'https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg',
              }}
              style={styles.avatar}
            />

            <TouchableOpacity style={styles.notificationButton}>
              <Icon name="notifications-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          {/* Greeting */}
          <View style={styles.greetingContainer}>
            <Text style={styles.dateText}>Sunday, March 16</Text>
            <Text style={styles.greetingText}>Good morning, Alex</Text>
          </View>
        </View>
        {/* Running Schedule */}
        <View style={styles.scheduleCard}>
          <View style={styles.scheduleHeader}>
            <Icon name="calendar" size={18} color="#3B82F6" />
            <Text style={styles.scheduleTitle}>Running Schedules Today</Text>
          </View>

          <View style={styles.scheduleItem}>
            <Icon name="walk-sharp" size={16} color="#3B82F6" />
            <Text style={styles.scheduleText}>Morning Run - 6:00 AM</Text>
          </View>

          <View style={styles.scheduleItem}>
            <Icon name="walk-sharp" size={16} color="#3B82F6" />
            <Text style={styles.scheduleText}>Evening Run - 5:30 PM</Text>
          </View>
        </View>

        {/* Health Metrics - Top Row */}
        <View style={styles.metricsRow}>
          <SlideCard metrics={metricsData} />
        </View>

        {/* Health Metrics - Heart Rate and Sleep */}
        <View style={styles.row}>
          <GridCard
            icon="heart"
            iconColor="#FF4D4F"
            value="72"
            unit="bpm"
            label="Heart Rate"
            chartColor="#FF4D4F"
            chartData={heartRateData}
            chartStyle="flat"
          />

          <GridCard
            icon="moon"
            iconColor="#6366F1"
            value="7h 23m"
            unit=""
            label="Sleep"
            chartColor="#6366F1"
            chartData={sleepData}
            chartStyle="wave"
          />
        </View>

        <View style={styles.row}>
          <GridCard
            icon="flame"
            iconColor="#FF4D4F"
            value="286"
            unit="kcal"
            label="Calories burned"
            chartColor="#FF4D4F"
            chartData={caloriesData}
            chartStyle="wave"
          />

          <GridCard
            icon="water-outline"
            iconColor="#0EA5E9"
            value="98"
            unit="%"
            label="SpO2"
            chartColor="#0EA5E9"
            chartData={spo2Data}
            chartStyle="flat"
          />
        </View>

        {/* Cadence */}
        <View style={styles.cadenceCard}>
          <View style={styles.metricHeader}>
            <Icon name="walk-sharp" size={20} color="#10B981" />
            <Text style={styles.metricHeaderValue}>
              112<Text style={styles.metricUnit}>spm</Text>
            </Text>
          </View>
          <View style={styles.barChartContainer}>
            {[0.6, 0.8, 0.7, 0.9, 0.8, 0.7].map((height, index) => (
              <View
                key={index}
                style={[
                  styles.barChart,
                  {
                    height: `${height * 100}%`,
                    backgroundColor: '#86EFAC',
                  },
                ]}
              />
            ))}
          </View>
          <Text style={styles.metricLabel}>Cadence</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  header_content: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  greetingContainer: {
    marginBottom: 16,
  },
  dateText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleText: {
    fontSize: 14,
    color: '#334155',
    marginLeft: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    width: '31%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  metricCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  metricWideCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    borderBottomWidth: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricHeaderValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  metricUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: '#64748B',
  },
  chartContainer: {
    height: 30,
    justifyContent: 'center',
    marginBottom: 8,
  },
  lineChart: {
    height: 20,
    borderRadius: 10,
  },
  cadenceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  barChartContainer: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  barChart: {
    width: 30,
    borderRadius: 4,
  },
});

export default ChartDetailScreen;
