import React, {useMemo, useRef, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import MapView, {Polyline, Marker, Region} from 'react-native-maps';
import {useNavigation, useRoute} from '@react-navigation/native';
import BackButton from '../../../BackButton';
import Geolocation from '@react-native-community/geolocation';
import {
  getNameFromExerciseType,
  getIconFromExerciseType,
} from '../../../contants/exerciseType';
import ContentLoader, {Rect, Circle} from 'react-content-loader/native';
import {fetchExerciseSessionById} from '../../../utils/utils_healthconnect';
import ToastUtil from '../../../utils/utils_toast';

interface RouteCoordinate {
  latitude: number;
  longitude: number;
  time: string;
}

interface HeartRateRecord {
  time: string;
  value: number;
}

interface HeartRateData {
  min: number;
  avg: number;
  max: number;
  records: HeartRateRecord[];
}

interface ExerciseSession {
  id: string;
  exercise_type: number;
  user_id: string;
  record_id: string;
  data_origin: string;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
  duration_minutes: number;
  total_distance: number;
  total_steps: number;
  routes: RouteCoordinate[];
  User: {
    id: string;
    name: string;
    email: string;
  };
  total_calories: number;
  avg_pace: string;
  heart_rate: HeartRateData;
}

const CRMessageItemExerciseRecordDetail: React.FC = () => {
  const route = useRoute();
  const {sessionId} = route.params as {sessionId: string};

  console.log(sessionId)

  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<ExerciseSession | null>(null);

  const navigate = useNavigation();
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        setLoading(true);
        const response = await fetchExerciseSessionById(sessionId);

        if (response.status === 'error') {
          ToastUtil.error(
            response.message || 'Failed to load exercise session',
          );
          return;
        }

        setSessionData(response.data);
      } catch (error) {
        ToastUtil.error('An error occurred while fetching exercise data');
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [sessionId]);

  const routeCoordinates = useMemo(() => {
    if (!sessionData?.routes) return [];
    return sessionData.routes.map(route => ({
      latitude: route.latitude,
      longitude: route.longitude,
    }));
  }, [sessionData?.routes]);

  const startCoordinate = routeCoordinates[0];
  const endCoordinate = routeCoordinates[routeCoordinates.length - 1];

  const getMapRegion = (): Region => {
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
        mapRef.current?.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      },
      error => console.log('Error getting current location:', error),
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const secs = Math.floor((minutes * 60) % 60);

    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    } else if (mins > 0) {
      return `${mins}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeftContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigate.goBack()}>
              <BackButton size={24} />
            </TouchableOpacity>

            <ContentLoader
              speed={1}
              width={200}
              height={40}
              viewBox="0 0 200 40"
              backgroundColor="#f3f3f3"
              foregroundColor="#ecebeb">
              <Rect x="50" y="10" rx="4" ry="4" width="150" height="20" />
            </ContentLoader>
          </View>
        </View>

        <ContentLoader
          speed={1}
          width="100%"
          height="100%"
          viewBox="0 0 400 600"
          backgroundColor="#f3f3f3"
          foregroundColor="#ecebeb">
          <Rect x="0" y="0" rx="0" ry="0" width="400" height="600" />
        </ContentLoader>

        <View style={styles.infoContainer}>
          <ContentLoader
            speed={1}
            width="100%"
            height="80"
            viewBox="0 0 400 80"
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb">
            <Rect x="20" y="10" rx="4" ry="4" width="100" height="20" />
            <Rect x="20" y="40" rx="4" ry="4" width="80" height="20" />
            <Rect x="140" y="10" rx="4" ry="4" width="100" height="20" />
            <Rect x="140" y="40" rx="4" ry="4" width="80" height="20" />
            <Rect x="260" y="10" rx="4" ry="4" width="100" height="20" />
            <Rect x="260" y="40" rx="4" ry="4" width="80" height="20" />
          </ContentLoader>
        </View>
      </SafeAreaView>
    );
  }

  if (!sessionData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeftContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigate.goBack()}>
              <BackButton size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Exercise Details</Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load exercise data</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeftContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigate.goBack()}>
            <BackButton size={24} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Icon
              name={getIconFromExerciseType(sessionData.exercise_type)}
              size={20}
              color="#1E3A8A"
              style={styles.exerciseIcon}
            />
            <Text style={styles.headerTitle}>
              {getNameFromExerciseType(sessionData.exercise_type)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={handleCurrentLocation}>
          <Icon name="locate" size={20} color="#1E3A8A" />
        </TouchableOpacity>
      </View>

      <MapView
        ref={mapRef}
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

      {/* Floating info container */}
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Icon name="walk-outline" size={24} color="#1E3A8A" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Distance</Text>
              <Text style={styles.infoValue}>
                {formatDistance(sessionData.total_distance)}
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Icon name="time-outline" size={24} color="#1E3A8A" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Duration</Text>
              <Text style={styles.infoValue}>
                {formatDuration(sessionData.duration_minutes)}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.infoRow, {marginTop: 12}]}>
          <View style={styles.infoItem}>
            <Icon name="speedometer-outline" size={24} color="#1E3A8A" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Avg Pace</Text>
              <Text style={styles.infoValue}>
                {sessionData.avg_pace || 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Icon name="heart-outline" size={24} color="#1E3A8A" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Avg Heart Rate</Text>
              <Text style={styles.infoValue}>
                {sessionData.heart_rate?.avg
                  ? `${sessionData.heart_rate.avg} bpm`
                  : 'N/A'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  headerLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
  },
});

export default CRMessageItemExerciseRecordDetail;
