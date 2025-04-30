import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import ContentLoader, {Rect, Circle} from 'react-content-loader/native';
import { theme } from '../../contants/theme';
import { wp } from '../../helpers/common';

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
  // Set consistent heights for all cards
  const CARD_HEIGHT = 120;
  const COMPACT_CARD_HEIGHT = 80;

  const MetricSkeleton = () => (
    <ContentLoader
      speed={1}
      width={wp(30)}
      height={CARD_HEIGHT}
      viewBox={`0 0 ${wp(30)} ${CARD_HEIGHT}`}
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
    };

    return (
      <View style={[styles.healthMetricCard, {height: CARD_HEIGHT}]}>
        <View style={styles.metricHeader}>
          <Icon name={metricInfo[metric]?.icon || 'warning'} size={20} color="#64748B" />
          <TouchableOpacity
            onPress={() => showInfoDialog(metric)}
            style={styles.infoButton}>
            <Icon
              name="information-circle-outline"
              size={16}
              color="#64748B"
            />
          </TouchableOpacity>
        </View>
        <Text style={[styles.healthMetricValue, {color: '#64748B'}]}>--</Text>
        <Text style={styles.healthMetricLabel}>
          {metricInfo[metric]?.title || metric}
        </Text>
      </View>
    );
  };

  const renderMainMetrics = () => (
    <View style={styles.mainMetricsContainer}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Daily stats</Text>
        </View>
      </View>
      <View style={styles.mainMetricsRow}>
        {/* Steps */}
        {errors.steps ? (
          <MetricErrorCard metric="steps" />
        ) : (
          <TouchableWithoutFeedback
            onPress={() => navigation.navigate('StepsScreen')}>
            <View style={[styles.compactMetricItem, {height: COMPACT_CARD_HEIGHT}]}>
              <View style={styles.compactMetricTopRow}>
                <Icon name="footsteps" size={20} color="#2563EB" />
                <Text style={styles.compactMetricValue}>
                  {summaryData?.steps.value.toLocaleString() || '--'}
                </Text>
              </View>
              <View style={styles.compactPercentageRow}>
                <View style={[styles.compactChip, {backgroundColor: '#EFF6FF'}]}>
                  <Text style={[styles.compactChipText, {color: '#2563EB'}]}>
                    {summaryData?.steps.percentage.toFixed(0) || '--'}%
                  </Text>
                </View>
              </View>
              <View style={styles.compactMetricBottomRow}>
                <Text style={styles.compactMetricLabel}>Steps</Text>
                <TouchableOpacity
                  onPress={() => showInfoDialog('steps')}
                  style={styles.infoButton}>
                  <Icon
                    name="information-circle-outline"
                    size={16}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        )}

        {/* Distance */}
        {errors.distance ? (
          <MetricErrorCard metric="distance" />
        ) : (
          <TouchableWithoutFeedback
            onPress={() => navigation.navigate('DistanceScreen')}>
            <View style={[styles.compactMetricItem, {height: COMPACT_CARD_HEIGHT}]}>
              <View style={styles.compactMetricTopRow}>
                <Icon name="walk" size={20} color="#11ac00" />
                <Text style={styles.compactMetricValue}>
                  {summaryData?.distance.value.toFixed(1) || '--'} km
                </Text>
              </View>
              <View style={styles.compactPercentageRow}>
                <View style={[styles.compactChip, {backgroundColor: "#e8fce6"}]}>
                  <Text style={[styles.compactChipText, {color: "#11ac00"}]}>
                    {summaryData?.distance.percentage.toFixed(0) || '--'}%
                  </Text>
                </View>
              </View>
              <View style={styles.compactMetricBottomRow}>
                <Text style={styles.compactMetricLabel}>Distance</Text>
                <TouchableOpacity
                  onPress={() => showInfoDialog('distance')}
                  style={styles.infoButton}>
                  <Icon
                    name="information-circle-outline"
                    size={16}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        )}

        {/* Calories */}
        {errors.activeCalories ? (
          <MetricErrorCard metric="calories" />
        ) : (
          <TouchableWithoutFeedback
            onPress={() => navigation.navigate('CaloriesScreen')}>
            <View style={[styles.compactMetricItem, {height: COMPACT_CARD_HEIGHT}]}>
              <View style={styles.compactMetricTopRow}>
                <Icon name="flame" size={20} color="#EF4444" />
                <Text style={styles.compactMetricValue}>
                  {summaryData?.activeCalories.value.toFixed(0) || '--'} cal
                </Text>
              </View>
              <View style={styles.compactPercentageRow}>
                <View style={[styles.compactChip, {backgroundColor: '#FEE2E2'}]}>
                  <Text style={[styles.compactChipText, {color: '#EF4444'}]}>
                    {summaryData?.activeCalories.percentage.toFixed(0) || '--'}%
                  </Text>
                </View>
              </View>
              <View style={styles.compactMetricBottomRow}>
                <Text style={styles.compactMetricLabel}>Calories</Text>
                <TouchableOpacity
                  onPress={() => showInfoDialog('calories')}
                  style={styles.infoButton}>
                  <Icon
                    name="information-circle-outline"
                    size={16}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        )}
      </View>
    </View>
  );

  const renderHealthMetrics = () => (
    <View style={styles.metricsGrid}>
      {/* Heart Rate */}
      {errors.heartRate ? (
        <MetricErrorCard metric="heartRate" />
      ) : (
        <TouchableWithoutFeedback
          onPress={() => navigation.navigate('HeartRateScreen')}>
          <View
            style={[styles.healthMetricCard, {height: CARD_HEIGHT, backgroundColor: '#FFF1F2'}]}>
            <View style={styles.metricHeader}>
              <Icon name="heart" size={20} color="#FF4D4F" />
              <TouchableOpacity
                onPress={() => showInfoDialog('heartRate')}
                style={styles.infoButton}>
                <Icon
                  name="information-circle-outline"
                  size={16}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.healthMetricValue}>
              {summaryData?.heartRate.value.toFixed(0) || '--'} bpm
            </Text>
            <Text style={styles.healthMetricLabel}>Heart Rate</Text>
          </View>
        </TouchableWithoutFeedback>
      )}

      {/* Oxygen Saturation */}
      {errors.oxygenSaturation ? (
        <MetricErrorCard metric="oxygenSaturation" />
      ) : (
        <TouchableWithoutFeedback
          onPress={() => navigation.navigate('SPo2Screen')}>
          <View
            style={[styles.healthMetricCard, {height: CARD_HEIGHT, backgroundColor: '#ECFDF5'}]}>
            <View style={styles.metricHeader}>
              <Icon name="water" size={20} color="#10B981" />
              <TouchableOpacity
                onPress={() => showInfoDialog('oxygenSaturation')}
                style={styles.infoButton}>
                <Icon
                  name="information-circle-outline"
                  size={16}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.healthMetricValue}>
              {summaryData?.oxygenSaturation.value.toFixed(0) || '--'}%
            </Text>
            <Text style={styles.healthMetricLabel}>SpO2</Text>
          </View>
        </TouchableWithoutFeedback>
      )}

      {/* Sleep */}
      {errors.sleep ? (
        <MetricErrorCard metric="sleep" />
      ) : (
        <TouchableWithoutFeedback
          onPress={() => navigation.navigate('SleepScreen')}>
          <View
            style={[styles.healthMetricCard, {height: CARD_HEIGHT, backgroundColor: '#EEF2FF'}]}>
            <View style={styles.metricHeader}>
              <Icon name="moon" size={20} color="#6366F1" />
              <TouchableOpacity
                onPress={() => showInfoDialog('sleep')}
                style={styles.infoButton}>
                <Icon
                  name="information-circle-outline"
                  size={16}
                  color="#64748B"
                />
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
          </View>
        </TouchableWithoutFeedback>
      )}

      {/* Total Calories */}
      {errors.totalCalories ? (
        <MetricErrorCard metric="totalCalories" />
      ) : (
        <TouchableWithoutFeedback
          onPress={() => navigation.navigate('CaloriesScreen')}>
          <View
            style={[styles.healthMetricCard, {height: CARD_HEIGHT, backgroundColor: '#FFF7E6'}]}>
            <View style={styles.metricHeader}>
              <Icon name="nutrition" size={20} color="#FAAD14" />
              <TouchableOpacity
                onPress={() => showInfoDialog('totalCalories')}
                style={styles.infoButton}>
                <Icon
                  name="information-circle-outline"
                  size={16}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.healthMetricValue}>
              {summaryData?.totalCalories.value.toFixed(0) || '--'}
            </Text>
            <Text style={styles.healthMetricLabel}>Total Calories</Text>
          </View>
        </TouchableWithoutFeedback>
      )}
    </View>
  );

  if (loading) {
    return (
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
  },
  sectionTitleContainer: {
    backgroundColor: theme.colors.primaryDark,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  mainMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  compactMetricItem: {
    flex: 1,
    paddingHorizontal: 8,
    justifyContent: 'space-between',
  },
  compactMetricTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  compactPercentageRow: {
    marginBottom: 4,
  },
  compactMetricBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactMetricValue: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 8,
    flex: 1,
  },
  compactMetricLabel: {
    fontSize: 14,
    color: '#64748B',
    marginRight: 4,
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
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoButton: {
    padding: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
    justifyContent: 'space-between',
  },
  healthMetricValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginVertical: 4,
  },
  healthMetricLabel: {
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
});

export default HomeHealthData;