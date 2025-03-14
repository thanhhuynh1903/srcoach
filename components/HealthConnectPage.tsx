import { View, Text, Button } from 'react-native';
import React, { useState } from 'react';
import {
  initialize,
  requestPermission,
  readRecords,
  requestExerciseRoute,
  readRecord,
} from 'react-native-health-connect';

export default function HealthConnectPage() {
  const [caloriesBurned, setCaloriesBurned] = useState(null);
  const [totalCaloriesBurned, setTotalCaloriesBurned] = useState(null);
  const [heartRate, setHeartRate] = useState(null);
  const [steps, setSteps] = useState(null);
  const [distance, setDistance] = useState(null);
  const [exerciseSessions, setExerciseSessions] = useState(null);

  const readSampleData = async () => {
    try {
      const isInitialized = await initialize();
      if (!isInitialized) {
        console.log('Health Connect initialization failed');
        return;
      }

      const grantedPermissions = await requestPermission([
        { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
        { accessType: 'read', recordType: 'HeartRate' },
        { accessType: 'read', recordType: 'Steps' },
        { accessType: 'read', recordType: 'TotalCaloriesBurned' },
        { accessType: 'read', recordType: "Distance" },
        { accessType: 'read', recordType: "ExerciseSession" },
        { accessType: "write", recordType: "ExerciseSession" },
        // {accessType: "read", recordType: "ExerciseRoute"},
      ]);

      if (!grantedPermissions) {
        console.log('Permissions not granted');
        return;
      }

      try {
        const caloriesResult = await readRecords('ActiveCaloriesBurned', {
          timeRangeFilter: {
            operator: 'between',
            startTime: '2025-03-02T00:00:00.000Z',
            endTime: new Date().toISOString(),
          },
        });
        setCaloriesBurned(caloriesResult);
        console.log('Active Calories Burned:', caloriesResult);
      } catch (error) {
        console.error('Error reading ActiveCaloriesBurned data:', error);
      }

      try {
        const totalCaloriesResult = await readRecords('TotalCaloriesBurned', {
          timeRangeFilter: {
            operator: 'between',
            startTime: '2025-03-02T00:00:00.000Z',
            endTime: new Date().toISOString(),
          },
        });
        setTotalCaloriesBurned(totalCaloriesResult);
        console.log('Total Calories Burned:', totalCaloriesResult);
      } catch (error) {
        console.error('Error reading TotalCaloriesBurned data:', error);
      }

      try {
        const heartRateResult = await readRecords('HeartRate', {
          timeRangeFilter: {
            operator: 'between',
            startTime: '2025-03-02T00:00:00.000Z',
            endTime: new Date().toISOString(),
          },
          ascendingOrder: false,
        });
        setHeartRate(heartRateResult);
        console.log('Heart Rate:', heartRateResult);
      } catch (error) {
        console.error('Error reading HeartRate data:', error);
      }

      try {
        const stepsResult = await readRecords('Steps', {
          timeRangeFilter: {
            operator: 'between',
            startTime: '2025-03-02T00:00:00.000Z',
            endTime: new Date().toISOString(),
          },
        });
        setSteps(stepsResult);
        console.log('Steps:', stepsResult);
      } catch (error) {
        console.error('Error reading Steps data:', error);
      }

      try {
        const distanceResult = await readRecords('Distance', {
          timeRangeFilter: {
            operator: 'between',
            startTime: '2025-03-02T00:00:00.000Z',
            endTime: new Date().toISOString(),
          },
        });
        setDistance(distanceResult);
        console.log('Distance:', distanceResult);
      } catch (error) {
        console.error('Error reading Distance data:', error);
      }

      // try {
      //   const exerciseSessionsResult = await readRecords('ExerciseSession', {
      //     timeRangeFilter: {
      //       operator: 'between',
      //       startTime: '2025-03-02T00:00:00.000Z',
      //       endTime: new Date().toISOString(),
      //     },
      //   });
      //   setExerciseSessions(exerciseSessionsResult);
      //   console.log(exerciseSessionsResult);
      // } catch (error) {
      //   console.error('Error reading ExerciseSessions data:', error);
      // }

      const recordId = "7f6e0884-b491-30f2-b20b-b7c2a2160659";
      readRecord("ExerciseSession", recordId)
        .then((exercise) => {
          console.log(exercise);
          if (
            exercise.exerciseRoute?.type == "CONSENT_REQUIRED"
          ) {
            requestExerciseRoute(recordId).then(({ route }) => {
              if (route) {
                console.log(JSON.stringify(route, null, 2));
              } else {
                console.log("User denied access");
              }
            });
          }
        })
        .catch((err) => {
          console.error("Error reading exercise record", { err });
        });

    } catch (error) {
      console.error('Error reading Health Connect data:', error);
    }
  };

  return (
    <View>
      <Text>HealthConnectPage</Text>
      <Button title="Fetch Data" onPress={readSampleData} />
      {exerciseSessions && <Text>Exercise Sessions: {JSON.stringify(exerciseSessions)}</Text>}
    </View>
  );
}

