import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import CommonDialog from '../../../../commons/CommonDialog';
import { theme } from '../../../../contants/theme';

interface ChatsPanelProfileConfirmProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ChatsPanelProfileConfirm: React.FC<ChatsPanelProfileConfirmProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  return (
    <CommonDialog
      visible={visible}
      onClose={onClose}
      title="Request Profile Submission"
      content={
        <View style={styles.content}>
          <Ionicons 
            name="person-circle-outline" 
            size={40} 
            color={theme.colors.primaryDark} 
            style={styles.icon}
          />
          <Text style={styles.text}>
            Are you sure you want to request this user to submit their updated profile information?
          </Text>
          <Text style={styles.note}>
            This will send a notification to the user prompting them to update their profile details.
          </Text>
        </View>
      }
      actionButtons={[
        {
          label: 'Cancel',
          variant: 'outlined',
          handler: onClose,
        },
        {
          label: 'Confirm',
          variant: 'contained',
          color: theme.colors.primaryDark,
          handler: onConfirm,
          iconName: 'send',
        },
      ]}
      width="85%"
    />
  );
};

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  icon: {
    marginBottom: 16,
  },
  text: {
    textAlign: 'center',
    fontSize: 15,
    color: '#0d0d0d',
    marginBottom: 8,
    lineHeight: 22,
  },
  note: {
    textAlign: 'center',
    fontSize: 13,
    color: '#636363',
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 18,
  },
});

export default ChatsPanelProfileConfirm;