// ECPENotes.tsx
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
  notesSlideAnim: Animated.Value;
  onTemplateSelect: (template: string) => void;
  onGenerateSchedule: () => void;
  onGenerateRecommendation: () => void;
}

const ECPENotes: React.FC<ECNotesProps> = ({
  showNotesModal,
  toggleNotesModal,
  notesSlideAnim,
  onTemplateSelect,
  onGenerateSchedule,
  onGenerateRecommendation,
}) => {
  const notesModalTranslateY = notesSlideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [500, 0],
  });

  const runningAdviceTemplates = [
    { id: '1', title: 'Injury prevention tips' },
    { id: '2', title: 'Marathon training advice' },
    { id: '3', title: 'Speed workout suggestions' },
    { id: '4', title: 'Recovery techniques' },
    { id: '5', title: 'Nutrition for runners' },
  ];

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
            <Text style={styles.modalTitle}>Expert Actions</Text>
            <TouchableOpacity onPress={toggleNotesModal}>
              <Icon name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.notesModalContent}>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Expert Tools</Text>
              <TouchableOpacity 
                style={styles.noteActionButton}
                onPress={onGenerateSchedule}>
                <Icon name="calendar" size={24} color="#2563EB" />
                <Text style={styles.noteActionText}>Generate Schedule Calendar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.noteActionButton}
                onPress={onGenerateRecommendation}>
                <Icon name="analytics" size={24} color="#2563EB" />
                <Text style={styles.noteActionText}>Generate Expert Recommendations</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Running Advice Templates</Text>
              {runningAdviceTemplates.map((template) => (
                <TouchableOpacity 
                  key={template.id}
                  style={styles.templateButton}
                  onPress={() => onTemplateSelect(template.title)}>
                  <Text style={styles.templateText}>{template.title}</Text>
                </TouchableOpacity>
              ))}
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

export default ECPENotes;