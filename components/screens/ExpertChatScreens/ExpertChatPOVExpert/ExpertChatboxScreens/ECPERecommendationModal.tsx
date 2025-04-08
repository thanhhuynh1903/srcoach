// RecommendationModal.tsx
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';

interface RecommendationModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (message: string) => void;
  isLoading?: boolean;
}

const ECPERecommendationModal: React.FC<RecommendationModalProps> = ({
  visible,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [message, setMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = () => {
    if (message.trim().length === 0) return;
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    onSubmit(message);
    setShowConfirm(false);
    setMessage('');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {showConfirm ? 'Confirm Recommendation' : 'Create Recommendation'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
          
          {showConfirm ? (
            <View style={styles.confirmContent}>
              <Text style={styles.confirmText}>
                Are you sure you want to send this recommendation?
              </Text>
              <View style={styles.messagePreview}>
                <Text style={styles.messageText}>{message}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                Write your expert recommendation for the athlete (max 2000 characters):
              </Text>
              <TextInput
                style={styles.textInput}
                multiline
                numberOfLines={8}
                maxLength={2000}
                placeholder="Enter your recommendation..."
                placeholderTextColor="#94A3B8"
                value={message}
                onChangeText={setMessage}
              />
              <Text style={styles.charCount}>
                {message.length}/2000 characters
              </Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            {showConfirm ? (
              <>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setShowConfirm(false)}>
                  <Text style={styles.cancelButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={handleConfirm}
                  disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>Confirm</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={handleSubmit}
                  disabled={message.trim().length === 0 || isLoading}>
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>Submit</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  modalContent: {
    marginBottom: 24,
  },
  confirmContent: {
    marginBottom: 24,
  },
  modalText: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
    marginBottom: 12,
  },
  confirmText: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 200,
    marginBottom: 8,
  },
  messagePreview: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
  },
  messageText: {
    fontSize: 16,
    color: '#334155',
  },
  charCount: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'right',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
  },
  submitButton: {
    backgroundColor: '#2563EB',
  },
  cancelButtonText: {
    color: '#64748B',
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default ECPERecommendationModal;