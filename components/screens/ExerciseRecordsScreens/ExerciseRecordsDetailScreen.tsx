import React, {useState, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {LineChart} from 'react-native-gifted-charts';
import BackButton from '../../BackButton';
import ScreenWrapper from '../../ScreenWrapper';
import {hp, wp} from '../../helpers/common';
import MapView, {Polyline, Marker} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  fetchDetailRecords,
  ExerciseSession,
} from '../../utils/utils_healthconnect';
import {getNameFromExerciseType} from '../../contants/exerciseType';
import {format, parseISO} from 'date-fns';
import {theme} from '../../contants/theme';
import {useLoginStore} from '../../utils/useLoginStore';

const ExerciseRecordsDetailScreen = () => {
  const route = useRoute();
  const {id} = route.params as {id: string};
  const {profile} = useLoginStore();
  const [session, setSession] = useState<ExerciseSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapRef, setMapRef] = useState<MapView | null>(null);
  const currentYear = new Date().getFullYear();
  const birthYear = new Date(profile.birth_date).getFullYear();
  const age = currentYear - birthYear;

  const loadSession = async () => {
    try {
      setLoading(true);
      const sessionData = await fetchDetailRecords(id);
      setSession(sessionData);
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, [id]);

  const calculateDuration = () => {
    if (!session?.start_time || !session?.end_time) return 'N/A';

    const minutes = session.duration_minutes || 0;
    const remainingSeconds = Math.round((minutes - Math.floor(minutes)) * 60);

    return `${Math.floor(minutes)} min ${remainingSeconds} sec`;
  };

  const prepareHeartRateData = () => {
    if (
      !session?.heart_rate?.records ||
      session.heart_rate.records.length === 0
    )
      return [];

    const sortedRecords = [...session.heart_rate.records].sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
    );

    const sampleInterval = Math.max(1, Math.floor(sortedRecords.length / 10));
    return sortedRecords
      .filter((_, index) => index % sampleInterval === 0)
      .map(record => ({
        value: record.value,
        label: format(parseISO(record.time), 'HH:mm'),
        labelTextStyle: {color: 'gray', width: 60},
      }));
  };

  const routeCoordinates = useMemo(() => {
    return (
      session?.routes?.map(route => ({
        latitude: route.latitude,
        longitude: route.longitude,
      })) || []
    );
  }, [session?.routes]);

  const startCoordinate = routeCoordinates[0];
  const endCoordinate = routeCoordinates[routeCoordinates.length - 1];

  const getMapRegion = () => {
    if (routeCoordinates.length === 0) {
      return {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }

    const latitudes = routeCoordinates.map(p => p.latitude);
    const longitudes = routeCoordinates.map(p => p.longitude);

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

  const handleCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        mapRef?.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      },
      error => console.log(error),
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  const navigate = useNavigation();

  return (
    <ScreenWrapper bg={'#f9fafb'}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Session Details</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#1E3A8A"
            style={styles.loadingIndicator}
          />
        ) : (
          <>
            <Text style={styles.title}>
              {getNameFromExerciseType(session?.exercise_type || 0)}
            </Text>
            {session?.start_time && (
              <Text style={styles.dateTime}>
                {format(parseISO(session.start_time), 'EEEE, MMMM d, yyyy')}
              </Text>
            )}

            {/* Key Metrics Grid */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Icon name="walk-sharp" size={24} color="#1E3A8A" />
                <Text style={styles.metricLabel}>Distance</Text>
                <Text style={styles.metricValue}>
                  {session?.total_distance
                    ? (session.total_distance / 1000).toFixed(2) + ' km'
                    : 'N/A'}
                </Text>
              </View>

              <View style={styles.metricCard}>
                <Icon name="time-outline" size={24} color="#1E3A8A" />
                <Text style={styles.metricLabel}>Duration</Text>
                <Text style={styles.metricValue}>{calculateDuration()}</Text>
              </View>

              <View style={styles.metricCard}>
                <Icon name="flame-outline" size={24} color="#1E3A8A" />
                <Text style={styles.metricLabel}>Calories</Text>
                <Text style={styles.metricValue}>
                  {session?.total_calories
                    ? session.total_calories.toFixed(2) + ' cal'
                    : 'N/A'}
                </Text>
              </View>

              <View style={styles.metricCard}>
                <Icon name="speedometer-outline" size={24} color="#1E3A8A" />
                <Text style={styles.metricLabel}>Avg. Pace</Text>
                <Text style={styles.metricValue}>
                  {session?.avg_pace
                    ? `${Math.floor(session.avg_pace)}:${Math.round(
                        (session.avg_pace - Math.floor(session.avg_pace)) * 60,
                      )
                        .toString()
                        .padStart(2, '0')} min/km`
                    : 'N/A'}
                </Text>
              </View>
            </View>

            {/* Heart Rate Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="heart" size={20} color="#DC2626" />
                <Text style={styles.sectionTitle}>Heart Rate</Text>
              </View>

              {session?.heart_rate ? (
                <>
                  <View style={styles.heartRateStats}>
                    <View>
                      <Text style={styles.heartRateLabel}>Min</Text>
                      <Text style={styles.heartRateValue}>
                        {session.heart_rate.min} BPM
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.heartRateLabel}>Average</Text>
                      <Text style={styles.heartRateValue}>
                        {session.heart_rate.avg} BPM
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.heartRateLabel}>Max</Text>
                      <Text style={styles.heartRateValue}>
                        {session.heart_rate.max} BPM
                      </Text>
                    </View>
                  </View>

                  {session.heart_rate.records?.length > 0 && (
                    <View style={styles.chartContainer}>
                      <LineChart
                        data={prepareHeartRateData()}
                        height={150}
                        width={wp(70)}
                        spacing={60}
                        color="#DC2626" // Red color for heart rate
                        thickness={3}
                        curved
                        areaChart
                        yAxisOffset={20}
                        noOfSections={4}
                        maxValue={session.heart_rate.max + 20}
                        initialSpacing={20}
                        endSpacing={20}
                        yAxisLabelWidth={40}
                        xAxisLabelTextStyle={{width: 60}}
                        startFillColor="#FECACA" // Light red
                        endFillColor="#FEE2E2" // Very light red
                        adjustToWidth
                      />
                    </View>
                  )}
                </>
              ) : (
                <Text style={styles.noDataText}>
                  No heart rate data available
                </Text>
              )}
            </View>

            {/* Route Map Section */}
            <View style={styles.section}>
              <View
                style={[
                  styles.sectionHeader,
                  {justifyContent: 'space-between'},
                ]}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Icon name="location-outline" size={20} color="#1E3A8A" />
                  <Text style={styles.sectionTitle}>Route Map</Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    navigate.navigate('ExerciseRecordsFullMapScreen', {
                      routes: session?.routes || [],
                      exercise_type: session?.exercise_type,
                      distance: session?.total_distance
                        ? (session.total_distance / 1000).toFixed(2) + ' km'
                        : 'N/A',
                      duration: calculateDuration(),
                      steps: session?.total_steps
                        ? session.total_steps.toLocaleString()
                        : 'N/A',
                    })
                  }
                  style={styles.fullScreenButton}>
                  <Icon name="expand-outline" size={20} color="#1E3A8A" />
                </TouchableOpacity>
              </View>

              {routeCoordinates.length === 0 ? (
                <Text style={styles.noDataText}>No route data available</Text>
              ) : (
                <View style={{borderRadius: 16, overflow: 'hidden'}}>
                  <MapView
                    ref={ref => setMapRef(ref)}
                    style={styles.map}
                    initialRegion={getMapRegion()}
                    region={getMapRegion()}
                    scrollEnabled={true}
                    zoomEnabled={true}
                    loadingEnabled={true}>
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
                  </MapView>
                  <TouchableOpacity
                    style={styles.currentLocationButton}
                    onPress={handleCurrentLocation}>
                    <Icon name="locate" size={20} color="#1E3A8A" />
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.mapStats}>
                <View style={styles.mapStat}>
                  <Icon name="walk-outline" size={20} color="#22C55E" />
                  <View>
                    <Text style={styles.mapStatLabel}>Distance</Text>
                    <Text style={styles.mapStatValue}>
                      {session?.total_distance
                        ? (session.total_distance / 1000).toFixed(2) + ' km'
                        : 'N/A'}
                    </Text>
                  </View>
                </View>
                <View style={styles.mapStat}>
                  <Icon name="footsteps-outline" size={20} color="#22C55E" />
                  <View>
                    <Text style={styles.mapStatLabel}>Steps</Text>
                    <Text style={styles.mapStatValue}>
                      {session?.total_steps
                        ? session.total_steps.toLocaleString()
                        : 'N/A'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() =>
                navigate.navigate('RiskAnalysisConfirmScreen', {
                  userActivity: {
                    age: age,
                    gender: profile.gender,
                    heart_rate_min: session.heart_rate?.min || 0,
                    heart_rate_max: session.heart_rate?.max || 0,
                    heart_rate_avg: session.heart_rate?.avg || 0,
                    avg_pace: session.avg_pace || 0,
                    calories: session.total_calories || 0,
                    distance: session.total_distance
                      ? session.total_distance / 1000
                      : 0,
                    steps: session.total_steps || 0,
                    activity_name: `${getNameFromExerciseType(
                      session?.exercise_type || 0,
                    )}`,
                  },
                })
              }>
              <Icon name="logo-ionitron" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Risk Analysis</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                /* Implement share functionality */
              }}>
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
    marginLeft: 8,
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
    borderRadius: 8,
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
    borderRadius: 8,
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
  currentLocationButton: {
    position: 'absolute',
    bottom: 30,
    right: 15,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fullScreenButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
  },
});

export default ExerciseRecordsDetailScreen;
