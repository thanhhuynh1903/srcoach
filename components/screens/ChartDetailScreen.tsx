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
import { useNavigation } from '@react-navigation/native';
import { wp } from '../helpers/common';

const ChartDetailScreen = () => {
  const navigation = useNavigation();
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
        <View style={{flex: 1}} />
        <TouchableOpacity style={styles.syncButton}>
          <Icon name="sync-outline" size={20} color="#3B82F6" />
          <Text style={styles.syncText}>Sync</Text>
        </TouchableOpacity>
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

        {/* Health Metrics Grid */}
        <View style={styles.metricsGrid}>
          <TouchableOpacity 
            style={styles.metricItem}
            onPress={() => navigation.navigate('StepsScreen')}
          >
            <View style={[styles.metricCircle, {backgroundColor: '#EFF6FF'}]}>
              <Icon name="footsteps-outline" size={24} color="#2563EB" />
            </View>
            <Text style={styles.metricValue}>8,547</Text>
            <Text style={styles.metricLabel}>Steps</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.metricItem}
            onPress={() => navigation.navigate('CaloriesScreen')}
          >
            <View style={[styles.metricCircle, {backgroundColor: '#FEE2E2'}]}>
              <Icon name="flame" size={24} color="#EF4444" />
            </View>
            <Text style={styles.metricValue}>432</Text>
            <Text style={styles.metricLabel}>Calories</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.metricItem}
            onPress={() => navigation.navigate('SleepScreen')}
          >
            <View style={[styles.metricCircle, {backgroundColor: '#EEF2FF'}]}>
              <Icon name="moon" size={24} color="#6366F1" />
            </View>
            <Text style={styles.metricValue}>7h 23m</Text>
            <Text style={styles.metricLabel}>Sleep</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.metricItem}
            onPress={() => navigation.navigate('SPo2Screen')}
          >
            <View style={[styles.metricCircle, {backgroundColor: '#ECFDF5'}]}>
              <Icon name="water-outline" size={24} color="#10B981" />
            </View>
            <Text style={styles.metricValue}>98%</Text>
            <Text style={styles.metricLabel}>SpO2</Text>
          </TouchableOpacity>
        </View>

        {/* Heart Rate and Distance */}
        <View style={styles.row}>
          <TouchableOpacity
            onPress={() => navigation.navigate('HeartRateScreen')}
            style={styles.touchable}
          >
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
          </TouchableOpacity>

          <GridCard
            icon="walk-outline"
            iconColor="#6366F1"
            value="15"
            unit="km"
            label="Distance"
            chartColor="#6366F1"
            chartData={sleepData}
            chartStyle="wave"
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
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  touchable: {
    flex: 1,
    width: wp(45),
  },
  backButton: {
    marginRight: 16,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  syncText: {
    color: '#3B82F6',
    fontSize: 14,
    marginLeft: 4,
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  metricCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748B',
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