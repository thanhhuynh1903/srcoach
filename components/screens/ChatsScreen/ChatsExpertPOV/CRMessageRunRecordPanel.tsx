import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Platform,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {theme} from '../../../contants/theme';
import {fetchExerciseSessionRecords} from '../../../utils/utils_healthconnect';
import {sendExerciseRecord} from '../../../utils/useChatsAPI';
import ToastUtil from '../../../utils/utils_toast';

interface CRMessageRunRecordPanelProps {
  visible: boolean;
  sessionId: string;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

type ExerciseSession = {
  id: string;
  exerciseType: string;
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
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      loadSessions();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setSelectedSession(null);
    }
  }, [visible, slideAnim]);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - 5, 1);

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

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
          name="walk"
          size={20}
          color={
            selectedSession === item.id
              ? theme.colors.primary
              : theme.colors.primaryDark
          }
        />
        <Text style={styles.sessionDate}>{formatDate(item.startTime)}</Text>
      </View>
      <View style={styles.sessionDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Distance</Text>
          <Text style={styles.detailValue}>
            {item.total_distance ? `${item.total_distance} km` : 'N/A'}
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

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[styles.panelContainer, {transform: [{translateY}]}]}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Select Run Record</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={theme.colors.primaryDark} />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : sessions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="sad" size={40} color="#8E8E93" />
              <Text style={styles.emptyText}>No run records found</Text>
              <Text style={styles.emptySubtext}>
                Your recent runs will appear here
              </Text>
            </View>
          ) : (
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
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  panelContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    maxHeight: '80%',
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primaryDark,
  },
  loadingContainer: {
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingBottom: 16,
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
  },
  sessionDate: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 8,
  },
  sessionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    alignItems: 'center',
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
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
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
