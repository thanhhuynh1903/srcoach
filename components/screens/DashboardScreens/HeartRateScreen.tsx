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
import {LineChart} from 'react-native-gifted-charts';
import ContentLoader, {Rect} from 'react-content-loader/native';
import BackButton from '../../BackButton';
import {format, subDays, startOfDay, parseISO, subMonths, subYears, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear} from 'date-fns';
import Icon from '@react-native-vector-icons/ionicons';
import {
  fetchHeartRateRecords,
  initializeHealthConnect,
} from '../../utils/utils_healthconnect';
import {useFocusEffect} from '@react-navigation/native';

const {width} = Dimensions.get('window');
const CHART_WIDTH = width - 32;

const HeartRateScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeView, setActiveView] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [heartRateRecords, setHeartRateRecords] = useState<any[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [showPointDetails, setShowPointDetails] = useState(false);
  const pointDetailsPosition = useRef(new Animated.Value(0)).current;
  const [restingHeartRate, setRestingHeartRate] = useState<number | null>(null);

  const filterRecordsByPeriod = (records: any[], view: 'day' | 'week' | 'month' | 'year', date: Date) => {
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

  const prepareLineChartData = (records: any[]) => {
    if (records.length === 0) return [];
    
    const sortedRecords = [...records].sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    // For day view, show hourly data points
    if (activeView === 'day') {
      return sortedRecords.map((record, index) => ({
        value: record.beatsPerMinute,
        label: index % 3 === 0 ? format(parseISO(record.startTime), 'HH:mm') : '',
        date: format(parseISO(record.startTime), 'dd/MM/yyyy HH:mm'),
        originalValue: record.beatsPerMinute,
        labelTextStyle: {
          width: 50,
          color: '#94A3B8',
          fontSize: 10,
        },
      }));
    }

    // For other views, aggregate data by day
    const dailyData: {[key: string]: {sum: number, count: number, date: Date}} = {};
    
    sortedRecords.forEach(record => {
      const date = parseISO(record.startTime);
      const dayKey = format(date, 'yyyy-MM-dd');
      
      if (!dailyData[dayKey]) {
        dailyData[dayKey] = {sum: 0, count: 0, date};
      }
      
      dailyData[dayKey].sum += record.beatsPerMinute;
      dailyData[dayKey].count++;
    });
    
    return Object.keys(dailyData).map((dayKey, index) => {
      const {sum, count, date} = dailyData[dayKey];
      const avg = Math.round(sum / count);
      return {
        value: avg,
        label: index % 2 === 0 ? format(date, 'MMM d') : '',
        date: format(date, 'dd/MM/yyyy'),
        originalValue: avg,
        labelTextStyle: {
          width: 50,
          color: '#94A3B8',
          fontSize: 10,
        },
      };
    });
  };

  const calculateStats = (records: any[]) => {
    if (records.length === 0) {
      return {
        average: 0,
        max: 0,
        min: 0,
      };
    }
    
    const values = records.map(r => r.beatsPerMinute);
    const sum = values.reduce((a, b) => a + b, 0);
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    return {
      average: Math.round(sum / values.length),
      max,
      min,
    };
  };

  const calculateHeartRateZones = (maxBpm: number) => {
    // Using Karvonen formula for heart rate zones
    if (!restingHeartRate || !maxBpm) return [];
    
    const heartRateReserve = maxBpm - restingHeartRate;
    
    return [
      {
        name: 'Peak',
        range: `${Math.round(0.9 * heartRateReserve + restingHeartRate)}-${maxBpm} BPM`,
        duration: '0 min',
        color: '#FF4D4F',
        progress: 0,
      },
      {
        name: 'Cardio',
        range: `${Math.round(0.8 * heartRateReserve + restingHeartRate)}-${Math.round(0.89 * heartRateReserve + restingHeartRate)} BPM`,
        duration: '0 min',
        color: '#FF7A45',
        progress: 0,
      },
      {
        name: 'Fat Burn',
        range: `${Math.round(0.7 * heartRateReserve + restingHeartRate)}-${Math.round(0.79 * heartRateReserve + restingHeartRate)} BPM`,
        duration: '0 min',
        color: '#52C41A',
        progress: 0,
      },
      {
        name: 'Warm Up',
        range: `${Math.round(0.6 * heartRateReserve + restingHeartRate)}-${Math.round(0.69 * heartRateReserve + restingHeartRate)} BPM`,
        duration: '0 min',
        color: '#1890FF',
        progress: 0,
      },
      {
        name: 'Rest',
        range: `${restingHeartRate}-${Math.round(0.59 * heartRateReserve + restingHeartRate)} BPM`,
        duration: '0 min',
        color: '#D3D3D3',
        progress: 0,
      },
    ];
  };

  const calculateTimeInZones = (records: any[], zones: any[]) => {
    if (records.length === 0 || !zones.length) return zones;
    
    const updatedZones = [...zones];
    const totalMinutes = records.length; // Assuming 1 record per minute for simplicity
    
    records.forEach(record => {
      const bpm = record.beatsPerMinute;
      for (let i = 0; i < updatedZones.length; i++) {
        const [min, max] = updatedZones[i].range.split('-').map((n: string) => parseInt(n));
        if (bpm >= min && bpm <= max) {
          const currentDuration = parseInt(updatedZones[i].duration) || 0;
          updatedZones[i].duration = `${currentDuration + 1} min`;
          updatedZones[i].progress = ((currentDuration + 1) / totalMinutes);
          break;
        }
      }
    });
    
    return updatedZones;
  };

  const readHeartRateData = async () => {
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

      const heartRateData = await fetchHeartRateRecords(
        startDate.toISOString(),
        endDate.toISOString()
      );

      setHeartRateRecords(heartRateData);

      // Get resting heart rate (assuming it's the minimum from the data)
      if (heartRateData.length > 0) {
        const minBpm = Math.min(...heartRateData.map(r => r.beatsPerMinute));
        setRestingHeartRate(minBpm);
      }
    } catch (error) {
      console.log('Error reading heart rate data:', error);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  const handleSyncPress = () => {
    setIsSyncing(true);
    readHeartRateData();
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
      readHeartRateData();
    }, [currentDate, activeView]),
  );

  const filteredRecords = filterRecordsByPeriod(heartRateRecords, activeView, currentDate);
  const lineData = prepareLineChartData(filteredRecords);
  const stats = calculateStats(filteredRecords);
  const heartRateZones = calculateTimeInZones(
    filteredRecords,
    calculateHeartRateZones(stats.max)
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Heart Rate</Text>
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
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {/* Current Heart Rate */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <View style={styles.heartIconContainer}>
                <Icon name="heart" size={28} color="#FF4D4F" />
              </View>
              <Text style={styles.summaryLabel}>Current</Text>
              <Text style={styles.summaryValue}>
                {heartRateRecords.length > 0 ? 
                  heartRateRecords[heartRateRecords.length - 1].beatsPerMinute : '--'} 
                <Text style={styles.bpmLabel}> BPM</Text>
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Resting</Text>
              <Text style={styles.summaryValue}>
                {restingHeartRate || '--'}
                <Text style={styles.bpmLabel}> BPM</Text>
              </Text>
            </View>
          </View>

          {/* Heart Rate Chart */}
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>
                {activeView === 'day' ? 'Today' : 
                 activeView === 'week' ? 'This Week' : 
                 activeView === 'month' ? 'This Month' : 'This Year'}'s Heart Rate
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
                dataPointsColor="#FF4D4F"
                dataPointsRadius={4}
                startFillColor="rgba(255, 77, 79, 0.1)"
                endFillColor="rgba(255, 77, 79, 0)"
                color="#FF4D4F"
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
                        {items[0].value} BPM
                      </Text>
                    </View>
                  ),
                }}
                onPress={(item: any) => handleDataPointClick(item)}
              />
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No heart rate data available</Text>
              </View>
            )}
          </View>

          {/* Statistics */}
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Statistics</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statsItem}>
                <Text style={styles.statsLabel}>Average</Text>
                <Text style={styles.statsValue}>
                  {stats.average} BPM
                </Text>
              </View>

              <View style={styles.statsItem}>
                <Text style={styles.statsLabel}>Maximum</Text>
                <Text style={styles.statsValue}>
                  {stats.max} BPM
                </Text>
              </View>

              <View style={styles.statsItem}>
                <Text style={styles.statsLabel}>Minimum</Text>
                <Text style={styles.statsValue}>
                  {stats.min} BPM
                </Text>
              </View>
            </View>
          </View>

          {/* Heart Rate Zones */}
          <View style={styles.zonesContainer}>
            <Text style={styles.sectionTitle}>Heart Rate Zones</Text>

            {heartRateZones.map((zone, index) => (
              <View key={index} style={styles.zoneContainer}>
                <View style={styles.zoneItem}>
                  <View style={styles.zoneInfo}>
                    <Text style={styles.zoneName}>{zone.name}</Text>
                    <Text style={styles.zoneRange}>{zone.range}</Text>
                  </View>
                  <View style={styles.zoneDurationContainer}>
                    <Text style={styles.zoneDuration}>{zone.duration}</Text>
                  </View>
                  <View style={styles.progressBarBackground}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${zone.progress * 100}%`,
                          backgroundColor: zone.color,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
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
          <Text style={styles.pointDetailsTitle}>Heart Rate Details</Text>
          <Text style={styles.pointDetailsText}>
            <Text style={styles.pointDetailsLabel}>Time: </Text>
            {selectedPoint.date || 'N/A'}
          </Text>
          <Text style={styles.pointDetailsText}>
            <Text style={styles.pointDetailsLabel}>Heart Rate: </Text>
            {selectedPoint.value} BPM
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
    backgroundColor: '#FF4D4F',
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
    color: '#FF4D4F',
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
  heartIconContainer: {
    marginBottom: 8,
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
  bpmLabel: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
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
  zonesContainer: {
    marginBottom: 24,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
  },
  zoneContainer: {
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  zoneItem: {
    marginBottom: 0,
  },
  zoneInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  zoneRange: {
    fontSize: 14,
    color: '#64748B',
  },
  zoneDurationContainer: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  zoneDuration: {
    fontSize: 14,
    color: '#64748B',
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
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

export default HeartRateScreen;