import React, {useState, useCallback, useMemo, useRef, useEffect} from 'react';
import {View, Text, StyleSheet, Dimensions, ScrollView} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import {LineChart} from 'react-native-gifted-charts';
import {MASTER_URL} from '../../utils/zustandfetchAPI';
import MapView, {Polyline, Marker, LatLng} from 'react-native-maps';
import ContentLoader, {Rect, Circle} from 'react-content-loader/native';
import Icon from '@react-native-vector-icons/ionicons';

interface RoutePoint {
  time: string;
  latitude: number;
  longitude: number;
}

interface HeartRateRecord {
  time: string;
  value: number;
}

interface ExerciseSessionData {
  exercise_type: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  total_distance: number;
  total_calories: number;
  total_steps: number;
  avg_pace: string | null;
  heart_rate: {
    min: number | null;
    avg: number | null;
    max: number | null;
    records: HeartRateRecord[];
  };
  routes: RoutePoint[];
}

const {width} = Dimensions.get('window');
const CHART_WIDTH = width * 0.66;

export default function CommunityPostDetailMap({exerciseSessionRecordId}) {
  const [exerciseData, setExerciseData] = useState<ExerciseSessionData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState(false);

  const fetchExerciseData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.get(
        `${MASTER_URL}/record-exercise-session/${exerciseSessionRecordId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setExerciseData(response.data.data);
    } catch (error) {
      console.error('Error fetching exercise data:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchExerciseData();
      return () => {
        // Cleanup function
      };
    }, [exerciseSessionRecordId]),
  );

  // Process heart rate data into 1-minute averages
  const processedHeartRateData = useMemo(() => {
    if (!exerciseData?.heart_rate?.records) return [];

    const records = [...exerciseData.heart_rate.records];
    const minuteAverages = [];

    // Group records by minute
    let currentMinute = new Date(records[0].time).getMinutes();
    let currentHour = new Date(records[0].time).getHours();
    let minuteRecords = [];
    let minuteSum = 0;

    for (const record of records) {
      const recordDate = new Date(record.time);
      const recordMinute = recordDate.getMinutes();
      const recordHour = recordDate.getHours();

      if (recordMinute === currentMinute && recordHour === currentHour) {
        minuteRecords.push(record.value);
        minuteSum += record.value;
      } else {
        // Calculate average for the completed minute
        if (minuteRecords.length > 0) {
          minuteAverages.push({
            time: new Date(record.time).setMinutes(currentMinute, 0, 0),
            value: Math.round(minuteSum / minuteRecords.length),
          });
        }

        // Reset for new minute
        currentMinute = recordMinute;
        currentHour = recordHour;
        minuteRecords = [record.value];
        minuteSum = record.value;
      }
    }

    // Add the last minute
    if (minuteRecords.length > 0) {
      minuteAverages.push({
        time: new Date(records[records.length - 1].time).setMinutes(
          currentMinute,
          0,
          0,
        ),
        value: Math.round(minuteSum / minuteRecords.length),
      });
    }

    return minuteAverages;
  }, [exerciseData]);

  // Fit map to route coordinates
  useEffect(() => {
    if (mapReady && exerciseData?.routes?.length > 0 && mapRef.current) {
      const coordinates = exerciseData.routes.map(route => ({
        latitude: route.latitude,
        longitude: route.longitude,
      }));

      // Calculate bounds
      const latArray = coordinates.map(coord => coord.latitude);
      const lngArray = coordinates.map(coord => coord.longitude);

      const minLat = Math.min(...latArray);
      const maxLat = Math.max(...latArray);
      const minLng = Math.min(...lngArray);
      const maxLng = Math.max(...lngArray);

      // Calculate padding (10% of the range)
      const latPadding = (maxLat - minLat) * 0.1;
      const lngPadding = (maxLng - minLng) * 0.1;

      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: {
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        },
        animated: true,
      });
    }
  }, [mapReady, exerciseData?.routes]);

  const renderMap = () => {
    if (!exerciseData?.routes || exerciseData.routes.length === 0) {
      return (
        <View style={styles.noRouteContainer}>
          <Text>No route data available</Text>
        </View>
      );
    }

    const coordinates = exerciseData.routes.map(route => ({
      latitude: route.latitude,
      longitude: route.longitude,
    }));

    const startPoint = coordinates[0];
    const endPoint = coordinates[coordinates.length - 1];

    return (
      <MapView
        ref={mapRef}
        style={styles.map}
        onMapReady={() => setMapReady(true)}
        initialRegion={{
          latitude: startPoint.latitude,
          longitude: startPoint.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}>
        <Polyline
          coordinates={coordinates}
          strokeColor="#3498db"
          strokeWidth={4}
        />
        {startPoint && (
          <Marker coordinate={startPoint} title="Start">
            <View style={styles.markerStart}>
              <Icon name="play" size={16} color="#FFFFFF" />
            </View>
          </Marker>
        )}
        {endPoint && (
          <Marker coordinate={endPoint} title="Finish">
            <View style={styles.markerEnd}>
              <Icon name="flag" size={16} color="#FFFFFF" />
            </View>
          </Marker>
        )}
      </MapView>
    );
  };

  const renderStats = () => {
    if (!exerciseData) return null;

    const stats = [
      {label: 'Duration', value: `${exerciseData.duration_minutes} mins`},
      {
        label: 'Distance',
        value: `${(exerciseData.total_distance / 1000).toFixed(2)} km`,
      },
      {label: 'Calories', value: exerciseData.total_calories},
      {label: 'Steps', value: exerciseData.total_steps},
      ...(exerciseData.avg_pace
        ? [{label: 'Pace', value: `${exerciseData.avg_pace} min/km`}]
        : []),
      {
        label: 'Avg HR',
        value: exerciseData.heart_rate.avg
          ? `${exerciseData.heart_rate.avg} bpm`
          : 'N/A',
      },
    ];

    // Split stats into rows of 3 items each
    const rows = [];
    for (let i = 0; i < stats.length; i += 3) {
      rows.push(stats.slice(i, i + 3));
    }

    return (
      <View style={styles.statsContainer}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.statRow}>
            {row.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
            ))}
            {/* Add empty views if less than 3 items to maintain layout */}
            {row.length < 3 &&
              Array(3 - row.length)
                .fill(0)
                .map((_, i) => (
                  <View key={`empty-${i}`} style={styles.statItem} />
                ))}
          </View>
        ))}
      </View>
    );
  };

  const renderHeartRateChart = () => {
    if (processedHeartRateData.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Text>No heart rate data available</Text>
        </View>
      );
    }

    const chartData = processedHeartRateData.map(record => ({
      value: record.value,
      label: new Date(record.time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      dataPointText: record.value.toString(),
    }));

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Heart Rate (bpm)</Text>
        <LineChart
          data={chartData}
          height={200}
          width={CHART_WIDTH}
          color="#ff0000"
          dataPointsColor="#ff0000"
          textColor="#000"
          textFontSize={12}
          areaChart
          startFillColor="rgba(255, 0, 0, 0.2)"
          startOpacity={0.8}
          endFillColor="rgba(255, 0, 0, 0.01)"
          endOpacity={0.1}
          yAxisLabelWidth={40}
          xAxisLabelTexts={chartData
            .filter(
              (_, index) => index % Math.floor(chartData.length / 40) === 0,
            )
            .map(item => item.label)}
          showReferenceLine1
          referenceLine1Position={exerciseData?.heart_rate.avg || 0}
          referenceLine1Config={{
            color: 'gray',
            dashWidth: 2,
            dashGap: 3,
            labelText: 'Avg',
            labelTextStyle: {color: 'gray', fontSize: 10},
          }}
        />
      </View>
    );
  };

  const renderContentLoader = () => (
    <View style={styles.loaderContainer}>
      <ContentLoader
        speed={1}
        width={width - 40}
        height={400}
        viewBox={`0 0 ${width - 40} 400`}
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb">
        <Rect x="0" y="0" rx="4" ry="4" width={width - 40} height="200" />
        {/* Stats loader - 2 rows of 3 items */}
        <Rect x="0" y="220" rx="4" ry="4" width="30%" height="15" />
        <Rect x="0" y="240" rx="4" ry="4" width="30%" height="25" />
        <Rect x="34%" y="220" rx="4" ry="4" width="30%" height="15" />
        <Rect x="34%" y="240" rx="4" ry="4" width="30%" height="25" />
        <Rect x="68%" y="220" rx="4" ry="4" width="30%" height="15" />
        <Rect x="68%" y="240" rx="4" ry="4" width="30%" height="25" />
        <Rect x="0" y="280" rx="4" ry="4" width="30%" height="15" />
        <Rect x="0" y="300" rx="4" ry="4" width="30%" height="25" />
        <Rect x="34%" y="280" rx="4" ry="4" width="30%" height="15" />
        <Rect x="34%" y="300" rx="4" ry="4" width="30%" height="25" />
        <Rect x="68%" y="280" rx="4" ry="4" width="30%" height="15" />
        <Rect x="68%" y="300" rx="4" ry="4" width="30%" height="25" />
        {/* Chart loader */}
        <Rect x="0" y="340" rx="4" ry="4" width={width - 40} height="200" />
      </ContentLoader>
    </View>
  );
  
  if (!exerciseSessionRecordId) {
    return <View></View>;
  }

  return (
    <ScrollView style={styles.container}>
      {loading ? (
        renderContentLoader()
      ) : (
        <>
          <View style={styles.section}>{renderMap()}</View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Exercise Stats</Text>
            {renderStats()}
          </View>

          {/* <View style={styles.section}>{renderHeartRateChart()}</View> */}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#e5e5e5',
    borderRadius: 10,
  },
  loaderContainer: {
    padding: 10,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  map: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    overflow: 'hidden',
  },
  noRouteContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  statsContainer: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    minWidth: '30%',
  },
  statLabel: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chartContainer: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  noDataContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  flagContainer: {
    alignItems: 'center',
  },
  flag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  flagPole: {
    width: 2,
    height: 15,
  },
  flagText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  startFlag: {
    backgroundColor: '#2ecc71',
    borderColor: '#27ae60',
  },
  startFlagPole: {
    backgroundColor: '#27ae60',
  },
  finishFlag: {
    backgroundColor: '#e74c3c',
    borderColor: '#c0392b',
  },
  finishFlagPole: {
    backgroundColor: '#c0392b',
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
