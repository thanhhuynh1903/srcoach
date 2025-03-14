import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {LineChart} from 'react-native-gifted-charts';
import BackButton from '../BackButton';
import ScreenWrapper from '../ScreenWrapper';
import {hp, wp} from '../helpers/common';
import MapView, {Marker} from 'react-native-maps';

const RecordDetailScreen = () => {
  // Heart rate data for the chart
  const heartRateData = [
    {value: 140},
    {value: 150},
    {value: 165},
    {value: 172},
    {value: 168},
    {value: 155},
  ];

  return (
    <ScreenWrapper bg={'#f9fafb'}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackButton size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Evening Run</Text>
        <Text style={styles.dateTime}>October 15, 2023 • 6:30 AM</Text>

        {/* Key Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Icon name="walk-sharp" size={24} color="#1E3A8A" />
            <Text style={styles.metricLabel}>Distance</Text>
            <Text style={styles.metricValue}>5.2 km</Text>
          </View>
          <View style={styles.metricCard}>
            <Icon name="time-outline" size={24} color="#1E3A8A" />
            <Text style={styles.metricLabel}>Duration</Text>
            <Text style={styles.metricValue}>32:45</Text>
          </View>
          <View style={styles.metricCard}>
            <Icon name="flame-outline" size={24} color="#1E3A8A" />
            <Text style={styles.metricLabel}>Calories</Text>
            <Text style={styles.metricValue}>324 kcal</Text>
          </View>
          <View style={styles.metricCard}>
            <Icon name="speedometer-outline" size={24} color="#1E3A8A" />
            <Text style={styles.metricLabel}>Avg. Pace</Text>
            <Text style={styles.metricValue}>6'17"/km</Text>
          </View>
        </View>

        {/* Heart Rate Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="heart" size={20} color="#1E3A8A" />
            <Text style={styles.sectionTitle}>Heart Rate</Text>
          </View>
          <View style={styles.heartRateStats}>
            <View>
              <Text style={styles.heartRateLabel}>Average</Text>
              <Text style={styles.heartRateValue}>145 BPM</Text>
            </View>
            <View>
              <Text style={styles.heartRateLabel}>Max</Text>
              <Text style={styles.heartRateValue}>172 BPM</Text>
            </View>
          </View>
          <View style={styles.chartContainer}>
            <LineChart
              data={heartRateData}
              height={150}
              width={330}
              spacing={60}
              color="#1E3A8A"
              thickness={2}
              hideDataPoints
              curved
              hideAxesAndRules
            />
          </View>
        </View>

        {/* Route Map Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="location-outline" size={20} color="#1E3A8A" />
            <Text style={styles.sectionTitle}>Route Map</Text>
          </View>
          <View style={{borderRadius: 16, overflow: 'hidden'}}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 37.78825,
              longitude: -122.4324,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}>
            <Marker
              coordinate={{
                latitude: 37.78825,
                longitude: -122.4324,
              }}
              title="My Location"
              description="This is a marker"
            />
          </MapView>
          </View>
          <View style={styles.mapStats}>
            <View style={styles.mapStat}>
              <Icon name="arrow-up" size={20} color="#22C55E" />
              <View>
                <Text style={styles.mapStatLabel}>Elevation Gain</Text>
                <Text style={styles.mapStatValue}>124 m</Text>
              </View>
            </View>
            <View style={styles.mapStat}>
              <Icon name="footsteps-outline" size={20} color="#22C55E" />
              <View>
                <Text style={styles.mapStatLabel}>Steps</Text>
                <Text style={styles.mapStatValue}>6,247</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Additional Stats */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="stats-chart-outline" size={20} color="#1E3A8A" />
            <Text style={styles.sectionTitle}>Additional Stats</Text>
          </View>
          <View style={styles.additionalStats}>
            <View style={styles.statRow}>
              <View style={styles.statLabel}>
                <Icon name="repeat" size={16} color="#64748B" />
                <Text style={styles.statText}>Average Cadence</Text>
              </View>
              <Text style={styles.statValue}>165 spm</Text>
            </View>
            <View style={styles.statRow}>
              <View style={styles.statLabel}>
                <Icon name="thermometer-outline" size={16} color="#64748B" />
                <Text style={styles.statText}>Weather</Text>
              </View>
              <Text style={styles.statValue}>22°C, Sunny</Text>
            </View>
            <View style={styles.statRow}>
              <View style={styles.statLabel}>
                <Icon name="trophy-outline" size={16} color="#64748B" />
                <Text style={styles.statText}>Achievements</Text>
              </View>
              <Text style={styles.statValue}>2 New</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Share Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.shareButton}>
          <Icon name="share-outline" size={20} color="#FFFFFF" />
          <Text style={styles.shareButtonText}>Share your data</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  dateTime: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  metricCard: {
    borderWidth: 1,
    borderColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
    padding: 16,
    width: wp(44),
    borderRadius: 16,
    gap: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  heartRateStats: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
  },
  heartRateLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  heartRateValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  chartContainer: {
    height: 100,
  },
  mapImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 16,
  },
  mapStats: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mapStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mapStatLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  mapStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  additionalStats: {
    gap: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 14,
    color: '#64748B',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  shareButton: {
    backgroundColor: '#1E3A8A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  map: {
    width: '100%',
    height: hp(25),
  },
});

export default RecordDetailScreen;
