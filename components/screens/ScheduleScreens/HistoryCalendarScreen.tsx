// HistoryCalendarScreen.tsx
"use client"

import { useState, useEffect, useMemo } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native"
import Icon from "@react-native-vector-icons/ionicons"
import { useNavigation } from "@react-navigation/native"
import BackButton from "../../BackButton"
import useScheduleStore from "../../utils/useScheduleStore"
import EnhancedHistoryCard from "./EnhancedHistoryCard"
import { theme } from "../../contants/theme"

const FILTERS = [
  { label: "All", value: "ALL" },
  { label: "Expert", value: "EXPERT" },
  { label: "Self", value: "SELF" },
  { label: "This Month", value: "THIS_MONTH" },
  { label: "Last Month", value: "LAST_MONTH" },
  { label: "This Year", value: "THIS_YEAR" },
]

const HistoryCalendarScreen = () => {
  const [activeFilter, setActiveFilter] = useState("ALL")
  const [showStats, setShowStats] = useState(true)
  const [showFilters, setShowFilters] = useState(true)
  const navigation = useNavigation()
  const { historySchedule, isLoading, error, fetchHistorySchedule, fetchHistoryScheduleExpert } = useScheduleStore()

  useEffect(() => {
    const loadData = async () => {
      await fetchHistorySchedule()
      await fetchHistoryScheduleExpert()
    }
    loadData();
  }, [])

  const filteredSchedules = useMemo(() => {
    if (!historySchedule) return []

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    return historySchedule.filter((schedule) => {
      const createdAt = new Date(schedule.created_at)

      // Time filters
      if (activeFilter === "THIS_MONTH") {
        return createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear
      }
      if (activeFilter === "LAST_MONTH") {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
        return createdAt.getMonth() === lastMonth && createdAt.getFullYear() === lastMonthYear
      }
      if (activeFilter === "THIS_YEAR") {
        return createdAt.getFullYear() === currentYear
      }

      // Type filters
      if (activeFilter === "EXPERT") {
        return schedule.schedule_type === "EXPERT"
      }
      if (activeFilter === "SELF") {
        return schedule.schedule_type === "USER"
      }

      // Default: ALL
      return true
    })
  }, [historySchedule, activeFilter])

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading History...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchHistorySchedule}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <BackButton size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedules - History</Text>

        <View style={styles.headerControls}>
          <TouchableOpacity style={styles.headerControlButton} onPress={() => setShowStats((s) => !s)}>
            <Icon name={showStats ? "eye-off-outline" : "eye-outline"} size={20} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerControlButton} onPress={() => setShowFilters((f) => !f)}>
            <Icon name={showFilters ? "options-outline" : "options"} size={20} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Card */}
      {showStats && (
        <View style={styles.statsCard}>
          <View style={styles.statsContent}>
            <Text style={styles.statsLabel}>Total Completed</Text>
            <View style={styles.statsValueContainer}>
              <Text style={styles.statsValue}>{historySchedule.length}</Text>
              <Text style={styles.statsUnit}>Programs</Text>
            </View>
          </View>
          <View style={styles.statsIconContainer}>
            <Icon name="trophy-outline" size={32} color="#FFFFFF" />
          </View>
        </View>
      )}

      {/* Filter Tabs */}
      {showFilters && (
        <View style={styles.filtersWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
            {FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter.value}
                style={[styles.filterTab, activeFilter === filter.value && styles.activeFilterTab]}
                onPress={() => setActiveFilter(filter.value)}
              >
                <Text style={[styles.filterText, activeFilter === filter.value && styles.activeFilterText]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {filteredSchedules.length > 0 ? (
          filteredSchedules.map((schedule) => (
            <EnhancedHistoryCard
              key={schedule.id}
              id={schedule.id}
              title={schedule.title}
              description={schedule.description}
              startDate={new Date(schedule.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              endDate={
                schedule.updated_at
                  ? new Date(schedule.updated_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                  : "Present"
              }
              status={schedule.status}
              isExpertChoice={schedule?.schedule_type === "EXPERT"}
              userName={schedule.user?.name}
              ScheduleDay={schedule.ScheduleDay}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="calendar-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>No training history found</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={fetchHistorySchedule}>
              <Text style={styles.emptyButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
    flex: 1,
  },
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerControlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  statsCard: {
    backgroundColor: "linear-gradient(135deg, #0F2B5B 0%, #1E40AF 100%)",
    margin: 16,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#0F2B5B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: "#0F2B5B",
  },
  statsContent: {
    flex: 1,
  },
  statsLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 4,
  },
  statsValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  statsValue: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "700",
    marginRight: 8,
  },
  statsUnit: {
    color: "#FFFFFF",
    fontSize: 16,
    opacity: 0.9,
  },
  statsIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  filtersWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  filtersContainer: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: "row",
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  activeFilterTab: {
    backgroundColor: "#1E3A8A",
    shadowColor: "#1E3A8A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  filterText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  activeFilterText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748B",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: "#0F172A",
    textAlign: "center",
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 400,
  },
  emptyText: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 16,
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emptyButtonText: {
    color: "#0F172A",
    fontWeight: "500",
  },
})

export default HistoryCalendarScreen
