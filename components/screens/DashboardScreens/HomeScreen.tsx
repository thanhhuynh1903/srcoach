import React, {useCallback, useState, useEffect} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import HomeHeader from '../../HomeHeader';
import WellnessAndMedication from '../../WellnessAndMedication';
import {useNavigation} from '@react-navigation/native';
import useAuthStore from '../../utils/useAuthStore';
import {initializeHealthConnect, fetchSummaryRecord} from '../../utils/utils_healthconnect';
import {useLoginStore} from '../../utils/useLoginStore';
import CommonDialog from '../../commons/CommonDialog';
import HomeHealthScoreCard from './HomeHealthScoreCard';
import { theme } from '../../contants/theme';
import HomeHealthData from './HomeHealthData';
import HomeFunFactCard from './HomeFunFactCard';

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

const HomeScreen = () => {
  const navigation = useNavigation();
  const {token, loadToken} = useAuthStore();
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [healthScore, setHealthScore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const {profile} = useLoginStore();
  const [infoDialogVisible, setInfoDialogVisible] = useState(false);
  const [currentMetricInfo, setCurrentMetricInfo] = useState({
    title: '',
    content: '',
  });
  const [healthConnectError, setHealthConnectError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const metricInfo = {
    heartRate: {
      title: 'Heart Rate',
      content:
        'Your heart rate is the number of times your heart beats per minute. A normal resting heart rate for adults ranges from 60 to 100 beats per minute.',
    },
    steps: {
      title: 'Steps',
      content:
        'Steps count your daily physical activity. The recommended daily step count is 10,000 steps for general health benefits.',
    },
    distance: {
      title: 'Distance',
      content:
        'Distance shows how far you have walked or run. Tracking distance can help you monitor your physical activity levels.',
    },
    calories: {
      title: 'Active Calories',
      content:
        "Active calories are the calories you burn through physical activity. This doesn't include calories burned at rest (BMR).",
    },
    oxygenSaturation: {
      title: 'Oxygen Saturation',
      content:
        'Oxygen saturation (SpO2) measures how much oxygen your blood is carrying. Normal levels are typically between 95-100%.',
    },
    sleep: {
      title: 'Sleep',
      content:
        'Sleep duration and quality are essential for overall health. Adults typically need 7-9 hours of sleep per night.',
    },
    totalCalories: {
      title: 'Total Calories',
      content:
        'Total calories include both active calories burned through movement and calories burned at rest (BMR).',
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
  }, [loadToken]);

  const getHealthData = async () => {
    setLoading(true);
    setErrors({});
    setHealthConnectError(false);

    try {
      try {
        await initializeHealthConnect();
      } catch (hcError) {
        console.log('Health Connect initialization error:', hcError);
        setHealthConnectError(true);
      }

      const response = await fetchSummaryRecord();

      if (response && response.summaries && response.healthScore) {
        setSummaryData(response.summaries);
        setHealthScore(response.healthScore);
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
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getHealthData();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getHealthData();
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <HomeHeader navigation={navigation} />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Health Connect Error Banner */}
        {healthConnectError && (
          <View style={styles.errorBanner}>
            <View style={styles.errorBannerContent}>
              <Icon name="warning" size={20} color="#FFF" />
              <Text style={styles.errorBannerText}>
                Sync data from Health Connect failed
              </Text>
            </View>
            <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
              <Icon name="refresh" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Health Score */}
        <HomeHealthScoreCard healthScore={healthScore} navigation={navigation} />

        {/* Health Data */}
        <HomeHealthData
          summaryData={summaryData}
          errors={errors}
          loading={loading}
          navigation={navigation}
          showInfoDialog={showInfoDialog}
        />

        <HomeFunFactCard />

        {/* Wellness and Goals */}
        <WellnessAndMedication navigation={navigation} />
      </ScrollView>

      {/* Metric Info Dialog - rendered last to ensure proper z-index */}
      {infoDialogVisible && (
        <CommonDialog
          visible={infoDialogVisible}
          onClose={() => setInfoDialogVisible(false)}
          title={currentMetricInfo.title}
          content={
            <Text style={styles.dialogContent}>{currentMetricInfo.content}</Text>
          }
          actionButtons={[
            {
              label: 'Close',
              variant: 'contained',
              color: theme.colors.primaryDark,
              handler: () => setInfoDialogVisible(false),
            },
          ]}
        />
      )}
    </View>
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
  dialogContent: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  errorBanner: {
    backgroundColor: '#EF4444',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  errorBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  errorBannerText: {
    color: '#FFF',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  refreshButton: {
    marginLeft: 16,
    padding: 4,
  },
});

export default HomeScreen;