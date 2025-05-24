import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import ContentLoader, {Rect, Circle} from 'react-content-loader/native';
import {theme} from '../../contants/theme';
import {wp} from '../../helpers/common';
import {PRIMARY_COLOR as STEP_PRIMARY_COLOR} from './RecordStepsScreen';
import {PRIMARY_COLOR as CALORIES_PRIMARY_COLOR} from './RecordCaloriesScreen';
import {PRIMARY_COLOR as HEART_RATE_PRIMARY_COLOR} from './RecordHeartRateScreen';
import {PRIMARY_COLOR as DISTANCE_PRIMARY_COLOR} from './RecordDistanceScreen';
import {PRIMARY_COLOR as SPO2_PRIMARY_COLOR} from './RecordSPo2Screen';
import {PRIMARY_COLOR as SLEEP_PRIMARY_COLOR} from './RecordSleepScreen';
import {LineChart} from 'react-native-gifted-charts';

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
    timeSeries: Array<{time: Date; value: number}>;
  };
  oxygenSaturation: {
    value: number;
    percentage: number;
    timeSeries: Array<{time: Date; value: number}>;
  };
  sleep: {
    value: number;
    percentage: number;
  };
  totalCalories: {
    value: number;
    percentage: number;
  };
  running: {
    totalTime: number;
  };
}

interface HomeHealthDataProps {
  summaryData: SummaryData | null;
  errors: Record<string, boolean>;
  loading: boolean;
  navigation: any;
  showInfoDialog: (metric: string) => void;
}

