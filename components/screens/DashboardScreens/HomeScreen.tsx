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
import {useNavigation} from '@react-navigation/native';

// Components
import HomeHeader from '../../HomeHeader';
import WellnessAndMedication from '../../WellnessAndMedication';
import CommonDialog from '../../commons/CommonDialog';
import HomeHealthScoreCard from './HomeHealthScoreCard';
import HomeHealthData from './HomeHealthData';
import HomeFunFactCard from './HomeFunFactCard';

// Utils
import {
  fetchSummaryRecord,
  handleSyncButtonPress,
} from '../../utils/utils_healthconnect';
import useAuthStore from '../../utils/useAuthStore';
import {useLoginStore} from '../../utils/useLoginStore';
import ToastUtil from '../../utils/utils_toast';

// Constants
import {theme} from '../../contants/theme';
import HomeExpertContactCard from './HomeExpertContactCard';
import CommunityNewsList from '../CommunityScreens/CommunityNewsList';

type MetricInfo = {
  title: string;
  content: string;
};

type SummaryDataItem = {
  value: number;
  percentage: number;
};

type SummaryData = {
  steps: SummaryDataItem;
  activeCalories: SummaryDataItem;
  distance: SummaryDataItem;
  heartRate: SummaryDataItem;
  oxygenSaturation: SummaryDataItem;
  sleep: SummaryDataItem;
  totalCalories: SummaryDataItem;
};

const METRIC_INFO = {
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
  running: {
    title: 'Running Time',
    content:
      'Running time is the total time you have spent running. It can help you track your fitness goals and improve your overall health.',
  },
};

const HomeScreen = () => {
  const navigation = useNavigation();
  const {token, loadToken} = useAuthStore();
  const {profile} = useLoginStore();

  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [healthScore, setHealthScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [infoDialogVisible, setInfoDialogVisible] = useState(false);
  const [currentMetricInfo, setCurrentMetricInfo] = useState<MetricInfo>({
    title: '',
    content: '',
  });
  const [syncMethodError, setSyncMethodError] = useState(false);
  const [healthConnectError, setHealthConnectError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const showInfoDialog = (metric: keyof MetricInfoMap) => {
    setCurrentMetricInfo(METRIC_INFO[metric]);
    setInfoDialogVisible(true);
  };

  const handleSyncPress = async () => {
    try {
      setRefreshing(true);
      setLoading(true);
      const result = await handleSyncButtonPress();

      if (result?.type === 'SYNC_METHOD_MISSING') {
        setSyncMethodError(true); //error involving missing SYNC_METHOD
      } else if (result?.type.includes('HEALTHCONNECT')) {
        setHealthConnectError(true); //error involving HEALTHCONNECT
      } else {
        setSyncMethodError(false);
        setHealthConnectError(false);
      }

      let summary = await fetchSummaryRecord();
      setSummaryData(summary.summaries);
      setHealthScore(summary.healthScore);
    } catch (error: any) {
      ToastUtil.error(
        'Sync failed',
        error.message || 'Failed to sync health data',
      );
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      await loadToken();
      await handleSyncPress();
    };

    loadInitialData();
  }, [loadToken]);

  const renderErrorBanner = (
    visible: boolean,
    message: string,
    buttonText: string,
    onPress: () => void,
  ) => {
    if (!visible) return null;

    return (
      <View style={styles.errorBanner}>
        <View style={styles.errorBannerContent}>
          <Icon name="warning" size={20} color="#FFF" />
          <Text style={styles.errorBannerText}>{message}</Text>
        </View>
        <TouchableOpacity onPress={onPress} style={styles.refreshButton}>
          <Text style={styles.errorBannerButtonText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <HomeHeader navigation={navigation} onSyncPress={handleSyncPress} />

      <ScrollView style={styles.scrollView}>
        {renderErrorBanner(
          syncMethodError,
          'Please select a sync method in Settings',
          'Go to Settings',
          () => navigation.navigate('SettingsDevicesScreen' as never),
        )}

        {renderErrorBanner(
          healthConnectError,
          'Health Connect syncing failed',
          'Install Health Connect',
          () => {},
        )}

        <HomeHealthScoreCard
          healthScore={healthScore}
          navigation={navigation}
        />
        <HomeHealthData
          summaryData={summaryData}
          errors={errors}
          loading={loading}
          navigation={navigation}
          showInfoDialog={showInfoDialog}
        />
        <HomeFunFactCard />
        <CommunityNewsList />
        <HomeExpertContactCard />
      </ScrollView>

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
  errorBannerButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 4,
  },
  refreshButton: {
    marginLeft: 16,
    padding: 4,
  },
});

export default HomeScreen;
