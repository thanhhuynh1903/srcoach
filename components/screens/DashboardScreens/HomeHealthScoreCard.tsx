import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import CommonDialog from '../../commons/CommonDialog';
import {theme} from '../../contants/theme';
import { wp } from '../../helpers/common';

interface HealthScoreData {
  score: number;
  scoreInfo: {
    scoreText: string;
    scoreMessage: string;
  };
}

const HomeHealthScoreCard = ({
  healthScore,
  navigation,
}: {
  healthScore: HealthScoreData | null;
  navigation: any;
}) => {
  const [infoDialogVisible, setInfoDialogVisible] = React.useState(false);

  const getHealthScoreColor = (score: number) => {
    if (score === 0) return '#64748B';
    if (score < 30) return '#EF4444';
    if (score < 50) return '#F97316';
    if (score < 70) return '#F59E0B';
    if (score < 85) return '#10B981';
    return '#3B82F6';
  };

  const scoreColor = healthScore
    ? getHealthScoreColor(healthScore.score)
    : '#4F46E5';

  return (
    <>
      <View style={styles.section}>
        <View style={styles.cardHeader}>
          <Text style={styles.sectionTitle}>Health Score</Text>
          <TouchableOpacity onPress={() => setInfoDialogVisible(true)}>
            <Icon name="help-circle-outline" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>
        <View style={styles.scoreCard}>
          <View
            style={[
              styles.scoreCircle,
              {
                backgroundColor: `${scoreColor}20`,
                borderColor: scoreColor,
              },
            ]}>
            <Text style={[styles.scoreNumber, {color: scoreColor}]}>
              {healthScore?.score || '--'}
            </Text>
          </View>
          <View style={styles.scoreInfo}>
            <Text style={styles.scoreTitle}>
              {healthScore?.scoreInfo?.scoreText || 'Loading...'}
            </Text>
            <Text style={styles.scoreDescription}>
              {healthScore?.scoreInfo?.scoreMessage ||
                'Calculating your health score...'}
            </Text>
          </View>
        </View>
      </View>

      <CommonDialog
        visible={infoDialogVisible}
        onClose={() => setInfoDialogVisible(false)}
        title="About Health Score"
        content={
          <View>
            <Text style={styles.dialogText}>
              Your Health Score is a comprehensive measure of your daily health
              metrics, calculated using:
            </Text>
            <View style={styles.metricList}>
              <Text style={styles.metricItem}>• Steps (20%)</Text>
              <Text style={styles.metricItem}>• Active Calories (15%)</Text>
              <Text style={styles.metricItem}>• Heart Rate (15%)</Text>
              <Text style={styles.metricItem}>• Oxygen Saturation (15%)</Text>
              <Text style={styles.metricItem}>• Sleep (15%)</Text>
              <Text style={styles.metricItem}>• Distance (10%)</Text>
              <Text style={styles.metricItem}>• Total Calories (10%)</Text>
            </View>
            <Text style={styles.dialogText}>
              The score ranges from 0-100, with daily targets based on health
              recommendations:
            </Text>
            <Text style={styles.dialogText}>
              - 10,000 steps, 500 active calories, 8km distance, 7-9 hours
              sleep, and normal vitals.
            </Text>
          </View>
        }
        actionButtons={[
          {
            label: 'Got it',
            variant: 'contained',
            color: theme.colors.primaryDark,
            handler: () => setInfoDialogVisible(false),
          },
        ]}
      />
    </>
  );
};

const styles = StyleSheet.create({
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  scoreCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
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
    marginBottom: 4,
  },
  scoreDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  chevron: {
    marginLeft: 8,
  },
  dialogText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 8,
  },
  metricList: {
    marginVertical: 8,
    marginLeft: 8,
  },
  metricItem: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },
});

export default HomeHealthScoreCard;
