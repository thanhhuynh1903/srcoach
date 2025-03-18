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

import {BarChart, LineChart} from 'react-native-gifted-charts';

import BackButton from '../../BackButton';
const {width} = Dimensions.get('window');
const CHART_WIDTH = width - 32;

const CaloriesScreen = () => {
  const lineData = [
    {value: 350, dataPointText: '350', label: '00:00', secondaryValue: 180},
    {value: 340, dataPointText: '340', secondaryValue: 170},
    {value: 370, dataPointText: '370', secondaryValue: 180},
    {value: 350, dataPointText: '350', label: '04:00', secondaryValue: 120},
    {value: 220, dataPointText: '220', secondaryValue: 80},
    {value: 380, dataPointText: '380', secondaryValue: 240},
    {value: 320, dataPointText: '320', secondaryValue: 140},
    {value: 150, dataPointText: '150', label: '08:00', secondaryValue: 60},
    {value: 280, dataPointText: '280', secondaryValue: 100},
    {value: 260, dataPointText: '260', secondaryValue: 140},
    {value: 170, dataPointText: '170', secondaryValue: 120},
    {value: 330, dataPointText: '330', label: '12:00', secondaryValue: 250},
    {value: 180, dataPointText: '180', secondaryValue: 240},
    {value: 100, dataPointText: '100', secondaryValue: 130},
    {value: 330, dataPointText: '330', secondaryValue: 180},
    {value: 380, dataPointText: '380', label: '16:00', secondaryValue: 190},
    {value: 280, dataPointText: '280', secondaryValue: 180},
    {value: 190, dataPointText: '190', secondaryValue: 120},
    {value: 280, dataPointText: '280', secondaryValue: 160},
    {value: 350, dataPointText: '350', label: '20:00', secondaryValue: 240},
    {value: 290, dataPointText: '290', secondaryValue: 120},
  ];

  // Revised bar chart data for weekly calories - using grouped bars approach
  const barData = [
    // Monday
    {
      value: 2200,
      label: 'Mon',
      frontColor: '#3B82F6',
      spacing: 2,
      labelWidth: 30,
      labelTextStyle: {color: '#94A3B8', fontSize: 12},
    },
    {
      value: 2800,
      frontColor: '#F97316',
      spacing: 18,
    },
    // Tuesday
    {
      value: 1900,
      label: 'Tue',
      frontColor: '#3B82F6',
      spacing: 2,
      labelWidth: 30,
      labelTextStyle: {color: '#94A3B8', fontSize: 12},
    },
    {
      value: 2700,
      frontColor: '#F97316',
      spacing: 18,
    },
    // Wednesday
    {
      value: 2300,
      label: 'Wed',
      frontColor: '#3B82F6',
      spacing: 2,
      labelWidth: 30,
      labelTextStyle: {color: '#94A3B8', fontSize: 12},
    },
    {
      value: 2900,
      frontColor: '#F97316',
      spacing: 18,
    },
    // Thursday
    {
      value: 2000,
      label: 'Thu',
      frontColor: '#3B82F6',
      spacing: 2,
      labelWidth: 30,
      labelTextStyle: {color: '#94A3B8', fontSize: 12},
    },
    {
      value: 2750,
      frontColor: '#F97316',
      spacing: 18,
    },
    // Friday
    {
      value: 2250,
      label: 'Fri',
      frontColor: '#3B82F6',
      spacing: 2,
      labelWidth: 30,
      labelTextStyle: {color: '#94A3B8', fontSize: 12},
    },
    {
      value: 2850,
      frontColor: '#F97316',
      spacing: 18,
    },
    // Saturday
    {
      value: 1800,
      label: 'Sat',
      frontColor: '#3B82F6',
      spacing: 2,
      labelWidth: 30,
      labelTextStyle: {color: '#94A3B8', fontSize: 12},
    },
    {
      value: 2600,
      frontColor: '#F97316',
      spacing: 18,
    },
    // Sunday
    {
      value: 2400,
      label: 'Sun',
      frontColor: '#3B82F6',
      spacing: 2,
      labelWidth: 30,
      labelTextStyle: {color: '#94A3B8', fontSize: 12},
    },
    {
      value: 2850,
      frontColor: '#F97316',
      spacing: 0,
    },
  ];

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
            data={lineData}
            height={250}
            width={CHART_WIDTH}
            noOfSections={4}
            spacing={15} // Adjusted spacing to match image
            yAxisLabelWidth={40}
            yAxisTextStyle={styles.yAxisText}
            xAxisLabelTextStyle={styles.xAxisText}
            hideDataPoints={false}
            dataPointsColor="#F97316"
            dataPointsRadius={4} // Smaller dots to match image
            startFillColor="rgba(249, 115, 22, 0)"
            endFillColor="rgba(249, 115, 22, 0)"
            color="#F97316"
            thickness={2}
            yAxisThickness={1}
            xAxisThickness={1}
            yAxisColor="#E2E8F0"
            xAxisColor="#E2E8F0"
            backgroundColor="#FFFFFF"
            rulesType="solid"
            rulesColor="#E2E8F0"
            showVerticalLines={false}
            initialSpacing={10} // Added small initial spacing
            endSpacing={10} // Added small end spacing
            maxValue={400}
            yAxisLabelPrefix=""
            yAxisLabelSuffix=""
            yAxisTextNumberOfLines={1}
            xAxisLabelsVerticalShift={10}
            curved // Ensure curved lines
            secondaryData={lineData.map(item => ({
              value: item.secondaryValue,
              dataPointText: item.secondaryValue?.toString(),
              label: item.label,
            }))}
            secondaryDataPointsColor="#3B82F6"
            secondaryDataPointsRadius={4} // Smaller dots to match image
            secondaryStartFillColor="rgba(59, 130, 246, 0)"
            secondaryEndFillColor="rgba(59, 130, 246, 0)"
            secondaryColor="#2196F3"
            secondaryThickness={2}
            hideDataPoints1={false}
            hideSecondaryDataPoints={false}
            pointerConfig={{
              pointerStripHeight: 160,
              pointerStripColor: 'lightgray',
              pointerStripWidth: 2,
              pointerColor: 'lightgray',
              radius: 6,
              pointerLabelWidth: 100,
              pointerLabelHeight: 90,
              activatePointersOnLongPress: false,
              autoAdjustPointerLabelPosition: false,
              pointerLabelComponent: () => null,
            }}
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
            data={barData}
            barWidth={24} // Width of each individual bar
            noOfSections={4}
            maxValue={3000}
            yAxisThickness={1}
            xAxisThickness={1}
            yAxisColor="#E2E8F0"
            xAxisColor="#E2E8F0"
            yAxisTextStyle={styles.yAxisText}
            hideRules
            showYAxisIndices={false}
            showVerticalLines={false}
            barBorderRadius={1} // Very minimal rounding
            initialSpacing={10}
            endSpacing={10}
            height={220}
            width={CHART_WIDTH}
            rulesColor="#E2E8F0"
            rulesThickness={1}
            disablePress
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
  yAxisText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  xAxisText: {
    fontSize: 12,
    color: '#94A3B8',

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