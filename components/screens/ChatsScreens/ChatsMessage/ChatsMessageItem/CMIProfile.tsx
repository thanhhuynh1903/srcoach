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
  const [errors, setErrors] = useState({
    height: '',
    weight: '',
    type: '',
  });

  useEffect(() => {
    // Initialize with message data if available
    if (message.content?.height) setHeight(message.content.height.toString());
    if (message.content?.weight) setWeight(message.content.weight.toString());
    if (message.content?.issues) setIssues(message.content.issues);
    if (message.content?.type) setType(message.content.type);
  }, [message]);

  const validateField = (field: string, value: string) => {
    if (field === 'height' || field === 'weight') {
      if (!value) {
        return 'This field is required';
      }
      if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
        return 'Please enter a valid number';
      }
      return '';
    }
    if (field === 'type') {
      return value ? '' : 'Please select a running type';
    }
    return '';
  };

  const validateAllFields = () => {
    const newErrors = {
      height: validateField('height', height),
      weight: validateField('weight', weight),
      type: validateField('type', type),
    };
    setErrors(newErrors);
    return !newErrors.height && !newErrors.weight && !newErrors.type;
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'height') setHeight(value);
    if (field === 'weight') setWeight(value);
    if (field === 'issues') setIssues(value);
    if (field === 'type') setType(value);

    setErrors((prev) => ({
      ...prev,
      [field]: validateField(field, value),
    }));
  };

  const handleSubmit = () => {
    if (validateAllFields()) {
      onProfileSubmit?.(message.id, {
        height: parseFloat(height),
        weight: parseFloat(weight),
        issues: issues || undefined,
        type,
      });
    }
  };

  const renderRequiredIndicator = () => (
    <Text style={styles.requiredIndicator}> *</Text>
  );

  const renderFormField = (
    label: string,
    value: string,
    isRequired: boolean,
    isEditable: boolean,
    error: string,
    renderInput: () => React.ReactNode,
  ) => {
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          {label}
          {isRequired && renderRequiredIndicator()}
        </Text>
        {isEditable ? (
          <>
            {renderInput()}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </>
        ) : (
          <View style={styles.filledInput}>
            <Text style={styles.filledInputText}>{value}</Text>
          </View>
        )}
      </View>
    );
  };

  const isSubmitDisabled = !!errors.height || !!errors.weight || !!errors.type || !height || !weight || !type;

  return (
    <View style={styles.centeredContainer}>
      <View
        style={[
          styles.formContainer,
          message.content.is_filled && styles.filledFormContainer,
        ]}>
        <Text style={styles.formTitle}>
          {isMe
            ? message.content.is_filled
              ? "Runner's Profile"
              : 'Waiting for runner to fill profile'
            : message.content.is_filled
              ? 'Your Profile'
              : 'Please fill your profile information'}
        </Text>

        {renderFormField(
          'Height (cm)',
          message.content.height ? `${message.content.height} cm` : '',
          !message.content.is_filled && !isMe,
          !message.content.is_filled && !isMe,
          errors.height,
          () => (
            <TextInput
              style={[styles.input, errors.height && styles.inputError]}
              keyboardType="numeric"
              placeholder="Enter height in cm"
              value={height}
              onChangeText={(text) => handleInputChange('height', text)}
            />
          ),
        )}

        {renderFormField(
          'Weight (kg)',
          message.content.weight ? `${message.content.weight} kg` : '',
          !message.content.is_filled && !isMe,
          !message.content.is_filled && !isMe,
          errors.weight,
          () => (
            <TextInput
              style={[styles.input, errors.weight && styles.inputError]}
              keyboardType="numeric"
              placeholder="Enter weight in kg"
              value={weight}
              onChangeText={(text) => handleInputChange('weight', text)}
            />
          ),
        )}

        {renderFormField(
          'Running Type',
          message.content.type ? message.content.type.replace(/_/g, ' ') : '',
          !message.content.is_filled && !isMe,
          !message.content.is_filled && !isMe,
          errors.type,
          () => (
            <TouchableOpacity
              style={[styles.typePickerTrigger, errors.type && styles.inputError]}
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
          ),
        )}

        {renderFormField(
          'Health Issues (optional)',
          message.content.issues || 'None',
          false,
          !message.content.is_filled && !isMe,
          '',
          () => (
            <TextInput
              style={[styles.input, styles.multilineInput]}
              multiline
              placeholder="Any health concerns?"
              value={issues}
              onChangeText={(text) => handleInputChange('issues', text)}
            />
          ),
        )}

        {!message.content.is_filled && !isMe && (
          <TouchableOpacity
            style={[styles.submitButton, isSubmitDisabled && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitDisabled}>
            <Text style={styles.submitButtonText}>Submit Profile</Text>
          </TouchableOpacity>
        )}

        {message.content.is_filled && (
          <View style={styles.footer}>
            <Text style={styles.timeText}>
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
        )}
      </View>

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
              onValueChange={(itemValue) => {
                handleInputChange('type', itemValue);
                // setShowTypePicker(false); // Optional: Close picker on selection
              }}
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
};

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  formContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filledFormContainer: {
    padding: 12,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primaryDark,
    marginBottom: 12,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  inputError: {
    borderColor: 'red',
  },
  filledInput: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  filledInputText: {
    fontSize: 14,
    color: '#333',
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  typePickerTrigger: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typePickerText: {
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: theme.colors.primaryDark,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  requiredIndicator: {
    color: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
  },
  timeText: {
    fontSize: 11,
    color: '#999',
  },
  icon: {
    marginLeft: 4,
  },
});