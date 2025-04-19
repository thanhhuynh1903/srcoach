import type React from 'react';
import {useState, useEffect} from 'react';
import {TouchableOpacity, Text, StyleSheet, Alert, View} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import RecordSelectionModal, {
  type ExerciseRecord,
} from './RecordSelectionModal';
import {fetchExerciseSessionRecords} from '../../utils/utils_healthconnect';
import {format, parseISO} from 'date-fns';
import {
  getIconFromExerciseType,
  getNameFromExerciseType,
} from '../../contants/exerciseType';
import ToastUtil from '../../utils/utils_toast';
interface RecordSelectionButtonProps {
  onSelectRecord?: (record: ExerciseRecord) => void;
  buttonStyle?: object;
  textStyle?: object;
  iconColor?: string;
  selectedRecord?: ExerciseRecord | null;
}

const RecordSelectionButton: React.FC<RecordSelectionButtonProps> = ({
  onSelectRecord,
  buttonStyle,
  textStyle,
  iconColor = '#666',
  selectedRecord,
}) => {
  console.log('selectedRecord', selectedRecord);

  const [modalVisible, setModalVisible] = useState(false);
  const [record, setRecord] = useState<ExerciseRecord | null>(
    selectedRecord || null,
  );

  useEffect(() => {
    if (selectedRecord) {
      setRecord(selectedRecord);
    }
  }, [selectedRecord]);

  const fetchRecords = async (): Promise<ExerciseRecord[]> => {
    try {
      const data = await fetchExerciseSessionRecords(null, null);

      const records: ExerciseRecord[] = data.map(session => ({
        id: session.id,
        exerciseType: session.exerciseType,
        startTime: session.startTime,
        endTime: session.endTime,
        duration_minutes: session.duration_minutes,
        total_distance: session.total_distance,
        total_steps: session.total_steps,
      }));

      return records;
    } catch (error) {
      ToastUtil.error('Failed to fetch records', 'An error occurred');
      return [];
    }
  };

  const handleSelectRecord = (record: ExerciseRecord) => {
    setRecord(record);
    if (onSelectRecord) {
      onSelectRecord(record);
    }
    setModalVisible(false);
  };

  const renderRecordInfo = () => {
    if (!record) {
      return (
        <Text style={[styles.runRecordText, textStyle]}>Select run record</Text>
      );
    }

    try {
      const formattedDate = format(parseISO(record.startTime), 'MMM d, yyyy');

      return (
        <View style={styles.selectedRecordContainer}>
          <Text style={[styles.runRecordText, textStyle]}>
            {getNameFromExerciseType(record?.exerciseType)} • {formattedDate}
          </Text>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => {
              setRecord(null);
              if (onSelectRecord) {
                onSelectRecord(null as any);
              }
            }}>
            <Icon name="close-circle" size={18} color="#666" />
          </TouchableOpacity>
        </View>
      );
    } catch (error) {
      console.error('Error rendering record info:', error, record);
      return (
        <Text style={[styles.runRecordText, textStyle]}>
          Invalid record data
        </Text>
      );
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.runRecordButton, buttonStyle]}
        onPress={() => setModalVisible(true)}>
        <Icon
          name={getIconFromExerciseType(record?.exerciseType as never)}
          size={20}
          color={iconColor}
        />
        {renderRecordInfo()}
        <Icon
          name="chevron-forward"
          size={20}
          color="#999"
          style={styles.chevronIcon}
        />
      </TouchableOpacity>

      <RecordSelectionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelectRecord={handleSelectRecord}
        fetchRecords={fetchRecords}
      />
    </>
  );
};

const styles = StyleSheet.create({
  runRecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  runRecordText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  chevronIcon: {
    marginLeft: 8,
  },
  selectedRecordContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  removeButton: {
    padding: 4,
  },
});

export default RecordSelectionButton;
