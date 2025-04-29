import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {theme} from '../../../contants/theme';
import {fetchExerciseSessionRecords} from '../../../utils/utils_healthconnect';
import {sendExerciseRecord} from '../../../utils/useChatsAPI';
import ToastUtil from '../../../utils/utils_toast';
import CommonPanel from '../../../commons/CommonPanel';
import { formatTimestampAgo } from '../../../utils/utils_format';
import { ExerciseType, getIconFromExerciseType, getNameFromExerciseType } from '../../../contants/exerciseType';

interface CRMessageRunRecordPanelProps {
  visible: boolean;
  sessionId: string;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

type ExerciseSession = {
  id: string;
  exerciseType: number;
  clientRecordId: string;
  dataOrigin: string;
  startTime: string;
  endTime: string;
  total_distance?: number;
  duration_minutes?: number;
  total_steps?: number;
  routes: any[];
};

export const CRMessageRunRecordPanel: React.FC<
  CRMessageRunRecordPanelProps
> = ({visible, sessionId, onClose, onSubmitSuccess}) => {
  const [sessions, setSessions] = useState<ExerciseSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      loadSessions();
    } else {
      setSelectedSession(null);
    }
  }, [visible]);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const records = await fetchExerciseSessionRecords();
      setSessions(records);
    } catch (error) {
      ToastUtil.error('Failed to load sessions', 'Please try again later');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSession) return;

    setIsSubmitting(true);
    try {
      const response = await sendExerciseRecord(sessionId, selectedSession);
      if (response.status) {
        ToastUtil.success('Run record submitted successfully');
        onSubmitSuccess();
        onClose();
      } else {
        ToastUtil.error('Failed to submit record', response.message);
      }
    } catch (error) {
      ToastUtil.error('Failed to submit record', 'An exception occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs > 0 ? `${hrs}h ` : ''}${mins}m`;
  };

  const renderItem = ({item}: {item: ExerciseSession}) => (
    <TouchableOpacity
      style={[
        styles.sessionItem,
        selectedSession === item.id && styles.sessionItemSelected,
      ]}
      onPress={() => setSelectedSession(item.id)}>
      <View style={styles.sessionHeader}>
        <Icon
          name={getIconFromExerciseType(item.exerciseType)}
          size={20}
          color={
            selectedSession === item.id
              ? theme.colors.primary
              : theme.colors.primaryDark
          }
        />
        <Text style={styles.sessionExerciseName}>
          {getNameFromExerciseType(item?.exerciseType)}
        </Text>
        <Text style={styles.sessionDate}>at {formatTimestampAgo(item.startTime)}</Text>
      </View>
      <View style={styles.sessionDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Distance</Text>
          <Text style={styles.detailValue}>
            {item.total_distance ? `${(item.total_distance / 1000).toFixed(2)} km` : 'N/A'}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Duration</Text>
          <Text style={styles.detailValue}>
            {formatDuration(item.duration_minutes)}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Steps</Text>
          <Text style={styles.detailValue}>{item.total_steps || 'N/A'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    if (sessions.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="sad" size={40} color="#8E8E93" />
          <Text style={styles.emptyText}>No run records found</Text>
          <Text style={styles.emptySubtext}>
            Your recent runs will appear here
          </Text>
        </View>
      );
    }

    return (
      <>
        <FlatList
          data={sessions}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
        <TouchableOpacity
          style={[
            styles.submitButton,
            !selectedSession && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!selectedSession || isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Run Record</Text>
          )}
        </TouchableOpacity>
      </>
    );
  };

  return (
    <CommonPanel
      visible={visible}
      onClose={onClose}
      title="Select Run Record"
      content={renderContent()}
      direction="bottom"
      height="80%"
      closeOnBackdropPress={true}
      swipeToClose={true}
      contentStyle={styles.panelContent}
      titleStyle={styles.panelTitle}
    />
  );
};

const styles = StyleSheet.create({
  panelContent: {
    padding: 0,
    flex: 1,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  loadingContainer: {
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  emptyContainer: {
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  listContainer: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  sessionItem: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sessionItemSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#E8F4FD',
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  sessionExerciseName: {
    fontSize: 14,
    color: theme.colors.primaryDark,
    fontWeight: 'bold',
    marginLeft: 8,
    marginRight: 4,
  },
  sessionDate: {
    fontSize: 14,
    color: '#757575',
  },
  sessionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  detailLabel: {
    fontSize: 12,
    color: '#757575',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 16,
    color: '#212121',
    marginTop: 4,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    margin: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});