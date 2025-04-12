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
import CommonDialog from '../commons/CommonDialog';
import { theme } from '../contants/theme';

interface SummaryData {
  steps: {
    value: number;
    percentage: number;
  };
  activeCalories: {
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
  totalCalories: {
    value: number;
    percentage: number;
  };
}

interface HealthScoreData {
  score: number;
  scoreInfo: {
    scoreText: string;
    scoreMessage: string;
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
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [healthScore, setHealthScore] = useState<HealthScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const {profile} = useLoginStore();
  const [infoDialogVisible, setInfoDialogVisible] = useState(false);
  const [currentMetricInfo, setCurrentMetricInfo] = useState({
    title: '',
    content: '',
  });

  const metricInfo = {
    heartRate: {
      title: 'Heart Rate',
      content: 'Your heart rate is the number of times your heart beats per minute. A normal resting heart rate for adults ranges from 60 to 100 beats per minute.',
    },
    steps: {
      title: 'Steps',
      content: 'Steps count your daily physical activity. The recommended daily step count is 10,000 steps for general health benefits.',
    },
    distance: {
      title: 'Distance',
      content: 'Distance shows how far you have walked or run. Tracking distance can help you monitor your physical activity levels.',
    },
    calories: {
      title: 'Active Calories',
      content: 'Active calories are the calories you burn through physical activity. This doesn\'t include calories burned at rest (BMR).',
    },
    oxygenSaturation: {
      title: 'Oxygen Saturation',
      content: 'Oxygen saturation (SpO2) measures how much oxygen your blood is carrying. Normal levels are typically between 95-100%.',
    },
    sleep: {
      title: 'Sleep',
      content: 'Sleep duration and quality are essential for overall health. Adults typically need 7-9 hours of sleep per night.',
    },
    totalCalories: {
      title: 'Total Calories',
      content: 'Total calories include both active calories burned through movement and calories burned at rest (BMR).',
    },
  };

  const showInfoDialog = (metric: keyof typeof metricInfo) => {
    setCurrentMetricInfo(metricInfo[metric]);
    setInfoDialogVisible(true);
  };

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
    setErrors({});
    try {
      await initializeHealthConnect();

      const response = await api.get('/record-summary');
      
      if (response.data.status === 'success') {
        setSummaryData(response.data.data.summaries);
        setHealthScore(response.data.data.healthScore);
      }
    } catch (error) {
      console.log('Error fetching health data:', error);
      if (error.response?.data?.errors) {
        const newErrors = {...errors};
        Object.keys(error.response.data.errors).forEach(key => {
          newErrors[key] = true;
        });
        setErrors(newErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getHealthData();
    });

    return unsubscribe;
  }, [navigation]);

  const fadeInStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const getHealthScoreColor = (score: number) => {
    if (score === 0) return '#64748B'; // Gray for no data
    if (score < 30) return '#EF4444'; // Red
    if (score < 50) return '#F97316'; // Orange
    if (score < 70) return '#F59E0B'; // Yellow
    if (score < 85) return '#10B981'; // Green
    return '#3B82F6'; // Blue for excellent
  };

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

  const MetricErrorCard = ({metric}: {metric: string}) => (
    <View style={[styles.healthMetricCard, {backgroundColor: '#F8FAFC'}]}>
      <Icon name="warning" size={20} color="#64748B" />
      <Text style={[styles.healthMetricValue, {color: '#64748B'}]}>--</Text>
      <Text style={styles.healthMetricLabel}>{metricInfo[metric]?.title || metric}</Text>
      <Text style={[styles.healthMetricPercentage, {color: '#64748B'}]}>Error</Text>
    </View>
  );

