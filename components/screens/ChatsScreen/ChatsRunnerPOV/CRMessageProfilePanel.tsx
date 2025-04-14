import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Platform,
  TextInput,
  ScrollView,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {theme} from '../../../contants/theme';
import ToastUtil from '../../../utils/utils_toast';

interface CRMessageProfilePanelProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (profileData: {
    height: string;
    weight: string;
    running_level: string;
    running_goal: string;
  }) => void;
}

const runningLevels = ['Beginner', 'Intermediate', 'Advanced', 'Tournament'];

export const CRMessageProfilePanel: React.FC<CRMessageProfilePanelProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [runningGoal, setRunningGoal] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [error, setError] = useState('');
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const handleSubmit = () => {
    if (!height || !weight || !selectedLevel || !runningGoal) {
      const errorMsg = 'Please fill all fields';
      setError(errorMsg);
      ToastUtil.error('Error', errorMsg);
      return;
    }

    setError(''); // Clear error if all fields are filled
    onSubmit({
      height,
      weight,
      running_level: selectedLevel,
      running_goal: runningGoal,
    });
    resetForm();
  };

  const resetForm = () => {
    setHeight('');
    setWeight('');
    setSelectedLevel('');
    setRunningGoal('');
    setCharCount(0);
    setError('');
  };

  const handleGoalChange = (text: string) => {
    if (text.length <= 1000) {
      setRunningGoal(text);
      setCharCount(text.length);
    }
  };

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
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Submit Profile Info</Text>
              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={24} color={theme.colors.primaryDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter height in cm"
                keyboardType="numeric"
                value={height}
                onChangeText={setHeight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter weight in kg"
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Running Level</Text>
              <View style={styles.levelContainer}>
                {runningLevels.map(level => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.levelButton,
                      selectedLevel === level && styles.levelButtonSelected,
                    ]}
                    onPress={() => setSelectedLevel(level)}>
                    <Text
                      style={[
                        styles.levelText,
                        selectedLevel === level && styles.levelTextSelected,
                      ]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Running Goal</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Describe your running goals"
                multiline
                numberOfLines={4}
                value={runningGoal}
                onChangeText={handleGoalChange}
              />
              <Text style={styles.charCount}>{charCount}/1000 characters</Text>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Submit Profile</Text>
            </TouchableOpacity>
          </ScrollView>
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
  scrollContainer: {
    paddingBottom: 20,
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
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.primaryDark,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme.colors.primaryDark,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
    marginTop: 4,
  },
  levelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  levelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#F5F5F5',
  },
  levelButtonSelected: {
    backgroundColor: theme.colors.primaryDark,
  },
  levelText: {
    color: theme.colors.primaryDark,
  },
  levelTextSelected: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});
