import React, {useCallback, useState, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import HomeHeader from '../HomeHeader';
import WellnessAndMedication from '../WellnessAndMedication';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
  FadeOut,
  FadeInLeft,
  FadeOutLeft,
  FadeInRight,
  FadeOutRight,
  FadeInDown,
  FadeOutDown,
  Layout,
} from 'react-native-reanimated';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from '../utils/useAuthStore';
import {wp} from '../helpers/common';
import {initializeHealthConnect} from '../utils/utils_healthconnect';
import ContentLoader, {Rect, Circle} from 'react-content-loader/native';
import axios from 'axios';
import { MASTER_URL } from '../utils/zustandfetchAPI';
import { useLoginStore } from '../utils/useLoginStore';

type TimeRange = 'day' | 'week' | 'month' | 'year';

interface SummaryData {
  steps: {
    value: number;
    percentage: number;
  };
  activeCalories: {
    value: number;
    percentage: number;
  };
  totalCalories: {
    value: number;
    percentage: number;
  };
  distance: {
    value: number;
    percentage: number;
  };
  heartRate: {
    value: number;
    percentage: number;
  };
  oxygenSaturation: {
    value: number;
    percentage: number;
  };
  sleep: {
    value: number;
    percentage: number;
  };
}

const api = axios.create({
  baseURL: MASTER_URL,
});

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AnimatedView = Animated.createAnimatedComponent(View);

