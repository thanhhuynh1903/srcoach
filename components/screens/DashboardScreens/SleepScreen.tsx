import React, {useCallback, useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import BackButton from '../../BackButton';
import {PieChart} from 'react-native-gifted-charts';
import {useFocusEffect} from '@react-navigation/native';
import { fetchSleepRecords, initializeHealthConnect, SleepSessionRecord } from '../../utils/utils_healthconnect';

const SleepScreen = () => {
  const [activeView, setActiveView] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sleepRecords, setSleepRecords] = useState<SleepSessionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Process sleep records into displayable data
  const processSleepData = (records: SleepSessionRecord[]) => {
    if (!records || records.length === 0) {
      return {
        pieData: [],
        chartData: [],
        metrics: {
          score: 0,
          heartRate: 0,
          breathing: 0,
          bloodOxygen: 0,
        },
        duration: '0h 0m',
        quality: 'No data',
        timeRange: '--:-- - --:--',
        stages: {
          deep: 0,
          light: 0,
          rem: 0,
          awake: 0,
        }
      };
    }

    // Calculate sleep stages duration in minutes
    let deep = 0, light = 0, rem = 0, awake = 0;
    let totalDuration = 0;

    records.forEach(record => {
      const start = new Date(record.startTime);
      const end = new Date(record.endTime);
      const duration = (end.getTime() - start.getTime()) / (1000 * 60); // in minutes

      switch(record.stage) {
        case 'DEEP':
          deep += duration;
          break;
        case 'LIGHT':
          light += duration;
          break;
        case 'REM':
          rem += duration;
          break;
        case 'AWAKE':
          awake += duration;
          break;
      }

      totalDuration += duration;
    });

    // Format for pie chart
    const pieData = [
      {value: deep, color: '#6C5CE7', text: Math.round(deep).toString(), legend: 'Deep Sleep'},
      {value: light, color: '#A29BFE', text: Math.round(light).toString(), legend: 'Light Sleep'},
      {value: rem, color: '#6C5CE7', text: Math.round(rem).toString(), legend: 'REM'},
      {value: awake, color: '#E9E5FF', text: Math.round(awake).toString(), legend: 'Awake'},
    ];

    // Format duration (hours and minutes)
    const hours = Math.floor(totalDuration / 60);
    const minutes = Math.round(totalDuration % 60);
    const durationText = `${hours}h ${minutes}m`;

    // Get time range (first record start to last record end)
    const firstRecord = records[0];
    const lastRecord = records[records.length - 1];
    const startTime = new Date(firstRecord.startTime);
    const endTime = new Date(lastRecord.endTime);

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    };

    const timeRangeText = `${formatTime(startTime)} - ${formatTime(endTime)}`;

    const chartData = Array(7).fill(0).map((_, i) => ({
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
      hours: Math.random() * 2 + 5
    }));

    return {
      pieData,
      chartData,
      metrics: {
        score: Math.min(100, Math.round(80 + (deep / totalDuration * 20))) || 0,
        heartRate: 60 + Math.round(Math.random() * 10),
        breathing: 12 + Math.round(Math.random() * 4),
        bloodOxygen: 95 + Math.round(Math.random() * 3),
      },
      duration: durationText,
      quality: getSleepQuality(deep / totalDuration),
      timeRange: timeRangeText,
      stages: {
        deep,
        light,
        rem,
        awake
      }
    };
  };

  const getSleepQuality = (deepSleepRatio: number): string => {
    if (deepSleepRatio > 0.25) return 'Excellent';
    if (deepSleepRatio > 0.2) return 'Good';
    if (deepSleepRatio > 0.15) return 'Fair';
    return 'Poor';
  };

  const initializeHealthData = async () => {
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
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - startDate.getDay()); // Start of week
          endDate.setDate(startDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'month':
          startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
          endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'year':
          startDate = new Date(startDate.getFullYear(), 0, 1);
          endDate = new Date(startDate.getFullYear(), 11, 31);
          endDate.setHours(23, 59, 59, 999);
          break;
      }

      const records = await fetchSleepRecords(startDate.toISOString(), endDate.toISOString());
      setSleepRecords(records);
    } catch (error) {
      console.error('Error initializing health data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      initializeHealthData();
    }, [currentDate, activeView]),
  );

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
        const start = new Date(date);
        start.setDate(start.getDate() - start.getDay());
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case 'month':
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case 'year':
        return date.getFullYear().toString();
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

  const sleepData = processSleepData(sleepRecords);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sleep measurement</Text>
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
          <Text>Loading sleep data...</Text>
        </View>
      ) : sleepRecords.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text>No sleep data available</Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {/* Date and Sleep Duration */}
          <View style={styles.dateContainer}>
            <Text style={styles.durationText}>{sleepData.duration}</Text>
            <Text style={styles.qualityText}>{sleepData.quality} sleep quality</Text>
            {activeView === 'day' && <Text style={styles.timeRangeText}>{sleepData.timeRange}</Text>}
          </View>

          {/* Sleep Stages */}
          {sleepData.pieData.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Sleep Stages</Text>
              <View style={styles.chartContainer}>
                <PieChart
                  data={sleepData.pieData}
                  donut
                  radius={80}
                  innerRadius={60}
                  centerLabelComponent={() => (
                    <View style={styles.centerLabel}>
                      <Text style={styles.centerLabelText}>Total</Text>
                      <Text style={styles.centerLabelText}>{sleepData.duration}</Text>
                    </View>
                  )}
                />
              </View>

              <View style={styles.stagesLegend}>
                <View style={styles.legendRow}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, {backgroundColor: '#6C5CE7'}]} />
                    <Text style={styles.legendLabel}>Deep Sleep</Text>
                    <Text style={styles.legendValue}>{Math.round(sleepData.stages.deep / 60)}h {Math.round(sleepData.stages.deep % 60)}m</Text>
                  </View>

                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, {backgroundColor: '#A29BFE'}]} />
                    <Text style={styles.legendLabel}>Light Sleep</Text>
                    <Text style={styles.legendValue}>{Math.round(sleepData.stages.light / 60)}h {Math.round(sleepData.stages.light % 60)}m</Text>
                  </View>
                </View>

                <View style={styles.legendRow}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, {backgroundColor: '#6C5CE7'}]} />
                    <Text style={styles.legendLabel}>REM</Text>
                    <Text style={styles.legendValue}>{Math.round(sleepData.stages.rem / 60)}h {Math.round(sleepData.stages.rem % 60)}m</Text>
                  </View>

                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, {backgroundColor: '#E9E5FF'}]} />
                    <Text style={styles.legendLabel}>Awake</Text>
                    <Text style={styles.legendValue}>{Math.round(sleepData.stages.awake / 60)}h {Math.round(sleepData.stages.awake % 60)}m</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Health Metrics */}
          <View style={styles.metricsContainer}>
            <View style={styles.metricRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Sleep Score</Text>
                <Text style={[styles.metricValue, {color: '#6C5CE7'}]}>
                  {sleepData.metrics.score}
                </Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Heart Rate</Text>
                <Text style={[styles.metricValue, {color: '#FF4D4F'}]}>
                  {sleepData.metrics.heartRate}<Text style={styles.metricUnit}>BPM avg.</Text>
                </Text>
              </View>
            </View>

            <View style={styles.metricRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Breathing</Text>
                <Text style={[styles.metricValue, {color: '#10B981'}]}>
                  {sleepData.metrics.breathing}<Text style={styles.metricUnit}>br/min</Text>
                </Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Blood Oxygen</Text>
                <Text style={[styles.metricValue, {color: '#3B82F6'}]}>
                  {sleepData.metrics.bloodOxygen}<Text style={styles.metricUnit}>%</Text>
                </Text>
              </View>
            </View>
          </View>

          {/* Weekly Chart */}
          <View style={styles.weeklyContainer}>
            <Text style={styles.sectionTitle}>
              {activeView === 'day' ? 'This Week' : 
              activeView === 'week' ? 'Weekly Overview' :
              activeView === 'month' ? 'Monthly Overview' : 'Yearly Overview'}
            </Text>

            <View style={styles.weeklyChart}>
              {sleepData.chartData.map((item, index) => (
                <View key={index} style={styles.weeklyBarContainer}>
                  <View
                    style={[
                      styles.weeklyBar,
                      {
                        height: `${(item.hours / 10) * 100}%`,
                        backgroundColor:
                          index === 2 || index === 4 || index === 6
                            ? '#6C5CE7'
                            : '#A29BFE',
                      },
                    ]}
                  />
                  <Text style={styles.weeklyBarLabel}>{item.day}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.notesContainer}>
            <Text style={styles.sectionTitle}>Insights</Text>
            <View style={styles.tagsContainer}>
              {sleepData.stages.deep / (sleepData.stages.deep + sleepData.stages.light + sleepData.stages.rem) > 0.2 && (
                <View style={[styles.tag, {backgroundColor: '#F0EEFF'}]}>
                  <Text style={[styles.tagText, {color: '#6C5CE7'}]}>Good deep sleep</Text>
                </View>
              )}
              {sleepData.stages.awake / (sleepData.stages.deep + sleepData.stages.light + sleepData.stages.rem + sleepData.stages.awake) < 0.1 && (
                <View style={[styles.tag, {backgroundColor: '#E6F7EF'}]}>
                  <Text style={[styles.tagText, {color: '#10B981'}]}>Few awakenings</Text>
                </View>
              )}
              {sleepData.metrics.score > 80 && (
                <View style={[styles.tag, {backgroundColor: '#EFF6FF'}]}>
                  <Text style={[styles.tagText, {color: '#3B82F6'}]}>High sleep score</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
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
    backgroundColor: '#6C5CE7',
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
    color: '#6C5CE7',
    paddingHorizontal: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  dateContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
  },
  durationText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  qualityText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#6C5CE7',
    marginBottom: 4,
  },
  timeRangeText: {
    fontSize: 14,
    color: '#64748B',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  centerLabel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabelText: {
    fontSize: 14,
    color: '#000000',
  },
  stagesLegend: {
    marginTop: 8,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '45%',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 4,
  },
  legendLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  legendValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  metricsContainer: {
    marginBottom: 24,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricItem: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    width: '48%',
  },
  metricLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '600',
  },
  metricUnit: {
    fontSize: 14,
    fontWeight: '400',
    color: '#64748B',
  },
  weeklyContainer: {
    marginBottom: 24,
  },
  weeklyChart: {
    height: 120,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  weeklyBarContainer: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  weeklyBar: {
    width: '100%',
    borderRadius: 4,
  },
  weeklyBarLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  notesContainer: {
    marginBottom: 24,
  },
  tagsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SleepScreen;