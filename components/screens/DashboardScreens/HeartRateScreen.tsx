import React, {useCallback, useEffect, useState, useRef} from 'react';
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
import Icon from '@react-native-vector-icons/ionicons';
import {LineChart} from 'react-native-gifted-charts';
import ContentLoader, { Rect } from 'react-content-loader/native';
import BackButton from '../../BackButton';
import {useFocusEffect} from '@react-navigation/native';
import {format, startOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear} from 'date-fns';
import { fetchHeartRateRecords, fetchRestingHeartRateRecords, initializeHealthConnect } from '../../utils/utils_healthconnect';

const {width} = Dimensions.get('window');

interface HeartRateRecord {
  beatsPerMinute: number;
  startTime: string;
  endTime: string;
  metadata: {
    id: string;
  };
  id: string;
}

interface RestingHeartRateRecord {
  beatsPerMinute: number;
  startTime: string;
  endTime: string;
  metadata: {
    id: string;
  };
  id: string;
}

interface ZoneData {
  name: string;
  range: string;
  duration: string;
  color: string;
  progress: number;
}

const HeartRateScreen = () => {
  const [activeView, setActiveView] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [heartRateRecords, setHeartRateRecords] = useState<HeartRateRecord[]>([]);
  const [restingHeartRateRecords, setRestingHeartRateRecords] = useState<RestingHeartRateRecord[]>([]);
  const [currentHeartRate, setCurrentHeartRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [zoneData, setZoneData] = useState<ZoneData[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [showPointDetails, setShowPointDetails] = useState(false);
  const [hasData, setHasData] = useState(false);
  const pointDetailsPosition = useRef(new Animated.Value(0)).current;

  const filterRecordsByPeriod = (records: HeartRateRecord[], view: 'day' | 'week' | 'month' | 'year', date: Date) => {
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
      const recordDate = new Date(record.startTime);
      return recordDate >= startDate && recordDate <= endDate;
    });
  };

  const calculateZones = (records: HeartRateRecord[]) => {
    if (records.length === 0) {
      return [
        {
          name: 'Peak',
          range: '170-190 BPM',
          duration: '0 min',
          color: '#FF4D4F',
          progress: 0,
        },
        {
          name: 'Cardio',
          range: '140-170 BPM',
          duration: '0 min',
          color: '#FF7A45',
          progress: 0,
        },
        {
          name: 'Fat Burn',
          range: '110-140 BPM',
          duration: '0 min',
          color: '#52C41A',
          progress: 0,
        },
        {
          name: 'Rest',
          range: '60-110 BPM',
          duration: '0 min',
          color: '#1890FF',
          progress: 0,
        },
      ];
    }

    const zoneCounts = {
      peak: {count: 0, min: 170, max: 190},
      cardio: {count: 0, min: 140, max: 170},
      fatBurn: {count: 0, min: 110, max: 140},
      rest: {count: 0, min: 60, max: 110},
    };

    records.forEach(record => {
      const bpm = record.beatsPerMinute;
      if (bpm >= 170) zoneCounts.peak.count++;
      else if (bpm >= 140) zoneCounts.cardio.count++;
      else if (bpm >= 110) zoneCounts.fatBurn.count++;
      else if (bpm >= 60) zoneCounts.rest.count++;
    });

    const total = records.length;
    const totalMinutes = total; // Assuming 1 record per minute for simplicity

    return [
      {
        name: 'Peak',
        range: '170-190 BPM',
        duration: `${zoneCounts.peak.count} min`,
        color: '#FF4D4F',
        progress: zoneCounts.peak.count / total,
      },
      {
        name: 'Cardio',
        range: '140-170 BPM',
        duration: `${zoneCounts.cardio.count} min`,
        color: '#FF7A45',
        progress: zoneCounts.cardio.count / total,
      },
      {
        name: 'Fat Burn',
        range: '110-140 BPM',
        duration: `${zoneCounts.fatBurn.count} min`,
        color: '#52C41A',
        progress: zoneCounts.fatBurn.count / total,
      },
      {
        name: 'Rest',
        range: '60-110 BPM',
        duration: `${zoneCounts.rest.count} min`,
        color: '#1890FF',
        progress: zoneCounts.rest.count / total,
      },
    ];
  };

  const prepareChartData = (records: HeartRateRecord[]) => {
    if (records.length === 0) return [];
    
    // Sort records by time
    const sortedRecords = [...records].sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    // Group based on active view
    const groupedData: {[key: string]: {sum: number, count: number, date: Date}} = {};
    
    sortedRecords.forEach(record => {
      const date = new Date(record.startTime);
      let key = '';
      let labelKey = '';

      switch (activeView) {
        case 'day':
          key = format(date, 'HH:00');
          labelKey = format(date, 'HH:mm');
          break;
        case 'week':
          key = format(date, 'EEE');
          labelKey = format(date, 'EEE');
          break;
        case 'month':
          key = format(date, 'dd/MM');
          labelKey = format(date, 'dd MMM');
          break;
        case 'year':
          key = format(date, 'MMM');
          labelKey = format(date, 'MMM');
          break;
      }
      
      if (!groupedData[key]) {
        groupedData[key] = {sum: 0, count: 0, date};
      }
      
      groupedData[key].sum += record.beatsPerMinute;
      groupedData[key].count++;
    });
    
    return Object.keys(groupedData).map((key, index) => {
      const {sum, count, date} = groupedData[key];
      const avg = Math.round(sum / count);
      return {
        value: avg,
        label: index % 2 === 0 ? format(date, activeView === 'day' ? 'HH:mm' : 
                                  activeView === 'week' ? 'EEE' : 
                                  activeView === 'month' ? 'dd MMM' : 'MMM') : '',
        date: format(date, 'dd/MM/yyyy HH:mm'),
        originalValue: avg,
      };
    });
  };

  const calculateStats = (records: HeartRateRecord[]) => {
    if (records.length === 0) {
      return {
        average: '--',
        max: '--',
        min: '--',
      };
    }
    
    const values = records.map(r => r.beatsPerMinute);
    const sum = values.reduce((a, b) => a + b, 0);
    const average = Math.round(sum / values.length);
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    return {average, max, min};
  };

  const readSampleData = async () => {
    try {
      setIsLoading(true);
      const isInitialized = await initializeHealthConnect();
      if (!isInitialized) {
        console.log('Health Connect initialization failed');
        return;
      }

      // Calculate date range based on active view
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

      const heartRateData = await fetchHeartRateRecords(startDate.toISOString(), endDate.toISOString());
      const restingHeartRateData = await fetchRestingHeartRateRecords(startDate.toISOString(), endDate.toISOString());

      setHeartRateRecords(heartRateData);
      setRestingHeartRateRecords(restingHeartRateData);
      setHasData(heartRateData.length > 0);

      if (heartRateData.length > 0) {
        const sorted = [...heartRateData].sort((a, b) => 
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
        setCurrentHeartRate(sorted[0].beatsPerMinute);
      } else {
        setCurrentHeartRate(null);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error reading health data:', error);
      setIsLoading(false);
      setHasData(false);
      setCurrentHeartRate(null);
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
    }, [currentDate, activeView]),
  );

  useEffect(() => {
    if (heartRateRecords.length > 0) {
      const filteredRecords = filterRecordsByPeriod(heartRateRecords, activeView, currentDate);
      const chartData = prepareChartData(filteredRecords);
      setChartData(chartData);
      setZoneData(calculateZones(filteredRecords));
    } else {
      setChartData([]);
      setZoneData(calculateZones([]));
    }
  }, [activeView, currentDate, heartRateRecords]);

  const {average, max, min} = calculateStats(
    filterRecordsByPeriod(heartRateRecords, activeView, currentDate)
  );

  const getRestingHeartRate = () => {
    if (restingHeartRateRecords.length === 0) return '--';
    
    const sorted = [...restingHeartRateRecords].sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
    
    return sorted[0].beatsPerMinute;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Heart Rate</Text>
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
        <ScrollView style={styles.content} contentContainerStyle={styles.loadingContent}>
          {/* Current Heart Rate Loader */}
          <ContentLoader 
            speed={1}
            width="100%"
            height={80}
            viewBox="0 0 380 80"
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
          >
            <Rect x="0" y="0" rx="4" ry="4" width="40" height="40" />
            <Rect x="60" y="0" rx="4" ry="4" width="200" height="30" />
            <Rect x="60" y="40" rx="4" ry="4" width="150" height="20" />
          </ContentLoader>

          {/* Chart Loader */}
          <ContentLoader 
            speed={1}
            width="100%"
            height={220}
            viewBox="0 0 380 220"
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
            style={styles.chartContainer}
          >
            <Rect x="0" y="0" rx="4" ry="4" width="200" height="24" />
            <Rect x="0" y="40" rx="8" ry="8" width="100%" height="180" />
          </ContentLoader>

          {/* Zones Loader */}
          <ContentLoader 
            speed={1}
            width="100%"
            height={240}
            viewBox="0 0 380 240"
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
            style={styles.zonesContainer}
          >
            <Rect x="0" y="0" rx="4" ry="4" width="150" height="24" />
            <Rect x="0" y="40" rx="8" ry="8" width="100%" height="48" />
            <Rect x="0" y="104" rx="8" ry="8" width="100%" height="48" />
            <Rect x="0" y="168" rx="8" ry="8" width="100%" height="48" />
          </ContentLoader>

          {/* Stats Loader */}
          <ContentLoader 
            speed={1}
            width="100%"
            height={100}
            viewBox="0 0 380 100"
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
            style={styles.statsContainer}
          >
            <Rect x="0" y="0" rx="8" ry="8" width="30%" height="80" />
            <Rect x="35%" y="0" rx="8" ry="8" width="30%" height="80" />
            <Rect x="70%" y="0" rx="8" ry="8" width="30%" height="80" />
          </ContentLoader>
        </ScrollView>
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {/* Current Heart Rate */}
          <View style={styles.currentRateContainer}>
            <View style={styles.heartIconContainer}>
              <Icon name="heart" size={28} color="#FF4D4F" />
            </View>
            <View style={styles.rateTextContainer}>
              <Text style={styles.currentRate}>
                {currentHeartRate || '--'} <Text style={styles.bpmLabel}>BPM</Text>
              </Text>
              <View style={styles.restingRateContainer}>
                <Text style={styles.restingRateText}>
                  Resting Rate: {getRestingHeartRate()} BPM
                </Text>
                <TouchableOpacity>
                  <Icon
                    name="information-circle-outline"
                    size={16}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Heart Rate Chart */}
          <View style={styles.chartContainer}>
            {chartData.length > 0 ? (
              <>
                <Text style={styles.chartTitle}>
                  {activeView === 'day' ? 'Today' : 
                   activeView === 'week' ? 'This Week' : 
                   activeView === 'month' ? 'This Month' : 'This Year'}'s Heart Rate
                </Text>
                <LineChart
                  data={chartData}
                  height={180}
                  width={width - 32}
                  spacing={(width - 32) / (chartData.length - 1)}
                  initialSpacing={0}
                  color="#FF4D4F"
                  thickness={2}
                  dataPointsColor="#FF4D4F"
                  dataPointsRadius={4}
                  hideRules
                  yAxisColor="transparent"
                  xAxisColor="transparent"
                  yAxisTextStyle={styles.chartAxisText}
                  xAxisLabelTextStyle={styles.chartAxisText}
                  areaChart
                  startFillColor="#FF4D4F"
                  endFillColor="rgba(255, 77, 79, 0.1)"
                  startOpacity={0.8}
                  endOpacity={0.2}
                  rulesType="solid"
                  rulesColor="#E5E7EB"
                  yAxisTextNumberOfLines={1}
                  yAxisLabelWidth={30}
                  noOfSections={4}
                  maxValue={Math.max(...chartData.map(d => d.value)) + 20}
                  minValue={Math.max(0, Math.min(...chartData.map(d => d.value))) - 20}
                  onPress={(item: any) => handleDataPointClick(item)}
                  pointerConfig={{
                    pointerStripHeight: 140,
                    pointerStripColor: 'lightgray',
                    pointerStripWidth: 1,
                    pointerColor: '#FF4D4F',
                    radius: 6,
                    pointerLabelWidth: 100,
                    pointerLabelHeight: 90,
                    activatePointersOnLongPress: true,
                    autoAdjustPointerLabelPosition: true,
                    pointerLabelComponent: (items: any[]) => {
                      return (
                        <View style={styles.pointerLabel}>
                          <Text style={styles.pointerLabelText}>
                            {items[0].date}
                          </Text>
                          <Text style={styles.pointerLabelValue}>
                            {items[0].value} BPM
                          </Text>
                        </View>
                      );
                    },
                  }}
                />
                <Text style={styles.chartDateText}>
                  {formatDate(currentDate)}
                </Text>
              </>
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No heart rate data available</Text>
              </View>
            )}
          </View>

          {/* Heart Rate Zones */}
          <View style={styles.zonesContainer}>
            <Text style={styles.zonesTitle}>Heart Rate Zones</Text>

            {zoneData.map((zone, index) => (
              <View key={index} style={styles.zoneCard}>
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

          {/* Summary Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{average}</Text>
              <Text style={styles.statLabel}>Average</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{max}</Text>
              <Text style={styles.statLabel}>Maximum</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{min}</Text>
              <Text style={styles.statLabel}>Minimum</Text>
            </View>
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
          ]}
        >
          <TouchableOpacity 
            style={styles.pointDetailsCloseButton}
            onPress={hidePointDetails}
          >
            <Icon name="close" size={20} color="#000" />
          </TouchableOpacity>
          <Text style={styles.pointDetailsTitle}>Heart Rate Details</Text>
          <Text style={styles.pointDetailsText}>
            <Text style={styles.pointDetailsLabel}>Time: </Text>
            {selectedPoint.date}
          </Text>
          <Text style={styles.pointDetailsText}>
            <Text style={styles.pointDetailsLabel}>BPM: </Text>
            {selectedPoint.value}
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
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContent: {
    paddingBottom: 32, // Add bottom padding for loading state
  },
  scrollContent: {
    paddingBottom: 32, // Add bottom padding for content
  },
  currentRateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  heartIconContainer: {
    marginRight: 12,
  },
  rateTextContainer: {
    flex: 1,
  },
  currentRate: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000000',
  },
  bpmLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748B',
  },
  restingRateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restingRateText: {
    fontSize: 14,
    color: '#64748B',
    marginRight: 4,
  },
  chartContainer: {
    marginBottom: 24,
    paddingVertical: 8,
    height: 220,
    justifyContent: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  chartDateText: {
    textAlign: 'center',
    marginTop: 8,
    color: '#64748B',
    fontSize: 12,
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
  chartAxisText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  zonesContainer: {
    marginBottom: 24,
  },
  zonesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  zoneCard: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    marginBottom: 8,
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  statItem: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
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