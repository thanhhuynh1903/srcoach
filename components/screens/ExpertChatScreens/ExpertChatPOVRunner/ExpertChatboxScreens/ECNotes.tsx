import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';

interface ECNotesProps {
  showNotesModal: boolean;
  toggleNotesModal: () => void;
  toggleProfileModal: () => void;
  notesSlideAnim: Animated.Value;
}

const ECNotes: React.FC<ECNotesProps> = ({
  showNotesModal,
  toggleNotesModal,
  toggleProfileModal,
  notesSlideAnim,
}) => {
  const notesModalTranslateY = notesSlideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [500, 0],
  });

  const handleProfilePress = () => {
    toggleNotesModal();
    toggleProfileModal();
  };

  return (
    <Modal
      visible={showNotesModal}
      transparent
      animationType="none"
      onRequestClose={toggleNotesModal}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={toggleNotesModal}>
        <Animated.View
          style={[
            styles.notesModal,
            {transform: [{translateY: notesModalTranslateY}]},
          ]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notes & Actions</Text>
            <TouchableOpacity onPress={toggleNotesModal}>
              <Icon name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.notesModalContent}>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <TouchableOpacity style={styles.noteActionButton}>
                <Icon name="document-attach" size={24} color="#2563EB" />
                <Text style={styles.noteActionText}>Submit Training Records</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.noteActionButton}
                onPress={handleProfilePress}>
                <Icon name="person-circle" size={24} color="#2563EB" />
                <Text style={styles.noteActionText}>Update My Profile</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Quick Templates</Text>
              <TouchableOpacity style={styles.templateButton}>
                <Text style={styles.templateText}>Request training plan</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.templateButton}>
                <Text style={styles.templateText}>Ask about injury</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.templateButton}>
                <Text style={styles.templateText}>Discuss nutrition</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  notesModal: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: 32,
    maxHeight: '80%',
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
  notesModalContent: {
    paddingBottom: 20,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  noteActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    marginBottom: 8,
  },
  noteActionText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '500',
  },
  noteItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 4,
  },
  noteDate: {
    fontSize: 12,
    color: '#64748B',
  },
  templateButton: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  templateText: {
    fontSize: 14,
    color: '#2563EB',
  },
});

export default ECNotes;