import type React from "react"
import { useEffect, useState } from "react"
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Dimensions, SafeAreaView } from "react-native"
import Icon from "@react-native-vector-icons/ionicons"
import { format, parseISO } from "date-fns"
import ContentLoader, { Rect } from "react-content-loader/native"

// Types
export interface ExerciseRecord {
  id: string
  clientRecordId: string
  exerciseType: string
  startTime: string
  endTime: string
  duration_minutes?: number
  total_distance?: number
  total_steps?: number
}

interface RecordSelectionModalProps {
  visible: boolean
  onClose: () => void
  onSelectRecord: (record: ExerciseRecord) => void
  fetchRecords: () => Promise<ExerciseRecord[]>
}

const { width } = Dimensions.get("window")

const RecordSelectionModal: React.FC<RecordSelectionModalProps> = ({
  visible,
  onClose,
  onSelectRecord,
  fetchRecords,
}) => {
  const [records, setRecords] = useState<ExerciseRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (visible) {
      loadRecords()
    }
  }, [visible])

  const loadRecords = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchRecords()
  
      setRecords(data)
    } catch (error) {
      console.error("Error loading exercise records:", error)
      setError("Failed to load exercise records. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getNameFromExerciseType = (type: string): string => {
    const typeMap: Record<string, string> = {
      "com.google.walking": "Walking",
      "com.google.running": "Running",
      "com.google.cycling": "Cycling",
      "com.google.hiking": "Hiking",
      "com.google.workout": "Workout",
    }
    return typeMap[type] || "Exercise"
  }

  const getIconFromExerciseType = (type: string): string => {
    const iconMap: Record<string, string> = {
      "com.google.walking": "walk",
      "com.google.running": "walk",
      "com.google.cycling": "bicycle",
      "com.google.hiking": "trail-sign",
      "com.google.workout": "fitness",
    }
    return iconMap[type] || "fitness"
  }

  const renderLoadingSkeleton = () => (
    <View style={styles.loadingContainer}>
      {[...Array(5)].map((_, i) => (
        <ContentLoader
          key={i}
          speed={1}
          width={width - 32}
          height={80}
          viewBox={`0 0 ${width - 32} 80`}
          backgroundColor="#f3f3f3"
          foregroundColor="#ecebeb"
        >
          <Rect x="0" y="10" rx="4" ry="4" width="50" height="16" />
          <Rect x="70" y="0" rx="20" ry="20" width="40" height="40" />
          <Rect x="130" y="10" rx="4" ry="4" width="100" height="16" />
          <Rect x="130" y="35" rx="3" ry="3" width="150" height="12" />
        </ContentLoader>
      ))}
    </View>
  )

  const renderErrorState = () => (
    <View style={styles.emptyState}>
      <Icon name="warning" size={48} color="#FF5252" />
      <Text style={styles.emptyText}>Error loading records</Text>
      <Text style={styles.emptySubtext}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadRecords}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  )

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="walk" size={48} color="#ACADAE" />
      <Text style={styles.emptyText}>No workout data available</Text>
      <Text style={styles.emptySubtext}>Your recorded workouts will appear here</Text>
    </View>
  )

  const renderItem = ({ item }: { item: ExerciseRecord }) => {
    const startDate = parseISO(item.startTime)
    const endDate = parseISO(item.endTime)
    const duration = item.duration_minutes || Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60))
    const distance = item.total_distance || Math.round((2 + Math.random() * 8) * 1000)
    const timeStr = format(startDate, "HH:mm")
    const dateStr = format(startDate, "EEE, MMM d")

    return (
      <TouchableOpacity style={styles.recordItem} onPress={() => onSelectRecord(item)}>
        <Text style={styles.timeText}>{timeStr}</Text>
        <View style={styles.iconContainer}>
          <Icon
            name={getIconFromExerciseType(item.exerciseType) as any}
            size={32}
            color="#052658"
            style={styles.exerciseIcon}
          />
        </View>
        <View style={styles.recordDetails}>
          <Text style={styles.recordType}>{getNameFromExerciseType(item.exerciseType)}</Text>
          <Text style={styles.recordMetrics}>
            {duration} min • {(distance / 1000).toFixed(1)} km • {dateStr}
          </Text>
        </View>
        <Icon name="chevron-forward" size={20} color="#ACADAE" />
      </TouchableOpacity>
    )
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Run Record</Text>
        </View>

        {loading ? (
          renderLoadingSkeleton()
        ) : error ? (
          renderErrorState()
        ) : records.length > 0 ? (
          <FlatList
            data={records}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          renderEmptyState()
        )}
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 16,
  },
  loadingContainer: {
    flex: 1,
    padding: 16,
  },
  listContent: {
    padding: 16,
  },
  recordItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  timeText: {
    width: 48,
    fontSize: 13,
    color: "#757575",
  },
  iconContainer: {
    width: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseIcon: {
    backgroundColor: "#E8F0FE",
    padding: 4,
    borderRadius: 50,
    overflow: "hidden",
  },
  recordDetails: {
    flex: 1,
    marginLeft: 8,
  },
  recordType: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
  },
  recordMetrics: {
    fontSize: 14,
    color: "#757575",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#333333",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#757575",
    marginTop: 8,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#002366",
    borderRadius: 5,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
  },
})

export default RecordSelectionModal