const HomeScreen = () => {
  const opacity = useSharedValue(0);
  const navigation = useNavigation();
  const {token, loadToken} = useAuthStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('day');
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const {profile} = useLoginStore();

  useEffect(() => {
    const loadUserToken = async () => {
      await loadToken();
    };
    loadUserToken();

    opacity.value = withTiming(1, {duration: 1000});
    return () => {
      opacity.value = withTiming(0, {duration: 500});
    };
  }, [opacity, loadToken]);

  const getHealthData = async () => {
    setLoading(true);
    try {
      await initializeHealthConnect(); // Silently attempt to initialize

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

      const response = await api.get('/record-summary', {
        params: {
          startTime: startDate.toISOString(),
          endTime: now.toISOString(),
        },
      });

      if (response.data.status === 'success') {
        setSummaryData(response.data.data);
      }
    } catch (error) {
      console.log('Error fetching health data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getHealthData();
  }, [timeRange]);

  const fadeInStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const renderTimeRangeToggle = () => (
    <AnimatedView
      entering={FadeIn.delay(600).duration(500)}
      exiting={FadeOut.duration(300)}
      layout={Layout.springify()}
      style={styles.timeRangeContainer}>
      {(['day', 'week', 'month', 'year'] as TimeRange[]).map(range => (
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
    </AnimatedView>
  );

  const MetricSkeleton = () => (
    <ContentLoader
      speed={1}
      width={wp(30)}
      height={120}
      viewBox={`0 0 ${wp(30)} 120`}
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb">
      <Circle cx="25" cy="25" r="20" />
      <Rect x="0" y="55" rx="4" ry="4" width="100%" height="16" />
      <Rect x="0" y="80" rx="4" ry="4" width="60%" height="12" />
    </ContentLoader>
  );

  const renderHighlightedMetrics = () => (
    <AnimatedView
      entering={FadeInLeft.delay(900).duration(500)}
      exiting={FadeOutLeft.duration(300)}
      layout={Layout.springify()}
      style={styles.highlightedRow}>
      {/* Steps */}
      <TouchableOpacity
        style={styles.highlightedMetric}
        onPress={() => navigation.navigate('StepsScreen')}>
        <View
          style={[styles.metricIconContainer, {backgroundColor: '#EFF6FF'}]}>
          <Icon name="footsteps" size={20} color="#2563EB" />
        </View>
        <Text style={styles.highlightedMetricValue}>
          {summaryData?.steps.value.toLocaleString() || '--'}
        </Text>
        <Text style={styles.highlightedMetricLabel}>Steps</Text>
        <View style={styles.highlightBadge}>
          <Text style={styles.highlightBadgeText}>
            {summaryData?.steps.percentage.toFixed(0) || '--'}%
          </Text>
        </View>
      </TouchableOpacity>

      {/* Distance */}
      <TouchableOpacity
        style={styles.highlightedMetric}
        onPress={() => navigation.navigate('DistanceScreen')}>
        <View
          style={[styles.metricIconContainer, {backgroundColor: '#F0F5FF'}]}>
          <Icon name="walk" size={20} color="#6366F1" />
        </View>
        <Text style={styles.highlightedMetricValue}>
          {summaryData?.distance.value.toFixed(1) || '--'} km
        </Text>
        <Text style={styles.highlightedMetricLabel}>Distance</Text>
        <View style={styles.highlightBadge}>
          <Text style={styles.highlightBadgeText}>
            {summaryData?.distance.percentage.toFixed(0) || '--'}%
          </Text>
        </View>
      </TouchableOpacity>

      {/* Calories */}
      <TouchableOpacity
        style={styles.highlightedMetric}
        onPress={() => navigation.navigate('CaloriesScreen')}>
        <View
          style={[styles.metricIconContainer, {backgroundColor: '#FEE2E2'}]}>
          <Icon name="flame" size={20} color="#EF4444" />
        </View>
        <Text style={styles.highlightedMetricValue}>
          {summaryData?.activeCalories.value.toFixed(0) || '--'} cal
        </Text>
        <Text style={styles.highlightedMetricLabel}>Calories</Text>
        <View style={styles.highlightBadge}>
          <Text style={styles.highlightBadgeText}>
            {summaryData?.activeCalories.percentage.toFixed(0) || '--'}%
          </Text>
        </View>
      </TouchableOpacity>
    </AnimatedView>
  );

  const renderOtherMetrics = () => (
    <AnimatedView
      entering={FadeInRight.delay(1200).duration(500)}
      exiting={FadeOutRight.duration(300)}
      layout={Layout.springify()}
      style={styles.metricsGrid}>
      {/* Heart Rate */}
      <TouchableOpacity
        style={styles.metricItem}
        onPress={() => navigation.navigate('HeartRateScreen')}>
        <View
          style={[styles.metricIconContainer, {backgroundColor: '#FFF1F0'}]}>
          <Icon name="heart" size={18} color="#FF4D4F" />
        </View>
        <Text style={styles.metricValue}>
          {summaryData?.heartRate.value.toFixed(0) || '--'} bpm
        </Text>
        <Text style={styles.metricLabel}>Heart Rate</Text>
        <Text style={styles.metricPercentage}>
          {summaryData?.heartRate.percentage.toFixed(0) || '--'}%
        </Text>
      </TouchableOpacity>

      {/* Sleep */}
      <TouchableOpacity
        style={styles.metricItem}
        onPress={() => navigation.navigate('SleepScreen')}>
        <View
          style={[styles.metricIconContainer, {backgroundColor: '#EEF2FF'}]}>
          <Icon name="moon" size={18} color="#6366F1" />
        </View>
        <Text style={styles.metricValue}>
          {summaryData
            ? `${Math.floor(summaryData.sleep.value)}h ${Math.round(
                (summaryData.sleep.value % 1) * 60,
              )}m`
            : '--'}
        </Text>
        <Text style={styles.metricLabel}>Sleep</Text>
        <Text style={styles.metricPercentage}>
          {summaryData?.sleep.percentage.toFixed(0) || '--'}%
        </Text>
      </TouchableOpacity>

      {/* SpO2 */}
      <TouchableOpacity
        style={styles.metricItem}
        onPress={() => navigation.navigate('SPo2Screen')}>
        <View
          style={[styles.metricIconContainer, {backgroundColor: '#ECFDF5'}]}>
          <Icon name="water" size={18} color="#10B981" />
        </View>
        <Text style={styles.metricValue}>
          {summaryData?.oxygenSaturation.value.toFixed(0) || '--'}%
        </Text>
        <Text style={styles.metricLabel}>SpO2</Text>
        <Text style={styles.metricPercentage}>
          {summaryData?.oxygenSaturation.percentage.toFixed(0) || '--'}%
        </Text>
      </TouchableOpacity>

      {/* Total Calories */}
      <TouchableOpacity
        style={styles.metricItem}
        onPress={() => navigation.navigate('TotalCaloriesScreen')}>
        <View
          style={[styles.metricIconContainer, {backgroundColor: '#FFF7E6'}]}>
          <Icon name="nutrition" size={18} color="#FAAD14" />
        </View>
        <Text style={styles.metricValue}>
          {summaryData?.totalCalories.value.toFixed(0) || '--'}
        </Text>
        <Text style={styles.metricLabel}>Total Calories</Text>
        <Text style={styles.metricPercentage}>
          {summaryData?.totalCalories.percentage.toFixed(0) || '--'}%
        </Text>
      </TouchableOpacity>
    </AnimatedView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedView
        entering={FadeInDown.delay(300).duration(500)}
        exiting={FadeOutDown.duration(300)}
        layout={Layout.springify()}>
        <HomeHeader />
      </AnimatedView>

      <ScrollView style={styles.scrollView}>
        {/* Health Score */}
        <AnimatedView
          entering={FadeIn.delay(300).duration(500)}
          exiting={FadeOut.duration(300)}
          layout={Layout.springify()}
          style={[styles.section, fadeInStyle]}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Health Score</Text>
            <Icon
              name="ellipsis-horizontal-outline"
              size={16}
              color="#64748B"
            />
          </View>
          <View style={styles.scoreCard}>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreNumber}>88</Text>
            </View>
            <View style={styles.scoreInfo}>
              <Text style={styles.scoreTitle}>SRCoach Score</Text>
              <Text style={styles.scoreDescription}>
                Based on your data, how well are you?
              </Text>
            </View>
          </View>
        </AnimatedView>

        {renderTimeRangeToggle()}

        {loading ? (
          <View style={styles.skeletonContainer}>
            <View style={styles.highlightedRow}>
              <MetricSkeleton />
              <MetricSkeleton />
              <MetricSkeleton />
            </View>
            <View style={styles.metricsGrid}>
              <MetricSkeleton />
              <MetricSkeleton />
              <MetricSkeleton />
              <MetricSkeleton />
            </View>
          </View>
        ) : (
          <>
            {renderHighlightedMetrics()}
            {renderOtherMetrics()}
          </>
        )}

        {/* Wellness and AI Chatbot */}
        <AnimatedView
          entering={FadeIn.delay(1500).duration(500)}
          exiting={FadeOut.duration(300)}
          layout={Layout.springify()}>
          <WellnessAndMedication />
        </AnimatedView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  scoreInfo: {
    marginLeft: 16,
  },
  scoreTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#334155',
  },
  scoreDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
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
  skeletonContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  highlightedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  highlightedMetric: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  highlightedMetricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 4,
  },
  highlightedMetricLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  highlightBadge: {
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  highlightBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E40AF',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
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
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  metricPercentage: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
});

export default HomeScreen;
