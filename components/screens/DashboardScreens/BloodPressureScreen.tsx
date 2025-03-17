import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {LineChart} from 'react-native-gifted-charts';
import BackButton from '../../BackButton';
import ScreenWrapper from '../../ScreenWrapper';

const {width} = Dimensions.get('window');
const CHART_WIDTH = width - 32;

const timePeriods = ['Day', 'Week', 'Month', 'Year'];

// Sample data for the SpO2 chart
const data = [
  {value: 99, label: '9AM'},
  {value: 98, label: '10AM'},
  {value: 99, label: '11AM'},
  {value: 97, label: '12PM'},
  {value: 98, label: '1PM'},
  {value: 99, label: '2PM'},
  {value: 100, label: '3PM'},
];

const BloodPressureScreen = () => {
  const [activePeriod, setActivePeriod] = useState('Day');

  return (
    <ScreenWrapper bg={'#F5F8FA'}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blood Pressure</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Current SpO2 Reading */}
        <View style={styles.readingContainer}>
          <Text style={styles.readingValue}>98%</Text>
          <Text style={styles.readingLabel}>SPO2</Text>
          <View style={styles.rangeContainer}>
            <View style={styles.rangeDot} />
            <Text style={styles.rangeText}>Normal Range</Text>
          </View>
          <Text style={styles.updatedText}>Updated 2 mins ago</Text>
        </View>

        {/* Time Period Tabs */}
        <View style={styles.tabsContainer}>
          {timePeriods.map(period => (
            <TouchableOpacity
              key={period}
              style={[
                styles.tabButton,
                activePeriod === period && styles.activeTabButton,
              ]}
              onPress={() => setActivePeriod(period)}>
              <Text
                style={[
                  styles.tabText,
                  activePeriod === period && styles.activeTabText,
                ]}>
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SpO2 Chart */}
        <View style={styles.chartContainer}>
          <LineChart
            data={data}
            width={CHART_WIDTH}
            height={200}
            color="#3B82F6"
            textColor="#64748B"
            yAxisTextStyle={{color: '#64748B'}}
            yAxisLabelSuffix=""
            yAxisThickness={1}
            xAxisThickness={1}
            spacing={50}
            initialSpacing={20}
            curved
            noOfSections={4}
            hideDataPoints={false}
            dataPointsColor="#3B82F6"
            dataPointsRadius={4}
            startFillColor="#E0F2FE"
            endFillColor="#FFFFFF"
            startOpacity={0.5}
            endOpacity={0.1}
            showYAxisIndices
            yAxisIndicesWidth={1}
            yAxisIndicesColor="#E2E8F0"
            showXAxisIndices
            xAxisIndicesWidth={1}
            xAxisIndicesColor="#E2E8F0"
            yAxisExtraHeight={10}
            yAxisOffset={70}
            isAnimated
            rulesType="solid"
            rulesColor="#E2E8F0"
          />
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Icon name="stats-chart-outline" size={20} color="#3B82F6" />
            <Text style={styles.statTitle}>Average</Text>
            <Text style={styles.statValue}>97%</Text>
            <Text style={styles.statTime}>Today</Text>
          </View>

          <View style={styles.statItem}>
            <Icon name="trending-up" size={20} color="#3B82F6" />
            <Text style={styles.statTitle}>Highest</Text>
            <Text style={styles.statValue}>99%</Text>
            <Text style={styles.statTime}>3PM</Text>
          </View>

          <View style={styles.statItem}>
            <Icon name="trending-down" size={20} color="#3B82F6" />
            <Text style={styles.statTitle}>Lowest</Text>
            <Text style={styles.statValue}>95%</Text>
            <Text style={styles.statTime}>12PM</Text>
          </View>
        </View>
      </ScrollView>
      {/* About SpO2 */}
      <View style={styles.aboutContainer}>
        <Text style={styles.aboutTitle}>About SPO2</Text>
        <Text style={styles.aboutText}>
          SPO2 measures the oxygen saturation level in your blood. A normal SPO2
          level is typically between 95% and 100%.
        </Text>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  readingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  readingValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  readingLabel: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
  },
  rangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F0FDF4',
  },
  rangeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  rangeText: {
    fontSize: 14,
    color: '#10B981',
  },
  updatedText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTabButton: {
    backgroundColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  chartContainer: {
    marginBottom: 24,
  },
  chart: {
    borderRadius: 16,
    paddingRight: 0,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    alignItems: 'center',
    width: '30%',
  },
  statTitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  statTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  aboutContainer: {
    padding: 16,
    marginBottom: 24,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 17,
    color: '#64748B',
    lineHeight: 20,
  },
});

export default BloodPressureScreen;