  const renderMainMetricsCard = () => (
    <AnimatedView
      entering={FadeInLeft.delay(600).duration(500)}
      exiting={FadeOutLeft.duration(300)}
      layout={Layout.springify()}
      style={styles.mainMetricsCard}>
      {/* Steps */}
      {errors.steps ? (
        <MetricErrorCard metric="steps" />
      ) : (
        <TouchableOpacity 
          style={styles.mainMetricItem}
          onPress={() => navigation.navigate('StepsScreen')}
        >
          <View style={styles.metricHeader}>
            <Icon name="footsteps" size={20} color="#2563EB" />
            <TouchableOpacity 
              onPress={() => showInfoDialog('steps')}
              style={styles.infoButton}>
              <Icon name="information-circle-outline" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>
          <Text style={styles.mainMetricValue}>
            {summaryData?.steps.value.toLocaleString() || '--'}
          </Text>
          <Text style={styles.mainMetricLabel}>Steps</Text>
          <View style={[styles.chip, {backgroundColor: '#EFF6FF'}]}>
            <Text style={[styles.chipText, {color: '#2563EB'}]}>
              {summaryData?.steps.percentage.toFixed(0) || '--'}%
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Distance */}
      {errors.distance ? (
        <MetricErrorCard metric="distance" />
      ) : (
        <TouchableOpacity 
          style={styles.mainMetricItem}
          onPress={() => navigation.navigate('DistanceScreen')}
        >
          <View style={styles.metricHeader}>
            <Icon name="walk" size={20} color="#6366F1" />
            <TouchableOpacity 
              onPress={() => showInfoDialog('distance')}
              style={styles.infoButton}>
              <Icon name="information-circle-outline" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>
          <Text style={styles.mainMetricValue}>
            {summaryData?.distance.value.toFixed(1) || '--'} km
          </Text>
          <Text style={styles.mainMetricLabel}>Distance</Text>
          <View style={[styles.chip, {backgroundColor: '#F0F5FF'}]}>
            <Text style={[styles.chipText, {color: '#6366F1'}]}>
              {summaryData?.distance.percentage.toFixed(0) || '--'}%
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Calories */}
      {errors.activeCalories ? (
        <MetricErrorCard metric="calories" />
      ) : (
        <TouchableOpacity 
          style={styles.mainMetricItem}
          onPress={() => navigation.navigate('CaloriesScreen')}
        >
          <View style={styles.metricHeader}>
            <Icon name="flame" size={20} color="#EF4444" />
            <TouchableOpacity 
              onPress={() => showInfoDialog('calories')}
              style={styles.infoButton}>
              <Icon name="information-circle-outline" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>
          <Text style={styles.mainMetricValue}>
            {summaryData?.activeCalories.value.toFixed(0) || '--'} cal
          </Text>
          <Text style={styles.mainMetricLabel}>Calories</Text>
          <View style={[styles.chip, {backgroundColor: '#FEE2E2'}]}>
            <Text style={[styles.chipText, {color: '#EF4444'}]}>
              {summaryData?.activeCalories.percentage.toFixed(0) || '--'}%
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </AnimatedView>
  );

  const renderHealthMetricsCards = () => (
    <AnimatedView
      entering={FadeInRight.delay(900).duration(500)}
      exiting={FadeOutRight.duration(300)}
      layout={Layout.springify()}
      style={styles.metricsGrid}>
      {/* Heart Rate */}
      {errors.heartRate ? (
        <MetricErrorCard metric="heartRate" />
      ) : (
        <TouchableOpacity 
          style={[styles.healthMetricCard, {backgroundColor: '#FFF1F2'}]}
          onPress={() => navigation.navigate('HeartRateScreen')}
        >
          <View style={styles.metricHeader}>
            <Icon name="heart" size={20} color="#FF4D4F" />
            <TouchableOpacity 
              onPress={() => showInfoDialog('heartRate')}
              style={styles.infoButton}>
              <Icon name="information-circle-outline" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>
          <Text style={styles.healthMetricValue}>
            {summaryData?.heartRate.value.toFixed(0) || '--'} bpm
          </Text>
          <Text style={styles.healthMetricLabel}>Heart Rate</Text>
          <Text style={[styles.healthMetricPercentage, {color: '#FF4D4F'}]}>
            {summaryData?.heartRate.percentage.toFixed(0) || '--'}%
          </Text>
        </TouchableOpacity>
      )}

      {/* Oxygen Saturation */}
      {errors.oxygenSaturation ? (
        <MetricErrorCard metric="oxygenSaturation" />
      ) : (
        <TouchableOpacity 
          style={[styles.healthMetricCard, {backgroundColor: '#ECFDF5'}]}
          onPress={() => navigation.navigate('SPo2Screen')}
        >
          <View style={styles.metricHeader}>
            <Icon name="water" size={20} color="#10B981" />
            <TouchableOpacity 
              onPress={() => showInfoDialog('oxygenSaturation')}
              style={styles.infoButton}>
              <Icon name="information-circle-outline" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>
          <Text style={styles.healthMetricValue}>
            {summaryData?.oxygenSaturation.value.toFixed(0) || '--'}%
          </Text>
          <Text style={styles.healthMetricLabel}>SpO2</Text>
          <Text style={[styles.healthMetricPercentage, {color: '#10B981'}]}>
            {summaryData?.oxygenSaturation.percentage.toFixed(0) || '--'}%
          </Text>
        </TouchableOpacity>
      )}

      {/* Sleep */}
      {errors.sleep ? (
        <MetricErrorCard metric="sleep" />
      ) : (
        <TouchableOpacity 
          style={[styles.healthMetricCard, {backgroundColor: '#EEF2FF'}]}
          onPress={() => navigation.navigate('SleepScreen')}
        >
          <View style={styles.metricHeader}>
            <Icon name="moon" size={20} color="#6366F1" />
            <TouchableOpacity 
              onPress={() => showInfoDialog('sleep')}
              style={styles.infoButton}>
              <Icon name="information-circle-outline" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>
          <Text style={styles.healthMetricValue}>
            {summaryData
              ? `${Math.floor(summaryData.sleep.value)}h ${Math.round(
                  (summaryData.sleep.value % 1) * 60,
                )}m`
              : '--'}
          </Text>
          <Text style={styles.healthMetricLabel}>Sleep</Text>
          <Text style={[styles.healthMetricPercentage, {color: '#6366F1'}]}>
            {summaryData?.sleep.percentage.toFixed(0) || '--'}%
          </Text>
        </TouchableOpacity>
      )}

      {/* Total Calories */}
      {errors.totalCalories ? (
        <MetricErrorCard metric="totalCalories" />
      ) : (
        <TouchableOpacity 
          style={[styles.healthMetricCard, {backgroundColor: '#FFF7E6'}]}
          onPress={() => navigation.navigate('CaloriesScreen')}
        >
          <View style={styles.metricHeader}>
            <Icon name="nutrition" size={20} color="#FAAD14" />
            <TouchableOpacity 
              onPress={() => showInfoDialog('totalCalories')}
              style={styles.infoButton}>
              <Icon name="information-circle-outline" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>
          <Text style={styles.healthMetricValue}>
            {summaryData?.totalCalories.value.toFixed(0) || '--'}
          </Text>
          <Text style={styles.healthMetricLabel}>Total Calories</Text>
          <Text style={[styles.healthMetricPercentage, {color: '#FAAD14'}]}>
            {summaryData?.totalCalories.percentage.toFixed(0) || '--'}%
          </Text>
        </TouchableOpacity>
      )}
    </AnimatedView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedView
        entering={FadeInDown.delay(300).duration(500)}
        exiting={FadeOutDown.duration(300)}
        layout={Layout.springify()}>
        <HomeHeader navigation={navigation} />
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
            <TouchableOpacity onPress={() => navigation.navigate('HealthScoreDetail')}>
              <Icon
                name="ellipsis-horizontal-outline"
                size={16}
                color="#64748B"
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('HealthScoreDetail')}>
            <View style={styles.scoreCard}>
              <View style={[styles.scoreBox, {backgroundColor: healthScore ? getHealthScoreColor(healthScore.score) + '20' : '#E0E7FF'}]}>
                <Text style={[styles.scoreNumber, {color: healthScore ? getHealthScoreColor(healthScore.score) : '#4F46E5'}]}>
                  {healthScore?.score || '--'}
                </Text>
              </View>
              <View style={styles.scoreInfo}>
                <Text style={styles.scoreTitle}>
                  {healthScore?.scoreInfo?.scoreText || 'Loading...'}
                </Text>
                <Text style={styles.scoreDescription}>
                  {healthScore?.scoreInfo?.scoreMessage || 'Calculating your health score...'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </AnimatedView>

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
            {renderMainMetricsCard()}
            {renderHealthMetricsCards()}
          </>
        )}

        {/* Wellness and Goals */}
        <AnimatedView
          entering={FadeIn.delay(1200).duration(500)}
          exiting={FadeOut.duration(300)}
          layout={Layout.springify()}>
          <WellnessAndMedication navigation={navigation} />
        </AnimatedView>
      </ScrollView>

      {/* Common Dialog - Moved to root level */}
      <CommonDialog
        visible={infoDialogVisible}
        onClose={() => setInfoDialogVisible(false)}
        title={currentMetricInfo.title}
        content={<Text style={styles.dialogContent}>{currentMetricInfo.content}</Text>}
        actionButtons={[
          {
            label: 'Close',
            variant: 'contained',
            color: theme.colors.primaryDark,
            handler: () => setInfoDialogVisible(false),
          }
        ]}
      />
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreInfo: {
    marginLeft: 16,
    flex: 1,
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
  mainMetricsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mainMetricItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoButton: {
    marginLeft: 4,
  },
  mainMetricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  mainMetricLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  chip: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  healthMetricCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  healthMetricValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginVertical: 8,
  },
  healthMetricLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  healthMetricPercentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  dialogContent: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
});

export default HomeScreen;