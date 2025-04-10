import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import BackButton from '../BackButton';
import {PieChart} from 'react-native-gifted-charts';
import {useRoute, useNavigation} from '@react-navigation/native';
import useAiRiskStore from '../utils/useAiRiskStore';

// Hàm chuyển đổi màu dựa trên mức độ nghiêm trọng
const getSeverityColor = severity => {
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
const getLevelProgress = level => {
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
    console.log('Assessment data:', assessment);
    
    // Xóa dữ liệu đánh giá khi rời khỏi màn hình
    return () => clearAssessment();
  }, []);

  // Xử lý khi có lỗi
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackButton size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Risk Analysis</Text>
        </View>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={60} color="#EF4444" />
          <Text style={styles.errorText}>
            An error occurred while parsing data.
          </Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() =>
              activityData && evaluateActivityHealth(activityData)
            }>
            <Text style={styles.retryButtonText}>Retry</Text>
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

  // Tạo metrics từ risk_factors
  const heartRiskFactor = assessment.risk_factors.find(
    f =>
      f.name.toLowerCase().includes('nhịp tim') &&
      !f.name.toLowerCase().includes('thấp'),
  );

  const lowestHeartRiskFactor = assessment.risk_factors.find(
    f =>
      f.name.toLowerCase().includes('nhịp tim') &&
      f.name.toLowerCase().includes('thấp'),
  );

  const paceRiskFactor = assessment.risk_factors.find(f =>
    f.name.toLowerCase().includes('pace'),
  );

  const metrics = [
    {
      icon: 'heart-outline',
      value: activityData?.heart_rate_max ? activityData.heart_rate_max : assessment.heart_rate_max ,
      unit: ' BPM',
      status: heartRiskFactor ? heartRiskFactor.level : 'Normal',
      color: heartRiskFactor
        ? getSeverityColor(heartRiskFactor.level)
        : '#22C55E',
    },
    {
      icon: 'heart-half-outline',
      value: activityData?.heart_rate_min ? activityData.heart_rate_min : assessment.heart_rate_min,
      unit: ' BPM',
      status: lowestHeartRiskFactor ? lowestHeartRiskFactor.level : 'Normal',
      color: lowestHeartRiskFactor
        ? getSeverityColor(lowestHeartRiskFactor.level)
        : '#22C55E',
    },
    {
      icon: 'speedometer-outline',
      value: activityData?.avg_pace ? activityData.avg_pace : assessment.avg_pace  || '0:00',
      unit: '/km',
      status: paceRiskFactor ? paceRiskFactor.level : 'Normal',
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

      <ScrollView style={{flex: 1, backgroundColor: '#f9fafb'}}>
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
                    <Text style={styles.scoreValue}>
                      {assessment.score}
                      <Text style={styles.scoreMax}>/100</Text>
                    </Text>
                  </View>
                );
              }}
            />
          </View>
          <Text style={[styles.riskLevel, {color: severityColor}]}>
            {assessment.severity === 'Normal'
              ? 'Low risk'
              : `Risk ${assessment.severity}`}
          </Text>
          <Text style={styles.riskMessage}>{assessment.alert_message}</Text>
        </View>

        {/* Activity Info */}
        <View style={styles.activityInfoContainer}>
          <Text style={styles.activityName}>
            {assessment.alert_type || 'Hoạt động thể thao'}
          </Text>
          <View style={styles.activityStats}>
            <View style={styles.activityStat}>
              <Icon name="walk-outline" size={16} color="#64748B" />
              <Text style={styles.activityStatText}>
                {activityData?.distance || assessment?.distance || '0'} km
              </Text>
            </View>
            <View style={styles.activityStat}>
              <Icon name="footsteps-outline" size={16} color="#64748B" />
              <Text style={styles.activityStatText}>
                {activityData?.steps || assessment?.step ||  '0'} Steps
              </Text>
            </View>
          </View>
        </View>

        {/* Metrics */}
        <View style={styles.metricsContainer}>
          {metrics.map((metric, index) => (
            <View key={index} style={styles.metricItem}>
              <Icon name={metric.icon} size={24} color={metric.color} />
              <Text style={styles.metricValue}>
                {metric.value}
                <Text style={styles.metricUnit}>{metric.unit}</Text>
              </Text>
              <Text style={[styles.metricStatus, {color: metric.color}]}>
                {metric.status}
              </Text>
            </View>
          ))}
        </View>

        {/* Risk Factors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk factors</Text>
          <View
            style={{backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12}}>
            {assessment.risk_factors.map((factor, index) => (
              <View key={index} style={styles.riskFactor}>
                <View style={styles.riskFactorHeader}>
                  <Text style={styles.riskFactorTitle}>{factor.name}</Text>
                  <Text
                    style={[
                      styles.riskFactorStatus,
                      {color: getSeverityColor(factor.level)},
                    ]}>
                    {factor.level}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${getLevelProgress(factor.level) * 100}%`,
                        backgroundColor: getSeverityColor(factor.level),
                      },
                    ]}
                  />
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
              style={styles.saveButton}
              onPress={() => {
                // Thêm logic lưu báo cáo ở đây
                navigation.goBack();
              }}>
              <Text style={styles.saveButtonText}>Save report</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => navigation.goBack()}>
              <Text style={styles.deleteButtonText}>Return</Text>
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
    shadowOffset: {width: 0, height: 1},
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
    shadowOffset: {width: 0, height: 1},
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
    fontSize: 14,
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
    shadowOffset: {width: 0, height: 1},
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
  progressBar: {
    height: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
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
