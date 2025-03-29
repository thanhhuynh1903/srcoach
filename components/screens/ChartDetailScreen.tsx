import React, {useCallback, useState, useEffect} from 'react';
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
import BackButton from '../BackButton';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {wp} from '../helpers/common';
import {
  fetchActiveCaloriesRecords,
  fetchDistanceRecords,
  fetchHeartRateRecords,
  fetchOxygenSaturationRecords,
  fetchSleepRecords,
  fetchStepRecords,
  fetchTotalCaloriesRecords,
  initializeHealthConnect,
} from '../utils/utils_healthconnect';
import ContentLoader, { Rect, Circle } from 'react-content-loader/native';

type TimeRange = 'day' | 'week' | 'month' | 'year';

const ChartDetailScreen = () => {
  const navigation = useNavigation();
  const [timeRange, setTimeRange] = useState<TimeRange>('day');
  const [healthData, setHealthData] = useState({
    steps: 0,
    activeCalories: 0,
    totalCalories: 0,
    distance: 0,
    heartRate: 0,
    oxygenSaturation: 0,
    sleep: 0,
  });
  const [totals, setTotals] = useState({
    steps: 10000,
    activeCalories: 500,
    totalCalories: 2000,
    distance: 10000,
    heartRate: 100,
    oxygenSaturation: 100,
    sleep: 8,
  });
  const [loading, setLoading] = useState(true);

  const getHealthData = async () => {
    setLoading(true);
    const isInitialized = await initializeHealthConnect();
    if (!isInitialized) {
      console.log('Health Connect initialization failed');
      setLoading(false);
      return;
    }

    // Calculate date ranges based on selected time range
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const startDateString = startDate.toISOString();
    const endDateString = now.toISOString();

    try {
      const [
        stepsData,
        activeCaloriesData,
        totalCaloriesData,
        sleepData,
        spo2Data,
        heartRateData,
        distanceData,
      ] = await Promise.all([
        fetchStepRecords(startDateString, endDateString),
        fetchActiveCaloriesRecords(startDateString, endDateString),
        fetchTotalCaloriesRecords(startDateString, endDateString),
        fetchSleepRecords(startDateString, endDateString),
        fetchOxygenSaturationRecords(startDateString, endDateString),
        fetchHeartRateRecords(startDateString, endDateString),
        fetchDistanceRecords(startDateString, endDateString),
      ]);

      // Process and aggregate data
      const steps = stepsData.reduce((sum, record) => sum + record.count, 0);
      const activeCalories = activeCaloriesData.reduce((sum, record) => sum + record.calories, 0);
      const totalCalories = totalCaloriesData.reduce((sum, record) => sum + record.calories, 0);
      const distance = distanceData.reduce((sum, record) => sum + record.distance, 0) / 1000; // convert to km
      const heartRate = heartRateData.length > 0 ? 
        heartRateData.reduce((sum, record) => sum + record.beatsPerMinute, 0) / heartRateData.length : 0;
      const oxygenSaturation = spo2Data.length > 0 ? 
        spo2Data.reduce((sum, record) => sum + record.percentage, 0) / spo2Data.length : 0;
      
      // Calculate sleep duration in hours
      const sleep = sleepData.reduce((sum, record) => {
        const start = new Date(record.startTime);
        const end = new Date(record.endTime);
        return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }, 0);

      setHealthData({
        steps,
        activeCalories,
        totalCalories,
        distance,
        heartRate,
        oxygenSaturation,
        sleep,
      });

    } catch (error) {
      console.error('Error fetching health data:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => {
    getHealthData();
  }, [timeRange]));

  const calculatePercentage = (current: number, total: number) => {
    return total > 0 ? Math.min(Math.round((current / total) * 100), 100) : 0;
  };

  const renderTimeRangeToggle = () => (
    <View style={styles.timeRangeContainer}>
      {(['day', 'week', 'month', 'year'] as TimeRange[]).map((range) => (
        <TouchableOpacity
          key={range}
          style={[
            styles.timeRangeButton,
            timeRange === range && styles.timeRangeButtonActive,
          ]}
          onPress={() => setTimeRange(range)}>
          <Text
            style={[
              styles.timeRangeText,
              timeRange === range && styles.timeRangeTextActive,
            ]}>
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const MetricSkeleton = () => (
    <ContentLoader 
      speed={1}
      width={wp(45)}
      height={150}
      viewBox={`0 0 ${wp(45)} 150`}
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
    >
      <Circle cx="25" cy="25" r="25" />
      <Rect x="0" y="65" rx="4" ry="4" width="100%" height="20" />
      <Rect x="0" y="95" rx="4" ry="4" width="60%" height="15" />
      <Rect x="0" y="120" rx="4" ry="4" width="80%" height="15" />
    </ContentLoader>
  );

  const RowSkeleton = () => (
    <View style={styles.row}>
      <MetricSkeleton />
      <MetricSkeleton />
    </View>
  );

  const HeaderSkeleton = () => (
    <ContentLoader 
      speed={1}
      width="100%"
      height={80}
      viewBox="0 0 400 80"
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
    >
      <Circle cx="20" cy="20" r="20" />
      <Rect x="250" y="10" rx="4" ry="4" width="30" height="30" />
      <Rect x="20" y="60" rx="4" ry="4" width="150" height="15" />
      <Rect x="20" y="85" rx="4" ry="4" width="200" height="20" />
    </ContentLoader>
  );

  return (
    <SafeAreaView style={{backgroundColor: '#F9FAFB', flex: 1}}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackButton size={24} />
        </TouchableOpacity>
        <View style={{flex: 1}} />
        <TouchableOpacity style={styles.syncButton} onPress={getHealthData}>
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
          {loading ? (
            <HeaderSkeleton />
          ) : (
            <>
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
              <View style={styles.greetingContainer}>
                <Text style={styles.dateText}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </Text>
                <Text style={styles.greetingText}>Good morning, Alex</Text>
              </View>
            </>
          )}
        </View>

        {renderTimeRangeToggle()}

        {loading ? (
          <>
            <View style={styles.metricsGrid}>
              <MetricSkeleton />
              <MetricSkeleton />
            </View>
            <View style={styles.metricsGrid}>
              <MetricSkeleton />
              <MetricSkeleton />
            </View>
            <RowSkeleton />
            <View style={{padding: 16}}>
              <MetricSkeleton />
            </View>
          </>
        ) : (
          <>
            <View style={styles.metricsGrid}>
              <TouchableOpacity
                style={styles.metricItem}
                onPress={() => navigation.navigate('StepsScreen')}>
                <View style={[styles.metricCircle, {backgroundColor: '#EFF6FF'}]}>
                  <Icon name="footsteps-outline" size={24} color="#2563EB" />
                </View>
                <Text style={styles.metricValue}>{healthData.steps.toLocaleString()}</Text>
                <Text style={styles.metricPercentage}>
                  {calculatePercentage(healthData.steps, totals.steps)}%
                </Text>
                <Text style={styles.metricLabel}>Steps</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.metricItem}
                onPress={() => navigation.navigate('CaloriesScreen')}>
                <View style={[styles.metricCircle, {backgroundColor: '#FEE2E2'}]}>
                  <Icon name="flame" size={24} color="#EF4444" />
                </View>
                <Text style={styles.metricValue}>{Math.round(healthData.activeCalories / 1000 * 100) / 100} kcal</Text>
                <Text style={styles.metricPercentage}>
                  {calculatePercentage(healthData.activeCalories, totals.activeCalories)}%
                </Text>
                <Text style={styles.metricLabel}>Active Calories</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.metricItem}
                onPress={() => navigation.navigate('SleepScreen')}>
                <View style={[styles.metricCircle, {backgroundColor: '#EEF2FF'}]}>
                  <Icon name="moon" size={24} color="#6366F1" />
                </View>
                <Text style={styles.metricValue}>
                  {Math.floor(healthData.sleep)}h {Math.round((healthData.sleep % 1) * 60)}m
                </Text>
                <Text style={styles.metricPercentage}>
                  {calculatePercentage(healthData.sleep, totals.sleep)}%
                </Text>
                <Text style={styles.metricLabel}>Sleep</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.metricItem}
                onPress={() => navigation.navigate('SPo2Screen')}>
                <View style={[styles.metricCircle, {backgroundColor: '#ECFDF5'}]}>
                  <Icon name="water-outline" size={24} color="#10B981" />
                </View>
                <Text style={styles.metricValue}>{Math.round(healthData.oxygenSaturation)}%</Text>
                <Text style={styles.metricPercentage}>
                  {calculatePercentage(healthData.oxygenSaturation, totals.oxygenSaturation)}%
                </Text>
                <Text style={styles.metricLabel}>SpO2</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <TouchableOpacity
                onPress={() => navigation.navigate('HeartRateScreen')}
                style={styles.touchable}>
                <View style={styles.additionalMetricCard}>
                  <View style={[styles.metricCircle, {backgroundColor: '#FFF1F0'}]}>
                    <Icon name="heart" size={24} color="#FF4D4F" />
                  </View>
                  <Text style={styles.metricValue}>{Math.round(healthData.heartRate)}</Text>
                  <Text style={styles.metricPercentage}>
                    {calculatePercentage(healthData.heartRate, totals.heartRate)}%
                  </Text>
                  <Text style={styles.metricLabel}>Heart Rate (bpm)</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('DistanceScreen')}
                style={styles.touchable}>
                <View style={styles.additionalMetricCard}>
                  <View style={[styles.metricCircle, {backgroundColor: '#F0F5FF'}]}>
                    <Icon name="walk-outline" size={24} color="#6366F1" />
                  </View>
                  <Text style={styles.metricValue}>{healthData.distance.toFixed(1)}</Text>
                  <Text style={styles.metricPercentage}>
                    {calculatePercentage(healthData.distance, totals.distance)}%
                  </Text>
                  <Text style={styles.metricLabel}>Distance (km)</Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.fullWidthMetric}
              onPress={() => navigation.navigate('TotalCaloriesScreen')}>
              <View style={[styles.metricCircle, {backgroundColor: '#FFF7E6'}]}>
                <Icon name="nutrition-outline" size={24} color="#FAAD14" />
              </View>
              <Text style={styles.metricValue}>{Math.round(healthData.totalCalories / 1000 * 100) / 100}</Text>
              <Text style={styles.metricPercentage}>
                {calculatePercentage(healthData.totalCalories, totals.totalCalories)}%
              </Text>
              <Text style={styles.metricLabel}>Total Calories</Text>
            </TouchableOpacity>
          </>
        )}
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
  additionalMetricCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
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
  fullWidthMetric: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
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
  metricPercentage: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: '#3B82F6',
  },
  timeRangeText: {
    fontSize: 14,
    color: '#64748B',
  },
  timeRangeTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default ChartDetailScreen;