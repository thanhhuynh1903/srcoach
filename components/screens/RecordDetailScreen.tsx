import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {LineChart} from 'react-native-gifted-charts';
import BackButton from '../BackButton';
import ScreenWrapper from '../ScreenWrapper';
import {hp, wp} from '../helpers/common';
import MapView, {Marker, Polyline} from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {
  initializeHealthConnect,
  fetchExerciseSession,
  fetchStepRecords,
  fetchDistanceRecords,
  fetchHeartRateRecords,
  fetchActiveCaloriesRecords,
  fetchExerciseRoute,
  ExerciseSession,
  StepRecord,
  DistanceRecord,
  HeartRateRecord,
  CaloriesRecord,
  ExerciseRoutePoint,
  calculateTotalSteps,
  calculateTotalDistance,
  calculateTotalCalories,
} from '../utils/utils_healthconnect';
import {getNameFromExerciseType} from '../contants/exerciseType';

const RecordDetailScreen = () => {
  const route = useRoute();
  const {id, clientRecordId} = route.params;

  const [currentLocation, setCurrentLocation] = useState(null);
  const [exerciseSessionRecord, setExerciseSessionRecord] = useState<ExerciseSession | null>(null);
  const [stepRecords, setStepRecords] = useState<StepRecord[]>([]);
  const [distanceRecords, setDistanceRecords] = useState<DistanceRecord[]>([]);
  const [heartRateRecords, setHeartRateRecords] = useState<HeartRateRecord[]>([]);
  const [caloriesRecords, setCaloriesRecords] = useState<CaloriesRecord[]>([]);
  const [exerciseRoutes, setExerciseRoutes] = useState<ExerciseRoutePoint[]>([]);

  const readSampleData = async () => {
    try {
      const isInitialized = await initializeHealthConnect();
      if (!isInitialized) {
        console.log('Health Connect initialization failed');
        return;
      }

      const session = await fetchExerciseSession(id);
      if (!session) return;

      setExerciseSessionRecord(session);

      const [
        steps,
        distance,
        heartRate,
        calories,
      ] = await Promise.all([
        fetchStepRecords(session.startTime, session.endTime),
        fetchDistanceRecords(session.startTime, session.endTime),
        fetchHeartRateRecords(session.startTime, session.endTime),
        fetchActiveCaloriesRecords(session.startTime, session.endTime),
      ]);

      setStepRecords(steps);
      setDistanceRecords(distance);
      setHeartRateRecords(heartRate);
      setCaloriesRecords(calories);

      const routes = await fetchExerciseRoute(clientRecordId, session.exerciseRoute);
      setExerciseRoutes(routes);
    } catch (error) {
      console.error('Error reading health data:', error);
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

    let minLat = Math.min(...exerciseRoutes.map(p => p.latitude));
    let maxLat = Math.max(...exerciseRoutes.map(p => p.latitude));
    let minLng = Math.min(...exerciseRoutes.map(p => p.longitude));
    let maxLng = Math.max(...exerciseRoutes.map(p => p.longitude));

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: maxLat - minLat + 0.01,
      longitudeDelta: maxLng - minLng + 0.01,
    };
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = end.getTime() - start.getTime();
    const minutes = Math.floor(duration / (1000 * 60));
    const seconds = Math.floor((duration % (1000 * 60)) / 1000);

    return `${minutes} min ${seconds} sec`;
  };

  const calculateAveragePaceInKm = (distance: number, duration: number) => {
    const km = distance / 1000;
    const minutes = duration / 60;
    const averagePace = km / minutes;
    return averagePace.toFixed(2);
  };

  const prepareHeartRateData = () => {
    if (heartRateRecords.length === 0) return [];

    const sortedRecords = [...heartRateRecords].sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );

    return sortedRecords
      .filter((_, index) => index % Math.floor(sortedRecords.length / 10) === 0)
      .map(record => ({
        value: record.beatsPerMinute,
        label: new Date(record.startTime).toLocaleTimeString(),
        labelTextStyle: {color: 'gray'},
      }));
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
    } else {
      await Geolocation.requestAuthorization('whenInUse');
    }
    getCurrentLocation();
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => console.log(error),
      {enableHighAccuracy: true},
    );
  };

  useFocusEffect(
    useCallback(() => {
      readSampleData();
      // requestLocationPermission();
    }, []),
  );

  const navigate = useNavigation();
  return (
    <ScreenWrapper bg={'#f9fafb'}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Record Running Session</Text>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>
          {getNameFromExerciseType(exerciseSessionRecord?.exerciseType)}
        </Text>
        <Text style={styles.dateTime}>
          {exerciseSessionRecord?.startTime &&
            new Date(exerciseSessionRecord.startTime).toLocaleDateString(
              'en-US',
              {year: 'numeric', month: 'long', day: 'numeric'},
            )}
        </Text>

        {/* Key Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Icon name="walk-sharp" size={24} color="#1E3A8A" />
            <Text style={styles.metricLabel}>Distance</Text>
            <Text style={styles.metricValue}>
              {calculateTotalDistance(distanceRecords).toFixed(2)} km
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Icon name="time-outline" size={24} color="#1E3A8A" />
            <Text style={styles.metricLabel}>Duration</Text>
            {exerciseSessionRecord && (
              <Text style={styles.metricValue}>
                {calculateDuration(
                  exerciseSessionRecord.startTime,
                  exerciseSessionRecord.endTime,
                )}
              </Text>
            )}
          </View>
          <View style={styles.metricCard}>
            <Icon name="flame-outline" size={24} color="#1E3A8A" />
            <Text style={styles.metricLabel}>Calories</Text>
            <Text style={styles.metricValue}>
              {(calculateTotalCalories(caloriesRecords) / 1000).toFixed(2)} kcal
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Icon name="speedometer-outline" size={24} color="#1E3A8A" />
            <Text style={styles.metricLabel}>Avg. Pace</Text>
            <Text style={styles.metricValue}>Unknown</Text>
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
              <Text style={styles.heartRateLabel}>Min</Text>
              <Text style={styles.heartRateValue}>
                {Number(
                  heartRateRecords
                    .reduce(
                      (min, record) => Math.min(min, record.beatsPerMinute),
                      Infinity,
                    )
                    .toFixed(2),
                )}{' '}
                BPM
              </Text>
            </View>
            <View>
              <Text style={styles.heartRateLabel}>Average</Text>
              <Text style={styles.heartRateValue}>
                {Number(
                  heartRateRecords.reduce(
                    (total, record) => total + record.beatsPerMinute,
                    0,
                  ) / heartRateRecords.length,
                ).toFixed(2)}{' '}
                BPM
              </Text>
            </View>
          </View>
          <View>
            <Text style={styles.heartRateLabel}>Max</Text>
            <Text style={styles.heartRateValue}>
              {Number(
                heartRateRecords
                  .reduce(
                    (max, record) => Math.max(max, record.beatsPerMinute),
                    0,
                  )
                  .toFixed(2),
              )}{' '}
              BPM
            </Text>
          </View>
          <View style={styles.chartContainer}>
            <LineChart
              data={prepareHeartRateData()}
              height={150}
              width={wp(65)}
              spacing={60}
              color="#1E3A8A"
              thickness={3}
              curved
              yAxisOffset={20}
              noOfSections={4}
              maxValue={
                Math.max(...heartRateRecords.map(r => r.beatsPerMinute)) + 20
              }
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
              initialRegion={getMapRegion()}
              region={getMapRegion()}>
              <Polyline coordinates={exerciseRoutes} />
              {currentLocation && (
                <Marker
                  coordinate={currentLocation}
                  title="Your Location"
                  pinColor="#22C55E" // Green marker
                />
              )}
            </MapView>
          </View>
          <View style={styles.mapStats}>
            <View style={styles.mapStat}>
              <Icon name="walk-outline" size={20} color="#22C55E" />
              <View>
                <Text style={styles.mapStatLabel}>Distance</Text>
                <Text style={styles.mapStatValue}>
                  {new Intl.NumberFormat('en-US').format(
                    calculateTotalDistance(distanceRecords),
                  )}{' '}
                  km
                </Text>
              </View>
            </View>
            <View style={styles.mapStat}>
              <Icon name="footsteps-outline" size={20} color="#22C55E" />
              <View>
                <Text style={styles.mapStatLabel}>Steps</Text>
                <Text style={styles.mapStatValue}>
                  {new Intl.NumberFormat('en-US').format(
                    calculateTotalSteps(stepRecords),
                  )}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => navigate.navigate('RiskWarningScreen' as never)}>
          <Icon name="document-text-outline" size={20} color="#FFFFFF" />
          <Text style={styles.shareButtonText}>Risk analysis</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ButtonFooter}>
          <Icon name="share-outline" size={20} color="#000000" />
          <Text style={styles.ButtonFooterText}>Share your data</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
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
    gap: 8,
    backgroundColor: '#FFFFF',
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
    height: 200,
    marginTop: 16,
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
    marginBottom: 8,
    gap: 8,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  ButtonFooter: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  ButtonFooterText: {
    color: '#4A4A4A',
    fontSize: 16,
    fontWeight: '600',
  },
  map: {
    width: '100%',
    height: hp(25),
  },
});

export default RecordDetailScreen;
