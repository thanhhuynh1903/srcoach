"use client"

import { useEffect } from "react"
import { Text, View, StyleSheet, Animated, Easing } from "react-native"
import Icon from "@react-native-vector-icons/ionicons"

interface Workout {
  time: string
  name: string
  steps: number
  distance: number
  calories: number
  status: string
  minbpm?: number
  maxbpm?: number
}

interface WorkoutComparisonProps {
  workouts: Workout[]
}

const WorkoutComparison = ({ workouts }: WorkoutComparisonProps) => {
  // Animation values
  const stepsAnim = new Animated.Value(0)
  const distanceAnim = new Animated.Value(0)
  const caloriesAnim = new Animated.Value(0)
   
  // Calculate max values
  const maxValues = {
    steps: Math.max(...workouts.map((w) => w.steps)),
    distance: Math.max(...workouts.map((w) => w.distance)),
    calories: Math.max(...workouts.map((w) => w.calories)),
  }

  // Get the most recent workout
  const latestWorkout = workouts.length > 0 ? workouts[0] : null

  // Get previous workout for comparison if available
  const previousWorkout = workouts.length > 1 ? workouts[1] : null

  // Calculate percentage
  const calculatePercentage = (value: number, max: number) => (max === 0 ? 0 : (value / max) * 100)

  // Calculate trend (positive if current value is higher than previous)
  const calculateTrend = (current: number, previous?: number) => {
    if (!previous) return "neutral"
    return current > previous ? "positive" : current < previous ? "negative" : "neutral"
  }

  // Start animations when component mounts
  useEffect(() => {
    if (latestWorkout) {
      Animated.parallel([
        Animated.timing(stepsAnim, {
          toValue: calculatePercentage(latestWorkout.steps, maxValues.steps),
          duration: 1000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(distanceAnim, {
          toValue: calculatePercentage(latestWorkout.distance, maxValues.distance),
          duration: 1000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(caloriesAnim, {
          toValue: calculatePercentage(latestWorkout.calories, maxValues.calories),
          duration: 1000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
      ]).start()
    }
  }, [latestWorkout])

  if (!latestWorkout) return null

  // Get trend indicators
  const stepsTrend = calculateTrend(latestWorkout.steps, previousWorkout?.steps)
  const distanceTrend = calculateTrend(latestWorkout.distance, previousWorkout?.distance)
  const caloriesTrend = calculateTrend(latestWorkout.calories, previousWorkout?.calories)

  // Render trend icon
  const renderTrendIcon = (trend: string) => {
    if (trend === "positive") {
      return <Icon name="arrow-up" size={16} color="#22C55E" style={styles.trendIcon} />
    } else if (trend === "negative") {
      return <Icon name="arrow-down" size={16} color="#EF4444" style={styles.trendIcon} />
    }
    return null
  }

  return (
    <View style={styles.comparisonContainer}>
      <View style={styles.titleContainer}>
        <Icon name="stats-chart" size={18} color="#4285F4" style={styles.titleIcon} />
        <Text style={styles.comparisonTitle}>Workout Comparison</Text>
      </View>

      <View style={styles.workoutComparisonItem}>
        <Text style={styles.workoutName}>{latestWorkout.name}</Text>

        {/* Steps Comparison */}
        <View style={styles.metricRow}>
          <View style={styles.metricLabelContainer}>
            <Icon name="footsteps-outline" size={18} color="#4285F4" style={styles.metricIcon} />
            <Text style={styles.metricLabel}>Steps</Text>
            {renderTrendIcon(stepsTrend)}
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: stepsAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ["0%", "100%"],
                    }),
                    backgroundColor: "#4285F4",
                  },
                ]}
              />
            </View>
            <Text style={styles.metricValue}>{latestWorkout.steps.toLocaleString()}</Text>
          </View>
        </View>

        {/* Distance Comparison */}
        <View style={styles.metricRow}>
          <View style={styles.metricLabelContainer}>
            <Icon name="map-outline" size={18} color="#10B981" style={styles.metricIcon} />
            <Text style={styles.metricLabel}>Distance</Text>
            {renderTrendIcon(distanceTrend)}
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: distanceAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ["0%", "100%"],
                    }),
                    backgroundColor: "#10B981",
                  },
                ]}
              />
            </View>
            <Text style={styles.metricValue}>{latestWorkout.distance} km</Text>
          </View>
        </View>

        {/* Calories Comparison */}
        <View style={styles.metricRow}>
          <View style={styles.metricLabelContainer}>
            <Icon name="flame-outline" size={18} color="#EF4444" style={styles.metricIcon} />
            <Text style={styles.metricLabel}>Calories</Text>
            {renderTrendIcon(caloriesTrend)}
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: caloriesAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ["0%", "100%"],
                    }),
                    backgroundColor: "#EF4444",
                  },
                ]}
              />
            </View>
            <Text style={styles.metricValue}>{latestWorkout.calories}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  comparisonContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  titleIcon: {
    marginRight: 8,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  workoutComparisonItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 20,
  },
  metricRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  metricLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: 110,
  },
  metricIcon: {
    marginRight: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  trendIcon: {
    marginLeft: 4,
  },
  progressBarContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: "#F1F5F9",
    borderRadius: 6,
    marginRight: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
  metricValue: {
    width: 65,
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
    textAlign: "right",
  },
})

export default WorkoutComparison
