import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import Icon from '@react-native-vector-icons/ionicons';
import {CommonAvatar} from '../../../../commons/CommonAvatar';
import {theme} from '../../../../contants/theme';
import {formatTimestampAgo} from '../../../../utils/utils_format';

interface CMIProfileProps {
  message: any;
  isMe: boolean;
  onProfileSubmit?: (
    message_id: any,
    data: {
      height: number;
      weight: number;
      issues?: string;
      type: string;
    },
  ) => void;
}

export const CMIProfile = ({
  message,
  isMe,
  onProfileSubmit,
}: CMIProfileProps) => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [issues, setIssues] = useState('');
  const [type, setType] = useState('WALKING');
  const [showTypePicker, setShowTypePicker] = useState(false);

  useEffect(() => {
    // Initialize with message data if available
    if (message.content?.height) setHeight(message.content.height.toString());
    if (message.content?.weight) setWeight(message.content.weight.toString());
    if (message.content?.issues) setIssues(message.content.issues);
    if (message.content?.type) setType(message.content.type);
  }, [message]);

  const handleSubmit = () => {
    if (!height || !weight || !type) return;

    onProfileSubmit?.(message.id, {
      height: parseFloat(height),
      weight: parseFloat(weight),
      issues: issues || undefined,
      type,
    });
  };

  const renderRequiredIndicator = () => (
    <Text style={styles.requiredIndicator}> *</Text>
  );

  if (message.content.is_filled === false) {
    return (
      <View style={styles.centeredContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>
            {isMe
              ? 'Waiting for runner to fill profile'
              : 'Please fill your profile information'}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Height (cm)
              {!isMe && renderRequiredIndicator()}
            </Text>
            {isMe ? (
              <View style={styles.loadingInput}>
                <ActivityIndicator
                  size="small"
                  color={theme.colors.primaryDark}
                />
              </View>
            ) : (
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Enter height in cm"
                value={height}
                onChangeText={setHeight}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Weight (kg)
              {!isMe && renderRequiredIndicator()}
            </Text>
            {isMe ? (
              <View style={styles.loadingInput}>
                <ActivityIndicator
                  size="small"
                  color={theme.colors.primaryDark}
                />
              </View>
            ) : (
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Enter weight in kg"
                value={weight}
                onChangeText={setWeight}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Running Type
              {!isMe && renderRequiredIndicator()}
            </Text>
            {isMe ? (
              <View style={styles.loadingInput}>
                <ActivityIndicator
                  size="small"
                  color={theme.colors.primaryDark}
                />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.typePickerTrigger}
                onPress={() => setShowTypePicker(true)}>
                <Text style={styles.typePickerText}>
                  {type.replace(/_/g, ' ')}
                </Text>
                <Icon
                  name="chevron-down"
                  size={16}
                  color={theme.colors.primaryDark}
                />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Health Issues (optional)</Text>
            {isMe ? (
              <View style={styles.loadingInput}>
                <ActivityIndicator
                  size="small"
                  color={theme.colors.primaryDark}
                />
              </View>
            ) : (
              <TextInput
                style={[styles.input, styles.multilineInput]}
                multiline
                placeholder="Any health concerns?"
                value={issues}
                onChangeText={setIssues}
              />
            )}
          </View>

          {!isMe && (
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={!height || !weight || !type}>
              <Text style={styles.submitButtonText}>Submit Profile</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Type Picker Modal */}
        <Modal
          visible={showTypePicker}
          transparent={true}
          animationType="slide">
          <View style={styles.pickerModalContainer}>
            <View style={styles.pickerModal}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={() => setShowTypePicker(false)}>
                  <Icon
                    name="close"
                    size={24}
                    color={theme.colors.primaryDark}
                  />
                </TouchableOpacity>
                <Text style={styles.pickerTitle}>Select Running Type</Text>
                <TouchableOpacity onPress={() => setShowTypePicker(false)}>
                  <Text style={styles.pickerDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
              <Picker
                selectedValue={type}
                onValueChange={itemValue => setType(itemValue)}
                style={styles.picker}>
                <Picker.Item label="Walking" value="WALKING" />
                <Picker.Item label="Light Run" value="LIGHT_RUN" />
                <Picker.Item label="Jogging" value="JOGGING" />
                <Picker.Item label="Running" value="RUNNING" />
                <Picker.Item
                  label="Interval Training"
                  value="INTERVAL_TRAINING"
                />
                <Picker.Item label="Trail Running" value="TRAIL_RUNNING" />
                <Picker.Item label="Long Distance" value="LONG_DISTANCE" />
                <Picker.Item label="Half Marathon" value="HALF_MARATHON" />
                <Picker.Item label="Marathon" value="MARATHON" />
                <Picker.Item label="Others" value="OTHERS" />
              </Picker>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // Filled profile case
  return (
    <View style={styles.filledContainer}>
      <View
        style={[
          styles.filledBubble,
          isMe ? styles.myFilledBubble : styles.otherFilledBubble,
        ]}>
        <View style={styles.filledHeader}>
          <Icon
            name="person"
            size={20}
            color={isMe ? '#fff' : theme.colors.primaryDark}
          />
          <Text style={[styles.filledTitle, isMe && styles.myText]}>
            {!isMe
              ? 'You have filled your profile'
              : `${message.sender.name} has filled their profile`}
          </Text>
        </View>
        <View style={styles.details}>
          {message.content.height && (
            <Text style={[styles.text, isMe && styles.myText]}>
              Height: {message.content.height} cm
            </Text>
          )}
          {message.content.weight && (
            <Text style={[styles.text, isMe && styles.myText]}>
              Weight: {message.content.weight} kg
            </Text>
          )}
          {message.content.type && (
            <Text style={[styles.text, isMe && styles.myText]}>
              Running Type: {message.content.type.replace(/_/g, ' ')}
            </Text>
          )}
          {message.content.issues && (
            <Text style={[styles.text, isMe && styles.myText]}>
              Health Issues: {message.content.issues}
            </Text>
          )}
        </View>
        <View style={styles.footer}>
          <Text style={isMe ? styles.myTime : styles.otherTime}>
            {formatTimestampAgo(message.created_at)}
          </Text>
          {isMe && (
            <Icon
              name={message.read_at ? 'checkmark-done' : 'checkmark'}
              size={14}
              color={
                message.read_at
                  ? theme.colors.primaryDark
                  : 'rgba(255,255,255,0.5)'
              }
              style={styles.icon}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  myContainer: {
    justifyContent: 'flex-end',
  },
  otherContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    marginRight: 8,
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: theme.colors.primaryDark,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#e5e5ea',
    borderBottomLeftRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  details: {
    marginLeft: 28,
  },
  text: {
    fontSize: 14,
    color: '#000',
    marginBottom: 4,
  },
  myText: {
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  myTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  otherTime: {
    fontSize: 12,
    color: '#666',
  },
  icon: {
    marginLeft: 4,
  },
  requiredIndicator: {
    color: 'red',
  },
  loadingInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
  },

  // Form styles
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  formContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.primaryDark,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  typePickerTrigger: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typePickerText: {
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: theme.colors.primaryDark,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Picker Modal styles
  pickerModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pickerModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primaryDark,
  },
  pickerDoneText: {
    color: theme.colors.primaryDark,
    fontSize: 16,
    fontWeight: '600',
  },
  picker: {
    marginTop: 10,
  },
  filledContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  filledBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  myFilledBubble: {
    backgroundColor: theme.colors.primaryDark,
    borderBottomRightRadius: 4,
  },
  otherFilledBubble: {
    backgroundColor: '#e5e5ea',
    borderBottomLeftRadius: 4,
  },
  filledHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filledTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});
