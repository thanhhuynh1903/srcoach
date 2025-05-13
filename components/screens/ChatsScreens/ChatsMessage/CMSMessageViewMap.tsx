import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import MapView, {Polyline, Marker, Region} from 'react-native-maps';
import {useNavigation, useRoute} from '@react-navigation/native';
import BackButton from '../../../BackButton';
import Geolocation from '@react-native-community/geolocation';
import {getNameFromExerciseType, getIconFromExerciseType} from '../../../contants/exerciseType';
import {fetchExerciseSessionById} from '../../../utils/utils_healthconnect';
import ContentLoader, { Rect, Circle } from 'react-content-loader/native';

interface RouteCoordinate {
  latitude: number;
  longitude: number;
  time: string;
}

interface HeartRateRecord {
  time: string;
  value: number;
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
  heart_rate: {
    min: number;
    avg: number;
    max: number;
    records: HeartRateRecord[];
  };
}

export default function CMSMessageViewMap() {
  const routes = useRoute()
  const {id}: any = routes.params
  const [exerciseSession, setExerciseSession] = useState<ExerciseSession | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigation();
  const mapRef = useRef<MapView>(null);
  const panY = useRef(new Animated.Value(0)).current;
  const translateY = panY.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0, 0, 1],
  });
  const [isInfoVisible, setIsInfoVisible] = useState(true);
  const { height } = Dimensions.get('window');
  const infoContainerHeight = height * 0.35;

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetchExerciseSessionById(id);
      if (response.status === 'success') {
        setExerciseSession(response.data);
      }
    } catch (error) {
      console.error('Error fetching exercise session:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const routeCoordinates = useMemo(() => {
    return exerciseSession?.routes?.map(route => ({
      latitude: route.latitude,
      longitude: route.longitude,
    })) || [];
  }, [exerciseSession]);

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

  const toggleInfoVisibility = () => {
    Animated.spring(panY, {
      toValue: isInfoVisible ? infoContainerHeight : 0,
      useNativeDriver: true,
    }).start();
    setIsInfoVisible(!isInfoVisible);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours > 0 ? `${hours}h ` : ''}${mins}m`;
  };

  const renderLoadingSkeleton = () => (
    <View style={styles.skeletonContainer}>
      <ContentLoader 
        speed={1}
        width="100%"
        height={infoContainerHeight}
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
      >
        <Rect x="16" y="16" rx="4" ry="4" width="30%" height="24" />
        <Rect x="16" y="56" rx="4" ry="4" width="100%" height="1" />
        
        <Rect x="16" y="72" rx="4" ry="4" width="28%" height="60" />
        <Rect x="36%" y="72" rx="4" ry="4" width="28%" height="60" />
        <Rect x="72%" y="72" rx="4" ry="4" width="28%" height="60" />
        
        <Rect x="16" y="148" rx="4" ry="4" width="28%" height="60" />
        <Rect x="36%" y="148" rx="4" ry="4" width="28%" height="60" />
        <Rect x="72%" y="148" rx="4" ry="4" width="28%" height="60" />
      </ContentLoader>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header - always visible */}
      <View style={styles.header}>
        <View style={styles.headerLeftContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigate.goBack()}>
            <BackButton size={24} />
          </TouchableOpacity>
          
          {loading ? (
            <ContentLoader 
              width={150}
              height={24}
              backgroundColor="#f3f3f3"
              foregroundColor="#ecebeb"
            >
              <Rect x="0" y="0" rx="4" ry="4" width="150" height="24" />
            </ContentLoader>
          ) : (
            <View style={styles.headerTitleContainer}>
              <Icon 
                name={getIconFromExerciseType(exerciseSession?.exercise_type || 0)} 
                size={20} 
                color="#1E3A8A" 
                style={styles.exerciseIcon}
              />
              <Text style={styles.headerTitle}>
                {getNameFromExerciseType(exerciseSession?.exercise_type || 0)}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={handleCurrentLocation}>
          <Icon name="locate" size={20} color="#1E3A8A" />
        </TouchableOpacity>
      </View>

      {/* Map View */}
      {loading ? (
        <View style={styles.mapPlaceholder}>
          <ContentLoader 
            width="100%"
            height="100%"
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
          >
            <Rect x="0" y="0" rx="0" ry="0" width="100%" height="100%" />
          </ContentLoader>
        </View>
      ) : (
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
      )}

      {/* Floating info container with gesture */}
      <Animated.View 
        style={[
          styles.infoContainer, 
          { 
            height: infoContainerHeight,
            transform: [{ translateY }] 
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.dragHandle} 
          onPress={toggleInfoVisibility}
        >
          <View style={styles.dragHandleIndicator} />
        </TouchableOpacity>
        
        {loading ? (
          renderLoadingSkeleton()
        ) : !exerciseSession ? (
          <View style={styles.noDataContainer}>
            <Text>No exercise session data available</Text>
          </View>
        ) : (
          <>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Icon name="walk-outline" size={24} color="#1E3A8A" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Distance</Text>
                  <Text style={styles.infoValue}>
                    {(exerciseSession.total_distance / 1000).toFixed(2)} km
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <Icon name="time-outline" size={24} color="#1E3A8A" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Duration</Text>
                  <Text style={styles.infoValue}>
                    {formatDuration(exerciseSession.duration_minutes)}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <Icon name="footsteps-outline" size={24} color="#1E3A8A" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Steps</Text>
                  <Text style={styles.infoValue}>{exerciseSession.total_steps}</Text>
                </View>
              </View>
            </View>

            <View style={[styles.infoRow, {marginTop: 12}]}>
              <View style={styles.infoItem}>
                <Icon name="flame-outline" size={24} color="#1E3A8A" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Calories</Text>
                  <Text style={styles.infoValue}>{exerciseSession.total_calories}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <Icon name="speedometer-outline" size={24} color="#1E3A8A" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Pace</Text>
                  <Text style={styles.infoValue}>{exerciseSession.avg_pace || 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <Icon name="heart-outline" size={24} color="#1E3A8A" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Heart Rate</Text>
                  <Text style={styles.infoValue}>
                    {exerciseSession.heart_rate?.avg || 'N/A'}
                  </Text>
                </View>
              </View>
            </View>

            {exerciseSession.heart_rate && (
              <View style={[styles.infoRow, {marginTop: 12}]}>
                <View style={styles.infoItem}>
                  <Icon name="heart-outline" size={24} color="#1E3A8A" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Min HR</Text>
                    <Text style={styles.infoValue}>{exerciseSession.heart_rate.min}</Text>
                  </View>
                </View>

                <View style={styles.infoItem}>
                  <Icon name="heart-outline" size={24} color="#1E3A8A" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Avg HR</Text>
                    <Text style={styles.infoValue}>{exerciseSession.heart_rate.avg}</Text>
                  </View>
                </View>

                <View style={styles.infoItem}>
                  <Icon name="heart-outline" size={24} color="#1E3A8A" />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Max HR</Text>
                    <Text style={styles.infoValue}>{exerciseSession.heart_rate.max}</Text>
                  </View>
                </View>
              </View>
            )}
          </>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

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
    zIndex: 10,
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
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#f3f3f3',
  },
  infoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  dragHandle: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dragHandleIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  skeletonContainer: {
    flex: 1,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});