const HomeHealthData: React.FC<HomeHealthDataProps> = ({
  summaryData,
  errors,
  loading,
  navigation,
  showInfoDialog,
}) => {
  const CARD_HEIGHT = 120;
  const COMPACT_CARD_HEIGHT = 110;
  const { width: screenWidth } = Dimensions.get('window');
  const chartWidth = screenWidth * 0.4; // 40% of screen width

  const MetricSkeleton = () => (
    <ContentLoader
      speed={1}
      width={wp(45)}
      height={COMPACT_CARD_HEIGHT}
      viewBox={`0 0 ${wp(45)} ${COMPACT_CARD_HEIGHT}`}
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb">
      <Circle cx="25" cy="25" r="20" />
      <Rect x="0" y="55" rx="4" ry="4" width="100%" height="24" />
      <Rect x="0" y="90" rx="4" ry="4" width="60%" height="16" />
    </ContentLoader>
  );

  const MetricErrorCard = ({metric}: {metric: string}) => {
    const metricInfo = {
      heartRate: {title: 'Heart Rate', icon: 'heart'},
      steps: {title: 'Steps', icon: 'footsteps'},
      distance: {title: 'Distance', icon: 'walk'},
      calories: {title: 'Active Calories', icon: 'flame'},
      oxygenSaturation: {title: 'SpO2', icon: 'water'},
      sleep: {title: 'Sleep', icon: 'moon'},
      totalCalories: {title: 'Total Calories', icon: 'nutrition'},
      running: {title: 'Running Time', icon: 'timer'},
    };

    return (
      <View style={[styles.compactMetricItem, {height: COMPACT_CARD_HEIGHT, backgroundColor: '#f8fafc'}]}>
        <View style={styles.metricHeader}>
          <Icon
            name={metricInfo[metric]?.icon || 'warning'}
            size={20}
            color="#64748B"
          />
          <TouchableOpacity
            onPress={() => showInfoDialog(metric)}
            style={styles.infoButton}>
            <Icon
              name="information-circle"
              size={16}
              color="#64748B"
            />
          </TouchableOpacity>
        </View>
        <Text style={[styles.compactMetricValue, {color: '#64748B'}]}>--</Text>
        <Text style={styles.compactMetricLabel}>
          {metricInfo[metric]?.title || metric}
        </Text>
      </View>
    );
  };

  const renderMiniChart = (
    data: Array<{time: Date; value: number}>,
    color: string,
  ) => {
    if (!data || data.length === 0) return null;

    const lineData = data.map((item, index) => ({
      value: item.value,
      label: index.toString(),
      hideDataPoint: true,
    }));

    return (
      <View style={[styles.chartContainer, {width: chartWidth}]}>
        <LineChart
          data={lineData}
          width={chartWidth}
          height={60}
          color={color}
          thickness={3}
          hideRules
          hideYAxisText
          hideAxesAndRules
          isAnimated
          curved
          areaChart
          startFillColor={`${color}20`}
          endFillColor={`${color}01`}
          startOpacity={0.2}
          endOpacity={0}
          initialSpacing={0}
          spacing={chartWidth / lineData.length}
          backgroundColor="transparent"
          noOfSections={0}
          yAxisColor="transparent"
          xAxisColor="transparent"
        />
      </View>
    );
  };

  const renderMainMetrics = () => (
    <View style={styles.mainMetricsContainer}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Daily Activity</Text>
        </View>
      </View>
      <View style={styles.mainMetricsGrid}>
        {errors.steps ? (
          <MetricErrorCard metric="steps" />
        ) : (
          <TouchableWithoutFeedback
            onPress={() => navigation.navigate('StepsScreen')}>
            <View
              style={[
                styles.compactMetricItem,
                {
                  height: COMPACT_CARD_HEIGHT,
                  borderLeftColor: STEP_PRIMARY_COLOR,
                  backgroundColor: `${STEP_PRIMARY_COLOR}15`,
                },
              ]}>
              <View style={styles.metricHeader}>
                <Icon name="footsteps" size={20} color={STEP_PRIMARY_COLOR} />
                <TouchableOpacity
                  onPress={() => showInfoDialog('steps')}
                  style={styles.infoButton}>
                  <Icon
                    name="information-circle"
                    size={16}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
              <View
                style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                <Text
                  style={[
                    styles.compactMetricValue,
                    {color: STEP_PRIMARY_COLOR},
                  ]}>
                  {summaryData?.steps.value.toLocaleString() || '--'}
                </Text>
                <View style={styles.compactPercentageRow}>
                  <View
                    style={[
                      styles.compactChip,
                      {backgroundColor: `${STEP_PRIMARY_COLOR}15`},
                    ]}>
                    <Text
                      style={[
                        styles.compactChipText,
                        {color: STEP_PRIMARY_COLOR},
                      ]}>
                      {summaryData?.steps.percentage.toFixed(0) || '--'}%
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={styles.compactMetricLabel}>Steps</Text>
            </View>
          </TouchableWithoutFeedback>
        )}

        {errors.distance ? (
          <MetricErrorCard metric="distance" />
        ) : (
          <TouchableWithoutFeedback
            onPress={() => navigation.navigate('DistanceScreen')}>
            <View
              style={[
                styles.compactMetricItem,
                {
                  height: COMPACT_CARD_HEIGHT,
                  borderLeftColor: DISTANCE_PRIMARY_COLOR,
                  backgroundColor: `${DISTANCE_PRIMARY_COLOR}15`,
                },
              ]}>
              <View style={styles.metricHeader}>
                <Icon name="walk" size={20} color={DISTANCE_PRIMARY_COLOR} />
                <TouchableOpacity
                  onPress={() => showInfoDialog('distance')}
                  style={styles.infoButton}>
                  <Icon
                    name="information-circle"
                    size={16}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
              <View
                style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                <Text
                  style={[
                    styles.compactMetricValue,
                    {color: DISTANCE_PRIMARY_COLOR},
                  ]}>
                  {summaryData?.distance.value.toFixed(1) || '--'} km
                </Text>
                <View style={styles.compactPercentageRow}>
                  <View
                    style={[
                      styles.compactChip,
                      {backgroundColor: `${DISTANCE_PRIMARY_COLOR}15`},
                    ]}>
                    <Text
                      style={[
                        styles.compactChipText,
                        {color: DISTANCE_PRIMARY_COLOR},
                      ]}>
                      {summaryData?.distance.percentage.toFixed(0) || '--'}%
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={styles.compactMetricLabel}>Distance</Text>
            </View>
          </TouchableWithoutFeedback>
        )}

        {errors.activeCalories ? (
          <MetricErrorCard metric="calories" />
        ) : (
          <TouchableWithoutFeedback
            onPress={() => navigation.navigate('CaloriesScreen')}>
            <View
              style={[
                styles.compactMetricItem,
                {
                  height: COMPACT_CARD_HEIGHT,
                  borderLeftColor: CALORIES_PRIMARY_COLOR,
                  backgroundColor: `${CALORIES_PRIMARY_COLOR}15`,
                },
              ]}>
              <View style={styles.metricHeader}>
                <Icon name="flame" size={20} color={CALORIES_PRIMARY_COLOR} />
                <TouchableOpacity
                  onPress={() => showInfoDialog('calories')}
                  style={styles.infoButton}>
                  <Icon
                    name="information-circle"
                    size={16}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
              <View
                style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                <Text
                  style={[
                    styles.compactMetricValue,
                    {color: CALORIES_PRIMARY_COLOR},
                  ]}>
                  {summaryData?.activeCalories.value.toFixed(0) || '--'} cal
                </Text>
                <View style={styles.compactPercentageRow}>
                  <View
                    style={[
                      styles.compactChip,
                      {backgroundColor: `${CALORIES_PRIMARY_COLOR}15`},
                    ]}>
                    <Text
                      style={[
                        styles.compactChipText,
                        {color: CALORIES_PRIMARY_COLOR},
                      ]}>
                      {summaryData?.activeCalories.percentage.toFixed(0) ||
                        '--'}
                      %
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={styles.compactMetricLabel}>Active Calories</Text>
            </View>
          </TouchableWithoutFeedback>
        )}

        {errors.running ? (
          <MetricErrorCard metric="running" />
        ) : (
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.compactMetricItem,
                {
                  height: COMPACT_CARD_HEIGHT,
                  borderLeftColor: '#3B82F6',
                  backgroundColor: '#3B82F610',
                },
              ]}>
              <View style={styles.metricHeader}>
                <Icon name="timer" size={20} color="#3B82F6" />
                <TouchableOpacity
                  onPress={() => showInfoDialog('running')}
                  style={styles.infoButton}>
                  <Icon
                    name="information-circle"
                    size={16}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
              <Text style={[styles.compactMetricValue, {color: '#3B82F6'}]}>
                {summaryData?.running?.totalTime
                  ? `${Math.floor(
                      summaryData.running?.totalTime / 60,
                    )}h ${Math.floor(summaryData.running?.totalTime % 60)}m`
                  : '--'}
              </Text>
              <Text style={styles.compactMetricLabel}>Running Time</Text>
            </View>
          </TouchableWithoutFeedback>
        )}
      </View>
    </View>
  );

  const renderHealthMetrics = () => (
    <View style={styles.healthMetricsContainer}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Health Metrics</Text>
        </View>
      </View>

      {errors.heartRate ? (
        <View style={[styles.healthMetricCard, {height: CARD_HEIGHT, backgroundColor: '#f8fafc'}]}>
          <MetricErrorCard metric="heartRate" />
        </View>
      ) : (
        <TouchableWithoutFeedback
          onPress={() => navigation.navigate('HeartRateScreen')}>
          <View
            style={[
              styles.healthMetricCard,
              {
                height: CARD_HEIGHT,
                borderLeftColor: HEART_RATE_PRIMARY_COLOR,
                borderLeftWidth: 5,
                backgroundColor: `${HEART_RATE_PRIMARY_COLOR}15`,
              },
            ]}>
            <View style={styles.healthMetricHeader}>
              <Icon name="heart" size={20} color={HEART_RATE_PRIMARY_COLOR} />
              <TouchableOpacity
                onPress={() => showInfoDialog('heartRate')}
                style={styles.infoButton}>
                <Icon
                  name="information-circle"
                  size={16}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.healthMetricContent}>
              <View style={styles.healthMetricText}>
                <Text
                  style={[
                    styles.healthMetricValue,
                    {color: HEART_RATE_PRIMARY_COLOR},
                  ]}>
                  {summaryData?.heartRate.value.toFixed(0) || '--'} bpm
                </Text>
                <Text style={styles.healthMetricLabel}>Heart Rate</Text>
              </View>
              {renderMiniChart(
                summaryData?.heartRate.timeSeries || [],
                HEART_RATE_PRIMARY_COLOR,
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      )}

      {errors.oxygenSaturation ? (
        <View
          style={[
            styles.healthMetricCard,
            {height: CARD_HEIGHT, backgroundColor: '#f8fafc'},
          ]}>
          <MetricErrorCard metric="oxygenSaturation" />
        </View>
      ) : (
        <TouchableWithoutFeedback
          onPress={() => navigation.navigate('SPo2Screen')}>
          <View
            style={[
              styles.healthMetricCard,
              {
                height: CARD_HEIGHT,
                borderLeftColor: SPO2_PRIMARY_COLOR,
                borderLeftWidth: 5,
                backgroundColor: `${SPO2_PRIMARY_COLOR}15`,
              },
            ]}>
            <View style={styles.healthMetricHeader}>
              <Icon name="water" size={20} color={SPO2_PRIMARY_COLOR} />
              <TouchableOpacity
                onPress={() => showInfoDialog('oxygenSaturation')}
                style={styles.infoButton}>
                <Icon
                  name="information-circle"
                  size={16}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.healthMetricContent}>
              <View style={styles.healthMetricText}>
                <Text
                  style={[
                    styles.healthMetricValue,
                    {color: SPO2_PRIMARY_COLOR},
                  ]}>
                  {summaryData?.oxygenSaturation.value.toFixed(0) || '--'}%
                </Text>
                <Text style={styles.healthMetricLabel}>SpO2</Text>
              </View>
              {renderMiniChart(
                summaryData?.oxygenSaturation.timeSeries || [],
                SPO2_PRIMARY_COLOR,
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      )}

      {errors.sleep ? (
        <View style={[styles.healthMetricCard, {height: CARD_HEIGHT, backgroundColor: '#f8fafc'}]}>
          <MetricErrorCard metric="sleep" />
        </View>
      ) : (
        <TouchableWithoutFeedback
          onPress={() => navigation.navigate('SleepScreen')}>
          <View
            style={[
              styles.healthMetricCard,
              {
                height: CARD_HEIGHT,
                borderLeftColor: SLEEP_PRIMARY_COLOR,
                borderLeftWidth: 5,
                backgroundColor: `${SLEEP_PRIMARY_COLOR}15`,
              },
            ]}>
            <View style={styles.healthMetricHeader}>
              <Icon name="moon" size={20} color={SLEEP_PRIMARY_COLOR} />
              <TouchableOpacity
                onPress={() => showInfoDialog('sleep')}
                style={styles.infoButton}>
                <Icon
                  name="information-circle"
                  size={16}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.healthMetricContent}>
              <View style={styles.healthMetricText}>
                <Text style={[styles.healthMetricValue, {color: SLEEP_PRIMARY_COLOR}]}>
                  {summaryData
                    ? `${Math.floor(summaryData.sleep.value)}h ${Math.round(
                        (summaryData.sleep.value % 1) * 60,
                      )}m`
                    : '--'}
                </Text>
                <Text style={styles.healthMetricLabel}>Sleep</Text>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.skeletonContainer}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Daily Activity</Text>
          </View>
        </View>
        <View style={styles.mainMetricsGrid}>
          <MetricSkeleton />
          <MetricSkeleton />
          <MetricSkeleton />
          <MetricSkeleton />
        </View>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Health Metrics</Text>
          </View>
        </View>
        <View style={styles.healthMetricsContainer}>
          <View style={[styles.healthMetricCard, {height: CARD_HEIGHT}]}>
            <MetricSkeleton />
          </View>
          <View style={[styles.healthMetricCard, {height: CARD_HEIGHT}]}>
            <MetricSkeleton />
          </View>
          <View style={[styles.healthMetricCard, {height: CARD_HEIGHT}]}>
            <MetricSkeleton />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderMainMetrics()}
      {renderHealthMetrics()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  mainMetricsContainer: {
    marginBottom: 16,
  },
  mainMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 9,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
    marginBottom: 8,
  },
  sectionTitleContainer: {
    backgroundColor: theme.colors.primaryDark,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  compactMetricItem: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  healthMetricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoButton: {
    padding: 4,
  },
  compactMetricValue: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  compactMetricLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  compactPercentageRow: {
    marginBottom: 8,
  },
  compactChip: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  compactChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  healthMetricCard: {
    width: '100%',
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
  },
  healthMetricContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  healthMetricText: {
    flex: 1,
  },
  healthMetricValue: {
    fontSize: 22,
    fontWeight: '700',
    marginVertical: 4,
  },
  healthMetricLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  chartContainer: {
    height: 60,
    backgroundColor: 'transparent',
  },
  skeletonContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  healthMetricsContainer: {
    marginBottom: 16,
  },
});

export default HomeHealthData;