"use client"

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from "react-native"
import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useFocusEffect } from "@react-navigation/native"
import { LineChart } from "react-native-gifted-charts"
import { MASTER_URL } from "../../utils/zustandfetchAPI"
import MapView, { Polyline, Marker } from "react-native-maps"
import ContentLoader, { Rect } from "react-content-loader/native"
import Icon from "@react-native-vector-icons/ionicons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

interface RoutePoint {
  time: string
  latitude: number
  longitude: number
}

interface HeartRateRecord {
  time: string
  value: number
}

interface ExerciseSessionData {
  exercise_type: string
  start_time: string
  end_time: string
  duration_minutes: number
  total_distance: number
  total_calories: number
  total_steps: number
  avg_pace: string | null
  heart_rate: {
    min: number | null
    avg: number | null
    max: number | null
    records: HeartRateRecord[]
  }
  routes: RoutePoint[]
}

const { width, height } = Dimensions.get("window")
const CHART_WIDTH = width - 40

export default function CommunityPostDetailMap({ exerciseSessionRecordId }: { exerciseSessionRecordId: string }) {
  const [exerciseData, setExerciseData] = useState<ExerciseSessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("stats")
  const mapRef = useRef<MapView>(null)
  const [mapReady, setMapReady] = useState(false)
  const insets = useSafeAreaInsets()

  const fetchExerciseData = async () => {
    try {
      setLoading(true)
      const token = await AsyncStorage.getItem("authToken")
      const response = await axios.get(`${MASTER_URL}/record-exercise-session/${exerciseSessionRecordId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setExerciseData(response.data.data)
    } catch (error) {
      console.error("Error fetching exercise data:", error)
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      if (exerciseSessionRecordId) {
        fetchExerciseData()
      }
      return () => {
        // Cleanup function
      }
    }, [exerciseSessionRecordId]),
  )

  // Process heart rate data into 1-minute averages
  const processedHeartRateData = useMemo(() => {
    if (!exerciseData?.heart_rate?.records) return []

    const records = [...exerciseData.heart_rate.records]
    if (records.length === 0) return []

    const minuteAverages = []

    // Group records by minute
    let currentMinute = new Date(records[0].time).getMinutes()
    let currentHour = new Date(records[0].time).getHours()
    let minuteRecords = []
    let minuteSum = 0

    for (const record of records) {
      const recordDate = new Date(record.time)
      const recordMinute = recordDate.getMinutes()
      const recordHour = recordDate.getHours()

      if (recordMinute === currentMinute && recordHour === currentHour) {
        minuteRecords.push(record.value)
        minuteSum += record.value
      } else {
        // Calculate average for the completed minute
        if (minuteRecords.length > 0) {
          minuteAverages.push({
            time: new Date(record.time).setMinutes(currentMinute, 0, 0),
            value: Math.round(minuteSum / minuteRecords.length),
          })
        }

        // Reset for new minute
        currentMinute = recordMinute
        currentHour = recordHour
        minuteRecords = [record.value]
        minuteSum = record.value
      }
    }

    // Add the last minute
    if (minuteRecords.length > 0) {
      minuteAverages.push({
        time: new Date(records[records.length - 1].time).setMinutes(currentMinute, 0, 0),
        value: Math.round(minuteSum / minuteRecords.length),
      })
    }

    return minuteAverages
  }, [exerciseData])

  // Fit map to route coordinates
  useEffect(() => {
    if (mapReady && exerciseData?.routes && exerciseData.routes.length > 0 && mapRef.current) {
      const coordinates = exerciseData.routes.map((route) => ({
        latitude: route.latitude,
        longitude: route.longitude,
      }))

      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: {
          top: 40,
          right: 40,
          bottom: 40,
          left: 40,
        },
        animated: true,
      })
    }
  }, [mapReady, exerciseData?.routes])

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const renderMap = () => {
    if (!exerciseData?.routes || exerciseData.routes.length === 0) {
      return (
        <View style={styles.noRouteContainer}>
          <Icon name="map-outline" size={40} color="#ccc" />
          <Text style={styles.noDataText}>No route data available</Text>
        </View>
      )
    }

    const coordinates = exerciseData.routes.map((route) => ({
      latitude: route.latitude,
      longitude: route.longitude,
    }))

    const startPoint = coordinates[0]
    const endPoint = coordinates[coordinates.length - 1]

    return (
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          onMapReady={() => setMapReady(true)}
          initialRegion={{
            latitude: startPoint.latitude,
            longitude: startPoint.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          mapType="standard"
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
          showsBuildings={false}
          showsTraffic={false}
          showsIndoors={false}
          zoomEnabled={true}
          zoomControlEnabled={true}
          rotateEnabled={true}
          scrollEnabled={true}
          pitchEnabled={true}
        >
          <Polyline
            coordinates={coordinates}
            strokeColor="#3B82F6"
            strokeWidth={5}
            lineDashPattern={[0]}
            lineCap="round"
            lineJoin="round"
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

        <View style={styles.mapOverlay}>
          <View style={styles.mapCard}>
            <Text style={styles.mapCardTitle}>{exerciseData.exercise_type || "Exercise"}</Text>
            <Text style={styles.mapCardSubtitle}>{formatDate(exerciseData.start_time)}</Text>
          </View>
        </View>
      </View>
    )
  }

  const renderStats = () => {
    if (!exerciseData) return null

    const mainStats = [
      {
        label: "Distance",
        value: `${(exerciseData.total_distance / 1000).toFixed(2)}`,
        unit: "km",
        icon: "map-outline",
      },
      {
        label: "Duration",
        value: `${exerciseData.duration_minutes}`,
        unit: "min",
        icon: "time-outline",
      },
      {
        label: "Calories",
        value: exerciseData.total_calories,
        unit: "kcal",
        icon: "flame-outline",
      },
    ]

    const detailedStats = [
      {
        label: "Steps",
        value: exerciseData.total_steps.toLocaleString(),
        icon: "footsteps-outline",
      },
      ...(exerciseData.avg_pace
        ? [
            {
              label: "Pace",
              value: exerciseData.avg_pace,
              unit: "min/km",
              icon: "speedometer-outline",
            },
          ]
        : []),
      ...(exerciseData.heart_rate.avg
        ? [
            {
              label: "Avg HR",
              value: exerciseData.heart_rate.avg,
              unit: "bpm",
              icon: "heart-outline",
            },
          ]
        : []),
      ...(exerciseData.heart_rate.max
        ? [
            {
              label: "Max HR",
              value: exerciseData.heart_rate.max,
              unit: "bpm",
              icon: "pulse-outline",
            },
          ]
        : []),
    ]

    return (
      <View style={styles.statsContainer}>
        <View style={styles.mainStatsContainer}>
          {mainStats.map((stat, index) => (
            <View key={index} style={styles.mainStatItem}>
              <View>
                <Icon name={stat.icon as never} size={20} color="#3B82F6" />
              </View>
              <View style={styles.mainStatContent}>
                <Text style={styles.mainStatValue}>
                  {stat.value}
                  <Text style={styles.mainStatUnit}> {stat.unit}</Text>
                </Text>
                <Text style={styles.mainStatLabel}>{stat.label}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.detailedStatsContainer}>
          {detailedStats.map((stat, index) => (
            <View key={index} style={styles.detailedStatItem}>
              <View style={styles.detailedStatIconContainer}>
                <Icon name={stat.icon as never} size={16} color="#3B82F6" />
              </View>
              <Text style={styles.detailedStatLabel}>{stat.label}</Text>
              <Text style={styles.detailedStatValue}>
                {stat.value}
                {stat.unit && <Text style={styles.detailedStatUnit}> {stat.unit}</Text>}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.timeContainer}>
          <View style={styles.timeItem}>
            <Text style={styles.timeLabel}>Started</Text>
            <Text style={styles.timeValue}>{formatTime(exerciseData.start_time)}</Text>
          </View>
          <View style={styles.timeSeparator} />
          <View style={styles.timeItem}>
            <Text style={styles.timeLabel}>Ended</Text>
            <Text style={styles.timeValue}>{formatTime(exerciseData.end_time)}</Text>
          </View>
        </View>
      </View>
    )
  }

  const renderHeartRateChart = () => {
    if (!exerciseData?.heart_rate?.records || processedHeartRateData.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Icon name="heart-outline" size={40} color="#ccc" />
          <Text style={styles.noDataText}>No heart rate data available</Text>
        </View>
      )
    }

    const chartData = processedHeartRateData.map((record) => ({
      value: record.value,
      label: new Date(record.time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      dataPointText: "",
    }))

    // Calculate min, max, and avg heart rates
    const hrValues = chartData.map((item) => item.value)
    const minHR = Math.min(...hrValues)
    const maxHR = Math.max(...hrValues)
    const avgHR =
      exerciseData.heart_rate.avg || Math.round(hrValues.reduce((sum, val) => sum + val, 0) / hrValues.length)

    const hrZones = [
      { name: "Max", color: "#EF4444", range: `${Math.round(maxHR * 0.9)}-${maxHR}` },
      { name: "Hard", color: "#F97316", range: `${Math.round(maxHR * 0.8)}-${Math.round(maxHR * 0.9)}` },
      { name: "Moderate", color: "#FBBF24", range: `${Math.round(maxHR * 0.7)}-${Math.round(maxHR * 0.8)}` },
      { name: "Light", color: "#22C55E", range: `${Math.round(maxHR * 0.6)}-${Math.round(maxHR * 0.7)}` },
      { name: "Very Light", color: "#3B82F6", range: `${Math.round(maxHR * 0.5)}-${Math.round(maxHR * 0.6)}` },
    ]

    return (
      <View style={styles.chartContainer}>
        <View style={styles.heartRateSummary}>
          <View style={styles.hrSummaryItem}>
            <Text style={styles.hrSummaryLabel}>Min</Text>
            <Text style={styles.hrSummaryValue}>{minHR}</Text>
            <Text style={styles.hrSummaryUnit}>bpm</Text>
          </View>
          <View style={[styles.hrSummaryItem, styles.hrSummaryItemAvg]}>
            <Text style={styles.hrSummaryLabel}>Avg</Text>
            <Text style={[styles.hrSummaryValue, styles.hrSummaryValueAvg]}>{avgHR}</Text>
            <Text style={styles.hrSummaryUnit}>bpm</Text>
          </View>
          <View style={styles.hrSummaryItem}>
            <Text style={styles.hrSummaryLabel}>Max</Text>
            <Text style={styles.hrSummaryValue}>{maxHR}</Text>
            <Text style={styles.hrSummaryUnit}>bpm</Text>
          </View>
        </View>
        <View style={{ marginLeft: -30 }}>
        <LineChart
          data={chartData}
          height={180}
          width={CHART_WIDTH}
          color="#EF4444"
          dataPointsColor="#EF4444"
          dataPointsRadius={2}
          textColor="#64748B"
          textFontSize={10}
          thickness={2}
          areaChart
          startFillColor="rgba(239, 68, 68, 0.2)"
          startOpacity={0.8}
          endFillColor="rgba(239, 68, 68, 0.01)"
          endOpacity={0.1}
          yAxisTextStyle={{ color: "#64748B", fontSize: 10 }}
          xAxisLabelTexts={chartData
            .filter((_, index) => index % Math.max(1, Math.floor(chartData.length / 5)) === 0)
            .map((item) => item.label)}
          xAxisLabelTextStyle={{ color: "#64748B", fontSize: 10 }}
          showReferenceLine1
          referenceLine1Position={avgHR}
          referenceLine1Config={{
            color: "#3B82F6",
            dashWidth: 2,
            dashGap: 3,
            labelText: "Avg",
            labelTextStyle: { color: "#3B82F6", fontSize: 10, fontWeight: "bold" },
          }}
          hideRules
          hideYAxisText={false}
          yAxisOffset={minHR > 50 ? minHR - 10 : 0}
          maxValue={maxHR + 10}
          noOfSections={5}
          yAxisLabelWidth={30} 
        />
        </View>
        <View style={styles.hrZonesContainer}>
          {hrZones.map((zone, index) => (
            <View key={index} style={styles.hrZoneItem}>
              <View style={[styles.hrZoneColor, { backgroundColor: zone.color }]} />
              <Text style={styles.hrZoneName}>{zone.name}</Text>
              <Text style={styles.hrZoneRange}>{zone.range}</Text>
            </View>
          ))}
        </View>
      </View>
    )
  }

  const renderTabs = () => {
    return (
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "stats" && styles.activeTabButton]}
          onPress={() => setActiveTab("stats")}
        >
          <Icon name="stats-chart-outline" size={18} color={activeTab === "stats" ? "#3B82F6" : "#64748B"} />
          <Text style={[styles.tabButtonText, activeTab === "stats" && styles.activeTabButtonText]}>Stats</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "heart" && styles.activeTabButton]}
          onPress={() => setActiveTab("heart")}
        >
          <Icon name="heart-outline" size={18} color={activeTab === "heart" ? "#3B82F6" : "#64748B"} />
          <Text style={[styles.tabButtonText, activeTab === "heart" && styles.activeTabButtonText]}>Heart Rate</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const renderContentLoader = () => (
    <View style={styles.loaderContainer}>
      <ContentLoader
        speed={1.5}
        width={width - 40}
        height={500}
        viewBox={`0 0 ${width - 40} 500`}
        backgroundColor="#f0f0f0"
        foregroundColor="#e0e0e0"
      >
        {/* Map loader */}
        <Rect x="0" y="0" rx="12" ry="12" width={width - 40} height="220" />

        {/* Tabs loader */}
        <Rect x="0" y="235" rx="8" ry="8" width={width - 40} height="45" />

        {/* Main stats loader */}
        <Rect x="0" y="295" rx="12" ry="12" width="30%" height="70" />
        <Rect x="33%" y="295" rx="12" ry="12" width="30%" height="70" />
        <Rect x="67%" y="295" rx="12" ry="12" width="30%" height="70" />

        {/* Detailed stats loader */}
        <Rect x="0" y="380" rx="8" ry="8" width="48%" height="40" />
        <Rect x="52%" y="380" rx="8" ry="8" width="48%" height="40" />
        <Rect x="0" y="430" rx="8" ry="8" width="48%" height="40" />
        <Rect x="52%" y="430" rx="8" ry="8" width="48%" height="40" />
      </ContentLoader>
    </View>
  )

  if (!exerciseSessionRecordId) {
    return <View style={styles.container}></View>
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {loading ? (
        renderContentLoader()
      ) : (
        <>
          <View style={styles.mapSection}>{renderMap()}</View>

          {renderTabs()}

          <View style={styles.contentSection}>{activeTab === "stats" ? renderStats() : renderHeartRateChart()}</View>
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    paddingBottom: 30,
  },
  mapSection: {
    marginBottom: 15,
  },
  mapContainer: {
    position: "relative",
    height: 250,
    borderRadius: 0,
    overflow: "hidden",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapOverlay: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
  },
  mapCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 8,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  mapCardSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  noRouteContainer: {
    height: 250,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  tabsContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  activeTabButton: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
    marginLeft: 6,
  },
  activeTabButtonText: {
    color: "#3B82F6",
  },
  contentSection: {
    marginHorizontal: 20,
  },
  statsContainer: {
    borderRadius: 16,
    overflow: "hidden",
  },
  mainStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  mainStatItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  mainStatContent: {
    alignItems: "center",
  },
  mainStatValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  mainStatUnit: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
  },
  mainStatLabel: {
    fontSize: 12,
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailedStatsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  detailedStatItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  detailedStatIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  detailedStatLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  detailedStatValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: "auto",
  },
  detailedStatUnit: {
    fontSize: 10,
    fontWeight: "400",
    color: "#64748B",
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  timeItem: {
    flex: 1,
    alignItems: "center",
  },
  timeSeparator: {
    width: 1,
    height: 30,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 15,
  },
  timeLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  chartContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
  },
  heartRateSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  hrSummaryItem: {
    alignItems: "center",
    flex: 1,
  },
  hrSummaryItemAvg: {
    borderRadius: 10,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    paddingVertical: 8,
  },
  hrSummaryLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
  },
  hrSummaryValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  hrSummaryValueAvg: {
    color: "#3B82F6",
  },
  hrSummaryUnit: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  hrZonesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  hrZoneItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: 8,
  },
  hrZoneColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  hrZoneName: {
    fontSize: 12,
    color: "#1F2937",
    fontWeight: "500",
    width: 70,
  },
  hrZoneRange: {
    fontSize: 12,
    color: "#64748B",
  },
  noDataContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
  },
  noDataText: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 10,
  },
  loaderContainer: {
    padding: 20,
  },
  markerStart: {
    backgroundColor: "#22C55E",
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  markerEnd: {
    backgroundColor: "#EF4444",
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
})
