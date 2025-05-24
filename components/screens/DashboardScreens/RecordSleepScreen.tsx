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
  Modal,
} from 'react-native';
import {PieChart, BarChart} from 'react-native-gifted-charts';
import ContentLoader, {Rect} from 'react-content-loader/native';
import BackButton from '../../BackButton';
import {
  parseISO,
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  differenceInMinutes,
} from 'date-fns';
import Icon from '@react-native-vector-icons/ionicons';
import {fetchSleepRecords} from '../../utils/utils_healthconnect';
import {useFocusEffect} from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {ChevronDown, ChevronUp} from 'react-native-feather';

const {width} = Dimensions.get('window');
const CHART_WIDTH = width - 32;
export const PRIMARY_COLOR = '#6C5CE7';

const SleepType = {
  UNKNOWN: 0,
  AWAKE: 1,
  SLEEPING: 2,
  OUT_OF_BED: 3,
  LIGHT: 4,
  DEEP: 5,
  REM: 6,
  AWAKE_IN_BED: 7,
} as const;

interface SleepStage {
  stage: number;
  start_time: string;
  end_time: string;
  duration_minutes: number;
}

interface SleepRecord {
  id: string;
  startTime: string;
  endTime: string;
  stages: SleepStage[];
  dataOrigin: string;
  sleepScore?: number;
  avgHeartRate?: number;
  avgBreathing?: number;
  avgSpO2?: number;
}

interface ProcessedSleepData {
  id: string;
  sessions: SleepRecord[];
  pieData: {
    value: number;
    color: string;
    text: string;
    legend: string;
  }[];
  metrics: {
    score: number | string;
    heartRate: number;
    breathing: number;
    bloodOxygen: number;
  };
  duration: string;
  quality: string;
  timeRange: string;
  stages: {
    deep: number;
    light: number;
    rem: number;
    awake: number;
    unknown: number;
  };
}

const SleepScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeView, setActiveView] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'month' | 'year'>('date');
  const spinValue = useRef(new Animated.Value(0)).current;
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

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
      }),
    ).start();
    readSleepData();
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const processSleepData = (records: SleepRecord[]): ProcessedSleepData[] => {
    return records.map(record => {
      let deep = 0, light = 0, rem = 0, awake = 0, unknown = 0;
      
      record.stages.forEach(stage => {
        const duration = stage.duration_minutes;
        switch (stage.stage) {
          case SleepType.DEEP: 
            deep += duration; 
            break;
          case SleepType.LIGHT: 
            light += duration; 
            break;
          case SleepType.REM: 
            rem += duration; 
            break;
          case SleepType.AWAKE:
          case SleepType.AWAKE_IN_BED: 
            awake += duration; 
            break;
          case SleepType.SLEEPING: 
            light += duration; 
            break;
          default: 
            unknown += duration;
        }
      });

      const totalDuration = deep + light + rem + awake + unknown;
      const hours = Math.floor(totalDuration / 60);
      const minutes = Math.round(totalDuration % 60);
      const durationText = `${hours}h ${minutes}m`;

      const formatTime = (date: Date) => format(date, 'h:mm a');
      const start = new Date(record.startTime);
      const end = new Date(record.endTime);
      const timeRangeText = `${formatTime(start)} - ${formatTime(end)}`;

      const deepSleepRatio = totalDuration > 0 ? deep / totalDuration : 0;
      const totalSleepHours = totalDuration / 60;

      const sleepScore = record.sleepScore ? parseFloat(record.sleepScore.toFixed(2)) : 
        calculateSleepScore(totalSleepHours, deepSleepRatio);

      return {
        id: record.id,
        sessions: [record],
        pieData: [
          {value: deep, color: '#6C5CE7', text: Math.round(deep).toString(), legend: 'Deep Sleep'},
          {value: light, color: '#A29BFE', text: Math.round(light).toString(), legend: 'Light Sleep'},
          {value: rem, color: '#6C5CE7', text: Math.round(rem).toString(), legend: 'REM'},
          {value: awake, color: '#E9E5FF', text: Math.round(awake).toString(), legend: 'Awake'},
          {value: unknown, color: '#494949', text: Math.round(unknown).toString(), legend: 'Unknown'},
        ],
        metrics: {
          score: sleepScore,
          heartRate: Math.round(record.avgHeartRate || 60 + Math.random() * 10),
          breathing: Math.round(record.avgBreathing || 12 + Math.random() * 4),
          bloodOxygen: Math.round(record.avgSpO2 || 95 + Math.random() * 3),
        },
        duration: durationText,
        quality: getSleepQuality(totalSleepHours, deepSleepRatio),
        timeRange: timeRangeText,
        stages: {deep, light, rem, awake, unknown},
      };
    });
  };

  const calculateSleepScore = (totalHours: number, deepSleepRatio: number): number | string => {
    if (totalHours <= 0) return '--';
    const hoursScore = Math.min(100, Math.max(0, (totalHours / 8) * 50));
    const deepSleepScore = Math.min(50, deepSleepRatio * 100);
    return parseFloat((hoursScore + deepSleepScore).toFixed(2));
  };

  const getSleepQuality = (totalHours: number, deepSleepRatio: number): string => {
    if (totalHours <= 0) return 'No data';
    if (totalHours >= 7 && deepSleepRatio >= 0.2) return 'Excellent';
    if (totalHours >= 6.5 && deepSleepRatio >= 0.15) return 'Good';
    if (totalHours >= 6 || deepSleepRatio >= 0.1) return 'Fair';
    return 'Poor';
  };

  const filterRecordsByPeriod = (records: SleepRecord[], view: 'day' | 'week' | 'month' | 'year', date: Date) => {
    let startDate: Date, endDate: Date;

    switch (view) {
      case 'day':
        startDate = new Date(date.setHours(0, 0, 0, 0));
        endDate = new Date(date.setHours(23, 59, 59, 999));
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
        startDate = new Date(date.setHours(0, 0, 0, 0));
        endDate = new Date(date.setHours(23, 59, 59, 999));
    }

    return records.filter(record => {
      const recordDate = parseISO(record.startTime);
      return recordDate >= startDate && recordDate <= endDate;
    });
  };

  const readSleepData = async () => {
    try {
      setIsLoading(true);
      let startDate: Date, endDate: Date;

      switch (activeView) {
        case 'day':
          startDate = new Date(currentDate.setHours(0, 0, 0, 0));
          endDate = new Date(currentDate.setHours(23, 59, 59, 999));
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

      const sleepData = await fetchSleepRecords(startDate.toISOString(), endDate.toISOString());
      setSleepRecords(sleepData);
    } catch (error) {
      console.log('Error reading sleep data:', error);
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
      if (activeView === 'week') newDate = startOfWeek(selectedDate);
      else if (activeView === 'month') newDate = startOfMonth(selectedDate);
      else if (activeView === 'year') newDate = startOfYear(selectedDate);
      setCurrentDate(newDate);
    }
  };

  const showPicker = () => {
    if (Platform.OS === 'android') {
      setPickerMode(activeView === 'month' ? 'month' : activeView === 'year' ? 'year' : 'date');
    }
    setShowDatePicker(true);
  };

  const handleViewChange = (view: 'day' | 'week' | 'month' | 'year') => setActiveView(view);

  const changeDate = (direction: 'prev' | 'next') => {
    const ops = {prev: [subDays, subWeeks, subMonths, subYears], next: [addDays, addWeeks, addMonths, addYears]};
    const viewIndex = ['day', 'week', 'month', 'year'].indexOf(activeView);
    setCurrentDate(ops[direction][viewIndex](currentDate, 1));
  };

  const formatDate = (date: Date, view: 'day' | 'week' | 'month' | 'year') => {
    switch (view) {
      case 'day':
        return format(date, 'MMM dd, yyyy');
      case 'week':
        return `${format(startOfWeek(date), 'MMM d')} - ${format(endOfWeek(date), 'MMM d, yyyy')}`;
      case 'month':
        return format(date, 'MMMM yyyy');
      case 'year':
        return format(date, 'yyyy');
      default:
        return format(date, 'MMM dd, yyyy');
    }
  };

  const getTotalSleepTime = (records: SleepRecord[]) => {
    const totalMinutes = records.reduce((sum, record) => {
      return sum + differenceInMinutes(new Date(record.endTime), new Date(record.startTime));
    }, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return `${hours}h ${minutes}m`;
  };

  const getBarChartData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map((day, i) => {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - date.getDay() + i);
      const dayRecords = filterRecordsByPeriod(sleepRecords, 'day', date);
      const totalMinutes = dayRecords.reduce((sum, record) => {
        return sum + differenceInMinutes(new Date(record.endTime), new Date(record.startTime));
      }, 0);
      return {value: totalMinutes / 60, label: day, frontColor: i % 2 === 0 ? PRIMARY_COLOR : '#A29BFE'};
    });
  };

  useFocusEffect(useCallback(() => { readSleepData(); }, [currentDate, activeView]));

  const filteredRecords = filterRecordsByPeriod(sleepRecords, activeView, currentDate);
  const sleepDataGroups = processSleepData(filteredRecords);
  const barData = getBarChartData();
  const totalSleepTime = getTotalSleepTime(filteredRecords);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sleep</Text>
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
            <Text style={[styles.viewToggleText, activeView === view && styles.activeToggleText]}>
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.dateNavigation}>
        <TouchableOpacity onPress={() => changeDate('prev')}>
          <Icon name="chevron-back" size={20} color={PRIMARY_COLOR} />
        </TouchableOpacity>
        <TouchableOpacity onPress={showPicker}>
          <Text style={styles.currentDateText}>{formatDate(currentDate, activeView)}</Text>
          <Text style={styles.totalSleepText}>Total: {totalSleepTime}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => changeDate('next')}>
          <Icon name="chevron-forward" size={20} color={PRIMARY_COLOR} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.content}>
          <ContentLoader speed={1} width="100%" height={100} viewBox="0 0 380 100"
            backgroundColor="#f3f3f3" foregroundColor="#ecebeb">
            <Rect x="0" y="0" rx="16" ry="16" width="100%" height="100" />
          </ContentLoader>
          <ContentLoader speed={1} width="100%" height={250} viewBox="0 0 380 250"
            backgroundColor="#f3f3f3" foregroundColor="#ecebeb" style={styles.chartContainer}>
            <Rect x="0" y="0" rx="4" ry="4" width="120" height="24" />
            <Rect x="0" y="34" rx="4" ry="4" width="180" height="16" />
            <Rect x="0" y="70" rx="8" ry="8" width="100%" height="180" />
          </ContentLoader>
        </View>
      ) : sleepDataGroups.length === 0 ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No sleep data available</Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {sleepDataGroups.map((group, index) => (
            <View key={group.id} style={styles.sessionContainer}>
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionTitle}>Sleep Session {index + 1}</Text>
                <Text style={styles.sessionDuration}>{group.duration}</Text>
              </View>
              <Text style={styles.sessionTime}>{group.timeRange}</Text>
              <Text style={styles.sessionQuality}>{group.quality} sleep quality</Text>

              <TouchableOpacity 
                style={styles.sectionHeader} 
                onPress={() => toggleSection(`stages-${group.id}`)}>
                <Text style={styles.sectionTitle}>Sleep Stages</Text>
                {expandedSections[`stages-${group.id}`] ? 
                  <ChevronUp width={20} height={20} color={PRIMARY_COLOR} /> : 
                  <ChevronDown width={20} height={20} color={PRIMARY_COLOR} />}
              </TouchableOpacity>

              {expandedSections[`stages-${group.id}`] && (
                <>
                  <View style={styles.chartContainer}>
                    <PieChart
                      data={group.pieData}
                      donut
                      radius={80}
                      innerRadius={60}
                      centerLabelComponent={() => (
                        <View style={styles.centerLabel}>
                          <Text style={styles.centerLabelText}>Total</Text>
                          <Text style={styles.centerLabelText}>{group.duration}</Text>
                        </View>
                      )}
                    />
                  </View>

                  <View style={styles.stagesLegend}>
                    {Object.entries(group.stages).map(([key, value]) => (
                      <View key={key} style={styles.legendItem}>
                        <View style={[styles.legendDot, {backgroundColor: 
                          key === 'deep' || key === 'rem' ? '#6C5CE7' : 
                          key === 'light' ? '#A29BFE' : '#E9E5FF'}]} />
                        <Text style={styles.legendLabel}>{key.charAt(0).toUpperCase() + key.slice(1)} Sleep</Text>
                        <Text style={styles.legendValue}>
                          {Math.round(value / 60)}h {Math.round(value % 60)}m
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              <TouchableOpacity 
                style={styles.sectionHeader} 
                onPress={() => toggleSection(`metrics-${group.id}`)}>
                <Text style={styles.sectionTitle}>Health Metrics</Text>
                {expandedSections[`metrics-${group.id}`] ? 
                  <ChevronUp width={20} height={20} color={PRIMARY_COLOR} /> : 
                  <ChevronDown width={20} height={20} color={PRIMARY_COLOR} />}
              </TouchableOpacity>

              {expandedSections[`metrics-${group.id}`] && (
                <View style={styles.metricsContainer}>
                  <View style={styles.metricRow}>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Sleep Score</Text>
                      <Text style={[styles.metricValue, {color: PRIMARY_COLOR}]}>{group.metrics.score}</Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Heart Rate</Text>
                      <Text style={[styles.metricValue, {color: '#FF4D4F'}]}>
                        {group.metrics.heartRate}<Text style={styles.metricUnit}>BPM avg.</Text>
                      </Text>
                    </View>
                  </View>
                  <View style={styles.metricRow}>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Breathing</Text>
                      <Text style={[styles.metricValue, {color: '#10B981'}]}>
                        {group.metrics.breathing}<Text style={styles.metricUnit}>br/min</Text>
                      </Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Blood Oxygen</Text>
                      <Text style={[styles.metricValue, {color: '#3B82F6'}]}>
                        {group.metrics.bloodOxygen}<Text style={styles.metricUnit}>%</Text>
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          ))}

          <TouchableOpacity 
            style={styles.sectionHeader} 
            onPress={() => toggleSection('overview')}>
            <Text style={styles.sectionTitle}>Weekly Overview</Text>
            {expandedSections['overview'] ? 
              <ChevronUp width={20} height={20} color={PRIMARY_COLOR} /> : 
              <ChevronDown width={20} height={20} color={PRIMARY_COLOR} />}
          </TouchableOpacity>

          {expandedSections['overview'] && (
            <View style={styles.chartContainer}>
              <BarChart
                data={barData}
                barWidth={22}
                spacing={24}
                roundedTop
                xAxisLabelTextStyle={{color: '#64748B', fontSize: 12}}
                yAxisTextStyle={{color: '#64748B'}}
                yAxisSuffix="h"
                noOfSections={5}
                maxValue={10}
                height={200}
                initialSpacing={10}
              />
            </View>
          )}

          <View style={styles.infoContainer}>
            <Text style={styles.sectionTitle}>About Sleep</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Why is Sleep Important?</Text>
              <Text style={styles.infoText}>
                Quality sleep is essential for physical health, mental clarity, and emotional well-being. Adults typically need 7-9 hours of sleep per night for optimal health.
              </Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Sleep Stages</Text>
              <Text style={styles.infoText}>
                • Deep Sleep: Restores physical energy{'\n'}• Light Sleep: Prepares body for deep sleep{'\n'}• REM Sleep: Important for memory and learning{'\n'}• Awake: Brief awakenings are normal
              </Text>
            </View>
          </View>
        </ScrollView>
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
  activeToggle: {backgroundColor: '#6C5CE7'},
  viewToggleText: {fontSize: 14, color: '#64748B'},
  activeToggleText: {color: '#FFFFFF', fontWeight: '600'},
  dateNavigation: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16},
  currentDateText: {fontSize: 16, fontWeight: '500', textAlign: 'center'},
  totalSleepText: {fontSize: 14, color: '#64748B', textAlign: 'center'},
  sessionContainer: {backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2},
  sessionHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8},
  sessionTitle: {fontSize: 18, fontWeight: '600'},
  sessionDuration: {fontSize: 16, fontWeight: '600', color: '#6C5CE7'},
  sessionTime: {fontSize: 14, color: '#64748B', marginBottom: 4},
  sessionQuality: {fontSize: 14, fontWeight: '500', color: '#6C5CE7', marginBottom: 16},
  sectionHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingVertical: 8},
  sectionTitle: {fontSize: 18, fontWeight: '600'},
  chartContainer: {alignItems: 'center', marginBottom: 16},
  centerLabel: {alignItems: 'center', justifyContent: 'center'},
  centerLabelText: {fontSize: 14, color: '#000000'},
  stagesLegend: {marginTop: 8},
  legendItem: {flexDirection: 'row', alignItems: 'center', marginBottom: 8},
  legendDot: {width: 10, height: 10, borderRadius: 5, marginRight: 8},
  legendLabel: {fontSize: 14, color: '#64748B', marginRight: 8},
  legendValue: {fontSize: 14, fontWeight: '500', color: '#000000'},
  metricsContainer: {marginBottom: 16},
  metricRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16},
  metricItem: {backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, width: '48%', borderWidth: 1, borderColor: '#E5E7EB'},
  metricLabel: {fontSize: 14, color: '#64748B', marginBottom: 4},
  metricValue: {fontSize: 24, fontWeight: '600'},
  metricUnit: {fontSize: 14, fontWeight: '400', color: '#64748B'},
  infoContainer: {marginBottom: 24, backgroundColor: '#fff', padding: 16, borderRadius: 16},
  infoCard: {backgroundColor: '#F9FAFB', borderRadius: 8, padding: 16, marginBottom: 16},
  infoTitle: {fontSize: 16, fontWeight: '600', color: '#6C5CE7', marginBottom: 8},
  infoText: {fontSize: 14, color: '#64748B', lineHeight: 20},
  noDataContainer: {justifyContent: 'center', alignItems: 'center', height: 180},
  noDataText: {fontSize: 16, color: '#64748B'},
});

export default SleepScreen;