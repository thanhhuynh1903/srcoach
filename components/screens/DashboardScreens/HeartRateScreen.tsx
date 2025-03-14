import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {LineChart} from 'react-native-gifted-charts';
import BackButton from '../../BackButton';
import LinearGradient from 'react-native-linear-gradient';

const HeartRateScreen = () => {
  // 24-hour heart rate data
  const heartRateData = [
    {value: 65, dataPointText: '00:00'},
    {value: 60, dataPointText: '03:00'},
    {value: 65, dataPointText: '06:00'},
    {value: 75, dataPointText: '09:00'},
    {value: 80, dataPointText: '12:00'},
    {value: 78, dataPointText: '15:00'},
    {value: 85, dataPointText: '18:00'},
    {value: 75, dataPointText: '21:00'},
    {value: 70, dataPointText: '23:59'},
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Heart Rate Analysis</Text>
        <TouchableOpacity>
          <Icon name="calendar" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Current Heart Rate */}
        <LinearGradient
          // Bạn có thể tuỳ chỉnh cặp màu hoặc hướng gradient để phù hợp với thiết kế
          colors={[
            '#e0eafa', // 0%
            '#cee0fa', // ~14%
            '#ccdefa', // ~20%
            '#e0ebf9', // ~27%
            '#e0ebf9', // ~40%
            '#c1d8fb', // ~55%
            '#c2d9fb', // ~68%
            '#d7e6fd', // ~83%
            '#FFFFFF', // 100%
          ]}
          locations={[0, 0.14, 0.2, 0.27, 0.4, 0.55, 0.68, 0.83, 1]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.currentHeartRate}>
          <View style={styles.currentHeader}>
            <View style={styles.currentTitle}>
              <Icon name="heart-outline" size={20} color="#3B82F6" />
              <Text style={styles.currentTitleText}>Current Heart Rate</Text>
            </View>
            <View style={styles.percentageChange}>
              <Icon name="trending-up" size={16} color="#22C55E" />
              <Text style={styles.percentageText}>+2%</Text>
            </View>
          </View>
          <Text style={styles.bpmLarge}>
            72<Text style={styles.bpmUnit}> BPM</Text>
          </Text>
          <Text style={styles.rangeText}>Range today: 65-82 BPM</Text>
        </LinearGradient>

        {/* 24-Hour Heart Rate */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>24-Hour Heart Rate</Text>
          <View style={styles.chartContainer}>
          <LineChart
          data={heartRateData}
          width={290}
          height={200}
          spacing={40}
          initialSpacing={10}
          color="#3A86FF"
          thickness={2}
          curved
          showDataPoints
          dataPointsColor="#3A86FF"
          dataPointsRadius={4}
          startFillColor="rgba(58, 134, 255, 0.1)"
          endFillColor="rgba(58, 134, 255, 0.0)"
          minValue={50}
          maxValue={120}
          noOfSections={5}
          rulesType="dashed"
          rulesColor="#E2E8F0"
          dashWidth={4}
          dashGap={4}
          verticalLinesColor="#E2E8F0"
          verticalLinesType="dashed"
          verticalDashWidth={4}
          verticalDashGap={4}
          xAxisColor="#E2E8F0"
          yAxisColor="transparent"  
          xAxisLabelTextStyle={styles.chartLabel}
          yAxisTextStyle={styles.chartLabel}
          yAxisLabelSuffix=" BPM"
          backgroundColor="#FFFFFF"
        />
          </View>
        </View>

        {/* Heart Rate Zones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Heart Rate Zones</Text>
          <View style={styles.zonesContainer}>
            <View style={[styles.zoneCard, styles.restZone]}>
              <Text style={styles.zoneTitle}>Rest</Text>
              <Text style={styles.zoneRange}>50-70 BPM</Text>
              <Text style={styles.zoneDuration}>8h 24m</Text>
            </View>
            <View style={[styles.zoneCard, styles.activeZone]}>
              <Text style={styles.zoneTitle}>Active</Text>
              <Text style={styles.zoneRange}>71-90 BPM</Text>
              <Text style={styles.zoneDuration}>4h 12m</Text>
            </View>
            <View style={[styles.zoneCard, styles.exerciseZone]}>
              <Text style={styles.zoneTitle}>Exercise</Text>
              <Text style={styles.zoneRange}>91+ BPM</Text>
              <Text style={styles.zoneDuration}>1h 48m</Text>
            </View>
          </View>
        </View>

        {/* Today's Overview */}
        <View style={styles.sectionFooter}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <View style={styles.overviewGrid}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Average BPM</Text>
              <Text style={styles.overviewValue}>73</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Max BPM</Text>
              <Text style={styles.overviewValue}>112</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Min BPM</Text>
              <Text style={styles.overviewValue}>62</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Resting BPM</Text>
              <Text style={styles.overviewValue}>65</Text>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8FAFC',
  },
  currentHeartRate: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  currentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currentTitleText: {
    fontSize: 16,
    color: '#64748B',
  },
  percentageChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  percentageText: {
    color: '#22C55E',
    fontSize: 14,
    fontWeight: '500',
  },
  bpmLarge: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  bpmUnit: {
    fontSize: 20,
    fontWeight: 'normal',
    color: '#64748B',
  },
  rangeText: {
    fontSize: 14,
    color: '#64748B',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  sectionFooter: {
    marginBottom: 55,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  chartLabel: {
    color: '#64748B',
    fontSize: 12,
  },
  zonesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  zoneCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  restZone: {
    backgroundColor: '#EFF6FF',
  },
  activeZone: {
    backgroundColor: '#F0F9FF',
  },
  exerciseZone: {
    backgroundColor: '#F0FDFF',
  },
  zoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  zoneRange: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  zoneDuration: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  overviewItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
  },
  overviewLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
  },
});

export default HeartRateScreen;
