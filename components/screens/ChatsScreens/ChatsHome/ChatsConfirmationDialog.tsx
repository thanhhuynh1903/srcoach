import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import CommonDialog from '../../../commons/CommonDialog';

interface ChatsConfirmationDialogProps {
  visible: boolean;
  onClose: () => void;
  selectedAction: any; // Replace with your type
  selectedItem: any; // Replace with your type
  getOtherUser: (item: any) => any; // Replace with your type
}

export const ChatsConfirmationDialog = ({
  visible,
  onClose,
  selectedAction,
  selectedItem,
  getOtherUser,
}: ChatsConfirmationDialogProps) => {
  if (!selectedAction || !selectedItem) return null;
  const otherUser = getOtherUser(selectedItem);

  return (
    <CommonDialog
      visible={visible}
      onClose={onClose}
      title="Confirm Action"
      content={
        <View style={styles.confirmationContent}>
          <Text style={styles.confirmationText}>
            Are you sure you want to {selectedAction.title.toLowerCase()} {otherUser.name}?
          </Text>
          <View style={styles.confirmationButtons}>
            <TouchableOpacity
              style={[styles.confirmationButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmationButton, {backgroundColor: selectedAction.color}]}
              onPress={() => {
                selectedAction.handler();
                onClose();
              }}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      }
      width="80%"
      height="auto"
    />
  );
};

const styles = StyleSheet.create({
  confirmationContent: {
    width: '100%',
  },
  confirmationText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 20,
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  confirmationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginLeft: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  cancelButtonText: {
    color: '#64748B',
    fontWeight: '500',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});