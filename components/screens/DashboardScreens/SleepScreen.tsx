import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import BackButton from '../../BackButton';
import { PieChart } from 'react-native-gifted-charts';

const sleepStagesData = [
  { value: 135, color: '#6C5CE7', text: '135', legend: 'Deep Sleep' }, // 2h 15m = 135 min
  { value: 245, color: '#A29BFE', text: '245', legend: 'Light Sleep' }, // 4h 5m = 245 min
  { value: 72, color: '#6C5CE7', text: '72', legend: 'REM' }, // 1h 12m = 72 min
  { value: 10, color: '#E9E5FF', text: '10', legend: 'Awake' }, // 0h 10m = 10 min
];

const weeklyData = [
  { day: 'Mon', hours: 6.5 },
  { day: 'Tue', hours: 5.2 },
  { day: 'Wed', hours: 7.8 },
  { day: 'Thu', hours: 6.7 },
  { day: 'Fri', hours: 8.1 },
  { day: 'Sat', hours: 5.5 },
  { day: 'Sun', hours: 7.2 },
];

const SleepScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          < BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sleep measurement</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Date and Sleep Duration */}
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>Today, Jan 15</Text>
          <Text style={styles.durationText}>7h 32m</Text>
          <Text style={styles.qualityText}>Good sleep quality</Text>
          <Text style={styles.timeRangeText}>10:45 PM - 6:17 AM</Text>
        </View>

        {/* Sleep Stages */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Sleep Stages</Text>
          
          <View style={styles.chartContainer}>
            <PieChart
              data={sleepStagesData}
              donut
              radius={80}
              innerRadius={60}
              centerLabelComponent={() => null}
            />
          </View>
          
          <View style={styles.stagesLegend}>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#6C5CE7' }]} />
                <Text style={styles.legendLabel}>Deep Sleep</Text>
                <Text style={styles.legendValue}>2h 15m</Text>
              </View>
              
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#A29BFE' }]} />
                <Text style={styles.legendLabel}>Light Sleep</Text>
                <Text style={styles.legendValue}>4h 5m</Text>
              </View>
            </View>
            
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#6C5CE7' }]} />
                <Text style={styles.legendLabel}>REM</Text>
                <Text style={styles.legendValue}>1h 12m</Text>
              </View>
              
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#E9E5FF' }]} />
                <Text style={styles.legendLabel}>Awake</Text>
                <Text style={styles.legendValue}>0h 10m</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Health Metrics */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Sleep Score</Text>
              <Text style={[styles.metricValue, { color: '#6C5CE7' }]}>85</Text>
            </View>
            
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Heart Rate</Text>
              <Text style={[styles.metricValue, { color: '#FF4D4F' }]}>62<Text style={styles.metricUnit}>BPM avg.</Text></Text>
            </View>
          </View>
          
          <View style={styles.metricRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Breathing</Text>
              <Text style={[styles.metricValue, { color: '#10B981' }]}>14<Text style={styles.metricUnit}>br/min</Text></Text>
            </View>
            
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Blood Oxygen</Text>
              <Text style={[styles.metricValue, { color: '#3B82F6' }]}>96<Text style={styles.metricUnit}>%</Text></Text>
            </View>
          </View>
        </View>

        {/* Weekly Chart */}
        <View style={styles.weeklyContainer}>
          <Text style={styles.sectionTitle}>This Week</Text>
          
          <View style={styles.weeklyChart}>
            {weeklyData.map((item, index) => (
              <View key={index} style={styles.weeklyBarContainer}>
                <View 
                  style={[
                    styles.weeklyBar, 
                    { 
                      height: `${(item.hours / 10) * 100}%`,
                      backgroundColor: index === 2 || index === 4 || index === 6 ? '#6C5CE7' : '#A29BFE',
                    }
                  ]} 
                />
              </View>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.notesContainer}>
          <Text style={styles.sectionTitle}>Notes</Text>
          
          <View style={styles.tagsContainer}>
            <View style={[styles.tag, { backgroundColor: '#E6F7EF' }]}>
              <Text style={[styles.tagText, { color: '#10B981' }]}>Regular bedtime</Text>
            </View>
            
            <View style={[styles.tag, { backgroundColor: '#F0EEFF' }]}>
              <Text style={[styles.tagText, { color: '#6C5CE7' }]}>Deep sleep improved</Text>
            </View>
            
            <View style={[styles.tag, { backgroundColor: '#EFF6FF' }]}>
              <Text style={[styles.tagText, { color: '#3B82F6' }]}>Less interruptions</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
    padding: 16,
  },
  dateContainer: {
    marginBottom: 24,
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
    fontWeight:"bold",
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
    backgroundColor:"#F9FAFB",
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
  },
  weeklyBar: {
    width: '100%',
    borderRadius: 4,
  },
  notesContainer: {
    marginBottom: 24,
  },
  tagsContainer: {
    flex:1,
    flexDirection:'row',
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
});

export default SleepScreen;