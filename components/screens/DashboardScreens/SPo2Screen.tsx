import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {LineChart} from 'react-native-gifted-charts';
import BackButton from '../../BackButton';
import ScreenWrapper from '../../ScreenWrapper';
import {useFocusEffect} from '@react-navigation/native';
import {fetchOxygenSaturationRecords, initializeHealthConnect} from '../../utils/utils_healthconnect';
import {format, startOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear} from 'date-fns';

const {width} = Dimensions.get('window');
const CHART_WIDTH = width - 32;

interface ChartPointDetail {
  time: string;
  value: number;
  period: string;
}

const SPo2Screen = () => {
  const [activeView, setActiveView] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [spo2Records, setSpO2Records] = useState<OxygenSaturationRecord[]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<ChartPointDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHealthData = async () => {
    try {
      setIsLoading(true);
      const isInitialized = await initializeHealthConnect();
      if (!isInitialized) {
        console.log('Health Connect initialization failed');
        return;
      }

      let startDate = new Date(currentDate);
      let endDate = new Date(currentDate);

      switch(activeView) {
        case 'day':
          startDate = startOfDay(currentDate);
          endDate = new Date(startDate);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'week':
          startDate = startOfWeek(currentDate);
          endDate = endOfWeek(currentDate);
          break;
        case 'month':
          startDate = startOfMonth(currentDate);
          endDate = endOfMonth(currentDate);
          break;
        case 'year':
          startDate = startOfYear(currentDate);
          endDate = endOfYear(currentDate);
          break;
      }

      const records = await fetchOxygenSaturationRecords(startDate.toISOString(), endDate.toISOString());
      setSpO2Records(records);
    } catch (error) {
      console.error('Error fetching health data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeView = (view: 'day' | 'week' | 'month' | 'year') => {
    setActiveView(view);
  };

  const changeDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch(activeView) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'prev' ? -1 : 1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'prev' ? -1 : 1));
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + (direction === 'prev' ? -1 : 1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const formatDate = (date: Date) => {
    switch(activeView) {
      case 'day':
        return format(date, 'EEEE, MMMM d, yyyy');
      case 'week':
        const start = startOfWeek(date);
        const end = endOfWeek(date);
        return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
      case 'month':
        return format(date, 'MMMM yyyy');
      case 'year':
        return date.getFullYear().toString();
    }
  };

  useFocusEffect(useCallback(() => {
    fetchHealthData();
  }, [currentDate, activeView]));

  // Group records by time period and calculate averages
  const processChartData = () => {
    if (spo2Records.length === 0) return {data: [], xAxisLabelText: ''};

    let groupedData: Record<string, {sum: number; count: number}> = {};
    let xAxisLabelText = 'Time';

    // Group records based on active view
    spo2Records.forEach(record => {
      let key;
      const date = new Date(record.time);

      switch (activeView) {
        case 'day':
          key = format(date, 'HH:00');
          xAxisLabelText = 'Hour';
          break;
        case 'week':
          key = format(date, 'EEE');
          xAxisLabelText = 'Day';
          break;
        case 'month':
          key = format(date, 'd MMM');
          xAxisLabelText = 'Date';
          break;
        case 'year':
          key = format(date, 'MMM');
          xAxisLabelText = 'Month';
          break;
        default:
          key = format(date, 'HH:00');
      }

      if (!groupedData[key]) {
        groupedData[key] = {sum: 0, count: 0};
      }
      groupedData[key].sum += record.percentage;
      groupedData[key].count++;
    });

    // Convert to chart data format
    const chartData = Object.entries(groupedData).map(([key, {sum, count}]) => {
      const average = Math.round(sum / count);
      return {
        value: average,
        label: key,
        labelTextStyle: {width: 60},
        dataPointText: average.toString(),
        onPress: () => {
          setSelectedPoint({
            time: key,
            value: average,
            period: activeView,
          });
          setDetailModalVisible(true);
        },
      };
    });

    return {data: chartData, xAxisLabelText};
  };

  // Calculate statistics
  const calculateStatistics = () => {
    if (spo2Records.length === 0) {
      return {
        average: 0,
        highest: {value: 0, time: ''},
        lowest: {value: 100, time: ''},
        current: 0,
      };
    }

    let sum = 0;
    let highest = {value: -Infinity, time: ''};
    let lowest = {value: Infinity, time: ''};

    spo2Records.forEach(record => {
      sum += record.percentage;
      
      if (record.percentage > highest.value) {
        highest = {
          value: record.percentage, 
          time: format(new Date(record.time), 'HH:mm, MMM d')
        };
      }
      
      if (record.percentage < lowest.value) {
        lowest = {
          value: record.percentage, 
          time: format(new Date(record.time), 'HH:mm, MMM d')
        };
      }
    });

    const average = Math.round(sum / spo2Records.length);
    const current = spo2Records[spo2Records.length - 1]?.percentage || 0;

    return {average, highest, lowest, current};
  };

  const {data: chartData, xAxisLabelText} = processChartData();
  const stats = calculateStatistics();

  return (
    <ScreenWrapper bg={'#F5F8FA'}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SPO2</Text>
      </View>

      {/* View Toggle */}
      <View style={styles.viewToggleContainer}>
        <TouchableOpacity 
          style={[styles.viewToggleButton, activeView === 'day' && styles.activeToggle]}
          onPress={() => changeView('day')}>
          <Text style={[styles.viewToggleText, activeView === 'day' && styles.activeToggleText]}>Day</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.viewToggleButton, activeView === 'week' && styles.activeToggle]}
          onPress={() => changeView('week')}>
          <Text style={[styles.viewToggleText, activeView === 'week' && styles.activeToggleText]}>Week</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.viewToggleButton, activeView === 'month' && styles.activeToggle]}
          onPress={() => changeView('month')}>
          <Text style={[styles.viewToggleText, activeView === 'month' && styles.activeToggleText]}>Month</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.viewToggleButton, activeView === 'year' && styles.activeToggle]}
          onPress={() => changeView('year')}>
          <Text style={[styles.viewToggleText, activeView === 'year' && styles.activeToggleText]}>Year</Text>
        </TouchableOpacity>
      </View>

      {/* Date Navigation */}
      <View style={styles.dateNavigation}>
        <TouchableOpacity onPress={() => changeDate('prev')}>
          <Text style={styles.navArrow}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.currentDateText}>{formatDate(currentDate)}</Text>
        <TouchableOpacity onPress={() => changeDate('next')}>
          <Text style={styles.navArrow}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {/* Current SpO2 Reading */}
          <View style={styles.readingContainer}>
            <Text style={styles.readingValue}>{stats.current}%</Text>
            <Text style={styles.readingLabel}>SPO2</Text>
            <View style={styles.rangeContainer}>
              <View style={styles.rangeDot} />
              <Text style={styles.rangeText}>Normal Range</Text>
            </View>
          </View>

          {/* SpO2 Chart */}
          <View style={styles.chartContainer}>
            {chartData.length > 0 ? (
              <>
                <Text style={styles.chartTitle}>SPO2 ({activeView === 'day' ? 'Daily' : 
                  activeView === 'week' ? 'Weekly' : 
                  activeView === 'month' ? 'Monthly' : 'Yearly'} View)</Text>
                <LineChart
                  data={chartData}
                  width={CHART_WIDTH}
                  height={200}
                  color="#3B82F6"
                  textColor="#64748B"
                  yAxisTextStyle={{color: '#64748B'}}
                  yAxisLabelSuffix="%"
                  yAxisThickness={1}
                  xAxisThickness={1}
                  spacing={CHART_WIDTH / chartData.length + 50}
                  initialSpacing={25}
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
                  xAxisLabelText={xAxisLabelText}
                  xAxisLabelTextStyle={{width: 60}}
                  showStripOnPress
                  stripColor="#E2E8F0"
                  stripWidth={1}
                  focusedDataPointColor="#3B82F6"
                  focusedDataPointRadius={6}
                />
              </>
            ) : (
              <Text style={{textAlign: 'center', color: '#64748B'}}>
                No SPO2 data available
              </Text>
            )}
          </View>

          {/* Statistics */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Icon name="stats-chart-outline" size={20} color="#3B82F6" />
              <Text style={styles.statTitle}>Average</Text>
              <Text style={styles.statValue}>{stats.average}%</Text>
              <Text style={styles.statTime}>Today</Text>
            </View>

            <View style={styles.statItem}>
              <Icon name="trending-up" size={20} color="#3B82F6" />
              <Text style={styles.statTitle}>Highest</Text>
              <Text style={styles.statValue}>{stats.highest.value}%</Text>
              <Text style={styles.statTime}>{stats.highest.time}</Text>
            </View>

            <View style={styles.statItem}>
              <Icon name="trending-down" size={20} color="#3B82F6" />
              <Text style={styles.statTitle}>Lowest</Text>
              <Text style={styles.statValue}>{stats.lowest.value}%</Text>
              <Text style={styles.statTime}>{stats.lowest.time}</Text>
            </View>
          </View>
        </ScrollView>
      )}

      {/* About SpO2 */}
      <View style={styles.aboutContainer}>
        <Text style={styles.aboutTitle}>About SPO2</Text>
        <Text style={styles.aboutText}>
          SPO2 measures the oxygen saturation level in your blood. A normal SPO2
          level is typically between 95% and 100%.
        </Text>
      </View>

      {/* Point Detail Modal */}
      <Modal
        visible={detailModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDetailModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>SPO2 Details</Text>
            {selectedPoint && (
              <>
                <Text style={styles.modalText}>
                  {activeView === 'day' ? 'Time' : 
                   activeView === 'week' ? 'Day' : 
                   activeView === 'month' ? 'Date' : 'Month'}: {selectedPoint.time}
                </Text>
                <Text style={styles.modalText}>Value: {selectedPoint.value}%</Text>
              </>
            )}
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setDetailModalVisible(false)}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  viewToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  viewToggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activeToggle: {
    backgroundColor: '#3B82F6',
  },
  viewToggleText: {
    fontSize: 14,
    color: '#64748B',
  },
  activeToggleText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dateNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  currentDateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  navArrow: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
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
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#0F172A',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#64748B',
  },
  modalButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#3B82F6',
    borderRadius: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SPo2Screen;