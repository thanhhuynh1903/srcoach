import React, {useCallback, useState, useMemo, useEffect} from 'react';
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
import MapView, {Polyline, Marker} from 'react-native-maps';
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
  fetchExerciseSessionByRecordId,
} from '../utils/utils_healthconnect';
import {getNameFromExerciseType} from '../contants/exerciseType';
import {format, parseISO, differenceInMinutes, differenceInSeconds} from 'date-fns';

const {width} = Dimensions.get('window');

const RecordDetailScreen = () => {
  const route = useRoute();
  const {id, clientRecordId} = route.params;

  const [session, setSession] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [stepRecords, setStepRecords] = useState<StepRecord[]>([]);
  const [distanceRecords, setDistanceRecords] = useState<DistanceRecord[]>([]);
  const [heartRateRecords, setHeartRateRecords] = useState<HeartRateRecord[]>([]);
  const [caloriesRecords, setCaloriesRecords] = useState<ActiveCaloriesRecord[]>([]);
  const [exerciseRoutes, setExerciseRoutes] = useState<ExerciseRouteRecord[]>([]);
  const [loading, setLoading] = useState({
    session: true,
    routes: false,
    metrics: false,
    all: true
  });
  const [routeError, setRouteError] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);
  const [sessionEndTime, setSessionEndTime] = useState<string | null>(null);

  const loadAllData = async () => {
    try {
      setLoading(prev => ({...prev, all: true}));
      
      // Load session first
      await loadSession();
      
      // Then load routes and metrics in parallel
      await Promise.all([
        loadRoutes(),
        loadMetrics()
      ]);
    } catch (error) {
      console.error('Error loading all data:', error);
    } finally {
      setLoading(prev => ({...prev, all: false}));
    }
  };

  const loadSession = async () => {
    try {
      setLoading(prev => ({...prev, session: true}));
      
      const isInitialized = await initializeHealthConnect();
      if (!isInitialized) {
        return;
      }

      const session = await fetchExerciseSessionByRecordId(id);
      
      if (session?.startTime && session?.endTime) {
        setSessionStartTime(session.startTime);
        setSessionEndTime(session.endTime);
      }
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setLoading(prev => ({...prev, session: false}));
    }
  };

  const loadRoutes = async () => {
    try {
      if (!sessionStartTime || !sessionEndTime) return;
      
      setLoading(prev => ({...prev, routes: true}));
      setRouteError(null);
      
      const routes = await fetchExerciseRoute(id);
      
      if (routes && routes.length > 0) {
        setExerciseRoutes(routes);
        
        const timestamps = routes.map(route => new Date(route.time).getTime());
        const minTime = new Date(Math.min(...timestamps)).toISOString();
        const maxTime = new Date(Math.max(...timestamps)).toISOString();
        
        setSessionStartTime(prev => {
          const routeStart = new Date(minTime);
          const sessionStart = new Date(prev || session?.startTime);
          return routeStart < sessionStart ? minTime : prev;
        });
        
        setSessionEndTime(prev => {
          const routeEnd = new Date(maxTime);
          const sessionEnd = new Date(prev || session?.endTime);
          return routeEnd > sessionEnd ? maxTime : prev;
        });
      } else {
        setRouteError('No route data available for this session');
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      setRouteError('Failed to load route data');
    } finally {
      setLoading(prev => ({...prev, routes: false}));
    }
  };

  const loadMetrics = async () => {
    try {
      if (!sessionStartTime || !sessionEndTime) return;
      
      setLoading(prev => ({...prev, metrics: true}));
      
      const [steps, distance, heartRate, calories] = await Promise.all([
        fetchStepRecords(sessionStartTime, sessionEndTime),
        fetchDistanceRecords(sessionStartTime, sessionEndTime),
        fetchHeartRateRecords(sessionStartTime, sessionEndTime),
        fetchActiveCaloriesRecords(sessionStartTime, sessionEndTime),
      ]);

      setStepRecords(steps);
      setDistanceRecords(distance);
      setHeartRateRecords(heartRate);
      setCaloriesRecords(calories);
    } catch (error) {
      console.error('Error reading health data:', error);
    } finally {
      setLoading(prev => ({...prev, metrics: false}));
    }
  };

  useEffect(() => {
    loadAllData();
  }, [id, clientRecordId]);

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

    const paddingFactor = 1.5;
    const latDelta = (maxLat - minLat) * paddingFactor + 0.01;
    const lngDelta = (maxLng - minLng) * paddingFactor + 0.01;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  };

  const calculateDuration = () => {
    if (!sessionStartTime || !sessionEndTime) return 'N/A';
    
    const start = parseISO(sessionStartTime);
    const end = parseISO(sessionEndTime);
    const minutes = differenceInMinutes(end, start);
    const seconds = differenceInSeconds(end, start) % 60;

    return `${minutes} min ${seconds} sec`;
  };

  const calculateAveragePace = () => {
    if (!sessionStartTime || !sessionEndTime) return 'N/A';
    
    const totalDistanceKm = calculateTotalDistance(distanceRecords) / 1000;
    const duration = differenceInMinutes(parseISO(sessionEndTime), parseISO(sessionStartTime));
    
    if (totalDistanceKm <= 0 || duration <= 0) return 'N/A';
    
    const pace = duration / totalDistanceKm;
    const paceMinutes = Math.floor(pace);
    const paceSeconds = Math.round((pace - paceMinutes) * 60);
    
    return `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')} min/km`;
  };

  const prepareHeartRateData = () => {
    if (heartRateRecords.length === 0) return [];

    const sortedRecords = [...heartRateRecords].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );

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

  const routeCoordinates = useMemo(() => {
    return exerciseRoutes.map(route => ({
      latitude: route.latitude,
      longitude: route.longitude,
    }));
  }, [exerciseRoutes]);

  const startCoordinate = routeCoordinates[0];
  const endCoordinate = routeCoordinates[routeCoordinates.length - 1];

  const navigate = useNavigation();
  
  return (
    <ScreenWrapper bg={'#f9fafb'}>
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
        {loading.all ? (
          <ActivityIndicator size="large" color="#1E3A8A" style={styles.loadingIndicator} />
        ) : (
          <>
            <Text style={styles.title}>
              {getNameFromExerciseType(session?.exerciseType)}
            </Text>
            {sessionStartTime && (
              <Text style={styles.dateTime}>
                {format(parseISO(sessionStartTime), 'EEEE, MMMM d, yyyy')}
              </Text>
            )}

            {/* Key Metrics Grid */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Icon name="walk-sharp" size={24} color="#1E3A8A" />
                <Text style={styles.metricLabel}>Distance</Text>
                {loading.metrics ? (
                  <ActivityIndicator size="small" color="#1E3A8A" />
                ) : (
                  <Text style={styles.metricValue}>
                    {(calculateTotalDistance(distanceRecords)).toFixed(2)} km
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
                {loading.metrics ? (
                  <ActivityIndicator size="small" color="#1E3A8A" />
                ) : (
                  <Text style={styles.metricValue}>
                    {(calculateTotalCalories(caloriesRecords) / 1000).toFixed(0)} kcal
                  </Text>
                )}
              </View>
              
              <View style={styles.metricCard}>
                <Icon name="speedometer-outline" size={24} color="#1E3A8A" />
                <Text style={styles.metricLabel}>Avg. Pace</Text>
                {loading.metrics ? (
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
                {loading.metrics && <ActivityIndicator size="small" color="#1E3A8A" />}
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
                {loading.routes && <ActivityIndicator size="small" color="#1E3A8A" />}
                {routeError && (
                  <TouchableOpacity 
                    onPress={loadRoutes} 
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
                    scrollEnabled={true}
                    zoomEnabled={true}
                    loadingEnabled={true}
                  >
                    {routeCoordinates.length > 0 && (
                      <>
                        <Polyline 
                          coordinates={routeCoordinates} 
                          strokeColor="#1E3A8A"
                          strokeWidth={4}
                        />
                        {startCoordinate && (
                          <Marker coordinate={startCoordinate} title="Start">
                            <View style={styles.markerStart}>
                              <Icon name="play" size={16} color="#FFFFFF" />
                            </View>
                          </Marker>
                        )}
                        {endCoordinate && (
                          <Marker coordinate={endCoordinate} title="End">
                            <View style={styles.markerEnd}>
                              <Icon name="flag" size={16} color="#FFFFFF" />
                            </View>
                          </Marker>
                        )}
                      </>
                    )}
                  </MapView>
                </View>
              )}
              
              <View style={styles.mapStats}>
                <View style={styles.mapStat}>
                  <Icon name="walk-outline" size={20} color="#22C55E" />
                  <View>
                    <Text style={styles.mapStatLabel}>Distance</Text>
                    {loading.metrics ? (
                      <ActivityIndicator size="small" color="#22C55E" />
                    ) : (
                      <Text style={styles.mapStatValue}>
                        {(calculateTotalDistance(distanceRecords)).toFixed(2)} km
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.mapStat}>
                  <Icon name="footsteps-outline" size={20} color="#22C55E" />
                  <View>
                    <Text style={styles.mapStatLabel}>Steps</Text>
                    {loading.metrics ? (
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
          </>
        )}
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
  loadingIndicator: {
    marginTop: 40,
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
  markerStart: {
    backgroundColor: '#22C55E',
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  markerEnd: {
    backgroundColor: '#EF4444',
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

export default RecordDetailScreen;