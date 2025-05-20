import {StyleSheet, TextInput, View, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import {theme} from './contants/theme';
import {hp} from './helpers/common';
import Icon from '@react-native-vector-icons/ionicons';
import {Text} from 'react-native';

interface InputProps {
  containerStyle?: any;
  inputRef?: React.Ref<TextInput>;
  placeholder?: string;
  onChangeText?: (text: string) => void;
  value?: string;
  keyboardType?: 'default' | 'email' | 'numeric' | 'phone-pad' | 'password';
  secureTextEntry?: boolean;
  errorMsg?: string;
  maxLength?: number;
  showIcon?: boolean;
  validated?: boolean | null;
}

const Input = (props: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const getIconName = () => {
    switch (props.keyboardType) {
      case 'email':
        return 'mail-outline';
      case 'numeric':
        return 'calculator-outline';
      case 'phone-pad':
        return 'call-outline';
      case 'password':
        return 'lock-closed-outline';
      default:
        return 'text-outline';
    }
  };

  const shouldShowPasswordToggle = props.keyboardType === 'password';
  const showIcon = props.showIcon !== false;
  const isEmailField = props.keyboardType === 'email';
  const hasError = !!props.errorMsg;

  return (
    <View style={props.containerStyle}>
      <View
        style={[
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
          secureTextEntry={
            shouldShowPasswordToggle ? !showPassword : props.secureTextEntry
          }
          keyboardType={
            props.keyboardType === 'password'
              ? 'default'
              : props.keyboardType || 'default'
          }
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChangeText={text => handleEmailChange(text)}
          value={props.value}
          {...props}
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
      {hasError && <Text style={styles.errorText}>{props.errorMsg}</Text>}
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
    borderWidth: 1,
    paddingHorizontal: 16,
    overflow: 'hidden',
    borderRadius: 8,
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
    fontSize: hp(1.6),
    marginTop: 4,
    marginLeft: 4,
  },
});
