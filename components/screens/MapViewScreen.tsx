import MapView, { Marker, Polyline } from 'react-native-maps';
import React, { useState } from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import { initialize, requestPermission, readRecord, requestExerciseRoute } from 'react-native-health-connect';

const MapViewScreen = () => {
  const [routePath, setRoutePath] = useState([]);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const fetchExerciseRoute = async () => {
    try {
      const isInitialized = await initialize();
      if (!isInitialized) {
        console.log('Health Connect initialization failed');
        return;
      }

      console.log("Initializing...");

      const grantedPermissions = await requestPermission([
        { accessType: 'read', recordType: 'ExerciseSession' }
      ]);

      if (!grantedPermissions) {
        console.log('Permissions not granted');
        return;
      }

      const recordId = "7f6e0884-b491-30f2-b20b-b7c2a2160659";
      const exercise = await readRecord("ExerciseSession", recordId);
      console.log("Reading...");

      if (typeof exercise?.exerciseRoute?.type === 'string' && exercise?.exerciseRoute?.type === "CONSENT_REQUIRED") {
        const { route } = await requestExerciseRoute(recordId);
        if (!route) {
          console.log("User denied access");
          return;
        }
        processRoute(route);
      } else {
        processRoute(exercise?.exerciseRoute?.route);
      }
    } catch (error) {
      console.error('Error fetching exercise route:', error);
    }
  };

  const processRoute = (route : any) => {
    const extractedPath = route.map((point: { latitude: number; longitude: number }) => ({
      latitude: point.latitude,
      longitude: point.longitude
    }));
    setRoutePath(extractedPath);
    if (extractedPath.length > 0) {
      setRegion(prevRegion => ({
        ...prevRegion,
        latitude: extractedPath[0].latitude,
        longitude: extractedPath[0].longitude
      }));
    }
  };

  return (
    <View style={styles.container}>
      <Text>Google Map React Native with Health Connect Route</Text>
      <Button title="Fetch Route" onPress={fetchExerciseRoute} />
      <MapView style={styles.map} region={region}>
        {routePath.length > 0 && (
          <>
            <Marker coordinate={routePath[0]} title="Start Point" />
            <Marker coordinate={routePath[routePath.length - 1]} title="End Point" />
            <Polyline coordinates={routePath} strokeWidth={4} strokeColor="blue" />
          </>
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  map: {
    width: '100%',
    height: '75%',
  },
});

export default MapViewScreen;