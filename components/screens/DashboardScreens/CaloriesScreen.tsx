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
import BackButton from '../../BackButton';
import {useFocusEffect} from '@react-navigation/native';
import {
  initialize,
  readRecords,
  requestPermission,
} from 'react-native-health-connect';
import {format, subDays, startOfDay, parseISO} from 'date-fns';
import Icon from '@react-native-vector-icons/ionicons';

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

const timePeriods = ['Today', 'Week', 'Month', 'Year'];

const CaloriesScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activePeriod, setActivePeriod] = useState('Today');
  const [activeCalories, setActiveCalories] = useState<CaloriesRecord[]>([]);
  const [totalCalories, setTotalCalories] = useState<CaloriesRecord[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [showPointDetails, setShowPointDetails] = useState(false);
  const pointDetailsPosition = useRef(new Animated.Value(0)).current;

  const filterRecordsByPeriod = (records: CaloriesRecord[], period: string) => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'Today':
        startDate = startOfDay(now);
        break;
      case 'Week':
        startDate = subDays(startOfDay(now), 7);
        break;
      case 'Month':
        startDate = subDays(startOfDay(now), 30);
        break;
      case 'Year':
        startDate = subDays(startOfDay(now), 365);
        break;
      default:
        startDate = startOfDay(now);
    }

    return records.filter(record => {
      const recordDate = parseISO(record.startTime);
      return recordDate >= startDate && recordDate <= now;
    });
  };

  const prepareLineChartData = (records: CaloriesRecord[]) => {
    if (records.length === 0) return [];
    
    // Sort records by time
    const sortedRecords = [...records].sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    // Group by hour
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
          width: 50, // Fixed width to prevent truncation
          color: '#94A3B8',
          fontSize: 10,
        },
      };
    });
  };

  const prepareBarChartData = (records: CaloriesRecord[]) => {
    if (records.length === 0) return [];
    
    // Group by day of week
    const dailyData: {[key: string]: {active: number, total: number, date: Date}} = {};
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    records.forEach(record => {
      const date = parseISO(record.startTime);
      const dayKey = format(date, 'EEE');
      const isActive = record.metadata?.dataOrigin?.includes('active') || false;
      
      if (!dailyData[dayKey]) {
        dailyData[dayKey] = {active: 0, total: 0, date};
      }
      
      if (isActive) {
        dailyData[dayKey].active += record.calories;
      }
      dailyData[dayKey].total += record.calories;
    });
    
    // Create bar data for each day
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
            fontSize: width < 400 ? 10 : 12, // Adjust font size for small screens
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

  const calculateStats = (records: CaloriesRecord[]) => {
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
      r.metadata?.dataOrigin?.includes('active')
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
      const isInitialized = await initialize();
      if (!isInitialized) {
        console.log('Health Connect initialization failed');
        setIsLoading(false);
        return;
      }

      const grantedPermissions = await requestPermission([
        {accessType: 'read', recordType: 'ActiveCaloriesBurned'},
        {accessType: 'read', recordType: 'TotalCaloriesBurned'},
      ]);

      if (!grantedPermissions) {
        console.log('Permissions not granted');
        setIsLoading(false);
        return;
      }

      const startDate = subDays(new Date(), 30).toISOString();
      const endDate = new Date().toISOString();

      const [activeCaloriesData, totalCaloriesData] = await Promise.all([
        readRecords('ActiveCaloriesBurned', {
          timeRangeFilter: {
            operator: 'between',
            startTime: startDate,
            endTime: endDate,
          },
        }),
        readRecords('TotalCaloriesBurned', {
          timeRangeFilter: {
            operator: 'between',
            startTime: startDate,
            endTime: endDate,
          },
        }),
      ]);

      const processedActiveCalories = activeCaloriesData.records.map(r => ({
        calories: r.energy.inCalories,
        startTime: r.startTime,
        endTime: r.endTime,
        metadata: {...r.metadata, dataOrigin: 'active'},
      }));

      const processedTotalCalories = totalCaloriesData.records.map(r => ({
        calories: r.energy.inCalories,
        startTime: r.startTime,
        endTime: r.endTime,
        metadata: r.metadata,
      }));

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

  useFocusEffect(
    useCallback(() => {
      readSampleData();
    }, []),
  );

  const filteredRecords = filterRecordsByPeriod(totalCalories, activePeriod);
  const lineData = prepareLineChartData(filteredRecords);
  const barData = prepareBarChartData(filteredRecords);
  const stats = calculateStats(filteredRecords);

  // Format numbers to 2 decimal places
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

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F97316" />
        </View>
      ) : (
        <ScrollView style={styles.content}>
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

          {/* Calories Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Active Calories</Text>
              <Text style={styles.summaryValue}>
                {formatNumber(stats.active)} kcal
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Calories</Text>
              <Text style={styles.summaryValue}>
                {formatNumber(stats.total)} kcal
              </Text>
            </View>
          </View>

          {/* Calories Chart */}
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>
                {activePeriod === 'Today' ? 'Today' : activePeriod}'s Calories
              </Text>
              <Text style={styles.chartDate}>
                {format(new Date(), 'dd/MM/yyyy')}
              </Text>
            </View>

            {lineData.length > 0 ? (
              <LineChart
                data={lineData}
                height={250}
                width={CHART_WIDTH}
                noOfSections={4}
                spacing={width < 400 ? 10 : 15} // Adjust spacing for small screens
                yAxisLabelWidth={40}
                yAxisTextStyle={styles.yAxisText}
                xAxisLabelTextStyle={{
                  ...styles.xAxisText,
                  width: width < 400 ? 40 : undefined, // Fixed width for small screens
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
                  {formatNumber(stats.average)} kcal
                </Text>
              </View>

              <View style={styles.statsItem}>
                <Text style={styles.statsLabel}>Max Hourly</Text>
                <Text style={styles.statsValue}>
                  {formatNumber(stats.max)} kcal
                </Text>
              </View>

              <View style={styles.statsItem}>
                <Text style={styles.statsLabel}>Min Hourly</Text>
                <Text style={styles.statsValue}>
                  {formatNumber(stats.min)} kcal
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
          {activePeriod === 'Week' && (
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
                          {formatNumber(items[0].value)} kcal
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
            {formatNumber(selectedPoint.value)} kcal
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
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
    backgroundColor: '#F97316',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  activeTabText: {
    color: '#FFFFFF',
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