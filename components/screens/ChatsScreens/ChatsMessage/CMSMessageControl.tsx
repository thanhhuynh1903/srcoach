import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {theme} from '../../../contants/theme';

interface CMSMessageControlProps {
  messageText: string;
  setMessageText: (text: string) => void;
  handleSendMessage: () => void;
}

export const CMSMessageControl = ({
  messageText,
  setMessageText,
  handleSendMessage,
}: CMSMessageControlProps) => {
  return (
    <View style={styles.inputContainer}>
      <TouchableOpacity style={styles.actionButton}>
        <Icon name="add" size={24} color="#000" />
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        value={messageText}
        onChangeText={setMessageText}
        placeholder="Type a message..."
        placeholderTextColor="#999"
        onSubmitEditing={handleSendMessage}
        multiline
      />
      <TouchableOpacity
        style={styles.sendButton}
        onPress={handleSendMessage}
        disabled={!messageText.trim()}>
        <Icon name="send" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  actionButton: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: theme.colors.primaryDark,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 1,
  },
});