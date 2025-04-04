import React, {useCallback, useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Animated,
} from 'react-native';
import {BarChart, LineChart} from 'react-native-gifted-charts';
import ContentLoader, { Rect, Circle } from 'react-content-loader/native';
import BackButton from '../../BackButton';
import {format, subDays, startOfDay, parseISO, subMonths, subYears, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear} from 'date-fns';
import Icon from '@react-native-vector-icons/ionicons';
import {
  fetchActiveCaloriesRecords,
  fetchTotalCaloriesRecords,
  initializeHealthConnect,
  ActiveCaloriesRecord,
  TotalCaloriesRecord,
} from '../../utils/utils_healthconnect';
import { useFocusEffect } from '@react-navigation/native';

const {width} = Dimensions.get('window');
const CHART_WIDTH = width - 32;

interface CaloriesRecord {
  calories: number;
  startTime: string;
  endTime: string;
  metadata: {
    id: string;
    dataOrigin?: string;
  };
}

const CaloriesScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeView, setActiveView] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeCalories, setActiveCalories] = useState<ActiveCaloriesRecord[]>([]);
  const [totalCalories, setTotalCalories] = useState<TotalCaloriesRecord[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [showPointDetails, setShowPointDetails] = useState(false);
  const pointDetailsPosition = useRef(new Animated.Value(0)).current;

  const filterRecordsByPeriod = (records: (ActiveCaloriesRecord | TotalCaloriesRecord)[], view: 'day' | 'week' | 'month' | 'year', date: Date) => {
    let startDate: Date;
    let endDate: Date;

    switch (view) {
      case 'day':
        startDate = startOfDay(date);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        startDate = startOfWeek(date);
        endDate = endOfWeek(date);
        break;
      case 'month':
        startDate = startOfMonth(date);
        endDate = endOfMonth(date);
        break;
      case 'year':
        startDate = startOfYear(date);
        endDate = endOfYear(date);
        break;
      default:
        startDate = startOfDay(date);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
    }

    return records.filter(record => {
      const recordDate = parseISO(record.startTime);
      return recordDate >= startDate && recordDate <= endDate;
    });
  };

  const prepareLineChartData = (records: (ActiveCaloriesRecord | TotalCaloriesRecord)[]) => {
    if (records.length === 0) return [];
    
    const sortedRecords = [...records].sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    const hourlyData: {[key: string]: {sum: number, count: number, date: Date}} = {};
    
    sortedRecords.forEach(record => {
      const date = parseISO(record.startTime);
      const hour = date.getHours();
      const hourKey = `${hour}:00`;
      
      if (!hourlyData[hourKey]) {
        hourlyData[hourKey] = {sum: 0, count: 0, date};
      }
      
      hourlyData[hourKey].sum += record.calories;
      hourlyData[hourKey].count++;
    });
    
    return Object.keys(hourlyData).map((hourKey, index) => {
      const {sum, count, date} = hourlyData[hourKey];
      const avg = Math.round(sum / count);
      return {
        value: avg,
        label: index % 3 === 0 ? format(date, 'HH:mm') : '',
        date: format(date, 'dd/MM/yyyy HH:mm'),
        originalValue: avg,
        labelTextStyle: {
          width: 50,
          color: '#94A3B8',
          fontSize: 10,
        },
      };
    });
  };

  const prepareBarChartData = (records: (ActiveCaloriesRecord | TotalCaloriesRecord)[]) => {
    if (records.length === 0) return [];
    
    const dailyData: {[key: string]: {active: number, total: number, date: Date}} = {};
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    records.forEach(record => {
      const date = parseISO(record.startTime);
      const dayKey = format(date, 'EEE');
      const isActive = 'dataOrigin' in record && record.dataOrigin.includes('active');
      
      if (!dailyData[dayKey]) {
        dailyData[dayKey] = {active: 0, total: 0, date};
      }
      
      if (isActive) {
        dailyData[dayKey].active += record.calories;
      }
      dailyData[dayKey].total += record.calories;
    });
    
    const barData: any[] = [];
    days.forEach(day => {
      if (dailyData[day]) {
        barData.push({
          value: dailyData[day].active,
          label: day,
          frontColor: '#F97316',
          spacing: 2,
          labelWidth: 30,
          labelTextStyle: {
            color: '#94A3B8',
            fontSize: width < 400 ? 10 : 12,
          },
          date: format(dailyData[day].date, 'dd/MM/yyyy'),
        });
        barData.push({
          value: dailyData[day].total,
          frontColor: '#3B82F6',
          spacing: 18,
          date: format(dailyData[day].date, 'dd/MM/yyyy'),
        });
      }
    });
    
    return barData;
  };

  const calculateStats = (records: (ActiveCaloriesRecord | TotalCaloriesRecord)[]) => {
    if (records.length === 0) {
      return {
        active: 0,
        total: 0,
        average: 0,
        max: 0,
        min: 0,
        activeRatio: 0,
      };
    }
    
    const activeRecords = records.filter(r => 
      'dataOrigin' in r && r.dataOrigin.includes('active')
    );
    const activeSum = activeRecords.reduce((sum, r) => sum + r.calories, 0);
    const totalSum = records.reduce((sum, r) => sum + r.calories, 0);
    const values = records.map(r => r.calories);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const activeRatio = totalSum > 0 ? (activeSum / totalSum) * 100 : 0;
    
    return {
      active: activeSum,
      total: totalSum,
      average: totalSum / records.length,
      max,
      min,
      activeRatio,
    };
  };

  const readSampleData = async () => {
    try {
      setIsLoading(true);
      const isInitialized = await initializeHealthConnect();
      if (!isInitialized) {
        console.log('Health Connect initialization failed');
        setIsLoading(false);
        return;
      }

      let startDate = new Date(currentDate);
      let endDate = new Date(currentDate);

      switch(activeView) {
        case 'day':
          startDate.setHours(0, 0, 0, 0);
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

      const [activeCaloriesData, totalCaloriesData] = await Promise.all([
        fetchActiveCaloriesRecords(startDate.toISOString(), endDate.toISOString()),
        fetchTotalCaloriesRecords(startDate.toISOString(), endDate.toISOString()),
      ]);

      const processedActiveCalories = activeCaloriesData.map(r => ({
        ...r,
        dataOrigin: 'active',
      }));

      const processedTotalCalories = totalCaloriesData;

      setActiveCalories(processedActiveCalories);
      setTotalCalories([...processedActiveCalories, ...processedTotalCalories]);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  const handleSyncPress = () => {
    setIsSyncing(true);
    readSampleData();
  };

  const handleDataPointClick = (item: any) => {
    setSelectedPoint(item);
    setShowPointDetails(true);
    Animated.timing(pointDetailsPosition, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const hidePointDetails = () => {
    Animated.timing(pointDetailsPosition, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowPointDetails(false);
    });
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
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
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

  useFocusEffect(
    useCallback(() => {
      readSampleData();
    }, [currentDate, activeView]),
  );

  const filteredRecords = filterRecordsByPeriod([...activeCalories, ...totalCalories], activeView, currentDate);
  const lineData = prepareLineChartData(filteredRecords);
  const barData = prepareBarChartData(filteredRecords);
  const stats = calculateStats(filteredRecords);

  const formatNumber = (num: number) => {
    return num % 1 === 0 ? num.toString() : num.toFixed(2);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calories</Text>
        <TouchableOpacity 
          style={styles.syncButton} 
          onPress={handleSyncPress}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : (
            <Icon name="sync" size={24} color="#3B82F6" />
          )}
        </TouchableOpacity>
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
        <View style={styles.content}>
          {/* Summary Loaders */}
          <View style={styles.summaryContainer}>
            <ContentLoader 
              speed={1}
              width="100%"
              height={100}
              viewBox="0 0 380 100"
              backgroundColor="#f3f3f3"
              foregroundColor="#ecebeb"
            >
              <Rect x="0" y="0" rx="16" ry="16" width="48%" height="100" />
              <Rect x="52%" y="0" rx="16" ry="16" width="48%" height="100" />
            </ContentLoader>
          </View>

          {/* Chart Loader */}
          <ContentLoader 
            speed={1}
            width="100%"
            height={250}
            viewBox="0 0 380 250"
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
            style={styles.chartContainer}
          >
            <Rect x="0" y="0" rx="4" ry="4" width="120" height="24" />
            <Rect x="0" y="34" rx="4" ry="4" width="180" height="16" />
            <Rect x="0" y="70" rx="8" ry="8" width="100%" height="180" />
          </ContentLoader>

          {/* Stats Loader */}
          <ContentLoader 
            speed={1}
            width="100%"
            height={200}
            viewBox="0 0 380 200"
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
            style={styles.statsContainer}
          >
            <Rect x="0" y="0" rx="4" ry="4" width="120" height="24" />
            <Rect x="0" y="44" rx="8" ry="8" width="48%" height="120" />
            <Rect x="52%" y="44" rx="8" ry="8" width="48%" height="120" />
            <Rect x="0" y="174" rx="8" ry="8" width="48%" height="120" />
            <Rect x="52%" y="174" rx="8" ry="8" width="48%" height="120" />
          </ContentLoader>

          {/* Weekly Chart Loader (only shown in week view) */}
          {activeView === 'week' && (
            <ContentLoader 
              speed={1}
              width="100%"
              height={220}
              viewBox="0 0 380 220"
              backgroundColor="#f3f3f3"
              foregroundColor="#ecebeb"
              style={styles.weeklyContainer}
            >
              <Rect x="0" y="0" rx="4" ry="4" width="120" height="24" />
              <Rect x="0" y="44" rx="8" ry="8" width="100%" height="176" />
            </ContentLoader>
          )}
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {/* Calories Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Active Calories</Text>
              <Text style={styles.summaryValue}>
                {formatNumber(stats.active)} cal
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Calories</Text>
              <Text style={styles.summaryValue}>
                {formatNumber(stats.total)} cal
              </Text>
            </View>
          </View>

          {/* Calories Chart */}
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>
                {activeView === 'day' ? 'Today' : 
                 activeView === 'week' ? 'This Week' : 
                 activeView === 'month' ? 'This Month' : 'This Year'}'s Calories
              </Text>
              <Text style={styles.chartDate}>
                {formatDate(currentDate)}
              </Text>
            </View>

            {lineData.length > 0 ? (
              <LineChart
                data={lineData}
                height={250}
                width={CHART_WIDTH}
                noOfSections={4}
                spacing={width < 400 ? 10 : 15}
                yAxisLabelWidth={40}
                yAxisTextStyle={styles.yAxisText}
                xAxisLabelTextStyle={{
                  ...styles.xAxisText,
                  width: width < 400 ? 40 : undefined,
                }}
                hideDataPoints={false}
                dataPointsColor="#F97316"
                dataPointsRadius={4}
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
                initialSpacing={10}
                endSpacing={10}
                maxValue={Math.max(...lineData.map(d => d.value)) * 1.2}
                yAxisLabelPrefix=""
                yAxisLabelSuffix=""
                yAxisTextNumberOfLines={1}
                xAxisLabelsVerticalShift={10}
                curved
                pointerConfig={{
                  pointerStripHeight: 160,
                  pointerStripColor: 'lightgray',
                  pointerStripWidth: 2,
                  pointerColor: 'lightgray',
                  radius: 6,
                  pointerLabelWidth: 100,
                  pointerLabelHeight: 90,
                  activatePointersOnLongPress: true,
                  autoAdjustPointerLabelPosition: true,
                  pointerLabelComponent: (items: any[]) => (
                    <View style={styles.pointerLabel}>
                      <Text style={styles.pointerLabelText}>
                        {items[0].date}
                      </Text>
                      <Text style={styles.pointerLabelValue}>
                        {formatNumber(items[0].value)} kcal
                      </Text>
                    </View>
                  ),
                }}
                onPress={(item: any) => handleDataPointClick(item)}
              />
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No calorie data available</Text>
              </View>
            )}
          </View>

          {/* Statistics */}
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Statistics</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statsItem}>
                <Text style={styles.statsLabel}>Average Daily</Text>
                <Text style={styles.statsValue}>
                  {formatNumber(stats.average)} cal
                </Text>
              </View>

              <View style={styles.statsItem}>
                <Text style={styles.statsLabel}>Max Hourly</Text>
                <Text style={styles.statsValue}>
                  {formatNumber(stats.max)} cal
                </Text>
              </View>

              <View style={styles.statsItem}>
                <Text style={styles.statsLabel}>Min Hourly</Text>
                <Text style={styles.statsValue}>
                  {formatNumber(stats.min)} cal
                </Text>
              </View>

              <View style={styles.statsItem}>
                <Text style={styles.statsLabel}>Active Ratio</Text>
                <Text style={styles.statsValue}>
                  {formatNumber(stats.activeRatio)}%
                </Text>
              </View>
            </View>
          </View>

          {/* Weekly Chart */}
          {activeView === 'week' && (
            <View style={styles.weeklyContainer}>
              <Text style={styles.sectionTitle}>This Week</Text>

              {barData.length > 0 ? (
                <BarChart
                  data={barData}
                  barWidth={24}
                  noOfSections={4}
                  maxValue={Math.max(...barData.map(d => d.value)) * 1.2}
                  yAxisThickness={1}
                  xAxisThickness={1}
                  yAxisColor="#E2E8F0"
                  xAxisColor="#E2E8F0"
                  yAxisTextStyle={styles.yAxisText}
                  hideRules
                  showYAxisIndices={false}
                  showVerticalLines={false}
                  barBorderRadius={1}
                  initialSpacing={10}
                  endSpacing={10}
                  height={220}
                  width={CHART_WIDTH}
                  rulesColor="#E2E8F0"
                  rulesThickness={1}
                  pointerConfig={{
                    pointerStripHeight: 160,
                    pointerStripColor: 'lightgray',
                    pointerStripWidth: 2,
                    pointerColor: 'lightgray',
                    radius: 6,
                    pointerLabelWidth: 100,
                    pointerLabelHeight: 90,
                    activatePointersOnLongPress: true,
                    autoAdjustPointerLabelPosition: true,
                    pointerLabelComponent: (items: any[]) => (
                      <View style={styles.pointerLabel}>
                        <Text style={styles.pointerLabelText}>
                          {items[0].date}
                        </Text>
                        <Text style={styles.pointerLabelValue}>
                          {formatNumber(items[0].value)} cal
                        </Text>
                      </View>
                    ),
                  }}
                  onPress={(item: any) => handleDataPointClick(item)}
                />
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>No weekly data available</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}

      {/* Point Details Modal */}
      {showPointDetails && selectedPoint && (
        <Animated.View
          style={[
            styles.pointDetailsContainer,
            {
              opacity: pointDetailsPosition,
              transform: [{
                translateY: pointDetailsPosition.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              }],
            },
          ]}>
          <TouchableOpacity
            style={styles.pointDetailsCloseButton}
            onPress={hidePointDetails}>
            <Icon name="close" size={20} color="#000" />
          </TouchableOpacity>
          <Text style={styles.pointDetailsTitle}>Calorie Details</Text>
          <Text style={styles.pointDetailsText}>
            <Text style={styles.pointDetailsLabel}>Time: </Text>
            {selectedPoint.date || 'N/A'}
          </Text>
          <Text style={styles.pointDetailsText}>
            <Text style={styles.pointDetailsLabel}>Calories: </Text>
            {formatNumber(selectedPoint.value)} cal
          </Text>
        </Animated.View>
      )}
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
    flex: 1,
    textAlign: 'center',
  },
  syncButton: {
    marginLeft: 'auto',
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  viewToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  viewToggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activeToggle: {
    backgroundColor: '#F97316',
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
  },
  currentDateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  navArrow: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F97316',
    paddingHorizontal: 16,
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
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
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
  yAxisText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  xAxisText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  statsContainer: {
    marginBottom: 24,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
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
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 180,
  },
  noDataText: {
    fontSize: 16,
    color: '#64748B',
  },
  pointerLabel: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pointerLabelText: {
    color: '#64748B',
    fontSize: 12,
  },
  pointerLabelValue: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  pointDetailsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10,
  },
  pointDetailsCloseButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 8,
  },
  pointDetailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
  },
  pointDetailsText: {
    fontSize: 14,
    marginBottom: 8,
    color: '#333',
  },
  pointDetailsLabel: {
    fontWeight: 'bold',
  },
});

export default CaloriesScreen;