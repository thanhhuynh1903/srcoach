import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, TextInput, Keyboard} from 'react-native';
import CommonPanel from '../../../../commons/CommonPanel';
import {theme} from '../../../../contants/theme';
import { sendProfileMessage } from '../../../../utils/useChatsAPI';

interface ChatsPanelRunnerProfileProps {
  visible: boolean;
  onClose: () => void;
  sessionId: string;
  onSendSuccess: () => void;
}

const ChatsPanelRunnerProfile: React.FC<ChatsPanelRunnerProfileProps> = ({
  visible,
  onClose,
  sessionId,
  onSendSuccess,
}) => {
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [issues, setIssues] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    Keyboard.dismiss();
    setIsSubmitting(true);

    try {
      const profileData = {
        height: height ? parseInt(height) : undefined,
        weight: weight ? parseInt(weight) : undefined,
        issues: issues || undefined
      };

      await sendProfileMessage(sessionId, profileData);
      onSendSuccess();
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setHeight('');
    setWeight('');
    setIssues('');
    onClose();
  };

  const isFormValid = height || weight || issues;

  return (
    <CommonPanel
      visible={visible}
      onClose={handleClose}
      title="Health Profile"
      content={
        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              placeholder="Enter height"
              keyboardType="numeric"
              maxLength={3}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              placeholder="Enter weight"
              keyboardType="numeric"
              maxLength={3}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Health Issues</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={issues}
              onChangeText={setIssues}
              placeholder="Describe any health issues"
              multiline
              maxLength={1000}
              numberOfLines={4}
            />
            <Text style={styles.charCount}>{issues.length}/1000</Text>
          </View>
        </View>
      }
      actionButtons={[
        {
          label: 'Submit',
          variant: 'contained',
          handler: handleSubmit,
          disabled: !isFormValid || isSubmitting,
        },
      ]}
      direction="bottom"
      height="auto"
      borderRadius={16}
      backdropOpacity={0.5}
      contentStyle={{padding: 16}}
    />
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  paddingBottom: 16,
  minHeight: 50,
  width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: theme.colors.primaryDark,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: theme.colors.white,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: theme.colors.gray,
    textAlign: 'right',
    marginTop: 4,
  },
});

export default ChatsPanelRunnerProfile;