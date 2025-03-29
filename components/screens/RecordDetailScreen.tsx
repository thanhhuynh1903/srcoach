import React, {useCallback, useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {LineChart} from 'react-native-gifted-charts';
import BackButton from '../BackButton';
import ScreenWrapper from '../ScreenWrapper';
import {hp, wp} from '../helpers/common';
import MapView, {Polyline} from 'react-native-maps';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {
  initializeHealthConnect,
  fetchStepRecords,
  fetchDistanceRecords,
  fetchHeartRateRecords,
  fetchActiveCaloriesRecords,
  ExerciseRouteRecord,
  calculateTotalSteps,
  calculateTotalDistance,
  calculateTotalCalories,
  fetchExerciseRoute,
  StepRecord,
  DistanceRecord,
  HeartRateRecord,
  ActiveCaloriesRecord,
} from '../utils/utils_healthconnect';
import {getNameFromExerciseType} from '../contants/exerciseType';
import {format, parseISO, differenceInMinutes, differenceInSeconds} from 'date-fns';

const {width} = Dimensions.get('window');

const RecordDetailScreen = () => {
  const route = useRoute();
  const {id, clientRecordId, exerciseType, startTime, endTime} = route.params;

  const [currentLocation, setCurrentLocation] = useState(null);
  const [stepRecords, setStepRecords] = useState<StepRecord[]>([]);
  const [distanceRecords, setDistanceRecords] = useState<DistanceRecord[]>([]);
  const [heartRateRecords, setHeartRateRecords] = useState<HeartRateRecord[]>([]);
  const [caloriesRecords, setCaloriesRecords] = useState<ActiveCaloriesRecord[]>([]);
  const [exerciseRoutes, setExerciseRoutes] = useState<ExerciseRouteRecord[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  const durationMinutes = useMemo(() => {
    return differenceInMinutes(parseISO(endTime), parseISO(startTime));
  }, [startTime, endTime]);

  const readSampleData = async () => {
    try {
      setLoadingMetrics(true);
      const isInitialized = await initializeHealthConnect();
      if (!isInitialized) {
        console.log('Health Connect initialization failed');
        return;
      }

      const [steps, distance, heartRate, calories] = await Promise.all([
        fetchStepRecords(startTime, endTime),
        fetchDistanceRecords(startTime, endTime),
        fetchHeartRateRecords(startTime, endTime),
        fetchActiveCaloriesRecords(startTime, endTime),
      ]);

      setStepRecords(steps);
      setDistanceRecords(distance);
      setHeartRateRecords(heartRate);
      setCaloriesRecords(calories);
      setLoadingMetrics(false);

      console.log('Successfully read health data');
      await fetchRoutes();
    } catch (error) {
      console.error('Error reading health data:', error);
      setLoadingMetrics(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      setLoadingRoutes(true);
      setRouteError(null);
      const routes = await fetchExerciseRoute(id, clientRecordId);
      if (routes) {
        setExerciseRoutes(routes);
      } else {
        setRouteError('Could not load route data');
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      setRouteError('Failed to load route data');
    } finally {
      setLoadingRoutes(false);
    }
  };

  const getMapRegion = () => {
    if (exerciseRoutes.length === 0) {
      return {
        latitude: currentLocation?.latitude || 37.78825,
        longitude: currentLocation?.longitude || -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }

    const latitudes = exerciseRoutes.map(p => p.latitude);
    const longitudes = exerciseRoutes.map(p => p.longitude);
    
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: (maxLat - minLat) * 1.5 + 0.01,
      longitudeDelta: (maxLng - minLng) * 1.5 + 0.01,
    };
  };

  const calculateDuration = () => {
    const start = parseISO(startTime);
    const end = parseISO(endTime);
    const minutes = differenceInMinutes(end, start);
    const seconds = differenceInSeconds(end, start) % 60;

    return `${minutes} min ${seconds} sec`;
  };

  const calculateAveragePace = () => {
    const totalDistanceKm = calculateTotalDistance(distanceRecords) / 1000;
    if (totalDistanceKm <= 0 || durationMinutes <= 0) return 'N/A';
    
    const pace = durationMinutes / totalDistanceKm;
    const paceMinutes = Math.floor(pace);
    const paceSeconds = Math.round((pace - paceMinutes) * 60);
    
    return `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')} min/km`;
  };

  const prepareHeartRateData = () => {
    if (heartRateRecords.length === 0) return [];

    const sortedRecords = [...heartRateRecords].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );

    // Sample data points to avoid overcrowding the chart
    const sampleInterval = Math.max(1, Math.floor(sortedRecords.length / 10));
    return sortedRecords
      .filter((_, index) => index % sampleInterval === 0)
      .map(record => ({
        value: record.beatsPerMinute,
        label: format(parseISO(record.startTime), 'HH:mm'),
        labelTextStyle: {color: 'gray', width: 60},
      }));
  };

  const heartRateStats = useMemo(() => {
    if (heartRateRecords.length === 0) {
      return {
        min: 0,
        avg: 0,
        max: 0,
      };
    }

    const values = heartRateRecords.map(r => r.beatsPerMinute);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
    };
  }, [heartRateRecords]);

  useFocusEffect(
    useCallback(() => {
      readSampleData();
    }, [id, clientRecordId, startTime, endTime]),
  );

  const navigate = useNavigation();
  return (
    <ScreenWrapper bg={'#f9fafb'}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigate.goBack()}
        >
          <BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Session Details</Text>
      </View>
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          {getNameFromExerciseType(exerciseType)}
        </Text>
        <Text style={styles.dateTime}>
          {format(parseISO(startTime), 'EEEE, MMMM d, yyyy')}
        </Text>

        {/* Key Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Icon name="walk-sharp" size={24} color="#1E3A8A" />
            <Text style={styles.metricLabel}>Distance</Text>
            {loadingMetrics ? (
              <ActivityIndicator size="small" color="#1E3A8A" />
            ) : (
              <Text style={styles.metricValue}>
                {(calculateTotalDistance(distanceRecords) / 1000).toFixed(2)} km
              </Text>
            )}
          </View>
          
          <View style={styles.metricCard}>
            <Icon name="time-outline" size={24} color="#1E3A8A" />
            <Text style={styles.metricLabel}>Duration</Text>
            <Text style={styles.metricValue}>{calculateDuration()}</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Icon name="flame-outline" size={24} color="#1E3A8A" />
            <Text style={styles.metricLabel}>Calories</Text>
            {loadingMetrics ? (
              <ActivityIndicator size="small" color="#1E3A8A" />
            ) : (
              <Text style={styles.metricValue}>
                {calculateTotalCalories(caloriesRecords).toFixed(0)} kcal
              </Text>
            )}
          </View>
          
          <View style={styles.metricCard}>
            <Icon name="speedometer-outline" size={24} color="#1E3A8A" />
            <Text style={styles.metricLabel}>Avg. Pace</Text>
            {loadingMetrics ? (
              <ActivityIndicator size="small" color="#1E3A8A" />
            ) : (
              <Text style={styles.metricValue}>
                {calculateAveragePace()}
              </Text>
            )}
          </View>
        </View>

        {/* Heart Rate Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="heart" size={20} color="#1E3A8A" />
            <Text style={styles.sectionTitle}>Heart Rate</Text>
            {loadingMetrics && <ActivityIndicator size="small" color="#1E3A8A" />}
          </View>
          
          {heartRateRecords.length > 0 ? (
            <>
              <View style={styles.heartRateStats}>
                <View>
                  <Text style={styles.heartRateLabel}>Min</Text>
                  <Text style={styles.heartRateValue}>
                    {heartRateStats.min.toFixed(0)} BPM
                  </Text>
                </View>
                <View>
                  <Text style={styles.heartRateLabel}>Average</Text>
                  <Text style={styles.heartRateValue}>
                    {heartRateStats.avg.toFixed(0)} BPM
                  </Text>
                </View>
                <View>
                  <Text style={styles.heartRateLabel}>Max</Text>
                  <Text style={styles.heartRateValue}>
                    {heartRateStats.max.toFixed(0)} BPM
                  </Text>
                </View>
              </View>
              
              <View style={styles.chartContainer}>
                <LineChart
                  data={prepareHeartRateData()}
                  height={150}
                  width={wp(85)}
                  spacing={60}
                  color="#1E3A8A"
                  thickness={3}
                  curved
                  yAxisOffset={20}
                  noOfSections={4}
                  maxValue={heartRateStats.max + 20}
                  initialSpacing={10}
                  yAxisLabelWidth={40}
                  xAxisLabelTextStyle={{width: 60}}
                />
              </View>
            </>
          ) : (
            <Text style={styles.noDataText}>No heart rate data available</Text>
          )}
        </View>

        {/* Route Map Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="location-outline" size={20} color="#1E3A8A" />
            <Text style={styles.sectionTitle}>Route Map</Text>
            {loadingRoutes && <ActivityIndicator size="small" color="#1E3A8A" />}
            {routeError && (
              <TouchableOpacity 
                onPress={fetchRoutes} 
                style={{marginLeft: 'auto'}}
              >
                <Text style={{color: '#1E3A8A'}}>Retry</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {routeError ? (
            <View style={styles.errorContainer}>
              <Icon name="warning-outline" size={24} color="#FF5252" />
              <Text style={styles.errorText}>{routeError}</Text>
            </View>
          ) : (
            <View style={{borderRadius: 16, overflow: 'hidden'}}>
              <MapView
                style={styles.map}
                initialRegion={getMapRegion()}
                region={getMapRegion()}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                {exerciseRoutes.length > 0 && (
                  <Polyline 
                    coordinates={exerciseRoutes} 
                    strokeColor="#1E3A8A"
                    strokeWidth={4}
                  />
                )}
              </MapView>
            </View>
          )}
          
          <View style={styles.mapStats}>
            <View style={styles.mapStat}>
              <Icon name="walk-outline" size={20} color="#22C55E" />
              <View>
                <Text style={styles.mapStatLabel}>Distance</Text>
                {loadingMetrics ? (
                  <ActivityIndicator size="small" color="#22C55E" />
                ) : (
                  <Text style={styles.mapStatValue}>
                    {(calculateTotalDistance(distanceRecords) / 1000).toFixed(2)} km
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.mapStat}>
              <Icon name="footsteps-outline" size={20} color="#22C55E" />
              <View>
                <Text style={styles.mapStatLabel}>Steps</Text>
                {loadingMetrics ? (
                  <ActivityIndicator size="small" color="#22C55E" />
                ) : (
                  <Text style={styles.mapStatValue}>
                    {calculateTotalSteps(stepRecords).toLocaleString()}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigate.navigate('RiskWarningScreen' as never)}
        >
          <Icon name="document-text-outline" size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Risk Analysis</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => {/* Implement share functionality */}}
        >
          <Icon name="share-outline" size={20} color="#1E3A8A" />
          <Text style={styles.secondaryButtonText}>Share Session</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
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
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 24,
  },
  metricCard: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    padding: 16,
    width: wp(43),
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
    borderColor: '#E2E8F0',
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
    justifyContent: 'space-between',
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
    height: 200,
    marginTop: 16,
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: hp(25),
    marginBottom: 16,
  },
  mapStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
  },
  noDataText: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 16,
  },
  primaryButton: {
    backgroundColor: '#1E3A8A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#1E3A8A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  secondaryButtonText: {
    color: '#1E3A8A',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RecordDetailScreen;