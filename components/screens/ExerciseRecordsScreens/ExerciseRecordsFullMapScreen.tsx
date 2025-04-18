import React, {useMemo, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Icon from '@react-native-vector-icons/Ionicons';
import MapView, {Polyline, Marker, Region} from 'react-native-maps';
import {useNavigation, useRoute} from '@react-navigation/native';
import BackButton from '../../BackButton';
import Geolocation from '@react-native-community/geolocation';
import { getNameFromExerciseType, getIconFromExerciseType } from '../../contants/exerciseType';

interface RouteCoordinate {
  latitude: number;
  longitude: number;
}

interface ExerciseRecordsFullMapScreenParams {
  routes: RouteCoordinate[];
  exercise_type: number;
  distance: string;
  duration: string;
  steps: string;
}

const ExerciseRecordsFullMapScreen: React.FC = () => {
  const route = useRoute();
  const {
    routes,
    exercise_type,
    distance,
    duration,
    steps,
  } = route.params as ExerciseRecordsFullMapScreenParams;
  
  const navigate = useNavigation();
  const mapRef = useRef<MapView>(null);

  const routeCoordinates = useMemo(() => {
    return routes || [];
  }, [routes]);

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
              name={getIconFromExerciseType(exercise_type)} 
              size={20} 
              color="#1E3A8A" 
              style={styles.exerciseIcon}
            />
            <Text style={styles.headerTitle}>
              {getNameFromExerciseType(exercise_type)}
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
              <Text style={styles.infoValue}>{distance || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Icon name="time-outline" size={24} color="#1E3A8A" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Duration</Text>
              <Text style={styles.infoValue}>{duration || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Icon name="footsteps-outline" size={24} color="#1E3A8A" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Steps</Text>
              <Text style={styles.infoValue}>{steps || 'N/A'}</Text>
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
});

export default ExerciseRecordsFullMapScreen;