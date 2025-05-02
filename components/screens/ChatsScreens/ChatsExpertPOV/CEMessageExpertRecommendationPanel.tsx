import React, { useState } from 'react';
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

interface CEMessageExpertRecommendationPanelProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (recommendation: string) => void;
  disabled?: boolean;
}

export const CEMessageExpertRecommendationPanel: React.FC<CEMessageExpertRecommendationPanelProps> = ({
  visible,
  onClose,
  onSubmit,
  disabled = false,
}) => {
  const [recommendation, setRecommendation] = useState('');
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
    if (!recommendation.trim()) {
      const errorMsg = 'Please enter your recommendation';
      setError(errorMsg);
      ToastUtil.error('Error', errorMsg);
      return;
    }

    setError('');
    onSubmit(recommendation);
    resetForm();
  };

  const resetForm = () => {
    setRecommendation('');
    setCharCount(0);
    setError('');
  };

  const handleRecommendationChange = (text: string) => {
    if (text.length <= 2000) {
      setRecommendation(text);
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
              <Text style={styles.panelTitle}>Expert Recommendation</Text>
              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={24} color={theme.colors.primaryDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Your Recommendation</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Enter your expert recommendation..."
                multiline
                numberOfLines={8}
                value={recommendation}
                onChangeText={handleRecommendationChange}
                editable={!disabled}
              />
              <Text style={styles.charCount}>{charCount}/2000 characters</Text>
            </View>

            <Text style={styles.warningText}>
              By submitting this recommendation, you acknowledge that you are
              taking responsibility for any actions the user may take based on
              your advice regarding their running or fitness activities.
            </Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[
                styles.submitButton,
                disabled && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={disabled}>
              <Text style={styles.submitButtonText}>Submit Recommendation</Text>
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
    minHeight: 200,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
    marginTop: 4,
  },
  warningText: {
    fontSize: 12,
    color: theme.colors.danger,
    marginVertical: 12,
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: theme.colors.primaryDark,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: theme.colors.gray,
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