import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import CommonPanel from '../../../../commons/CommonPanel';
import { theme } from '../../../../contants/theme';
import {fetchExerciseSessionRecords} from '../../../../utils/utils_healthconnect';
import {
  getNameFromExerciseType,
  getIconFromExerciseType,
} from '../../../../contants/exerciseType';
import {formatTimestampAgo} from '../../../../utils/utils_format';
import { sendExerciseRecordMessage } from '../../../../utils/useChatsAPI';

interface ExerciseSession {
  id: string;
  exerciseType: number;
  dataOrigin: string;
  startTime: string;
  endTime: string;
  total_distance?: number;
  duration_minutes?: number;
  total_steps?: number;
}

interface ChatsPanelSendExerciseRecordProps {
  visible: boolean;
  onClose: () => void;
  sessionId: string;
  onSendSuccess: () => void;
}

const ChatsPanelSendExerciseRecord: React.FC<ChatsPanelSendExerciseRecordProps> = ({
  visible,
  onClose,
  sessionId,
  onSendSuccess,
}) => {
  const [records, setRecords] = useState<ExerciseSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const loadRecords = async () => {
      setLoading(true);
      const endTime = new Date().toISOString();
      const startTime = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const data = await fetchExerciseSessionRecords(startTime, endTime);
      setRecords(data);
      setLoading(false);
    };

    if (visible) loadRecords();
  }, [visible]);

  const handleSend = async () => {
    if (!selectedId) return;
    
    try {
      const response = await sendExerciseRecordMessage(sessionId, selectedId);
      if (response.status) {
        onSendSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error sending exercise record:', error);
    }
  };

  const renderItem = ({item}: {item: ExerciseSession}) => {
    const isSelected = selectedId === item.id;
    const textStyle = isSelected ? styles.selectedText : styles.normalText;
    
    return (
      <TouchableOpacity
        style={[
          styles.item,
          isSelected && styles.selectedItem,
        ]}
        onPress={() => setSelectedId(item.id)}>
        <View style={styles.itemHeader}>
          <Icon
            name={getIconFromExerciseType(item.exerciseType)}
            size={24}
            color={isSelected ? theme.colors.white : theme.colors.primaryDark}
          />
          <Text style={[styles.itemTitle, textStyle]}>
            {getNameFromExerciseType(item.exerciseType)}
          </Text>
          <Text style={[styles.itemTime, textStyle]}>
            {formatTimestampAgo(item.startTime)}
          </Text>
        </View>
        <View style={styles.itemDetails}>
          {item.duration_minutes && (
            <View style={styles.detailItem}>
              <Icon 
                name="time-outline" 
                size={16} 
                color={isSelected ? theme.colors.white : '#353535'} 
                style={styles.detailIcon}
              />
              <Text style={textStyle}>
                {Math.floor(item.duration_minutes)} min
              </Text>
            </View>
          )}
          {item.total_distance && (
            <View style={styles.detailItem}>
              <Icon 
                name="map-outline" 
                size={16} 
                color={isSelected ? theme.colors.white : '#353535'} 
                style={styles.detailIcon}
              />
              <Text style={textStyle}>
                {(item.total_distance / 1000).toFixed(1)} km
              </Text>
            </View>
          )}
          {item.total_steps && (
            <View style={styles.detailItem}>
              <Icon 
                name="walk-outline" 
                size={16} 
                color={isSelected ? theme.colors.white : '#353535'} 
                style={styles.detailIcon}
              />
              <Text style={textStyle}>{item.total_steps} steps</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <CommonPanel
      visible={visible}
      onClose={onClose}
      title="Select Exercise Record"
      content={
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.primaryDark} />
          ) : (
            <FlatList
              data={records}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
            />
          )}
          <TouchableOpacity
            style={[
              styles.sendButton,
              !selectedId && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!selectedId}>
            <Text style={styles.sendButtonText}>Send Selected Record</Text>
          </TouchableOpacity>
        </View>
      }
      direction="bottom"
      height="70%"
      borderRadius={16}
      backdropOpacity={0.5}
    />
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingBottom: 16,
  },
  listContent: {
    paddingBottom: 16,
  paddingHorizontal: 8,
  paddingTop: 8,
  },
  item: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#b1b1b1',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedItem: {
    backgroundColor: theme.colors.primaryDark,
    borderBottomWidth: 0,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  itemTime: {
    fontSize: 12,
  opacity: 0.8,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    marginRight: 4,
  },
  normalText: {
    color: '#353535',
  },
  selectedText: {
    color: theme.colors.white,
  },
  sendButton: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.primaryDark,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ChatsPanelSendExerciseRecord;