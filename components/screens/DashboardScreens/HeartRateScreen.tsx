import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {LineChart} from 'react-native-gifted-charts';
import BackButton from '../../BackButton';
const {width} = Dimensions.get('window');

const timePeriods = ['Today', 'Week', 'Month', 'Year'];

const heartRateData = [
  {value: 65, label: '6AM'},
  {value: 68},
  {value: 72},
  {value: 78},
  {value: 85, label: '9AM'},
  {value: 82},
  {value: 80},
  {value: 78},
  {value: 82, label: '12PM'},
  {value: 85},
  {value: 82},
  {value: 78},
  {value: 75, label: '3PM'},
  {value: 72},
  {value: 78},
  {value: 80},
  {value: 75, label: '6PM'},
  {value: 72},
  {value: 70},
  {value: 68},
  {value: 65, label: '9PM'},
];

const heartRateZones = [
  {
    name: 'Peak',
    range: '170-190 BPM',
    duration: '5 min',
    color: '#FF4D4F',
    progress: 0.05,
  },
  {
    name: 'Cardio',
    range: '140-170 BPM',
    duration: '15 min',
    color: '#FF7A45',
    progress: 0.15,
  },
  {
    name: 'Fat Burn',
    range: '110-140 BPM',
    duration: '45 min',
    color: '#52C41A',
    progress: 0.45,
  },
  {
    name: 'Rest',
    range: '60-110 BPM',
    duration: '23h 55min',
    color: '#1890FF',
    progress: 0.99,
  },
];

const HeartRateScreen = () => {
  const [activePeriod, setActivePeriod] = useState('Today');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Heart rate</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Current Heart Rate */}
        <View style={styles.currentRateContainer}>
          <View style={styles.heartIconContainer}>
            <Icon name="heart" size={28} color="#FF4D4F" />
          </View>
          <View style={styles.rateTextContainer}>
            <Text style={styles.currentRate}>
              72 <Text style={styles.bpmLabel}>BPM</Text>
            </Text>
            <View style={styles.restingRateContainer}>
              <Text style={styles.restingRateText}>Resting Rate: 62 BPM</Text>
              <TouchableOpacity>
                <Icon name="information-circle-outline" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

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

        {/* Heart Rate Chart */}
        <View style={styles.chartContainer}>
          <LineChart
            data={heartRateData}
            height={180}
            width={width - 32}
            spacing={10}
            initialSpacing={0}
            color="#FF4D4F"
            thickness={2}
            hideDataPoints
            hideRules
            hideYAxisText={false}
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
            maxValue={100}
            yAxisLabelTexts={['0', '25', '50', '75', '100']}
          />
        </View>

        {/* Heart Rate Zones */}
        <View style={styles.zonesContainer}>
          <Text style={styles.zonesTitle}>Heart Rate Zones</Text>

          {heartRateZones.map((zone, index) => (
            <View
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor: '#F9FAFB',
                marginBottom: 8,
              }}>
              <View key={index} style={styles.zoneItem}>
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
            <Text style={styles.statValue}>74 BPM</Text>
            <Text style={styles.statLabel}>Average</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>120 BPM</Text>
            <Text style={styles.statLabel}>Maximum</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>58 BPM</Text>
            <Text style={styles.statLabel}>Minimum</Text>
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
    backgroundColor: '#FF4D4F',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  chartContainer: {
    marginBottom: 24,
    paddingVertical: 8,
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
  zoneItem: {
    marginBottom: 16,
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
    backgroundColor:"#F9FAFB",
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
});

export default HeartRateScreen;
