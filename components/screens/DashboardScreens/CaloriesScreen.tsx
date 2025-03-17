import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';

import {LineChart, BarChart} from 'react-native-chart-kit';
import BackButton from '../../BackButton';
const {width} = Dimensions.get('window');
const CHART_WIDTH = width - 32;

// Sample data for today's calories chart
const todayData = {
  activeCalories: [
    180, 220, 170, 80, 240, 100, 70, 250, 120, 100, 220, 110, 180, 250, 300,
    180, 100, 240, 120, 230,
  ],
  totalCalories: [
    350, 380, 320, 150, 370, 180, 120, 380, 200, 180, 350, 180, 280, 380, 400,
    300, 180, 380, 220, 300,
  ],
  labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
};

// Sample data for weekly calories chart
const weeklyData = {
  activeCalories: [1800, 1650, 2100, 1900, 1750, 1600, 2200],
  totalCalories: [2800, 2650, 3000, 2900, 2750, 2600, 3100],
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};

const CaloriesScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calories</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Calories Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Active Calories</Text>
            <Text style={styles.summaryValue}>856 kcal</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Calories</Text>
            <Text style={styles.summaryValue}>2,453 kcal</Text>
          </View>
        </View>

        {/* Today's Calories Chart */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Today's Calories</Text>
            <Text style={styles.chartDate}>March 18, 2025</Text>
          </View>

          <LineChart
            data={{
              labels: todayData.labels,
              datasets: [
                {
                  data: todayData.activeCalories,
                  color: () => '#3B82F6', // blue
                  strokeWidth: 2,
                },
                {
                  data: todayData.totalCalories,
                  color: () => '#F97316', // orange
                  strokeWidth: 2,
                },
              ],
              legend: ['Active Calories', 'Total Calories'],
            }}
            width={CHART_WIDTH}
            height={220}
            chartConfig={{
              backgroundColor: '#FFFFFF',
              backgroundGradientFrom: '#FFFFFF',
              backgroundGradientTo: '#FFFFFF',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
              },
              propsForBackgroundLines: {
                strokeDasharray: '',
                stroke: '#E2E8F0',
                strokeWidth: 1,
              },
            }}
            bezier
            style={styles.chart}
            withDots={true}
            withShadow={false}
            withInnerLines={true}
            withOuterLines={false}
            fromZero={true}
            yAxisInterval={100}
            yAxisSuffix=""
          />
        </View>

     {/* Last Month Summary */}
     <View style={styles.monthContainer}>
          <Text style={styles.sectionTitle}>Last Month</Text>
          <View style={styles.monthSummary}>
            <View style={styles.monthItem}>
              <Text style={styles.monthLabel}>Total Active</Text>
              <Text style={styles.monthValue}>25,463 kcal</Text>
              <Text style={styles.monthTrend}>+12% from previous</Text>
            </View>
            <View style={styles.monthItem}>
              <Text style={styles.monthLabel}>Daily Average</Text>
              <Text style={styles.monthValue}>821 kcal</Text>
              <Text style={styles.monthTrend}>+3% from previous</Text>
            </View>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Statistics</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statsItem}>
              <Text style={styles.statsLabel}>Highest Hour</Text>
              <Text style={styles.statsValue}>15:00 (186 kcal)</Text>
            </View>

            <View style={styles.statsItem}>
              <Text style={styles.statsLabel}>Average Hourly</Text>
              <Text style={styles.statsValue}>102 kcal</Text>
            </View>

            <View style={styles.statsItem}>
              <Text style={styles.statsLabel}>Active Time</Text>
              <Text style={styles.statsValue}>5h 23m</Text>
            </View>

            <View style={styles.statsItem}>
              <Text style={styles.statsLabel}>Goal Progress</Text>
              <Text style={styles.statsValue}>87.6%</Text>
            </View>
          </View>
        </View>

        {/* Weekly Chart */}
        <View style={styles.weeklyContainer}>
          <Text style={styles.sectionTitle}>This Week</Text>

          <BarChart
            data={{
              labels: weeklyData.labels,
              datasets: [
                {
                  data: weeklyData.activeCalories,
                  color: () => '#3B82F6', // blue
                },
                {
                  data: weeklyData.totalCalories,
                  color: () => '#F97316', // orange
                },
              ],
              legend: ['Active Calories', 'Total Calories'],
            }}
            width={CHART_WIDTH}
            height={220}
            chartConfig={{
              backgroundColor: '#FFFFFF',
              backgroundGradientFrom: '#FFFFFF',
              backgroundGradientTo: '#FFFFFF',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              barPercentage: 0.6,
              propsForBackgroundLines: {
                strokeDasharray: '',
                stroke: '#E2E8F0',
                strokeWidth: 1,
              },
            }}
            style={styles.chart}
            withHorizontalLabels={true}
            withVerticalLabels={true}
            withInnerLines={true}
            withOuterLines={false}
            fromZero={true}
            showBarTops={false}
            showValuesOnTopOfBars={false}
            segments={4}
            yAxisSuffix=""
          />
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
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  summaryItem: {
    flex: 1,
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
  summaryLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  chartContainer: {
    marginBottom: 24,
  },
  chartHeader: {
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  chartDate: {
    fontSize: 14,
    color: '#64748B',
  },
  chart: {
    borderRadius: 16,
    paddingRight: 0,
  },
  statsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statsItem: {
    width: '48%',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statsLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  weeklyContainer: {
    marginBottom: 24,
  },
  monthContainer: {
    marginBottom: 24,
  },
  monthSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  monthItem: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  monthLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  monthValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  monthTrend: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
});

export default CaloriesScreen;