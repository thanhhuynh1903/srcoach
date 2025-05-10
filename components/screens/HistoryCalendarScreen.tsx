"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from "react-native"
import Icon from "@react-native-vector-icons/ionicons"
import BackButton from "../BackButton"

interface HistoryCardProps {
    title: string;
    description: string;
    startDate: string;
    metrics: any[];
    days: number[];
    missedDays?: number[];
    status: string;
    statusType: string;
    isExpertChoice: boolean;
  }

const HistoryScheduleScreen = () => {
  const [activeFilter, setActiveFilter] = useState("All Time")

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <BackButton size={24}/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedules - History</Text>
      </View>

      {/* Stats Card */}
      <View style={styles.statsCard}>
        <Text style={styles.statsLabel}>Total Completed</Text>
        <View style={styles.statsValueContainer}>
          <Text style={styles.statsValue}>12</Text>
          <Text style={styles.statsUnit}>Programs</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {["All Time", "This Month", "Last Month", "This Year"].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterTab, activeFilter === filter && styles.activeFilterTab]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>{filter}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Schedule History Cards */}
      <ScrollView style={styles.scrollView}>
        <HistoryCard
          title="Spring Fitness Challenge"
          description="30-day comprehensive workout plan designed by fitness experts"
          startDate="Mar 15, 2024"
          metrics={[
            { icon: "walk", value: "5km" },
            { icon: "flame", value: "500kcal" },
            { icon: "footsteps", value: "10,000" },
            { icon: "time", value: "14:00pm" },
          ]}
          days={[15, 16, 17, 18, 19, 20, 21]}
          status="Completed"
          statusType="success"
          isExpertChoice={true}
        />

        <HistoryCard
          title="Spring Fitness Challenge"
          description="30-day comprehensive workout plan designed by fitness experts"
          startDate="Mar 15, 2024"
          metrics={[
            { icon: "walk", value: "5km" },
            { icon: "flame", value: "500kcal" },
            { icon: "footsteps", value: "10,000" },
            { icon: "time", value: "14:00pm" },
          ]}
          days={[15, 16, 17, 18, 19, 20, 21]}
          missedDays={[16]}
          status="Missed dates"
          statusType="warning"
          isExpertChoice={true}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const HistoryCard = ({
  title,
  description,
  startDate,
  metrics,
  days,
  missedDays = [],
  status,
  statusType,
  isExpertChoice,
} : HistoryCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.startedText}>Started {startDate}</Text>
        <View style={{flexDirection: "row", alignItems: "center",gap : 8}}>
        {isExpertChoice && <Text style={styles.expertChoiceText}>Expert's Choice</Text>}
  
        {isExpertChoice && <Text style={styles.expertChoiceText}>Anonymous</Text>}
        </View>
      </View>

      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>

      {/* Metrics */}
      <View style={styles.metricsContainer}>
        {metrics.map((metric, index) => (
          <View key={index} style={styles.metricItem}>
            <View style={styles.metricIconContainer}>
              {metric.icon === "walk" && <Icon name="walk-outline" size={28} color="#1E40AF" />}
              {metric.icon === "flame" && <Icon name="flame-outline" size={28} color="#1E40AF" />}
              {metric.icon === "footsteps" && <Icon name="footsteps-outline" size={28} color="#1E40AF" />}
              {metric.icon === "time" && <Icon name="time-outline" size={28} color="#1E40AF" />}
            </View>
            <Text style={styles.metricValue}>{metric.value}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Days */}
      <View style={styles.daysContainer}>
        {days.map((day) => (
          <View key={day} style={[styles.dayCircle, missedDays.includes(day) && styles.missedDayCircle]}>
            <Text style={[styles.dayText, missedDays.includes(day) && styles.missedDayText]}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Status */}
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusIconContainer,
            statusType === "success" && styles.successIconContainer,
            statusType === "warning" && styles.warningIconContainer,
          ]}
        >
          {statusType === "success" && <Icon name="checkmark" size={16} color="#FFFFFF" />}
          {statusType === "warning" && <Icon name="alert" size={16} color="#FFFFFF" />}
        </View>
        <Text style={styles.statusLabel}>Status: </Text>
        <Text
          style={[
            styles.statusText,
            statusType === "success" && styles.successText,
            statusType === "warning" && styles.warningText,
          ]}
        >
          {status}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
  },
  statsCard: {
    backgroundColor: "#0F2B5B",
    margin: 16,
    borderRadius: 16,
    padding: 16,
  },
  statsLabel: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  statsValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  statsValue: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
    marginRight: 8,
  },
  statsUnit: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  activeFilterTab: {
    backgroundColor: "#1E3A8A",
  },
  filterText: {
    fontSize: 14,
    color: "#64748B",
  },
  activeFilterText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  startedText: {
    fontSize: 12,
    color: "#64748B",
  },
  expertChoiceText: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor:"#F4F0FF",
    fontSize: 12,
    color: '#052658',
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    color: "#0F172A",
  },
  cardDescription: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 16,
  },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  metricItem: {
    alignItems: "center",
  },
  metricIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: '#F4F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 12,
    color: "#64748B",
  },
  daysContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  dayCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F2B5B",
  },
  missedDayCircle: {
    backgroundColor: "#EF4444",
  },
  dayText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  missedDayText: {
    color: "#FFFFFF",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  successIconContainer: {
    backgroundColor: "#10B981",
  },
  warningIconContainer: {
    backgroundColor: "#F59E0B",
  },
  statusLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  successText: {
    color: "#10B981",
  },
  warningText: {
    color: "#F59E0B",
  },
})

export default HistoryScheduleScreen

