import type React from "react"
import { useState, useEffect } from "react"
import { TouchableOpacity, Text, StyleSheet, Alert, View } from "react-native"
import Icon from "@react-native-vector-icons/ionicons"
import RecordSelectionModal, { type ExerciseRecord } from "./RecordSelectionModal"
import { fetchExerciseSessionRecordsbyIdOnly, initializeHealthConnect } from "../../utils/utils_healthconnect"
import { format, parseISO } from "date-fns"

interface RecordSelectionButtonProps {
  onSelectRecord?: (record: ExerciseRecord) => void
  buttonStyle?: object
  textStyle?: object
  iconColor?: string
  selectedRecord?: ExerciseRecord | null
}

const RecordSelectionButton: React.FC<RecordSelectionButtonProps> = ({
  onSelectRecord,
  buttonStyle,
  textStyle,
  iconColor = "#666",
  selectedRecord,
}) => {  
  console.log("selectedRecord", selectedRecord);
  
  const [modalVisible, setModalVisible] = useState(false)
  const [record, setRecord] = useState<ExerciseRecord | null>(selectedRecord || null)
  
  // Thêm useEffect để cập nhật record khi selectedRecord thay đổi
  useEffect(() => {
    if (selectedRecord) {
      setRecord(selectedRecord);
    }
  }, [selectedRecord]);
  
  console.log("record", record);
  
  const fetchRecords = async (): Promise<ExerciseRecord[]> => {
    try {
      const isInitialized = await initializeHealthConnect()
      if (!isInitialized) {
        throw new Error("Health Connect initialization failed")
      }
  
      const startDate = new Date("2025-01-01T00:00:00.000Z").toISOString()
      const endDate = new Date().toISOString()
      const data = await fetchExerciseSessionRecordsbyIdOnly(startDate, endDate);
  
      // Map ExerciseSession objects to ExerciseRecord objects
      const records: ExerciseRecord[] = data.map(session => ({
        id: session.id,
        clientRecordId: session.clientRecordId,
        exerciseType: getNameFromExerciseType(session.exerciseType.toString()), // Convert exerciseType to string
        startTime: session.startTime,
        endTime: session.endTime,
        duration_minutes: session.durationMinutes,
        total_distance: session.totalDistance,
        total_steps: session.totalSteps,
      }));
      console.log("Fetched exercise records:", records);
      
      return records;
    } catch (error) {
      console.error("Error fetching exercise records:", error)
      Alert.alert("Error", "Failed to load exercise records. Please check Health Connect permissions.")
      return []
    }
  }

  const handleSelectRecord = (record: ExerciseRecord) => {
    setRecord(record)
    if (onSelectRecord) {
      onSelectRecord(record)
    }
    setModalVisible(false)
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

  // Thêm hàm xử lý lỗi khi hiển thị thông tin record
  const renderRecordInfo = () => {
    if (!record) {
      return <Text style={[styles.runRecordText, textStyle]}>Select run record</Text>;
    }
    
    try {
      const exerciseTypeName = getNameFromExerciseType(record.exerciseType);
      const formattedDate = format(parseISO(record.startTime), "MMM d, yyyy");
      
      return (
        <View style={styles.selectedRecordContainer}>
          <Text style={[styles.runRecordText, textStyle]}>
            {exerciseTypeName} • {formattedDate}
          </Text>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => {
              setRecord(null)
              if (onSelectRecord) {
                onSelectRecord(null as any)
              }
            }}
          >
            <Icon name="close-circle" size={18} color="#666" />
          </TouchableOpacity>
        </View>
      );
    } catch (error) {
      console.error("Error rendering record info:", error, record);
      return <Text style={[styles.runRecordText, textStyle]}>Invalid record data</Text>;
    }
  };

  return (
    <>
      <TouchableOpacity style={[styles.runRecordButton, buttonStyle]} onPress={() => setModalVisible(true)}>
        <Icon name="fitness-outline" size={20} color={iconColor} />
        {renderRecordInfo()}
        <Icon name="chevron-forward" size={20} color="#999" style={styles.chevronIcon} />
      </TouchableOpacity>

      <RecordSelectionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelectRecord={handleSelectRecord}
        fetchRecords={fetchRecords}
      />
    </>
  )
}

const styles = StyleSheet.create({
  runRecordButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  runRecordText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#666",
  },
  chevronIcon: {
    marginLeft: 8,
  },
  selectedRecordContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  removeButton: {
    padding: 4,
  },
})

export default RecordSelectionButton
