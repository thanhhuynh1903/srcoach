import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import CommonPanel from '../../../../commons/CommonPanel';
import {theme} from '../../../../contants/theme';
import {sendExpertRecommendation} from '../../../../utils/useChatsAPI';
import Icon from '@react-native-vector-icons/ionicons';

interface ChatsPanelExpertRecommendationProps {
  visible: boolean;
  onClose: () => void;
  sessionId: string;
  onSendSuccess: () => void;
}

const ChatsPanelExpertRecommendation: React.FC<
  ChatsPanelExpertRecommendationProps
> = ({visible, onClose, sessionId, onSendSuccess = () => {}}) => {
  const [content, setContent] = useState<string>('');
  const [affectsTraining, setAffectsTraining] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting || !affectsTraining || !content.trim()) return;

    Keyboard.dismiss();
    setIsSubmitting(true);

    try {
      await sendExpertRecommendation(sessionId, content);
      onSendSuccess();
      resetAndClose();
    } catch (error) {
      console.error('Error sending recommendation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setContent('');
    setAffectsTraining(false);
    onClose();
  };

  const toggleCheckbox = () => {
    setAffectsTraining(!affectsTraining);
  };

  return (
    <CommonPanel
      visible={visible}
      onClose={resetAndClose}
      title="Expert Recommendation"
      content={
        <View style={styles.content}>
          <Text style={styles.label}>
            Your professional recommendation (max 2000 characters)
          </Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={content}
            onChangeText={setContent}
            placeholder="Write your detailed recommendation..."
            multiline
            maxLength={2000}
            numberOfLines={8}
          />
          <Text style={styles.charCount}>{content.length}/2000</Text>

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={toggleCheckbox}
            activeOpacity={0.7}>
            <View
              style={[
                styles.checkbox,
                affectsTraining && styles.checkboxChecked,
              ]}>
              {affectsTraining && (
                <Icon name="checkmark" size={16} color="white" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>
              I agree this recommendation will impact the user's running style
              and training schedule, and that the user will be able to save this
              note for later use.
            </Text>
          </TouchableOpacity>
        </View>
      }
      actionButtons={[
        {
          label: isSubmitting ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            'Send Recommendation'
          ),
          variant: 'contained',
          handler: handleSubmit,
          color:
            !affectsTraining || !content.trim()
              ? '#c9c9c9'
              : theme.colors.primaryDark,
          disabled: !affectsTraining || !content.trim() || isSubmitting,
        },
      ]}
      direction="bottom"
      height="50%"
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
    minHeight: 150,
    textAlignVertical: 'top',
    marginBottom: 4,
  },
  charCount: {
    fontSize: 12,
    color: theme.colors.gray,
    textAlign: 'right',
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: theme.colors.primaryDark,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primaryDark,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.primaryDark,
  },
  disabledButton: {
    backgroundColor: theme.colors.gray,
  },
});

export default ChatsPanelExpertRecommendation;
