import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import BackButton from '../BackButton';
import { PieChart } from "react-native-gifted-charts";

const metrics = [
  {
    icon: 'heart-outline',
    value: '165',
    unit: ' BPM',
    status: 'Above normal',
    color: '#EF4444',
  },
  {
    icon: 'speedometer-outline',
    value: '4:15',
    unit: ' /km',
    status: 'Inconsistent',
    color: '#F97316',
  },
  {
    icon: 'thermometer-outline',
    value: '28°',
    unit: ' Celsius',
    status: 'High temp',
    color: '#EAB308',
  },
];

const riskFactors = [
  {
    title: 'Cardiovascular Load',
    status: 'High',
    progress: 0.9,
    color: '#EF4444',
    description: 'Heart rate has been elevated for an extended period',
  },
  {
    title: 'Dehydration Risk',
    status: 'Moderate',
    progress: 0.6,
    color: '#F97316',
    description: 'Consider increasing fluid intake',
  },
  {
    title: 'Fatigue Level',
    status: 'Normal',
    progress: 0.3,
    color: '#22C55E',
    description: 'Current fatigue levels are within acceptable range',
  },
];

const recommendations = [
  {
    icon: 'pause',
    text: 'Take a 5-minute break',
  },
  {
    icon: 'speedometer-outline',
    text: 'Drink 300ml of water',
  },
  {
    icon: 'water-outline',
    text: 'Reduce pace by 30 seconds/km',
  },
];

const RiskWarningScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
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
      data={[
        {
          value: 78,
          color: '#F97316',
        },
        {
          value: 22,
          color: '#F1F5F9',
        },
      ]}
      centerLabelComponent={() => {
        return (
          <View style={styles.centerLabel}>
            <Text style={styles.scoreValue}>
              78<Text style={styles.scoreMax}>/100</Text>
            </Text>
          </View>
        );
      }}
    />
  </View>
  <Text style={styles.riskLevel}>Moderate Risk</Text>
  <Text style={styles.riskMessage}>
    Your current activity shows elevated risk factors. Consider
    adjusting your pace.
  </Text>
</View>

        {/* Metrics */}
        <View style={styles.metricsContainer}>
          {metrics.map((metric, index) => (
            <View key={index} style={styles.metricItem}>
              <Icon name={metric.icon as any} size={24} color={metric.color} />
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
          <Text style={styles.sectionTitle}>Risk Factors</Text>
          <View
            style={{backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12}}>
            {riskFactors.map((factor, index) => (
              <View key={index} style={styles.riskFactor}>
                <View style={styles.riskFactorHeader}>
                  <Text style={styles.riskFactorTitle}>{factor.title}</Text>
                  <Text
                    style={[styles.riskFactorStatus, {color: factor.color}]}>
                    {factor.status}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${factor.progress * 100}%`,
                        backgroundColor: factor.color,
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
          <Text style={styles.sectionTitle}>Recommendations</Text>
          <View style={{padding: 16,gap:8}}>
          {recommendations.map((recommendation, index) => (
            <View key={index} style={styles.recommendation}>
              <Icon
                name={recommendation.icon as any}
                size={24}
                color="#3B82F6"
              />
              <Text style={styles.recommendationText}>
                {recommendation.text}
              </Text>
            </View>
          ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
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
  content: {
    flex: 1,
  },
  riskScoreContainer: {
    marginHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
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
    fontSize: 32,
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
    color: '#F97316',
    marginBottom: 8,
  },
  riskMessage: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  metricItem: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    gap: 4,
    padding: 16,
    borderRadius: 12,
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
    fontSize: 18,
    color: '#000000',
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
