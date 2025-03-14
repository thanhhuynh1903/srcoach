import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {PieChart} from 'react-native-gifted-charts';

const HealthMetrics = () => {
  // Dummy data for charts
  const heartRateData = {
    labels: ['', '', '', '', ''],
    datasets: [
      {
        data: [65, 78, 69, 90, 78.2],
      },
    ],
  };

  const sleepData = [
    {
      value: 25, // Progress (25%)
      color: '#A855F7', // Purple color
    },
    {
      value: 75, // Remaining
      color: '#E5E7EB', // Light gray
    },
  ];

  return (
    <View style={styles.container}>
      {/* Smart Health Metrics */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Smart Health Metrics</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllLink}>See All</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Fitness & Activity Tracker */}
      <View style={styles.section}>
        {/* Calories Burned */}
        <TouchableOpacity style={styles.trackerCard}>
          <View style={styles.trackerHeader}>
            <View style={styles.trackerIcon}>
              <Icon name="barbell-outline" size={20} color="#64748B" />
            </View>
            <View style={styles.trackerInfo}>
              <Text style={styles.trackerTitle}>Calories Burned</Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, {width: '25%'}]} />
                </View>
                <View style={styles.progressLabels}>
                  <Text style={styles.progressLabel}>500kcal</Text>
                  <Text style={styles.progressLabel}>2000kcal</Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.trackerCard}>
          <View style={styles.trackerHeader}>
            <View style={styles.trackerIcon}>
              <Icon name="nutrition" size={20} color="#64748B" />
            </View>
            <View style={styles.trackerInfo}>
              <Text style={styles.trackerTitle}>Nutrition</Text>
              <Text style={styles.trackerSubtitle}>
                You've taken 1000 steps.
              </Text>
            </View>
            <View style={styles.checkmarkContainer}>
              <Icon name="water-outline" size={16} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Steps Taken */}
        <TouchableOpacity style={styles.trackerCard}>
          <View style={styles.trackerHeader}>
            <View style={styles.trackerIcon}>
              <Icon name="footsteps" size={20} color="#64748B" />
            </View>
            <View style={styles.trackerInfo}>
              <Text style={styles.trackerTitle}>Steps Taken</Text>
              <Text style={styles.trackerSubtitle}>
                You've taken 1000 steps.
              </Text>
            </View>
            <View style={styles.checkmarkContainer}>
              <Icon name="water-outline" size={16} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Sleep */}
        <TouchableOpacity style={styles.trackerCard}>
          <View style={styles.trackerHeader}>
            <View style={styles.trackerIcon}>
              <Icon name="bed-outline" size={20} color="#64748B" />
            </View>
            <View style={styles.trackerInfo}>
              <Text style={styles.trackerTitle}>Sleep</Text>
              <Text style={styles.trackerSubtitle}>
                11/36 Monthly Circadian
              </Text>
            </View>
            <View style={styles.circularProgress}>
              <PieChart
                data={[
                  {value: 25, color: '#A855F7'}, // Progress (25%)
                  {value: 75, color: '#E5E7EB'}, // Remaining (75%)
                ]}
                radius={22}
                innerRadius={16} // Creates the donut effect
                centerLabelComponent={() => (
                  <Text style={styles.progressPercentage}>25%</Text>
                )}
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Hydration */}
        <TouchableOpacity style={styles.trackerCard}>
          <View style={styles.trackerHeader}>
            <View style={styles.trackerIcon}>
              <Icon name="water-outline" size={20} color="#64748B" />
            </View>
            <View style={styles.trackerInfo}>
              <Text style={styles.trackerTitle}>Hydration</Text>
              <View style={styles.hydrationProgress}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFillHydro, {width: '55%'}]} />
                </View>
                <View style={styles.hydrationLabels}>
                  <Text style={styles.hydrationValue}>700ml</Text>
                  <Text style={styles.hydrationValue}>2,000ml</Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  section: {
    marginBottom: 0,
  },
  sectionHeader: {
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
  seeAllLink: {
    fontSize: 14,
    color: '#3B82F6',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    height: 160,
  },
  heartRateCard: {
    backgroundColor: '#4361EE',
  },
  bloodPressureCard: {
    backgroundColor: '#EF4444',
  },
  sleepCard: {
    backgroundColor: '#06B6D4',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  chart: {
    borderRadius: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  measurementLarge: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 4,
  },
  measurementUnit: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },
  normalStatus: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginVertical: 16,
  },
  normalText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  trackerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  trackerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackerIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trackerInfo: {
    flex: 1,
  },
  trackerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  trackerSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    marginBottom: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#EF4444',
    borderRadius: 2,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    backgroundColor: '#22C55E',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularProgress: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A855F7',
  },
  hydrationProgress: {
    marginTop: 8,
  },
  hydrationLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  hydrationValue: {
    fontSize: 12,
    color: '#64748B',
  },
  progressFillHydro: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
});

export default HealthMetrics;
