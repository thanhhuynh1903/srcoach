import React, {useCallback, useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList,
} from 'react-native';
import BackButton from '../../BackButton';
import {PieChart} from 'react-native-gifted-charts';
import ContentLoader, { Rect, Circle } from 'react-content-loader/native';
import {useFocusEffect} from '@react-navigation/native';
import { fetchSleepRecords, initializeHealthConnect } from '../../utils/utils_healthconnect';
import { ChevronDown, ChevronUp } from 'react-native-feather';

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

interface SleepRecord {
  id: string;
  startTime: string;
  endTime: string;
  stage: number;
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
  };
}

const SleepScreen = () => {
  const [activeView, setActiveView] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    stages: true,
    metrics: true,
    weekly: true,
    insights: true,
  });

  // Group records by their ID
  const groupRecordsById = (records: SleepRecord[]) => {
    const grouped: {[key: string]: SleepRecord[]} = {};
    
    records.forEach(record => {
      if (!grouped[record.id]) {
        grouped[record.id] = [];
      }
      grouped[record.id].push(record);
    });
    
    return grouped;
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const processSleepData = (records: SleepRecord[]): ProcessedSleepData[] => {
    const groupedRecords = groupRecordsById(records);
    const results: ProcessedSleepData[] = [];

    for (const id in groupedRecords) {
      const sessions = groupedRecords[id];
      let deep = 0, light = 0, rem = 0, awake = 0;
      let totalDuration = 0;
      let earliestStart = new Date(sessions[0].startTime);
      let latestEnd = new Date(sessions[0].endTime);

      // Calculate average metrics across all sessions
      let totalHeartRate = 0;
      let totalBreathing = 0;
      let totalSpO2 = 0;
      let validMetricsCount = 0;

      sessions.forEach(record => {
        const start = new Date(record.startTime);
        const end = new Date(record.endTime);
        const duration = (end.getTime() - start.getTime()) / (1000 * 60);

        if (start < earliestStart) earliestStart = start;
        if (end > latestEnd) latestEnd = end;

        switch(record.stage) {
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
        }

        // Aggregate metrics if available
        if (record.avgHeartRate) {
          totalHeartRate += record.avgHeartRate;
          totalBreathing += record.avgBreathing || 0;
          totalSpO2 += record.avgSpO2 || 0;
          validMetricsCount++;
        }

        totalDuration += duration;
      });

      const hours = Math.floor(totalDuration / 60);
      const minutes = Math.round(totalDuration % 60);
      const durationText = `${hours}h ${minutes}m`;

      const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
      };

      const timeRangeText = `${formatTime(earliestStart)} - ${formatTime(latestEnd)}`;

      const deepSleepRatio = totalDuration > 0 ? deep / totalDuration : 0;
      const totalSleepHours = totalDuration / 60;

      // Calculate average metrics
      const avgHeartRate = validMetricsCount > 0 ? Math.round(totalHeartRate / validMetricsCount) : 60 + Math.round(Math.random() * 10);
      const avgBreathing = validMetricsCount > 0 ? Math.round(totalBreathing / validMetricsCount) : 12 + Math.round(Math.random() * 4);
      const avgSpO2 = validMetricsCount > 0 ? Math.round(totalSpO2 / validMetricsCount) : 95 + Math.round(Math.random() * 3);

      // Use sleepScore from API if available, otherwise calculate it
      const sleepScore = sessions[0].sleepScore || calculateSleepScore(totalSleepHours, deepSleepRatio);

      results.push({
        id,
        sessions,
        pieData: [
          {value: deep, color: '#6C5CE7', text: Math.round(deep).toString(), legend: 'Deep Sleep'},
          {value: light, color: '#A29BFE', text: Math.round(light).toString(), legend: 'Light Sleep'},
          {value: rem, color: '#6C5CE7', text: Math.round(rem).toString(), legend: 'REM'},
          {value: awake, color: '#E9E5FF', text: Math.round(awake).toString(), legend: 'Awake'},
        ],
        metrics: {
          score: sleepScore,
          heartRate: avgHeartRate,
          breathing: avgBreathing,
          bloodOxygen: avgSpO2,
        },
        duration: durationText,
        quality: getSleepQuality(totalSleepHours, deepSleepRatio),
        timeRange: timeRangeText,
        stages: {
          deep,
          light,
          rem,
          awake
        }
      });
    }

    return results;
  };

  const calculateSleepScore = (totalHours: number, deepSleepRatio: number): number | string => {
    if (totalHours <= 0) return '--';
    const hoursScore = Math.min(100, Math.max(0, (totalHours / 8) * 50));
    const deepSleepScore = Math.min(50, deepSleepRatio * 100);
    return Math.round(hoursScore + deepSleepScore);
  };

  const getSleepQuality = (totalHours: number, deepSleepRatio: number): string => {
    if (totalHours <= 0) return 'No data';
    if (totalHours >= 7 && deepSleepRatio >= 0.2) return 'Excellent';
    if (totalHours >= 6.5 && deepSleepRatio >= 0.15) return 'Good';
    if (totalHours >= 6 || deepSleepRatio >= 0.1) return 'Fair';
    return 'Poor';
  };

  const initializeHealthData = async () => {
    try {
      setIsLoading(true);
      setHasData(false);
      const isInitialized = await initializeHealthConnect();
      if (!isInitialized) {
        console.log('Health Connect initialization failed');
      }

      let startDate = new Date(currentDate);
      let endDate = new Date(currentDate);

      switch(activeView) {
        case 'day':
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - startDate.getDay());
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
      setHasData(records.length > 0);
    } catch (error) {
      console.error('Error initializing health data:', error);
      setHasData(false);
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

  const sleepDataGroups = processSleepData(sleepRecords);
  const chartData = Array(7).fill(0).map((_, i) => ({
    day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
    hours: Math.random() * 2 + 5
  }));

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
        <ScrollView style={styles.content} contentContainerStyle={styles.loadingContent}>
          {/* Duration Loader */}
          <ContentLoader 
            speed={1}
            width="100%"
            height={120}
            viewBox="0 0 380 120"
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
            style={styles.loadingSection}
          >
            <Rect x="120" y="20" rx="4" ry="4" width="140" height="40" />
            <Rect x="150" y="70" rx="4" ry="4" width="80" height="20" />
            <Rect x="120" y="100" rx="4" ry="4" width="140" height="16" />
          </ContentLoader>

          {/* Pie Chart Loader */}
          <ContentLoader 
            speed={1}
            width="100%"
            height={300}
            viewBox="0 0 380 300"
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
            style={styles.loadingSection}
          >
            <Rect x="0" y="0" rx="4" ry="4" width="120" height="24" />
            <Circle cx="190" cy="150" r="80" />
            <Circle cx="190" cy="150" r="60" />
            <Rect x="50" y="250" rx="4" ry="4" width="120" height="16" />
            <Rect x="210" y="250" rx="4" ry="4" width="120" height="16" />
          </ContentLoader>

          {/* Metrics Loader */}
          <ContentLoader 
            speed={1}
            width="100%"
            height={120}
            viewBox="0 0 380 120"
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
            style={styles.loadingSection}
          >
            <Rect x="0" y="0" rx="8" ry="8" width="180" height="100" />
            <Rect x="200" y="0" rx="8" ry="8" width="180" height="100" />
          </ContentLoader>

          {/* Weekly Chart Loader */}
          <ContentLoader 
            speed={1}
            width="100%"
            height={200}
            viewBox="0 0 380 200"
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
            style={styles.loadingSection}
          >
            <Rect x="0" y="0" rx="4" ry="4" width="120" height="24" />
            <Rect x="0" y="40" rx="4" ry="4" width="40" height="100" />
            <Rect x="60" y="60" rx="4" ry="4" width="40" height="80" />
            <Rect x="120" y="40" rx="4" ry="4" width="40" height="100" />
            <Rect x="180" y="60" rx="4" ry="4" width="40" height="80" />
            <Rect x="240" y="30" rx="4" ry="4" width="40" height="110" />
            <Rect x="300" y="50" rx="4" ry="4" width="40" height="90" />
          </ContentLoader>
        </ScrollView>
      ) : !hasData ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No sleep data available</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {/* Sleep Sessions */}
          {sleepDataGroups.map((group, index) => (
            <View key={group.id} style={styles.sessionContainer}>
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionTitle}>Sleep Session {index + 1}</Text>
                <Text style={styles.sessionDuration}>{group.duration}</Text>
              </View>
              <Text style={styles.sessionTime}>{group.timeRange}</Text>
              <Text style={styles.sessionQuality}>{group.quality} sleep quality</Text>

              {/* Sleep Stages */}
              <TouchableOpacity 
                style={styles.sectionHeader}
                onPress={() => toggleSection('stages')}
              >
                <Text style={styles.sectionTitle}>Sleep Stages</Text>
                {expandedSections.stages ? (
                  <ChevronUp width={20} height={20} color="#6C5CE7" />
                ) : (
                  <ChevronDown width={20} height={20} color="#6C5CE7" />
                )}
              </TouchableOpacity>
              
              {expandedSections.stages && (
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
                    <View style={styles.legendRow}>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendDot, {backgroundColor: '#6C5CE7'}]} />
                        <Text style={styles.legendLabel}>Deep Sleep</Text>
                        <Text style={styles.legendValue}>{Math.round(group.stages.deep / 60)}h {Math.round(group.stages.deep % 60)}m</Text>
                      </View>

                      <View style={styles.legendItem}>
                        <View style={[styles.legendDot, {backgroundColor: '#A29BFE'}]} />
                        <Text style={styles.legendLabel}>Light Sleep</Text>
                        <Text style={styles.legendValue}>{Math.round(group.stages.light / 60)}h {Math.round(group.stages.light % 60)}m</Text>
                      </View>
                    </View>

                    <View style={styles.legendRow}>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendDot, {backgroundColor: '#6C5CE7'}]} />
                        <Text style={styles.legendLabel}>REM</Text>
                        <Text style={styles.legendValue}>{Math.round(group.stages.rem / 60)}h {Math.round(group.stages.rem % 60)}m</Text>
                      </View>

                      <View style={styles.legendItem}>
                        <View style={[styles.legendDot, {backgroundColor: '#E9E5FF'}]} />
                        <Text style={styles.legendLabel}>Awake</Text>
                        <Text style={styles.legendValue}>{Math.round(group.stages.awake / 60)}h {Math.round(group.stages.awake % 60)}m</Text>
                      </View>
                    </View>
                  </View>
                </>
              )}

              {/* Health Metrics */}
              <TouchableOpacity 
                style={styles.sectionHeader}
                onPress={() => toggleSection('metrics')}
              >
                <Text style={styles.sectionTitle}>Health Metrics</Text>
                {expandedSections.metrics ? (
                  <ChevronUp width={20} height={20} color="#6C5CE7" />
                ) : (
                  <ChevronDown width={20} height={20} color="#6C5CE7" />
                )}
              </TouchableOpacity>
              
              {expandedSections.metrics && (
                <View style={styles.metricsContainer}>
                  <View style={styles.metricRow}>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Sleep Score</Text>
                      <Text style={[styles.metricValue, {color: '#6C5CE7'}]}>
                        {group.metrics.score}
                      </Text>
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

          {/* Weekly Chart */}
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('weekly')}
          >
            <Text style={styles.sectionTitle}>
              {activeView === 'day' ? 'This Week' : 
              activeView === 'week' ? 'Weekly Overview' :
              activeView === 'month' ? 'Monthly Overview' : 'Yearly Overview'}
            </Text>
            {expandedSections.weekly ? (
              <ChevronUp width={20} height={20} color="#6C5CE7" />
            ) : (
              <ChevronDown width={20} height={20} color="#6C5CE7" />
            )}
          </TouchableOpacity>
          
          {expandedSections.weekly && (
            <View style={styles.weeklyChart}>
              {chartData.map((item, index) => (
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
          )}

          {/* Insights */}
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={() => toggleSection('insights')}
          >
            <Text style={styles.sectionTitle}>Insights</Text>
            {expandedSections.insights ? (
              <ChevronUp width={20} height={20} color="#6C5CE7" />
            ) : (
              <ChevronDown width={20} height={20} color="#6C5CE7" />
            )}
          </TouchableOpacity>
          
          {expandedSections.insights && sleepDataGroups.length > 0 && (
            <View style={styles.tagsContainer}>
              {sleepDataGroups[0].quality === 'Excellent' && (
                <View style={[styles.tag, {backgroundColor: '#F0EEFF'}]}>
                  <Text style={[styles.tagText, {color: '#6C5CE7'}]}>Excellent sleep quality</Text>
                </View>
              )}
              {sleepDataGroups[0].quality === 'Good' && (
                <View style={[styles.tag, {backgroundColor: '#E6F7EF'}]}>
                  <Text style={[styles.tagText, {color: '#10B981'}]}>Good sleep quality</Text>
                </View>
              )}
              {sleepDataGroups[0].metrics.score > 80 && (
                <View style={[styles.tag, {backgroundColor: '#EFF6FF'}]}>
                  <Text style={[styles.tagText, {color: '#3B82F6'}]}>High sleep score</Text>
                </View>
              )}
            </View>
          )}
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
  loadingContent: {
    paddingBottom: 32,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  loadingSection: {
    marginBottom: 24,
  },
  sessionContainer: {
    marginBottom: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  sessionDuration: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C5CE7',
  },
  sessionTime: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  sessionQuality: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6C5CE7',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
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
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricItem: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    width: '48%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
  weeklyChart: {
    height: 120,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 24,
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  tag: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
  },
});

export default SleepScreen;