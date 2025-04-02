import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';

const ModalPoppup = ({ visible, onClose, deleteComment, commentId }) => {
    const handleDelete = () => {
        if (commentId) {
          deleteComment(commentId);
        }
        onClose();
      };
  console.log('commentId', commentId);
  
  return (
    <Modal visible={visible} transparent={true} onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalOption}>
            <Icon name="create-outline" size={24} color="#333" />
            <Text style={styles.modalOptionText}>Update</Text>
          </TouchableOpacity>
          <View style={styles.modalDivider} />
          <TouchableOpacity style={styles.modalOption} onPress={handleDelete}>
            <Icon name="trash-outline" size={24} color="red" />
            <Text style={[styles.modalOptionText, { color: 'red' }]}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalCancelButton} onPress={onClose}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  modalOptionText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  modalCancelButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
    backgroundColor: '#333',
    borderRadius: 10,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default ModalPoppup;