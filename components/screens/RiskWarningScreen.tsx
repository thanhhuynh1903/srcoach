import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import BackButton from '../BackButton';
import { PieChart } from 'react-native-gifted-charts';
import { useRoute, useNavigation } from '@react-navigation/native';
import useAiRiskStore from '../utils/useAiRiskStore';
import CommonDialog from '../commons/CommonDialog';
import { set } from 'date-fns';
import { isExerciseRunning } from '../contants/exerciseType';
// Hàm chuyển đổi màu dựa trên mức độ nghiêm trọng
const getSeverityColor = (severity: any) => {
  switch (severity?.toLowerCase()) {
    case 'high':
      return '#EF4444'; // Đỏ
    case 'moderate':
      return '#F97316'; // Cam
    case 'low':
      return '#22C55E'; // Xanh lá
    case 'normal':
      return '#22C55E'; // Xanh lá
    default:
      return '#3B82F6'; // Xanh dương (mặc định)
  }
};

// Hàm lấy giá trị tiến trình dựa trên mức độ
const getLevelProgress = (level: any) => {
  switch (level?.toLowerCase()) {
    case 'high':
      return 0.9;
    case 'moderate':
      return 0.6;
    case 'low':
    case 'normal':
      return 0.3;
    default:
      return 0.5;
  }
};

// Hàm dịch mức độ nghiêm trọng sang tiếng Việt

const RiskWarningScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);
  const activityData = route.params?.params?.userActivity;
  const alertId = route.params?.alertId;

  // Sử dụng zustand store
  const {
    assessment,
    isLoading,
    error,
    evaluateActivityHealth,
    fetchHealthAlertDetail,
    clearAssessment,
    message,
  } = useAiRiskStore();

  // Gọi API đánh giá khi màn hình được tải
  useEffect(() => {
    if (activityData) {
      console.log('Activity data received:', activityData);
      evaluateActivityHealth(activityData);
    } else if (alertId) {
      console.log('Alert ID received:', alertId);
      fetchHealthAlertDetail(alertId);
    } else {
      console.error('Không có dữ liệu hoạt động hoặc ID cảnh báo');
    }

    return () => clearAssessment();
  }, []);

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <BackButton
            size={24}
            onBtnPress={() => {
              console.log('Back button pressed');
              navigation.navigate('HomeTabs', {
                screen: 'Risk',
                params: { screen: 'HomeMain' },
              });
            }}
          />
          <Text style={styles.headerTitle}>Risk Analysis</Text>
        </View>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={60} color="#EF4444" />
          <Text style={styles.errorText}>
            An error occurred while parsing data.
          </Text>
          <Text style={styles.errorMessage}>{message}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Hiển thị màn hình loading
  if (isLoading || !assessment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackButton size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Risk Analysis</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={styles.loadingText}>Analyzing activity data...</Text>
          <Text style={styles.loadingSubText}>
            AI systems are assessing risk factors
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Lấy màu dựa trên mức độ nghiêm trọng
  const severityColor = getSeverityColor(assessment.severity);

  // Tạo dữ liệu cho biểu đồ tròn
  const pieChartData = [
    {
      value: parseInt(assessment.score) || 0,
      color: severityColor,
    },
    {
      value: 100 - (parseInt(assessment.score) || 0),
      color: '#F1F5F9',
    },
  ];
  const Confirm = [
    {
      label: 'OK',
      color: '#1E3A8A',
      variant: 'contained',
      handler: () => setShowLogoutDialog(false),
      iconName: 'log-out-outline',
    },
  ];
  // Tạo metrics từ risk_factors
  const heartRiskFactor = assessment.risk_factors.find(
    f =>
      f.name.toLowerCase().includes('Heart Rate') &&
      !f.name.toLowerCase().includes('Low'),
  );
  console.log('Heart Risk Factor:', assessment.risk_factors);

  const lowestHeartRiskFactor = assessment.risk_factors.find(
    f =>
      f.name.toLowerCase().includes('Heart Rate') &&
      f.name.toLowerCase().includes('Low'),
  );

  const paceRiskFactor = assessment.risk_factors.find(f =>
    f.name.toLowerCase().includes('pace'),
  );
  console.log('Pace Risk Factor:', paceRiskFactor);

  const metrics = [
    {
      icon: 'heart-outline',
      value: activityData?.heart_rate_max
        ? activityData.heart_rate_max
        : assessment.heart_rate_max,
      unit: ' BPM',
      status: 'Heart rate Max',
      color: heartRiskFactor
        ? getSeverityColor(heartRiskFactor.level)
        : '#22C55E',
    },
    {
      icon: 'heart-half-outline',
      value: activityData?.heart_rate_min
        ? activityData.heart_rate_min
        : assessment.heart_rate_min,
      unit: ' BPM',
      status: "Hear rate Min",
      color: lowestHeartRiskFactor
        ? getSeverityColor(lowestHeartRiskFactor.level)
        : '#22C55E',
    },
    {
      icon: 'speedometer-outline',
      value: activityData?.avg_pace
        ? activityData.avg_pace
        : assessment.pace || '0:00',
      unit: '/km',
      status: 'Pace',
      color: paceRiskFactor
        ? getSeverityColor(paceRiskFactor.level)
        : '#22C55E',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Risk Analysis</Text>
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        {/* Risk Score */}
        <View style={styles.riskScoreContainer}>
          <View style={styles.riskScore}>
            <PieChart
              donut
              radius={60}
              innerRadius={48}
              data={pieChartData}
              centerLabelComponent={() => {
                return (
                  <View style={styles.centerLabel}>
                    <Text style={styles.scoreValue}>{assessment.score} </Text>
                    <Text style={styles.scoreMax}>/100</Text>
                  </View>
                );
              }}
            />
          </View>
          <Text style={[styles.riskLevel, { color: severityColor }]}>
            {assessment.severity === 'Normal'
              ? 'Low risk'
              : `Risk ${assessment.severity}`}
          </Text>
          <Text style={styles.riskMessage}>{assessment.alert_message}</Text>
        </View>
        {/* Heart Rate Danger Warning */}
        {assessment.heart_rate_danger && (
          <View style={styles.dangerWarningContainer}>
            <View style={styles.dangerHeader}>
              <Icon name="warning-outline" size={24} color="#92400E" />
              <Text style={styles.dangerTitle}>Dangerous heart rate zone</Text>
            </View>
            <Text style={styles.dangerValue}>
              <Icon name="fitness" size={24} color="#FF5252" />
              <Text>{assessment.heart_rate_danger}</Text>
              <Text style={styles.dangerUnit}> BPM</Text>
            </Text>
            <Text style={styles.dangerDescription}>
              Your heart rate exceeding this level is potentially dangerous during this activity.
              Activity. Consider consulting a healthcare professional.
            </Text>
          </View>
        )}
        {/* Activity Info */}
        <View style={styles.activityInfoContainer}>
          <Text style={styles.activityName}>
            {assessment.alert_type || 'ACTIVITY ALERT'}
          </Text>
          <View style={styles.activityStats}>
            <View style={styles.activityStat}>
              <Icon name="walk-outline" size={16} color="#64748B" />
              <Text style={styles.activityStatText}>
                {activityData?.distance?.toFixed(2) ||
                  assessment?.distance?.toFixed(2) ||
                  '0'}{' '}
                km
              </Text>
            </View>
            <View style={styles.activityStat}>
              <Icon name="footsteps-outline" size={16} color="#64748B" />
              <Text style={styles.activityStatText}>
                {activityData?.steps || assessment?.step || '0'} Steps
              </Text>
            </View>
          </View>
        </View>

        {/* Metrics */}
        <View style={styles.metricsContainer}>
          {metrics.map((metric, index) => (
            console.log(`Metric ${index + 1}:`, metric),
            <View key={index} style={styles.metricItem}>
              <Icon name={metric.icon as any} size={24} color={metric.color} />
              <Text style={styles.metricValue}>
                {metric.value}
                <Text style={styles.metricUnit}>{metric.unit}</Text>
              </Text>
              <Text style={[styles.metricStatus, { color: metric.color }]}>
                {metric.status}
              </Text>
            </View>
          ))}
        </View>

        {/* Risk Factors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk factors</Text>
          <View
            style={{ backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12 }}>
            {assessment.risk_factors.map((factor, index) => (
              <View key={index} style={styles.riskFactor}>
                <View style={styles.riskFactorHeader}>
                  <Text style={styles.riskFactorTitle}>{factor.name}</Text>
                  <Text
                    style={[
                      styles.riskFactorStatus,
                      { color: getSeverityColor(factor.level) },
                    ]}>
                    {factor.level}
                  </Text>
                </View>
                <View style={styles.progressBarGroup}>
                  <View style={styles.progressBarSegmentContainer}>
                    {/* Low */}
                    <View
                      style={[
                        styles.progressBarBlock,
                        {
                          width: '34%',
                          backgroundColor:
                            ['low', 'normal', 'moderate', 'high'].includes(factor.level.toLowerCase())
                              ? '#22C55E'
                              : '#E5E7EB',
                          borderTopLeftRadius: 5,
                          borderBottomLeftRadius: 5,
                        },
                      ]}
                    />
                    {/* Moderate */}
                    <View
                      style={[
                        styles.progressBarBlock,
                        {
                          width: '33%',
                          backgroundColor:
                            ['moderate', 'high'].includes(factor.level.toLowerCase())
                              ? '#F97316'
                              : '#E5E7EB',
                        },
                      ]}
                    />
                    {/* High */}
                    <View
                      style={[
                        styles.progressBarBlock,
                        {
                          width: '33%',
                          backgroundColor:
                            factor.level.toLowerCase() === 'high'
                              ? '#EF4444'
                              : '#E5E7EB',
                          borderTopRightRadius: 5,
                          borderBottomRightRadius: 5,
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.progressBarLabels}>
                    <Text style={[styles.progressBarLabel, { color: '#22C55E', width: '33%', textAlign: 'left' }]}>Low</Text>
                    <Text style={[styles.progressBarLabel, { color: '#F97316', width: '33%', textAlign: 'center' }]}>Moderate</Text>
                    <Text style={[styles.progressBarLabel, { color: '#EF4444', width: '33%', textAlign: 'right' }]}>High</Text>
                  </View>
                </View>
                <Text style={styles.riskFactorDescription}>
                  {factor.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendation</Text>
          <View
            style={{
              padding: 16,
              gap: 8,
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
            }}>
            {assessment.recommendations.map((recommendation, index) => (
              <View key={index} style={styles.recommendation}>
                <Icon
                  name={
                    index % 3 === 0
                      ? 'speedometer-outline'
                      : index % 3 === 1
                        ? 'heart-outline'
                        : 'walk-outline'
                  }
                  size={24}
                  color="#3B82F6"
                />
                <Text style={styles.recommendationText}>{recommendation}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        {activityData && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => {
                navigation.navigate('HomeTabs', {
                  screen: 'Risk',
                  params: { screen: 'HomeMain' },
                });
              }}>
              <Text style={styles.deleteButtonText}>
                Return list of risk warning
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  dangerWarningContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FEF3C7', // Màu vàng nhạt
    borderLeftWidth: 4,
    borderLeftColor: '#D97706', // Màu vàng đậm
    borderRadius: 12,
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#FCD34D', // Màu vàng cam
    padding: 8,
    borderRadius: 8,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E', // Màu nâu vàng
    marginLeft: 8,
  },
  dangerValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#B45309', // Màu vàng đậm
    marginBottom: 8,
  },
  dangerDescription: {
    fontSize: 14,
    color: '#B45309', // Màu vàng đậm
    lineHeight: 20,
  },


  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
    textAlign: 'center',
  },
  loadingSubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  errorMessage: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: '#1E3A8A',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  riskScoreContainer: {
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  riskScore: {
    marginBottom: 16,
    alignItems: 'center',
  },
  centerLabel: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
  },
  scoreMax: {
    fontSize: 16,
    color: '#64748B',
  },
  riskLevel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  riskMessage: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  activityInfoContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  activityName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  activityStats: {
    flexDirection: 'row',
    gap: 16,
  },
  activityStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activityStatText: {
    fontSize: 16,
    color: '#64748B',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  metricItem: {
    alignItems: 'center',
    gap: 4,
    padding: 12,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  metricUnit: {
    fontSize: 14,
    color: '#64748B',
  },
  metricStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  riskFactor: {
    marginBottom: 16,
  },
  riskFactorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  riskFactorTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
  },
  riskFactorStatus: {
    fontSize: 18,
    fontWeight: '500',
  },
  progressBarGroup: {
    marginVertical: 8,
  },
  progressBarSegmentContainer: {
    flexDirection: 'row',
    height: 10,
    marginBottom: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarBlock: {
    height: 10,
  },
  progressBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  progressBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressIndicator: {
    position: 'absolute',
    top: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 2,
  },

  riskFactorDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  recommendation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  deleteButtonText: {
    color: '#4A4A4A',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RiskWarningScreen;
