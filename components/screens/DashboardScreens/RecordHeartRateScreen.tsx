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
import {fetchHeartRateRecords, initializeHealthConnect} from '../../utils/utils_healthconnect';
import {useFocusEffect} from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

const {width} = Dimensions.get('window');
const CHART_WIDTH = width - 32;
export const PRIMARY_COLOR = '#FF4D4F';

const HeartRateScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeView, setActiveView] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [heartRateRecords, setHeartRateRecords] = useState<any[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [showPointDetails, setShowPointDetails] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'month' | 'year'>('date');
  const pointDetailsPosition = useRef(new Animated.Value(0)).current;
  const spinValue = useRef(new Animated.Value(0)).current;
  const [restingHeartRate, setRestingHeartRate] = useState<number | null>(null);

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
    readHeartRateData();
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
        value: record.beatsPerMinute,
        label: index % 3 === 0 ? format(parseISO(record.startTime), 'h:mm a') : '',
        date: format(parseISO(record.startTime), 'MM/dd/yyyy h:mm a'),
        originalValue: record.beatsPerMinute,
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
      
      dailyData[dayKey].sum += record.beatsPerMinute;
      dailyData[dayKey].count++;
    });
    
    return Object.keys(dailyData).map((dayKey, index) => {
      const {sum, count, date} = dailyData[dayKey];
      const avg = Math.round(sum / count);
      return {
        value: avg,
        label: index % 2 === 0 ? format(date, 'MMM d') : '',
        date: format(date, 'MM/dd/yyyy'),
        originalValue: avg,
        labelTextStyle: {width: 50, color: '#94A3B8', fontSize: 10},
      };
    });
  };

  const calculateStats = (records: any[]) => {
    if (records.length === 0) return {average: 0, max: 0, min: 0};
    
    const values = records.map(r => r.beatsPerMinute);
    const sum = values.reduce((a, b) => a + b, 0);
    return {
      average: Math.round(sum / values.length),
      max: Math.max(...values),
      min: Math.min(...values),
    };
  };

  const calculateHeartRateZones = (maxBpm: number) => {
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
    const totalMinutes = records.length;
    
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

      const heartRateData = await fetchHeartRateRecords(
        startDate.toISOString(),
        endDate.toISOString()
      );
      setHeartRateRecords(heartRateData);

      if (heartRateData.length > 0) {
        const minBpm = Math.min(...heartRateData.map(r => r.beatsPerMinute));
        setRestingHeartRate(minBpm);
      }
    } catch (error) {
      console.log('Error reading heart rate data:', error);
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

  const viewLabels = {
    day: 'Day',
    week: 'Week',
    month: 'Month',
    year: 'Year'
  };

  useFocusEffect(useCallback(() => { readHeartRateData(); }, [currentDate, activeView]));

  const filteredRecords = filterRecordsByPeriod(heartRateRecords, activeView, currentDate);
  const lineData = prepareLineChartData(filteredRecords);
  const stats = calculateStats(filteredRecords);
  const heartRateZones = calculateTimeInZones(
    filteredRecords,
    calculateHeartRateZones(stats.max)
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Heart Rate</Text>
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
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <View style={styles.heartIconContainer}>
                <Icon name="heart" size={28} color={PRIMARY_COLOR} />
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
                      <Text style={styles.pointerLabelValue}>{items[0].value} BPM</Text>
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
                <Text style={styles.noDataText}>No heart rate data available</Text>
              </View>
            )}
          </View>

          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Statistics</Text>
            <View style={styles.statsGrid}>
              {['average', 'max', 'min'].map(stat => (
                <View key={stat} style={styles.statsItem}>
                  <Text style={styles.statsLabel}>{stat.charAt(0).toUpperCase() + stat.slice(1)}</Text>
                  <Text style={styles.statsValue}>{stats[stat]} BPM</Text>
                </View>
              ))}
            </View>
          </View>

          {heartRateZones.length > 0 && (
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
          )}

          <View style={styles.infoContainer}>
            <Text style={styles.sectionTitle}>About Heart Rate (BPM)</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>What is Heart Rate?</Text>
              <Text style={styles.infoText}>
                Heart rate, measured in beats per minute (BPM), is the number of times your heart beats in one minute. 
                It's a key indicator of cardiovascular health and fitness level.
              </Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Normal Heart Rate Ranges</Text>
              <Text style={styles.infoText}>
                • Resting: 60-100 BPM (athletes may have 40-60 BPM){"\n"}
                • Moderate exercise: 50-70% of max heart rate{"\n"}
                • Vigorous exercise: 70-85% of max heart rate{"\n"}
                • Maximum heart rate: ~220 minus your age
              </Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Health Implications</Text>
              <Text style={styles.infoText}>
                Consistently high resting heart rate may indicate increased risk of heart disease. 
                Regular exercise typically lowers resting heart rate as the heart becomes more efficient.
              </Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Tracking Benefits</Text>
              <Text style={styles.infoText}>
                Monitoring heart rate helps:{"\n"}
                • Optimize workout intensity{"\n"}
                • Track fitness progress{"\n"}
                • Identify potential health issues{"\n"}
                • Manage stress levels
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
  activeToggle: {backgroundColor: '#FF4D4F'},
  viewToggleText: {fontSize: 14, color: '#64748B'},
  activeToggleText: {color: '#FFFFFF', fontWeight: '600'},
  dateNavigation: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16},
  currentDateText: {fontSize: 16, fontWeight: '500'},
  summaryContainer: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, gap: 8},
  summaryItem: {flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2},
  heartIconContainer: {marginBottom: 8},
  summaryLabel: {fontSize: 14, color: '#64748B', marginBottom: 4},
  summaryValue: {fontSize: 24, fontWeight: '700'},
  bpmLabel: {fontSize: 16, color: '#64748B', fontWeight: '500'},
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
  zonesContainer: {backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 16},
  zoneContainer: {marginBottom: 8, backgroundColor: '#F9FAFB', borderRadius: 8, padding: 12},
  zoneItem: {marginBottom: 0},
  zoneInfo: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4},
  zoneName: {fontSize: 16, fontWeight: '500'},
  zoneRange: {fontSize: 14, color: '#64748B'},
  zoneDurationContainer: {alignItems: 'flex-end', marginBottom: 8},
  zoneDuration: {fontSize: 14, color: '#64748B'},
  progressBarBackground: {height: 4, backgroundColor: '#F1F5F9', borderRadius: 2, overflow: 'hidden'},
  progressBar: {height: '100%', borderRadius: 2},
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
  infoTitle: {fontSize: 16, fontWeight: '600', color: '#FF4D4F', marginBottom: 8},
  infoText: {fontSize: 14, color: '#64748B', lineHeight: 20},
});

export default HeartRateScreen;