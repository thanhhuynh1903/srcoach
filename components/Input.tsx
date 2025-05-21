import {StyleSheet, TextInput, View, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import {theme} from './contants/theme';
import {hp} from './helpers/common';
import Icon from '@react-native-vector-icons/ionicons';
import {Text} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

interface InputProps {
  containerStyle?: any;
  inputRef?: React.Ref<TextInput>;
  placeholder?: string;
  onChangeText?: (text: string) => void;
  value?: string;
  keyboardType?: 'default' | 'email' | 'numeric' | 'phone-pad' | 'password' | 'picker' | 'date';
  secureTextEntry?: boolean;
  errorMsg?: string;
  maxLength?: number;
  showIcon?: boolean;
  validated?: boolean | null;
  icon?: string;
  pickerItems?: {label: string; value: string}[];
  onDateConfirm?: (date: Date) => void;
}

const Input = (props: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const getIconName = () => {
    if (props.icon) return props.icon;
    switch (props.keyboardType) {
      case 'email': return 'mail-outline';
      case 'numeric': return 'calculator-outline';
      case 'phone-pad': return 'call-outline';
      case 'password': return 'lock-closed-outline';
      case 'picker': return 'chevron-down-outline';
      case 'date': return 'calendar-outline';
      default: return 'text-outline';
    }
  };

  const handleDateConfirm = (date: Date) => {
    setDatePickerVisibility(false);
    props.onDateConfirm?.(date);
  };

  const shouldShowPasswordToggle = props.keyboardType === 'password';
  const showIcon = props.showIcon !== false;
  const isEmailField = props.keyboardType === 'email';
  const isPicker = props.keyboardType === 'picker';
  const isDatePicker = props.keyboardType === 'date';
  const hasError = !!props.errorMsg;

  return (
    <View style={props.containerStyle}>
      {isPicker ? (
        <View style={[
          styles.container,
          isFocused && styles.focusedContainer,
          hasError && styles.errorContainer,
        ]}>
          {showIcon && (
            <Icon
              name={getIconName()}
              size={20}
              color={
                hasError
                  ? theme.colors.error
                  : isFocused
                  ? theme.colors.primary
                  : theme.colors.textLight
              }
              style={styles.icon}
            />
          )}
          <Picker
            selectedValue={props.value}
            onValueChange={props.onChangeText}
            style={[styles.picker, {marginRight: -10}]} // Adjusted margin to push arrow to the right
            dropdownIconColor={theme.colors.primary}>
            {props.pickerItems?.map((item, index) => (
              <Picker.Item key={index} label={item.label} value={item.value} />
            ))}
          </Picker>
        </View>
      ) : isDatePicker ? (
        <TouchableOpacity
          style={[
            styles.container,
            styles.dateContainer, // Added specific style for date picker
            isFocused && styles.focusedContainer,
            hasError && styles.errorContainer,
          ]}
          onPress={() => setDatePickerVisibility(true)}>
          {showIcon && (
            <Icon
              name={getIconName()}
              size={20}
              color={
                hasError
                  ? theme.colors.error
                  : isFocused
                  ? theme.colors.primary
                  : theme.colors.textLight
              }
              style={styles.icon}
            />
          )}
          <Text style={[
            styles.input, 
            styles.dateInput, // Added specific style for date input
            {color: props.value ? theme.colors.text : theme.colors.textLight}
          ]}>
            {props.value || props.placeholder}
          </Text>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleDateConfirm}
            onCancel={() => setDatePickerVisibility(false)}
          />
        </TouchableOpacity>
      ) : (
        <View style={[
          styles.container,
          isFocused && styles.focusedContainer,
          hasError && styles.errorContainer,
        ]}>
          {showIcon && (
            <Icon
              name={getIconName()}
              size={20}
              color={
                hasError
                  ? theme.colors.error
                  : isFocused
                  ? theme.colors.primary
                  : theme.colors.textLight
              }
              style={styles.icon}
            />
          )}
          <TextInput
            style={[styles.input, {color: theme.colors.text}]}
            placeholderTextColor={theme.colors.textLight}
            ref={props.inputRef}
            secureTextEntry={shouldShowPasswordToggle ? !showPassword : props.secureTextEntry}
            keyboardType={props.keyboardType === 'password' ? 'default' : props.keyboardType || 'default'}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChangeText={props.onChangeText}
            value={props.value}
            maxLength={props.maxLength}
            placeholder={props.placeholder}
          />
          {shouldShowPasswordToggle && (
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}>
              <Icon
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={
                  hasError
                    ? theme.colors.error
                    : isFocused
                    ? theme.colors.primary
                    : theme.colors.textLight
                }
              />
            </TouchableOpacity>
          )}
          {isEmailField && props.validated !== null && (
            <View
              style={[
                styles.validationIconContainer,
                props.validated ? styles.validEmail : styles.invalidEmail,
              ]}>
              <Icon
                name={props.validated ? 'checkmark' : 'close'}
                size={14}
                color="white"
              />
            </View>
          )}
        </View>
      )}
      {hasError && (
        <Text style={[styles.errorText, {marginLeft: showIcon ? 28 : 0}]}>
          {props.errorMsg}
        </Text>
      )}
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: hp(7.2),
    alignItems: 'center',
    borderColor: '#c3c3c3',
    borderWidth: 0.5,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f8f8f8'
  },
  dateContainer: {
    alignItems: 'center',
  },
  focusedContainer: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  errorContainer: {
    borderColor: theme.colors.error,
  },
  input: {
    flex: 1,
    paddingRight: 10,
    fontSize: hp(1.9),
    height: '100%',
  },
  dateInput: {
    flex: 1,
    textAlignVertical: 'center',
    paddingRight: 10,
    fontSize: hp(1.9),
    height: '100%',
    includeFontPadding: false,
  },
  picker: {
    flex: 1,
    height: '100%',
  },
  icon: {
    marginRight: 8,
  },
  eyeIcon: {
    padding: 5,
  },
  validationIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  validEmail: {
    backgroundColor: '#4CAF50',
  },
  invalidEmail: {
    backgroundColor: '#F44336',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: 4,
  },
});