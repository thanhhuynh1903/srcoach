import React, {useCallback, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import {LineChart} from 'react-native-gifted-charts';
import ContentLoader, {Rect} from 'react-content-loader/native';
import BackButton from '../../BackButton';
import {parseISO, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, addDays, addWeeks, addMonths, addYears, subDays, subWeeks, subMonths, subYears} from 'date-fns';
import Icon from '@react-native-vector-icons/ionicons';
import {fetchDistanceRecords, initializeHealthConnect} from '../../utils/utils_healthconnect';
import {useFocusEffect} from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

const {width} = Dimensions.get('window');
const CHART_WIDTH = width - 32;
const PRIMARY_COLOR = '#10B981';

const RecordDistanceScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeView, setActiveView] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [distanceRecords, setDistanceRecords] = useState<any[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [showPointDetails, setShowPointDetails] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'month' | 'year'>('date');
  const pointDetailsPosition = useRef(new Animated.Value(0)).current;
  const spinValue = useRef(new Animated.Value(0)).current;
  const dailyGoal = 8;

  const spinAnimation = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const startSpin = () => {
    setIsSyncing(true);
    spinValue.setValue(0);
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
    readDistanceData();
  };

  const filterRecordsByPeriod = (records: any[], view: 'day' | 'week' | 'month' | 'year', date: Date) => {
    let startDate: Date;
    let endDate: Date;

    switch (view) {
      case 'day':
        startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(date);
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
        startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
    }

    return records.filter(record => {
      const recordDate = parseISO(record.startTime);
      return recordDate >= startDate && recordDate <= endDate;
    });
  };

  const prepareLineChartData = (records: any[]) => {
    if (records.length === 0) return [];
    
    const sortedRecords = [...records].sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    if (activeView === 'day') {
      return sortedRecords.map((record, index) => ({
        value: record.distance,
        label: index % 3 === 0 ? format(parseISO(record.startTime), 'h:mm a') : '',
        date: format(parseISO(record.startTime), 'MM/dd/yyyy h:mm a'),
        originalValue: record.distance,
        labelTextStyle: {width: 50, color: '#94A3B8', fontSize: 10},
      }));
    }

    const dailyData: Record<string, {sum: number, count: number, date: Date}> = {};
    
    sortedRecords.forEach(record => {
      const date = parseISO(record.startTime);
      const dayKey = format(date, 'yyyy-MM-dd');
      
      if (!dailyData[dayKey]) {
        dailyData[dayKey] = {sum: 0, count: 0, date};
      }
      
      dailyData[dayKey].sum += record.distance;
      dailyData[dayKey].count++;
    });
    
    return Object.keys(dailyData).map((dayKey, index) => {
      const {sum, date} = dailyData[dayKey];
      return {
        value: sum,
        label: index % 2 === 0 ? format(date, 'MMM d') : '',
        date: format(date, 'MM/dd/yyyy'),
        originalValue: sum,
        labelTextStyle: {width: 50, color: '#94A3B8', fontSize: 10},
      };
    });
  };

  const calculateStats = (records: any[]) => {
    if (records.length === 0) return {total: 0, average: 0, max: 0, min: 0};
    
    const values = records.map(r => r.distance);
    const sum = values.reduce((a, b) => a + b, 0);
    return {
      total: sum,
      average: Math.round((sum / values.length) * 10) / 10,
      max: Math.round(Math.max(...values) * 10) / 10,
      min: Math.round(Math.min(...values) * 10) / 10,
    };
  };

  const formatDistance = (distance: number) => {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)} km`;
    }
    return `${Math.round(distance)} m`;
  };

  const readDistanceData = async () => {
    try {
      setIsLoading(true);
      const isInitialized = await initializeHealthConnect();
      if (!isInitialized) return console.log('Health Connect initialization failed');

      let startDate: Date;
      let endDate: Date;

      switch(activeView) {
        case 'day':
          startDate = new Date(currentDate);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(currentDate);
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

      const distanceData = await fetchDistanceRecords(
        startDate.toISOString(),
        endDate.toISOString()
      );
      setDistanceRecords(distanceData);
    } catch (error) {
      console.log('Error reading distance data:', error);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
      Animated.timing(spinValue).stop();
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      let newDate = selectedDate;
      
      if (activeView === 'week') {
        newDate = startOfWeek(selectedDate);
      } else if (activeView === 'month') {
        newDate = startOfMonth(selectedDate);
      } else if (activeView === 'year') {
        newDate = startOfYear(selectedDate);
      }
      
      setCurrentDate(newDate);
    }
  };

  const showPicker = () => {
    if (Platform.OS === 'android') {
      if (activeView === 'month') {
        setPickerMode('month');
      } else if (activeView === 'year') {
        setPickerMode('year');
      } else {
        setPickerMode('date');
      }
    }
    setShowDatePicker(true);
  };

  const handleViewChange = (view: 'day' | 'week' | 'month' | 'year') => {
    setActiveView(view);
    setCurrentDate(new Date());
  };

  const changeDate = (direction: 'prev' | 'next') => {
    let newDate = new Date(currentDate);
    
    switch(activeView) {
      case 'day':
        newDate = direction === 'prev' ? subDays(newDate, 1) : addDays(newDate, 1);
        break;
      case 'week':
        newDate = direction === 'prev' ? subWeeks(newDate, 1) : addWeeks(newDate, 1);
        break;
      case 'month':
        newDate = direction === 'prev' ? subMonths(newDate, 1) : addMonths(newDate, 1);
        break;
      case 'year':
        newDate = direction === 'prev' ? subYears(newDate, 1) : addYears(newDate, 1);
        break;
    }
    
    setCurrentDate(newDate);
  };

  const formatDate = (date: Date, view: 'day' | 'week' | 'month' | 'year') => {
    switch(view) {
      case 'day':
        return format(date, 'EEEE, MMMM do, yyyy');
      case 'week':
        return `${format(startOfWeek(date), 'MMM d')} - ${format(endOfWeek(date), 'MMM d, yyyy')}`;
      case 'month':
        return format(date, 'MMMM yyyy');
      case 'year':
        return format(date, 'yyyy');
    }
  };

  const totalDistance = (records: any[]) => records.reduce((sum, record) => sum + record.distance, 0);
  const completionPercentage = (distance: number) => Math.round((distance / 1000 / dailyGoal) * 100);

  useFocusEffect(useCallback(() => { readDistanceData(); }, [currentDate, activeView]));

  const filteredRecords = filterRecordsByPeriod(distanceRecords, activeView, currentDate);
  const lineData = prepareLineChartData(filteredRecords);
  const stats = calculateStats(filteredRecords);
  const distanceTotal = totalDistance(filteredRecords);
  const percentage = completionPercentage(distanceTotal);

  const viewLabels = {
    day: 'Day',
    week: 'Week',
    month: 'Month',
    year: 'Year'
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Distance</Text>
        <TouchableOpacity onPress={startSpin} disabled={isSyncing}>
          <Animated.View style={{transform: [{rotate: spinAnimation}]}}>
            <Icon name="sync" size={24} color={PRIMARY_COLOR} />
          </Animated.View>
        </TouchableOpacity>
      </View>

      <View style={styles.viewToggleContainer}>
        {(['day', 'week', 'month', 'year'] as const).map(view => (
          <TouchableOpacity 
            key={view}
            style={[styles.viewToggleButton, activeView === view && styles.activeToggle]}
            onPress={() => handleViewChange(view)}>
            <Text style={[styles.viewToggleText, activeView === view && styles.activeToggleText]}>{viewLabels[view]}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.dateNavigation}>
        <TouchableOpacity onPress={() => changeDate('prev')}>
          <Icon name="chevron-back" size={20} color={PRIMARY_COLOR} />
        </TouchableOpacity>
        <TouchableOpacity onPress={showPicker}>
          <Text style={styles.currentDateText}>{formatDate(currentDate, activeView)}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => changeDate('next')}>
          <Icon name="chevron-forward" size={20} color={PRIMARY_COLOR} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.content}>
          <ContentLoader speed={1} width="100%" height={100} viewBox="0 0 380 100" backgroundColor="#f3f3f3" foregroundColor="#ecebeb">
            <Rect x="0" y="0" rx="16" ry="16" width="100%" height="100" />
          </ContentLoader>
          <ContentLoader speed={1} width="100%" height={250} viewBox="0 0 380 250" backgroundColor="#f3f3f3" foregroundColor="#ecebeb" style={styles.chartContainer}>
            <Rect x="0" y="0" rx="4" ry="4" width="120" height="24" />
            <Rect x="0" y="34" rx="4" ry="4" width="180" height="16" />
            <Rect x="0" y="70" rx="8" ry="8" width="100%" height="180" />
          </ContentLoader>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{viewLabels[activeView]}</Text>
            <Text style={styles.summaryValue}>{formatDistance(distanceTotal) || '--'}</Text>
            <View style={[styles.progressChip, {backgroundColor: percentage >= 100 ? '#D1FAE5' : `${PRIMARY_COLOR}10`}]}>
              <Text style={[styles.progressText, {color: percentage >= 100 ? '#065F46' : PRIMARY_COLOR}]}>
                Goal: {dailyGoal} km • {percentage}%
              </Text>
            </View>
          </View>

          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>{formatDate(currentDate, activeView)}</Text>
            {lineData.length > 0 ? (
              <LineChart
                data={lineData}
                height={250}
                width={CHART_WIDTH}
                noOfSections={4}
                spacing={width < 400 ? 10 : 15}
                yAxisLabelWidth={40}
                yAxisTextStyle={styles.yAxisText}
                xAxisLabelTextStyle={{...styles.xAxisText, width: width < 400 ? 40 : undefined}}
                dataPointsColor={PRIMARY_COLOR}
                dataPointsRadius={4}
                startFillColor={`${PRIMARY_COLOR}20`}
                endFillColor={`${PRIMARY_COLOR}00`}
                color={PRIMARY_COLOR}
                thickness={2}
                yAxisThickness={1}
                xAxisThickness={1}
                yAxisColor="#E2E8F0"
                xAxisColor="#E2E8F0"
                rulesColor="#E2E8F0"
                initialSpacing={10}
                endSpacing={10}
                maxValue={Math.max(...lineData.map(d => d.value)) * 1.2}
                pointerConfig={{
                  pointerStripHeight: 160,
                  pointerStripColor: 'lightgray',
                  pointerStripWidth: 2,
                  pointerColor: 'lightgray',
                  radius: 6,
                  pointerLabelComponent: (items: any[]) => (
                    <View style={styles.pointerLabel}>
                      <Text style={styles.pointerLabelText}>{items[0].date}</Text>
                      <Text style={styles.pointerLabelValue}>{formatDistance(items[0].value)}</Text>
                    </View>
                  ),
                }}
                onPress={(item: any) => {
                  setSelectedPoint(item);
                  setShowPointDetails(true);
                  Animated.timing(pointDetailsPosition, {toValue: 1, duration: 200, useNativeDriver: true}).start();
                }}
              />
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No distance data available</Text>
              </View>
            )}
          </View>

          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Statistics</Text>
            <View style={styles.statsGrid}>
              {['total', 'average', 'max', 'min'].map(stat => (
                <View key={stat} style={styles.statsItem}>
                  <Text style={styles.statsLabel}>{stat.charAt(0).toUpperCase() + stat.slice(1)}</Text>
                  <Text style={styles.statsValue}>{formatDistance(stats[stat])}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.sectionTitle}>About Distance</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Why Track Distance?</Text>
              <Text style={styles.infoText}>
                Tracking distance helps monitor your overall activity level. The
                World Health Organization recommends at least 150 minutes of
                moderate activity per week, which translates to about 7-8 km of
                walking per day.
              </Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Health Benefits</Text>
              <Text style={styles.infoText}>
                Regular distance walking or running can improve cardiovascular
                health, strengthen muscles, help maintain a healthy weight, and
                reduce the risk of chronic diseases like diabetes and
                hypertension.
              </Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Tips to Increase Distance</Text>
              <Text style={styles.infoText}>
                • Take longer walking routes when possible{"\n"}
                • Gradually increase your daily distance goal{"\n"}
                • Try interval walking (alternate fast and slow paces){"\n"}
                • Walk with friends or listen to podcasts/music{"\n"}
                • Track your progress to stay motivated
              </Text>
            </View>
          </View>
        </ScrollView>
      )}

      {showPointDetails && selectedPoint && (
        <Animated.View style={[styles.pointDetailsContainer, {
          opacity: pointDetailsPosition,
          transform: [{translateY: pointDetailsPosition.interpolate({inputRange: [0, 1], outputRange: [20, 0]})}],
        }]}>
          <TouchableOpacity style={styles.pointDetailsCloseButton} onPress={() => {
            Animated.timing(pointDetailsPosition, {toValue: 0, duration: 200, useNativeDriver: true}).start(() => {
              setShowPointDetails(false);
            });
          }}>
            <Icon name="close" size={20} color="#000" />
          </TouchableOpacity>
          <Text style={styles.pointDetailsTitle}>Distance Details</Text>
          <Text style={styles.pointDetailsText}>
            <Text style={styles.pointDetailsLabel}>Time: </Text>
            {selectedPoint.date || 'N/A'}
          </Text>
          <Text style={styles.pointDetailsText}>
            <Text style={styles.pointDetailsLabel}>Distance: </Text>
            {formatDistance(selectedPoint.value)}
          </Text>
        </Animated.View>
      )}

      {showDatePicker && (
        <DateTimePicker
          value={currentDate}
          mode={pickerMode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date(2000, 0, 1)}
          maximumDate={new Date(2100, 0, 1)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#FFFFFF'},
  header: {flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9'},
  backButton: {marginRight: 16},
  headerTitle: {fontSize: 16, fontWeight: '600', flex: 1, textAlign: 'center'},
  content: {flex: 1, padding: 16},
  viewToggleContainer: {flexDirection: 'row', justifyContent: 'space-around', padding: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9'},
  viewToggleButton: {paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16},
  activeToggle: {backgroundColor: PRIMARY_COLOR},
  viewToggleText: {fontSize: 14, color: '#64748B'},
  activeToggleText: {color: '#FFFFFF', fontWeight: '600'},
  dateNavigation: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16},
  currentDateText: {fontSize: 16, fontWeight: '500'},
  summaryItem: {backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2},
  summaryLabel: {fontSize: 14, color: '#64748B', marginBottom: 4},
  summaryValue: {fontSize: 24, fontWeight: '700'},
  progressChip: {alignSelf: 'flex-start', borderRadius: 12, paddingVertical: 4, paddingHorizontal: 8, marginTop: 8},
  progressText: {fontSize: 12, fontWeight: '600'},
  chartContainer: {backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 16},
  chartTitle: {fontSize: 18, fontWeight: '600', marginBottom: 16},
  yAxisText: {fontSize: 12, color: '#94A3B8'},
  xAxisText: {fontSize: 12, color: '#94A3B8'},
  statsContainer: {backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 16},
  sectionTitle: {fontSize: 18, fontWeight: '600', marginBottom: 16},
  statsGrid: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between'},
  statsItem: {width: '48%', marginBottom: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2},
  statsLabel: {fontSize: 14, color: '#64748B', marginBottom: 4},
  statsValue: {fontSize: 16, fontWeight: '600'},
  noDataContainer: {justifyContent: 'center', alignItems: 'center', height: 180},
  noDataText: {fontSize: 16, color: '#64748B'},
  pointerLabel: {backgroundColor: 'white', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB'},
  pointerLabelText: {color: '#64748B', fontSize: 12},
  pointerLabelValue: {color: '#000', fontSize: 14, fontWeight: 'bold'},
  pointDetailsContainer: {position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: 'white', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, zIndex: 10},
  pointDetailsCloseButton: {position: 'absolute', top: 8, right: 8, padding: 8},
  pointDetailsTitle: {fontSize: 16, fontWeight: 'bold', marginBottom: 12},
  pointDetailsText: {fontSize: 14, marginBottom: 8},
  pointDetailsLabel: {fontWeight: 'bold'},
  infoContainer: {marginBottom: 24, backgroundColor: '#fff', padding: 16, borderRadius: 16},
  infoCard: {backgroundColor: '#F9FAFB', borderRadius: 8, padding: 16, marginBottom: 16},
  infoTitle: {fontSize: 16, fontWeight: '600', color: PRIMARY_COLOR, marginBottom: 8},
  infoText: {fontSize: 14, color: '#64748B', lineHeight: 20},
});

export default RecordDistanceScreen;